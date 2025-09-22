/* eslint-disable no-unused-vars */
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar, StyleSheet } from 'react-native';

// Import screens
import BenchmarkScreen from './screens/BenchmarkScreen';
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import RecordingScreen from './screens/RecordingScreen';
import ResultsScreen from './screens/ResultsScreen';
import TestSelectionScreen from './screens/TestSelectionScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" />
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: '#2196F3' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' }
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'KheloAI' }}
        />
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{ title: 'Athlete Profile' }}
        />
        <Stack.Screen 
          name="TestSelection" 
          component={TestSelectionScreen}
          options={{ title: 'Select Assessment Test' }}
        />
        <Stack.Screen 
          name="Recording" 
          component={RecordingScreen}
          options={{ title: 'Record Performance' }}
        />
        <Stack.Screen 
          name="Results" 
          component={ResultsScreen}
          options={{ title: 'Assessment Results' }}
        />
        <Stack.Screen 
          name="Benchmark" 
          component={BenchmarkScreen}
          options={{ title: 'Performance Benchmarks' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});