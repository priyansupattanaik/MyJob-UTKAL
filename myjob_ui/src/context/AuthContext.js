import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [type, setType] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load AsyncStorage data when the app starts
  useEffect(() => {
    const loadAsyncData = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const id = await AsyncStorage.getItem('userId');
        const type = await AsyncStorage.getItem('type');
        setType(type);
        setUserToken(token);
        setUserId(id);
      } catch (error) {
        console.error('Error loading async data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAsyncData();
  }, []);

  // Save token and userId to AsyncStorage and update state
  const saveAuthData = async (token, id) => {
    try {
      await AsyncStorage.setType('type', type);
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userId', id.toString());
      setUserToken(token);
      setUserId(id);
      setType(type);
    } catch (error) {
      console.error('Error saving async data:', error);
    }
  };

  // Clear AsyncStorage and reset state
  const clearAuthData = async () => {
  try {
    // Remove all relevant data
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userId');
    await AsyncStorage.removeItem('type');
    setUserToken(null);
    setUserId(null);
    setType(null);
  } catch (error) {
    console.error('Error clearing async data:', error);
  }
};

  return (
    <AuthContext.Provider
      value={{
        userToken,
        userId,
        type,
        loading,
        saveAuthData,
        clearAuthData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);
