import React, { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Share, Book, Building4, MessageQuestion, Menu } from 'iconsax-react-native';
import HomeStack from '../stacks/HomeStack';
import EbookStack from '../stacks/EbookStack';
import SettingsStack from '../stacks/SettingsStack';
import FacilitiesStack from '@/stacks/FacilitiesStack';
import QuizStack from '@/stacks/QuizStack';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const [isSelfEnrolled, setIsSelfEnrolled] = useState<boolean | null>(null);

  useEffect(() => {
    const checkEnrollmentStatus = async () => {
      try {
        const selfEnrolled = await AsyncStorage.getItem('@self_enrolled');
        setIsSelfEnrolled(selfEnrolled === 'true');
      } catch (error) {
        console.error('Error reading enrollment status:', error);
        setIsSelfEnrolled(false);
      }
    };

    checkEnrollmentStatus();
  }, []);

  if (isSelfEnrolled === null) {
    return null;
  }

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
              return <Building4 size={24} color={color} variant={'Outline'} />;
            case 'MessageStack':
              return <MessageQuestion size={24} color={color} variant={'Outline'} />;
            case 'MenuStack':
              return <Menu size={24} color={color} variant={'Outline'} />;
            default:
              return null;
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
        tabBarLabel: ({ color }) => {
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
            default:
              label = '';
          }
          return (
            <Text
              style={{
                color,
                fontSize: 12,
                textAlign: 'center',
                marginTop: 2,
                lineHeight: 14,
                height: 28,
                paddingTop: 0,
              }}
            >
              {label}
            </Text>
          );
        },
      })}
    >
      {isSelfEnrolled ? (
        // Only show EbookStack and SettingsStack for self-enrolled users
        <>
          <Tab.Screen
            name="EbookStack"
            component={EbookStack}
          />
          <Tab.Screen
            name="MenuStack"
            component={SettingsStack}
          />
        </>
      ) : (
        // Show all tabs for non-self-enrolled users
        <>
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
        </>
      )}
    </Tab.Navigator>
  );
};

export default TabNavigator;