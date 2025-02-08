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
import { showToast } from '@/utils/toast';
import { useTwoFaRollback } from '@/hooks/api/mutations/auth';

interface TwoFATokenModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (token: string) => void;
  isLoading?: boolean;
  email?: string;
  password?: string;
}

export const TwoFATokenModal: React.FC<TwoFATokenModalProps> = ({
  isVisible,
  onClose,
  onSubmit,
  isLoading = false,
  email,
  password,
}) => {
  const [token, setToken] = useState('');
  const [showBackupCode, setShowBackupCode] = useState(false);
  const twoFaRollback = useTwoFaRollback();

  const handleSubmit = () => {
    if (token.trim()) {
      if (showBackupCode && email && password) {
        console.log('email', email, password, token);
        // Handle backup code submission
        twoFaRollback.mutate(
          {
            email,
            password,
            backupCode: token,
          },
          {
            onSuccess: () => {
              showToast('Successfully reverted to email authentication', 'success');
              setShowBackupCode(false);
              setToken('');
              onClose();
            },
            onError: (error) => {
              showToast(error.message || 'Invalid backup code', 'error');
            },
          }
        );
      } else {
        // Handle regular 2FA code submission
        onSubmit(token);
        setToken('');
      }
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
            {showBackupCode
              ? 'Enter your backup code to revert to email authentication'
              : 'Please enter the verification code sent to your email or authenticator app'}
          </Text>

          <CustomInput
            label={showBackupCode ? "Backup Code" : "Verification Code"}
            placeholder={showBackupCode ? "Enter backup code" : "Enter code"}
            placeholderTextColor='#333'
            inputStyle={{ color: "#000" }}
            value={token}
            onChangeText={setToken}
            keyboardType="default"
            autoCapitalize="none"
          />

          {!showBackupCode && (
            <TouchableOpacity 
              onPress={() => setShowBackupCode(true)}
              style={styles.backupCodeLink}>
              <Text style={styles.backupCodeText}>
                Lost access to authenticator? Use backup code
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.buttonContainer}>
            <CustomButton
              title={showBackupCode ? "Revert to Email" : "Submit"}
              onPress={handleSubmit}
              isLoading={isLoading || twoFaRollback.isLoading}
              loadingText={showBackupCode ? "Reverting..." : "Verifying..."}
              disabled={!token.trim() || isLoading || twoFaRollback.isLoading}
            />
            <TouchableOpacity 
              onPress={() => {
                setShowBackupCode(false);
                setToken('');
                onClose();
                setShowBackupCode(false);
              }}
              style={styles.cancelButton}
              disabled={isLoading || twoFaRollback.isLoading}>
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
  backupCodeLink: {
    marginTop: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  backupCodeText: {
    color: '#12B76A',
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});