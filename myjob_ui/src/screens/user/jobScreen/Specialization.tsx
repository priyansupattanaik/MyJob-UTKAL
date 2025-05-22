import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  TextInput,
  StyleSheet,
  Image,
  Pressable,
  Text,
  FlatList,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import TabBar from '../../../component/TabBar';


const specializations = [
  { id: '1', title: 'Design', jobs: 140, icon: require('../../../assets/icons/Group1.png') },
  { id: '2', title: 'Finance', jobs: 250, icon: require('../../../assets/icons/Group2.png') },
  { id: '3', title: 'Education', jobs: 120, icon: require('../../../assets/icons/Group3.png') },
  { id: '4', title: 'Restaurant', jobs: 85, icon: require('../../../assets/icons/Group4.png') },
  { id: '5', title: 'Health', jobs: 235, icon: require('../../../assets/icons/Group5.png') },
  { id: '6', title: 'Programmer', jobs: 412, icon: require('../../../assets/icons/Group6.png') },
];

const Specialization = () => {
  const navigation = useNavigation();
  const [isPressed, setIsPressed] = useState(false);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const renderSpecialization = ({ item }: any) => {
    const isSelected = selectedCard === item.id;

    return (
      <Pressable
        style={[styles.card, isSelected && styles.cardSelected]}
        onPress={() => setSelectedCard(isSelected ? null : item.id)}
      >
        <View
          style={[styles.overlay, isSelected && styles.overlaySelected]}
        />
        <Image source={item.icon} style={styles.cardImage} />
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardJobs}>{item.jobs} Jobs</Text>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.header}>
          <Pressable onPress={() => navigation.navigate('JobSearchScreen')}>
            <Image
              source={require('../../../assets/icons/blackBack.png')}
              style={styles.backImage}
            />
          </Pressable>
        </View>
        <View style={styles.mainContainer}>
          <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="   Search"
                placeholderTextColor="#ccc"
                style={styles.textInput}
              />
              <Image
                source={require('../../../assets/icons/search_12192414.png')}
                style={styles.icon}
              />
            </View>
            <Pressable
              onPressIn={() => setIsPressed(true)}
              onPressOut={() => setIsPressed(false)}
              style={[
                styles.settingsButton,
                isPressed && styles.settingsButtonActive,
              ]}
              onPress={() => navigation.navigate('Filter')}
            >
              <Image
                source={require('../../../assets/icons/settings_425734.png')}
                style={styles.iconImage}
              />
            </Pressable>
          </View>
          <Text style={styles.headingtext}>Specialization</Text>
          <FlatList
            data={specializations}
            renderItem={renderSpecialization}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.listRow}
            contentContainerStyle={styles.listContainer}
          />
        </View>
      </KeyboardAvoidingView>
  <TabBar navigation={navigation}/>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    height: 50,
    paddingHorizontal: 20,
  },
  backImage: {
    height: 20,
    width: 20,
    marginTop: 20,
  },
  headingtext: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  icon: {
    height: 20,
    width: 20,
    position: 'absolute',
    top: 16,
    left: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 6,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  textInput: {
    fontSize: 16,
    left: 5,
    color: '#333',
  },
  settingsButton: {
    width: 50,
    height: 50,
    backgroundColor:'#1A1150',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  settingsButtonActive: {
    backgroundColor: '#FCA34D',
  },
  iconImage: {
    width: 20,
    height: 20,
    tintColor: '#fff',
    
    padding: 5,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    margin: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardImage: {
    width: 40,
    height: 40,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  cardJobs: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  cardSelected: {
    backgroundColor: '#FCA34D',
  },
  overlaySelected: {
    position: 'absolute',
    padding: 30,
    alignItems: 'center',
    margin: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    backgroundColor: 'white',
    opacity: 0.9,
    borderRadius: 28,
  },
  overlay: {
    position: 'absolute',
    padding: 28,
    alignItems: 'center',
    margin: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    backgroundColor: '#FCA34D',
    opacity: 0.3,
    borderRadius: 28,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  listContainer: {
    paddingVertical: 10,
  },
  listRow: {
    justifyContent: 'space-between',
  },
  navIcon: {
    width: 24,
    height: 24,
  },
  addButtonContainer: {
    marginTop: -30,
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1A1150',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
});

export default Specialization;

