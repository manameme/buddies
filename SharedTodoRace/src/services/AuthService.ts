// src/services/AuthService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { disconnectSocket } from './NotificationService';



export const logout = async () => {
  try {
    await AsyncStorage.multiRemove(['user', 'token']);
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    return false;
  }
};

export const getCurrentUser = async () => {
  try {
    const userString = await AsyncStorage.getItem('user');
    return userString ? JSON.parse(userString) : null;
  } catch (error) {
    console.error('Failed to get user:', error);
    return null;
  }
};