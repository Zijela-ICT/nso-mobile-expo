import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
  ScrollView,
  SafeAreaView,
  Modal
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import QRCode from "react-native-qrcode-svg";
import { useAuth } from "@/contexts/auth.context";
import { showToast } from "@/utils/toast";
import Feather from "@expo/vector-icons/Feather";
import { Header } from "@/components";
import { useFetchProfile } from "@/hooks/api/queries/settings";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SettingsStackParamList } from "@/stacks/SettingsStack";
import {
  useUpdate2Fa,
  useUpdate2faMethod
} from "@/hooks/api/mutations/profile";
import { getTimeUntil } from "@/utils/date-formatter";
import { format } from "date-fns";
// import {usePushNotification} from '@/hooks/custom/usePushNotification';

const SectionHeader = ({ title }: { title: string }) => (
  <Text style={styles.sectionHeader}>{title}</Text>
);

const ProfileItem = ({
  label,
  value
}: {
  label: string;
  value?: string | number;
}) => (
  <View style={styles.profileItem}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const MenuItem = ({
  icon,
  title,
  onPress,
  hasToggle = false,
  isEnabled = false,
  onToggle
}: {
  icon: any;
  title: string;
  onPress?: () => void;
  hasToggle?: boolean;
  isEnabled?: boolean;
  onToggle?: (value: boolean) => void;
}) => (
  <TouchableOpacity
    style={styles.menuItem}
    onPress={onPress}
    disabled={hasToggle}>
    <View style={styles.menuItemLeft}>
      <View style={styles.icon}>{icon}</View>
      <Text style={styles.menuItemText}>{title}</Text>
    </View>
    {hasToggle ? (
      <Switch
        trackColor={{ false: "#E4E7EC", true: "#12B76A" }}
        thumbColor="#FFFFFF"
        onValueChange={onToggle}
        value={isEnabled}
      />
    ) : (
      <Feather name="chevron-right" size={20} color="#667085" />
    )}
  </TouchableOpacity>
);

const ConfirmationModal = ({
  visible,
  onClose,
  onConfirm,
  title,
  description,
  // inputLabel,
  // inputPlaceholder,
  isLoading = false
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: any;
  title: string;
  description: string;
  inputLabel: string;
  inputPlaceholder: string;
  isLoading?: boolean;
}) => {
  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalDescription}>{description}</Text>

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={onConfirm}
              disabled={isLoading}>
              <Text style={styles.confirmButtonText}>
                {isLoading ? "Enabling..." : "Confirm"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const TwoFAMethodModal = ({
  visible,
  onClose,
  currentMethod,
  qrCodeUrl,
  onSave,
  onMethodSelect,
  isLoading = false
}: {
  visible: boolean;
  qrCodeUrl: string | null;
  onClose: () => void;
  onSave: () => void;
  currentMethod: "email" | "app";
  onMethodSelect: (method: "email" | "app") => void;
  isLoading?: boolean;
}) => {
  // Add a render section for QR code
  const renderQRCode = () => {
    if (currentMethod === "app" && qrCodeUrl) {
      return (
        <View style={styles.qrCodeContainer}>
          <Text style={styles.qrCodeTitle}>Scan QR Code</Text>
          <Text style={styles.qrCodeDescription}>
            Scan this QR code with your authenticator app
          </Text>
          <View style={styles.qrCode}>
            <QRCode
              value={qrCodeUrl}
              size={200}
              backgroundColor="white"
              color="black"
            />
          </View>
        </View>
      );
    }
    return null;
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.modalOverlay}>
        <View
          style={[styles.modalContent, qrCodeUrl && styles.modalContentLarge]}>
          {renderQRCode()}
          <Text style={styles.modalTitle}>Select 2FA Method</Text>
          <Text style={styles.modalDescription}>
            Choose your preferred two-factor authentication method
          </Text>

          <View style={styles.methodOptions}>
            <TouchableOpacity
              style={[
                styles.methodOption,
                currentMethod === "email" && styles.methodOptionSelected
              ]}
              onPress={() => onMethodSelect("email")}>
              <Feather
                name="mail"
                size={24}
                color={currentMethod === "email" ? "#12B76A" : "#667085"}
              />
              <View style={styles.methodTextContainer}>
                <Text
                  style={[
                    styles.methodTitle,
                    currentMethod === "email" && styles.methodTitleSelected
                  ]}>
                  Email
                </Text>
                <Text style={styles.methodDescription}>
                  Receive verification codes via email
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.methodOption,
                currentMethod === "app" && styles.methodOptionSelected
              ]}
              onPress={() => onMethodSelect("app")}>
              <Feather
                name="smartphone"
                size={24}
                color={currentMethod === "app" ? "#12B76A" : "#667085"}
              />
              <View style={styles.methodTextContainer}>
                <Text
                  style={[
                    styles.methodTitle,
                    currentMethod === "app" && styles.methodTitleSelected
                  ]}>
                  Authenticator App
                </Text>
                <Text style={styles.methodDescription}>
                  Use an authenticator app like Google Authenticator
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={onSave}
              disabled={isLoading}>
              <Text style={styles.confirmButtonText}>
                {isLoading ? "Saving..." : "Save"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

type SettingsNavigationProp = NativeStackNavigationProp<
  SettingsStackParamList,
  "Settings"
>;
const SettingsScreen = () => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const updateTwoFa = useUpdate2Fa();
  const choose2FAMethod = useUpdate2faMethod();
  const navigation = useNavigation<SettingsNavigationProp>();
  const { data } = useFetchProfile();
  const {
    setIsAuthenticated,
    isBiometricEnabled,
    enableBiometric,
    disableBiometric
  } = useAuth();

  // const {
  //   isEnabled: pushNotificationsEnabled,
  //   isLoading: isCheckingPermissions,
  //   toggleNotifications: handlePushNotificationToggle,
  // } = usePushNotification();

  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean | undefined>(
    false
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const [show2FAMethodModal, setShow2FAMethodModal] = useState(false);
  const [twoFAMethod, setTwoFAMethod] = useState<"email" | "app">("email");

  const profile = data?.data;

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel"
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.removeItem("@auth_token");
            await AsyncStorage.removeItem("quiz_state");
            setIsAuthenticated(false);
            showToast("Logged out successfully", "success");
          } catch (error) {
            showToast("Failed to logout", "error");
          }
        }
      }
    ]);
  };

  const handleBiometricToggle = async (value: boolean) => {
    if (value) {
      setShowBiometricModal(true);
    } else {
      await disableBiometric();
      setBiometricEnabled(false);
      showToast("Biometric authentication disabled", "success");
    }
  };

  const handleTwoFactorToggle = (value: boolean) => {
    if (value) {
      updateTwoFa.mutate(
        { type: "enabled" },
        {
          onSuccess: () => {
            setTwoFactorEnabled(true);
          }
        }
      );
    } else {
      updateTwoFa.mutate(
        { type: "disabled" },
        {
          onSuccess: () => {
            setTwoFactorEnabled(false);
            showToast("Two-factor authentication disabled", "success");
          }
        }
      );
      showToast("Two-factor authentication disabled", "success");
    }
  };

  const handleBiometricConfirm = async () => {
    try {
      setIsConfirming(true);
      const success = await enableBiometric();

      if (success) {
        setShowBiometricModal(false);
        setBiometricEnabled(true);
        showToast("Biometric authentication enabled", "success");
      }
    } catch (error) {
      console.error("Error enabling biometric:", error);
      showToast("Failed to enable biometric authentication", "error");
    } finally {
      setIsConfirming(false);
    }
  };

  const handleTwoFactorConfirm = async () => {
    try {
      setIsConfirming(true);
      // Add your API call here to verify password and enable 2FA
      // await request('POST', '/auth/enable-2fa', { password });

      setTwoFactorEnabled(true);
      setShowTwoFactorModal(false);
      showToast("Two-factor authentication enabled", "success");
    } catch (error) {
      console.error("Error enabling 2FA:", error);
      showToast("Failed to enable two-factor authentication", "error");
    } finally {
      setIsConfirming(false);
    }
  };

  useEffect(() => {
    if (profile?.twoFaMethod) {
      setTwoFAMethod(profile?.twoFaMethod);
    }
  }, [profile]);

  useEffect(() => {
    setTwoFactorEnabled(profile?.isTwoFAEnabled);
    setBiometricEnabled(isBiometricEnabled);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [biometricEnabled, twoFactorEnabled, data]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <View style={styles.container}>
        <Text style={styles.title}>Settings</Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            <SectionHeader title="Profile" />
            <ProfileItem
              label="Index Number"
              value={profile?.regNumber || profile?.indexNumber}
            />
            <ProfileItem label="Email address" value={profile?.email} />
            {!!profile?.regExpiration && (
              <View style={styles.profileItem}>
                <Text style={styles.label}>License expiration date</Text>
                <Text
                  style={[
                    styles.value,
                    {
                      color: "#12B76A"
                    }
                  ]}>
                  {getTimeUntil(profile?.regExpiration)?.relativeTime}
                </Text>
                <Text style={styles.value}>
                  ({format(new Date(profile?.regExpiration), "PPpp")})
                </Text>
              </View>
            )}
          </View>

          <View style={styles.card}>
            <SectionHeader title="Account" />
            <MenuItem
              icon={<Feather name="lock" size={24} color="#F79009" />}
              title="Change Password"
              onPress={() => {
                navigation.navigate("ChangePassword");
              }}
            />
          </View>

          <View style={styles.card}>
            <SectionHeader title="Security" />
            <MenuItem
              icon={<Feather name="smile" size={24} color="#7F56D9" />}
              title="Enable Biometric"
              hasToggle
              isEnabled={biometricEnabled}
              onToggle={handleBiometricToggle}
            />
            <MenuItem
              icon={<Feather name="key" size={24} color="#12B76A" />}
              title="2FA Method"
              onPress={() => setShow2FAMethodModal(true)}
            />
            <MenuItem
              icon={<Feather name="shield" size={24} color="#F04438" />}
              title="Enable Two-Factor Authentication"
              hasToggle
              isEnabled={twoFactorEnabled}
              onToggle={handleTwoFactorToggle}
            />
          </View>

          <SectionHeader title="Notification" />
          <View style={styles.card}>
            <MenuItem
              icon={<Feather name="bell" size={24} color="#12B76A" />}
              title="App Notification"
              hasToggle
              isEnabled={notificationsEnabled}
              onToggle={setNotificationsEnabled}
            />
          </View>

          <SectionHeader title="Account" />
          <View style={styles.card}>
            <MenuItem
              icon={<Feather name="log-out" size={24} color="#F04438" />}
              title="Logout"
              onPress={handleLogout}
            />
          </View>
        </ScrollView>
      </View>

      <ConfirmationModal
        visible={showBiometricModal}
        onClose={() => setShowBiometricModal(false)}
        onConfirm={handleBiometricConfirm}
        title="Enable Biometric Authentication"
        description="Please enter your password to enable biometric authentication"
        inputLabel="Password"
        inputPlaceholder="Enter your password"
        isLoading={isConfirming}
      />

      <TwoFAMethodModal
        visible={show2FAMethodModal}
        onClose={() => {
          setShow2FAMethodModal(false);
          setQrCodeUrl(null); // Reset QR code when closing modal
        }}
        currentMethod={twoFAMethod}
        isLoading={choose2FAMethod.isLoading}
        onMethodSelect={(method) => {
          setTwoFAMethod(method);
          if (method === "email") {
            setQrCodeUrl(null); // Reset QR code when switching to email
          }
        }}
        qrCodeUrl={qrCodeUrl}
        onSave={() => {
          choose2FAMethod.mutate(
            { twoFaMethod: twoFAMethod, userId: profile?.id },
            {
              onSuccess: (data) => {
                if (data?.data?.otpauth_url) {
                  setQrCodeUrl(data.data.otpauth_url);
                } else {
                  setShow2FAMethodModal(false);
                  setQrCodeUrl(null);
                }
              },
              onError: (error) => {
                Alert.alert("", error.message, [
                  {
                    text: "OK"
                  }
                ]);
              }
            }
          );
        }}
      />

      <ConfirmationModal
        visible={showTwoFactorModal}
        onClose={() => setShowTwoFactorModal(false)}
        onConfirm={handleTwoFactorConfirm}
        title="Enable Two-Factor Authentication"
        description="Please enter your password to enable two-factor authentication"
        inputLabel="Password"
        inputPlaceholder="Enter your password"
        isLoading={isConfirming}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FFFB"
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#FFF"
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 16
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#101828",
    marginBottom: 24
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "600",
    color: "#98A2B3",
    marginBottom: 8
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EAECF0",
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  profileItem: {
    marginBottom: 12
  },
  label: {
    fontSize: 12,
    color: "#667085",
    fontWeight: "400"
  },
  value: {
    fontSize: 16,
    color: "#101828",
    fontWeight: "500"
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center"
  },
  icon: {
    shadowColor: "#000",
    borderWidth: 1,
    borderColor: "#EAECF0",
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderRadius: 8,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  menuItemText: {
    fontSize: 14,
    color: "#475467",
    marginLeft: 12,
    fontWeight: "500"
  },
  logoutButton: {
    backgroundColor: "#FEE4E2",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16
  },
  logoutText: {
    color: "#D92D20",
    fontSize: 16,
    fontWeight: "600"
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
    width: "100%",
    maxWidth: 340
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#101828",
    marginBottom: 8,
    textAlign: "center"
  },
  modalDescription: {
    fontSize: 14,
    color: "#475467",
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 20
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    backgroundColor: "#FFFFFF"
  },
  confirmButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: "#12B76A"
  },
  cancelButtonText: {
    color: "#344054",
    fontSize: 14,
    fontWeight: "600"
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600"
  },
  methodOptions: {
    marginBottom: 24
  },
  methodOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    borderColor: "#EAECF0",
    borderRadius: 8,
    marginBottom: 8
  },
  methodOptionSelected: {
    borderColor: "#12B76A",
    backgroundColor: "#F6FEF9"
  },
  methodTextContainer: {
    marginLeft: 12,
    flex: 1
  },
  methodTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#344054",
    marginBottom: 4
  },
  methodTitleSelected: {
    color: "#12B76A"
  },
  methodDescription: {
    fontSize: 12,
    color: "#667085"
  },
  modalContentLarge: {
    maxHeight: "80%"
  },
  qrCodeContainer: {
    alignItems: "center",
    marginVertical: 24,
    paddingHorizontal: 16
  },
  qrCodeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#101828",
    marginBottom: 8
  },
  qrCodeDescription: {
    fontSize: 14,
    color: "#475467",
    marginBottom: 16,
    textAlign: "center"
  },
  qrCode: {
    padding: 16,
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  }
});

export default SettingsScreen;
