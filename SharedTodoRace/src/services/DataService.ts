// src/services/DataService.ts
import axios from 'axios';
import { User, Group, Task, JoinRequest } from '../types';

// Configure axios to point to your backend
const API = axios.create({
  baseURL: 'http://192.168.1.11:3000/api', // Replace with your actual backend IP
  timeout: 10000,
});

class DataService {
  // User methods
  async createUser(username: string): Promise<User | null> {
    try {
      const response = await API.post('/users/create', { username });
      return response.data;
    } catch (error) {
      console.error('Create user error:', error);
      return null;
    }
  }

  async getUserByUsername(username: string): Promise<User | null> {
    try {
      const normalizedUsername = username.toLowerCase().trim();
      console.log('Fetching user:', normalizedUsername); // Debug log
      
      const response = await API.get(`/users/username/${normalizedUsername}`);
      
      console.log('User found:', response.data); // Debug log
      return response.data;
    } catch (error: any) {
      console.error('Get user error:', {
        status: error.response?.status,
        data: error.response?.data,
        usernameAttempted: username,
        endpoint: `/users/username/${username.toLowerCase()}`
      });
      return null;
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      const response = await API.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get user by ID error:', error);
      return null;
    }
  }

  // Group methods
  async createGroup(name: string, creatorId: string): Promise<Group | null> {
    try {
      const response = await API.post('/groups/create', { name, creatorId });
      return response.data;
    } catch (error) {
      console.error('Create group error:', error);
      return null;
    }
  }

  async searchGroups(query: string): Promise<Group[]> {
    try {
      const response = await API.get(`/groups/search/${query}`);
      return response.data;
    } catch (error) {
      console.error('Search groups error:', error);
      return [];
    }
  }

  async getGroupById(groupId: string): Promise<Group | null> {
    try {
      const response = await API.get(`/groups/${groupId}`);
      return response.data;
    } catch (error) {
      console.error('Get group error:', error);
      return null;
    }
  }

  async getUserGroups(userId: string): Promise<Group[]> {
    try {
      const response = await API.get(`/groups/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get user groups error:', error);
      return [];
    }
  }

  // Join request methods
  async createJoinRequest(groupId: string, userId: string): Promise<JoinRequest> {
    try {
      const response = await API.post('/join-requests/create', { groupId, userId });
      return response.data;
    } catch (error) {
      console.error('Create join request error:', error);
      throw error;
    }
  }

  async getPendingRequestsForUser(userId: string): Promise<JoinRequest[]> {
    try {
      const response = await API.get(`/join-requests/user/${userId}/pending`);
      return response.data;
    } catch (error) {
      console.error('Get pending requests error:', error);
      return [];
    }
  }

  async acceptJoinRequest(requestId: string): Promise<boolean> {
    try {
      await API.patch(`/join-requests/${requestId}/accept`);
      return true;
    } catch (error) {
      console.error('Accept join request error:', error);
      return false;
    }
  }

  // Task methods
  async createTask(title: string, description: string, userId: string, groupId: string): Promise<Task> {
    try {
      const response = await API.post('/tasks/create', {
        title,
        description,
        userId,
        groupId
      });
      return response.data;
    } catch (error) {
      console.error('Create task error:', error);
      throw error;
    }
  }

  async getUserTasks(userId: string, groupId: string): Promise<Task[]> {
    try {
      const response = await API.get(`/tasks/user/${userId}/group/${groupId}`);
      return response.data;
    } catch (error) {
      console.error('Get user tasks error:', error);
      return [];
    }
  }

  async getGroupTasks(groupId: string): Promise<Task[]> {
    try {
      const response = await API.get(`/tasks/group/${groupId}`);
      return response.data;
    } catch (error) {
      console.error('Get group tasks error:', error);
      return [];
    }
  }

  async toggleTask(taskId: string): Promise<boolean> {
    try {
      await API.patch(`/tasks/${taskId}/toggle`);
      return true;
    } catch (error) {
      console.error('Toggle task error:', error);
      return false;
    }
  }
}

API.interceptors.request.use(request => {
  console.log('Starting Request', request);
  return request;
});

API.interceptors.response.use(response => {
  console.log('Response:', response);
  return response;
});

export default new DataService();