import React from "react";
import { StatusBar, Platform, SafeAreaView, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import "react-native-gesture-handler";
import { enableScreens } from "react-native-screens";
import { ProfileProvider } from "./src/context/ProfileContext";
import { AuthProvider } from "./src/context/AuthContext";

import { SafeAreaProvider } from "react-native-safe-area-context";

// Screens imports
import SplashScreen from "./src/screens/login/Splash";
import LoginScreen from "./src/screens/login/Login";
import Register from "./src/screens/login/Register";
import UserHomeScreen from "./src/screens/user/home/UserHomeScreen";
import ApplyScreen from "./src/screens/user/jobScreen/ApplyScreen";
import UploadCV from "./src/screens/user/jobScreen/UploadCV";
import SavedJobsScreen from "./src/screens/user/home/SavedJobsScreen";
import OrganizationHomeScreen from "./src/screens/organization/OrganizationHomeScreen";
import JobSearchScreen from "./src/screens/user/jobScreen/JobSearchScreen";
import Specialization from "./src/screens/user/jobScreen/Specialization";
import NoSearches from "./src/screens/user/jobScreen/NoSearches";
import MyProfile from "./src/screens/user/completeProfile/MyProfile";
import UserRegn from "./src/screens/login/UserRegn";
import PasswordScreen from "./src/screens/user/completeProfile/PasswordScreen";
import AddResume from "./src/screens/user/resume/AddResume";
import AddSkill from "./src/screens/user/skill/AddSkill";
import SkillListScreen from "./src/screens/user/skill/SkillListScreen";
import EditSkillScreen from "./src/screens/user/skill/EditSkill";
import AddEducation from "./src/screens/user/education/AddEducation";
import AddJobPage from "./src/screens/organization/JobPost";
import JobPost from "./src/screens/organization/JobPost";
import JobShare from "./src/screens/organization/JobShare";
import ReceivedApplicationScreen from "./src/screens/organization/ReceivedApplicationScreen";
import EditEducation from "./src/screens/user/education/EditEducation";
import OrganizationRegn from "./src/screens/login/OrganizationRegn";
import OrganizationProfile from "./src/screens/organization/OrganizationProfile";
import TabNavigator from "./src/component/TabNavigator";

// Enable screens for better performance
enableScreens();

const Stack = createStackNavigator();

// Default screen options with safe area handling
const screenOptions = {
  headerShown: false,
  cardStyle: { backgroundColor: "#FFFFFF" },
};

const App = () => {
  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <AuthProvider>
        <ProfileProvider>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Splash"
              screenOptions={screenOptions}
            >
              <Stack.Screen name="Splash" component={SplashScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={Register} />
              <Stack.Screen name="UserRegn" component={UserRegn} />
              <Stack.Screen name="UserHomeScreen" component={UserHomeScreen} />
              <Stack.Screen name="ApplyScreen" component={ApplyScreen} />
              <Stack.Screen name="UploadCV" component={UploadCV} />
              <Stack.Screen name="TabNavigator" component={TabNavigator} />
              <Stack.Screen
                name="SavedJobsScreen"
                component={SavedJobsScreen}
              />
              <Stack.Screen
                name="OrganizationHomeScreen"
                component={OrganizationHomeScreen}
              />
              <Stack.Screen
                name="JobSearchScreen"
                component={JobSearchScreen}
              />
              <Stack.Screen name="Specialization" component={Specialization} />
              <Stack.Screen name="NoSearches" component={NoSearches} />
              <Stack.Screen name="MyProfile" component={MyProfile} />
              <Stack.Screen name="PasswordScreen" component={PasswordScreen} />
              <Stack.Screen name="AddResume" component={AddResume} />
              <Stack.Screen name="EditEducation" component={EditEducation} />
              <Stack.Screen name="AddSkill" component={AddSkill} />
              <Stack.Screen name="SkillList" component={SkillListScreen} />
              <Stack.Screen
                name="EditSkillScreen"
                component={EditSkillScreen}
              />
              <Stack.Screen name="AddEducation" component={AddEducation} />
              <Stack.Screen name="JobPage" component={AddJobPage} />
              <Stack.Screen name="JobPost" component={JobPost} />
              <Stack.Screen name="JobShare" component={JobShare} />
              <Stack.Screen
                name="ReceivedApplication"
                component={ReceivedApplicationScreen}
              />
              <Stack.Screen
                name="OrganizationProfile"
                component={OrganizationProfile}
              />
              <Stack.Screen
                name="OrganizationRegn"
                component={OrganizationRegn}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </ProfileProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;
