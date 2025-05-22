import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Image,
  Animated,
  Dimensions,
  StatusBar,
} from "react-native";
import { useAuth } from "../../context/AuthContext";

const { width } = Dimensions.get("window");

const SplashScreen = ({ navigation }: { navigation: any }) => {
  const { userToken, type, loading } = useAuth();

  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Start animation sequence
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 10,
          friction: 3,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Navigation timer
    const timer = setTimeout(() => {
      if (loading) return;

      // Navigate based on authentication state
      if (userToken) {
        if (type?.toLowerCase() === "user") {
          navigation.replace("TabNavigator");
        } else if (type?.toLowerCase() === "org") {
          navigation.replace("OrganizationHomeScreen");
        } else {
          navigation.replace("Login");
        }
      } else {
        navigation.replace("Login");
      }
    }, 2500); // Reduced to 2.5 seconds for better UX

    return () => clearTimeout(timer);
  }, [userToken, type, loading, navigation]);

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Image
            source={require("../../assets/icons/Logo3.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.highlight,
            {
              opacity: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.4],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1b59d6",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 180,
    height: 180,
  },
  highlight: {
    position: "absolute",
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
    backgroundColor: "#ffffff",
    zIndex: -1,
  },
});

export default SplashScreen;
