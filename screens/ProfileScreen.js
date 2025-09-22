/* eslint-disable no-unused-vars */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function ProfileScreen({ navigation }) {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'male',
    height: '',
    weight: '',
    sport: '',
    experience: 'beginner',
    state: '',
    district: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem('athleteProfile');
      if (savedProfile) {
        setFormData(JSON.parse(savedProfile));
      }
    } catch (error) {
      console.log('Error loading profile:', error);
    }
  };

  const saveProfile = async () => {
    // Validation
    if (!formData.name || !formData.age || !formData.height || !formData.weight) {
      Alert.alert('Error', 'Please fill in all required fields (Name, Age, Height, Weight)');
      return;
    }

    if (parseInt(formData.age) < 8 || parseInt(formData.age) > 35) {
      Alert.alert('Error', 'Age must be between 8 and 35 years');
      return;
    }

    try {
      await AsyncStorage.setItem('athleteProfile', JSON.stringify(formData));
      await AsyncStorage.setItem('athleteName', formData.name);
      Alert.alert('Success', 'Profile saved successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('Home') }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    }
  };

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const InputField = ({ label, value, onChangeText, placeholder, keyboardType = 'default', required = false }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
      />
    </View>
  );

  const PickerField = ({ label, selectedValue, onValueChange, items, required = false }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedValue}
          onValueChange={onValueChange}
          style={styles.picker}
        >
          {items.map((item, index) => (
            <Picker.Item key={index} label={item.label} value={item.value} />
          ))}
        </Picker>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Athlete Profile</Text>
          <Text style={styles.subtitle}>Complete your information to start assessment</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <InputField
            label="Full Name"
            value={formData.name}
            onChangeText={(text) => updateField('name', text)}
            placeholder="Enter your full name"
            required
          />

          <InputField
            label="Age"
            value={formData.age}
            onChangeText={(text) => updateField('age', text)}
            placeholder="Enter age (8-35 years)"
            keyboardType="numeric"
            required
          />

          <PickerField
            label="Gender"
            selectedValue={formData.gender}
            onValueChange={(value) => updateField('gender', value)}
            items={[
              { label: 'Male', value: 'male' },
              { label: 'Female', value: 'female' },
              { label: 'Other', value: 'other' }
            ]}
            required
          />

          <Text style={styles.sectionTitle}>Physical Measurements</Text>

          <InputField
            label="Height (cm)"
            value={formData.height}
            onChangeText={(text) => updateField('height', text)}
            placeholder="Height in centimeters"
            keyboardType="numeric"
            required
          />

          <InputField
            label="Weight (kg)"
            value={formData.weight}
            onChangeText={(text) => updateField('weight', text)}
            placeholder="Weight in kilograms"
            keyboardType="numeric"
            required
          />

          <Text style={styles.sectionTitle}>Sports Information</Text>

          <InputField
            label="Primary Sport"
            value={formData.sport}
            onChangeText={(text) => updateField('sport', text)}
            placeholder="e.g., Athletics, Football, Cricket"
          />

          <PickerField
            label="Experience Level"
            selectedValue={formData.experience}
            onValueChange={(value) => updateField('experience', value)}
            items={[
              { label: 'Beginner (0-2 years)', value: 'beginner' },
              { label: 'Intermediate (2-5 years)', value: 'intermediate' },
              { label: 'Advanced (5+ years)', value: 'advanced' }
            ]}
          />

          <Text style={styles.sectionTitle}>Location</Text>

          <InputField
            label="State"
            value={formData.state}
            onChangeText={(text) => updateField('state', text)}
            placeholder="Enter your state"
          />

          <InputField
            label="District"
            value={formData.district}
            onChangeText={(text) => updateField('district', text)}
            placeholder="Enter your district"
          />

          <Text style={styles.sectionTitle}>Contact Information</Text>

          <InputField
            label="Phone Number"
            value={formData.phone}
            onChangeText={(text) => updateField('phone', text)}
            placeholder="Enter 10-digit mobile number"
            keyboardType="phone-pad"
          />

          <InputField
            label="Email (Optional)"
            value={formData.email}
            onChangeText={(text) => updateField('email', text)}
            placeholder="Enter email address"
            keyboardType="email-address"
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
          <Text style={styles.saveButtonText}>Save Profile</Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </KeyboardAvoidingView>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#E3F2FD',
    textAlign: 'center',
  },
  form: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3',
    paddingBottom: 5,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#f44336',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: 'white',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  picker: {
    height: 50,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    margin: 20,
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  bottomPadding: {
    height: 50,
  },
});