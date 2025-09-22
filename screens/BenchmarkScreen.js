/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

const BENCHMARKS = {
  vertical_jump: {
    name: 'Vertical Jump',
    unit: 'cm',
    description: 'Explosive leg power measurement',
    higherIsBetter: true,
    data: {
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
    }
  },
  shuttle_run: {
    name: 'Shuttle Run (4x10m)',
    unit: 'seconds',
    description: 'Speed and agility assessment',
    higherIsBetter: false,
    data: {
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
    }
  },
  sit_ups: {
    name: 'Sit-ups (1 minute)',
    unit: 'repetitions',
    description: 'Core strength and endurance',
    higherIsBetter: true,
    data: {
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
  },
  flexibility: {
    name: 'Flexibility Test',
    unit: 'cm',
    description: 'Range of motion assessment',
    higherIsBetter: true,
    data: {
      male: {
        '8-12': { excellent: 20, good: 15, average: 10, poor: 5 },
        '13-17': { excellent: 25, good: 20, average: 15, poor: 8 },
        '18-25': { excellent: 30, good: 25, average: 18, poor: 10 },
        '26-35': { excellent: 25, good: 20, average: 15, poor: 8 }
      },
      female: {
        '8-12': { excellent: 25, good: 20, average: 15, poor: 8 },
        '13-17': { excellent: 30, good: 25, average: 20, poor: 12 },
        '18-25': { excellent: 35, good: 30, average: 23, poor: 15 },
        '26-35': { excellent: 30, good: 25, average: 20, poor: 12 }
      }
    }
  }
};

const PERFORMANCE_COLORS = {
  excellent: '#4CAF50',
  good: '#8BC34A',
  average: '#FF9800',
  poor: '#f44336'
};

export default function BenchmarkScreen({ navigation }) {
  const [athleteProfile, setAthleteProfile] = useState({});
  const [selectedTest, setSelectedTest] = useState('vertical_jump');
  const [selectedGender, setSelectedGender] = useState('male');
  const [selectedAge, setSelectedAge] = useState('18-25');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await AsyncStorage.getItem('athleteProfile');
      if (profile) {
        const parsed = JSON.parse(profile);
        setAthleteProfile(parsed);
        if (parsed.gender) setSelectedGender(parsed.gender);
        if (parsed.age) setSelectedAge(getAgeGroup(parseInt(parsed.age)));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const getAgeGroup = (age) => {
    if (age >= 8 && age <= 12) return '8-12';
    if (age >= 13 && age <= 17) return '13-17';
    if (age >= 18 && age <= 25) return '18-25';
    if (age >= 26 && age <= 35) return '26-35';
    return '18-25';
  };

  const TestSelector = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.testSelector}>
      {Object.keys(BENCHMARKS).map((testId) => (
        <TouchableOpacity
          key={testId}
          style={[
            styles.testTab,
            selectedTest === testId && styles.activeTestTab
          ]}
          onPress={() => setSelectedTest(testId)}
        >
          <Text style={[
            styles.testTabText,
            selectedTest === testId && styles.activeTestTabText
          ]}>
            {BENCHMARKS[testId].name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const FilterSelector = () => (
    <View style={styles.filterContainer}>
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>Gender:</Text>
        <View style={styles.filterButtons}>
          {['male', 'female'].map((gender) => (
            <TouchableOpacity
              key={gender}
              style={[
                styles.filterButton,
                selectedGender === gender && styles.activeFilterButton
              ]}
              onPress={() => setSelectedGender(gender)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedGender === gender && styles.activeFilterButtonText
              ]}>
                {gender.charAt(0).toUpperCase() + gender.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>Age Group:</Text>
        <View style={styles.filterButtons}>
          {['8-12', '13-17', '18-25', '26-35'].map((age) => (
            <TouchableOpacity
              key={age}
              style={[
                styles.filterButton,
                selectedAge === age && styles.activeFilterButton
              ]}
              onPress={() => setSelectedAge(age)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedAge === age && styles.activeFilterButtonText
              ]}>
                {age} yrs
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const BenchmarkTable = () => {
    const testData = BENCHMARKS[selectedTest];
    const benchmarks = testData.data[selectedGender][selectedAge];

    const PerformanceBar = ({ level, value, color }) => (
      <View style={styles.performanceRow}>
        <View style={styles.performanceLabel}>
          <View style={[styles.colorIndicator, { backgroundColor: color }]} />
          <Text style={styles.performanceLevelText}>{level}</Text>
        </View>
        <Text style={styles.performanceValue}>
          {testData.higherIsBetter ? `${value}+ ${testData.unit}` : `${value}- ${testData.unit}`}
        </Text>
      </View>
    );

    return (
      <View style={styles.benchmarkCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{testData.name}</Text>
          <Text style={styles.cardSubtitle}>{testData.description}</Text>
        </View>

        <View style={styles.performanceTable}>
          <PerformanceBar 
            level="Excellent" 
            value={benchmarks.excellent} 
            color={PERFORMANCE_COLORS.excellent}
          />
          <PerformanceBar 
            level="Good" 
            value={benchmarks.good} 
            color={PERFORMANCE_COLORS.good}
          />
          <PerformanceBar 
            level="Average" 
            value={benchmarks.average} 
            color={PERFORMANCE_COLORS.average}
          />
          <PerformanceBar 
            level="Needs Improvement" 
            value={benchmarks.poor} 
            color={PERFORMANCE_COLORS.poor}
          />
        </View>

        <View style={styles.noteSection}>
          <Text style={styles.noteText}>
            {testData.higherIsBetter 
              ? "Higher scores indicate better performance" 
              : "Lower scores indicate better performance"}
          </Text>
        </View>
      </View>
    );
  };

  const InfoCard = () => (
    <View style={styles.infoCard}>
      <Text style={styles.infoTitle}>About Performance Benchmarks</Text>
      <Text style={styles.infoText}>
        These benchmarks are based on Sports Authority of India standards and international fitness norms. They help evaluate your performance relative to your age group and gender.
      </Text>
      <View style={styles.infoList}>
        <Text style={styles.infoListItem}>• Standards are updated regularly based on current research</Text>
        <Text style={styles.infoListItem}>• Individual progress is more important than absolute scores</Text>
        <Text style={styles.infoListItem}>• Consistent training can improve performance across all categories</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>Age and gender-based fitness standards</Text>
      </View>

      <ScrollView style={styles.content}>
        <TestSelector />
        <FilterSelector />
        <BenchmarkTable />
        <InfoCard />

        <View style={styles.actionSection}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('TestSelection')}
          >
            <Text style={styles.actionButtonText}>Take Assessment Test</Text>
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
  content: {
    flex: 1,
  },
  testSelector: {
    padding: 15,
  },
  testTab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderRadius: 25,
    marginRight: 10,
    elevation: 2,
  },
  activeTestTab: {
    backgroundColor: '#2196F3',
  },
  testTabText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  activeTestTabText: {
    color: 'white',
    fontWeight: 'bold',
  },
  filterContainer: {
    padding: 15,
    paddingTop: 0,
  },
  filterGroup: {
    marginBottom: 15,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  activeFilterButton: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
  },
  activeFilterButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  benchmarkCard: {
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 12,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
  cardHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  performanceTable: {
    padding: 20,
  },
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  performanceLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  performanceLevelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  performanceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  noteSection: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  noteText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  infoList: {
    marginLeft: 10,
  },
  infoListItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  actionSection: {
    margin: 15,
  },
  actionButton: {
    backgroundColor: '#4CAF50',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 30,
  },
});