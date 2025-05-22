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

// Material Design colors - matching UserRegn
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

const OrganizationRegn = ({ navigation }) => {
  // =========== STATE MANAGEMENT ===========
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Consolidated state for all organization information
  const [formData, setFormData] = useState({
    organizationName: "",
    password: "",
    address: "",
    description: "",
    phoneNo: "",
    logo: null,
    email: "",
    website: "",
    socialMediaLink: "",
    industry: "",
    specialization: "",
    since: new Date().getFullYear().toString(),
  });

  // Date picker state
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [datePicker, setDatePicker] = useState(new Date());

  // Ref for scrolling
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
      maxHeight: 1200,
      maxWidth: 1200,
      quality: 0.8,
    };

    try {
      launchImageLibrary(options, (response) => {
        if (response.didCancel) return;

        if (
          response.assets &&
          response.assets.length > 0 &&
          response.assets[0].uri
        ) {
          updateFormField("logo", response.assets[0].uri);
        } else if (response.errorCode) {
          Alert.alert("Error", "Failed to select image. Please try again.");
        }
      });
    } catch (error) {
      console.log("Image picker error:", error);
    }
  }, [updateFormField]);

  // =========== DATE PICKER ===========
  const showDatePickerModal = useCallback(() => {
    Keyboard.dismiss();
    setShowYearPicker(true);
  }, []);

  const onYearChange = useCallback(
    (_, selectedDate) => {
      setShowYearPicker(Platform.OS === "ios");

      if (selectedDate) {
        setDatePicker(selectedDate);
        updateFormField("since", selectedDate.getFullYear().toString());
      }
    },
    [updateFormField]
  );

  // =========== VALIDATION ===========
  const validateForm = useCallback(() => {
    const newErrors = {};
    const { organizationName, password, address, phoneNo, email, industry } =
      formData;

    // Required field validation
    if (!organizationName)
      newErrors.organizationName = "Organization name is required";

    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (!address) newErrors.address = "Address is required";

    if (!phoneNo) newErrors.phoneNo = "Phone number is required";

    if (!email) newErrors.email = "Email is required";
    else if (!email.includes("@") || !email.includes("."))
      newErrors.email = "Please enter a valid email address";

    if (!industry) newErrors.industry = "Industry is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // =========== DATA SUBMISSION ===========
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      // Scroll to top if there are errors (a better implementation would scroll to first error)
      if (scrollViewRef.current) {
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

      // Append all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "logo") {
          formDataObj.append(key, value || "");
        }
      });

      // Append logo if exists
      if (formData.logo) {
        const fileExt = formData.logo.split(".").pop() || "jpg";

        formDataObj.append("logo", {
          uri:
            Platform.OS === "android"
              ? formData.logo
              : formData.logo.replace("file://", ""),
          type: `image/${fileExt}`,
          name: `organization_logo.${fileExt}`,
        });
      }

      // Send request
      const response = await axios.post(
        `${config.apiUrl}/organizationDetails/create`,
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
        Alert.alert(
          "Registration Successful",
          "Your organization has been registered successfully!",
          [{ text: "Sign In", onPress: () => navigation.replace("Login") }]
        );
      }
    } catch (error) {
      setIsLoading(false);

      Alert.alert(
        "Registration Failed",
        error.response?.data?.message ||
          "Something went wrong. Please try again.",
        [{ text: "OK" }]
      );
    }
  }, [formData, validateForm, navigation]);

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
      iconSource,
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
          {iconSource && (
            <Image
              source={iconSource}
              style={[styles.inputIcon, multiline && { marginTop: 12 }]}
              tintColor={COLORS.primary}
            />
          )}
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
              field === "email" ||
              field === "password" ||
              field === "website" ||
              field === "socialMediaLink"
                ? "none"
                : "sentences"
            }
          />
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
            source={require("../../assets/icons/backIcon.png")}
            style={styles.backIcon}
            tintColor={COLORS.surface}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Register Organization</Text>
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
          {/* Organization Logo */}
          <View style={styles.logoContainer}>
            <TouchableOpacity
              style={styles.logoUpload}
              activeOpacity={0.7}
              onPress={pickImage}
            >
              {formData.logo ? (
                <>
                  <Image
                    source={{ uri: formData.logo }}
                    style={styles.logoImage}
                  />
                  <View style={styles.editIconContainer}>
                    <Image
                      source={require("../../assets/icons/edit.png")}
                      style={styles.editIcon}
                      tintColor="#FFFFFF"
                    />
                  </View>
                </>
              ) : (
                <View style={styles.logoPlaceholder}>
                  <Image
                    source={require("../../assets/icons/building.png")}
                    style={styles.buildingIcon}
                    tintColor="#FFFFFF"
                  />
                  <Text style={styles.logoText}>Upload Logo</Text>
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.logoHint}>
              Organization logo helps with brand recognition
            </Text>
          </View>

          {/* Form Sections */}
          <View style={styles.formContainer}>
            {/* Basic Information Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Basic Information</Text>

              {renderInputField({
                field: "organizationName",
                label: "Organization Name",
                placeholder: "Enter organization name",
                required: true,
                iconSource: require("../../assets/icons/building.png"),
              })}

              {renderInputField({
                field: "password",
                label: "Password",
                placeholder: "Create a password",
                secureTextEntry: true,
                required: true,
                iconSource: require("../../assets/icons/lock.png"),
              })}

              {renderInputField({
                field: "email",
                label: "Email Address",
                placeholder: "Organization email",
                keyboardType: "email-address",
                required: true,
                iconSource: require("../../assets/icons/mail.png"),
              })}

              {renderInputField({
                field: "phoneNo",
                label: "Phone Number",
                placeholder: "Contact number",
                keyboardType: "phone-pad",
                required: true,
                maxLength: 15,
                iconSource: require("../../assets/icons/phone.png"),
              })}

              {renderInputField({
                field: "address",
                label: "Address",
                placeholder: "Organization address",
                multiline: true,
                numberOfLines: 3,
                required: true,
                iconSource: require("../../assets/icons/Location.png"),
              })}
            </View>

            {/* Additional Information Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Additional Information</Text>

              {renderInputField({
                field: "industry",
                label: "Industry",
                placeholder: "Industry type",
                required: true,
                iconSource: require("../../assets/icons/briefcase.png"),
              })}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Year Founded <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  activeOpacity={0.7}
                  onPress={showDatePickerModal}
                >
                  <Image
                    source={require("../../assets/icons/calendar.png")}
                    style={styles.inputIcon}
                    tintColor={COLORS.primary}
                  />
                  <Text style={styles.dateText}>{formData.since}</Text>
                  <View style={{ flex: 1 }} />
                  <Image
                    source={require("../../assets/icons/arrow-down.png")}
                    style={styles.arrowIcon}
                    tintColor={COLORS.textSecondary}
                  />
                </TouchableOpacity>
                {showYearPicker && (
                  <DateTimePicker
                    value={datePicker}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={onYearChange}
                    maximumDate={new Date()}
                    minimumDate={new Date(1900, 0, 1)}
                  />
                )}
              </View>

              {renderInputField({
                field: "description",
                label: "Description",
                placeholder: "Tell us about your organization",
                multiline: true,
                numberOfLines: 4,
                iconSource: require("../../assets/icons/info.png"),
              })}

              {renderInputField({
                field: "specialization",
                label: "Specialization",
                placeholder: "Your organization's specialization (optional)",
                iconSource: require("../../assets/icons/star.png"),
              })}

              {renderInputField({
                field: "website",
                label: "Website",
                placeholder: "Organization website (optional)",
                keyboardType: "url",
                iconSource: require("../../assets/icons/globe.png"),
              })}

              {renderInputField({
                field: "socialMediaLink",
                label: "Social Media",
                placeholder: "Social media link (optional)",
                keyboardType: "url",
                iconSource: require("../../assets/icons/social.png"),
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
              <Text style={styles.submitButtonText}>Register Organization</Text>
            )}
          </TouchableOpacity>

          {/* Already have account link */}
          <TouchableOpacity
            style={styles.loginLinkContainer}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.loginLinkText}>
              Already registered? <Text style={styles.loginLink}>Sign in</Text>
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
  logoContainer: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 16,
  },
  logoUpload: {
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
  logoImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  logoPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  buildingIcon: {
    width: 32,
    height: 32,
    marginBottom: 6,
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
  logoText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  logoHint: {
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
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.divider,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
  },
  inputIcon: {
    width: 20,
    height: 20,
    marginLeft: 12,
    marginRight: 12,
  },
  arrowIcon: {
    width: 16,
    height: 16,
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 12,
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
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.divider,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    paddingVertical: 12,
  },
  dateText: {
    fontSize: 16,
    color: COLORS.textPrimary,
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

export default OrganizationRegn;
