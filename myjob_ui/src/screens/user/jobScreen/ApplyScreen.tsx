import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  Linking,
  StatusBar,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import config from "../../../context/config";

// Color palette from the image
const COLORS = {
  darkBlue: "#021024",
  navyBlue: "#052659",
  mediumBlue: "#5483B3",
  lightBlue: "#7DA0C4",
  veryLightBlue: "#C1E8FF",
  white: "#FFFFFF",
};

const ApplyScreen = ({ route, navigation }) => {
  const { jobData } = route.params;
  const [isDescriptionView, setIsDescriptionView] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isCheckingSaved, setIsCheckingSaved] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const insets = useSafeAreaInsets();

  // Check if job is saved when screen loads
  useEffect(() => {
    checkIfJobIsSaved();
  }, []);

  // Function to check if job is already saved
  const checkIfJobIsSaved = async () => {
    try {
      setIsCheckingSaved(true);
      const userId = await AsyncStorage.getItem("userId");

      if (!userId) {
        setIsCheckingSaved(false);
        return;
      }

      console.log(
        `Checking saved status for jobId: ${jobData.jobId}, userId: ${userId}`
      );

      // 1. Check server first
      try {
        const response = await axios.get(
          `${config.apiUrl}/SavedJob/get/${userId}`
        );

        if (response.status === 200 && response.data.success) {
          const savedJobs = response.data.savedJobs || [];
          const isJobSaved = savedJobs.some(
            (savedJob) => savedJob.jobId === jobData.jobId
          );
          console.log("Job saved status (server):", isJobSaved);
          setIsSaved(isJobSaved);
          return; // Exit if server check is successful
        }
      } catch (serverError) {
        console.log(
          "Server check failed, falling back to local storage:",
          serverError.message
        );
      }

      // 2. Fall back to local storage if server check fails
      const savedJobsStr = await AsyncStorage.getItem("localSavedJobs");
      if (savedJobsStr) {
        const savedJobsObj = JSON.parse(savedJobsStr);
        const userSavedJobs = savedJobsObj[userId] || [];
        const isJobSaved = userSavedJobs.some(
          (job) => job.jobId === jobData.jobId
        );
        console.log("Job saved status (local):", isJobSaved);
        setIsSaved(isJobSaved);
      } else {
        setIsSaved(false);
      }
    } catch (error) {
      console.log("Error checking saved status:", error.message);
      setIsSaved(false);
    } finally {
      setIsCheckingSaved(false);
    }
  };

  // Function to update local storage saved jobs
  const updateLocalSavedJobs = async (userId, isSavingJob) => {
    try {
      // Get current saved jobs
      const savedJobsStr = await AsyncStorage.getItem("localSavedJobs");
      const savedJobsObj = savedJobsStr ? JSON.parse(savedJobsStr) : {};
      const userSavedJobs = savedJobsObj[userId] || [];

      let updatedJobs;

      if (isSavingJob) {
        // Add job if not already saved
        if (!userSavedJobs.some((job) => job.jobId === jobData.jobId)) {
          updatedJobs = [...userSavedJobs, jobData];
        } else {
          updatedJobs = userSavedJobs;
        }
      } else {
        // Remove job
        updatedJobs = userSavedJobs.filter(
          (job) => job.jobId !== jobData.jobId
        );
      }

      // Update storage
      const updatedSavedJobsObj = {
        ...savedJobsObj,
        [userId]: updatedJobs,
      };

      await AsyncStorage.setItem(
        "localSavedJobs",
        JSON.stringify(updatedSavedJobsObj)
      );
      console.log(
        `Job ${isSavingJob ? "added to" : "removed from"} local storage`
      );
    } catch (error) {
      console.log("Error updating local saved jobs:", error);
    }
  };

  // Function to handle save/unsave job
  const handleSaveJob = async () => {
    if (isSaving) return;

    try {
      setIsSaving(true);
      const userId = await AsyncStorage.getItem("userId");

      if (!userId) {
        Alert.alert("Sign In Required", "Please sign in to save jobs");
        setIsSaving(false);
        return;
      }

      if (!isSaved) {
        // Save job
        const saveData = {
          jobId: jobData.jobId,
          userId: userId,
          createdBy: 1,
          status: 1,
        };

        console.log("Saving job with data:", saveData);

        try {
          // Try to save on server first
          const response = await axios.post(
            `${config.apiUrl}/SavedJob/create`,
            saveData
          );

          if (response.status === 200 && response.data.success) {
            setIsSaved(true);
            // Also update local storage for backup
            await updateLocalSavedJobs(userId, true);
            Alert.alert("Success", "Job saved successfully");
          } else {
            throw new Error(response.data.message || "Failed to save job");
          }
        } catch (serverError) {
          console.log(
            "Server save failed, using local storage:",
            serverError.message
          );

          // Fall back to local storage if server save fails
          await updateLocalSavedJobs(userId, true);
          setIsSaved(true);
          Alert.alert("Success", "Job saved successfully (offline mode)");
        }
      } else {
        // Unsave job
        console.log(
          `Deleting saved job with userId: ${userId}, jobId: ${jobData.jobId}`
        );

        try {
          // Try to delete on server first
          const response = await axios.delete(
            `${config.apiUrl}/SavedJob/delete/${userId}/${jobData.jobId}`
          );

          if (response.status === 200) {
            setIsSaved(false);
            // Also update local storage for backup
            await updateLocalSavedJobs(userId, false);
            Alert.alert("Success", "Job removed from saved list");
          } else {
            throw new Error("Failed to remove job");
          }
        } catch (serverError) {
          console.log(
            "Server delete failed, using local storage:",
            serverError.message
          );

          // Fall back to local storage if server delete fails
          await updateLocalSavedJobs(userId, false);
          setIsSaved(false);
          Alert.alert("Success", "Job removed from saved list (offline mode)");
        }
      }
    } catch (error) {
      console.log("Error saving/unsaving job:", error);

      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status;
        const errorMessage = error.response?.data?.message || error.message;

        if (statusCode === 409) {
          // Job already saved
          setIsSaved(true);
          Alert.alert("Info", "This job is already saved");
        } else if (statusCode === 404) {
          if (!isSaved) {
            Alert.alert("Error", "Job not found. Cannot save job.");
          } else {
            // If trying to delete a job that doesn't exist in saved
            setIsSaved(false);
            Alert.alert("Info", "Job was not in your saved list");
          }
        } else {
          Alert.alert(
            "Error",
            `Failed to ${isSaved ? "remove" : "save"} job: ${errorMessage}`
          );
        }
      } else {
        Alert.alert(
          "Error",
          "An unexpected error occurred. Please try again later."
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Function to handle requirements parsing
  const renderRequirements = () => {
    try {
      if (!jobData.requirements)
        return <Text style={styles.noData}>No requirements available</Text>;

      // Check if requirements is already an array
      let requirementsData = Array.isArray(jobData.requirements)
        ? jobData.requirements
        : JSON.parse(jobData.requirements);

      // Ensure we have a valid array after parsing
      if (!Array.isArray(requirementsData)) {
        requirementsData = [requirementsData]; // Convert single value to array
      }

      return requirementsData.length > 0 ? (
        requirementsData.map((requirement, index) => (
          <View key={index} style={styles.requirementItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listItemText}>{requirement}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.noData}>No requirements available</Text>
      );
    } catch (error) {
      return <Text style={styles.noData}>No requirements available</Text>;
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: Platform.OS === "android" ? insets.top : 0 },
      ]}
    >
      <StatusBar backgroundColor={COLORS.navyBlue} barStyle="light-content" />

      {/* Fixed Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Image
            source={require("../../../assets/icons/backIcon.png")}
            style={styles.backIcon}
          />
        </Pressable>
        <Text style={styles.headerTitle}>Job Details</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        {/* Company Info Card */}
        <View style={styles.companyCard}>
          {jobData.logo ? (
            <Image
              source={{ uri: jobData.logo }}
              style={styles.logo}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoPlaceholderText}>
                {jobData.organizationName?.charAt(0) || "?"}
              </Text>
            </View>
          )}
          <Text style={styles.jobTitle}>
            {jobData.degName || "Position Name"}
          </Text>
          <Text style={styles.companyInfo}>
            {jobData.organizationName || "Company"} •{" "}
            {jobData.jobLocation || "Location"} •{" "}
            {jobData.postedTime || "Recently"}
          </Text>
        </View>

        {/* Toggle Buttons */}
        <View style={styles.tabsContainer}>
          <Pressable
            style={[
              styles.tabButton,
              isDescriptionView && styles.activeTabButton,
            ]}
            onPress={() => setIsDescriptionView(true)}
          >
            <Text
              style={[
                styles.tabButtonText,
                isDescriptionView && styles.activeTabText,
              ]}
            >
              Job Details
            </Text>
            {isDescriptionView && <View style={styles.tabIndicator} />}
          </Pressable>

          <Pressable
            style={[
              styles.tabButton,
              !isDescriptionView && styles.activeTabButton,
            ]}
            onPress={() => setIsDescriptionView(false)}
          >
            <Text
              style={[
                styles.tabButtonText,
                !isDescriptionView && styles.activeTabText,
              ]}
            >
              About Company
            </Text>
            {!isDescriptionView && <View style={styles.tabIndicator} />}
          </Pressable>
        </View>

        {isDescriptionView ? (
          // JOB DETAILS VIEW
          <View style={styles.contentContainer}>
            {/* Job Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.descriptionText}>
                {jobData.jobDescription || "No description available"}
              </Text>
            </View>

            {/* Requirements */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Requirements</Text>
              <View style={styles.requirementsContainer}>
                {renderRequirements()}
              </View>
            </View>

            {/* Location */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Location</Text>
              <Text style={styles.locationText}>
                {jobData.jobLocation || "No location specified"}
              </Text>
              {jobData.mapImage && (
                <Image
                  source={jobData.mapImage}
                  style={styles.mapImage}
                  accessibilityLabel="Job location map"
                />
              )}
            </View>

            {/* Job Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Job Information</Text>
              <View style={styles.infoCardContainer}>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Job Type</Text>
                  <Text style={styles.infoValue}>
                    {jobData.jobType || "Not specified"}
                  </Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Workplace</Text>
                  <Text style={styles.infoValue}>
                    {jobData.workPlaceType || "Not specified"}
                  </Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Experience</Text>
                  <Text style={styles.infoValue}>
                    {jobData.yearsOfExperience || "Not specified"}
                  </Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Salary</Text>
                  <Text style={styles.infoValue}>
                    {jobData.salary || "Not disclosed"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Facilities */}
            {jobData.facilities && jobData.facilities.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Benefits & Perks</Text>
                <View style={styles.facilitiesContainer}>
                  {jobData.facilities.map((facility, index) => (
                    <View key={index} style={styles.facilityItem}>
                      <View style={styles.facilityBullet} />
                      <Text style={styles.facilityText}>{facility}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        ) : (
          // COMPANY VIEW
          <View style={styles.contentContainer}>
            {/* About Company */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.descriptionText}>
                {jobData.about || "No company description available"}
              </Text>
            </View>

            {/* Industry */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Industry</Text>
              <Text style={styles.descriptionText}>
                {jobData.industry || "Not specified"}
              </Text>
            </View>

            {/* Company Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Company Details</Text>
              <View style={styles.detailsContainer}>
                {/* Since */}
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Established</Text>
                  <Text style={styles.detailValue}>
                    {jobData.since || "Not available"}
                  </Text>
                </View>

                {/* Head Office */}
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Head Office</Text>
                  <Text style={styles.detailValue}>
                    {jobData.headOffice || "Not available"}
                  </Text>
                </View>

                {/* Specialization */}
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Specialization</Text>
                  <Text style={styles.detailValue}>
                    {jobData.specialization || "Not available"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Website */}
            {jobData.website && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Website</Text>
                <Pressable onPress={() => Linking.openURL(jobData.website)}>
                  <Text style={styles.websiteLink}>{jobData.website}</Text>
                </Pressable>
              </View>
            )}

            {/* Contact */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contact Information</Text>
              <View style={styles.contactContainer}>
                {jobData.email && (
                  <Pressable
                    style={styles.contactItem}
                    onPress={() => Linking.openURL(`mailto:${jobData.email}`)}
                  >
                    <Image
                      source={require("../../../assets/icons/email.png")}
                      style={styles.contactIcon}
                    />
                    <Text style={styles.contactText}>{jobData.email}</Text>
                  </Pressable>
                )}

                {jobData.phoneNo && (
                  <Pressable
                    style={styles.contactItem}
                    onPress={() => Linking.openURL(`tel:${jobData.phoneNo}`)}
                  >
                    <Image
                      source={require("../../../assets/icons/phone.png")}
                      style={styles.contactIcon}
                    />
                    <Text style={styles.contactText}>{jobData.phoneNo}</Text>
                  </Pressable>
                )}
              </View>
            </View>

            {/* Company Gallery */}
            {Array.isArray(jobData.gallery) && jobData.gallery.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Gallery</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.galleryContainer}
                >
                  {jobData.gallery.map((image, index) => (
                    <Image
                      key={index}
                      style={styles.galleryImage}
                      source={image}
                    />
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        )}

        {/* Add extra space at bottom to ensure content doesn't get hidden behind footer */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Elevated Footer - Fixed at bottom */}
      <View style={styles.footer}>
        <Pressable
          style={styles.saveButton}
          onPress={handleSaveJob}
          disabled={isSaving || isCheckingSaved}
        >
          {isCheckingSaved ? (
            <ActivityIndicator size="small" color={COLORS.mediumBlue} />
          ) : isSaving ? (
            <ActivityIndicator size="small" color={COLORS.mediumBlue} />
          ) : (
            <Image
              source={require("../../../assets/icons/save.png")}
              style={[
                styles.saveIcon,
                isSaved && { tintColor: COLORS.mediumBlue },
              ]}
            />
          )}
        </Pressable>

        <Pressable
          style={styles.applyButton}
          onPress={() => navigation.navigate("UploadCV", { jobData })}
        >
          <Text style={styles.applyButtonText}>APPLY NOW</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.navyBlue,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    width: 20,
    height: 20,
    tintColor: COLORS.white,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    backgroundColor: "#F5F7FA",
  },
  companyCard: {
    backgroundColor: COLORS.navyBlue,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: "center",
    shadowColor: COLORS.darkBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  logo: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.white,
    marginTop: 8,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  logoPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.lightBlue,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  logoPlaceholderText: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.white,
  },
  jobTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: 8,
    textAlign: "center",
  },
  companyInfo: {
    fontSize: 14,
    color: COLORS.veryLightBlue,
    textAlign: "center",
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    position: "relative",
  },
  activeTabButton: {
    backgroundColor: COLORS.white,
  },
  tabButtonText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#6B7280",
  },
  activeTabText: {
    color: COLORS.navyBlue,
    fontWeight: "700",
  },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    width: "50%",
    height: 3,
    backgroundColor: COLORS.navyBlue,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.darkBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: COLORS.navyBlue,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#374151",
  },
  requirementsContainer: {
    marginTop: 4,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.mediumBlue,
    marginTop: 8,
    marginRight: 10,
  },
  listItemText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: "#374151",
  },
  locationText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#374151",
    marginBottom: 12,
  },
  mapImage: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    marginTop: 8,
  },
  infoCardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    justifyContent: "space-between",
  },
  infoCard: {
    width: "48%",
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.darkBlue,
    fontWeight: "600",
  },
  facilitiesContainer: {
    marginTop: 4,
  },
  facilityItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  facilityBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.mediumBlue,
    marginRight: 10,
  },
  facilityText: {
    fontSize: 14,
    color: "#374151",
  },
  detailsContainer: {
    marginTop: 4,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: "#6B7280",
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.darkBlue,
    fontWeight: "500",
    flex: 2,
    textAlign: "right",
  },
  websiteLink: {
    fontSize: 14,
    color: COLORS.mediumBlue,
    textDecorationLine: "underline",
  },
  contactContainer: {
    marginTop: 8,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  contactIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
    tintColor: COLORS.mediumBlue,
  },
  contactText: {
    fontSize: 14,
    color: "#374151",
  },
  galleryContainer: {
    paddingVertical: 8,
  },
  galleryImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 12,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: COLORS.white,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 16,
    zIndex: 999,
  },
  saveButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F5F7FA",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  saveIcon: {
    width: 24,
    height: 24,
  },
  applyButton: {
    flex: 1,
    backgroundColor: COLORS.navyBlue,
    borderRadius: 10,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  applyButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  noData: {
    color: "#6B7280",
    fontStyle: "italic",
    fontSize: 14,
    marginTop: 4,
  },
});

export default ApplyScreen;
