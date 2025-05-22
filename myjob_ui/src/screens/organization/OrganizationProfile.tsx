import React, { useEffect, useState } from "react";
import {
  View,
  Image,
  StyleSheet,
  Text,
  TextInput,
  ScrollView,
  Alert,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Platform,
  Modal,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import config from "../../context/config";

// Material Design colors - bluish accent color palette
const COLORS = {
  primary: "#2196F3",
  primaryDark: "#1976D2",
  primaryLight: "#BBDEFB",
  accent: "#448AFF",
  textPrimary: "#212121",
  textSecondary: "#757575",
  background: "#f2f4f8",
  surface: "#FFFFFF",
  error: "#F44336",
  success: "#4CAF50",
};

const OrganizationProfile = ({ navigation }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [userData, setUserData] = useState({
    organizationName: "",
    email: "",
    phoneNo: "",
    address: "",
    description: "",
    website: "",
    socialMediaLink: "",
    industry: "",
    since: "",
    specialization: "",
    logoUrl: null,
  });

  // Toggle modal for logout confirmation
  const toggleModal = () => setModalVisible(!isModalVisible);

  // Fetch user data on component mount
  useEffect(() => {
    fetchOrganizationData();
  }, []);

  // Function to fetch organization profile data
  const fetchOrganizationData = async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem("userId");

      if (!userId) {
        console.error("User ID not found");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${config.apiUrl}/organizationDetails/get/${userId}`
      );

      if (response.status === 200 && response.data) {
        const orgData = response.data;
        setUserData({
          organizationName: orgData.organizationName || "",
          email: orgData.email || "",
          phoneNo: orgData.phoneNo || "",
          address: orgData.address || "",
          description: orgData.description || "",
          website: orgData.website || "",
          socialMediaLink: orgData.socialMediaLink || "",
          industry: orgData.industry || "",
          since: orgData.since || "",
          specialization: orgData.specialization || "",
          logoUrl: orgData.logo
            ? `${config.apiUrl}/photo/${orgData.logo}`
            : null,
        });
      }
    } catch (error) {
      console.error("Error fetching organization data:", error);
      Alert.alert("Error", "Failed to load profile data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Function to save profile changes
  const handleSave = async () => {
    try {
      setSaving(true);
      const userId = await AsyncStorage.getItem("userId");
      const accessToken = await AsyncStorage.getItem("userToken");

      if (!userId) {
        Alert.alert("Error", "User ID not found. Please log in again.");
        setSaving(false);
        return;
      }

      const response = await axios.put(
        `${config.apiUrl}/organizationDetails/update/${userId}`,
        { ...userData, id: userId },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (response.status === 200) {
        Alert.alert("Success", "Profile updated successfully");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Handle logout function
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.removeItem("userId");
      await AsyncStorage.removeItem("type");

      setModalVisible(false); // Close the modal

      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: "Login" }],
        });
      }, 300); // Delay navigation slightly to allow modal to close
    } catch (error) {
      console.error("Error clearing auth data:", error);
    }
  };

  // Render each field item
  const renderField = (label, value, icon, fieldKey, multiline = false) => (
    <View style={styles.fieldContainer}>
      <View style={styles.fieldIconContainer}>
        <Image
          source={icon}
          style={styles.fieldIcon}
          tintColor={COLORS.primary}
        />
      </View>
      <View style={styles.fieldContent}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {isEditing ? (
          <TextInput
            style={[styles.input, multiline && styles.multilineInput]}
            value={value}
            onChangeText={(text) =>
              setUserData({ ...userData, [fieldKey]: text })
            }
            multiline={multiline}
            numberOfLines={multiline ? 3 : 1}
            placeholder={`Enter ${label.toLowerCase()}`}
            placeholderTextColor={COLORS.textSecondary}
          />
        ) : (
          <Text style={styles.fieldValue}>{value || "Not specified"}</Text>
        )}
      </View>
    </View>
  );

  // Setting item without arrow
  const renderAccountOption = (label, icon, onPress) => (
    <TouchableOpacity style={styles.settingContainer} onPress={onPress}>
      <View style={styles.settingIconContainer}>
        <Image
          source={icon}
          style={styles.settingIcon}
          tintColor={COLORS.primary}
        />
      </View>
      <Text style={styles.settingText}>{label}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={COLORS.primaryDark}
        />
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Image
            source={require("../../assets/icons/backIcon.png")}
            style={styles.backIcon}
            tintColor="#FFFFFF"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>My account</Text>

        {/* Removed settings button as requested */}
        <View style={styles.placeholderView}></View>
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.profileImageContainer}>
          {userData.logoUrl ? (
            <Image
              source={{ uri: userData.logoUrl }}
              style={styles.profileImage}
            />
          ) : (
            <View style={[styles.profileImage, styles.profileImagePlaceholder]}>
              <Text style={styles.profileImagePlaceholderText}>
                {userData.organizationName?.charAt(0)?.toUpperCase() || "O"}
              </Text>
            </View>
          )}
          <TouchableOpacity style={styles.editImageButton}>
            <Image
              source={require("../../assets/icons/edit.png")}
              style={styles.editIconSmall}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.editProfileButton, isEditing && styles.cancelButton]}
          onPress={() => setIsEditing(!isEditing)}
        >
          <Text style={styles.editButtonText}>
            {isEditing ? "Cancel" : "Edit Profile"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Organization Info</Text>

          <View style={styles.sectionContent}>
            {renderField(
              "Organization Name",
              userData.organizationName,
              require("../../assets/icons/briefcase.png"),
              "organizationName"
            )}

            {renderField(
              "Phone Number",
              userData.phoneNo,
              require("../../assets/icons/phone.png"),
              "phoneNo"
            )}

            {renderField(
              "Email Address",
              userData.email,
              require("../../assets/icons/email.png"),
              "email"
            )}

            {renderField(
              "Address",
              userData.address,
              require("../../assets/icons/Location.png"),
              "address",
              true
            )}
          </View>
        </View>

        {/* Business Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Details</Text>

          <View style={styles.sectionContent}>
            {renderField(
              "Description",
              userData.description,
              require("../../assets/icons/description.png"),
              "description",
              true
            )}

            {renderField(
              "Industry",
              userData.industry,
              require("../../assets/icons/industry.png"),
              "industry"
            )}

            {renderField(
              "Specialization",
              userData.specialization,
              require("../../assets/icons/specialization.png"),
              "specialization"
            )}

            {renderField(
              "Established Since",
              userData.since,
              require("../../assets/icons/established.png"),
              "since"
            )}
          </View>
        </View>

        {/* Web Presence Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Web Presence</Text>

          <View style={styles.sectionContent}>
            {renderField(
              "Website",
              userData.website,
              require("../../assets/icons/website.png"),
              "website"
            )}

            {renderField(
              "Social Media Links",
              userData.socialMediaLink,
              require("../../assets/icons/link.png"),
              "socialMediaLink"
            )}
          </View>
        </View>

        {/* Account Section - Only password and logout */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <View style={styles.sectionContent}>
            {renderAccountOption(
              "Change Password",
              require("../../assets/icons/password.png"),
              () => navigation.navigate("PasswordScreen")
            )}

            {renderAccountOption(
              "Logout",
              require("../../assets/icons/logout.png"),
              toggleModal
            )}
          </View>
        </View>

        {/* Bottom space */}
        <View style={{ height: isEditing ? 80 : 20 }} />
      </ScrollView>

      {/* Save Button - only visible in edit mode */}
      {isEditing && (
        <View style={styles.saveButtonContainer}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Logout Confirmation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={toggleModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Logout</Text>
            <Text style={styles.modalText}>
              Are you sure you want to logout?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.logoutButton]}
                onPress={handleLogout}
              >
                <Text style={styles.modalButtonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={toggleModal}
              >
                <Text style={styles.modalButtonText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  header: {
    height: 56,
    backgroundColor: COLORS.primary,
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
    color: "#FFFFFF",
  },
  placeholderView: {
    width: 40,
    height: 40,
  },
  profileSection: {
    backgroundColor: COLORS.primary,
    paddingBottom: 16,
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  profileImageContainer: {
    position: "relative",
    marginTop: 0,
    marginBottom: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  profileImagePlaceholder: {
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  profileImagePlaceholderText: {
    fontSize: 36,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  editImageButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  editIconSmall: {
    width: 16,
    height: 16,
    tintColor: COLORS.primary,
  },
  editProfileButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  cancelButton: {
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  editButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
    marginTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.textSecondary,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  sectionContent: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  fieldContainer: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  fieldIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  fieldIcon: {
    width: 20,
    height: 20,
  },
  fieldContent: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  input: {
    fontSize: 16,
    color: COLORS.textPrimary,
    padding: 0,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primaryLight,
  },
  multilineInput: {
    minHeight: 60,
    textAlignVertical: "top",
  },
  saveButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  // Setting styles
  settingContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingIcon: {
    width: 20,
    height: 20,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  modalText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
  },
  logoutButton: {
    backgroundColor: COLORS.primary,
  },
  cancelModalButton: {
    backgroundColor: COLORS.error,
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default OrganizationProfile;
