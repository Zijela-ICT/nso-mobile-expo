import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Facilities from '@/screens/Facilities';
import ClinicalDecisions from '@/screens/ClinicalDecisions';

export type FacilitiesStackParamList = {
  Facilities: undefined;
};

const Stack = createNativeStackNavigator<FacilitiesStackParamList>();


const FacilitiesStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Facilities"
        component={Facilities}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default FacilitiesStack;
