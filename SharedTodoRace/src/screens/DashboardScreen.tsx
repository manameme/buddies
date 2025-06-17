// src/screens/DashboardScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { User, Group } from '../types';
import DataService from '../services/DataService';
import RaceTrack from '../components/RaceTrack';

interface Props {
  user: User;
}

const DashboardScreen: React.FC<Props> = ({ user }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [raceProgress, setRaceProgress] = useState<RaceProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserGroups();
  }, [user]);

  useEffect(() => {
    if (selectedGroup) {
      calculateRaceProgress();
    }
  }, [selectedGroup]);

  const loadUserGroups = async () => {
    try {
      const userGroups = await DataService.getUserGroups(user.id);
      setGroups(userGroups);
      if (userGroups.length > 0) {
        setSelectedGroup(userGroups[0].id);
      }
    } catch (error) {
      console.error('Failed to load groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRaceProgress = async () => {
    if (!selectedGroup) return;
    
    setLoading(true);
    try {
      const group = await DataService.getGroupById(selectedGroup);
      if (!group) return;

      const tasks = await DataService.getGroupTasks(selectedGroup);
      
      const progress: RaceProgress[] = group.members
        .filter(m => m.status === 'accepted')
        .map(member => {
          const memberTasks = tasks.filter(t => t.userId === member.userId);
          const completed = memberTasks.filter(t => t.completed).length;
          const total = memberTasks.length;
          
          return {
            userId: member.userId,
            username: member.username,
            completedTasks: completed,
            totalTasks: total || 1, // Avoid division by zero
            progressPercentage: (completed / (total || 1)) * 100
          };
        });

      setRaceProgress(progress);
    } catch (error) {
      console.error('Failed to calculate progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4ECDC4" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {groups.length > 0 ? (
        <>
          <View style={styles.groupSelector}>
            {groups.map(group => (
              <TouchableOpacity
                key={group.id}
                style={[
                  styles.groupButton,
                  selectedGroup === group.id && styles.selectedGroupButton
                ]}
                onPress={() => setSelectedGroup(group.id)}
              >
                <Text 
                  style={[
                    styles.groupButtonText,
                    selectedGroup === group.id && styles.selectedGroupButtonText
                  ]}
                >
                  {group.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <RaceTrack participants={raceProgress} />
        </>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>You're not in any groups yet</Text>
          <Text style={styles.emptySubtext}>
            Join or create a group to start racing with friends!
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  groupButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedGroupButton: {
    backgroundColor: '#4ECDC4',
  },
  groupButtonText: {
    color: '#333',
  },
  selectedGroupButtonText: {
    color: 'white',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default DashboardScreen;