import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Dimensions,
  Platform,
  ActivityIndicator,
  Image,
} from "react-native";
import config from "../../context/config";

// Get screen dimensions for responsive layout
const { width, height } = Dimensions.get("window");

// Material Design colors - Google blue as primary
const COLORS = {
  primary: "#4285F4", // Google Blue
  primaryDark: "#3367D6", // Dark Google Blue
  primaryLight: "#E8F0FE", // Light Google Blue
  accent: "#DB4437", // Google Red as accent
  textPrimary: "#202124", // Google Dark Gray
  textSecondary: "#5F6368", // Google Medium Gray
  divider: "#DADCE0", // Google Light Gray
  background: "#F8F9FA", // Google Off-White
  surface: "#FFFFFF", // White
  error: "#EA4335", // Google Red
  success: "#34A853", // Google Green
};

interface Job {
  jobId: string;
  jobRole: string;
  companyName: string;
  jobLocation: string;
  salary: string;
  jobDescription: string;
  organizationName: string;
  workPlaceType: string;
  degName: string;
  postedAt: Date;
  skills?: string[];
  yearsOfExperience?: string;
  jobType?: string;
  requirements?: string[];
  secName?: string;
}

const API_BASE_URL = `${config.apiUrl}`;

const JobShare: React.FC = ({ navigation, route }: any) => {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobData = async () => {
    try {
      setLoading(true);
      setError(null);
      const jobId = route.params?.jobId;

      console.log("Attempting to fetch job with ID:", jobId);

      if (!jobId) {
        console.error("No job ID provided in route params");
        setError("No job ID provided");
        setLoading(false);
        return;
      }

      // Log the API URL for debugging
      const apiUrl = `${API_BASE_URL}/postedjob/get/${jobId}`;
      console.log("Fetching from URL:", apiUrl);

      // Fetch job details with the specified ID
      const response = await axios.get(apiUrl);

      console.log("API Response status:", response.status);
      console.log("API Response data:", JSON.stringify(response.data, null, 2));

      if (response.status === 200 && response.data) {
        const jobData = response.data.data || response.data;
        if (!jobData) {
          setError("Job data not found in response");
          return;
        }

        console.log("Setting job data:", JSON.stringify(jobData, null, 2));
        setJob(transformJob(jobData));
      } else {
        setError("Could not retrieve job details");
      }
    } catch (error) {
      console.error("Error fetching job data:", error);
      console.error("Error details:", error.response?.data || error.message);
      setError("Failed to load job information. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Transform job data from API response to our interface format
  const transformJob = (job: any): Job => {
    // Log the job structure for debugging
    console.log("Job data structure:", JSON.stringify(job, null, 2));

    // Safely handle potential undefined or null values
    if (!job) {
      return {
        jobId: "",
        jobRole: "Untitled Job",
        companyName: "Unknown Company",
        jobLocation: "Remote",
        salary: "Not Disclosed",
        jobDescription: "No description available.",
        organizationName: "Unknown Organization",
        workPlaceType: "Not specified",
        degName: "Job Position",
        postedAt: new Date(),
        skills: [],
        yearsOfExperience: "Not specified",
        jobType: "Not specified",
        requirements: [],
        secName: "Not specified",
      };
    }

    // Extract organization name from the correct path
    let organizationName = "Unknown Organization";
    // Check different possible paths to organization name
    if (job.organization && job.organization.organizationName) {
      organizationName = job.organization.organizationName;
    } else if (job.organizationName) {
      organizationName = job.organizationName;
    } else if (job.Organization && job.Organization.organizationName) {
      organizationName = job.Organization.organizationName;
    } else if (job.companyName) {
      organizationName = job.companyName;
    }
    console.log("Extracted organization name:", organizationName);

    // Ensure skills is an array
    let skills = [];
    if (job.skills) {
      // If skills is a string (JSON), try to parse it
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

    // Ensure requirements is an array
    let requirements = [];
    if (job.requirements) {
      // If requirements is a string (JSON), try to parse it
      if (typeof job.requirements === "string") {
        try {
          requirements = JSON.parse(job.requirements);
        } catch (e) {
          console.warn("Failed to parse requirements JSON:", e);
          requirements = [];
        }
      } else if (Array.isArray(job.requirements)) {
        requirements = job.requirements;
      }
    }

    // Build the transformed job object
    const transformedJob = {
      jobId: job.jobId || "",
      jobRole: job.jobRole || job.degName || "Untitled Job",
      companyName: job.companyName || "Unknown Company",
      jobLocation: job.jobLocation || "Remote",
      salary: job.salary || "Not Disclosed",
      jobDescription: job.jobDescription || "No description available.",
      organizationName: organizationName,
      workPlaceType: job.workPlaceType || "Not specified",
      degName: job.degName || "Job Position",
      postedAt: new Date(job.createdAt || Date.now()),
      skills: skills,
      yearsOfExperience: job.yearsOfExperience || "Not specified",
      jobType: job.jobType || "Not specified",
      requirements: requirements,
      secName: job.secName || "Not specified",
    };

    console.log("Transformed job:", JSON.stringify(transformedJob, null, 2));
    return transformedJob;
  };

  useEffect(() => {
    console.log(
      "JobShare useEffect triggered with jobId:",
      route.params?.jobId
    );
    fetchJobData();
  }, [route.params?.jobId]);

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return date.toLocaleDateString(undefined, options);
  };

  // Render skill chips with Material Design styling
  const renderSkillChips = (skills: any) => {
    // Handle undefined, null, or non-array skills
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return null;
    }

    return (
      <View style={styles.card}>
        <Text style={styles.sectionSubtitle}>Required Skills</Text>
        <View style={styles.chipContainer}>
          {skills.map((skill, index) => (
            <View key={`skill-${index}`} style={styles.chip}>
              <Text style={styles.chipText}>
                {typeof skill === "string" ? skill : JSON.stringify(skill)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  // Render requirements list with Material Design bullets
  const renderRequirements = (requirements: any) => {
    // Handle undefined, null, or non-array requirements
    if (
      !requirements ||
      !Array.isArray(requirements) ||
      requirements.length === 0
    ) {
      return null;
    }

    return (
      <View style={styles.card}>
        <Text style={styles.sectionSubtitle}>Requirements</Text>
        {requirements.map((requirement, index) => (
          <View key={`req-${index}`} style={styles.requirementItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.requirementText}>
              {typeof requirement === "string"
                ? requirement
                : JSON.stringify(requirement)}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading job details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Image
          source={require("../../assets/icons/error.png")}
          style={styles.errorIcon}
        />
        <Text style={styles.errorTitle}>Error</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchJobData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.errorContainer}>
        <Image
          source={require("../../assets/icons/error.png")}
          style={styles.errorIcon}
        />
        <Text style={styles.errorTitle}>No Job Found</Text>
        <Text style={styles.errorText}>The job details could not be found</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* App Bar */}
        <View style={styles.appBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back"
          >
            <Image
              source={require("../../assets/icons/backIcon.png")}
              style={styles.backIcon}
              tintColor="#FFFFFF"
            />
          </TouchableOpacity>
          <Text style={styles.appBarTitle}>Job Details</Text>
          <View style={styles.appBarPlaceholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Job Title Card */}
          <View style={styles.card}>
            <Text style={styles.jobTitle}>{job.degName || "Job Position"}</Text>
            <View style={styles.locationContainer}>
              <Image
                source={require("../../assets/icons/Location.png")}
                style={styles.infoIcon}
                tintColor={COLORS.textSecondary}
              />
              <Text style={styles.locationText}>{job.jobLocation}</Text>
            </View>
          </View>

          {/* Job Details Card */}
          <View style={styles.card}>
            <View style={styles.jobTypeContainer}>
              <View style={styles.jobTypeBadge}>
                <Text style={styles.jobTypeText}>{job.jobType}</Text>
              </View>
              <View style={styles.jobTypeBadge}>
                <Text style={styles.jobTypeText}>{job.workPlaceType}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Sector:</Text>
                <Text style={styles.infoValue}>{job.secName}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Experience:</Text>
                <Text style={styles.infoValue}>
                  {job.yearsOfExperience} years
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Posted:</Text>
                <Text style={styles.infoValue}>{formatDate(job.postedAt)}</Text>
              </View>
            </View>
          </View>

          {/* Job Description Card */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>About the Position</Text>
            <Text style={styles.descriptionText}>{job.jobDescription}</Text>
          </View>

          {/* Requirements Card (if available) */}
          {job.requirements &&
            Array.isArray(job.requirements) &&
            job.requirements.length > 0 && (
              <View style={styles.requirementsSection}>
                {renderRequirements(job.requirements)}
              </View>
            )}

          {/* Skills Card (if available) */}
          {job.skills && Array.isArray(job.skills) && job.skills.length > 0 && (
            <View style={styles.skillsSection}>
              {renderSkillChips(job.skills)}
            </View>
          )}

          {/* Empty space at bottom for better scrolling */}
          <View style={styles.bottomSpace} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  appBar: {
    height: 56,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  appBarTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  appBarPlaceholder: {
    width: 40,
    height: 40,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  infoIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  jobTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  jobTypeContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  jobTypeBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  jobTypeText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "500",
  },
  infoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 24,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginRight: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.textPrimary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textPrimary,
  },
  skillsSection: {
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  chip: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    color: COLORS.primary,
    fontSize: 14,
  },
  requirementsSection: {
    marginBottom: 8,
  },
  requirementItem: {
    flexDirection: "row",
    marginBottom: 8,
    paddingRight: 16,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 7,
    marginRight: 8,
  },
  requirementText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    color: COLORS.textPrimary,
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: 24,
  },
  errorIcon: {
    width: 48,
    height: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  bottomSpace: {
    height: 20, // Add some space at the bottom for comfortable scrolling
  },
});

export default JobShare;
