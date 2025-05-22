import React from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity } from "react-native";

const ModalComponent = ({
    isVisible,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = "Confirm",
    cancelText = "Cancel",
}:any) => {
    return (
        <Modal
            transparent={true}
            visible={isVisible}
            animationType="slide"
            onRequestClose={onCancel}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalHeader}>{title}</Text>
                    <Text style={styles.modalSubHeader}>{message}</Text>
                    <View style={styles.modalButtons}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={onCancel}
                        >
                            <Text style={styles.cancelText}>{cancelText}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.confirmButton}
                            onPress={onConfirm}
                        >
                            <Text style={styles.confirmText}>{confirmText}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
        backgroundColor: "white",
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        alignItems: "center",
    },
    modalHeader: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#333",
    },
    modalSubHeader: {
        fontSize: 14,
        color: "#666",
        marginBottom: 20,
        textAlign: "center",
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    cancelButton: {
        flex: 1,
        backgroundColor: "#D6CDFE",
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: "center",
        marginRight: 5,
    },
    cancelText: {
        color: "white",
        fontWeight: "bold",
    },
    confirmButton: {
        flex: 1,
        backgroundColor: "#000080",
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: "center",
        marginLeft: 5,
    },
    confirmText: {
        color: "white",
        fontWeight: "bold",
    },
});

export default ModalComponent;
