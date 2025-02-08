import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useFormik } from "formik";
import * as Yup from "yup";
import BackgroundContainer from "../../components/background-container";
import { RootStackParamList } from "../../navigation/stack-navigator";
import { CustomButton, CustomInput, TwoFATokenModal } from "../../components";
import { useLogin } from "../../hooks/api/mutations/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/contexts/auth.context";
import { showToast } from "@/utils/toast";
import { useFetchProfile } from "@/hooks/api/queries/settings";
import Feather from "@expo/vector-icons/Feather";
import { BiometricService } from "@/utils/biometric";
import Ionicons from "@expo/vector-icons/Ionicons";

type LoginNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Signup"
>;

// Login validation schema
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required")
});

const Login = () => {
  const login = useLogin();
  const { setIsAuthenticated, isBiometricEnabled, enableBiometric } = useAuth();
  const { refetch, isLoading: isLoadingProfile } = useFetchProfile();
  const navigation = useNavigation<LoginNavigationProp>();
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const [showTwoFAModal, setShowTwoFAModal] = useState(false);
  const [loginCredentials, setLoginCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    const available = await BiometricService.isBiometricAvailable();
    setIsBiometricAvailable(available);
  };

  const handleLoginSuccess = async (data: any) => {
    try {
      await AsyncStorage.setItem("@auth_token", data.data.token);
      await AsyncStorage.setItem("@refresh_token", data.data.refreshToken);

      // Store credentials for future biometric login if enabled
      if (isBiometricEnabled) {
        const success = await enableBiometric(
          formik.values.email,
          formik.values.password
        );
        if (!success) {
          showToast("Failed to set up biometric login", "error");
        }
      }

      const profileResult = await refetch();

      if (
        profileResult.data?.data?.roles?.some(
          (role: any) => role.name === "app_user"
        )
      ) {
        setIsAuthenticated(true);
        await AsyncStorage.setItem(
          "@self_enrolled",
          String(profileResult.data?.data?.isSelfEnrolled)
        );
      } else {
        showToast("Unauthorized user", "error");
        await AsyncStorage.removeItem("@auth_token");
        await AsyncStorage.removeItem("@refresh_token");
      }
    } catch (error) {
      showToast("Login failed. Please try again.", "error");
      await AsyncStorage.removeItem("@auth_token");
      await AsyncStorage.removeItem("@refresh_token");
    }
  };

  const handleBiometricLogin = async () => {
    try {
      setIsAuthenticating(true);

      // First verify biometric
      const authenticated = await BiometricService.authenticateWithBiometrics(
        "Login with biometric"
      );

      if (!authenticated) {
        showToast("Biometric authentication failed", "error");
        return;
      }

      // Get stored credentials
      const credentials = await BiometricService.getStoredCredentials();
      if (!credentials) {
        showToast(
          "Biometric login not set up. Please login with password first.",
          "error"
        );
        return;
      }

      // Perform login with stored credentials
      login.mutate(
        {
          email: credentials.username,
          password: credentials.password
        },
        {
          onSuccess: handleLoginSuccess,
          onError: handleLoginError
        }
      );
    } catch (error) {
      console.error("Biometric login error:", error);
      showToast("Biometric login failed", "error");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLoginError = (error: any) => {
    if (error?.message === "Token sent to your email"|| error?.message.includes("authenticator app")) {
      setLoginCredentials({
        email: formik.values.email || loginCredentials.email,
        password: formik.values.password || loginCredentials.password,
      });
      setShowTwoFAModal(true);
    } else {
      showToast("Login failed. Please try again.", "error");
    }
  };

  const handleTwoFASubmit = (token: string) => {
    if (!loginCredentials) return;

    login.mutate(
      {
        email: loginCredentials.email,
        password: loginCredentials.password,
        twoFAToken: token
      },
      {
        onSuccess: (data) => {
          setShowTwoFAModal(false);
          handleLoginSuccess(data);
        },
        onError: (error) => {
          if (error?.response?.data?.message !== "Token sent to your email") {
            setShowTwoFAModal(false);
            showToast("Invalid verification code. Please try again.", "error");
          }
        }
      }
    );
  };

  const formik = useFormik({
    initialValues: {
      email: "",
      password: ""
    },
    validationSchema: LoginSchema,
    onSubmit: (values) => {
      login.mutate(
        {
          email: values.email,
          password: values.password
        },
        {
          onSuccess: handleLoginSuccess,
          onError: handleLoginError
        }
      );
    }
  });

  const handleForgotPassword = () => {
    // Handle forgot password navigation
    navigation.navigate("ForgotPassword");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <BackgroundContainer
          backgroundImage={require("../../assets/bg-one.png")}
          formHeight="70%">
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>Login</Text>
            <Text style={styles.subTitle}>
              Use the email address you used to register and your password in
              order to Login
            </Text>

            {isBiometricAvailable && isBiometricEnabled && (
              <TouchableOpacity
                style={styles.biometricButton}
                onPress={handleBiometricLogin}
                disabled={isAuthenticating}>
                <Ionicons name="finger-print" size={24} color="white" />
                <Text style={styles.biometricText}>
                  {isAuthenticating
                    ? "Authenticating..."
                    : "Login with Biometric"}
                </Text>
              </TouchableOpacity>
            )}

            <CustomInput
              label="Email"
              placeholder="Enter email address"
              placeholderTextColor="#EAECF0"
              value={formik.values.email}
              onChangeText={formik.handleChange("email")}
              onBlur={formik.handleBlur("email")}
              autoCapitalize="none"
              // error={formik.touched.email && formik.errors.email}
              // errorMessage={formik.touched.email ? formik.errors.email : undefined}
            />

            <CustomInput
              label="Password"
              placeholder="Enter password"
              secureTextEntry
              placeholderTextColor="#EAECF0"
              value={formik.values.password}
              onChangeText={formik.handleChange("password")}
              onBlur={formik.handleBlur("password")}
              autoCapitalize="none"
              // error={formik.touched.password && formik.errors.password}
              // errorMessage={formik.touched.password ? formik.errors.password : undefined}
              containerStyle={{
                marginBottom: 8
              }}
            />

            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.forgot}>Forgot Password</Text>
            </TouchableOpacity>

            <CustomButton
              title="Login"
              onPress={formik.handleSubmit}
              disabled={!formik.isValid || !formik.dirty}
              isLoading={login.isLoading}
              loadingText="Logging in..."
            />

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Don't have an account yet? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
                <Text style={styles.loginLink}>Sign up</Text>
              </TouchableOpacity>
            </View>

            <TwoFATokenModal
              isVisible={showTwoFAModal}
              onClose={() => setShowTwoFAModal(false)}
              onSubmit={handleTwoFASubmit}
              isLoading={login.isLoading}
              email={loginCredentials?.email}
              password={loginCredentials?.password}
            />
          </ScrollView>
        </BackgroundContainer>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    color: "white",
    marginBottom: 4
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Platform.OS === "ios" ? 20 : 0
  },
  subTitle: {
    marginBottom: 24,
    fontSize: 14,
    color: "white",
    textAlign: "center",
    fontWeight: "400"
  },
  inputContainer: {
    marginBottom: 24
  },
  label: {
    fontSize: 14,
    color: "#FCFCFD",
    marginBottom: 8,
    fontWeight: "500"
  },
  input: {
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: "#EAECF0",
    backgroundColor: "transparent",
    borderColor: "#D0D5DD",
    borderWidth: 1
  },
  button: {
    backgroundColor: "#E5E5E5",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 8
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 24
  },
  forgot: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
    textAlign: "right",
    marginBottom: 24
  },
  buttonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600"
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24
  },
  loginText: {
    color: "white",
    fontSize: 14
  },
  loginLink: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline"
  },
  biometricButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)"
  },
  biometricText: {
    color: "white",
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600"
  }
});

export default Login;
