import GreenButton from "@/components/GreenButton";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";

// Firebase Imports
import TitleHeader from "@/components/TitleHeader";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";

const { width, height } = Dimensions.get("window");

const CreateFlashcardFolder = () => {
  const [title, setTitle] = useState("");
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission Required", "Permission required to access photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
    });

    if (!result.canceled) {
      setCoverPhoto(result.assets[0].uri);
    }
  };

  const handleCreate = async () => {
    const user = auth.currentUser;

    if (!title.trim()) {
      Alert.alert("Missing Title", "Please enter a flashcard title.");
      return;
    }

    if (!user) {
      Alert.alert("Error", "You must be logged in to create a deck.");
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, "flashcardFolders"), {
        userId: user.uid,
        title: title.trim(),
        coverPhoto: coverPhoto,
        createdAt: serverTimestamp(),
      });
      router.back();
    } catch (error) {
      console.error("Error adding document: ", error);
      Alert.alert("Upload Failed", "Could not save the deck. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/images/flashcardBg.png")}
      resizeMode="cover"
      style={styles.backgroundImage}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>

      
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={28} color="#ffffff" />
          </TouchableOpacity>
          <TitleHeader image={require("../../assets/images/flashcardCreateDeck.png")} />
        </View>

        {/* ADD COVER PHOTO */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={pickImage}
          disabled={loading}
          style={styles.coverPhotoPicker}
        >
          {coverPhoto ? (
            <Image source={{ uri: coverPhoto }} resizeMode="cover" style={styles.fullImage} />
          ) : (
            <View style={styles.placeholderContent}>
              <View style={styles.plusIconCircle}>
                <Feather name="plus" size={24} color="#555" />
              </View>
              <Text style={styles.addPhotoText}>Add Cover Photo</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* FLASHCARD TITLE */}
        <Text style={styles.label}>Flashcard Deck Title</Text>

        {/* TEXT INPUT */}
        <View style={styles.inputWrapper}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Organic Chemistry"
            placeholderTextColor="#999"
            style={styles.textInput}
            editable={!loading}
          />
        </View>

        {/* CREATE BUTTON */}
        <View style={styles.buttonContainer}>
          {loading ? (
            <ActivityIndicator color="#FDE6B1" size="large" />
          ) : (
            <GreenButton
              title="Create"
              onPress={handleCreate}
              widthPercent={0.3}
              heightPercent={0.06}
            />
          )}
        </View>
      </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </ImageBackground>
  );
};

export default CreateFlashcardFolder;

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: width * 0.06,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "5%", 
    marginBottom: 40,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 0,
    padding: 8,
  },
  coverPhotoPicker: {
    width: "100%",
    height: height * 0.24,
    marginBottom: height * 0.04,
    borderRadius: 16,
    backgroundColor: "rgba(31, 41, 55, 0.4)",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#9ca3af",
  },
  fullImage: {
    width: "100%",
    height: "100%",
  },
  placeholderContent: {
    alignItems: "center",
  },
  plusIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
  },
  addPhotoText: {
    marginTop: 12,
    fontWeight: "600",
    color: "white",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginBottom: height * 0.01,
  },
  inputWrapper: {
    height: height * 0.06,
    backgroundColor: "white",
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "black",
    paddingHorizontal: 16,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  textInput: {
    fontWeight: "bold",
    color: "black",
    fontSize: 18,
  },
  buttonContainer: {
    marginTop: height * 0.03,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
});