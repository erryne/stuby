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
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Firebase Imports
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

const { width, height } = Dimensions.get("window");

const UpdateFlashcardFolder = () => {
  // Retrieve params from the URL
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

  // Initialize state with existing data
  useEffect(() => {
    if (initialTitle) setTitle(initialTitle);
    if (initialPhoto) setCoverPhoto(initialPhoto);
  }, [id]);

  // 🎨 PICK IMAGE
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        "Permission required to access photos.",
      );
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

  // ✅ UPDATE DATABASE
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
      // Reference to the specific document in Firestore
      const docRef = doc(db, "flashcardFolders", id);

      // Perform the update
      await updateDoc(docRef, {
        title: title.trim(),
        coverPhoto: coverPhoto ?? "",
        updatedAt: new Date().toISOString(), // Optional: track modification time
      });

      // Go back to the previous screen (it will auto-update via onSnapshot)
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
      className="flex-1"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
        style={{ paddingHorizontal: width * 0.06 }}
      >
        {/* HEADER */}
        <View className="flex-row items-center mt-12 justify-center mb-12 relative">
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute left-0 p-2"
          >
            <ChevronLeft size={28} color="#ffffff" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-[#FDE6B1]">
            Update Flashcard Deck
          </Text>
        </View>

        {/* COVER PHOTO */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={pickImage}
          disabled={loading}
          style={{
            height: height * 0.24,
            marginBottom: height * 0.04,
          }}
          className="w-full rounded-2xl bg-gray-800/40 overflow-hidden items-center justify-center border-2 border-dashed border-gray-400"
        >
          {coverPhoto ? (
            <Image
              source={{ uri: coverPhoto }}
              resizeMode="cover"
              className="w-full h-full"
            />
          ) : (
            <>
              <View className="w-12 h-12 rounded-full bg-gray-300 items-center justify-center">
                <Feather name="plus" size={24} color="#555" />
              </View>
              <Text className="mt-3 font-semibold text-white">
                Add Cover Photo
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* TITLE LABEL */}
        <Text
          style={{ marginBottom: height * 0.01 }}
          className="text-base font-semibold text-white"
        >
          Flashcard Deck Title
        </Text>

        {/* INPUT */}
        <View
          style={{
            height: height * 0.06,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.3,
            shadowRadius: 10,
          }}
          className="bg-white rounded-full border-2 border-black px-4 justify-center"
        >
          <TextInput
            value={title}
            onChangeText={setTitle}
            editable={!loading}
            className="font-bold text-black text-lg"
          />
        </View>

        {/* UPDATE BUTTON / LOADING */}
        <View
          style={{ marginTop: height * 0.03 }}
          className="flex-row justify-end"
        >
          {loading ? (
            <ActivityIndicator color="#FDE6B1" size="large" />
          ) : (
            <GreenButton
              title="Update"
              onPress={handleUpdate}
              widthPercent={0.3}
              heightPercent={0.06}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

export default UpdateFlashcardFolder;
