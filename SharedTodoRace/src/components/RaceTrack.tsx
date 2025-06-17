// src/components/RaceTrack.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { RaceProgress } from '../types';

interface Props {
  participants: RaceProgress[];
}

const RaceTrack: React.FC<Props> = ({ participants }) => {
  const trackWidth = 300;
  const maxTasks = Math.max(...participants.map(p => p.totalTasks), 1);

  const getPosition = (progress: number) => {
    return (progress / 100) * (trackWidth - 30);
  };

  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Race Progress</Text>
      
      {participants.map((participant, index) => (
        <View key={participant.userId} style={styles.trackContainer}>
          <View style={styles.participantInfo}>
            <Text style={styles.participantName}>{participant.username}</Text>
            <Text style={styles.taskCount}>
              {participant.completedTasks}/{participant.totalTasks} tasks
            </Text>
          </View>
          
          <View style={styles.track}>
            {/* Track background */}
            <View style={styles.trackBackground}>
              {/* Finish line */}
              <View style={styles.finishLine} />
              
              {/* Progress indicators (checkpoints) */}
              {Array.from({ length: Math.min(maxTasks, 10) }, (_, i) => (
                <View
                  key={i}
                  style={[
                    styles.checkpoint,
                    {
                      left: (i / Math.max(maxTasks - 1, 1)) * (trackWidth - 20),
                      backgroundColor: i < participant.completedTasks ? colors[index % colors.length] : '#E0E0E0'
                    }
                  ]}
                />
              ))}
            </View>
            
            {/* Runner/Character */}
            <View
              style={[
                styles.runner,
                {
                  left: getPosition(participant.progressPercentage),
                  backgroundColor: colors[index % colors.length]
                }
              ]}
            >
              <Text style={styles.runnerText}>🏃</Text>
            </View>
          </View>
          
          <Text style={styles.progressText}>
            {participant.progressPercentage.toFixed(1)}% Complete
          </Text>
        </View>
      ))}
      
      {participants.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No participants yet!</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  trackContainer: {
    marginBottom: 30,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  participantInfo: {
    marginBottom: 12,
  },
  participantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  taskCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  track: {
    height: 40,
    position: 'relative',
    marginVertical: 8,
  },
  trackBackground: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    position: 'relative',
    top: 16,
  },
  finishLine: {
    position: 'absolute',
    right: 0,
    top: -8,
    width: 3,
    height: 24,
    backgroundColor: '#FF0000',
  },
  checkpoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    top: 0,
  },
  runner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    top: 5,
  },
  runnerText: {
    fontSize: 16,
  },
  progressText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default RaceTrack;