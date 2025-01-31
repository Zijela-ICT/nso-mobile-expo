import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import EbookScreen from '../screens/Ebook';
import Quiz from '@/screens/Quiz';


export type QuizStackParamList = {
  Quiz: undefined;
};

const Stack = createNativeStackNavigator<QuizStackParamList>();

const QuizStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Quiz"
        component={Quiz}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default QuizStack;
