import React, { useState } from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
} from "react-native";

const EditSkillScreen = ({ route, navigation }: any) => {
    const [skills, setSkills] = useState(route.params.skills);

    const handleRemoveSkill = (skillId: string) => {
        setSkills((prev) => prev.filter((s) => s.id !== skillId));
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backButton}>←</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Edit Skill</Text>
            </View>

            {/* Skills List */}
            <FlatList
                data={skills}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.skillItem}>
                        <Text style={styles.skillText}>{item.name}</Text>
                        <TouchableOpacity onPress={() => handleRemoveSkill(item.id)}>
                            <Text style={styles.removeText}>×</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />

            {/* Change Button */}
            <TouchableOpacity
                style={styles.changeButton}
                onPress={() => {
                    // Save changes and navigate back
                    navigation.goBack();
                }}
            >
                <Text style={styles.changeButtonText}>Change</Text>
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
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    skillText: {
        fontSize: 16,
        color: "#333",
    },
    removeText: {
        fontSize: 18,
        color: "red",
        fontWeight: "bold",
    },
    changeButton: {
        backgroundColor: "#000",
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 16,
    },
    changeButtonText: {
        color: "#fff",
        textAlign: "center",
        fontWeight: "bold",
        fontSize: 16,
    },
});

export default EditSkillScreen;
