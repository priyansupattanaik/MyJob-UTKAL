import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import config from "../../../context/config";

// Skijan color palette - matching with other screens
const COLORS = {
  darkestBlue: "#021024", // Darkest blue
  darkBlue: "#052659", // Dark blue
  mediumBlue: "#5483B3", // Medium blue
  lightBlue: "#7DA0C4", // Light blue
  lightestBlue: "#C1E8FF", // Lightest blue
  white: "#FFFFFF",
  textPrimary: "#212121",
  textSecondary: "#757575",
  background: "#f2f4f8",
  surface: "#FFFFFF",
  error: "#F44336",
  success: "#4CAF50",
  divider: "#E0E0E0",
};

const PasswordScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPasswordVisible, setCurrentPasswordVisible] = useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New password and confirm password do not match");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "New password should be at least 6 characters long");
      return;
    }

    try {
      setSubmitting(true);
      const userId = await AsyncStorage.getItem("userId");
      const userType = await AsyncStorage.getItem("type");

      if (!userId || !userType) {
        Alert.alert(
          "Error",
          "User information not found. Please log in again."
        );
        setSubmitting(false);
        return;
      }

      // API call to update the password
      const endpoint =
        userType === "Org"
          ? `${config.apiUrl}/organizationDetails/update/${userId}`
          : `${config.apiUrl}/personalDetails/update/${userId}`;

      const response = await axios.put(endpoint, {
        currentPassword,
        newPassword,
      });

      if (response.status === 200) {
        Alert.alert("Success", "Password successfully updated", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      console.error("Error updating password:", error);

      // More specific error messages based on response
      if (error.response && error.response.status === 401) {
        Alert.alert("Error", "Current password is incorrect");
      } else {
        Alert.alert("Error", "Failed to update password. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const renderPasswordField = (
    label,
    value,
    setValue,
    isVisible,
    toggleVisible,
    placeholder
  ) => (
    <View style={styles.inputSection}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputContainer}>
        <View style={styles.fieldIconContainer}>
          <Image
            source={require("../../../assets/icons/password.png")}
            style={styles.fieldIcon}
            tintColor={COLORS.mediumBlue}
          />
        </View>
        <TextInput
          style={styles.input}
          secureTextEntry={!isVisible}
          value={value}
          onChangeText={setValue}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textSecondary}
        />
        <TouchableOpacity style={styles.eyeButton} onPress={toggleVisible}>
          <Image
            source={
              isVisible
                ? require("../../../assets/icons/eyeclose.png")
                : require("../../../assets/icons/eye.png")
            }
            style={styles.eyeIcon}
            tintColor={COLORS.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.darkBlue} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Image
            source={require("../../../assets/icons/backIcon.png")}
            style={styles.backIcon}
            tintColor="#FFFFFF"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Change Password</Text>

        <View style={styles.placeholderView}></View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Password Management</Text>

        <View style={styles.infoCard}>
          <Image
            source={require("../../../assets/icons/password.png")}
            style={styles.infoIcon}
            tintColor={COLORS.mediumBlue}
          />
          <Text style={styles.infoText}>
            For security reasons, your password should be at least 6 characters
            long and contain a mix of letters, numbers, and special characters.
          </Text>
        </View>

        <View style={styles.formCard}>
          {renderPasswordField(
            "Current Password",
            currentPassword,
            setCurrentPassword,
            currentPasswordVisible,
            () => setCurrentPasswordVisible(!currentPasswordVisible),
            "Enter your current password"
          )}

          {renderPasswordField(
            "New Password",
            newPassword,
            setNewPassword,
            newPasswordVisible,
            () => setNewPasswordVisible(!newPasswordVisible),
            "Enter your new password"
          )}

          {renderPasswordField(
            "Confirm New Password",
            confirmPassword,
            setConfirmPassword,
            confirmPasswordVisible,
            () => setConfirmPasswordVisible(!confirmPasswordVisible),
            "Confirm your new password"
          )}
        </View>

        <TouchableOpacity
          style={styles.updateButton}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.8}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.updateButtonText}>Update Password</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    height: 56,
    backgroundColor: COLORS.darkBlue,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.white,
  },
  placeholderView: {
    width: 40,
    height: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.textSecondary,
    marginBottom: 16,
    marginLeft: 4,
  },
  infoCard: {
    backgroundColor: COLORS.lightestBlue,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.darkBlue,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  infoIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.darkBlue,
    lineHeight: 20,
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightBlue,
  },
  fieldIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightestBlue,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  fieldIcon: {
    width: 20,
    height: 20,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: COLORS.textPrimary,
    paddingVertical: 8,
  },
  eyeButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  eyeIcon: {
    width: 20,
    height: 20,
  },
  updateButton: {
    backgroundColor: COLORS.darkBlue,
    borderRadius: 8,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: COLORS.darkestBlue,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  updateButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default PasswordScreen;
