import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import EbookScreen from "../screens/Ebook";
import Quiz from "@/screens/Quiz";
import { QuizQuestions } from "@/screens/QuizQuestion";

export type QuizStackParamList = {
  Quiz: undefined;
  QuizQuestions: {
    assessmentId: number;
    duration: number;
    quizName: string;
  };
};

const Stack = createNativeStackNavigator<QuizStackParamList>();

const QuizStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Quiz"
        component={Quiz}
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="QuizQuestions"
        component={QuizQuestions}
        options={{
          headerShown: false
        }}
      />
    </Stack.Navigator>
  );
};

export default QuizStack;
