// Login.tsx
import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import BackgroundContainer from '../../components/background-container';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../navigation/stack-navigator';
import {CustomButton, CustomInput} from '../../components';

type ForgotPasswordNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ForgotPassword'
>;

const ForgotPassword = () => {
  const navigation = useNavigation<ForgotPasswordNavigationProp>();
  const [registrationNumber, setRegistrationNumber] = useState('');

  const handleProceed = () => {
    // Handle registration logic here
    navigation.navigate('OtpScreen')
    console.log('Registration number:', registrationNumber);
  };

  return (
    <BackgroundContainer
      backgroundImage={require('../../assets/bg-one.png')}
      >
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.subTitle}>
      Forgot your password? No problem at all, let’s help setup a new one by inputting your Email
      </Text>

      <CustomInput
        label="Email"
        placeholder="Enter email address"
        placeholderTextColor="#EAECF0"
        value={registrationNumber}
        onChangeText={setRegistrationNumber}
        autoCapitalize="none"
      />

      <CustomButton
        title="Proceed"
        onPress={handleProceed}
        disabled={registrationNumber.length === 0}
        isLoading={false}
        loadingText="verifying..."
      />

      <View style={styles.loginContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLink}> Back to Login</Text>
        </TouchableOpacity>
      </View>
    </BackgroundContainer>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    color: 'white',
    marginBottom: 4,
  },
  subTitle: {
    marginBottom: 24,
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    fontWeight: '400',
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#FCFCFD',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#EAECF0',
    backgroundColor: 'transparent',
    borderColor: '#D0D5DD',
    borderWidth: 1,
  },
  button: {
    backgroundColor: '#E5E5E5',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  forgot: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
    textAlign:"right",
    marginBottom: 24,
  },
  buttonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  loginText: {
    color: 'white',
    fontSize: 14,
  },
  loginLink: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default ForgotPassword;
