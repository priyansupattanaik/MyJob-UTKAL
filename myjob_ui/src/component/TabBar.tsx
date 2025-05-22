import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Text,
  Modal,
  Platform,
  Dimensions,
} from "react-native";

// Get screen dimensions for responsive layout
const { width } = Dimensions.get("window");

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

interface TabBarProps {
  navigation: any;
  state?: any;
  route?: any;
}

const TabBar: React.FC<TabBarProps> = ({ navigation }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("");

  // Set active tab based on current route when the component mounts
  useEffect(() => {
    try {
      // Try to get the current route name
      const currentRouteName =
        navigation.getState()?.routes[navigation.getState()?.index]?.name;
      if (currentRouteName) {
        setActiveTab(currentRouteName);
      }
    } catch (error) {
      // Fallback to home screen if there's an error
      setActiveTab("OrganizationHomeScreen");
    }

    // Listen for navigation state changes
    const unsubscribe = navigation.addListener("state", () => {
      try {
        const currentRouteName =
          navigation.getState()?.routes[navigation.getState()?.index]?.name;
        if (currentRouteName) {
          setActiveTab(currentRouteName);
        }
      } catch (error) {
        // Handle any errors
        console.log("Navigation state error:", error);
      }
    });

    // Clean up listener on unmount
    return unsubscribe;
  }, [navigation]);

  // Create Job Modal component
  const CreateJobModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isModalVisible}
      onRequestClose={() => setIsModalVisible(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Post a New Job</Text>

          <View style={styles.modalDescription}>
            <Text style={styles.modalDescriptionText}>
              Create a new job listing to find the perfect candidates for your
              organization
            </Text>
          </View>

          <TouchableOpacity
            style={styles.postJobButton}
            onPress={() => {
              setIsModalVisible(false);
              navigation.navigate("JobPost");
            }}
          >
            <Text style={styles.postJobButtonText}>Create Job Listing</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const handleTabPress = (screenName: string) => {
    setActiveTab(screenName);
    navigation.navigate(screenName);
  };

  return (
    <>
      <View style={styles.bottomNavContainer}>
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => handleTabPress("OrganizationHomeScreen")}
          >
            <Image
              source={require("../assets/icons/home.png")}
              style={[
                styles.navIcon,
                {
                  tintColor:
                    activeTab === "OrganizationHomeScreen"
                      ? COLORS.primary
                      : COLORS.textSecondary,
                },
              ]}
            />
            <Text
              style={[
                styles.navLabel,
                {
                  color:
                    activeTab === "OrganizationHomeScreen"
                      ? COLORS.primary
                      : COLORS.textSecondary,
                },
              ]}
            >
              Home
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navFabContainer}
            onPress={() => setIsModalVisible(true)}
            activeOpacity={0.8}
          >
            <View style={styles.navFab}>
              <Image
                source={require("../assets/icons/plus.png")}
                style={styles.fabIcon}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() => handleTabPress("ReceivedApplication")}
          >
            <Image
              source={require("../assets/icons/application.png")}
              style={[
                styles.navIcon,
                {
                  tintColor:
                    activeTab === "ReceivedApplication"
                      ? COLORS.primary
                      : COLORS.textSecondary,
                },
              ]}
            />
            <Text
              style={[
                styles.navLabel,
                {
                  color:
                    activeTab === "ReceivedApplication"
                      ? COLORS.primary
                      : COLORS.textSecondary,
                },
              ]}
            >
              Applications
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <CreateJobModal />
    </>
  );
};

const styles = StyleSheet.create({
  bottomNavContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "transparent",
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === "ios" ? 20 : 16,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  navButton: {
    alignItems: "center",
    flex: 1,
    padding: 5, // Increase touchable area
  },
  navIcon: {
    width: 24,
    height: 24,
    marginBottom: 4,
  },
  navLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  navFabContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  navFab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginTop: -32,
  },
  fabIcon: {
    width: 24,
    height: 24,
    tintColor: "#FFFFFF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#E0E0E0",
    borderRadius: 2.5,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: 12,
    textAlign: "center",
  },
  modalDescription: {
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  modalDescriptionText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  postJobButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  postJobButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default TabBar;
