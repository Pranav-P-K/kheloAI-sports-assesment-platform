/* eslint-disable no-unused-vars */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function HomeScreen({ navigation }) {
  const [athleteName, setAthleteName] = useState('');
  const [assessmentHistory, setAssessmentHistory] = useState([]);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const name = await AsyncStorage.getItem('athleteName');
      const history = await AsyncStorage.getItem('assessmentHistory');
      if (name) setAthleteName(name);
      if (history) setAssessmentHistory(JSON.parse(history));
    } catch (error) {
      console.log('Error loading user data:', error);
    }
  };

  const handleStartAssessment = () => {
    if (!athleteName) {
      navigation.navigate('Profile');
    } else {
      navigation.navigate('TestSelection');
    }
  };

  const MenuButton = ({ title, subtitle, onPress, icon }) => (
    <TouchableOpacity style={styles.menuButton} onPress={onPress}>
      <View style={styles.menuContent}>
        <Text style={styles.menuIcon}>{icon}</Text>
        <View style={styles.menuText}>
          <Text style={styles.menuTitle}>{title}</Text>
          <Text style={styles.menuSubtitle}>{subtitle}</Text>
        </View>
        <Text style={styles.arrow}>→</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={{ uri: 'https://via.placeholder.com/60x60/2196F3/fff?text=SAI' }}
          style={styles.logo}
        />
        <Text style={styles.title}>Sports Authority of India</Text>
        <Text style={styles.subtitle}>Talent Assessment Platform</Text>
      </View>

      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeText}>
          {athleteName ? `Welcome back, ${athleteName}!` : 'Welcome to SAI Assessment'}
        </Text>
        <Text style={styles.welcomeSubtext}>
          {athleteName 
            ? 'Ready for your next performance assessment?' 
            : 'Complete your profile to start your talent assessment journey'
          }
        </Text>
      </View>

      <View style={styles.menuContainer}>
        <MenuButton
          title="Start Assessment"
          subtitle="Begin fitness test recording"
          icon="🏃‍♂️"
          onPress={handleStartAssessment}
        />
        
        <MenuButton
          title="View Benchmarks"
          subtitle="Age/gender performance standards"
          icon="📊"
          onPress={() => navigation.navigate('Benchmark')}
        />
        
        <MenuButton
          title="Assessment History"
          subtitle="View past test results"
          icon="📝"
          onPress={() => navigation.navigate('Results')}
        />
        
        <MenuButton
          title="Update Profile"
          subtitle="Modify athlete information"
          icon="👤"
          onPress={() => navigation.navigate('Profile')}
        />
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Assessment Tests Include:</Text>
        <Text style={styles.infoText}>• Height & Weight Measurement</Text>
        <Text style={styles.infoText}>• Vertical Jump Test</Text>
        <Text style={styles.infoText}>• Shuttle Run (4x10m)</Text>
        <Text style={styles.infoText}>• Sit-ups (1 minute)</Text>
        <Text style={styles.infoText}>• Endurance Run</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 30,
    alignItems: 'center',
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#E3F2FD',
    textAlign: 'center',
    marginTop: 5,
  },
  welcomeCard: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 10,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  welcomeSubtext: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  menuContainer: {
    margin: 20,
  },
  menuButton: {
    backgroundColor: 'white',
    marginBottom: 15,
    borderRadius: 10,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
  },
  menuContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  arrow: {
    fontSize: 18,
    color: '#2196F3',
  },
  infoCard: {
    backgroundColor: '#E3F2FD',
    margin: 20,
    padding: 20,
    borderRadius: 10,
    marginTop: 10,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#1976D2',
    marginBottom: 5,
  },
});