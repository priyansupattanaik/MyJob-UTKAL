import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  SafeAreaView,
  StatusBar,
  ScrollView,
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  FlatList,
  Dimensions,
  Alert,
  ActivityIndicator,
  ToastAndroid,
  Platform,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import config from "../../../context/config";
import { useFocusEffect } from "@react-navigation/native";

const { width } = Dimensions.get("window");

// Blue Monochromatic Color Palette from the provided image
const COLORS = {
  // Blues (from darkest to lightest)
  darkestBlue: "#021024", // Almost black-blue
  darkBlue: "#052659", // Dark navy blue
  mediumBlue: "#5483B3", // Medium steel blue
  lightBlue: "#7DA0C4", // Light blue
  lightestBlue: "#C1E8FF", // Very light sky blue

  // Standard UI colors
  white: "#FFFFFF",
  black: "#000000",
  error: "#E53935",
  success: "#43A047",
  warning: "#FBC02D",
  caption: "#546E7A",
  outline: "#E0E0E0",
  cardBg: "#F5F7FA",
  cardOutline: "#E1E5EB",
  divider: "#E8EAF0",
};

// Assigning semantic colors for the application
const UI_COLORS = {
  primary: COLORS.darkBlue,
  primaryDark: COLORS.darkestBlue,
  primaryLight: COLORS.mediumBlue,
  accentLight: COLORS.lightestBlue,
  background: COLORS.white,
  statusBar: COLORS.darkestBlue,
  chip1Bg: "rgba(5, 38, 89, 0.08)",
  chip2Bg: "rgba(84, 131, 179, 0.08)",
  chip3Bg: "rgba(125, 160, 196, 0.08)",
  chip4Bg: "rgba(193, 232, 255, 0.12)",
};

const UserHomeScreen = ({ navigation }) => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef(null);
  const [jobData, setJobdata] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingJobId, setSavingJobId] = useState(null); // Track which job is being saved/unsaved

  const [userData, setUserData] = useState({
    name: "",
    coverImage: "",
  });

  // Load locally saved jobs from AsyncStorage
  const loadLocalSavedJobs = async () => {
    try {
      const savedJobsStr = await AsyncStorage.getItem("localSavedJobs");
      if (savedJobsStr) {
        const savedJobs = JSON.parse(savedJobsStr);
        return savedJobs;
      }
      return {};
    } catch (error) {
      console.error("Error loading local saved jobs:", error);
      return {};
    }
  };

  // Save jobs to local storage
  const saveLocalSavedJobs = async (jobs) => {
    try {
      await AsyncStorage.setItem("localSavedJobs", JSON.stringify(jobs));
    } catch (error) {
      console.error("Error saving local jobs:", error);
    }
  };

  // Auto-scroll for banner
  useEffect(() => {
    const interval = setInterval(() => {
      if (images.length <= 1) return;

      const nextIndex = (currentIndex + 1) % images.length;
      setCurrentIndex(nextIndex);
      sliderRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }, 5000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  const renderBannerItem = ({ item }) => (
    <View style={styles.bannerItemContainer}>
      <Image source={item} style={styles.promoBanner} resizeMode="cover" />
    </View>
  );

  // Fetch job data
  const fetchJobData = async () => {
    setLoading(true);
    const apiUrl = `${config.apiUrl}/postedjob/getAll`;
    try {
      const response = await axios.get(apiUrl);
      if (response.status === 200 && response.data.data) {
        const transformedData = response.data.data.map((job) => ({
          jobId: job.jobId,
          compId: job.organization?.compId,
          jobRole: job.jobRole || "Untitled Job",
          companyName: job.companyName || "Unknown Company",
          jobLocation: job.jobLocation || "Unknown Location",
          tags: [
            ...(job.jobType ? [job.jobType] : []),
            ...(Array.isArray(job.workPlaceType)
              ? job.workPlaceType
              : job.workPlaceType
              ? [job.workPlaceType]
              : []),
          ],
          logo: job.organization?.logo
            ? `${config.apiUrl}/photo/${job.organization.logo}`
            : "https://via.placeholder.com/150",
          degName: job.degName || "Unknown Name",
          secName: job.secName || "Unknown Sector",
          skills: job.skills || [],
          jobDescription: job.jobDescription || "Unknown Job Description",
          yearsOfExperience: job.yearsOfExperience,
          requirements: job.requirements || [],
          jobType: job.jobType || "Unknown Job Type",
          workPlaceType: job.workPlaceType || "",
          organizationName: job.organization?.organizationName,
          headOffice: job.organization?.address,
          email: job.organization?.email,
          phoneNo: job.organization?.phoneNo,
          website: job.organization?.website,
          about: job.organization?.description,
          industry: job.organization?.industry,
          since: job.organization?.since,
          specialization: job.organization?.specialization,
        }));
        setJobdata(transformedData);
      }
    } catch (error) {
      console.log("Error fetching JobPost data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to check saved jobs status
  const fetchSavedJobs = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        console.log("User not logged in");
        return;
      }

      setUserId(userId);

      // Try server first
      try {
        const response = await axios.get(
          `${config.apiUrl}/SavedJob/get/${userId}`
        );

        if (response.status === 200 && response.data.success) {
          const savedJobsFromServer = response.data.savedJobs || [];

          // Get full job details
          const savedJobIds = savedJobsFromServer.map((job) => job.jobId);

          // Match with jobData to get full job details
          if (jobData.length > 0) {
            const fullSavedJobs = jobData.filter((job) =>
              savedJobIds.includes(job.jobId)
            );
            setSavedJobs(fullSavedJobs);
          } else {
            // Just store the IDs if we don't have full job data yet
            setSavedJobs(savedJobsFromServer);
          }

          return; // Exit if server check is successful
        }
      } catch (serverError) {
        // Silently handle 404 errors as it's expected when no saved jobs exist
        if (
          axios.isAxiosError(serverError) &&
          serverError.response?.status === 404
        ) {
          // No need to log anything here, it's an expected case
        } else {
          // Only log non-404 errors
          console.log(
            "Error fetching saved jobs:",
            serverError.message
          );
        }
      }

      // Fall back to local storage
      const savedJobsObj = await loadLocalSavedJobs();
      const userSavedJobs = savedJobsObj[userId] || [];
      setSavedJobs(userSavedJobs);
    } catch (error) {
      console.error("Error loading saved jobs:", error);
      setSavedJobs([]);
    }
  }, [jobData]);

  // Use focused effect to refresh saved jobs
  useFocusEffect(
    useCallback(() => {
      fetchSavedJobs();
    }, [fetchSavedJobs])
  );

  // Handle job save/unsave using server API with local storage fallback
  const handleSaveJob = async (job) => {
    try {
      // Set saving state for this job
      setSavingJobId(job.jobId);

      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        Alert.alert("Error", "Please sign in to save jobs");
        setSavingJobId(null);
        return;
      }

      // Check if job is already saved
      const isJobSaved = savedJobs.some(
        (savedJob) =>
          savedJob.jobId === job.jobId ||
          (typeof savedJob === "object" && savedJob.jobId === job.jobId)
      );

      if (isJobSaved) {
        // UNSAVE JOB
        try {
          // Try to delete on server first
          const response = await axios.delete(
            `${config.apiUrl}/SavedJob/delete/${userId}/${job.jobId}`
          );

          if (response.status === 200) {
            // Success - no need to log
          }
        } catch (serverError) {
          // Suppress all server errors for deletion
          // Continue with local storage update even if server fails
        }

        // Always update local storage
        const savedJobsObj = await loadLocalSavedJobs();
        const userSavedJobs = savedJobsObj[userId] || [];
        const updatedSavedJobs = userSavedJobs.filter(
          (savedJob) => savedJob.jobId !== job.jobId
        );

        // Update local storage
        const updatedSavedJobsObj = {
          ...savedJobsObj,
          [userId]: updatedSavedJobs,
        };
        await saveLocalSavedJobs(updatedSavedJobsObj);

        // Update state
        setSavedJobs(updatedSavedJobs);

        // Show success message
        if (Platform.OS === "android") {
          ToastAndroid.show("Job removed from saved list", ToastAndroid.SHORT);
        } else {
          Alert.alert("Success", "Job removed from saved list");
        }
      } else {
        // SAVE JOB
        try {
          // Try to save on server first
          const saveData = {
            jobId: job.jobId,
            userId: userId,
            createdBy: 1,
            status: 1,
          };

          const response = await axios.post(
            `${config.apiUrl}/SavedJob/create`,
            saveData
          );

          if (response.status === 200 && response.data.success) {
            // Success - no need to log
          }
        } catch (serverError) {
          // Suppress all server errors for saving
          // Continue with local storage update even if server fails
        }

        // Always update local storage with full job details
        const savedJobsObj = await loadLocalSavedJobs();
        const userSavedJobs = savedJobsObj[userId] || [];

        // Ensure we're not adding duplicates
        if (!userSavedJobs.some((savedJob) => savedJob.jobId === job.jobId)) {
          const updatedSavedJobs = [
            ...userSavedJobs,
            {
              ...job,
              userId: userId,
              createdAt: new Date().toISOString(),
            },
          ];

          // Update local storage
          const updatedSavedJobsObj = {
            ...savedJobsObj,
            [userId]: updatedSavedJobs,
          };
          await saveLocalSavedJobs(updatedSavedJobsObj);

          // Update state
          setSavedJobs(updatedSavedJobs);
        }

        // Show success message
        if (Platform.OS === "android") {
          ToastAndroid.show("Job saved successfully", ToastAndroid.SHORT);
        } else {
          Alert.alert("Success", "Job saved successfully");
        }
      }
    } catch (error) {
      console.error("Error handling save job:", error);
      if (Platform.OS === "android") {
        ToastAndroid.show("Failed to save job", ToastAndroid.SHORT);
      } else {
        Alert.alert("Error", "Failed to save job");
      }
    } finally {
      // Clear the saving state
      setSavingJobId(null);
    }
  };

  // Job card component (redesigned with new color palette)
  const JobCard = ({ item }) => {
    const isSaved = savedJobs.some(
      (savedJob) =>
        savedJob.jobId === item.jobId ||
        (typeof savedJob === "object" && savedJob.jobId === item.jobId)
    );

    const isSaving = savingJobId === item.jobId;

    const getSaveIcon = () => {
      return isSaved
        ? require("../../../assets/icons/MYJOB_LOGO_ICON.png")
        : require("../../../assets/icons/savela.png");
    };

    return (
      <Pressable
        style={styles.card}
        onPress={() => navigation.navigate("ApplyScreen", { jobData: item })}
        android_ripple={{ color: "rgba(5, 38, 89, 0.05)" }}
      >
        <View style={styles.cardHeader}>
          <View style={styles.logoContainer}>
            <Image
              source={
                item?.logo
                  ? { uri: item.logo }
                  : require("../../../assets/icons/computer-worker.png")
              }
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.titleContainer}>
            <Text style={styles.jobTitle}>{item.degName || "Role"}</Text>
            <Text style={styles.companyName}>
              {item.organizationName || "Unknown Company"}
            </Text>
            <Text style={styles.location}>
              📍 {item.jobLocation || "Unknown Location"}
            </Text>
          </View>
          <Pressable
            style={styles.saveButton}
            onPress={(e) => {
              e.stopPropagation();
              if (!isSaving) {
                handleSaveJob(item);
              }
            }}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={COLORS.mediumBlue} />
            ) : (
              <Image
                source={getSaveIcon()}
                style={[
                  styles.saveIcon,
                  { tintColor: isSaved ? COLORS.mediumBlue : COLORS.caption },
                ]}
              />
            )}
          </Pressable>
        </View>

        <View style={styles.tagsContainer}>
          {Array.isArray(item.tags) && item.tags.length > 0 ? (
            item.tags.map((tag, index) => (
              <View
                style={[
                  styles.tag,
                  {
                    backgroundColor:
                      index % 4 === 0
                        ? UI_COLORS.chip1Bg
                        : index % 4 === 1
                        ? UI_COLORS.chip2Bg
                        : index % 4 === 2
                        ? UI_COLORS.chip3Bg
                        : UI_COLORS.chip4Bg,
                  },
                ]}
                key={index}
              >
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noTags}>No tags available</Text>
          )}
        </View>

        <View style={styles.applyContainer}>
          <Text style={styles.tapToApplyText}>Tap to view details</Text>
          <View style={styles.applyButton}>
            <Text style={styles.applyText}>Apply</Text>
          </View>
        </View>
      </Pressable>
    );
  };

  const images = [
    require("../../../assets/Banner/1.png"),
    require("../../../assets/Banner/2.png"),
    require("../../../assets/Banner/3.png"),
    require("../../../assets/Banner/4.png"),
    require("../../../assets/Banner/5.png"),
    require("../../../assets/icons/Banner.png"),
  ];

  // Fetch user data on mount
  useEffect(() => {
    fetchJobData();

    const getUserId = async () => {
      const storedUserId = await AsyncStorage.getItem("userId");
      if (storedUserId) {
        setUserId(storedUserId);
        fetchUserData(storedUserId);
      }
    };

    getUserId();
  }, []);

  const fetchUserData = async (userId) => {
    try {
      const accessToken = await AsyncStorage.getItem("userToken");
      const id = await AsyncStorage.getItem("userId");

      const response = await axios.get(
        `${config.apiUrl}/personalDetails/get/${id}`,
        {
          headers: {
            Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
          },
        }
      );

      if (response.status === 200) {
        const data = response.data.data;
        setUserData({
          name: data.fullName || "User",
          coverImage: data.coverImage
            ? `${config.apiUrl}/userlogo/${data.coverImage}`
            : "",
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      // Just use default values instead of showing an alert
      setUserData({
        name: "User",
        coverImage: "",
      });
    }
  };

  return (
    <>
      <StatusBar
        backgroundColor={UI_COLORS.statusBar}
        barStyle="light-content"
      />
      <SafeAreaView style={{ flex: 0, backgroundColor: COLORS.darkestBlue }} />
      <SafeAreaView style={styles.container}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.mediumBlue} />
            <Text style={styles.loadingText}>Loading job opportunities...</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header Section with gradient background */}
            <View style={styles.headerBackground}>
              <View style={styles.header}>
                <View>
                  <Text style={styles.hello}>Hello,</Text>
                  <Text style={styles.name}>{userData.name}</Text>
                </View>
                <Pressable
                  style={styles.profileContainer}
                  onPress={() => navigation.navigate("MyProfile")}
                >
                  <Image
                    source={
                      userData?.coverImage
                        ? { uri: userData?.coverImage }
                        : require("../../../assets/icons/user.png")
                    }
                    style={styles.profileImage}
                  />
                </Pressable>
              </View>
            </View>

            {/* Banner Section */}
            <View style={styles.bannerContainer}>
              <FlatList
                ref={sliderRef}
                data={images}
                renderItem={renderBannerItem}
                keyExtractor={(item, index) => index.toString()}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(event) => {
                  const newIndex = Math.round(
                    event.nativeEvent.contentOffset.x / width
                  );
                  setCurrentIndex(newIndex);
                }}
                scrollEnabled={true}
              />

              {/* Pagination dots */}
              <View style={styles.paginationContainer}>
                {images.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.paginationDot,
                      index === currentIndex && styles.activePaginationDot,
                    ]}
                  />
                ))}
              </View>
            </View>

            {/* Job Opportunities Section */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderContainer}>
                <Text style={styles.sectionTitle}>Job Opportunities</Text>
                <Pressable
                  onPress={() => navigation.navigate("JobSearchScreen")}
                  hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                >
                  <Text style={styles.viewAllText}>View All</Text>
                </Pressable>
              </View>

              <View style={styles.jobListContainer}>
                {jobData.length > 0 ? (
                  jobData
                    .slice(0, 5)
                    .map((item) => <JobCard key={item.jobId} item={item} />)
                ) : (
                  <View style={styles.emptyStateContainer}>
                    <Image
                      source={require("../../../assets/icons/computer-worker.png")}
                      style={styles.emptyStateIcon}
                    />
                    <Text style={styles.emptyStateText}>
                      No jobs available at the moment
                    </Text>
                    <Text style={styles.emptyStateSubtext}>
                      Check back later for new opportunities
                    </Text>
                  </View>
                )}
              </View>

              {jobData.length > 5 && (
                <Pressable
                  style={styles.loadMoreButton}
                  onPress={() => navigation.navigate("JobSearchScreen")}
                  android_ripple={{ color: "rgba(5, 38, 89, 0.1)" }}
                >
                  <Text style={styles.loadMoreText}>Load More Jobs</Text>
                </Pressable>
              )}
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.mediumBlue,
  },
  headerBackground: {
    backgroundColor: COLORS.darkestBlue,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: COLORS.darkestBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    marginTop: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  hello: {
    fontSize: 16,
    color: COLORS.lightestBlue,
    fontWeight: "500",
    marginTop: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.white,
    marginTop: 2,
  },
  profileContainer: {
    borderRadius: 28,
    padding: 2,
    backgroundColor: "rgba(193, 232, 255, 0.2)",
  },
  profileImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: COLORS.lightestBlue,
  },
  bannerContainer: {
    marginTop: 10,
  },
  bannerItemContainer: {
    width: width,
    paddingHorizontal: 20,
  },
  promoBanner: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: COLORS.divider,
  },
  activePaginationDot: {
    width: 16,
    backgroundColor: COLORS.mediumBlue,
  },
  sectionContainer: {
    marginTop: 18,
    paddingHorizontal: 20,
  },
  sectionHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.darkBlue,
  },
  viewAllText: {
    fontSize: 14,
    color: COLORS.mediumBlue,
    fontWeight: "900",
  },
  jobListContainer: {
    marginTop: 4,
    marginBottom: 80,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.cardOutline,
    shadowColor: COLORS.darkestBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 28,
    backgroundColor: COLORS.cardBg,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.divider,
    overflow: "hidden",
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 28,
  },
  titleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.darkBlue,
  },
  companyName: {
    fontSize: 14,
    color: COLORS.mediumBlue,
    fontWeight: "500",
    marginTop: 4,
  },
  location: {
    fontSize: 12,
    color: COLORS.caption,
    marginTop: 4,
  },
  saveButton: {
    padding: 10,
    height: 48,
    width: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  saveIcon: {
    height: 28,
    width: 28,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
    marginBottom: 10,
  },
  tag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.darkBlue,
  },
  noTags: {
    fontSize: 12,
    color: COLORS.caption,
    fontStyle: "italic",
  },
  applyContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 0,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  tapToApplyText: {
    fontSize: 12,
    color: COLORS.caption,
    fontStyle: "italic",
  },
  applyButton: {
    backgroundColor: COLORS.mediumBlue,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.darkBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  applyText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.white,
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    marginBottom: 16,
  },
  emptyStateIcon: {
    width: 64,
    height: 64,
    opacity: 0.5,
    marginBottom: 16,
    tintColor: COLORS.mediumBlue,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.darkBlue,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.caption,
  },
  loadMoreButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.mediumBlue,
    borderRadius: 8,
    backgroundColor: COLORS.lightestBlue,
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.darkBlue,
  },
});

export default UserHomeScreen;