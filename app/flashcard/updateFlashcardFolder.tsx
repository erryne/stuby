import GreenButton from "@/components/GreenButton";
import { Feather } from "@expo/vector-icons";
import ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useEffect, useState } from "react";
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
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

const { width, height } = Dimensions.get("window");

const UpdateFlashcardFolder = () => {
  const {
    id,
    title: initialTitle,
    coverPhoto: initialPhoto,
  } = useLocalSearchParams<{
    id: string;
    title?: string;
    coverPhoto?: string;
  }>();

  const [title, setTitle] = useState("");
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialTitle) setTitle(initialTitle);
    if (initialPhoto) setCoverPhoto(initialPhoto);
  }, [id]);

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

  const handleUpdate = async () => {
    if (!id) {
      Alert.alert("Error", "Flashcard deck ID not found.");
      return;
    }
    if (!title.trim()) {
      Alert.alert("Validation", "Please enter a flashcard title.");
      return;
    }

    setLoading(true);
    try {
      const docRef = doc(db, "flashcardFolders", id);
      await updateDoc(docRef, {
        title: title.trim(),
        coverPhoto: coverPhoto ?? "",
        updatedAt: new Date().toISOString(),
      });
      router.back();
    } catch (error) {
      console.error("Update Error:", error);
      Alert.alert("Error", "Failed to update deck. Please try again.");
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
        style={styles.keyboardContainer}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={28} color="#ffffff" />
          </TouchableOpacity>
          <TitleHeader image={require("../../assets/images/flashcardUpdateDeck.png")} />
        </View>

        {/* COVER PHOTO */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={pickImage}
          disabled={loading}
          style={styles.coverPhotoContainer}
        >
          {coverPhoto ? (
            <Image source={{ uri: coverPhoto }} resizeMode="cover" style={styles.coverPhoto} />
          ) : (
            <>
              <View style={styles.plusIconCircle}>
                <Feather name="plus" size={24} color="#555" />
              </View>
              <Text style={styles.addPhotoText}>Add Cover Photo</Text>
            </>
          )}
        </TouchableOpacity>

        {/* TITLE LABEL */}
        <Text style={styles.label}>Flashcard Deck Title</Text>

        {/* INPUT */}
        <View style={styles.inputWrapper}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            editable={!loading}
            style={styles.textInput}
          />
        </View>

        {/* UPDATE BUTTON / LOADING */}
        <View style={styles.footer}>
          {loading ? (
            <ActivityIndicator color="#FDE6B1" size="large" />
          ) : (
            <GreenButton
              title="Save"
              onPress={handleUpdate}
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

export default UpdateFlashcardFolder;

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  keyboardContainer: {
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
  coverPhotoContainer: {
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
  coverPhoto: {
    width: "100%",
    height: "100%",
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
  footer: {
    marginTop: height * 0.03,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
});