import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ClinicalDecisions from '../screens/ClinicalDecisions';
import DynamicFlow from '../screens/DynamicFlow';

export type HomeStackParamList = {
  ClinicalDecision: undefined;
  DynamicFlow: {
    chapter: any;
    chapterIndex: number;
  };
  Detail: {id: string};
};

const Stack = createNativeStackNavigator<HomeStackParamList>();


const HomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ClinicalDecision"
        component={ClinicalDecisions}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="DynamicFlow"
        component={DynamicFlow}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default HomeStack;
