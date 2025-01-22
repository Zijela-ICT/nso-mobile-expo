// SignUpScreen.tsx
import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import BackgroundContainer from '../../components/background-container';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../navigation/stack-navigator';
import {CustomButton, CustomInput} from '../../components';
import {useInitiateSignup} from '@/hooks/api/mutations/auth';

type SignUpScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Signup'
>;

const SignUpScreen = () => {
  const initiateSignup = useInitiateSignup();
  const navigation = useNavigation<SignUpScreenNavigationProp>();
  const [registrationNumber, setRegistrationNumber] = useState('');

  const handleProceed = async () => {
    // Handle registration logic here
    initiateSignup.mutateAsync(
      {
        regNumber: parseInt(registrationNumber),
      },
      {
        onSuccess: data => {
          console.log('data', data)
          navigation.navigate('OtpScreen', {
            email: data.data.email,
            regNumber: data.data.regNumber,
          });
        },
      },
    );
  };

  return (
    <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{flex: 1}}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <BackgroundContainer backgroundImage={require('../../assets/bg-one.png')}>
      <Text style={styles.title}>Sign Up</Text>

      <CustomInput
        label="index/Registration Number"
        placeholder="Enter Index/Registration Number"
        placeholderTextColor="#EAECF0"
        keyboardType="numeric"
        value={registrationNumber}
        onChangeText={setRegistrationNumber}
        autoCapitalize="none"
      />

      <CustomButton
        title="Proceed"
        onPress={handleProceed}
        disabled={registrationNumber.length === 0}
        isLoading={initiateSignup.isLoading}
        loadingText="Verifying..."
      />

      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLink}>Login</Text>
        </TouchableOpacity>
      </View>
    </BackgroundContainer>
    </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    color: 'white',
    marginBottom: 24,
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

export default SignUpScreen;
