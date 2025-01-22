/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/return-await */
import AsyncStorage from '@react-native-async-storage/async-storage';

const storageUtil = {
  store: async (key: string, value: string | any) => {
    await AsyncStorage.setItem(key, value);
  },
  get: async (key: string): Promise<string | null> => await AsyncStorage.getItem(key),
  delete: async (key: string) => {
    await AsyncStorage.removeItem(key);
  },
  clear: async () => {
    await AsyncStorage.clear();
  },
};

export { storageUtil };
