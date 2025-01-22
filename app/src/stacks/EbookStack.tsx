import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import EbookScreen from '../screens/Ebook';

const Stack = createNativeStackNavigator();

const EbookStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Ebook"
        component={EbookScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default EbookStack;
