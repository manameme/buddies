import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io, Socket } from 'socket.io-client';
import { SocketProvider } from './src/context/SocketContext';

// Import your screens
import AuthScreen from './src/screens/AuthScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import GroupScreen from './src/screens/GroupScreen';
import CreateGroupScreen from './src/screens/CreateGroupScreen';
import JoinGroupScreen from './src/screens/JoinGroupScreen';
import TaskScreen from './src/screens/TaskScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// Types
type User = {
  id: string;
  username: string;
  createdAt?: string; // Made optional since it might not always be present
};

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = ({ user, onLogout }: { user: User; onLogout: () => void }) => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Groups') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Tasks') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help'; // Fallback icon
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4ECDC4',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Dashboard" options={{ title: 'Race Track' }}>
        {() => <DashboardScreen user={user} />}
      </Tab.Screen>
      <Tab.Screen name="Groups" options={{ title: 'My Groups' }}>
        {() => <GroupScreen user={user} />}
      </Tab.Screen>
      <Tab.Screen name="Tasks" options={{ title: 'My Tasks' }}>
        {() => <TaskScreen user={user} />}
      </Tab.Screen>
      <Tab.Screen name="Profile" options={{ title: 'Profile' }}>
        {() => <ProfileScreen user={user} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);

  // Initialize socket connection
  const initSocket = (userId: string) => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    socketRef.current = io('http://192.168.1.11:3000', {
      transports: ['websocket'],
      query: { userId },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      withCredentials: true
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to socket server');
    });

    socketRef.current.on('connect_error', (err) => {
      console.log('Socket connection error:', err.message);
    });

    socketRef.current.on('newJoinRequest', (data) => {
      Alert.alert(
        'New Join Request',
        `${data.username} wants to join ${data.groupName}`,
        [
          { text: 'View', onPress: () => console.log('View pressed') },
          { text: 'OK' }
        ]
      );
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });
  };

  // Store user in AsyncStorage when logging in
  const handleLogin = async (user: User) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      initSocket(user.id); // This should call NotificationService.initSocket
    } catch (error) {
      console.error('Failed to save user:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Check for logged in user on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userString = await AsyncStorage.getItem('user');
        if (userString) {
          const user = JSON.parse(userString) as User;
          setUser(user);
          initSocket(user.id);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4ECDC4" />
      </View>
    );
  }

  return (
    <SocketProvider socket={socketRef.current}>
      <NavigationContainer>
        <Stack.Navigator>
          {!user ? (
            <Stack.Screen name="Auth" options={{ headerShown: false }}>
              {() => <AuthScreen onLogin={handleLogin} />}
            </Stack.Screen>
          ) : (
            <>
              <Stack.Screen name="Main" options={{ headerShown: false }}>
                {() => <MainTabs user={user} onLogout={handleLogout} />}
              </Stack.Screen>
              <Stack.Screen 
                name="CreateGroup" 
                options={{ title: 'Create Group' }}
              >
                {() => <CreateGroupScreen user={user} onBack={() => {}} onSuccess={() => {}} />}
              </Stack.Screen>
              <Stack.Screen 
                name="JoinGroup" 
                options={{ title: 'Join Group' }}
              >
                {() => <JoinGroupScreen user={user} onBack={() => {}} onSuccess={() => {}} />}
              </Stack.Screen>
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SocketProvider>
  );
}