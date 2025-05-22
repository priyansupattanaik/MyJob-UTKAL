import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  Pressable,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  RefreshControl,
  ToastAndroid,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import config from "../../../context/config";
import { useFocusEffect } from "@react-navigation/native";

// Color palette matching UserHomeScreen
const COLORS = {
  darkestBlue: "#021024",
  darkBlue: "#052659",
  mediumBlue: "#5483B3",
  lightBlue: "#7DA0C4",
  lightestBlue: "#C1E8FF",
  white: "#FFFFFF",
  background: "#F5F7FA",
  cardBg: "#FFFFFF",
  error: "#E53935",
  caption: "#757575",
  outline: "#E0E0E0",
  cardOutline: "#E1E5EB",
  divider: "#E8EAF0",
};

const SavedJobsScreen = ({ navigation }) => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingJobId, setDeletingJobId] = useState(null); // Track currently deleting job

  // Load locally saved jobs from AsyncStorage
  const loadLocalSavedJobs = async () => {
    try {
      const savedJobsStr = await AsyncStorage.getItem("localSavedJobs");
      if (savedJobsStr) {
        const savedJobsObj = JSON.parse(savedJobsStr);
        return savedJobsObj;
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

  // Fetch saved jobs with integrated online and offline approach
  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        throw new Error("User ID not found");
      }

      let jobsFromServer = [];
      let serverError = false;

      // 1. Try to fetch from API first
      try {
        const response = await axios.get(
          `${config.apiUrl}/SavedJob/get/${userId}`
        );

        if (response.status === 200 && response.data.success) {
          // We need to fetch complete job details for each saved job
          const savedJobsFromServer = response.data.savedJobs || [];

          if (savedJobsFromServer.length > 0) {
            // Create array of promises to fetch job details in parallel
            const jobDetailPromises = savedJobsFromServer.map(
              async (savedJob) => {
                try {
                  // Fetch detailed job information for each saved job
                  const jobResponse = await axios.get(
                    `${config.apiUrl}/postedjob/getJob/${savedJob.jobId}`
                  );
                  if (jobResponse.status === 200 && jobResponse.data.data) {
                    return jobResponse.data.data;
                  }
                  return null;
                } catch (error) {
                  // Silently fail for individual job fetches
                  return null;
                }
              }
            );

            // Wait for all job detail requests to complete
            const jobDetailsResults = await Promise.all(jobDetailPromises);

            // Filter out any null results (failed requests)
            jobsFromServer = jobDetailsResults.filter((job) => job !== null);
          }
        }
      } catch (error) {
        // Don't log 404 errors as they're expected when no saved jobs exist
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          console.log("No saved jobs found on server");
        } else {
          console.log("Error fetching saved jobs from server:", error.message);
          serverError = true;
        }
      }

      // 2. If server fetch is successful, use that data
      if (jobsFromServer.length > 0) {
        setSavedJobs(jobsFromServer);

        // Also update local storage for backup
        const savedJobsObj = await loadLocalSavedJobs();
        savedJobsObj[userId] = jobsFromServer;
        await saveLocalSavedJobs(savedJobsObj);
      }
      // 3. Otherwise, fall back to local storage
      else {
        const savedJobsObj = await loadLocalSavedJobs();
        const userSavedJobs = savedJobsObj[userId] || [];
        setSavedJobs(userSavedJobs);
      }
    } catch (err) {
      console.error("Error fetching saved jobs:", err.message);
      setSavedJobs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Delete a saved job
  const handleDeleteJob = async (jobId) => {
    try {
      setDeletingJobId(jobId);
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        throw new Error("User ID not found");
      }

      // 1. Try to delete from server first
      let serverDeleteSuccessful = false;
      try {
        const response = await axios.delete(
          `${config.apiUrl}/SavedJob/delete/${userId}/${jobId}`
        );
        if (response.status === 200) {
          serverDeleteSuccessful = true;
        }
      } catch (error) {
        // Don't log 404 errors as they're expected when the job doesn't exist on server
        if (axios.isAxiosError(error) && error.response?.status !== 404) {
          console.log(
            `Error deleting job ${jobId} from server:`,
            error.message
          );
        }
      }

      // 2. Also delete from local storage regardless of server result
      const savedJobsObj = await loadLocalSavedJobs();
      const userSavedJobs = savedJobsObj[userId] || [];

      // Filter out the job to delete
      const updatedSavedJobs = userSavedJobs.filter(
        (job) => job.jobId !== jobId
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
    } catch (err) {
      console.error("Error removing job:", err);
      Alert.alert("Error", err.message);
    } finally {
      setDeletingJobId(null);
    }
  };

  // Delete all saved jobs
  const handleDeleteAll = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        throw new Error("User ID not found");
      }

      // Confirm deletion
      Alert.alert(
        "Delete All Saved Jobs",
        "Are you sure you want to delete all saved jobs?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            onPress: async () => {
              setLoading(true);

              // 1. Try to delete all from server first
              try {
                const response = await axios.delete(
                  `${config.apiUrl}/SavedJob/deleteAll/${userId}`
                );
                if (response.status === 200) {
                  console.log("Successfully deleted all jobs from server");
                }
              } catch (error) {
                // Don't log 404 errors as they're expected when no saved jobs exist
                if (
                  axios.isAxiosError(error) &&
                  error.response?.status !== 404
                ) {
                  console.log(
                    "Error deleting all jobs from server:",
                    error.message
                  );
                }
              }

              // 2. Also clear from local storage regardless of server result
              const savedJobsObj = await loadLocalSavedJobs();
              const updatedSavedJobsObj = {
                ...savedJobsObj,
                [userId]: [],
              };
              await saveLocalSavedJobs(updatedSavedJobsObj);

              // Update state
              setSavedJobs([]);
              setLoading(false);

              // Show success message
              if (Platform.OS === "android") {
                ToastAndroid.show("All saved jobs removed", ToastAndroid.SHORT);
              } else {
                Alert.alert("Success", "All saved jobs removed");
              }
            },
            style: "destructive",
          },
        ]
      );
    } catch (err) {
      console.error("Error deleting all jobs:", err);
      Alert.alert("Error", err.message);
    }
  };

  // Refresh handler
  const onRefresh = () => {
    setRefreshing(true);
    fetchSavedJobs();
  };

  // Fetch saved jobs when the screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchSavedJobs();
    }, [])
  );

  // Job card component
  const renderJobCard = ({ item }) => {
    // Make sure item has a tags property and it's an array
    if (!item.tags) {
      // If job has jobType or workPlaceType, create tags from those
      const tags = [];
      if (item.jobType) tags.push(item.jobType);
      if (item.workPlaceType) tags.push(item.workPlaceType);
      item.tags = tags;
    }

    const tagsList = Array.isArray(item.tags)
      ? item.tags.filter((tag) => tag)
      : [];

    const isDeleting = deletingJobId === item.jobId;

    return (
      <Pressable
        style={styles.card}
        onPress={() => navigation.navigate("ApplyScreen", { jobData: item })}
        android_ripple={{ color: "rgba(5, 38, 89, 0.05)" }}
      >
        <View style={styles.cardHeader}>
          <View style={styles.logoContainer}>
            <Image
              source={{ uri: item.logo || "https://via.placeholder.com/150" }}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.titleContainer}>
            <Text
              style={styles.jobTitle}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.degName || "Unknown Position"}
            </Text>
            <Text
              style={styles.companyName}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.organizationName || "Unknown Company"}
            </Text>
            <Text
              style={styles.location}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              📍 {item.jobLocation || "Unknown Location"}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteJob(item.jobId)}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color={COLORS.error} />
            ) : (
              <Image
                source={require("../../../assets/icons/Delete.png")}
                style={styles.deleteIcon}
              />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <View style={styles.tagsContainer}>
          {tagsList.length > 0 ? (
            tagsList.map((tag, index) => (
              <View
                key={index}
                style={[
                  styles.tag,
                  {
                    backgroundColor:
                      index % 4 === 0
                        ? "rgba(5, 38, 89, 0.08)"
                        : index % 4 === 1
                        ? "rgba(84, 131, 179, 0.08)"
                        : index % 4 === 2
                        ? "rgba(125, 160, 196, 0.08)"
                        : "rgba(193, 232, 255, 0.12)",
                  },
                ]}
              >
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noTags}>No job type information</Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.applyButton}
          onPress={() => navigation.navigate("ApplyScreen", { jobData: item })}
        >
          <Text style={styles.applyText}>View Details</Text>
        </TouchableOpacity>
      </Pressable>
    );
  };

  return (
    <>
      <StatusBar
        backgroundColor={COLORS.darkestBlue}
        barStyle="light-content"
      />
      <SafeAreaView style={{ flex: 0, backgroundColor: COLORS.darkestBlue }} />
      <SafeAreaView style={styles.container}>
        {/* Header Section */}
        <View style={styles.headerBackground}>
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Saved Jobs</Text>
              <Text style={styles.headerSubtitle}>
                {savedJobs.length} {savedJobs.length === 1 ? "job" : "jobs"}{" "}
                saved
              </Text>
            </View>

            {savedJobs.length > 0 && (
              <TouchableOpacity
                style={styles.deleteAllButton}
                onPress={handleDeleteAll}
              >
                <Image
                  source={require("../../../assets/icons/Delete.png")}
                  style={styles.deleteAllIcon}
                />
                <Text style={styles.deleteAllText}>Delete All</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Content Section */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.mediumBlue} />
            <Text style={styles.loadingText}>Loading saved jobs...</Text>
          </View>
        ) : (
          <FlatList
            data={savedJobs}
            renderItem={renderJobCard}
            keyExtractor={(item) => item.jobId || Math.random().toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.mediumBlue]}
                tintColor={COLORS.mediumBlue}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Image
                  source={require("../../../assets/icons/save.png")}
                  style={styles.emptyIcon}
                />
                <Text style={styles.emptyTitle}>No saved jobs yet</Text>
                <Text style={styles.emptySubtitle}>
                  Jobs you save will appear here for easy access
                </Text>
                <TouchableOpacity
                  style={styles.exploreButton}
                  onPress={() =>
                    navigation.navigate("TabNavigator", { screen: "Jobs" })
                  }
                >
                  <Text style={styles.exploreButtonText}>Explore Jobs</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  headerTitle: {
    fontSize: 16,
    color: COLORS.lightestBlue,
    fontWeight: "500",
  },
  headerSubtitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.white,
    marginTop: 4,
  },
  deleteAllButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(229, 57, 53, 0.1)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  deleteAllIcon: {
    width: 16,
    height: 16,
    tintColor: COLORS.error,
    marginRight: 4,
  },
  deleteAllText: {
    fontSize: 12,
    color: COLORS.error,
    fontWeight: "600",
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
  listContainer: {
    padding: 16,
    paddingTop: 10,
    minHeight: "100%",
  },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
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
    borderRadius: 24,
    backgroundColor: COLORS.cardBg,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.divider,
    overflow: "hidden",
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteIcon: {
    width: 20,
    height: 20,
    tintColor: COLORS.error,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: 12,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
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
  applyButton: {
    backgroundColor: COLORS.mediumBlue,
    paddingVertical: 10,
    borderRadius: 12,
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
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    marginTop: 90,
  },
  emptyIcon: {
    width: 60,
    height: 60,
    tintColor: COLORS.lightBlue,
    marginBottom: 10,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.darkBlue,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: COLORS.caption,
    textAlign: "center",
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: COLORS.mediumBlue,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: COLORS.darkBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  exploreButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.white,
  },
});

export default SavedJobsScreen;
