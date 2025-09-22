/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Camera, CameraView } from 'expo-camera';
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

const { width, height } = Dimensions.get('window');

export default function RecordingScreen({ navigation, route }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const cameraRef = useRef(null);
  const { test } = route.params;

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
        const { status: microphoneStatus } = await Camera.requestMicrophonePermissionsAsync();
        // const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();

        // if (cameraStatus !== 'granted') {
        //   Alert.alert(
        //     'Camera Permission',
        //     'Camera access is required for this app.',
        //     [
        //       { text: 'Cancel', style: 'cancel' },
        //       { text: 'Open Settings', onPress: () => Linking.openSettings() },
        //     ]
        //   );
        // }

        setHasPermission(cameraStatus === 'granted' && microphoneStatus === 'granted');
      } catch (err) {
        console.error('Permission error:', err);
        setHasPermission(false);
      }
    };

    requestPermissions();
  }, []);

  useEffect(() => {
    let interval = null;
    if (isRecording && recordingTime > 0) {
      interval = setInterval(() => {
        setRecordingTime(time => {
          if (time <= 1) {
            // Stop recording when timer reaches 1 second left
            setTimeout(() => stopRecording(), 100);
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, recordingTime]);

  const startCountdown = () => {
    setIsPreparing(true);
    setCountdown(3);

    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setIsPreparing(false);
          startRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startRecording = async () => {
    if (cameraRef.current) {
      try {
        setIsRecording(true);

        // Set recording duration based on test type
        const duration = getTestDuration(test.id);
        setRecordingTime(duration);

        // Start recording without maxDuration to avoid premature stopping
        const video = await cameraRef.current.recordAsync({
          quality: '720p',
        });

        // Only process if we have a valid video
        if (video && video.uri) {
          await saveAndAnalyzeVideo(video.uri);
        } else {
          throw new Error('No video data captured');
        }
      } catch (error) {
        console.error('Recording error:', error);
        Alert.alert('Error', 'Failed to record video. Please try again.');
        setIsRecording(false);
        setRecordingTime(0);
      }
    }
  };

  const stopRecording = async () => {
    if (cameraRef.current && isRecording) {
      try {
        console.log('Stopping recording...');
        setIsRecording(false);
        setRecordingTime(0);
        await cameraRef.current.stopRecording();
      } catch (error) {
        console.error('Stop recording error:', error);
        // Don't show alert for stop recording errors as they're usually harmless
      }
    }
  };

  const getTestDuration = (testId) => {
    switch (testId) {
      case 'vertical_jump': return 10; // Shorter for demo
      case 'shuttle_run': return 15;   // Shorter for demo
      case 'sit_ups': return 20;       // Shorter for demo
      case 'flexibility': return 10;   // Shorter for demo
      default: return 15;
    }
  };

  const saveAndAnalyzeVideo = async (videoUri) => {
    try {
      setIsAnalyzing(true);

      // Save video to device
      const asset = await MediaLibrary.createAssetAsync(videoUri);

      // Simulate AI analysis (in real app, this would call ML models)
      const analysisResult = await simulateAIAnalysis(test.id, videoUri);

      // Save results
      await saveTestResult(analysisResult);

      setAnalysisResult(analysisResult);
      setIsAnalyzing(false);

      // Navigate to results
      setTimeout(() => {
        navigation.navigate('Results', {
          result: analysisResult,
          test: test
        });
      }, 2000);

    } catch (error) {
      setIsAnalyzing(false);
      Alert.alert('Error', 'Failed to analyze video. Please try again.');
    }
  };

  const simulateAIAnalysis = async (testId, videoUri) => {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Generate realistic results based on test type
    const results = {
      vertical_jump: {
        score: Math.floor(Math.random() * 30) + 20, // 20-50 cm
        unit: 'cm',
        attempts: [
          Math.floor(Math.random() * 30) + 20,
          Math.floor(Math.random() * 30) + 20,
          Math.floor(Math.random() * 30) + 20
        ],
        confidence: 0.95,
        technique_notes: ['Good takeoff form', 'Landing could be improved']
      },
      shuttle_run: {
        score: (Math.random() * 5 + 10).toFixed(2), // 10-15 seconds
        unit: 'seconds',
        attempts: [
          (Math.random() * 5 + 10).toFixed(2),
          (Math.random() * 5 + 10).toFixed(2)
        ],
        confidence: 0.92,
        technique_notes: ['Good acceleration', 'Efficient turns']
      },
      sit_ups: {
        score: Math.floor(Math.random() * 20) + 25, // 25-45 reps
        unit: 'repetitions',
        attempts: [Math.floor(Math.random() * 20) + 25],
        confidence: 0.88,
        technique_notes: ['Consistent form', 'Full range of motion']
      },
      flexibility: {
        score: Math.floor(Math.random() * 15) + 5, // 5-20 cm
        unit: 'cm',
        attempts: [
          Math.floor(Math.random() * 15) + 5,
          Math.floor(Math.random() * 15) + 5,
          Math.floor(Math.random() * 15) + 5
        ],
        confidence: 0.90,
        technique_notes: ['Good flexibility', 'Consistent reach']
      }
    };

    return {
      testId,
      testName: test.name,
      timestamp: new Date().toISOString(),
      videoUri,
      ...results[testId],
      processed: true
    };
  };

  const saveTestResult = async (result) => {
    try {
      const existingResults = await AsyncStorage.getItem('testResults');
      const results = existingResults ? JSON.parse(existingResults) : [];
      results.push(result);
      await AsyncStorage.setItem('testResults', JSON.stringify(results));
    } catch (error) {
      console.error('Error saving result:', error);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Requesting camera and microphone permissions...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Camera and microphone access required</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        ref={cameraRef}
      >
        <View style={styles.overlay}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.testTitle}>{test.name}</Text>
            {recordingTime > 0 && (
              <Text style={styles.timer}>
                {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
              </Text>
            )}
          </View>

          {/* Countdown */}
          {isPreparing && (
            <View style={styles.countdownContainer}>
              <Text style={styles.countdownText}>Get Ready!</Text>
              <Text style={styles.countdownNumber}>{countdown}</Text>
            </View>
          )}

          {/* Analysis Screen */}
          {isAnalyzing && (
            <View style={styles.analysisContainer}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.analysisText}>Analyzing Performance...</Text>
              <Text style={styles.analysisSubtext}>AI is processing your video</Text>
            </View>
          )}

          {/* Results Preview */}
          {analysisResult && (
            <View style={styles.resultsPreview}>
              <Text style={styles.resultsTitle}>Analysis Complete!</Text>
              <Text style={styles.scoreText}>
                Score: {analysisResult.score} {analysisResult.unit}
              </Text>
              <Text style={styles.confidenceText}>
                Confidence: {(analysisResult.confidence * 100).toFixed(0)}%
              </Text>
            </View>
          )}

          {/* Controls */}
          <View style={styles.controls}>
            {!isRecording && !isPreparing && !isAnalyzing && !analysisResult && (
              <TouchableOpacity
                style={styles.recordButton}
                onPress={startCountdown}
              >
                <Text style={styles.recordButtonText}>Start Recording</Text>
              </TouchableOpacity>
            )}

            {isRecording && (
              <TouchableOpacity
                style={styles.stopButton}
                onPress={stopRecording}
              >
                <View style={styles.stopButtonInner} />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 18,
    color: '#f44336',
    marginBottom: 20,
    textAlign: 'center',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  testTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  timer: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f44336',
    fontFamily: 'monospace',
  },
  countdownContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  countdownNumber: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#4CAF50',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  analysisContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  analysisText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
  },
  analysisSubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 10,
  },
  resultsPreview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  scoreText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  confidenceText: {
    fontSize: 16,
    color: 'white',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f44336',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  recordButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  stopButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  stopButtonInner: {
    width: 30,
    height: 30,
    backgroundColor: 'white',
    borderRadius: 4,
  },
  backButton: {
    position: 'absolute',
    left: 30,
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});