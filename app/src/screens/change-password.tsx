import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  TouchableOpacity,
  Modal,
} from 'react-native';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {Header, CustomInput, CustomButton} from '@/components';
import {useNavigation} from '@react-navigation/native';
import {ArrowLeft} from 'iconsax-react-native';
import {useChangePassword} from '@/hooks/api/mutations/auth';

// Password validation function

const ChangePasswordSchema = Yup.object().shape({
  currentPassword: Yup.string().required('Current password is required'),
  newPassword: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    ),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Confirm password is required'),
});

const ChangePasswordScreen = () => {
  const changePassword = useChangePassword();
  const navigation = useNavigation();
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [twoFAToken, setTwoFAToken] = useState('');
  const [pendingPasswordChange, setPendingPasswordChange] = useState<{
    oldPassword: string;
    newPassword: string;
  } | null>(null);

  const handleBack = () => {
    navigation.goBack();
  };

  const handlePasswordChange = async (values: {
    oldPassword: string;
    newPassword: string;
    twoFAToken?: string;
  }) => {
    await changePassword.mutateAsync(values, {
      onSuccess: () => {
        setShowTokenModal(false);
        setPendingPasswordChange(null);
        setTwoFAToken('');
        Alert.alert('Success', 'Password changed successfully', [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            },
          },
        ]);
      },
      onError: error => {
        if (error?.response?.data?.message?.toLowerCase().includes('token')) {
          setPendingPasswordChange({
            oldPassword: values.oldPassword,
            newPassword: values.newPassword,
          });
          setShowTokenModal(true);
        } else {
          Alert.alert(
            'Error',
            error?.response?.data?.message || 'An error occurred',
          );
        }
      },
    });
  };

  const formik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: ChangePasswordSchema,
    onSubmit: async values => {
      await handlePasswordChange({
        oldPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
    },
  });

  const handleTokenSubmit = async () => {
    if (pendingPasswordChange && twoFAToken) {
      await handlePasswordChange({
        ...pendingPasswordChange,
        twoFAToken,
      });
    }
  };

  const renderTokenModal = () => (
    <Modal
      visible={showTokenModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowTokenModal(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Two-Factor Authentication</Text>
          <Text style={styles.modalDescription}>
            Please enter the token sent to your email to complete password
            change
          </Text>
          <CustomInput
            label="Token"
            value={twoFAToken}
            onChangeText={setTwoFAToken}
            placeholder="Enter token"
            keyboardType="number-pad"
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowTokenModal(false);
                setPendingPasswordChange(null);
                setTwoFAToken('');
              }}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <CustomButton
              title="Submit"
              onPress={handleTokenSubmit}
              disabled={!twoFAToken}
              isLoading={changePassword.isLoading}>
              Submit
            </CustomButton>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <View style={styles.container}>
        <View style={styles.headerSection}>
          <TouchableOpacity onPress={handleBack} style={{paddingTop: 4}}>
            <ArrowLeft size={24} color="#1D2939" />
          </TouchableOpacity>
          <Text style={styles.title}>Change Password</Text>
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <CustomInput
            label="Current Password"
            labelStyle={styles.label}
            iconColor="#667085"
            placeholder="Enter your current password"
            placeholderTextColor="#667085"
            value={formik.values.currentPassword}
            onChangeText={formik.handleChange('currentPassword')}
            inputStyle={{color: '#101828'}}
            onBlur={formik.handleBlur('currentPassword')}
            secureTextEntry
            error={
              formik.touched.currentPassword
                ? formik.errors.currentPassword
                : undefined
            }
          />

          <CustomInput
            label="New Password"
            labelStyle={styles.label}
            iconColor="#667085"
            placeholder="Enter your new password"
            placeholderTextColor="#667085"
            inputStyle={{color: '#101828'}}
            value={formik.values.newPassword}
            onChangeText={formik.handleChange('newPassword')}
            onBlur={formik.handleBlur('newPassword')}
            secureTextEntry
            error={
              formik.touched.newPassword ? formik.errors.newPassword : undefined
            }
          />
          <CustomInput
            label="Confirm New Password"
            iconColor="#667085"
            labelStyle={styles.label}
            placeholder="Confirm your new password"
            inputStyle={{color: '#101828'}}
            placeholderTextColor="#667085"
            value={formik.values.confirmPassword}
            onChangeText={formik.handleChange('confirmPassword')}
            onBlur={formik.handleBlur('confirmPassword')}
            secureTextEntry
            error={
              formik.errors.confirmPassword
                ? formik.errors.confirmPassword
                : undefined
            }
          />
          <CustomButton
            title="Change Password"
            variant="primary"
            onPress={() => formik.handleSubmit()}
            disabled={!formik.isValid || !formik.dirty}
            isLoading={changePassword.isLoading}
            containerStyle={styles.submitButton}
            textStyle={styles.submitButtonText}
          />
        </ScrollView>
      </View>
      {renderTokenModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FFFB',
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFF',
  },
  headerSection: {
    flexDirection: 'row',
    alignContent: 'center',
    gap: 12,
    marginBottom: 20,
    marginTop: 10,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#101828',
  },
  label: {
    fontSize: 14,
    color: '#344054',
    fontWeight: '500',
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#344054',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 14,
    color: '#475467',
    marginBottom: 4,
  },
  submitButton: {
    marginTop: 24,
    paddingHorizontal: 12,
    height: 44,
    color: '#FFF',

    backgroundColor: '#0CA554',
    borderRadius: 8,
    paddingVertical: 12,
    // flex: 1,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#101828',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    color: '#667085',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flex: 1,
  },
  cancelButtonText: {
    color: '#101828',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default ChangePasswordScreen;
