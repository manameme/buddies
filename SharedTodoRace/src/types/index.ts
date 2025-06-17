// src/types/index.ts

export interface User {
    id: string;
    username: string;
    createdAt: Date;
  }
  
  export interface Task {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    userId: string;
    groupId: string;
    createdAt: Date;
    completedAt?: Date;
  }
  
  export interface Group {
    id: string;
    name: string;
    creatorId: string;
    members: GroupMember[];
    createdAt: Date;
  }
  
  export interface GroupMember {
    userId: string;
    username: string;
    joinedAt: Date;
    status: 'pending' | 'accepted' | 'rejected';
  }
  
  export interface JoinRequest {
    id: string;
    groupId: string;
    userId: string;
    username: string;
    groupName: string; // Add this
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: Date;
  }
  
  export interface RaceProgress {
    userId: string;
    username: string;
    completedTasks: number;
    totalTasks: number;
    progressPercentage: number;
  }