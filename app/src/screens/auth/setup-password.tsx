import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import BackgroundContainer from '../../components/background-container';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../navigation/stack-navigator';
import {CustomButton, CustomInput} from '../../components';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {useSignup} from '@/hooks/api/mutations/auth';

type SetupPasswordNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SetupPassword'
>;

type OtpScreenRouteProp = RouteProp<RootStackParamList, 'SetupPassword'>;

// Password validation schema
const PasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    ),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
});

const SetupPassword = () => {
  const signup = useSignup();
  const route = useRoute<OtpScreenRouteProp>();
  const navigation = useNavigation<SetupPasswordNavigationProp>();

  const {email, regNumber, otp} = route.params; // Retrieve email and regNumber from previous screens

  const formik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validationSchema: PasswordSchema,
    onSubmit: values => {
      signup.mutate(
        {
          regNumber: regNumber,
          email: email,
          otp: otp,
          password: values.password,
        },
        {
          onSuccess: data => {
            navigation.navigate('Login');
          },
        },
      );
      // Handle password setup logic here
    },
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1}}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <BackgroundContainer
          backgroundImage={require('../../assets/bg-one.png')}
          formHeight="60%">
          <Text style={styles.title}>Setup Password</Text>
          <Text style={styles.subTitle}>
            Set strong password to secure your information
          </Text>

          <CustomInput
            label="Password"
            placeholder="Enter password"
            secureTextEntry
            placeholderTextColor="#EAECF0"
            value={formik.values.password}
            onChangeText={formik.handleChange('password')}
            onBlur={formik.handleBlur('password')}
            autoCapitalize="none"
            error={formik.touched.password ? formik.errors.password : undefined}
          />

          <CustomInput
            label="Confirm Password"
            placeholder="Re-enter password"
            secureTextEntry
            placeholderTextColor="#EAECF0"
            value={formik.values.confirmPassword}
            onChangeText={formik.handleChange('confirmPassword')}
            onBlur={formik.handleBlur('confirmPassword')}
            autoCapitalize="none"
            error={
              formik.touched.confirmPassword
                ? formik.errors.confirmPassword
                : undefined
            }
          />

          <CustomButton
            title="Proceed"
            onPress={formik.handleSubmit}
            disabled={!formik.isValid || !formik.dirty}
            isLoading={signup.isLoading}
            loadingText="Setting up..."
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
export default SetupPassword;
