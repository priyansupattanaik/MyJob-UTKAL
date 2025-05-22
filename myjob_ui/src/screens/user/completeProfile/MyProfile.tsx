import React, { useEffect, useState, useCallback } from "react";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import config from "../../../context/config";
import { useFocusEffect } from "@react-navigation/native";

// Color palette from the Skijan image
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
};

const MyProfile = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);

  const [userData, setUserData] = useState({
    firstName: "",
    email: "",
    phone: "",
    permanentAddress: "",
    bio: "",
    dob: "",
    logoUrl: null,
    educationalDetails: [],
    professionalDetails: [],
  });

  // To handle university and specialization inputs
  const [universityInput, setUniversityInput] = useState("");
  const [specializationInput, setSpecializationInput] = useState("");
  const [collegeNameInput, setCollegeNameInput] = useState("");
  const [degreeTypeInput, setDegreeTypeInput] = useState("Bachelor's"); // Default value

  // Toggle modal for logout confirmation
  const toggleModal = () => setModalVisible(!isModalVisible);

  // Fetch data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchUserData();
      return () => {
        // Clean up if needed
      };
    }, [])
  );

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const accessToken = await AsyncStorage.getItem("userToken");
      const id = await AsyncStorage.getItem("userId");

      if (!id) {
        console.error("User ID not found");
        setLoading(false);
        return;
      }

      // First get personal details
      const response = await axios.get(
        `${config.apiUrl}/personalDetails/get/${id}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response.status === 200 && response.data.data) {
        const data = response.data.data;
        setUserData({
          ...data,
          professionalDetails: data.professionalDetails || [],
          logoUrl: data.coverImage
            ? `${config.apiUrl}/userLogo/${data.coverImage}`
            : null,
        });

        // Now get educational details separately
        try {
          const educationalResponse = await axios.get(
            `${config.apiUrl}/educational/self`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );

          if (
            educationalResponse.status === 200 &&
            educationalResponse.data &&
            educationalResponse.data.educationalDetails
          ) {
            const educationDetails =
              educationalResponse.data.educationalDetails;

            // Update the userData state with the latest educational details
            setUserData((prevData) => ({
              ...prevData,
              educationalDetails: educationDetails,
            }));

            // Update the input fields if education details exist
            if (educationDetails.length > 0) {
              setUniversityInput(educationDetails[0]?.university || "");
              setSpecializationInput(educationDetails[0]?.specialization || "");
              setCollegeNameInput(educationDetails[0]?.collegeName || "");
              setDegreeTypeInput(
                educationDetails[0]?.degreeType || "Bachelor's"
              );
            }
          }
        } catch (eduError) {
          console.log("No educational details found");
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert("Error", "Failed to load profile data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const accessToken = await AsyncStorage.getItem("userToken");
      const id = await AsyncStorage.getItem("userId");

      if (!id) {
        Alert.alert("Error", "User ID not found. Please log in again.");
        setSaving(false);
        return;
      }

      // First update the profile data
      await axios.put(
        `${config.apiUrl}/personalDetails/update`,
        {
          ...userData,
          id,
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      // Handle educational details separately
      if (collegeNameInput && universityInput) {
        try {
          // Prepare education data
          const educationData = {
            degreeType: degreeTypeInput || "Bachelor's",
            specialization: specializationInput || "General",
            collegeName: collegeNameInput,
            university: universityInput,
            graduationYear: new Date().getFullYear(),
            passingPercentage: 70,
          };

          // Check if educational details already exist
          let educationalDetailsExist = false;

          try {
            const eduResponse = await axios.get(
              `${config.apiUrl}/educational/self`,
              { headers: { Authorization: `Bearer ${accessToken}` } }
            );

            educationalDetailsExist =
              eduResponse.data &&
              eduResponse.data.educationalDetails &&
              eduResponse.data.educationalDetails.length > 0;
          } catch (error) {
            educationalDetailsExist = false;
          }

          if (educationalDetailsExist) {
            // Update existing education details
            await axios.put(
              `${config.apiUrl}/educational/self`,
              educationData,
              { headers: { Authorization: `Bearer ${accessToken}` } }
            );
          } else {
            // Create new education details
            await axios.post(
              `${config.apiUrl}/educational/self`,
              educationData,
              { headers: { Authorization: `Bearer ${accessToken}` } }
            );
          }

          // Update local state immediately
          setUserData((prevState) => ({
            ...prevState,
            educationalDetails: [
              {
                degreeType: degreeTypeInput || "Bachelor's",
                specialization: specializationInput || "General",
                collegeName: collegeNameInput,
                university: universityInput,
                graduationYear: new Date().getFullYear(),
                passingPercentage: 70,
              },
            ],
          }));
        } catch (eduError) {
          if (eduError.response?.status === 404) {
            // If update fails with 404, try creating new details
            try {
              const educationData = {
                degreeType: degreeTypeInput || "Bachelor's",
                specialization: specializationInput || "General",
                collegeName: collegeNameInput,
                university: universityInput,
                graduationYear: new Date().getFullYear(),
                passingPercentage: 70,
              };

              await axios.post(
                `${config.apiUrl}/educational/self`,
                educationData,
                { headers: { Authorization: `Bearer ${accessToken}` } }
              );

              // Update local state
              setUserData((prevState) => ({
                ...prevState,
                educationalDetails: [
                  {
                    degreeType: degreeTypeInput || "Bachelor's",
                    specialization: specializationInput || "General",
                    collegeName: collegeNameInput,
                    university: universityInput,
                    graduationYear: new Date().getFullYear(),
                    passingPercentage: 70,
                  },
                ],
              }));
            } catch (createError) {
              console.error("Error creating educational details:", createError);
            }
          }
        }
      }

      Alert.alert("Success", "Profile updated successfully");
      setIsEditing(false);

      // Refresh data after a short delay to ensure everything is updated
      setTimeout(() => {
        fetchUserData();
      }, 500);
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

      setModalVisible(false);

      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: "Login" }],
        });
      }, 200);
    } catch (error) {
      console.error("Error clearing auth data:", error);
    }
  };

  // Fixed navigation to ensure TabNavigator loads properly
  const navigateToHome = () => {
    navigation.goBack();
  };

  // Render each field item
  const renderField = (
    label,
    value,
    icon,
    fieldKey,
    multiline = false,
    isEditable = true,
    onPress = null
  ) => (
    <TouchableOpacity
      style={styles.fieldContainer}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.fieldIconContainer}>
        <Image
          source={icon}
          style={styles.fieldIcon}
          tintColor={COLORS.mediumBlue}
        />
      </View>
      <View style={styles.fieldContent}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {isEditing && isEditable ? (
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
    </TouchableOpacity>
  );

  // Render account option item
  const renderAccountOption = (label, icon, onPress) => (
    <TouchableOpacity style={styles.fieldContainer} onPress={onPress}>
      <View style={styles.fieldIconContainer}>
        <Image
          source={icon}
          style={styles.fieldIcon}
          tintColor={COLORS.mediumBlue}
        />
      </View>
      <View style={styles.fieldContent}>
        <Text style={styles.fieldValue}>{label}</Text>
      </View>
      <Image
        source={require("../../../assets/icons/rightarrow.png")}
        style={styles.arrowIcon}
      />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.darkBlue} />
        <ActivityIndicator size="large" color={COLORS.mediumBlue} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.darkBlue} />

      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={navigateToHome}>
          <Image
            source={require("../../../assets/icons/backIcon.png")}
            style={styles.backIcon}
            tintColor="#FFFFFF"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>My Account</Text>

        {/* Settings button removed as requested */}
        <View style={styles.placeholderView} />
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
                {userData.firstName?.charAt(0)?.toUpperCase() || "U"}
              </Text>
            </View>
          )}
          <TouchableOpacity style={styles.editImageButton}>
            <Image
              source={require("../../../assets/icons/edit.png")}
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
        contentContainerStyle={styles.scrollViewContent}
      >
        {/* Personal Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.sectionContent}>
            {renderField(
              "Phone",
              userData.phone,
              require("../../../assets/icons/ph.png"),
              "phone"
            )}

            {renderField(
              "Date of Birth",
              userData.dob,
              require("../../../assets/icons/date.png"),
              "dob"
            )}

            {renderField(
              "Address",
              userData.permanentAddress,
              require("../../../assets/icons/loc.png"),
              "permanentAddress",
              true
            )}

            {renderField(
              "About",
              userData.bio,
              require("../../../assets/icons/about.png"),
              "bio",
              true
            )}
          </View>
        </View>

        {/* Education Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>

          <View style={styles.sectionContent}>
            {/* College Name Field */}
            <TouchableOpacity
              style={styles.fieldContainer}
              onPress={() =>
                !isEditing &&
                navigation.navigate("AddEducation", {
                  education: userData.educationalDetails,
                })
              }
            >
              <View style={styles.fieldIconContainer}>
                <Image
                  source={require("../../../assets/icons/clg.png")}
                  style={styles.fieldIcon}
                  tintColor={COLORS.mediumBlue}
                />
              </View>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>College Name</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    value={collegeNameInput}
                    onChangeText={setCollegeNameInput}
                    placeholder="Enter college name"
                    placeholderTextColor={COLORS.textSecondary}
                  />
                ) : (
                  <Text style={styles.fieldValue}>
                    {userData.educationalDetails?.[0]?.collegeName ||
                      "Not specified"}
                  </Text>
                )}
              </View>
            </TouchableOpacity>

            {/* University Field */}
            <TouchableOpacity
              style={styles.fieldContainer}
              onPress={() =>
                !isEditing &&
                navigation.navigate("AddEducation", {
                  education: userData.educationalDetails,
                })
              }
            >
              <View style={styles.fieldIconContainer}>
                <Image
                  source={require("../../../assets/icons/clg.png")}
                  style={styles.fieldIcon}
                  tintColor={COLORS.mediumBlue}
                />
              </View>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>University</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    value={universityInput}
                    onChangeText={setUniversityInput}
                    placeholder="Enter university"
                    placeholderTextColor={COLORS.textSecondary}
                  />
                ) : (
                  <Text style={styles.fieldValue}>
                    {userData.educationalDetails?.[0]?.university ||
                      "Not specified"}
                  </Text>
                )}
              </View>
            </TouchableOpacity>

            {/* Specialization Field */}
            <TouchableOpacity
              style={styles.fieldContainer}
              onPress={() =>
                !isEditing &&
                navigation.navigate("AddEducation", {
                  education: userData.educationalDetails,
                })
              }
            >
              <View style={styles.fieldIconContainer}>
                <Image
                  source={require("../../../assets/icons/educations.png")}
                  style={styles.fieldIcon}
                  tintColor={COLORS.mediumBlue}
                />
              </View>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>Specialization</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    value={specializationInput}
                    onChangeText={setSpecializationInput}
                    placeholder="Enter specialization"
                    placeholderTextColor={COLORS.textSecondary}
                  />
                ) : (
                  <Text style={styles.fieldValue}>
                    {userData.educationalDetails?.[0]?.specialization ||
                      "Not specified"}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <View style={styles.sectionContent}>
            {renderAccountOption(
              "Change Password",
              require("../../../assets/icons/password.png"),
              () => navigation.navigate("PasswordScreen")
            )}

            {renderAccountOption(
              "Logout",
              require("../../../assets/icons/logout.png"),
              toggleModal
            )}
          </View>
        </View>

        {/* Bottom space for save button */}
        <View style={{ height: isEditing ? 80 : 20 }} />
      </ScrollView>

      {/* Save Button - only visible in edit mode */}
      {isEditing && (
        <View style={styles.saveButtonContainer}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.8}
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
                activeOpacity={0.8}
              >
                <Text style={styles.modalButtonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={toggleModal}
                activeOpacity={0.8}
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
    color: "#FFFFFF",
  },
  placeholderView: {
    width: 40,
    height: 40,
  },
  profileSection: {
    backgroundColor: COLORS.darkBlue,
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
    backgroundColor: COLORS.lightestBlue,
    justifyContent: "center",
    alignItems: "center",
  },
  profileImagePlaceholderText: {
    fontSize: 36,
    fontWeight: "bold",
    color: COLORS.darkBlue,
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
    borderColor: COLORS.darkBlue,
  },
  editIconSmall: {
    width: 16,
    height: 16,
    tintColor: COLORS.darkBlue,
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
  scrollViewContent: {
    paddingBottom: 20,
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
    alignItems: "center",
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
    borderBottomColor: COLORS.lightBlue,
    paddingVertical: 4,
  },
  multilineInput: {
    minHeight: 60,
    textAlignVertical: "top",
  },
  arrowIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
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
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  saveButton: {
    backgroundColor: COLORS.darkBlue,
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
    backgroundColor: COLORS.darkBlue,
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

export default MyProfile;