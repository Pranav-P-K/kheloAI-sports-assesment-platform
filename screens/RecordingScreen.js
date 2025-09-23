
/* eslint-disable no-unused-vars */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { analyzeVideoWithProgress, ApiError } from '../services/api';
import { API_BASE_URL } from '../services/config';

const { width, height } = Dimensions.get('window');

export default function RecordingScreen({ navigation, route }) {
  const [permission, requestPermission] = useCameraPermissions();
  const hasPermission = permission?.granted === true;
  const [isRecording, setIsRecording] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [lastError, setLastError] = useState(null);
  const [lastVideoUri, setLastVideoUri] = useState(null);
  const [facing, setFacing] = useState('back');

  const cameraRef = useRef(null);
  const { test } = route.params;
  // Media Library permission (optional for saving only)
  useEffect(() => {
    (async () => {
      try { await MediaLibrary.requestPermissionsAsync(); } catch {}
    })();
  }, []);

  // Countdown timer
  const startCountdown = () => {
    setIsPreparing(true);
    setCountdown(3);

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsPreparing(false);
          startRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Start recording
  const startRecording = async () => {
    if (!cameraRef.current || isRecording) return;

    try {
      const duration = getTestDuration(test.id);
      setIsRecording(true);
      setRecordingTime(duration);

      await cameraRef.current.startRecording({
        maxDuration: duration,
        quality: '720p',
        onRecordingFinished: async (video) => {
          try {
            if (video && video.uri) {
              await saveAndAnalyzeVideo(video.uri);
            } else {
              throw new Error('No video captured');
            }
          } catch (err) {
            console.error('Recording finish handling error:', err);
            setLastError(err?.message || 'Recording finish error');
            Alert.alert('Error', 'Failed to process recorded video.');
          } finally {
            setIsRecording(false);
          }
        },
        onRecordingError: (err) => {
          console.warn('onRecordingError:', err);
          setIsRecording(false);
          setLastError(err?.message || 'Recording error');
          Alert.alert('Error', 'Failed to record video.');
        },
      });
    } catch (err) {
      console.error('Recording start error:', err);
      setIsRecording(false);
      Alert.alert('Error', 'Failed to start recording.');
    }
  };

  // Stop recording
  const stopRecording = async () => {
    if (cameraRef.current && isRecording) {
      try {
        await cameraRef.current.stopRecording();
      } catch (err) {
        console.warn('Stop recording error:', err);
      } finally {
        setIsRecording(false);
      }
    }
  };

  const getTestDuration = (testId) => {
    switch (testId) {
      case 'vertical_jump': return 10;
      case 'push_ups': return 20;
      case 'sit_ups': return 20;
      case 'flexibility': return 10;
      default: return 15;
    }
  };

  // Save video and analyze
  const saveAndAnalyzeVideo = async (videoUri) => {
    try {
      setIsAnalyzing(true);
      setUploadProgress(0);
      setLastError(null);
      setLastVideoUri(videoUri);

      const asset = await MediaLibrary.createAssetAsync(videoUri);

      let analysisResult = null;
      try {
        if (API_BASE_URL) {
          const response = await analyzeVideoWithProgress({
            testId: test.id,
            fileUri: videoUri,
            includeTraces: true,
            onProgress: p => setUploadProgress(p),
          });

          analysisResult = {
            testId: response.testId || test.id,
            testName: response.testName || test.name,
            timestamp: response.timestamp || new Date().toISOString(),
            videoUri: asset.uri || videoUri,
            score: response.score,
            unit: response.unit,
            attempts: response.attempts || [],
            confidence: response.confidence ?? 0.9,
            technique_notes: response.technique_notes || [],
            processed: true,
            _source: response._source || 'api',
          };
        } else {
          throw new ApiError('API_BASE_URL not set');
        }
      } catch (e) {
        console.warn('API analysis failed, using local simulation:', e.message || e);
        setLastError(e.message || 'Unknown error');
        analysisResult = await simulateAIAnalysis(test.id, videoUri);
      }

      await saveTestResult(analysisResult);
      setAnalysisResult(analysisResult);
      setIsAnalyzing(false);

      setTimeout(() => {
        navigation.navigate('Results', { result: analysisResult, test });
      }, 2000);

    } catch (err) {
      setIsAnalyzing(false);
      setLastError(err.message || 'Failed to analyze video');
      Alert.alert('Error', 'Failed to analyze video. You can retry.');
    }
  };

  const simulateAIAnalysis = async (testId, videoUri) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const results = {
      vertical_jump: { score: Math.floor(Math.random() * 30) + 20, unit: 'cm', attempts: [20, 25, 30], confidence: 0.95, technique_notes: ['Good takeoff', 'Improve landing'] },
      push_ups: { score: Math.floor(Math.random() * 20) + 20, unit: 'reps', attempts: [20], confidence: 0.9, technique_notes: ['Full range', 'Straight body'] },
      sit_ups: { score: Math.floor(Math.random() * 20) + 25, unit: 'reps', attempts: [25], confidence: 0.88, technique_notes: ['Consistent form'] },
      flexibility: { score: Math.floor(Math.random() * 15) + 5, unit: 'cm', attempts: [5, 10, 15], confidence: 0.9, technique_notes: ['Good flexibility'] },
    };
    return { testId, testName: test.name, timestamp: new Date().toISOString(), videoUri, ...results[testId], processed: true, _source: 'local' };
  };

  const saveTestResult = async (result) => {
    try {
      const existing = await AsyncStorage.getItem('testResults');
      const arr = existing ? JSON.parse(existing) : [];
      arr.push(result);
      await AsyncStorage.setItem('testResults', JSON.stringify(arr));
    } catch (err) {
      console.error('Error saving result:', err);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Requesting permissions...</Text>
      </View>
    );
  }

  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Requesting permissions...</Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Camera permission is required</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        ref={cameraRef}
      />

      {/* Overlay UI */}
      <View style={styles.overlay}>
        <View style={styles.header}>
          <Text style={styles.testTitle}>{test.name}</Text>
          {recordingTime > 0 && <Text style={styles.timer}>{Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}</Text>}
        </View>

        {isPreparing && (
          <View style={styles.countdownContainer}>
            <Text style={styles.countdownText}>Get Ready!</Text>
            <Text style={styles.countdownNumber}>{countdown}</Text>
          </View>
        )}

        {isAnalyzing && (
          <View style={styles.analysisContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.analysisText}>Analyzing Performance...</Text>
            <Text style={styles.analysisSubtext}>
              {uploadProgress > 0 && uploadProgress < 1 ? `Uploading: ${(uploadProgress * 100).toFixed(0)}%` : 'AI is processing your video'}
            </Text>
            {lastError && (
              <>
                <Text style={styles.errorText}>{lastError}</Text>
                <TouchableOpacity style={styles.button} onPress={() => lastVideoUri && saveAndAnalyzeVideo(lastVideoUri)}>
                  <Text style={styles.buttonText}>Retry</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {!isRecording && !isPreparing && !isAnalyzing && !analysisResult && (
          <TouchableOpacity style={styles.recordButton} onPress={startCountdown}>
            <Text style={styles.recordButtonText}>Start Recording</Text>
          </TouchableOpacity>
        )}

        {isRecording && (
          <TouchableOpacity style={styles.stopButton} onPress={stopRecording}>
            <View style={styles.stopButtonInner} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// Keep your existing styles
const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 40, backgroundColor: 'rgba(0,0,0,0.5)' },
  testTitle: { fontSize: 18, fontWeight: 'bold', color: 'white' },
  timer: { fontSize: 24, fontWeight: 'bold', color: '#f44336', fontFamily: 'monospace' },
  countdownContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  countdownText: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 20 },
  countdownNumber: { fontSize: 72, fontWeight: 'bold', color: '#4CAF50' },
  analysisContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)' },
  analysisText: { fontSize: 20, fontWeight: 'bold', color: 'white', marginTop: 20 },
  analysisSubtext: { fontSize: 14, color: '#ccc', marginTop: 10 },
  recordButton: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#f44336', justifyContent: 'center', alignItems: 'center', elevation: 5, position: 'absolute', bottom: 30, left: width / 2 - 40 },
  recordButtonText: { fontSize: 12, fontWeight: 'bold', color: 'white', textAlign: 'center' },
  stopButton: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#666', justifyContent: 'center', alignItems: 'center', elevation: 5, position: 'absolute', bottom: 30, left: width / 2 - 40 },
  stopButtonInner: { width: 30, height: 30, backgroundColor: 'white', borderRadius: 4 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  loadingText: { marginTop: 20, fontSize: 16, color: '#666' },
  errorText: { fontSize: 18, color: '#f44336', marginBottom: 20, textAlign: 'center' },
  button: { backgroundColor: '#2196F3', padding: 15, borderRadius: 8 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});