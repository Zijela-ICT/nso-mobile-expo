import { Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

const checkInternetConnectivity = async (showAlert = true, defaultMessage?: string | undefined): Promise<boolean> => {
  if (!defaultMessage) {
    defaultMessage = `Internet connectivity is required for this feature`;
  }
  try {
    const state = await NetInfo.fetch();
    const isConnected: boolean | null = state.isConnected;

    if (!isConnected && showAlert) {
      Alert.alert("Internet Connection", defaultMessage);
    }

    return isConnected ?? false;
  } catch (error) {
    return false;
  }
};

export default checkInternetConnectivity;
