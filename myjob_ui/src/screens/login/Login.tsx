import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Animated,
  Dimensions,
  Keyboard,
  ImageBackground,
  Pressable,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import config from "../../context/config";

const { width } = Dimensions.get("window");

const ASSETS = {
  backgroundImage: require("../../assets/icons/loginBG.jpg"),
  logo: require("../../assets/icons/Logo2.png"),
  emailIcon: require("../../assets/icons/mail.png"),
  lockIcon: require("../../assets/icons/lock.png"),
  eyeIcon: require("../../assets/icons/eye.png"),
};

export default function LoginScreen({ navigation }: any) {
  // State variables
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isJobSeeker, setIsJobSeeker] = useState(true);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const toggleAnim = useRef(new Animated.Value(isJobSeeker ? 0 : 110)).current;
  const inputFocus = useRef(new Animated.Value(0)).current;

  // Handle keyboard appearance
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => setKeyboardVisible(false)
    );

    // Start entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Login API URL based on user type
  const apiUrl = isJobSeeker
    ? `${config.apiUrl}/personalDetails/login`
    : `${config.apiUrl}/organizationDetails/login`;

  // Handle login submission
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Required Fields", "Please enter your email and password.", [
        { text: "OK" },
      ]);
      return;
    }

    try {
      const response = await axios.post(apiUrl, { email, password });

      if (response.status === 200) {
        const { accessToken, data } = response.data;

        // Store user data
        await AsyncStorage.setItem("userToken", accessToken);
        if (data.type?.toLowerCase() === "org") {
          await AsyncStorage.setItem("userId", data.compId);
        } else if (data.type?.toLowerCase() === "user") {
          await AsyncStorage.setItem("userId", data.userId);
        }
        await AsyncStorage.setItem("type", data.type);

        // Navigate to appropriate screen
        navigation.replace(
          isJobSeeker ? "TabNavigator" : "OrganizationHomeScreen"
        );
      }
    } catch (error: any) {
      console.error("Login error:", error.message);

      let errorMessage = "Unable to sign in. Please check your credentials.";

      if (error.response) {
        const { status, data } = error.response;
        if (status === 404) {
          errorMessage = "Account not found. Please register first.";
        } else if (status === 400) {
          errorMessage = data.message || "Invalid email or password.";
        }
      } else {
        errorMessage = "Network error. Please check your connection.";
      }

      Alert.alert("Sign In Failed", errorMessage, [{ text: "OK" }]);
    }
  };

  // Toggle between Job Seeker and Organization
  const toggleUserType = (value) => {
    // Set the state immediately to avoid lag in UI response
    setIsJobSeeker(value);

    // Calculate toggle position (each toggle option is 110px wide)
    const togglePosition = value ? 0 : 110;

    // Animate the toggle indicator
    Animated.spring(toggleAnim, {
      toValue: togglePosition,
      friction: 8,
      tension: 60,
      useNativeDriver: true,
    }).start();
  };

  // Calculate logo size based on keyboard visibility
  const logoSize = !isKeyboardVisible
    ? { width: 160, height: 80 }
    : { width: 120, height: 60 };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <ImageBackground
        source={ASSETS.backgroundImage}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay} />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
        >
          <Animated.View
            style={[
              styles.contentContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
                marginTop: isKeyboardVisible ? -60 : 0,
              },
            ]}
          >
            <Animated.Image
              source={ASSETS.logo}
              style={[styles.logo, logoSize]}
              resizeMode="contain"
            />

            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>

            {/* User Type Toggle */}
            <View style={styles.toggleWrapper}>
              <View style={styles.toggleContainer}>
                <Animated.View
                  style={[
                    styles.toggleIndicator,
                    { transform: [{ translateX: toggleAnim }] },
                  ]}
                />
                <TouchableOpacity
                  style={styles.toggleOption}
                  onPress={() => toggleUserType(true)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      isJobSeeker && styles.activeToggleText,
                    ]}
                  >
                    Job Seeker
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.toggleOption}
                  onPress={() => toggleUserType(false)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      !isJobSeeker && styles.activeToggleText,
                    ]}
                  >
                    Organization
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Image source={ASSETS.emailIcon} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="rgba(255,255,255,0.6)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                selectionColor="#7FB3FF"
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Image source={ASSETS.lockIcon} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="rgba(255,255,255,0.6)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                selectionColor="#7FB3FF"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIconContainer}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              >
                <Image
                  source={ASSETS.eyeIcon}
                  style={[styles.eyeIcon, showPassword && styles.activeEyeIcon]}
                />
              </TouchableOpacity>
            </View>

            {/* Sign In Button */}
            <TouchableOpacity
              style={styles.loginButton}
              activeOpacity={0.8}
              onPress={handleLogin}
            >
              <Text style={styles.loginButtonText}>Sign In</Text>
            </TouchableOpacity>

            {/* Register Link */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text style={styles.registerLink}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: "center",
  },
  contentContainer: {
    alignItems: "center",
    paddingHorizontal: 24,
  },
  logo: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 32,
    textAlign: "center",
  },
  toggleWrapper: {
    width: "100%",
    alignItems: "center",
    marginBottom: 24,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 25,
    width: 220,
    height: 46,
    position: "relative",
    overflow: "hidden",
  },
  toggleIndicator: {
    position: "absolute",
    width: 110,
    height: 38,
    backgroundColor: "#007AFF",
    borderRadius: 22,
    top: 4,
    left: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 0,
  },
  toggleOption: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
    height: "100%",
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.7)",
  },
  activeToggleText: {
    color: "#FFFFFF",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 56,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  inputIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
    tintColor: "rgba(255,255,255,0.7)",
  },
  input: {
    flex: 1,
    height: "100%",
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "400",
  },
  eyeIconContainer: {
    padding: 5,
  },
  eyeIcon: {
    width: 20,
    height: 20,
    tintColor: "rgba(255,255,255,0.5)",
  },
  activeEyeIcon: {
    tintColor: "#7FB3FF",
  },
  loginButton: {
    width: "100%",
    height: 56,
    backgroundColor: "#007AFF",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  registerContainer: {
    flexDirection: "row",
    marginTop: 24,
  },
  registerText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
  },
  registerLink: {
    color: "#007AFF",
    fontWeight: "600",
    fontSize: 14,
  },
});
