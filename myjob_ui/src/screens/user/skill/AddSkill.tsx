import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Pressable,
    Image,
} from "react-native";
import { useNavigation } from '@react-navigation/native';  // Import the navigation hook

const AddSkill = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const skills = [
        "Graphic Design",
        "Graphic Thinking",
        "UI/UX Design",
        "Adobe Indesign",
        "Web Design",
        "InDesign",
        "Canva Design",
        "User Interface Design",
        "Product Design",
        "User Experience Design",
    ];

    // Filter skills based on the search term
    const filteredSkills = skills.filter((skill) =>
        skill.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleClearSearch = () => setSearchTerm("");

    // Use navigation hook
    const navigation = useNavigation();

    const handleSave = () => {
        // You can save the skills here (e.g., make an API call or update local state)
        // After saving, navigate to the Profile screen
        navigation.navigate("Profile");  // Replace "Profile" with the correct name of your Profile screen
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
            <Pressable onPress={() => navigation.goBack()}>
            <Image
              source={require('../../../assets/icons/blackBack.png')} // Replace with your image URL or local image source
            />
          </Pressable>
              
            </View>

            {/* Title */}
            <Text style={styles.title}>Add Skill</Text>
            {/* Search Bar */}
            <View style={styles.searchBar}>
           
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search"
                    placeholderTextColor="#999"
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                />
                {searchTerm ? (
                    <Pressable onPress={handleClearSearch}>
                        <Text style={styles.clearButton}>×</Text>
                    </Pressable>
                ) : null}
            </View>

            {/* Skill List */}
            <FlatList
                data={filteredSkills}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <Pressable style={styles.skillItem}>
                        <Text style={styles.skillText}>{item}</Text>
                    </Pressable>
                )}
            />

            {/* Save Button */}
            <Pressable style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save</Text>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f8f8",
        padding: 16,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    backButton: {
        fontSize: 18,
        color: "#000",
        marginRight: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ddd",
        paddingHorizontal: 12,
        paddingVertical: 5,
        marginBottom: 16,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: "#000",
    },
    clearButton: {
        fontSize: 18,
        color: "#999",
        marginLeft: 8,
    },
    skillItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    skillText: {
        fontSize: 16,
        color: "#333",
    },
    saveButton: {
        backgroundColor: "#000080",
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 16,
        alignItems: "center",
    },
    saveButtonText: {
        fontSize: 18,
        color: "#fff",
        fontWeight: "bold",
    },
});

export default AddSkill;
