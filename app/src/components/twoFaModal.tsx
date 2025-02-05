import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { CustomInput, CustomButton } from './index';

interface TwoFATokenModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (token: string) => void;
  isLoading?: boolean;
}

export const TwoFATokenModal: React.FC<TwoFATokenModalProps> = ({
  isVisible,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [token, setToken] = useState('');

  const handleSubmit = () => {
    if (token.trim()) {
      onSubmit(token);
      setToken('');
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Two-Factor Authentication</Text>
          <Text style={styles.modalDescription}>
            Please enter the verification code sent to your email
          </Text>

          <CustomInput
            label="Verification Code"
            placeholder="Enter code"
            inputStyle={{ color: "#000" }}
            value={token}
            onChangeText={setToken}
            keyboardType="number-pad"
            autoCapitalize="none"
          />

          <View style={styles.buttonContainer}>
            <CustomButton
              title="Submit"
              onPress={handleSubmit}
              isLoading={isLoading}
              loadingText="Verifying..."
              disabled={!token.trim() || isLoading}
            />
            <TouchableOpacity 
              onPress={onClose}
              style={styles.cancelButton}
              disabled={isLoading}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    color: '#1A1A1A',
  },
  modalDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  buttonContainer: {
    gap: 12,
    marginTop: 12,
  },
  cancelButton: {
    padding: 12,
    alignItems: 'center',
  },
  cancelText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
});
