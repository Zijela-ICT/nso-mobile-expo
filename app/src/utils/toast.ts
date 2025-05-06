import Toast, {ToastPosition} from 'react-native-toast-message';

export const showToast = (
  message?: string,
  type: 'success' | 'error' | 'info' = 'success',
  position: ToastPosition = 'top',
) => {
  Toast.show({
    type: type,
    text1: message,
    position,
  });
};

export default showToast