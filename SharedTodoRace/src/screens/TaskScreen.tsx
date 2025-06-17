// src/screens/TaskScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  Alert
} from 'react-native';
import { User, Task } from '../types';
import DataService from '../services/DataService';

interface Props {
  user: User;
}

const TaskScreen: React.FC<Props> = ({ user }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [userGroups, setUserGroups] = useState<Group[]>([]);

  useEffect(() => {
    loadUserGroups();
  }, [user]);

  useEffect(() => {
    if (selectedGroup) {
      loadTasks();
    }
  }, [selectedGroup]);

  const loadUserGroups = async () => {
    try {
      const groups = await DataService.getUserGroups(user.id);
      setUserGroups(groups);
      if (groups.length > 0) {
        setSelectedGroup(groups[0].id);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load groups');
    }
  };

  const loadTasks = async () => {
    if (!selectedGroup) return;
    try {
      const tasks = await DataService.getUserTasks(user.id, selectedGroup);
      setTasks(tasks);
    } catch (error) {
      Alert.alert('Error', 'Failed to load tasks');
    }
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || !selectedGroup) return;

    try {
      await DataService.createTask(
        newTaskTitle,
        newTaskDescription,
        user.id,
        selectedGroup
      );
      setNewTaskTitle('');
      setNewTaskDescription('');
      loadTasks();
    } catch (error) {
      Alert.alert('Error', 'Failed to create task');
    }
  };

  const handleToggleTask = async (taskId: string) => {
    try {
      await DataService.toggleTask(taskId);
      loadTasks();
    } catch (error) {
      Alert.alert('Error', 'Failed to update task');
    }
  };

  const renderTaskItem = ({ item }: { item: Task }) => (
    <TouchableOpacity 
      style={styles.taskItem}
      onPress={() => handleToggleTask(item.id)}
    >
      <View style={styles.taskCheckbox}>
        {item.completed && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <View style={styles.taskContent}>
        <Text 
          style={[
            styles.taskTitle,
            item.completed && styles.completedTask
          ]}
        >
          {item.title}
        </Text>
        {item.description && (
          <Text style={styles.taskDescription}>{item.description}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {userGroups.length > 0 ? (
        <>
          <View style={styles.groupSelector}>
            {userGroups.map(group => (
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

          <FlatList
            data={tasks}
            renderItem={renderTaskItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.taskList}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No tasks yet. Add one below!</Text>
            }
          />

          <View style={styles.addTaskContainer}>
            <TextInput
              style={styles.taskInput}
              placeholder="Task title"
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              onSubmitEditing={handleAddTask}
            />
            <TextInput
              style={styles.taskInput}
              placeholder="Description (optional)"
              value={newTaskDescription}
              onChangeText={setNewTaskDescription}
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddTask}
              disabled={!newTaskTitle.trim()}
            >
              <Text style={styles.addButtonText}>Add Task</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>You're not in any groups yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Join or create a group to start adding tasks
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
  taskList: {
    flexGrow: 1,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  taskCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4ECDC4',
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#4ECDC4',
    fontWeight: 'bold',
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    color: '#333',
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  addTaskContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  taskInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 4,
    paddingHorizontal: 8,
    marginBottom: 8,
    backgroundColor: 'white',
  },
  addButton: {
    backgroundColor: '#4ECDC4',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default TaskScreen;