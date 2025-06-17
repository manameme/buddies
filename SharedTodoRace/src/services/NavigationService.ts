// Create a file navigationTypes.ts
import { StackNavigationProp } from '@react-navigation/stack';

export type RootStackParamList = {
  GroupScreen: undefined;
  GroupDetails: { groupId: string; showRequests?: boolean };
  CreateGroup: undefined;
  JoinGroup: undefined;
  // Add other screens as needed
};

export type GroupScreenNavigationProp = StackNavigationProp<RootStackParamList, 'GroupScreen'>;