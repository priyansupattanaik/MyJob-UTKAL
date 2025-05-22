import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Image,
  Alert,
  ScrollView,
  Platform,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DocumentPicker, {
  DocumentPickerResponse,
} from "react-native-document-picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import config from "../../../context/config";

// Color palette from the image
const COLORS = {
  darkestBlue: "#021024", // Almost black-blue
  darkBlue: "#052659", // Dark navy blue
  mediumBlue: "#5483B3", // Medium steel blue
  lightBlue: "#7DA0C4", // Light blue
  lightestBlue: "#C1E8FF", // Very light sky blue
  white: "#FFFFFF",
  black: "#000000",
  error: "#E53935",
  success: "#43A047",
  warning: "#FBC02D",
  caption: "#546E7A",
  background: "#F5F7FA",
  cardBg: "#FFFFFF",
  outline: "#E0E0E0",
  cardOutline: "#E1E5EB",
  divider: "#E8EAF0",
};

const UploadCV = ({ route, navigation }) => {
  const { jobData } = route.params;
  const type = "job";
  const [selectedCV, setSelectedCV] = useState(null);
  const [isApplicationSubmitted, setIsApplicationSubmitted] = useState(false);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const insets = useSafeAreaInsets();

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf],
      });
      setSelectedCV(result[0]);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker
      } else {
        Alert.alert("Error", "An error occurred while picking the document");
      }
    }
  };

  const handleApplyNow = async () => {
    if (!selectedCV) {
      Alert.alert("Required", "Please upload your CV before applying.");
      return;
    }

    if (!description.trim()) {
      Alert.alert(
        "Required",
        "Please add a brief description about why you are suitable for this job."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const userId = await AsyncStorage.getItem("userId");
      const createdBy = await AsyncStorage.getItem("type");

      if (!userId || !createdBy) {
        Alert.alert(
          "Error",
          "User information is missing. Please sign in again."
        );
        setIsSubmitting(false);
        return;
      }

      // Prepare the application data and resume in FormData
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("compId", jobData.compId);
      formData.append("jobId", jobData.jobId);
      formData.append("description", description);
      formData.append("createdBy", createdBy);
      formData.append("type", type);
      formData.append("resume", {
        uri:
          Platform.OS === "android"
            ? selectedCV.uri
            : selectedCV.uri.replace("file://", ""),
        name: selectedCV.name,
        type: selectedCV.type,
      });

      // Send POST request with FormData using Axios
      const response = await axios.post(
        `${config.apiUrl}/requestApplication/create`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setIsApplicationSubmitted(true);
      console.log("Application submitted successfully:", response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error || "Failed to submit application.";
        Alert.alert("Error", errorMessage);
      } else {
        Alert.alert("Error", "Something went wrong. Please try again.");
      }
      console.error("Error submitting application:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fixed navigation functions to use TabNavigator with correct initial tab
  const goToHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "TabNavigator", params: { screen: "Home" } }],
    });
  };

  const goToJobs = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "TabNavigator", params: { screen: "Jobs" } }],
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View
        style={[
          styles.container,
          { paddingTop: Platform.OS === "android" ? insets.top : 0 },
        ]}
      >
        <StatusBar
          backgroundColor={COLORS.darkestBlue}
          barStyle="light-content"
        />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Image
              source={require("../../../assets/icons/backIcon.png")}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Apply For Job</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Job Info Card */}
          <View style={styles.jobInfoCard}>
            <View style={styles.companyLogoContainer}>
              <Image
                source={{ uri: jobData.logo }}
                style={styles.companyLogo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.jobTitle}>
              {jobData.degName || "Job Position"}
            </Text>
            <Text style={styles.companyName}>
              {jobData.organizationName || "Company"} •{" "}
              {jobData.jobLocation || "Location"}
            </Text>

            {/* Job Tags */}
            {Array.isArray(jobData.tags) && jobData.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {jobData.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {!isApplicationSubmitted ? (
            <>
              {/* Upload CV Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Upload CV/Resume</Text>
                <Text style={styles.sectionDescription}>
                  Please upload your CV in PDF format to apply for this position
                </Text>

                {!selectedCV ? (
                  <TouchableOpacity
                    style={styles.uploadBox}
                    onPress={pickDocument}
                    activeOpacity={0.7}
                  >
                    <View style={styles.uploadIconContainer}>
                      <Image
                        source={require("../../../assets/icons/Upload.png")}
                        style={styles.uploadIcon}
                      />
                    </View>
                    <Text style={styles.uploadText}>Select PDF File</Text>
                    <Text style={styles.uploadSubtext}>
                      Maximum file size: 5MB
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.filePreview}>
                    <View style={styles.fileInfo}>
                      <View style={styles.pdfIconContainer}>
                        <Image
                          source={require("../../../assets/icons/PDF.png")}
                          style={styles.pdfIcon}
                        />
                      </View>
                      <View style={styles.fileDetails}>
                        <Text
                          style={styles.fileName}
                          numberOfLines={1}
                          ellipsizeMode="middle"
                        >
                          {selectedCV.name || "Document.pdf"}
                        </Text>
                        <Text style={styles.fileSize}>
                          {selectedCV.size
                            ? `${(selectedCV.size / 1024).toFixed(0)} KB`
                            : "Unknown size"}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => setSelectedCV(null)}
                      >
                        <Image
                          source={require("../../../assets/icons/close.png")}
                          style={styles.removeIcon}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>

              {/* Cover Letter Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Why are you a good fit?</Text>
                <Text style={styles.sectionDescription}>
                  Tell the employer why you're suitable for this position
                </Text>

                <TextInput
                  style={styles.coverLetterInput}
                  placeholder="Explain why you're interested in this role and what makes you a strong candidate..."
                  placeholderTextColor={COLORS.caption}
                  multiline={true}
                  numberOfLines={8}
                  textAlignVertical="top"
                  value={description}
                  onChangeText={setDescription}
                />
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleApplyNow}
                disabled={isSubmitting}
                activeOpacity={0.8}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    SUBMIT APPLICATION
                  </Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            // Success View
            <View style={styles.successContainer}>
              <View style={styles.successCircle}>
                <Image
                  source={require("../../../assets/icons/illustration.png")}
                  style={styles.successImage}
                  resizeMode="contain"
                />
              </View>

              <Text style={styles.successTitle}>Application Submitted!</Text>
              <Text style={styles.successMessage}>
                Your application has been submitted successfully. The employer
                will contact you if they're interested.
              </Text>

              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={goToJobs}
                >
                  <Text style={styles.secondaryButtonText}>FIND MORE JOBS</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={goToHome}
                >
                  <Text style={styles.primaryButtonText}>GO TO HOME</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={{ height: 30 }} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.darkBlue,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    elevation: 4,
    shadowColor: COLORS.darkestBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: COLORS.white,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "700",
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  jobInfoCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: COLORS.darkestBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  companyLogoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.cardOutline,
    overflow: "hidden",
  },
  companyLogo: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  jobTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.darkBlue,
    marginBottom: 8,
    textAlign: "center",
  },
  companyName: {
    fontSize: 15,
    color: COLORS.caption,
    marginBottom: 12,
    textAlign: "center",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  tag: {
    backgroundColor: "rgba(84, 131, 179, 0.1)",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    margin: 4,
  },
  tagText: {
    fontSize: 12,
    color: COLORS.mediumBlue,
    fontWeight: "500",
  },
  section: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.darkestBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.darkBlue,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: COLORS.caption,
    marginBottom: 16,
  },
  uploadBox: {
    borderWidth: 2,
    borderColor: COLORS.outline,
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(193, 232, 255, 0.1)",
  },
  uploadIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(84, 131, 179, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  uploadIcon: {
    width: 30,
    height: 30,
    tintColor: COLORS.mediumBlue,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.darkBlue,
    marginBottom: 6,
  },
  uploadSubtext: {
    fontSize: 12,
    color: COLORS.caption,
  },
  filePreview: {
    borderWidth: 1,
    borderColor: COLORS.outline,
    borderRadius: 12,
    overflow: "hidden",
  },
  fileInfo: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "rgba(193, 232, 255, 0.2)",
  },
  pdfIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "rgba(229, 57, 53, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  pdfIcon: {
    width: 28,
    height: 28,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.darkBlue,
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 12,
    color: COLORS.caption,
  },
  removeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(229, 57, 53, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  removeIcon: {
    width: 16,
    height: 16,
    tintColor: COLORS.error,
  },
  coverLetterInput: {
    borderWidth: 1,
    borderColor: COLORS.outline,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: COLORS.darkBlue,
    backgroundColor: COLORS.cardBg,
    minHeight: 180,
  },
  submitButton: {
    backgroundColor: COLORS.darkBlue,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: COLORS.darkestBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  successContainer: {
    alignItems: "center",
    padding: 20,
    marginTop: 24,
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(67, 160, 71, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  successImage: {
    width: 100,
    height: 100,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.darkBlue,
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 16,
    color: COLORS.caption,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  buttonsContainer: {
    width: "100%",
    marginTop: 16,
  },
  secondaryButton: {
    backgroundColor: "rgba(193, 232, 255, 0.3)",
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.mediumBlue,
  },
  secondaryButtonText: {
    color: COLORS.mediumBlue,
    fontSize: 16,
    fontWeight: "600",
  },
  primaryButton: {
    backgroundColor: COLORS.darkBlue,
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.darkestBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default UploadCV;
