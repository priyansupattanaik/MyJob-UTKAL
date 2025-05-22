import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { View, Image, Pressable, Text, StyleSheet, TextInput } from "react-native";

const NoSearches = () => {
  const navigation = useNavigation();
  const [searchInput, setSearchInput] = useState("");

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.navigate("Filter")}>
          <Image
            source={require("../../../assets/icons/Back.png")}
            style={styles.backImage}
          />
        </Pressable>
      </View>

      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.textInput}
          placeholder="Search for jobs, skills, or industry"
          placeholderTextColor="#999"
          value={searchInput}
          onChangeText={(text) => setSearchInput(text)}
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
       
        <Image
          source={require("../../../assets/icons/Illustrasi.png")}
          style={styles.icon}
        />
         <Text style={styles.headingText}>No Searches Yet</Text>
        <Text style={styles.description}>
          The search could not be found,Please check spelling and write another word
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  header: {
    height: 30,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  backImage: {
    height: 20,
    width: 20,
    position: "absolute",
    top: 10,
   
  },
  inputWrapper: {
    marginHorizontal: 20,
    marginVertical: 40,
  },
  textInput: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 2,
    borderColor: "#ddd",
    borderWidth: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  headingText: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  icon: {
    height: 150,
    width: 100,
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
  },
});

export default NoSearches;
