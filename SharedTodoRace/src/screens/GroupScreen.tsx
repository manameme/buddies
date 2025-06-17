//src/screens/GroupScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { User, Group, JoinRequest } from '../types';
import DataService from '../services/DataService';
import { useNavigation } from '@react-navigation/native';
import { initSocket, disconnectSocket } from '../services/NotificationService';
import { useSocket } from '../context/SocketContext';
import { GroupScreenNavigationProp } from '../services/NavigationService';


interface Props {
  user: User;
}

const GroupScreen: React.FC<Props> = ({ user }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [pendingRequests, setPendingRequests] = useState<JoinRequest[]>([]);
  const socket = useSocket();
  const navigation = useNavigation<GroupScreenNavigationProp>();

  useEffect(() => {
    initSocket(user.id);
  
    const handleNewJoinRequest = (data: JoinRequest) => {
      Alert.alert(
        'New Join Request',
        `${data.username} wants to join ${data.groupName}`,
        [
          { 
            text: 'View', 
            onPress: () => {
              navigation.navigate('GroupDetails', { 
                groupId: data.groupId,
                showRequests: true
              });
            }
          },
          { text: 'OK' }
        ]
      );
      loadPendingRequests();
    };
  
    if (socket) {
      socket.on('newJoinRequest', handleNewJoinRequest);
    }
  
    return () => {
      disconnectSocket();
      if (socket) {
        socket.off('newJoinRequest', handleNewJoinRequest);
      }
    };
  }, [user.id, socket, navigation]);

  useEffect(() => {
    loadGroups();
    loadPendingRequests();
  }, [user]);

  const loadGroups = async () => {
    try {
      const userGroups = await DataService.getUserGroups(user.id);
      setGroups(userGroups);
    } catch (error) {
      Alert.alert('Error', 'Failed to load groups');
    }
  };

  const loadPendingRequests = async () => {
    try {
      const requests = await DataService.getPendingRequestsForUser(user.id);
      setPendingRequests(requests);
    } catch (error) {
      Alert.alert('Error', 'Failed to load join requests');
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await DataService.acceptJoinRequest(requestId);
      loadGroups();
      loadPendingRequests();
      Alert.alert('Success', 'You have joined the group!');
    } catch (error) {
      Alert.alert('Error', 'Failed to accept request');
    }
  };

  const renderGroupItem = ({ item }: { item: Group }) => (
    <TouchableOpacity 
      style={styles.groupItem}
      onPress={() => navigation.navigate('GroupDetails', { groupId: item.id })}
    >
      <View style={styles.groupInfo}>
        <Text style={styles.groupName}>{item.name}</Text>
        <Text style={styles.memberCount}>
          {item.members.filter(m => m.status === 'accepted').length} members
        </Text>
      </View>
      {item.creatorId === user.id && (
        <Text style={styles.adminBadge}>Admin</Text>
      )}
    </TouchableOpacity>
  );

  const renderRequestItem = ({ item }: { item: JoinRequest }) => (
    <View style={styles.requestItem}>
      <View style={styles.requestInfo}>
        <Text style={styles.requestText}>
          Invite to join <Text style={styles.groupName}>{item.groupName}</Text>
        </Text>
      </View>
      <TouchableOpacity
        style={styles.acceptButton}
        onPress={() => handleAcceptRequest(item.id)}
      >
        <Text style={styles.acceptButtonText}>Accept</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {pendingRequests.length > 0 && (
        <View style={styles.requestsSection}>
          <Text style={styles.sectionTitle}>Pending Invitations</Text>
          <FlatList
            data={pendingRequests}
            renderItem={renderRequestItem}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.requestsList}
          />
        </View>
      )}

      <Text style={styles.sectionTitle}>Your Groups</Text>
      <FlatList
        data={groups}
        renderItem={renderGroupItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.groupList}
        ListEmptyComponent={
          <Text style={styles.emptyText}>You're not in any groups yet</Text>
        }
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('CreateGroup')}
        >
          <Text style={styles.buttonText}>Create Group</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.joinButton]}
          onPress={() => navigation.navigate('JoinGroup')}
        >
          <Text style={[styles.buttonText, styles.joinButtonText]}>Join Group</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  requestsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  requestsList: {
    paddingBottom: 8,
  },
  requestItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginRight: 12,
    width: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  requestInfo: {
    marginBottom: 12,
  },
  requestText: {
    fontSize: 14,
    color: '#666',
  },
  groupName: {
    fontWeight: 'bold',
    color: '#333',
  },
  acceptButton: {
    backgroundColor: '#4ECDC4',
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  groupList: {
    flexGrow: 1,
  },
  groupItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  groupInfo: {
    flex: 1,
  },
  memberCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  adminBadge: {
    backgroundColor: '#4ECDC4',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    backgroundColor: '#4ECDC4',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  joinButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  joinButtonText: {
    color: '#4ECDC4',
  },
});

export default GroupScreen;