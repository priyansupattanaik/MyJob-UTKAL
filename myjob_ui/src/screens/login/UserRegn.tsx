import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import config from "../../context/config";

const { width } = Dimensions.get("window");

// Material Design colors
const COLORS = {
  primary: "#2196F3", // Material Blue
  primaryDark: "#1976D2",
  primaryLight: "#BBDEFB",
  accent: "#448AFF",
  textPrimary: "#212121",
  textSecondary: "#757575",
  divider: "#BDBDBD",
  background: "#F5F7FA",
  surface: "#FFFFFF",
  error: "#F44336",
  success: "#4CAF50",
};

// Assets preloading for optimization
const ASSETS = {
  backIcon: require("../../assets/icons/backIcon.png"),
  cameraIcon: require("../../assets/icons/camera.png"),
  editIcon: require("../../assets/icons/edit.png"),
  calendarIcon: require("../../assets/icons/calendar.png"),
};

const UserRegn = ({ navigation }) => {
  // =========== STATE MANAGEMENT ===========
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    middleName: "",
    lastName: "",
    phone: "",
    gender: "",
    dob: "",
    maritalStatus: "",
    permanentAddress: "",
    pin: "",
    bio: "",
    primaryJobPreference: "",
  });
  const [logo, setLogo] = useState(null);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState({});

  // Refs for scrolling to fields
  const scrollViewRef = useRef(null);

  // =========== FORM HANDLERS ===========
  const updateFormField = useCallback(
    (field, value) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear error when field is updated
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: null }));
      }
    },
    [errors]
  );

  // =========== IMAGE PICKER ===========
  const pickImage = useCallback(() => {
    const options = {
      mediaType: "photo",
      includeBase64: false,
      maxHeight: 1000,
      maxWidth: 1000,
      quality: 0.8,
    };

    try {
      launchImageLibrary(options, (response) => {
        if (
          !response.didCancel &&
          !response.errorCode &&
          response.assets?.[0]?.uri
        ) {
          setLogo(response.assets[0].uri);
        } else if (response.errorCode) {
          Alert.alert("Error", "Failed to select image. Please try again.");
        }
      });
    } catch (error) {
      console.log("Image picker error:", error);
    }
  }, []);

  // =========== DATE PICKER ===========
  const showDatePickerModal = useCallback(() => {
    Keyboard.dismiss();
    setShowDatePicker(true);
  }, []);

  const onDateChange = useCallback(
    (_, selectedDate) => {
      setShowDatePicker(Platform.OS === "ios");

      if (selectedDate) {
        setDate(selectedDate);

        // Format date
        const day = String(selectedDate.getDate()).padStart(2, "0");
        const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
        const year = selectedDate.getFullYear();

        updateFormField("dob", `${day}/${month}/${year}`);
      }
    },
    [updateFormField]
  );

  // =========== VALIDATION ===========
  const validateForm = useCallback(() => {
    const newErrors = {};
    const requiredFields = [
      "email",
      "password",
      "firstName",
      "phone",
      "gender",
      "permanentAddress",
      "pin",
      "primaryJobPreference",
    ];

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = `${
          field.charAt(0).toUpperCase() +
          field
            .slice(1)
            .replace(/([A-Z])/g, " $1")
            .trim()
        } is required`;
      }
    });

    // Email validation
    if (
      formData.email &&
      (!formData.email.includes("@") || !formData.email.includes("."))
    ) {
      newErrors.email = "Please enter a valid email";
    }

    // Password validation
    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // =========== DATA SUBMISSION ===========
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      // Scroll to first error
      const errorFields = Object.keys(errors);
      if (errorFields.length > 0 && scrollViewRef.current) {
        // This would be better with actual refs to each field
        scrollViewRef.current.scrollTo({ y: 0, animated: true });
      }
      Alert.alert(
        "Missing Information",
        "Please fill all required fields correctly."
      );
      return;
    }

    setIsLoading(true);

    try {
      const formDataObj = new FormData();

      // Append form fields
      Object.entries(formData).forEach(([key, value]) => {
        formDataObj.append(key, value || "");
      });

      // Append logo if exists
      if (logo) {
        const fileExt = logo.split(".").pop() || "jpg";

        formDataObj.append("logo", {
          uri: Platform.OS === "android" ? logo : logo.replace("file://", ""),
          type: `image/${fileExt}`,
          name: `profile_photo.${fileExt}`,
        });
      }

      // API call
      const response = await axios.post(
        `${config.apiUrl}/personalDetails/create`,
        formDataObj,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
          },
          transformRequest: (data) => data,
        }
      );

      setIsLoading(false);

      if (response.status === 201) {
        Alert.alert("Success!", "Your account has been created successfully.", [
          { text: "Sign In", onPress: () => navigation.replace("Login") },
        ]);
      }
    } catch (error) {
      setIsLoading(false);

      const errorMsg =
        error.response?.data?.message ||
        "Registration failed. Please check your details and try again.";

      Alert.alert("Registration Failed", errorMsg);
    }
  }, [formData, logo, navigation, validateForm, errors]);

  // =========== RENDER HELPERS ===========
  const renderInputField = useCallback(
    ({
      field,
      label,
      placeholder,
      keyboardType = "default",
      secureTextEntry = false,
      multiline = false,
      numberOfLines = 1,
      required = false,
      maxLength,
    }) => (
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          {label} {required && <Text style={styles.requiredStar}>*</Text>}
        </Text>
        <View
          style={[
            styles.inputContainer,
            errors[field] ? styles.inputError : null,
          ]}
        >
          <TextInput
            style={[
              styles.input,
              multiline && {
                height: numberOfLines * 20,
                textAlignVertical: "top",
                paddingTop: 12,
              },
            ]}
            placeholder={placeholder}
            placeholderTextColor="rgba(0,0,0,0.3)"
            value={formData[field]}
            onChangeText={(text) => updateFormField(field, text)}
            keyboardType={keyboardType}
            secureTextEntry={secureTextEntry}
            multiline={multiline}
            numberOfLines={multiline ? numberOfLines : 1}
            maxLength={maxLength}
            autoCapitalize={
              field === "email" || field === "password"
                ? "none"
                : field === "firstName" ||
                  field === "lastName" ||
                  field === "middleName"
                ? "words"
                : "sentences"
            }
          />
        </View>
        {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
      </View>
    ),
    [formData, updateFormField, errors]
  );

  const renderOptionButtons = useCallback(
    ({ field, options, required = false }) => (
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          {field.charAt(0).toUpperCase() +
            field
              .slice(1)
              .replace(/([A-Z])/g, " $1")
              .trim()}
          {required && <Text style={styles.requiredStar}>*</Text>}
        </Text>
        <View
          style={[
            styles.optionsContainer,
            errors[field] ? styles.inputError : null,
          ]}
        >
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                formData[field] === option.value && styles.selectedOption,
              ]}
              onPress={() => updateFormField(field, option.value)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.optionText,
                  formData[field] === option.value && styles.selectedOptionText,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
      </View>
    ),
    [formData, updateFormField, errors]
  );

  // =========== MAIN RENDER ===========
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        backgroundColor={COLORS.primary}
        barStyle="light-content"
        translucent={false}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Image
            source={ASSETS.backIcon}
            style={styles.backIcon}
            tintColor={COLORS.surface}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Account</Text>
        <View style={styles.placeholderView} />
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Profile Image Section */}
          <View style={styles.profileImageContainer}>
            <TouchableOpacity
              style={styles.profileImagePicker}
              activeOpacity={0.7}
              onPress={pickImage}
            >
              {logo ? (
                <>
                  <Image source={{ uri: logo }} style={styles.profileImage} />
                  <View style={styles.editIconContainer}>
                    <Image
                      source={ASSETS.editIcon}
                      style={styles.editIcon}
                      tintColor="#FFFFFF"
                    />
                  </View>
                </>
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <View style={styles.cameraIconContainer}>
                    <Image
                      source={ASSETS.cameraIcon}
                      style={styles.cameraIcon}
                      tintColor="#FFFFFF"
                    />
                  </View>
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.photoHint}>
              Profile photo helps employers recognize you
            </Text>
          </View>

          <View style={styles.formContainer}>
            {/* Personal Information Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Personal Information</Text>

              <View style={styles.row}>
                <View style={[styles.column, { marginRight: 8 }]}>
                  {renderInputField({
                    field: "firstName",
                    label: "First Name",
                    placeholder: "Your first name",
                    required: true,
                  })}
                </View>
                <View style={[styles.column, { marginLeft: 8 }]}>
                  {renderInputField({
                    field: "lastName",
                    label: "Last Name",
                    placeholder: "Your last name",
                  })}
                </View>
              </View>

              {renderInputField({
                field: "middleName",
                label: "Middle Name",
                placeholder: "Your middle name (optional)",
              })}

              {renderInputField({
                field: "email",
                label: "Email Address",
                placeholder: "your.email@example.com",
                keyboardType: "email-address",
                required: true,
              })}

              {renderInputField({
                field: "password",
                label: "Password",
                placeholder: "Create a secure password",
                secureTextEntry: true,
                required: true,
              })}

              {renderInputField({
                field: "phone",
                label: "Phone Number",
                placeholder: "Your phone number",
                keyboardType: "phone-pad",
                required: true,
                maxLength: 15,
              })}

              <View style={styles.row}>
                <View style={[styles.column, { marginRight: 8 }]}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>
                      Date of Birth <Text style={styles.requiredStar}>*</Text>
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.datePickerButton,
                        errors.dob ? styles.inputError : null,
                      ]}
                      activeOpacity={0.7}
                      onPress={showDatePickerModal}
                    >
                      <Text
                        style={[
                          styles.dateText,
                          !formData.dob && styles.placeholderText,
                        ]}
                      >
                        {formData.dob || "Select date"}
                      </Text>
                      <Image
                        source={ASSETS.calendarIcon}
                        style={styles.calendarIcon}
                        tintColor={COLORS.primary}
                      />
                    </TouchableOpacity>
                    {showDatePicker && (
                      <DateTimePicker
                        value={date}
                        mode="date"
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={onDateChange}
                        maximumDate={new Date()}
                        minimumDate={new Date(1950, 0, 1)}
                      />
                    )}
                    {errors.dob && (
                      <Text style={styles.errorText}>{errors.dob}</Text>
                    )}
                  </View>
                </View>

                <View style={[styles.column, { marginLeft: 8 }]}>
                  {renderOptionButtons({
                    field: "gender",
                    options: [
                      { label: "Male", value: "Male" },
                      { label: "Female", value: "Female" },
                      { label: "Other", value: "Others" },
                    ],
                    required: true,
                  })}
                </View>
              </View>

              {renderOptionButtons({
                field: "maritalStatus",
                options: [
                  { label: "Single", value: "Unmarried" },
                  { label: "Married", value: "Married" },
                ],
              })}
            </View>

            {/* Additional Information Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Additional Information</Text>

              {renderInputField({
                field: "permanentAddress",
                label: "Permanent Address",
                placeholder: "Your complete address",
                multiline: true,
                numberOfLines: 3,
                required: true,
              })}

              {renderInputField({
                field: "pin",
                label: "PIN Code",
                placeholder: "Your area PIN code",
                keyboardType: "numeric",
                required: true,
                maxLength: 10,
              })}

              {renderInputField({
                field: "primaryJobPreference",
                label: "Primary Job Preference",
                placeholder: "What job are you looking for?",
                required: true,
              })}

              {renderInputField({
                field: "bio",
                label: "Bio",
                placeholder: "Tell us about yourself (optional)",
                multiline: true,
                numberOfLines: 4,
              })}
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Already have account link */}
          <TouchableOpacity
            style={styles.loginLinkContainer}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.loginLinkText}>
              Already have an account?{" "}
              <Text style={styles.loginLink}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.primary,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.surface,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  backIcon: {
    width: 20,
    height: 20,
  },
  placeholderView: {
    width: 36,
  },
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollViewContent: {
    paddingBottom: 30,
  },
  profileImageContainer: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 16,
  },
  profileImagePicker: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderWidth: 3,
    borderColor: COLORS.surface,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  cameraIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraIcon: {
    width: 20,
    height: 20,
  },
  editIconContainer: {
    position: "absolute",
    right: 8,
    bottom: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  editIcon: {
    width: 14,
    height: 14,
  },
  photoHint: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  formContainer: {
    paddingHorizontal: 16,
  },
  sectionContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  requiredStar: {
    color: COLORS.error,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: COLORS.divider,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  column: {
    flex: 1,
  },
  optionsContainer: {
    flexDirection: "row",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: COLORS.surface,
  },
  selectedOption: {
    backgroundColor: COLORS.primaryLight,
  },
  optionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  selectedOptionText: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: COLORS.divider,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dateText: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  placeholderText: {
    color: "rgba(0,0,0,0.3)",
  },
  calendarIcon: {
    width: 20,
    height: 20,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 16,
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  submitButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: "600",
  },
  loginLinkContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  loginLinkText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  loginLink: {
    color: COLORS.primary,
    fontWeight: "600",
  },
});

export default UserRegn;
