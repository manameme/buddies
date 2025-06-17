// src/screens/JoinGroupScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { User, Group } from '../types';
import DataService from '../services/DataService';

interface Props {
  user: User;
  onBack: () => void;
  onSuccess: () => void;
}

const JoinGroupScreen: React.FC<Props> = ({ user, onBack, onSuccess }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [requestSent, setRequestSent] = useState<string[]>([]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Error', 'Please enter a group name to search');
      return;
    }

    setLoading(true);
    try {
      const results = await DataService.searchGroups(searchQuery.trim());
      
      // Filter out groups where user is already a member
      const filteredResults = results.filter(group => 
        !group.members.some(member => member.userId === user.id)
      );
      
      setSearchResults(filteredResults);
      
      if (filteredResults.length === 0) {
        Alert.alert('No Results', 'No groups found with that name.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to search groups. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRequest = async (group: Group) => {
    try {
      await DataService.createJoinRequest(group.id, user.id);
      setRequestSent([...requestSent, group.id]);
      Alert.alert(
        'Request Sent!', 
        `Your request to join "${group.name}" has been sent to the group creator.`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to send join request. Please try again.');
    }
  };

  const renderGroupItem = ({ item }: { item: Group }) => {
    const hasRequestSent = requestSent.includes(item.id);
    const creatorName = item.members.find(m => m.userId === item.creatorId)?.username;
    
    return (
      <View style={styles.groupItem}>
        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>{item.name}</Text>
          <Text style={styles.groupCreator}>Created by: {creatorName}</Text>
          <Text style={styles.memberCount}>
            {item.members.filter(m => m.status === 'accepted').length} members
          </Text>
        </View>
        
        <TouchableOpacity
          style={[
            styles.joinButton,
            hasRequestSent && styles.requestSentButton
          ]}
          onPress={() => handleJoinRequest(item)}
          disabled={hasRequestSent}
        >
          <Text style={[
            styles.joinButtonText,
            hasRequestSent && styles.requestSentButtonText
          ]}>
            {hasRequestSent ? 'Request Sent' : 'Request to Join'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Join Group</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>🔍 Find a Group</Text>
        <Text style={styles.subtitle}>
          Search for existing groups by name and request to join the race!
        </Text>
        
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for group name"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="words"
            autoCorrect={false}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}
            disabled={loading}
          >
            <Text style={styles.searchButtonText}>
              {loading ? 'Searching...' : 'Search'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.resultsContainer}>
          {searchResults.length > 0 ? (
            <>
              <Text style={styles.resultsTitle}>Search Results</Text>
              <FlatList
                data={searchResults}
                renderItem={renderGroupItem}
                keyExtractor={(item) => item.id}
                style={styles.resultsList}
              />
            </>
          ) : searchQuery && !loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No groups found</Text>
              <Text style={styles.emptySubtext}>
                Try searching with different keywords or ask your friends for the exact group name.
              </Text>
            </View>
          ) : (
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsTitle}>How to Join</Text>
              <Text style={styles.instructionsText}>
                1. Ask your friends for their group name{'\n'}
                2. Search for the group using the exact name{'\n'}
                3. Send a join request{'\n'}
                4. Wait for the group creator to approve your request
              </Text>
            </View>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F5F5F5',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 20,
      backgroundColor: 'white',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    backButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    backButtonText: {
      fontSize: 16,
      color: '#4ECDC4',
      fontWeight: '600',
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#333',
    },
    placeholder: {
      width: 80,
    },
    content: {
      flex: 1,
      paddingHorizontal: 32,
      paddingTop: 40,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 8,
      color: '#333',
    },
    subtitle: {
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 40,
      color: '#666',
      lineHeight: 22,
    },
    searchContainer: {
      flexDirection: 'row',
      marginBottom: 32,
    },
    searchInput: {
      flex: 1,
      height: 50,
      borderWidth: 1,
      borderColor: '#DDD',
      borderRadius: 8,
      paddingHorizontal: 16,
      fontSize: 16,
      backgroundColor: 'white',
      marginRight: 10,
    },
    searchButton: {
      width: 100,
      height: 50,
      backgroundColor: '#4ECDC4',
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    searchButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: 'white',
    },
    resultsContainer: {
      flex: 1,
    },
    resultsTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#333',
      marginBottom: 16,
    },
    resultsList: {
      flex: 1,
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
    groupName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 4,
    },
    groupCreator: {
      fontSize: 14,
      color: '#666',
      marginBottom: 4,
    },
    memberCount: {
      fontSize: 14,
      color: '#4ECDC4',
    },
    joinButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: '#4ECDC4',
      borderRadius: 20,
    },
    joinButtonText: {
      color: 'white',
      fontWeight: '600',
    },
    requestSentButton: {
      backgroundColor: '#DDD',
    },
    requestSentButtonText: {
      color: '#666',
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: '600',
      color: '#333',
      marginBottom: 8,
      textAlign: 'center',
    },
    emptySubtext: {
      fontSize: 14,
      color: '#666',
      textAlign: 'center',
      lineHeight: 20,
    },
    instructionsContainer: {
      backgroundColor: 'white',
      padding: 20,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    instructionsTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 12,
    },
    instructionsText: {
      fontSize: 14,
      color: '#666',
      lineHeight: 20,
    },
  });
  
  export default JoinGroupScreen;