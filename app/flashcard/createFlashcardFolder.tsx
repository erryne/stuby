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
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Firebase Imports
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";

const { width, height } = Dimensions.get("window");

const CreateFlashcardFolder = () => {
  const [title, setTitle] = useState("");
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      quality: 0.7, // Slightly lower quality for faster database uploads
    });

    if (!result.canceled) {
      setCoverPhoto(result.assets[0].uri);
    }
  };

  // ✅ SAVE TO FIRESTORE
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
      // Saving to Firestore
      await addDoc(collection(db, "flashcardFolders"), {
        userId: user.uid,
        title: title.trim(),
        coverPhoto: coverPhoto, // In a production app, you'd upload the file to Firebase Storage first
        createdAt: serverTimestamp(),
      });

      // Navigate back to the list
      router.back();
    } catch (error) {
      console.error("Error adding document: ", error);
      Alert.alert(
        "Upload Failed",
        "Could not save the deck. Please try again.",
      );
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
            Create Flashcard Deck
          </Text>
        </View>

        {/* ADD COVER PHOTO */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={pickImage}
          disabled={loading}
          style={{
            height: height * 0.24,
            marginBottom: height * 0.04,
          }}
          className="w-full rounded-2xl bg-gray-800/50 overflow-hidden items-center justify-center border-2 border-dashed border-gray-400"
        >
          {coverPhoto ? (
            <Image
              source={{ uri: coverPhoto }}
              resizeMode="cover"
              className="w-full h-full"
            />
          ) : (
            <View className="items-center">
              <View className="w-12 h-12 rounded-full bg-[#FDE6B1]/20 items-center justify-center">
                <Feather name="camera" size={24} color="#FDE6B1" />
              </View>
              <Text className="mt-3 font-semibold text-[#FDE6B1]">
                Add Cover Photo
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* FLASHCARD TITLE */}
        <Text
          style={{ marginBottom: height * 0.01 }}
          className="text-base font-semibold text-white"
        >
          Flashcard Deck Title
        </Text>

        {/* TEXT INPUT */}
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
            placeholder="e.g. Organic Chemistry"
            placeholderTextColor="#999"
            className="font-bold text-black text-lg"
            editable={!loading}
          />
        </View>

        {/* CREATE BUTTON */}
        <View
          style={{ marginTop: height * 0.03 }}
          className="flex-row justify-end"
        >
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
    </ImageBackground>
  );
};

export default CreateFlashcardFolder;
