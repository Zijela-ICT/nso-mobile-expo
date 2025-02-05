import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  ScrollView
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useFormik } from "formik";
import * as Yup from "yup";
import BackgroundContainer from "../../components/background-container";
import { RootStackParamList } from "../../navigation/stack-navigator";
import { CustomButton, CustomInput } from "../../components";
import {
  useInitiateSignup,
  useStudentSignup
} from "@/hooks/api/mutations/auth";

type SignUpScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Signup"
>;

type UserType = "student" | "practitioner";
type Cadre = "JCHEW" | "CHEW" | "CHO";

const StudentValidationSchema = Yup.object().shape({
  indexNumber: Yup.string().required("Index number is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  cadre: Yup.string().required("Cadre is required")
});

const CommunityValidationSchema = Yup.object().shape({
  registrationNumber: Yup.string().required("Registration number is required")
});

const SignUpScreen = () => {
  const initiateSignup = useInitiateSignup();
  const studentSignup = useStudentSignup();
  const navigation = useNavigation<SignUpScreenNavigationProp>();
  const [userType, setUserType] = useState<UserType | null>(null);

  const showUserTypeSelection = () => {
    Alert.alert(
      "Select User Type",
      "Are you a student or practitioner?",
      [
        {
          text: "Student",
          onPress: () => {
            setUserType("student");
            formik.resetForm();
          }
        },
        {
          text: "Practitioner",
          onPress: () => {
            setUserType("practitioner");
            formik.resetForm();
          }
        }
      ],
      { cancelable: true }
    );
  };

  const showCadreSelection = () => {
    Alert.alert(
      "Select Cadre",
      "Choose your cadre",
      [
        {
          text: "JCHEW",
          onPress: () => formik.setFieldValue("cadre", "JCHEW")
        },
        {
          text: "CHEW",
          onPress: () => formik.setFieldValue("cadre", "CHEW")
        },
        {
          text: "CHO",
          onPress: () => formik.setFieldValue("cadre", "CHO")
        }
      ],
      { cancelable: true }
    );
  };

  const formik = useFormik({
    initialValues:
      userType === "student"
        ? {
            indexNumber: "",
            email: "",
            password: "",
            firstName: "",
            lastName: "",
            cadre: ""
          }
        : {
            registrationNumber: ""
          },
    validationSchema:
      userType === "student"
        ? StudentValidationSchema
        : CommunityValidationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      // const payload ={
      //   indexNumber: values.indexNumber,
      //   email: values.email,
      //   firstName: values.firstName,
      //   lastName: values.lastName,
      //   password: values.password,
      //   cadre: values.cadre
      // }

      // console.log("payload", payload)
      if (userType === "student") {
        studentSignup.mutateAsync(
          {
            indexNumber: values.indexNumber,
            email: values.email,
            firstName: values.firstName,
            lastName: values.lastName,
            password: values.password,
            cadre: values.cadre
          },
          {
            onSuccess: (data) => {
              navigation.navigate("OtpScreen", {
                userType: "student",
                payload: {
                  indexNumber: values.indexNumber,
                  firstName: values.firstName,
                  lastName: values.lastName,
                  email: values.email,
                  cadre: values.cadre,
                  password: values.password
                }
              });
            }, 
            onError: (err: any) =>{
              if (err.message.includes("check your email address for opt")){
                navigation.navigate("OtpScreen", {
                  userType: "student",
                  payload: {
                    indexNumber: values.indexNumber,
                    firstName: values.firstName,
                    lastName: values.lastName,
                    email: values.email,
                    cadre: values.cadre,
                    password: values.password
                  }
                });
              }
            }
          }
        );
      } else {
        initiateSignup.mutateAsync(
          {
            regNumber: parseInt(values.registrationNumber)
          },
          {
            onSuccess: (data) => {
              navigation.navigate("OtpScreen", {
                userType: "practitioner",
                email: data.data.email,
                regNumber: data.data.regNumber
              });
            }
          }
        );
      }
    }
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}>
      <BackgroundContainer
        backgroundImage={require("../../assets/bg-one.png")}
        formHeight={userType === "student" ? "85%" : "60%"}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View>
              <Text style={styles.title}>Sign Up</Text>

              {/* User Type Selection Button */}
              <TouchableOpacity
                style={[
                  styles.userTypeButton,
                  userType ? styles.userTypeButtonSelected : null
                ]}
                onPress={showUserTypeSelection}>
                <Text style={styles.userTypeText}>
                  {userType ? `${userType}` : "Select User Type"}
                </Text>
              </TouchableOpacity>

              {userType === "student" ? (
                // Student Form Fields
                <>
                  <CustomInput
                    label="Index Number"
                    placeholder="Enter Index Number"
                    value={formik.values.indexNumber}
                    onChangeText={formik.handleChange("indexNumber")}
                    onBlur={formik.handleBlur("indexNumber")}
                    error={
                      formik.touched.indexNumber
                        ? formik.errors.indexNumber
                        : undefined
                    }
                  />

                  <CustomInput
                    label="Email"
                    placeholder="Enter email address"
                    value={formik.values.email}
                    onChangeText={formik.handleChange("email")}
                    onBlur={formik.handleBlur("email")}
                    error={
                      formik.touched.email ? formik.errors.email : undefined
                    }
                    autoCapitalize="none"
                  />

                  <CustomInput
                    label="Password"
                    placeholder="Enter password"
                    value={formik.values.password}
                    onChangeText={formik.handleChange("password")}
                    onBlur={formik.handleBlur("password")}
                    error={
                      formik.touched.password
                        ? formik.errors.password
                        : undefined
                    }
                    secureTextEntry
                  />

                  <CustomInput
                    label="First Name"
                    placeholder="Enter first name"
                    value={formik.values.firstName}
                    onChangeText={formik.handleChange("firstName")}
                    onBlur={formik.handleBlur("firstName")}
                    error={
                      formik.touched.firstName
                        ? formik.errors.firstName
                        : undefined
                    }
                  />

                  <CustomInput
                    label="Last Name"
                    placeholder="Enter last name"
                    value={formik.values.lastName}
                    onChangeText={formik.handleChange("lastName")}
                    onBlur={formik.handleBlur("lastName")}
                    error={
                      formik.touched.lastName
                        ? formik.errors.lastName
                        : undefined
                    }
                  />

                  {/* Cadre Selection Button */}
                  <TouchableOpacity
                    style={[
                      styles.cadreButton,
                      formik.values.cadre ? styles.cadreButtonSelected : null
                    ]}
                    onPress={showCadreSelection}>
                    <Text style={styles.cadreButtonText}>
                      {formik.values.cadre || "Select Cadre"}
                    </Text>
                  </TouchableOpacity>
                  {formik.touched.cadre && formik.errors.cadre && (
                    <Text style={styles.errorText}>{formik.errors.cadre}</Text>
                  )}
                </>
              ) : userType === "practitioner" ? (
                // Community Member Form Field
                <CustomInput
                  label="Registration Number"
                  placeholder="Enter Registration Number"
                  value={formik.values.registrationNumber}
                  onChangeText={formik.handleChange("registrationNumber")}
                  onBlur={formik.handleBlur("registrationNumber")}
                  error={
                    formik.touched.registrationNumber
                      ? formik.errors.registrationNumber
                      : undefined
                  }
                  keyboardType="numeric"
                />
              ) : null}

              {userType && (
                <CustomButton
                  title="Proceed"
                  onPress={formik.handleSubmit}
                  disabled={!formik.isValid || !formik.dirty}
                  isLoading={initiateSignup.isLoading || studentSignup.isLoading}
                  loadingText="Verifying..."
                />
              )}

              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                  <Text style={styles.loginLink}>Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </BackgroundContainer>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 24
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    color: "white",
    marginBottom: 24
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
  userTypeButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)"
  },
  userTypeButtonSelected: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderColor: "rgba(255, 255, 255, 0.5)"
  },
  userTypeText: {
    color: "white",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
    textTransform: "capitalize"
  },
  cadreButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)"
  },
  cadreButtonSelected: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderColor: "rgba(255, 255, 255, 0.5)"
  },
  cadreButtonText: {
    color: "white",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500"
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 12,
    marginTop: -8,
    marginBottom: 12,
    marginLeft: 4
  }
});

export default SignUpScreen;
