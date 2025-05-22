import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Image,
  Pressable,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  ActivityIndicator,
  Alert,
  Dimensions,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Modal from "react-native-modal";
import axios from "axios";
import { debounce } from "lodash";
import config from "../../../context/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import sectorData from "../../../context/Jobs.json";

// Color palette
const COLORS = {
  darkBlue: "#021024",
  navyBlue: "#052659",
  mediumBlue: "#5483B3",
  lightBlue: "#7DA0C4",
  veryLightBlue: "#C1E8FF",
  white: "#FFFFFF",
  lightGray: "#F5F7FA",
  mediumGray: "#E0E5ED",
  darkGray: "#6B7280",
  green: "#4CAF50",
  red: "#FF5252",
  shadow: "rgba(2, 16, 36, 0.08)",
};

// Job Card Component
const JobCard = React.memo(({ jobData, onApply }) => {
  // Get role-specific and workplace tags
  const jobTypeTag = jobData.jobType || null;
  const workplaceTag = jobData.workPlaceType || null;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => onApply(jobData)}
    >
      <View style={styles.cardHeader}>
        <Image
          source={{ uri: jobData?.logo }}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.titleContainer}>
          <Text style={styles.jobTitle} numberOfLines={1}>
            {jobData.degName || "Role"}
          </Text>
          <Text style={styles.companyLocation} numberOfLines={1}>
            {jobData.organizationName || "Unknown Company"} •{" "}
            {jobData.jobLocation || "Unknown Location"}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.tagsContainer}>
          {jobTypeTag && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{jobTypeTag}</Text>
            </View>
          )}
          {workplaceTag && (
            <View style={[styles.tag, styles.tagWorkplace]}>
              <Text style={styles.tagText}>{workplaceTag}</Text>
            </View>
          )}
        </View>

        <View style={styles.applyButtonContainer}>
          <Text style={styles.applyText}>Apply Now</Text>
          <Image
            source={require("../../../assets/icons/arrow-right.png")}
            style={styles.arrowIcon}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
});

// Empty State Component
const EmptyJobsView = React.memo(({ searchTerm }) => (
  <View style={styles.emptyContainer}>
    <Image
      source={require("../../../assets/icons/Search.png")}
      style={styles.emptyIcon}
    />
    <Text style={styles.noJobsText}>No jobs found</Text>
    <Text style={styles.noJobsSubText}>
      {searchTerm
        ? `No jobs matching "${searchTerm}" were found`
        : "Try adjusting your search or filters"}
    </Text>
  </View>
));

// Search Dropdown Component
const SearchDropdown = React.memo(({ results, loading, onSelectItem }) => {
  if (loading) {
    return (
      <ActivityIndicator
        style={styles.loadingIndicator}
        size="small"
        color={COLORS.navyBlue}
      />
    );
  }

  if (results.length === 0) {
    return null;
  }

  return (
    <FlatList
      data={results}
      keyExtractor={(item, index) =>
        item.id ? item.id.toString() : index.toString()
      }
      renderItem={({ item }) => (
        <Pressable
          onPress={() => onSelectItem(item)}
          style={styles.dropdownItem}
          android_ripple={{ color: COLORS.mediumGray }}
        >
          <View style={styles.dropdownItemContent}>
            <Text style={styles.dropdownItemText} numberOfLines={1}>
              {item.name || "Unknown"}
            </Text>
            <Text
              style={[
                styles.dropdownItemType,
                {
                  color:
                    item.type === "degName"
                      ? COLORS.navyBlue
                      : COLORS.mediumBlue,
                },
              ]}
            >
              {item.type === "degName" ? "Role" : "Skill"}
              {item.sector ? ` • ${item.sector}` : ""}
            </Text>
          </View>
        </Pressable>
      )}
      style={styles.dropdown}
      nestedScrollEnabled
      keyboardShouldPersistTaps="handled"
    />
  );
});

// Filter Button Component
const FilterButton = React.memo(({ text, value, onPress, isActive }) => (
  <TouchableOpacity
    style={[styles.filterButton, isActive ? styles.activeFilterButton : {}]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text
      style={[
        styles.filterButtonText,
        isActive ? styles.activeFilterButtonText : {},
      ]}
      numberOfLines={1}
    >
      {value ? value : text}
    </Text>
    {isActive && <View style={styles.filterActiveDot} />}
  </TouchableOpacity>
));

// Main Job Search Screen
const JobSearchScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  // State variables
  const [jobTypeModalVisible, setJobTypeModalVisible] = useState(false);
  const [workplaceModalVisible, setWorkplaceModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedWorkplace, setSelectedWorkplace] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [locationText, setLocationText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [selected, setSelected] = useState(null);
  const [jobs, setJobs] = useState([]);

  const jobTypes = ["Full-time", "Part-time", "Contract", "Internship"];
  const workplaceTypes = ["Remote", "On-site", "Hybrid"];

  // Search local data function
  const searchLocalData = useCallback((query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const lowerCaseQuery = query.toLowerCase();
    const designations = [];
    const skills = [];

    // Search through all sectors
    sectorData.sec.forEach((sector) => {
      // Search designations
      sector.designations.forEach((designation) => {
        if (designation.toLowerCase().includes(lowerCaseQuery)) {
          designations.push({
            type: "degName",
            name: designation,
            sector: sector.sector,
          });
        }
      });

      // Search skills
      sector.skills.forEach((skill) => {
        if (skill.toLowerCase().includes(lowerCaseQuery)) {
          skills.push({
            type: "skills",
            name: skill,
            sector: sector.sector,
          });
        }
      });
    });

    // Combine and limit results
    const combinedResults = [...designations, ...skills].slice(0, 10);
    setSearchResults(combinedResults);
    setLoading(false);
  }, []);

  // Debounced search function
  const debouncedSearch = useMemo(
    () =>
      debounce(async (query) => {
        if (!query.trim()) {
          setSearchResults([]);
          return;
        }

        setLoading(true);

        // First try to search locally in the JSON data
        searchLocalData(query);

        // Then try to search via API
        try {
          const response = await axios.get(
            `${config.apiUrl}/sectorDetails/search`,
            { params: { query } }
          );

          if (response.data && response.data.data) {
            const { designations = [], skills = [] } = response.data.data;

            const formattedResults = [
              ...designations.map((item) => ({
                type: "degName",
                name: item.degName || item,
                sector: item.secName || "",
              })),
              ...skills.map((item) => ({
                type: "skills",
                name: item.skillName || item,
                sector: item.secName || "",
              })),
            ];

            // If we got results from the API, use them
            if (formattedResults.length > 0) {
              setSearchResults(formattedResults);
            }
          }
        } catch (error) {
          // If API fails, continue with local results
          console.log("Search API error:", error);
        } finally {
          setLoading(false);
        }
      }, 300),
    [searchLocalData]
  );

  // Clear search function
  const handleClearSearch = useCallback(() => {
    setSearchText("");
    setSelected(null);
    setSearchResults([]);
  }, []);

  // Select search result item
  const handleSelectItem = useCallback((item) => {
    setSearchText(item.name || "");
    setSelected(item);
    setSearchResults([]);
  }, []);

  // Function to fetch jobs with proper filtering
  const fetchJobs = useCallback(async () => {
    setLoadingJobs(true);
    try {
      let params = {};

      // Add search term filter
      if (selected && selected.name) {
        const key = selected.type === "skills" ? "skills" : "degName";
        params[key] = selected.name;
      }

      // Add location filter
      if (locationText) {
        params.jobLocation = locationText;
      }

      // Add job type filter
      if (selectedType) {
        params.jobType = selectedType;
      }

      // Add workplace filter
      if (selectedWorkplace) {
        params.workPlaceType = selectedWorkplace;
      }

      try {
        const response = await axios.get(`${config.apiUrl}/postedjob/getAll`, {
          params,
        });

        if (!response.data || !response.data.data) {
          console.log("Unexpected API response format:", response.data);
          setJobs([]);
          return;
        }

        const transformedData = response.data.data.map((job) => ({
          jobId: job.jobId,
          compId: job.organization?.compId || "",
          jobRole: job.jobRole || "Untitled Job",
          jobLocation: job.jobLocation || "Unknown Location",
          salary: job.salary || "Not Disclosed",
          tags: [
            ...(job.jobType ? [job.jobType] : []),
            ...(Array.isArray(job.workPlaceType)
              ? job.workPlaceType
              : job.workPlaceType
              ? [job.workPlaceType]
              : []),
          ],
          logo: job.organization?.logo
            ? `${config.apiUrl}/photo/${job.organization.logo}`
            : "https://via.placeholder.com/150",
          degName: job.degName || "Unknown Name",
          secName: job.secName || "Unknown Sector",
          skills: job.skills || [],
          jobDescription: job.jobDescription || "Unknown Job Description",
          yearsOfExperience: job.yearsOfExperience || "Not specified",
          requirements: job.requirements || [],
          jobType: job.jobType || "Unknown Job Type",
          workPlaceType: job.workPlaceType || "",
          organizationName:
            job.organization?.organizationName || "Unknown Company",
          headOffice: job.organization?.address || "",
          email: job.organization?.email || "",
          phoneNo: job.organization?.phoneNo || "",
          website: job.organization?.website || "",
          about: job.organization?.description || "",
          industry: job.organization?.industry || "",
          since: job.organization?.since || "",
          specialization: job.organization?.specialization || "",
        }));

        setJobs(transformedData);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.log(
            `Error fetching jobs (${error.response?.status}):`,
            error.response?.data?.message || error.message
          );

          if (error.response?.status === 404) {
            // No jobs found is a valid state
            setJobs([]);
          } else {
            Alert.alert(
              "Connection Error",
              "Could not connect to the job service. Please check your connection and try again."
            );
          }
        } else {
          console.log("Unknown error fetching jobs:", error);
          Alert.alert(
            "Error",
            "An unexpected error occurred. Please try again."
          );
        }
        setJobs([]);
      }
    } catch (error) {
      console.log("Error in fetchJobs:", error);
      setJobs([]);
    } finally {
      setLoadingJobs(false);
    }
  }, [selected, selectedType, selectedWorkplace, locationText]);

  // Effect to update search results when search text changes
  useEffect(() => {
    debouncedSearch(searchText);
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchText, debouncedSearch]);

  // Effect to fetch jobs when filters change
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Handle job apply action
  const handleApplyJob = useCallback(
    (jobData) => {
      navigation.navigate("ApplyScreen", { jobData });
    },
    [navigation]
  );

  // Select job type function
  const handleSelectJobType = useCallback(
    (type) => {
      setSelectedType(type === selectedType ? null : type);
      setJobTypeModalVisible(false);
      // Delay fetching jobs slightly to ensure modal animation completes smoothly
      setTimeout(() => fetchJobs(), 300);
    },
    [selectedType, fetchJobs]
  );

  // Select workplace type function
  const handleSelectWorkplace = useCallback(
    (workplace) => {
      setSelectedWorkplace(workplace === selectedWorkplace ? null : workplace);
      setWorkplaceModalVisible(false);
      // Delay fetching jobs slightly to ensure modal animation completes smoothly
      setTimeout(() => fetchJobs(), 300);
    },
    [selectedWorkplace, fetchJobs]
  );

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setSelectedType(null);
    setSelectedWorkplace(null);
    setTimeout(() => fetchJobs(), 300);
  }, [fetchJobs]);

  // Job Types Modal
  const renderJobTypesModal = () => (
    <Modal
      isVisible={jobTypeModalVisible}
      onBackdropPress={() => setJobTypeModalVisible(false)}
      onSwipeComplete={() => setJobTypeModalVisible(false)}
      swipeDirection={["down"]}
      style={styles.modal}
      backdropOpacity={0.5}
      animationInTiming={300}
      animationOutTiming={300}
    >
      <View style={styles.modalContent}>
        <View style={styles.swipeIndicator} />
        <Text style={styles.modalTitle}>Job Type</Text>

        <ScrollView
          style={styles.optionsContainer}
          showsVerticalScrollIndicator={false}
        >
          {jobTypes.map((type, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                selectedType === type ? styles.selectedOption : {},
              ]}
              onPress={() => handleSelectJobType(type)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedType === type ? styles.selectedOptionText : {},
                ]}
              >
                {type}
              </Text>
              {selectedType === type && (
                <View style={styles.checkmarkCircle}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.modalButtonsContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setJobTypeModalVisible(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          {selectedType && (
            <TouchableOpacity
              style={styles.clearFilterButton}
              onPress={() => {
                setSelectedType(null);
                setJobTypeModalVisible(false);
                setTimeout(() => fetchJobs(), 300);
              }}
            >
              <Text style={styles.clearFilterText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );

  // Workplace Types Modal
  const renderWorkplaceModal = () => (
    <Modal
      isVisible={workplaceModalVisible}
      onBackdropPress={() => setWorkplaceModalVisible(false)}
      onSwipeComplete={() => setWorkplaceModalVisible(false)}
      swipeDirection={["down"]}
      style={styles.modal}
      backdropOpacity={0.5}
      animationInTiming={300}
      animationOutTiming={300}
    >
      <View style={styles.modalContent}>
        <View style={styles.swipeIndicator} />
        <Text style={styles.modalTitle}>Workplace Type</Text>

        <ScrollView
          style={styles.optionsContainer}
          showsVerticalScrollIndicator={false}
        >
          {workplaceTypes.map((workplace, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                selectedWorkplace === workplace ? styles.selectedOption : {},
              ]}
              onPress={() => handleSelectWorkplace(workplace)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedWorkplace === workplace
                    ? styles.selectedOptionText
                    : {},
                ]}
              >
                {workplace}
              </Text>
              {selectedWorkplace === workplace && (
                <View style={styles.checkmarkCircle}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.modalButtonsContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setWorkplaceModalVisible(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          {selectedWorkplace && (
            <TouchableOpacity
              style={styles.clearFilterButton}
              onPress={() => {
                setSelectedWorkplace(null);
                setWorkplaceModalVisible(false);
                setTimeout(() => fetchJobs(), 300);
              }}
            >
              <Text style={styles.clearFilterText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[
        styles.container,
        { paddingTop: insets.top > 0 ? insets.top : 20 },
      ]}
    >
      <StatusBar backgroundColor={COLORS.navyBlue} barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Image
            source={require("../../../assets/icons/backIcon.png")}
            style={styles.backIcon}
          />
        </Pressable>
        <Text style={styles.headerTitle}>Find Jobs</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* Search Area */}
      <View style={styles.searchSection}>
        {/* Search input */}
        <View style={styles.searchContainer}>
          <Image
            source={require("../../../assets/icons/Search.png")}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search job roles, skills..."
            placeholderTextColor={COLORS.darkGray}
          />
          {searchText !== "" && (
            <Pressable
              onPress={handleClearSearch}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Image
                source={require("../../../assets/icons/close.png")}
                style={styles.clearIcon}
              />
            </Pressable>
          )}
        </View>

        {/* Search results dropdown */}
        {searchText.length > 0 && (
          <View style={styles.dropdownContainer}>
            <SearchDropdown
              results={searchResults}
              loading={loading}
              onSelectItem={handleSelectItem}
            />
          </View>
        )}
      </View>

      {/* Filters Section */}
      <View style={styles.filtersSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScrollContainer}
        >
          <FilterButton
            text="Job Type"
            value={selectedType}
            onPress={() => setJobTypeModalVisible(true)}
            isActive={!!selectedType}
          />
          <FilterButton
            text="Workplace"
            value={selectedWorkplace}
            onPress={() => setWorkplaceModalVisible(true)}
            isActive={!!selectedWorkplace}
          />

          {/* Show Clear All button if any filter is active */}
          {(selectedType || selectedWorkplace) && (
            <TouchableOpacity
              style={styles.clearAllButton}
              onPress={handleClearFilters}
              activeOpacity={0.7}
            >
              <Text style={styles.clearAllText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {/* Jobs List */}
      {loadingJobs ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.navyBlue} />
          <Text style={styles.loadingText}>Finding jobs for you...</Text>
        </View>
      ) : (
        <FlatList
          data={jobs}
          renderItem={({ item }) => (
            <JobCard jobData={item} onApply={handleApplyJob} />
          )}
          keyExtractor={(item) => item.jobId}
          contentContainerStyle={styles.jobsList}
          showsVerticalScrollIndicator={false}
          initialNumToRender={5}
          maxToRenderPerBatch={10}
          windowSize={10}
          removeClippedSubviews={true}
          ListEmptyComponent={
            <EmptyJobsView searchTerm={selected?.name || null} />
          }
        />
      )}

      {/* Job Type Modal */}
      {renderJobTypesModal()}

      {/* Workplace Modal */}
      {renderWorkplaceModal()}
    </KeyboardAvoidingView>
  );
};

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.navyBlue,
  },
  backButton: {
    padding: 4,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: COLORS.white,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.white,
  },
  searchSection: {
    backgroundColor: COLORS.navyBlue,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: COLORS.darkBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 10, // Ensure it's above filters when dropdown is visible
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 10,
    paddingHorizontal: 16,
    height: 54,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
    tintColor: COLORS.mediumBlue,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.darkBlue,
    height: 50,
    paddingVertical: 10,
  },
  clearIcon: {
    width: 20,
    height: 20,
    tintColor: COLORS.darkGray,
  },
  dropdownContainer: {
    position: "absolute",
    top: 120, // Positioned below both search inputs
    left: 20,
    right: 20,
    zIndex: 20,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 6,
    shadowColor: COLORS.darkBlue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  dropdown: {
    maxHeight: 250,
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.mediumGray,
  },
  dropdownItemContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownItemText: {
    fontSize: 16,
    color: COLORS.darkBlue,
    flex: 1,
  },
  dropdownItemType: {
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 8,
  },
  loadingIndicator: {
    padding: 16,
    alignSelf: "center",
  },
  filtersSection: {
    backgroundColor: COLORS.white,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.mediumGray,
    elevation: 1,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    zIndex: 5,
  },
  filtersScrollContainer: {
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  filterButton: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 100,
    justifyContent: "center",
  },
  activeFilterButton: {
    backgroundColor: COLORS.veryLightBlue,
    borderColor: COLORS.navyBlue,
  },
  filterButtonText: {
    fontSize: 14,
    color: COLORS.darkGray,
    fontWeight: "500",
    textAlign: "center",
  },
  activeFilterButtonText: {
    color: COLORS.navyBlue,
    fontWeight: "600",
  },
  filterActiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.navyBlue,
    position: "absolute",
    top: 5,
    right: 5,
  },
  clearAllButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.darkBlue,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  clearAllText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  jobsList: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.darkBlue,
    fontWeight: "500",
  },
  // Job Card Styles
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.lightGray,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
    overflow: "hidden",
  },
  titleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.darkBlue,
    marginBottom: 6,
  },
  companyLocation: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tagsContainer: {
    flexDirection: "row",
    flex: 1,
    flexWrap: "wrap", // Allow tags to wrap if needed
  },
  tag: {
    backgroundColor: COLORS.veryLightBlue,
    borderRadius: 50,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: COLORS.lightBlue,
  },
  tagWorkplace: {
    backgroundColor: "#F0F8FF", // Slightly different shade for workplace tag
    borderColor: COLORS.mediumBlue,
  },
  tagText: {
    fontSize: 13,
    color: COLORS.navyBlue,
    fontWeight: "500",
  },
  applyButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  applyText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.mediumBlue,
    marginRight: 4,
  },
  arrowIcon: {
    width: 14,
    height: 14,
    tintColor: COLORS.mediumBlue,
  },
  // Empty state styles
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    marginTop: 40,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    opacity: 0.6,
    marginBottom: 20,
    tintColor: COLORS.mediumBlue,
  },
  noJobsText: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.darkBlue,
    marginBottom: 8,
    textAlign: "center",
  },
  noJobsSubText: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: "center",
    lineHeight: 22,
  },
  // Modal styles
  modal: {
    margin: 0,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: height * 0.6,
  },
  swipeIndicator: {
    width: 40,
    height: 5,
    backgroundColor: COLORS.mediumGray,
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.darkBlue,
    marginBottom: 20,
  },
  optionsContainer: {
    marginBottom: 20,
    maxHeight: 300,
  },
  optionButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
  },
  selectedOption: {
    borderColor: COLORS.mediumBlue,
    backgroundColor: COLORS.veryLightBlue,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.darkBlue,
    fontWeight: "500",
  },
  selectedOptionText: {
    fontWeight: "600",
    color: COLORS.navyBlue,
  },
  checkmarkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.navyBlue,
    justifyContent: "center",
    alignItems: "center",
  },
  checkmarkText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "bold",
  },
  modalButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginRight: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.darkGray,
  },
  clearFilterButton: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  clearFilterText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.navyBlue,
  },
});

export default JobSearchScreen;
