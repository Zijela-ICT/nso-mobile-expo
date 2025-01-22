import {Buffer} from 'buffer';

if (!global.Buffer) {
  global.Buffer = Buffer; // Set Buffer globally
}

import React from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {ScreenDimensionsProvider} from ';
import StatusBarConfig from './src/utils/StatusBarConfig';
import Toast from 'react-native-toast-message';
import {NavigationContainer} from '@react-navigation/native';
import {QueryClient, QueryClientProvider} from 'react-query';
import RootNavigator from '@/navigation/RootNavigator';
import {AuthProvider} from '@/contexts/auth.context';
import AuthInitializer from '@/navigation/AuthInitializer';

const App: React.FC = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StatusBarConfig />
        <GestureHandlerRootView style={{flex: 1}}>
          <ScreenDimensionsProvider>
            <NavigationContainer>
              <AuthInitializer>
                <RootNavigator />
              </AuthInitializer>
            </NavigationContainer>
            <Toast />
          </ScreenDimensionsProvider>
        </GestureHandlerRootView>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
