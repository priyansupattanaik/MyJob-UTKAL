import * as React from "react";
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  Text,
  Platform,
  TouchableOpacity,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import UserHomeScreen from "../screens/user/home/UserHomeScreen";
import JobSearchScreen from "../screens/user/jobScreen/JobSearchScreen";
import SavedJobsScreen from "../screens/user/home/SavedJobsScreen";

// Get screen dimensions
const { width: screenWidth } = Dimensions.get("window");

// Modern color palette that matches the app
const COLORS = {
  darkestBlue: "#021024",
  darkBlue: "#052659",
  mediumBlue: "#5483B3",
  lightBlue: "#7DA0C4",
  lightestBlue: "#C1E8FF",
  white: "#FFFFFF",
  tabBarBackground: "#FFFFFF",
  tabBarBorder: "#F0F0F0",
};

// Create Stack Navigators for each tab
const Stack = createStackNavigator();

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeScreen" component={UserHomeScreen} />
  </Stack.Navigator>
);

const JobsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="JobsScreen" component={JobSearchScreen} />
  </Stack.Navigator>
);

const SavedStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SavedScreen" component={SavedJobsScreen} />
  </Stack.Navigator>
);

// Create Bottom Tab Navigator
const Tab = createBottomTabNavigator();

// Custom Tab Bar Component with simple, reliable design
function CustomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();

  // Calculate bottom padding based on device
  const bottomPadding =
    Platform.OS === "ios" ? Math.max(insets.bottom, 12) : 12;

  // No complex state, just render based on the navigation state
  return (
    <View style={[styles.tabBarContainer, { paddingBottom: bottomPadding }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel || options.title || route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        // Choose icon based on route name
        let iconSource;
        switch (route.name) {
          case "Home":
            iconSource = require("../assets/icons/home.png");
            break;
          case "Jobs":
            iconSource = require("../assets/icons/Search.png");
            break;
          case "Saved":
            iconSource = require("../assets/icons/save.png");
            break;
          default:
            iconSource = require("../assets/icons/home.png");
        }

        return (
          <TouchableOpacity
            key={index}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            style={styles.tabButton}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.tabItemContainer,
                isFocused && styles.tabItemContainerFocused,
              ]}
            >
              <View style={styles.iconContainer}>
                <Image
                  source={iconSource}
                  style={[
                    styles.tabIcon,
                    {
                      tintColor: isFocused ? COLORS.darkBlue : COLORS.lightBlue,
                    },
                  ]}
                  resizeMode="contain"
                />
              </View>

              <Text
                style={[
                  styles.tabLabel,
                  { color: isFocused ? COLORS.darkBlue : COLORS.lightBlue },
                ]}
              >
                {label}
              </Text>

              {isFocused && <View style={styles.activeIndicator} />}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// Main Tab Navigator Component
export default function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
      sceneContainerStyle={{ backgroundColor: COLORS.white }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarLabel: "Home",
        }}
      />

      <Tab.Screen
        name="Jobs"
        component={JobsStack}
        options={{
          tabBarLabel: "Jobs",
        }}
      />

      <Tab.Screen
        name="Saved"
        component={SavedStack}
        options={{
          tabBarLabel: "Saved",
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 0,
    left: screenWidth * 0.15, // 15% from left
    right: screenWidth * 0.15, // 15% from right
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
    paddingHorizontal: 15,

    // Platform-specific shadows for elevated look
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),

    // Clean border for a more refined look
    borderWidth: 0.5,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 2,
    maxHeight: 40,
  },
  tabItemContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    position: "relative",
  },
  tabItemContainerFocused: {
    // No background change - cleaner look
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: 24,
    width: 24,
    marginBottom: 2,
  },
  tabIcon: {
    width: 28,
    height: 28,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
  },
  activeIndicator: {
    position: "absolute",
    bottom: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.darkBlue,
  },
});
