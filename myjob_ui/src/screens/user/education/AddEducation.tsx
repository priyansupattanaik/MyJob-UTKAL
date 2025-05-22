import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import config  from "../../../context/config";

const AddEducation = () => {
  const [degreeType, setDegreeType] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [university, setUniversity] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [passingCGPA, setPassingCGPA] = useState('');
  const [passingPercentage, setPassingPercentage] = useState('');
  const [achievements, setAchievements] = useState('');

  const handleSubmit = async () => {
    const accessToken = await AsyncStorage.getItem('userToken');
    const userId = await AsyncStorage.getItem('userId');
    try {
      const response = await axios.put(
        `${config.apiUrl}/personalDetails/update/${userId}`,
        {
          degreeType,
          specialization,
          collegeName,
          university,
          graduationYear,
          passingCGPA,
          passingPercentage,
          achievements,
        },
        {
          params: { userId }, 
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
  
      if (response.status === 200) 
        Alert.alert(`Educational details saved successfully`);
        setDegreeType('');
        setSpecialization('');
        setCollegeName('');
        setUniversity('');
        setGraduationYear('');
        setPassingCGPA('');
        setPassingPercentage('');
        setAchievements('');
    } catch (error) {
      console.error('Error updating personal details:', error);
      Alert.alert('Failed to update personal details. Please try again later.');
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Add Education</Text>

      <InputField
        label="Degree Type"
        value={degreeType}
        onChangeText={setDegreeType}
        placeholder="Enter degree type"
      />

      <InputField
        label="Specialization"
        value={specialization}
        onChangeText={setSpecialization}
        placeholder="Enter specialization"
      />

      <InputField
        label="College Name"
        value={collegeName}
        onChangeText={setCollegeName}
        placeholder="Enter college name"
      />

      <InputField
        label="University"
        value={university}
        onChangeText={setUniversity}
        placeholder="Enter university name"
      />

      <InputField
        label="Graduation Year"
        value={graduationYear}
        onChangeText={setGraduationYear}
        placeholder="Enter graduation year"
        keyboardType="numeric"
      />

      <InputField
        label="Passing CGPA"
        value={passingCGPA}
        onChangeText={setPassingCGPA}
        placeholder="Enter passing CGPA"
        keyboardType="numeric"
      />

      <InputField
        label="Passing Percentage"
        value={passingPercentage}
        onChangeText={setPassingPercentage}
        placeholder="Enter passing percentage"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Achievements</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={achievements}
        onChangeText={setAchievements}
        placeholder="Enter your achievements"
        multiline
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const InputField = ({ label, ...props }: any) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    <TextInput style={styles.input} {...props} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#130160',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    shadowColor:'#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  button: {
    backgroundColor: '#130160',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 30,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
  },
});

export default AddEducation;

