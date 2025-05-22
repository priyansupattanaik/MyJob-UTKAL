import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
  FlatList,
  Alert,
  StatusBar,
  Dimensions,
  TouchableOpacity,
  Platform,
  RefreshControl,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import config from "../../context/config";
import TabBar from "../../component/TabBar"; // Import the TabBar component

// Get screen dimensions for responsive layout
const { width, height } = Dimensions.get("window");

// Material Design colors
const COLORS = {
  primary: "#2196F3",
  primaryDark: "#1976D2",
  primaryLight: "#BBDEFB",
  accent: "#FF4081",
  textPrimary: "#212121",
  textSecondary: "#757575",
  divider: "#BDBDBD",
  background: "#F5F7FA",
  surface: "#FFFFFF",
  error: "#F44336",
  success: "#4CAF50",
};

const OrganizationHomeScreen = ({ navigation }) => {
  // State variables
  const [organizationData, setOrganizationData] = useState(null);
  const [organizationJobs, setOrganizationJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalJobs: 0,
    applications: 0,
  });

  // Fetch organization data and jobs on component mount
  useEffect(() => {
    fetchOrganizationData();
  }, []);

  // Function to fetch organization profile data
  const fetchOrganizationData = async () => {
    try {
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
        setOrganizationData({
          organizationName: orgData.organizationName || "",
          logoUrl: orgData.logo
            ? `${config.apiUrl}/photo/${orgData.logo}`
            : null,
          compId: orgData.compId || userId,
        });

        // Now fetch jobs for this organization
        fetchOrganizationJobs(orgData.compId || userId);
      } else {
        console.error("No valid organization data available");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching organization data:", error);
      setLoading(false);
    }
  };

  // Function to fetch jobs posted by the organization
  const fetchOrganizationJobs = async (compId) => {
    try {
      setLoading(true);

      // Get all jobs and filter by compId
      const response = await axios.get(`${config.apiUrl}/postedjob/getAll`);

      if (response.status === 200 && response.data && response.data.data) {
        // Filter jobs by company ID
        const jobs = response.data.data.filter((job) => job.compId === compId);

        // Normalize the job data to ensure all required fields exist
        const normalizedJobs = jobs.map(normalizeJobData);

        setOrganizationJobs(normalizedJobs);

        // Calculate stats
        const activeJobs = normalizedJobs.filter(
          (job) => job.status === 1
        ).length;
        setStats({
          activeJobs: activeJobs,
          totalJobs: normalizedJobs.length,
          applications: calculateTotalApplications(normalizedJobs),
        });
      } else {
        setOrganizationJobs([]);
        setStats({
          activeJobs: 0,
          totalJobs: 0,
          applications: 0,
        });
      }
    } catch (error) {
      // Handle 404 error gracefully - just set empty jobs instead of showing alert
      console.log("Note: No jobs found or API endpoint not available");
      setOrganizationJobs([]);
      setStats({
        activeJobs: 0,
        totalJobs: 0,
        applications: 0,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Normalize job data to ensure all fields are present
  const normalizeJobData = (job) => {
    // Ensure skills is an array
    let skills = [];
    if (job.skills) {
      if (typeof job.skills === "string") {
        try {
          skills = JSON.parse(job.skills);
        } catch (e) {
          console.warn("Failed to parse skills JSON:", e);
          skills = [];
        }
      } else if (Array.isArray(job.skills)) {
        skills = job.skills;
      }
    }

    return {
      ...job,
      degName: job.degName || "Untitled Position",
      jobLocation: job.jobLocation || "Remote",
      workPlaceType: job.workPlaceType || "Not specified",
      jobType: job.jobType || "Full-Time",
      createdAt: job.createdAt || new Date().toISOString(),
      yearsOfExperience: job.yearsOfExperience || "Not specified",
      skills: skills,
      status: job.status !== undefined ? job.status : 1,
    };
  };

  // Calculate total applications (placeholder as your API doesn't currently track this)
  const calculateTotalApplications = (jobs) => {
    // This is a placeholder. In the future, you might want to implement an
    // actual application counting system in your backend
    return 0; // Default to 0 until your API supports this
  };

  // Pull to refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrganizationData();
  }, []);

  // Memoized filtered jobs based on search query
  const filteredJobs = useMemo(() => {
    if (!searchQuery.trim()) {
      return organizationJobs;
    }

    const query = searchQuery.toLowerCase().trim();

    return organizationJobs.filter(
      (job) =>
        job.degName?.toLowerCase().includes(query) ||
        job.jobDescription?.toLowerCase().includes(query) ||
        job.jobLocation?.toLowerCase().includes(query) ||
        job.jobType?.toLowerCase().includes(query) ||
        job.workPlaceType?.toLowerCase().includes(query) ||
        (job.skills &&
          Array.isArray(job.skills) &&
          job.skills.some(
            (skill) =>
              typeof skill === "string" && skill.toLowerCase().includes(query)
          ))
    );
  }, [searchQuery, organizationJobs]);

  // Function to toggle job status (active/inactive)
  const toggleJobStatus = async (jobId, currentStatus) => {
    try {
      const newStatus = currentStatus === 1 ? 0 : 1;

      await axios.put(`${config.apiUrl}/postedjob/update/${jobId}`, {
        status: newStatus,
      });

      // Update local state
      setOrganizationJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.jobId === jobId ? { ...job, status: newStatus } : job
        )
      );

      // Update stats
      if (newStatus === 1) {
        setStats((prev) => ({ ...prev, activeJobs: prev.activeJobs + 1 }));
      } else {
        setStats((prev) => ({ ...prev, activeJobs: prev.activeJobs - 1 }));
      }
    } catch (error) {
      console.error("Error updating job status:", error);
      Alert.alert("Error", "Failed to update job status");
    }
  };

  // Memoized job card component for better performance
  const JobCard = useCallback(
    ({ item }) => (
      <View style={styles.jobCard}>
        <View style={styles.jobCardHeader}>
          <View style={styles.jobIconContainer}>
            <Image
              source={getJobTypeIcon(item.jobType)}
              style={styles.jobIcon}
            />
          </View>
          <View style={styles.jobTitleContainer}>
            <Text style={styles.jobTitle}>{item.degName}</Text>
            <Text style={styles.jobLocation}>{item.jobLocation}</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.statusBadge,
              item.status === 1 ? styles.activeStatus : styles.inactiveStatus,
            ]}
            onPress={() => toggleJobStatus(item.jobId, item.status)}
          >
            <Text
              style={[
                styles.statusText,
                item.status === 1
                  ? styles.activeStatusText
                  : styles.inactiveStatusText,
              ]}
            >
              {item.status === 1 ? "Active" : "Inactive"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.jobInfo}>
          <View style={styles.infoItem}>
            <Image
              source={require("../../assets/icons/briefcase.png")}
              style={styles.infoIcon}
              tintColor={COLORS.textSecondary}
            />
            <Text style={styles.infoText}>{item.jobType}</Text>
          </View>

          <View style={styles.infoItem}>
            <Image
              source={require("../../assets/icons/building.png")}
              style={styles.infoIcon}
              tintColor={COLORS.textSecondary}
            />
            <Text style={styles.infoText}>{item.workPlaceType}</Text>
          </View>

          <View style={styles.infoItem}>
            <Image
              source={require("../../assets/icons/calendar.png")}
              style={styles.infoIcon}
              tintColor={COLORS.textSecondary}
            />
            <Text style={styles.infoText}>
              Posted {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.skillsContainer}>{renderSkills(item.skills)}</View>

        <View style={styles.jobFooter}>
          <View style={styles.experienceContainer}>
            <Text style={styles.experienceLabel}>Experience:</Text>
            <Text style={styles.experienceText}>{item.yearsOfExperience}</Text>
          </View>
        </View>
      </View>
    ),
    []
  );

  // Get icon based on job type
  const getJobTypeIcon = (jobType) => {
    switch (jobType) {
      case "Full-Time":
        return require("../../assets/icons/briefcase.png");
      case "Part-Time":
        return require("../../assets/icons/clock.png");
      case "Contract":
        return require("../../assets/icons/document.png");
      case "Internship":
        return require("../../assets/icons/graduate.png");
      default:
        return require("../../assets/icons/briefcase.png");
    }
  };

  // Render skills
  const renderSkills = (skills) => {
    if (!skills || !Array.isArray(skills) || skills.length === 0) return null;

    // Limit to only showing 3 skills with a +X more indicator
    const displaySkills = skills.slice(0, 3);
    const remaining = skills.length - 3;

    return (
      <>
        {displaySkills.map((skill, index) => (
          <View key={`skill-${index}`} style={styles.skillTag}>
            <Text style={styles.skillText}>{skill}</Text>
          </View>
        ))}
        {remaining > 0 && (
          <View style={styles.skillTag}>
            <Text style={styles.skillText}>+{remaining} more</Text>
          </View>
        )}
      </>
    );
  };

  // Render the header section
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <StatusBar
        backgroundColor={COLORS.primary}
        barStyle="light-content"
        translucent={false}
      />

      {/* Header with profile info */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.name}>
            {organizationData?.organizationName || "Organization"}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate("OrganizationProfile")}
        >
          {organizationData?.logoUrl ? (
            <Image
              source={{ uri: organizationData.logoUrl }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Text style={styles.profileImagePlaceholderText}>
                {organizationData?.organizationName?.charAt(0) || "O"}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Image
            source={require("../../assets/icons/Search.png")}
            style={styles.searchIcon}
            tintColor={COLORS.textSecondary}
          />
          <TextInput
            placeholder="Search your job posts..."
            style={styles.searchInput}
            placeholderTextColor={COLORS.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Image
                source={require("../../assets/icons/close.png")}
                style={styles.clearIcon}
                tintColor={COLORS.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Stats summary */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.activeJobs}</Text>
          <Text style={styles.statLabel}>Active Jobs</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalJobs}</Text>
          <Text style={styles.statLabel}>Total Jobs</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.applications}</Text>
          <Text style={styles.statLabel}>Applications</Text>
        </View>
      </View>
    </View>
  );

  // Render the section header for jobs list
  const renderSectionHeader = () => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Your Job Posts</Text>
      <Text style={styles.jobCount}>{filteredJobs.length} Jobs</Text>
    </View>
  );

  // Render empty components for different states
  const renderEmptyComponent = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading job posts...</Text>
        </View>
      );
    }

    if (organizationJobs.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Image
            source={require("../../assets/icons/briefcase.png")}
            style={styles.emptyIcon}
            tintColor={COLORS.primaryLight}
          />
          <Text style={styles.emptyTitle}>No Job Posts Yet</Text>
          <Text style={styles.emptySubtitle}>
            Click the + button to create your first job post
          </Text>
          <TouchableOpacity
            style={styles.createJobButton}
            onPress={() => navigation.navigate("JobPost")}
          >
            <Text style={styles.createJobButtonText}>Create Job Post</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (filteredJobs.length === 0 && searchQuery) {
      return (
        <View style={styles.emptyContainer}>
          <Image
            source={require("../../assets/icons/Search.png")}
            style={styles.emptyIcon}
            tintColor={COLORS.primaryLight}
          />
          <Text style={styles.emptyTitle}>No matching job posts</Text>
          <Text style={styles.emptySubtitle}>Try a different search term</Text>
          <TouchableOpacity
            style={styles.clearSearchButton}
            onPress={() => setSearchQuery("")}
          >
            <Text style={styles.clearSearchButtonText}>Clear Search</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Use FlatList as the main container instead of ScrollView */}
          <FlatList
            data={filteredJobs.length > 0 ? filteredJobs : []}
            renderItem={({ item }) => <JobCard item={item} />}
            keyExtractor={(item, index) => item.jobId || `job-${index}`}
            ListHeaderComponent={
              <>
                {renderHeader()}
                {filteredJobs.length > 0 && (
                  <View style={styles.jobsContainer}>
                    {renderSectionHeader()}
                  </View>
                )}
              </>
            }
            ListEmptyComponent={renderEmptyComponent}
            ListFooterComponent={<View style={{ height: 80 }} />}
            contentContainerStyle={
              filteredJobs.length === 0
                ? { flexGrow: 1 }
                : styles.contentContainer
            }
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
            initialNumToRender={5}
            maxToRenderPerBatch={10}
            windowSize={10}
            removeClippedSubviews={Platform.OS === "android"}
          />

          {/* TabBar component added below */}
          <TabBar navigation={navigation} />
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primaryDark,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingBottom: 70, // Add padding for the TabBar
  },
  contentContainer: {
    paddingBottom: 20,
  },
  headerContainer: {
    backgroundColor: COLORS.primary,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  greeting: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 16,
    marginBottom: 4,
  },
  name: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  profileButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  profileImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryDark,
    justifyContent: "center",
    alignItems: "center",
  },
  profileImagePlaceholderText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInputContainer: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  clearIcon: {
    width: 20,
    height: 20,
    padding: 10, // Increase touchable area
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.15)",
    marginHorizontal: 20,
    borderRadius: 10,
    padding: 10,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: 10,
  },
  jobsContainer: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  jobCount: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  jobCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    marginTop: 6,
  },
  jobCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  jobIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  jobIcon: {
    width: 24,
    height: 24,
    tintColor: COLORS.primary,
  },
  jobTitleContainer: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  jobLocation: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  activeStatus: {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
  },
  inactiveStatus: {
    backgroundColor: "rgba(158, 158, 158, 0.1)",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  activeStatusText: {
    color: COLORS.success,
  },
  inactiveStatusText: {
    color: COLORS.textSecondary,
  },
  jobInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 8,
  },
  infoIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  skillTag: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "500",
  },
  jobFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  experienceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  experienceLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginRight: 4,
  },
  experienceText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    minHeight: 300,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    minHeight: 400,
  },
  emptyIcon: {
    width: 60,
    height: 60,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 20,
  },
  createJobButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  createJobButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  clearSearchButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 8,
  },
  clearSearchButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default OrganizationHomeScreen;
