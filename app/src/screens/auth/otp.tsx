import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import BackgroundContainer from '../../components/background-container';
import {CustomButton, CustomInput} from '../../components';
import {RootStackParamList} from '../../navigation/stack-navigator';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

type SignUpScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'OtpScreen'
>;
type OtpScreenRouteProp = RouteProp<RootStackParamList, 'OtpScreen'>;
const OtpScreen = () => {
  const navigation = useNavigation<SignUpScreenNavigationProp>();
  const route = useRoute<OtpScreenRouteProp>();
  const [otp, setOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(9 * 60); // 9 minutes in seconds
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerId);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timerId);
    }
  }, [timeLeft]);

  const handleProceed = () => {
    // Handle OTP verification logic here
    navigation.navigate('SetupPassword', {
      email: route.params.email,
      regNumber: route.params.regNumber,
      otp,
    });
  };

  const handleResendOTP = () => {
    if (canResend) {
      // Add your resend OTP logic here
      setTimeLeft(9 * 60); // Reset timer to 9 minutes
      setCanResend(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1}}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <BackgroundContainer
          backgroundImage={require('../../assets/bg-one.png')}>
          <Text style={styles.title}>OTP</Text>
          <Text style={styles.subTitle}>
            An OTP has been sent to{' '}
            <Text style={styles.strongText}>{route.params.email}</Text>
          </Text>

          <CustomInput
            label="OTP"
            placeholder="Enter OTP"
            placeholderTextColor="#EAECF0"
            value={otp}
            onChangeText={setOtp}
            autoCapitalize="none"
            keyboardType="numeric"
            maxLength={6}
          />

          <CustomButton
            title="Proceed"
            onPress={handleProceed}
            disabled={otp.length === 0}
            isLoading={false}
            loadingText="Verifying..."
          />

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>
              {timeLeft > 0
                ? `OTP expires in ${formatTime(timeLeft)} mins `
                : 'OTP expired '}
            </Text>
            <TouchableOpacity onPress={handleResendOTP} disabled={!canResend}>
              <Text
                style={[styles.loginLink, !canResend && styles.disabledLink]}>
                Resend OTP
              </Text>
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
  },
  subTitle: {
    marginBottom: 24,
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    fontWeight: '400',
  },
  strongText: {
    fontWeight: '500',
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
  disabledLink: {
    opacity: 0.5,
  },
});

export default OtpScreen;
