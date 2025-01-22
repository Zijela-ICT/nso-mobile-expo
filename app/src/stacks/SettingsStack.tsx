import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SettingsScreen from '../screens/Settings';
import ChangePasswordScreen from '@/screens/change-password';


export type SettingsStackParamList = {
  Settings: undefined;
  ChangePassword: undefined;
};

const Stack = createNativeStackNavigator<SettingsStackParamList>();
const SettingsStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ChangePassword" 
        component={ChangePasswordScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default SettingsStack;