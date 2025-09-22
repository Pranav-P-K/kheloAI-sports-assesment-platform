/* eslint-disable no-unused-vars */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

// Performance benchmarks by age and gender
const BENCHMARKS = {
  vertical_jump: {
    male: {
      '8-12': { excellent: 35, good: 28, average: 22, poor: 15 },
      '13-17': { excellent: 45, good: 38, average: 30, poor: 22 },
      '18-25': { excellent: 50, good: 42, average: 35, poor: 28 },
      '26-35': { excellent: 45, good: 38, average: 30, poor: 23 }
    },
    female: {
      '8-12': { excellent: 30, good: 24, average: 18, poor: 12 },
      '13-17': { excellent: 38, good: 32, average: 25, poor: 18 },
      '18-25': { excellent: 40, good: 34, average: 27, poor: 20 },
      '26-35': { excellent: 35, good: 29, average: 22, poor: 16 }
    }
  },
  shuttle_run: {
    male: {
      '8-12': { excellent: 11.5, good: 12.5, average: 13.5, poor: 15.0 },
      '13-17': { excellent: 10.0, good: 11.0, average: 12.0, poor: 13.5 },
      '18-25': { excellent: 9.5, good: 10.5, average: 11.5, poor: 13.0 },
      '26-35': { excellent: 10.0, good: 11.0, average: 12.0, poor: 13.5 }
    },
    female: {
      '8-12': { excellent: 12.0, good: 13.0, average: 14.0, poor: 15.5 },
      '13-17': { excellent: 11.0, good: 12.0, average: 13.0, poor: 14.5 },
      '18-25': { excellent: 10.5, good: 11.5, average: 12.5, poor: 14.0 },
      '26-35': { excellent: 11.0, good: 12.0, average: 13.0, poor: 14.5 }
    }
  },
  sit_ups: {
    male: {
      '8-12': { excellent: 35, good: 28, average: 22, poor: 15 },
      '13-17': { excellent: 45, good: 38, average: 30, poor: 22 },
      '18-25': { excellent: 50, good: 42, average: 35, poor: 25 },
      '26-35': { excellent: 45, good: 38, average: 30, poor: 20 }
    },
    female: {
      '8-12': { excellent: 30, good: 24, average: 18, poor: 12 },
      '13-17': { excellent: 40, good: 32, average: 25, poor: 18 },
      '18-25': { excellent: 42, good: 35, average: 28, poor: 20 },
      '26-35': { excellent: 38, good: 30, average: 23, poor: 15 }
    }
  }
};

export default function ResultsScreen({ navigation, route }) {
  const [allResults, setAllResults] = useState([]);
  const [athleteProfile, setAthleteProfile] = useState({});
  const currentResult = route.params?.result;
  const currentTest = route.params?.test;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const results = await AsyncStorage.getItem('testResults');
      const profile = await AsyncStorage.getItem('athleteProfile');
      
      // For demo purposes, use dummy data if no real data exists
      if (results) {
        setAllResults(JSON.parse(results));
      } else {
        // Dummy test results for presentation
        const dummyResults = [
          {
            testId: 'vertical_jump',
            testName: 'Vertical Jump Test',
            score: '42.5',
            unit: 'cm',
            confidence: 0.92,
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            attempts: ['40.2', '42.5', '41.8'],
            technique_notes: [
              'Good takeoff technique with proper knee bend',
              'Excellent arm swing coordination',
              'Landing could be more controlled'
            ]
          },
          {
            testId: 'shuttle_run',
            testName: 'Shuttle Run Test',
            score: '10.8',
            unit: 'seconds',
            confidence: 0.89,
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            attempts: ['11.2', '10.8', '11.0'],
            technique_notes: [
              'Quick acceleration and deceleration',
              'Good body positioning during turns',
              'Consistent pace throughout the test'
            ]
          },
          {
            testId: 'sit_ups',
            testName: 'Sit-ups Test',
            score: '38',
            unit: 'reps',
            confidence: 0.95,
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
            attempts: ['36', '38', '37'],
            technique_notes: [
              'Proper form maintained throughout',
              'Consistent breathing pattern',
              'Good core engagement'
            ]
          },
          {
            testId: 'vertical_jump',
            testName: 'Vertical Jump Test',
            score: '39.2',
            unit: 'cm',
            confidence: 0.87,
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
            attempts: ['38.5', '39.2', '38.9'],
            technique_notes: [
              'Improvement in takeoff timing',
              'Better arm coordination than previous attempt',
              'Consistent landing technique'
            ]
          },
          {
            testId: 'shuttle_run',
            testName: 'Shuttle Run Test',
            score: '11.5',
            unit: 'seconds',
            confidence: 0.91,
            timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
            attempts: ['11.8', '11.5', '11.6'],
            technique_notes: [
              'Good starting position',
              'Efficient turning technique',
              'Room for improvement in acceleration'
            ]
          }
        ];
        setAllResults(dummyResults);
      }
      
      if (profile) {
        setAthleteProfile(JSON.parse(profile));
      } else {
        // Dummy athlete profile for presentation
        const dummyProfile = {
          name: 'Alex Johnson',
          age: '22',
          gender: 'male',
          sport: 'Basketball',
          level: 'College'
        };
        setAthleteProfile(dummyProfile);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const getAgeGroup = (age) => {
    if (age >= 8 && age <= 12) return '8-12';
    if (age >= 13 && age <= 17) return '13-17';
    if (age >= 18 && age <= 25) return '18-25';
    if (age >= 26 && age <= 35) return '26-35';
    return '18-25'; // default
  };

  const getPerformanceRating = (testId, score, gender, age) => {
    const ageGroup = getAgeGroup(parseInt(age));
    const benchmarks = BENCHMARKS[testId]?.[gender]?.[ageGroup];
    
    if (!benchmarks) return { rating: 'N/A', color: '#666' };

    // For time-based tests (lower is better)
    if (testId === 'shuttle_run') {
      if (score <= benchmarks.excellent) return { rating: 'Excellent', color: '#4CAF50' };
      if (score <= benchmarks.good) return { rating: 'Good', color: '#8BC34A' };
      if (score <= benchmarks.average) return { rating: 'Average', color: '#FF9800' };
      return { rating: 'Needs Improvement', color: '#f44336' };
    }
    
    // For count/distance-based tests (higher is better)
    if (score >= benchmarks.excellent) return { rating: 'Excellent', color: '#4CAF50' };
    if (score >= benchmarks.good) return { rating: 'Good', color: '#8BC34A' };
    if (score >= benchmarks.average) return { rating: 'Average', color: '#FF9800' };
    return { rating: 'Needs Improvement', color: '#f44336' };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const clearAllResults = () => {
    Alert.alert(
      'Clear All Results',
      'Are you sure you want to delete all test results?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('testResults');
              setAllResults([]);
              Alert.alert('Success', 'All results cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear results');
            }
          }
        }
      ]
    );
  };

  const ResultCard = ({ result, isLatest = false }) => {
    const performance = getPerformanceRating(
      result.testId, 
      parseFloat(result.score), 
      athleteProfile.gender, 
      athleteProfile.age
    );

    return (
      <View style={[styles.resultCard, isLatest && styles.latestResult]}>
        {isLatest && (
          <View style={styles.latestBadge}>
            <Text style={styles.latestBadgeText}>LATEST</Text>
          </View>
        )}
        
        <View style={styles.resultHeader}>
          <Text style={styles.testName}>{result.testName}</Text>
          <Text style={styles.resultDate}>{formatDate(result.timestamp)}</Text>
        </View>

        <View style={styles.scoreSection}>
          <Text style={styles.scoreLabel}>Your Score</Text>
          <Text style={styles.scoreValue}>
            {result.score} {result.unit}
          </Text>
          <View style={[styles.ratingBadge, { backgroundColor: performance.color }]}>
            <Text style={styles.ratingText}>{performance.rating}</Text>
          </View>
        </View>

        <View style={styles.detailsSection}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Confidence:</Text>
            <Text style={styles.detailValue}>
              {(result.confidence * 100).toFixed(0)}%
            </Text>
          </View>
          
          {result.attempts && result.attempts.length > 1 && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>All Attempts:</Text>
              <Text style={styles.detailValue}>
                {result.attempts.join(', ')} {result.unit}
              </Text>
            </View>
          )}
        </View>

        {result.technique_notes && result.technique_notes.length > 0 && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>AI Analysis Notes:</Text>
            {result.technique_notes.map((note, index) => (
              <Text key={index} style={styles.noteItem}>• {note}</Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          {athleteProfile.name && (
            <Text style={styles.subtitle}>
              {athleteProfile.name} • {athleteProfile.age}yrs • {athleteProfile.gender}
            </Text>
          )}
        </View>

        {/* Current Result (if navigated from recording) */}
        {currentResult && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Latest Assessment</Text>
            <ResultCard result={currentResult} isLatest={true} />
          </View>
        )}

        {/* All Results */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Assessment History</Text>
            {allResults.length > 0 && (
              <TouchableOpacity onPress={clearAllResults} style={styles.clearButton}>
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>

          {allResults.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No assessments completed yet</Text>
              <TouchableOpacity 
                style={styles.startButton}
                onPress={() => navigation.navigate('TestSelection')}
              >
                <Text style={styles.startButtonText}>Start Your First Test</Text>
              </TouchableOpacity>
            </View>
          ) : (
            allResults
              .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
              .map((result, index) => (
                <ResultCard key={index} result={result} />
              ))
          )}
        </View>

        {/* Performance Summary */}
        {allResults.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Performance Summary</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{allResults.length}</Text>
                <Text style={styles.summaryLabel}>Total Tests</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {new Set(allResults.map(r => r.testId)).size}
                </Text>
                <Text style={styles.summaryLabel}>Test Types</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {Math.round(
                    allResults.reduce((sum, r) => sum + r.confidence, 0) / allResults.length * 100
                  )}%
                </Text>
                <Text style={styles.summaryLabel}>Avg Confidence</Text>
              </View>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('TestSelection')}
          >
            <Text style={styles.actionButtonText}>Take New Test</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => navigation.navigate('Benchmark')}
          >
            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
              View Benchmarks
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#E3F2FD',
    textAlign: 'center',
  },
  section: {
    margin: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  clearButton: {
    padding: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f44336',
    borderRadius: 6,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  resultCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    position: 'relative',
  },
  latestResult: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  latestBadge: {
    position: 'absolute',
    top: -8,
    right: 15,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  latestBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  testName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  resultDate: {
    fontSize: 12,
    color: '#666',
  },
  scoreSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 10,
  },
  ratingBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  ratingText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  detailsSection: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 15,
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  notesSection: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  noteItem: {
    fontSize: 13,
    color: '#555',
    marginBottom: 4,
    lineHeight: 18,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    elevation: 2,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  actionSection: {
    margin: 15,
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#2196F3',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  secondaryButtonText: {
    color: '#2196F3',
  },
  bottomPadding: {
    height: 30,
  },
});