import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Pressable,
    Image,
} from "react-native";
import ModalComponent from "../../../component/Modal"; // Import the modal component

const EditEducation = ({ route, navigation }:any) => {
    const [degree, setDegree] = useState("");
    const [institution, setInstitution] = useState("");
    const [field, setfield] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [description, setDescription] = useState("");

    const [isSaveModalVisible, setSaveModalVisible] = useState(false);
    const [isRemoveModalVisible, setRemoveModalVisible] = useState(false);

    const handleSave = () => {
        console.log({
            degree,
            institution,
            field,
            startDate,
            endDate,
            description,
        });
        setSaveModalVisible(false); // Close modal after confirmation
    };

    const handleRemove = () => {
        setDegree("");
        setInstitution("");
        setfield("");
        setStartDate("");
        setEndDate("");
        setDescription("");
        setRemoveModalVisible(false); // Close modal after confirmation
    };

    return (
        <ScrollView style={styles.container}>
            
            <View style={styles.header}>
            <Pressable onPress={() => navigation.goBack()}>
          <Image
            source={require("../../../assets/icons/blackBack.png")}
            style={styles.backImage}
          />
        </Pressable>
            </View>
            
                <Text style={styles.title}>Edit Education</Text>
           

            <Text style={styles.label}>Level of Education</Text>
            <TextInput
                style={styles.input}
                placeholder="Select Level of Education"
                placeholderTextColor="#999"
                value={degree}
                onChangeText={setDegree}
            />

            <Text style={styles.label}>Institution Name</Text>
            <TextInput
                style={styles.input}
                placeholder="Select Field Of institution"
                placeholderTextColor="#999"
                value={institution}
                onChangeText={setInstitution}
            />

            <Text style={styles.label}>Field Of Study</Text>
            <TextInput
                style={styles.input}
                placeholder="Select Field Of Study"
                placeholderTextColor="#999"
                value={field}
                onChangeText={setfield}
            />

            <View style={styles.row}>
                <View style={styles.halfContainer}>
                    <Text style={styles.label}>Start Date</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="MM/DD/YYYY"
                        placeholderTextColor="#999"
                        value={startDate}
                        onChangeText={setStartDate}
                    />
                </View>

                <View style={styles.halfContainer}>
                    <Text style={styles.label}>End Date</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="MM/DD/YYYY"
                        placeholderTextColor="#999"
                        value={endDate}
                        onChangeText={setEndDate}
                    />
                </View>
            </View>

            <Text style={styles.label}>Description</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Write additional information here"
                placeholderTextColor="#999"
                value={description}
                onChangeText={setDescription}
                multiline={true}
            />

            <View style={styles.row}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.removeButton]}
                    onPress={() => setRemoveModalVisible(true)}
                >
                    <Text style={styles.actionButtonText}>REMOVE</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, styles.saveButton]}
                    onPress={() => setSaveModalVisible(true)}
                >
                    <Text style={styles.actionButtonText}>SAVE</Text>
                </TouchableOpacity>
            </View>

            {/* Save Confirmation Modal */}
            <ModalComponent
                isVisible={isSaveModalVisible}
                title="Save Changes?"
                message="Are you sure you want to save these changes?"
                onConfirm={handleSave}
                onCancel={() => setSaveModalVisible(false)}
                confirmText="Save"
                cancelText="Cancel"
            />

            {/* Remove Confirmation Modal */}
            <ModalComponent
                isVisible={isRemoveModalVisible}
                title="Remove Education?"
                message="Are you sure you want to remove this education?"
                onConfirm={handleRemove}
                onCancel={() => setRemoveModalVisible(false)}
                confirmText="Remove"
                cancelText="Cancel"
            />
        </ScrollView>
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
    // backButton: {
    //     fontSize: 18,
    //     color: "#000",
    //     marginRight: 16,
    // },
    backImage: {
        height: 10,
        width: 20,
        top: 10,
        bottom: 26,
      },
      title: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center", // Centers the text horizontally
        marginBottom: 16,    // Adds spacing below the title
    },
    
    label: {
        fontSize: 16,
        fontWeight: "500",
        marginBottom: 8,
        color: "#333",
    },
    input: {
        backgroundColor: "#fff",
        borderColor: "#ddd",
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        fontSize: 16,
        color: "#000",
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    halfContainer: {
        width: "48%",
    },
    textArea: {
        height: 100,
        textAlignVertical: "top",
    },
    actionButton: {
        flex: 1,
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: "center",
        marginHorizontal: 5,
    },
    removeButton: {
        backgroundColor: "#D6CDFE",
    },
    saveButton: {
        backgroundColor: "#1e0f6a",
    },
    actionButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default EditEducation;
