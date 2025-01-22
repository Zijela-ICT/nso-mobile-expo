import {Buffer} from 'buffer';

if (!global.Buffer) {
  global.Buffer = Buffer; // Set Buffer globally
}

import React, { useEffect } from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {ScreenDimensionsProvider} from '@/contexts/screenDimensions.context';
import StatusBarConfig from '@/utils/StatusBarConfig';
import Toast from 'react-native-toast-message';
import {QueryClient, QueryClientProvider} from 'react-query';
import * as SplashScreen from 'expo-splash-screen';
import RootNavigator from '@/navigation/RootNavigator';
import {AuthProvider} from '@/contexts/auth.context';
import AuthInitializer from '@/navigation/AuthInitializer';
import { useFonts } from 'expo-font';

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: false,
      },
    },
  });

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StatusBarConfig />
        <GestureHandlerRootView style={{flex: 1}}>
          <ScreenDimensionsProvider>
            <AuthInitializer>
              <RootNavigator />
            </AuthInitializer>
            <Toast />
          </ScreenDimensionsProvider>
        </GestureHandlerRootView>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default RootLayout;