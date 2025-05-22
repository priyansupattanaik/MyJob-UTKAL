import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Image,
    Pressable,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';

const AddResume = () => {
    const [resumeFile, setResumeFile] = useState(null);
    const navigation = useNavigation();

    const handleUpload = async () => {
        try {
            const result:any = await DocumentPicker.pick({
                type: [DocumentPicker.types.pdf],
            });
            setResumeFile(result);
            Alert.alert('File Selected', result[0]?.name || 'File selected successfully.');
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
                Alert.alert('Upload Cancelled', 'No file was selected.');
            } else {
                Alert.alert('Error', 'Something went wrong while uploading the file.');
            }
        }
    };

    const handleSave = () => {
        if (!resumeFile) {
            Alert.alert('No File Selected', 'Please upload a resume file before saving.');

            return;
        }
        // Logic to save the file (e.g., API call)
        Alert.alert('Success', 'Resume uploaded successfully!');
    };

    return (
        <View style={styles.container}>
            <Pressable style={styles.backButton}
            onPress={() => navigation.navigate("AddEducation")}
            >
            <Image
            source={require("../../../assets/icons/blackBack.png")}
            style={styles.backImage}
          />
            </Pressable>

            <Text style={styles.header}>Add Resume</Text>
           
            <Pressable style={styles.uploadButton} onPress={handleUpload}>
            <Image
            source={require("../../../assets/icons/Upload.png")}
            style={styles.backImage}
          />
                <Text style={styles.uploadText}>Upload CV/Resume</Text>
            </Pressable>

            {resumeFile && (
                <Text style={styles.fileName}>Selected File: {resumeFile[0]?.name}</Text>
            )}

            <Text style={styles.instructions}>
                Upload files in PDF format up to 5 MB. Just upload it once, and you can use it in your next application.
            </Text>

            <Pressable style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>SAVE</Text>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F5F5F5',
    },
    backButton: {
        marginBottom: 20,
    },
    backButtonText: {
        fontSize: 18,
        color: '#000',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 30,
        top:20
    },
    backImage: {
        height: 20,
        width: 20,
       
      },
    uploadButton: {
        borderWidth: 1,
        borderColor: '#CCC',
        borderRadius: 8,
        padding: 20,
        backgroundColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        flexDirection:'row',
        gap: 20,
    },
    uploadText: {
        fontSize: 16,
        color: '#000',
    },
    fileName: {
        fontSize: 14,
        color: '#555',
        marginTop: 10,
    },
    instructions: {
        fontSize: 14,
        color: '#666',
        marginTop: 10,
        marginBottom: 30,
        textAlign: 'center',
    },
    saveButton: {
        backgroundColor: '#000080', // Navy blue color
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default AddResume;
