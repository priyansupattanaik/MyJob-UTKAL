import React from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
} from "react-native";

const SkillListScreen = ({ route, navigation }: any) => {
    const { selectedSkills } = route.params;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backButton}>←</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Skill List</Text>
            </View>

            {/* Skill List */}
            <FlatList
                data={selectedSkills}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View style={styles.skillItem}>
                        <Text style={styles.skillText}>{item.name}</Text>
                    </View>
                )}
            />

            {/* Save Button */}
            <TouchableOpacity
                style={styles.saveButton}
                onPress={() => navigation.navigate("EditSkill", { skills: selectedSkills })}
            >
                <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
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
        marginBottom: 24,
    },
    backButton: {
        fontSize: 18,
        color: "#000",
        marginRight: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
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
        backgroundColor: "#000",
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 16,
    },
    saveButtonText: {
        color: "#fff",
        textAlign: "center",
        fontWeight: "bold",
        fontSize: 16,
    },
});

export default SkillListScreen;
