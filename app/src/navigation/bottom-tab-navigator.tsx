import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Share, Book, Building4, MessageQuestion, Menu } from 'iconsax-react-native';
import HomeStack from '../stacks/HomeStack';
import EbookStack from '../stacks/EbookStack';
import SettingsStack from '../stacks/SettingsStack';
import FacilitiesStack from '@/stacks/FacilitiesStack';
import QuizStack from '@/stacks/QuizStack';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          switch (route.name) {
            case 'HomeStack':
              return <Share size={24} color={color} variant={'Outline'} />;
            case 'EbookStack':
              return <Book size={24} color={color} variant={'Outline'} />;
            case 'BuildingStack':
              return <Building4 size={24} color={color} variant={ 'Outline'} />;
            case 'MessageStack':
              return <MessageQuestion size={24} color={color} variant={'Outline'} />;
            case 'MenuStack':
              return <Menu size={24} color={color} variant={'Outline'} />;
          }
        },
        tabBarActiveTintColor: '#0CA554',
        tabBarInactiveTintColor: '#98A2B3',
        tabBarStyle: {
          height: 90,
          paddingBottom: 25,
          paddingTop: 10,
        },
        headerShown: false,
        // eslint-disable-next-line react/no-unstable-nested-components
        tabBarLabel: ({  color }) => {
          let label = '';

          switch (route.name) {
            case 'HomeStack':
              label = 'Sections';
              break;
            case 'EbookStack':
              label = 'Standing\nOrder';
              break;
            case 'BuildingStack':
              label = 'Nearby\nFacilities';
              break;
            case 'MessageStack':
              label = 'Quiz';
              break;
            case 'MenuStack':
              label = 'More';
              break;
          }
          return (
            <Text
              style={{
                color,
                fontSize: 12,
                textAlign: 'center',
                marginTop: 2,
                lineHeight: 14,
                height: 28, // Fixed height for all labels
                paddingTop:  0, // Add padding for single-line labels
              }}
            >
              {label}
            </Text>
          );
        },
      })}
    >
      <Tab.Screen
        name="HomeStack"
        component={HomeStack}
      />
      <Tab.Screen
        name="EbookStack"
        component={EbookStack}
      />
      <Tab.Screen
        name="BuildingStack"
        component={FacilitiesStack}
      />
      <Tab.Screen
        name="MessageStack"
        component={QuizStack}
      />
      <Tab.Screen
        name="MenuStack"
        component={SettingsStack}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
