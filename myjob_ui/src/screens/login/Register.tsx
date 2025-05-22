import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Image,
  StatusBar,
  Animated,
  Dimensions,
  SafeAreaView,
  Platform,
} from "react-native";

const { width, height } = Dimensions.get("window");

const Register = ({ navigation }: any) => {
  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnimLeft = useRef(new Animated.Value(0.95)).current;
  const scaleAnimRight = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    // Start entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Button hover effect animations
  const animateButtonScale = (button: Animated.Value, scale: number) => {
    Animated.spring(button, {
      toValue: scale,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <ImageBackground
        source={require("../../assets/icons/loginBG.jpg")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Overlay for better contrast */}
        <View style={styles.overlay} />

        <SafeAreaView style={styles.safeArea}>
          {/* Header with back button */}
          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate("Login")}
              activeOpacity={0.7}
            >
              <Image
                source={require("../../assets/icons/backIcon.png")}
                style={styles.backIcon}
                tintColor="#FFFFFF"
              />
            </TouchableOpacity>
          </Animated.View>

          {/* Logo Section */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Image
              source={require("../../assets/icons/Logo3.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Content Section */}
          <Animated.View
            style={[
              styles.contentContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.headingContainer}>
              <Text style={styles.headingText}>Register Now</Text>
              <Text style={styles.subheadingText}>
                Choose an account type to continue
              </Text>
            </View>

            <View style={styles.buttonRow}>
              <Animated.View
                style={[
                  styles.buttonWrapper,
                  {
                    transform: [{ scale: scaleAnimLeft }],
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.button}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate("UserRegn")}
                  onPressIn={() => animateButtonScale(scaleAnimLeft, 1.03)}
                  onPressOut={() => animateButtonScale(scaleAnimLeft, 0.95)}
                >
                  <View style={styles.buttonContent}>
                    <View style={styles.iconContainer}>
                      <Image
                        source={require("../../assets/icons/case.png")}
                        style={styles.buttonIcon}
                        tintColor="#FFFFFF"
                      />
                    </View>
                    <View style={styles.buttonTextContainer}>
                      <Text style={styles.buttonTitle}>Job Seeker</Text>
                      <Text style={styles.buttonSubtitle}>
                        Find jobs that match your skills
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>

              <Animated.View
                style={[
                  styles.buttonWrapper,
                  {
                    transform: [{ scale: scaleAnimRight }],
                  },
                ]}
              >
                <TouchableOpacity
                  style={[styles.button, styles.organizationButton]}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate("OrganizationRegn")}
                  onPressIn={() => animateButtonScale(scaleAnimRight, 1.03)}
                  onPressOut={() => animateButtonScale(scaleAnimRight, 0.95)}
                >
                  <View style={styles.buttonContent}>
                    <View
                      style={[styles.iconContainer, styles.orgIconContainer]}
                    >
                      <Image
                        source={require("../../assets/icons/team.png")}
                        style={styles.buttonIcon}
                        tintColor="#FFFFFF"
                      />
                    </View>
                    <View style={styles.buttonTextContainer}>
                      <Text style={styles.buttonTitle}>Organization</Text>
                      <Text style={styles.buttonSubtitle}>
                        Post jobs and find talent
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            </View>

            <View style={styles.loginLinkContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
  },
  safeArea: {
    flex: 1,
    paddingTop: StatusBar.currentHeight || 40,
  },
  header: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: "flex-start",
    zIndex: 10,
    marginTop: Platform.OS === "android" ? 8 : 0,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    width: 20,
    height: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: height * 0.02,
  },
  logo: {
    width: 160,
    height: 100,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: height * 0.08,
  },
  headingContainer: {
    paddingHorizontal: 16,
    marginBottom: 30,
  },
  headingText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 0,
  },
  subheadingText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
  },
  buttonRow: {
    flexDirection: "column",
    justifyContent: "center",
    marginBottom: 20,
  },
  buttonWrapper: {
    width: "100%",
    marginBottom: 10,
    borderRadius: 10,
  },
  button: {
    backgroundColor: "#007AFF",
    borderRadius: 16,
    padding: 16,
    overflow: "hidden",
  },
  organizationButton: {
    backgroundColor: "#4E39D7",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  orgIconContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  buttonIcon: {
    width: 24,
    height: 24,
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  buttonSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
  },
  loginLinkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
  },
  loginLink: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
  },
});

export default Register;
