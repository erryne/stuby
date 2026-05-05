import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
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
  View,
} from "react-native";

import GreenButton from "@/components/GreenButton";
import { ChevronLeft } from "lucide-react-native";

// Firebase Imports
import TitleHeader from "@/components/TitleHeader";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebaseConfig";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const CreateMusicFolder = () => {
  const [musicTitle, setMusicTitle] = useState("");
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "We need access to your photos to set a cover.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setCoverPhoto(result.assets[0].uri);
    }
  };

  const handleCreate = async () => {
    if (!musicTitle.trim()) {
      Alert.alert("Required", "Please enter a playlist title.");
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "musicFolders"), {
        musicFolderTitle: musicTitle.trim(),
        musicImage: coverPhoto,
        totalSongs: 0,
        totalStreamingMinutes: "0 min",
        isHearted: false,
        createdAt: serverTimestamp(),
      });
      router.back();
    } catch (error) {
      Alert.alert("Error", "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/images/musicBg.png")}
      resizeMode="cover"
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
       
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={28} color="#ffffff" />
          </TouchableOpacity>
          <TitleHeader image={require("../../assets/images/createMusicFolder.png")} />
        </View>

        {/* IMAGE PICKER BOX */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={pickImage}
          disabled={loading}
          style={styles.imagePicker}
        >
          {coverPhoto ? (
            <Image source={{ uri: coverPhoto }} style={styles.coverImage} />
          ) : (
            <View style={styles.placeholderContainer}>
              <View style={styles.plusIconCircle}>
                <Feather name="plus" size={24} color="#FDE6B1" />
              </View>
              <Text style={styles.addPhotoText}>Add Cover Photo</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* INPUT SECTION */}
        <Text style={styles.label}>Playlist Title</Text>
        <View style={styles.inputContainer}>
          <TextInput
            value={musicTitle}
            onChangeText={setMusicTitle}
            placeholder="Chill Vibes..."
            placeholderTextColor="#999"
            editable={!loading}
            style={styles.textInput}
          />
        </View>

        {/* BUTTON SECTION */}
        <View style={styles.buttonWrapper}>
          {loading ? (
            <ActivityIndicator size="large" color="#FDE6B1" />
          ) : (
            <GreenButton
              title="Create Playlist"
              onPress={handleCreate}
              widthPercent={0.6}
              heightPercent={0.07}
            />
          )}
        </View>
      </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </ImageBackground>
  );
};

export default CreateMusicFolder;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    paddingHorizontal: SCREEN_WIDTH * 0.06,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "5%",
    marginBottom: SCREEN_WIDTH * 0.1,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 0,
    padding: 5,
  },
  headerTitle: {
    fontSize: SCREEN_WIDTH * 0.06,
    fontWeight: "bold",
    color: "#FDE6B1",
  },
  imagePicker: {
    width: "100%",
    height: SCREEN_WIDTH * 0.5,
    borderRadius: 24,
    backgroundColor: "rgba(31, 41, 55, 0.4)", // bg-gray-800/40
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#9ca3af", // border-gray-400
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SCREEN_WIDTH * 0.08,
  },
  coverImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholderContainer: {
    alignItems: "center",
  },
  plusIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  addPhotoText: {
    marginTop: 12,
    fontWeight: "600",
    color: "#FDE6B1",
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginLeft: 8,
    marginBottom: 8,
  },
  inputContainer: {
    height: SCREEN_WIDTH * 0.13,
    backgroundColor: "white",
    borderRadius: 99,
    borderWidth: 2,
    borderColor: "black",
    paddingHorizontal: 20,
    justifyContent: "center",
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  textInput: {
    fontWeight: "bold",
    color: "black",
    fontSize: 18,
  },
  buttonWrapper: {
    marginTop: SCREEN_WIDTH * 0.1,
    alignItems: "center",
  },
  
});