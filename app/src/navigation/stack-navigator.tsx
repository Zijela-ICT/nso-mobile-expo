import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import your screens here
import Signup from '../screens/auth/Signup';
import OtpScreen from '../screens/auth/otp';
import SetupPassword from '../screens/auth/setup-password';
import Login from '../screens/auth/login';
import ForgotPassword from '../screens/auth/forgot-password';

export type RootStackParamList = {
  Signup: undefined;
  OtpScreen:{
    email?: string;
    userType: string;
    regNumber?: string;
    payload?: {
      indexNumber: string |undefined ,
      firstName:string |undefined,
      lastName: string |undefined,
      email: string |undefined,
      cadre: string |undefined,
      password: string |undefined,
    }
  };
  SetupPassword: {
    email: string;
    regNumber: string;
    otp: string;
  };
  Login: undefined;
  ForgotPassword: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const StackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Signup"
        component={Signup}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OtpScreen"
        component={OtpScreen}
        options={{ headerShown: false }}
      />
       <Stack.Screen
        name="SetupPassword"
        component={SetupPassword}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={Login}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPassword}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default StackNavigator;
