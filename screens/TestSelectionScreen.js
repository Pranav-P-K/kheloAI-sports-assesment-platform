import { useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const ASSESSMENT_TESTS = [
  {
    id: 'vertical_jump',
    name: 'Vertical Jump Test',
    description: 'Measures explosive leg power and jumping ability',
    duration: '3 attempts',
    equipment: 'Wall or measuring tape',
    instructions: [
      'Stand with feet shoulder-width apart',
      'Jump as high as possible',
      'Mark the highest point reached',
      'Take 3 attempts, best score counts'
    ],
    icon: '🦘'
  },
  {
    id: 'shuttle_run',
    name: 'Shuttle Run (4x10m)',
    description: 'Tests speed, agility, and change of direction',
    duration: '2-3 attempts',
    equipment: '20m space, 2 cones/markers',
    instructions: [
      'Place markers 10m apart',
      'Start at first marker',
      'Sprint to second marker and back twice',
      'Touch each marker with your hand'
    ],
    icon: '🏃‍♂️'
  },
  {
    id: 'sit_ups',
    name: 'Sit-ups Test',
    description: 'Measures core strength and muscular endurance',
    duration: '1 minute',
    equipment: 'Flat surface, timer',
    instructions: [
      'Lie on back, knees bent at 90°',
      'Hands behind head or crossed on chest',
      'Perform maximum sit-ups in 1 minute',
      'Count only complete repetitions'
    ],
    icon: '💪'
  },
  {
    id: 'endurance_run',
    name: 'Endurance Run',
    description: 'Tests cardiovascular fitness and stamina',
    duration: '12 minutes',
    equipment: 'Open space or track',
    instructions: [
      'Run continuously for 12 minutes',
      'Maintain steady pace',
      'Record total distance covered',
      'Walking is allowed but not recommended'
    ],
    icon: '🏃‍♀️'
  },
  {
    id: 'flexibility',
    name: 'Flexibility Test',
    description: 'Measures range of motion and flexibility',
    duration: '3 attempts',
    equipment: 'Measuring scale',
    instructions: [
      'Sit with legs extended straight',
      'Reach forward as far as possible',
      'Hold position for 2 seconds',
      'Record furthest reach'
    ],
    icon: '🧘‍♂️'
  }
];

export default function TestSelectionScreen({ navigation }) {
  const [selectedTest, setSelectedTest] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);

  const handleTestSelect = (test) => {
    setSelectedTest(test);
    setShowInstructions(true);
  };

  const startRecording = () => {
    setShowInstructions(false);
    navigation.navigate('Recording', { test: selectedTest });
  };

  const TestCard = ({ test }) => (
    <TouchableOpacity 
      style={styles.testCard} 
      onPress={() => handleTestSelect(test)}
    >
      <View style={styles.testHeader}>
        <Text style={styles.testIcon}>{test.icon}</Text>
        <View style={styles.testInfo}>
          <Text style={styles.testName}>{test.name}</Text>
          <Text style={styles.testDescription}>{test.description}</Text>
        </View>
        <Text style={styles.arrow}>→</Text>
      </View>
      <View style={styles.testDetails}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Duration:</Text>
          <Text style={styles.detailValue}>{test.duration}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Equipment:</Text>
          <Text style={styles.detailValue}>{test.equipment}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Assessment Test</Text>
        <Text style={styles.subtitle}>Choose a fitness test to record and assess</Text>
      </View>

      <ScrollView style={styles.testList}>
        {ASSESSMENT_TESTS.map((test) => (
          <TestCard key={test.id} test={test} />
        ))}
      </ScrollView>

      <Modal
        visible={showInstructions}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedTest && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalIcon}>{selectedTest.icon}</Text>
                  <Text style={styles.modalTitle}>{selectedTest.name}</Text>
                  <TouchableOpacity 
                    style={styles.closeButton}
                    onPress={() => setShowInstructions(false)}
                  >
                    <Text style={styles.closeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.instructionsContent}>
                  <Text style={styles.instructionsTitle}>Instructions:</Text>
                  {selectedTest.instructions.map((instruction, index) => (
                    <View key={index} style={styles.instructionItem}>
                      <Text style={styles.instructionNumber}>{index + 1}.</Text>
                      <Text style={styles.instructionText}>{instruction}</Text>
                    </View>
                  ))}

                  <View style={styles.equipmentSection}>
                    <Text style={styles.equipmentTitle}>Required Equipment:</Text>
                    <Text style={styles.equipmentText}>{selectedTest.equipment}</Text>
                  </View>

                  <View style={styles.durationSection}>
                    <Text style={styles.durationTitle}>Duration/Attempts:</Text>
                    <Text style={styles.durationText}>{selectedTest.duration}</Text>
                  </View>
                </ScrollView>

                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={() => setShowInstructions(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.startButton}
                    onPress={startRecording}
                  >
                    <Text style={styles.startButtonText}>Start Recording</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  testList: {
    flex: 1,
    padding: 15,
  },
  testCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    overflow: 'hidden',
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  testIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  testInfo: {
    flex: 1,
  },
  testName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  testDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  arrow: {
    fontSize: 20,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  testDetails: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  detailItem: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    width: 80,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    width: '90%',
    maxHeight: '80%',
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#2196F3',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  modalIcon: {
    fontSize: 24,
    marginRight: 10,
    color: 'white',
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  instructionsContent: {
    padding: 20,
    maxHeight: 400,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  instructionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
    width: 25,
  },
  instructionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    lineHeight: 22,
  },
  equipmentSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  equipmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  equipmentText: {
    fontSize: 15,
    color: '#1976D2',
  },
  durationSection: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
  },
  durationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F57C00',
    marginBottom: 8,
  },
  durationText: {
    fontSize: 15,
    color: '#F57C00',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  startButton: {
    flex: 2,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    marginLeft: 10,
  },
  startButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
});