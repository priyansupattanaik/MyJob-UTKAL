import React, { useEffect, useState, useCallback } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  Alert,
  StatusBar,
  TouchableOpacity,
  Platform,
  RefreshControl,
  ActivityIndicator,
  Modal,
  Linking,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import config from "../../context/config";
import TabBar from "../../component/TabBar";

// Material Design colors
const COLORS = {
  primary: "#2196F3",
  primaryDark: "#1976D2",
  primaryLight: "#BBDEFB",
  textPrimary: "#212121",
  textSecondary: "#757575",
  background: "#F5F7FA",
  surface: "#FFFFFF",
  success: "#4CAF50",
};

const ReceivedApplicationScreen = ({ navigation }) => {
  // State variables
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [error, setError] = useState(null);

  // Fetch applications on component mount
  useEffect(() => {
    fetchApplications();
  }, []);

  // Function to fetch applications received by the organization
  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);

      const userId = await AsyncStorage.getItem("userId");

      if (!userId) {
        console.error("User ID not found");
        setError("User ID not found. Please log in again.");
        setLoading(false);
        return;
      }

      console.log("Fetching applications for user ID:", userId);

      // Get organization details to get compId
      const orgResponse = await axios.get(
        `${config.apiUrl}/organizationDetails/get/${userId}`
      );

      console.log("Organization response:", orgResponse.data);

      if (!orgResponse.data || !orgResponse.data.compId) {
        console.error("Company ID not found");
        setError(
          "Company ID not found. Please complete your organization profile."
        );
        setLoading(false);
        return;
      }

      const compId = orgResponse.data.compId || userId;
      console.log("Company ID:", compId);

      // Get all applications
      console.log(
        "Fetching applications from:",
        `${config.apiUrl}/requestApplication/getall`
      );
      const response = await axios.get(
        `${config.apiUrl}/requestApplication/getall`
      );

      console.log("All applications response:", response.data);

      if (response.status === 200 && response.data && response.data.data) {
        // Filter applications by company ID
        const orgApplications = response.data.data.filter(
          (app) => app.compId === compId
        );

        console.log("Filtered applications:", orgApplications);

        if (orgApplications.length === 0) {
          console.log("No applications found for this company");
          setApplications([]);
          setLoading(false);
          return;
        }

        // Get applicant details for each application
        const applicationsWithDetails = await Promise.all(
          orgApplications.map(async (application) => {
            try {
              // Fetch user details for each application
              console.log("Fetching user details for:", application.userId);
              const userResponse = await axios.get(
                `${config.apiUrl}/personalDetails/get/${application.userId}`
              );

              if (userResponse.status === 200 && userResponse.data) {
                const userData = userResponse.data;
                console.log("User data:", userData);

                return {
                  ...application,
                  applicantName: userData.firstName || "Unknown",
                  applicantEmail: userData.email || "No email provided",
                  applicantPhone: userData.phone || "No phone provided",
                };
              }
              return application;
            } catch (error) {
              console.error(
                `Error fetching user details for application ${application.id}:`,
                error
              );
              return application;
            }
          })
        );

        console.log("Applications with details:", applicationsWithDetails);
        setApplications(applicationsWithDetails);
      } else {
        console.log("No applications data in response");
        setApplications([]);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      setError(
        "Failed to load applications. Please check your connection and try again."
      );
      setApplications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Pull to refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchApplications();
  }, []);

  // Open resume
  const openResume = (resumePath) => {
    if (!resumePath) {
      Alert.alert("Error", "Resume not available");
      return;
    }

    // Construct the full URL to the resume
    const resumeUrl = `${config.apiUrl}/${resumePath}`;
    console.log("Opening resume at:", resumeUrl);

    // Open in device browser
    Linking.canOpenURL(resumeUrl).then((supported) => {
      if (supported) {
        Linking.openURL(resumeUrl);
      } else {
        Alert.alert("Error", "Cannot open this resume file");
      }
    });
  };

  // View application details
  const viewApplicationDetails = (application) => {
    console.log("Viewing application details:", application);
    setSelectedApplication(application);
    setModalVisible(true);
  };

  // Render application item
  const renderApplicationItem = ({ item }) => (
    <TouchableOpacity
      style={styles.applicationItem}
      onPress={() => viewApplicationDetails(item)}
    >
      <View style={styles.applicationItemHeader}>
        <Text style={styles.applicantName}>
          {item.applicantName || "Unknown Applicant"}
        </Text>
        <View
          style={item.status === 2 ? styles.acceptedBadge : styles.pendingBadge}
        >
          <Text
            style={item.status === 2 ? styles.acceptedText : styles.pendingText}
          >
            {item.status === 2 ? "Accepted" : "Pending"}
          </Text>
        </View>
      </View>
      <Text style={styles.applicationType}>
        {item.type
          ? `${
              item.type.charAt(0).toUpperCase() + item.type.slice(1)
            } Application`
          : "Job Application"}
      </Text>
      <Text style={styles.applicationDate}>
        Applied on: {new Date(item.createdAt).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  // Application detail modal
  const ApplicationDetailModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Application Details</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Image
                source={require("../../assets/icons/close.png")}
                style={styles.closeIcon}
              />
            </TouchableOpacity>
          </View>

          {selectedApplication && (
            <View style={styles.applicationDetails}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Applicant Name:</Text>
                <Text style={styles.detailValue}>
                  {selectedApplication.applicantName || "Unknown"}
                </Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Email:</Text>
                <Text style={styles.detailValue}>
                  {selectedApplication.applicantEmail || "No email provided"}
                </Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Phone:</Text>
                <Text style={styles.detailValue}>
                  {selectedApplication.applicantPhone || "No phone provided"}
                </Text>
              </View>

              {selectedApplication.description && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Cover Letter:</Text>
                  <Text style={styles.detailValue}>
                    {selectedApplication.description}
                  </Text>
                </View>
              )}

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Status:</Text>
                <View
                  style={
                    selectedApplication.status === 2
                      ? styles.acceptedBadge
                      : styles.pendingBadge
                  }
                >
                  <Text
                    style={
                      selectedApplication.status === 2
                        ? styles.acceptedText
                        : styles.pendingText
                    }
                  >
                    {selectedApplication.status === 2 ? "Accepted" : "Pending"}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.resumeButton}
                onPress={() => openResume(selectedApplication.resume)}
              >
                <Text style={styles.resumeButtonText}>View Resume</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.primaryDark}
      />

      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Image
              source={require("../../assets/icons/backIcon.png")}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Received Applications</Text>
          <View style={styles.headerRight} />
        </View>

        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading applications...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => fetchApplications()}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : applications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Image
              source={require("../../assets/icons/application.png")}
              style={styles.emptyIcon}
              tintColor={COLORS.primaryLight}
            />
            <Text style={styles.emptyTitle}>No Applications Yet</Text>
            <Text style={styles.emptyText}>
              You haven't received any applications yet. When candidates apply
              for your job postings, they'll appear here.
            </Text>
          </View>
        ) : (
          <FlatList
            data={applications}
            renderItem={renderApplicationItem}
            keyExtractor={(item) =>
              item.id?.toString() || Math.random().toString()
            }
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
          />
        )}

        <ApplicationDetailModal />
        <TabBar navigation={navigation} />
      </View>
    </SafeAreaView>
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
    paddingBottom: 70, // Space for TabBar
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
    tintColor: COLORS.surface,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.surface,
  },
  headerRight: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    maxWidth: 300,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80, // Extra padding at bottom
  },
  applicationItem: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  applicationItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  applicantName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  pendingBadge: {
    backgroundColor: "rgba(33, 150, 243, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  acceptedBadge: {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  pendingText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "500",
  },
  acceptedText: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: "500",
  },
  applicationType: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  applicationDate: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    width: "90%",
    borderRadius: 12,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  closeIcon: {
    width: 24,
    height: 24,
    tintColor: COLORS.textSecondary,
  },
  applicationDetails: {
    marginBottom: 20,
  },
  detailItem: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  resumeButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  resumeButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: "500",
  },
});

export default ReceivedApplicationScreen;
