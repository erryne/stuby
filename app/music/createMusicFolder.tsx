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
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import GreenButton from "@/components/GreenButton";
import { ChevronLeft } from "lucide-react-native";

// Firebase Imports
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebaseConfig";

const { width, height } = Dimensions.get("window");

const CreateMusicFolder = () => {
  const [musicTitle, setMusicTitle] = useState("");
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 🎨 PICK IMAGE
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "We need access to your photos to set a cover.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Square for music covers
      quality: 0.7,
    });

    if (!result.canceled) {
      setCoverPhoto(result.assets[0].uri);
    }
  };

  // ✅ CREATE MUSIC FOLDER IN DATABASE
  const handleCreate = async () => {
    if (!musicTitle.trim()) {
      Alert.alert("Required", "Please enter a playlist title.");
      return;
    }

    setLoading(true);

    try {
      // 1. Reference the collection
      const folderCollection = collection(db, "musicFolders");

      // 2. Add document to Firestore
      await addDoc(folderCollection, {
        musicFolderTitle: musicTitle.trim(),
        musicImage: coverPhoto, // Ideally, upload this to Firebase Storage first
        totalSongs: 0,
        totalStreamingMinutes: "0 min",
        isHearted: false,
        createdAt: serverTimestamp(),
      });

      // 3. Success! Go back to the list
      router.back();
    } catch (error) {
      console.error("Error creating folder:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/images/musicBg.png")}
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
            Create Music Folder
          </Text>
        </View>

        {/* ADD COVER PHOTO */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={pickImage}
          disabled={loading}
          style={{ height: height * 0.2, marginBottom: height * 0.04 }}
          className="w-full rounded-3xl bg-gray-800/40 border-2 border-dashed border-gray-400 overflow-hidden items-center justify-center"
        >
          {coverPhoto ? (
            <Image
              source={{ uri: coverPhoto }}
              resizeMode="cover"
              className="w-full h-full"
            />
          ) : (
            <>
              <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center">
                <Feather name="plus" size={24} color="#FDE6B1" />
              </View>
              <Text className="mt-3 font-semibold text-[#FDE6B1]">
                Add Cover Photo
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* MUSIC TITLE LABEL */}
        <Text
          style={{ marginBottom: height * 0.01 }}
          className="text-base font-semibold text-white ml-2"
        >
          Playlist Title
        </Text>

        {/* TEXT INPUT */}
        <View
          style={{
            height: height * 0.06,
            elevation: 5,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.3,
            shadowRadius: 10,
          }}
          className="bg-white rounded-full border-2 border-black px-5 justify-center"
        >
          <TextInput
            value={musicTitle}
            onChangeText={setMusicTitle}
            placeholder="Chill Vibes..."
            placeholderTextColor="#999"
            editable={!loading}
            className="font-bold text-black text-lg"
          />
        </View>

        {/* CREATE BUTTON */}
        <View
          style={{ marginTop: height * 0.04 }}
          className="flex-row justify-center"
        >
          {loading ? (
            <ActivityIndicator size="large" color="#FDE6B1" />
          ) : (
            <GreenButton
              title="Create Playlist"
              onPress={handleCreate}
              widthPercent={0.5}
              heightPercent={0.06}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

export default CreateMusicFolder;
