import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Modal,
  TextInput,
  FlatList,
  ActivityIndicator,
  StatusBar,
  Dimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import config from "../../context/config";
import jobsData from "../../context/Jobs.json";

// Get screen dimensions
const { width, height } = Dimensions.get("window");

// Material Design 3 colors
const COLORS = {
  primary: "#1976D2", // Material Blue 700
  primaryContainer: "#E3F2FD", // Material Blue 50
  onPrimaryContainer: "#1976D2", // Material Blue 700
  secondary: "#0288D1", // Material Light Blue 700
  surface: "#FFFFFF",
  background: "#F5F7FA",
  surfaceVariant: "#F5F5F5",
  outline: "#E0E0E0",
  error: "#B00020",
  onSurface: "#1D1B20",
  onSurfaceVariant: "#49454F",
  onSurfaceDisabled: "#1F1F1F61",
};

// Form field component using Material Design 3 guidelines
const FormField = ({ label, value, onPress, required, error }) => (
  <TouchableOpacity
    style={styles.formField}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.formFieldContent}>
      <Text style={styles.formFieldLabel}>
        {label}
        {required && <Text style={styles.requiredStar}>*</Text>}
      </Text>
      <View style={styles.formFieldValueContainer}>
        <Text
          style={[
            value ? styles.formFieldValue : styles.formFieldPlaceholder,
            error && styles.formFieldError,
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {value || `Select ${label}`}
        </Text>
        {error && <Text style={styles.errorMessage}>{error}</Text>}
      </View>
    </View>
    <Image
      source={require("../../assets/icons/arrow-right.png")}
      style={styles.formFieldArrow}
    />
  </TouchableOpacity>
);

// Bottom sheet modal following Material Design 3
const MaterialBottomSheet = ({ visible, onClose, title, children }) => (
  <Modal
    visible={visible}
    transparent={true}
    animationType="slide"
    statusBarTranslucent
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHandleContainer}>
          <View style={styles.modalHandle} />
        </View>
        <View style={styles.modalHeader}>
          <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
            <Image
              source={require("../../assets/icons/close.png")}
              style={styles.modalCloseIcon}
            />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{title}</Text>
          <View style={styles.modalHeaderSpacer} />
        </View>
        <View style={styles.modalContent}>{children}</View>
      </View>
    </View>
  </Modal>
);

// Material list item
const MaterialListItem = ({ item, selected, onSelect }) => (
  <TouchableOpacity
    style={[styles.listItem, selected && styles.listItemSelected]}
    onPress={() => onSelect(item)}
    activeOpacity={0.7}
  >
    <Text style={styles.listItemText}>{item}</Text>
    {selected && (
      <View style={styles.selectedCheckmark}>
        <Image
          source={require("../../assets/icons/check.png")}
          style={styles.checkIcon}
        />
      </View>
    )}
  </TouchableOpacity>
);

// Material search component
const MaterialSearch = ({ searchText, onSearchChange }) => (
  <View style={styles.searchContainer}>
    <Image
      source={require("../../assets/icons/Search.png")}
      style={styles.searchIcon}
    />
    <TextInput
      style={styles.searchInput}
      placeholder="Search"
      value={searchText}
      onChangeText={onSearchChange}
      placeholderTextColor={COLORS.onSurfaceVariant}
    />
    {searchText.length > 0 && (
      <TouchableOpacity onPress={() => onSearchChange("")}>
        <Image
          source={require("../../assets/icons/close.png")}
          style={styles.clearSearchIcon}
        />
      </TouchableOpacity>
    )}
  </View>
);

// Option list component
const OptionList = ({ options, selectedValue, onSelect }) => (
  <FlatList
    data={options}
    keyExtractor={(item, index) => `option-${index}`}
    renderItem={({ item }) => {
      const itemValue = typeof item === "object" ? item.title : item;
      const isSelected =
        selectedValue === itemValue ||
        (Array.isArray(selectedValue) && selectedValue.includes(itemValue));

      return (
        <MaterialListItem
          item={itemValue}
          selected={isSelected}
          onSelect={onSelect}
        />
      );
    }}
    style={styles.optionList}
  />
);

// Search list component
const SearchList = ({
  data,
  selectedValues,
  onSelect,
  multiSelect,
  onSave,
}) => {
  const [searchText, setSearchText] = useState("");

  const filteredData = data.filter((item) => {
    const itemValue = typeof item === "object" ? item.title : item;
    return itemValue.toLowerCase().includes(searchText.toLowerCase());
  });

  return (
    <View style={styles.searchListContainer}>
      <MaterialSearch searchText={searchText} onSearchChange={setSearchText} />

      {multiSelect && selectedValues.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipContainer}
          contentContainerStyle={styles.chipContentContainer}
        >
          {selectedValues.map((value, index) => (
            <View key={`chip-${index}`} style={styles.chip}>
              <Text style={styles.chipText}>{value}</Text>
              <TouchableOpacity
                onPress={() => onSelect(value)}
                style={styles.chipRemove}
              >
                <Image
                  source={require("../../assets/icons/close.png")}
                  style={styles.chipRemoveIcon}
                />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      <OptionList
        options={filteredData}
        selectedValue={selectedValues}
        onSelect={onSelect}
      />

      {multiSelect && (
        <TouchableOpacity style={styles.saveButton} onPress={onSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Text input modal
const TextInputModal = ({
  visible,
  onClose,
  title,
  value,
  onSave,
  multiline,
  keyboardType,
}) => {
  const [text, setText] = useState(value || "");

  return (
    <MaterialBottomSheet visible={visible} onClose={onClose} title={title}>
      <View style={styles.inputModalContainer}>
        <TextInput
          style={[
            styles.modalTextInput,
            multiline && styles.modalTextInputMultiline,
          ]}
          value={text}
          onChangeText={setText}
          multiline={multiline}
          keyboardType={keyboardType}
          placeholderTextColor={COLORS.onSurfaceVariant}
          textAlignVertical={multiline ? "top" : "center"}
        />

        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => {
            onSave(text);
            onClose();
          }}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </MaterialBottomSheet>
  );
};

// Main JobPost component
const JobPost = ({ navigation }) => {
  // State for form data
  const [formData, setFormData] = useState({
    sector: "",
    jobPosition: "",
    workplaceType: "",
    jobLocation: "",
    employmentType: "",
    skills: [],
    requirements: [],
    yearsExperience: "",
    description: "",
  });

  // State for errors
  const [errors, setErrors] = useState({});

  // State for active modal
  const [activeModal, setActiveModal] = useState(null);

  // State for submitting
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for sector data
  const [sectorData, setSectorData] = useState({
    skills: [],
    designations: [],
  });

  // Update sector data when sector changes
  useEffect(() => {
    if (formData.sector) {
      const sector = jobsData.sec.find((s) => s.sector === formData.sector);
      if (sector) {
        setSectorData({
          skills: sector.skills,
          designations: sector.designations,
        });
      }
    }
  }, [formData.sector]);

  // Sample locations
  const locations = [
    "New York, USA",
    "San Francisco, USA",
    "London, UK",
    "Berlin, Germany",
    "Singapore",
    "Tokyo, Japan",
    "Remote",
  ];

  // Workplace types
  const workplaceTypes = [
    { title: "Onsite" },
    { title: "Hybrid" },
    { title: "Remote" },
  ];

  // Employment types
  const employmentTypes = [
    { title: "Full-Time" },
    { title: "Part-Time" },
    { title: "Contract" },
    { title: "Internship" },
  ];

  // Update form data
  const updateFormField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handle skills toggle
  const handleSkillToggle = (skill) => {
    setFormData((prev) => {
      const newSkills = [...prev.skills];
      const index = newSkills.indexOf(skill);

      if (index >= 0) {
        newSkills.splice(index, 1);
      } else {
        newSkills.push(skill);
      }

      return { ...prev, skills: newSkills };
    });
  };

  // Handle requirements
  const saveRequirements = (reqText) => {
    const requirements = reqText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    updateFormField("requirements", requirements);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      "sector",
      "jobPosition",
      "workplaceType",
      "jobLocation",
      "employmentType",
      "yearsExperience",
      "description",
    ];

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = "Required";
      }
    });

    if (formData.skills.length === 0) {
      newErrors.skills = "Required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit job post
  const submitJob = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const compId = await AsyncStorage.getItem("userId");

      const jobData = {
        compId,
        degName: formData.jobPosition,
        secName: formData.sector,
        jobLocation: formData.jobLocation,
        skills: formData.skills,
        jobDescription: formData.description,
        yearsOfExperience: parseInt(formData.yearsExperience) || 0,
        requirements: formData.requirements,
        jobType: formData.employmentType,
        workPlaceType: formData.workplaceType,
      };

      const response = await axios.post(
        `${config.apiUrl}/postedjob/create`,
        jobData
      );

      if (response.status === 201) {
        navigation.navigate("OrganizationHomeScreen");
      }
    } catch (error) {
      console.error("Error posting job:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show empty state for job position and skills
  const renderEmptyState = (modalType) => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>Please select a sector first</Text>
      <TouchableOpacity
        style={styles.emptyStateButton}
        onPress={() => setActiveModal("sector")}
      >
        <Text style={styles.emptyStateButtonText}>Select Sector</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar
        backgroundColor={COLORS.surface}
        barStyle="dark-content"
        translucent={false}
      />

      {/* App bar */}
      <View style={styles.appBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Image
            source={require("../../assets/icons/backIcon.png")}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>Post Job</Text>
        <TouchableOpacity
          style={[styles.postButton, isSubmitting && styles.postButtonDisabled]}
          onPress={submitJob}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.postButtonText}>Post</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <FormField
            label="Sector"
            value={formData.sector}
            onPress={() => setActiveModal("sector")}
            required={true}
            error={errors.sector}
          />

          <FormField
            label="Job Position"
            value={formData.jobPosition}
            onPress={() => setActiveModal("position")}
            required={true}
            error={errors.jobPosition}
          />

          <FormField
            label="Workplace Type"
            value={formData.workplaceType}
            onPress={() => setActiveModal("workplace")}
            required={true}
            error={errors.workplaceType}
          />

          <FormField
            label="Location"
            value={formData.jobLocation}
            onPress={() => setActiveModal("location")}
            required={true}
            error={errors.jobLocation}
          />

          <FormField
            label="Employment Type"
            value={formData.employmentType}
            onPress={() => setActiveModal("employment")}
            required={true}
            error={errors.employmentType}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Job Details</Text>

          <FormField
            label="Skills"
            value={
              formData.skills.length > 0
                ? `${formData.skills.length} skills selected`
                : ""
            }
            onPress={() => setActiveModal("skills")}
            required={true}
            error={errors.skills}
          />

          <FormField
            label="Requirements"
            value={
              formData.requirements.length > 0
                ? `${formData.requirements.length} requirements added`
                : ""
            }
            onPress={() => setActiveModal("requirements")}
          />

          <FormField
            label="Years of Experience"
            value={formData.yearsExperience}
            onPress={() => setActiveModal("experience")}
            required={true}
            error={errors.yearsExperience}
          />

          <FormField
            label="Description"
            value={formData.description ? "Description added" : ""}
            onPress={() => setActiveModal("description")}
            required={true}
            error={errors.description}
          />
        </View>
      </ScrollView>

      {/* Modals */}
      <MaterialBottomSheet
        visible={activeModal === "sector"}
        onClose={() => setActiveModal(null)}
        title="Select Sector"
      >
        <OptionList
          options={jobsData.sec.map((s) => s.sector)}
          selectedValue={formData.sector}
          onSelect={(sector) => {
            updateFormField("sector", sector);
            updateFormField("jobPosition", "");
            updateFormField("skills", []);
            setActiveModal(null);
          }}
        />
      </MaterialBottomSheet>

      <MaterialBottomSheet
        visible={activeModal === "position"}
        onClose={() => setActiveModal(null)}
        title="Select Job Position"
      >
        {formData.sector ? (
          <SearchList
            data={sectorData.designations}
            selectedValues={formData.jobPosition}
            onSelect={(position) => {
              updateFormField("jobPosition", position);
              setActiveModal(null);
            }}
          />
        ) : (
          renderEmptyState("position")
        )}
      </MaterialBottomSheet>

      <MaterialBottomSheet
        visible={activeModal === "workplace"}
        onClose={() => setActiveModal(null)}
        title="Select Workplace Type"
      >
        <OptionList
          options={workplaceTypes.map((t) => t.title)}
          selectedValue={formData.workplaceType}
          onSelect={(type) => {
            updateFormField("workplaceType", type);
            setActiveModal(null);
          }}
        />
      </MaterialBottomSheet>

      <MaterialBottomSheet
        visible={activeModal === "location"}
        onClose={() => setActiveModal(null)}
        title="Select Location"
      >
        <SearchList
          data={locations}
          selectedValues={formData.jobLocation}
          onSelect={(location) => {
            updateFormField("jobLocation", location);
            setActiveModal(null);
          }}
        />
      </MaterialBottomSheet>

      <MaterialBottomSheet
        visible={activeModal === "employment"}
        onClose={() => setActiveModal(null)}
        title="Select Employment Type"
      >
        <OptionList
          options={employmentTypes.map((t) => t.title)}
          selectedValue={formData.employmentType}
          onSelect={(type) => {
            updateFormField("employmentType", type);
            setActiveModal(null);
          }}
        />
      </MaterialBottomSheet>

      <MaterialBottomSheet
        visible={activeModal === "skills"}
        onClose={() => setActiveModal(null)}
        title="Select Skills"
      >
        {formData.sector ? (
          <SearchList
            data={sectorData.skills}
            selectedValues={formData.skills}
            onSelect={handleSkillToggle}
            multiSelect={true}
            onSave={() => setActiveModal(null)}
          />
        ) : (
          renderEmptyState("skills")
        )}
      </MaterialBottomSheet>

      <TextInputModal
        visible={activeModal === "requirements"}
        onClose={() => setActiveModal(null)}
        title="Job Requirements"
        value={formData.requirements.join("\n")}
        onSave={saveRequirements}
        multiline={true}
      />

      <TextInputModal
        visible={activeModal === "experience"}
        onClose={() => setActiveModal(null)}
        title="Years of Experience"
        value={formData.yearsExperience}
        onSave={(val) => updateFormField("yearsExperience", val)}
        keyboardType="numeric"
      />

      <TextInputModal
        visible={activeModal === "description"}
        onClose={() => setActiveModal(null)}
        title="Job Description"
        value={formData.description}
        onSave={(val) => updateFormField("description", val)}
        multiline={true}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  appBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 16,
    elevation: 0,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outline,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: COLORS.onSurface,
  },
  appBarTitle: {
    fontSize: 20,
    fontWeight: "500",
    color: COLORS.onSurface,
  },
  postButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  postButtonDisabled: {
    opacity: 0.6,
  },
  postButtonText: {
    color: "#FFFFFF",
    fontWeight: "500",
    fontSize: 14,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.onSurface,
    marginBottom: 16,
  },
  formField: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outline,
  },
  formFieldContent: {
    flex: 1,
  },
  formFieldLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.onSurface,
    marginBottom: 8,
  },
  formFieldValueContainer: {
    flex: 1,
  },
  formFieldValue: {
    fontSize: 16,
    color: COLORS.onSurface,
  },
  formFieldPlaceholder: {
    fontSize: 16,
    color: COLORS.onSurfaceVariant,
  },
  formFieldError: {
    color: COLORS.error,
  },
  formFieldArrow: {
    width: 20,
    height: 20,
    tintColor: COLORS.onSurfaceVariant,
    marginLeft: 16,
  },
  requiredStar: {
    color: COLORS.error,
    paddingLeft: 4,
  },
  errorMessage: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.32)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "80%",
  },
  modalHandleContainer: {
    alignItems: "center",
    paddingTop: 12,
  },
  modalHandle: {
    width: 32,
    height: 4,
    backgroundColor: COLORS.onSurfaceDisabled,
    borderRadius: 2,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  modalCloseButton: {
    padding: 8,
    position: "absolute",
    left: 8,
    top: 8,
  },
  modalCloseIcon: {
    width: 24,
    height: 24,
    tintColor: COLORS.onSurface,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.onSurface,
  },
  modalHeaderSpacer: {
    width: 40,
  },
  modalContent: {
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  listItemSelected: {
    backgroundColor: COLORS.primaryContainer,
  },
  listItemText: {
    fontSize: 16,
    color: COLORS.onSurface,
  },
  selectedCheckmark: {
    backgroundColor: COLORS.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkIcon: {
    width: 16,
    height: 16,
    tintColor: "#FFFFFF",
  },
  optionList: {
    maxHeight: 400,
  },
  searchListContainer: {
    padding: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceVariant,
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: COLORS.onSurfaceVariant,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.onSurface,
    paddingVertical: 8,
  },
  clearSearchIcon: {
    width: 20,
    height: 20,
    tintColor: COLORS.onSurfaceVariant,
  },
  chipContainer: {
    marginBottom: 16,
  },
  chipContentContainer: {
    paddingVertical: 4,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primaryContainer,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  chipText: {
    fontSize: 14,
    color: COLORS.onPrimaryContainer,
    marginRight: 4,
  },
  chipRemove: {
    padding: 2,
  },
  chipRemoveIcon: {
    width: 16,
    height: 16,
    tintColor: COLORS.onPrimaryContainer,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 16,
    marginHorizontal: 16,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  inputModalContainer: {
    padding: 16,
  },
  modalTextInput: {
    backgroundColor: COLORS.surfaceVariant,
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    color: COLORS.onSurface,
  },
  modalTextInputMultiline: {
    height: 150,
    textAlignVertical: "top",
  },
  emptyState: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
    marginBottom: 16,
  },
  emptyStateButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  emptyStateButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default JobPost;
