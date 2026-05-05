import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import GreenButton from "@/components/GreenButton";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const UpdateMusicFolder = () => {
  const params = useLocalSearchParams<{
    id: string;
    title?: string;
    coverPhoto?: string;
  }>();

  const [musicTitle, setMusicTitle] = useState("");
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);

  useEffect(() => {
    if (params?.title) setMusicTitle(params.title);
    if (params?.coverPhoto) setCoverPhoto(params.coverPhoto);
  }, [params?.id]);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert("Permission required to access photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setCoverPhoto(result.assets[0].uri);
    }
  };

  const handleUpdate = () => {
    if (!musicTitle.trim()) {
      alert("Please enter a music folder title.");
      return;
    }

    router.push({
      pathname: "/music",
      params: {
        id: params.id,
        title: musicTitle,
        coverPhoto: coverPhoto ?? "",
        updated: "true",
      },
    });
  };

  return (
    <ImageBackground
      source={require("../../assets/images/musicBg.png")}
      resizeMode="cover"
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={28} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Update Music Folder</Text>
        </View>

        {/* COVER PHOTO PICKER */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={pickImage}
          style={styles.imagePicker}
        >
          {coverPhoto ? (
            <Image source={{ uri: coverPhoto }} style={styles.coverImage} />
          ) : (
            <View style={styles.placeholderContainer}>
              <View style={styles.plusIconCircle}>
                <Feather name="plus" size={24} color="#555" />
              </View>
              <Text style={styles.addPhotoText}>Add Cover Photo</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* INPUT LABEL */}
        <Text style={styles.label}>Playlist Title</Text>

        {/* INPUT FIELD */}
        <View style={styles.inputContainer}>
          <TextInput
            value={musicTitle}
            onChangeText={setMusicTitle}
            style={styles.textInput}
            placeholderTextColor="#999"
          />
        </View>

        {/* UPDATE BUTTON */}
        <View style={styles.buttonWrapper}>
          <GreenButton
            title="Update"
            onPress={handleUpdate}
            widthPercent={0.3}
            heightPercent={0.06}
          />
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

export default UpdateMusicFolder;

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
    marginTop: SCREEN_WIDTH * 0.12,
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
    height: SCREEN_WIDTH * 0.35,
    borderRadius: 20,
    backgroundColor: "rgba(156, 163, 175, 0.8)", // gray-400/80
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
    backgroundColor: "#d1d5db", // gray-300
    alignItems: "center",
    justifyContent: "center",
  },
  addPhotoText: {
    marginTop: 10,
    fontWeight: "600",
    color: "white",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "white", // Changed from black to white to match music theme visibility
    marginBottom: 8,
    marginLeft: 4,
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
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  textInput: {
    fontWeight: "bold",
    color: "black",
    fontSize: 18,
  },
  buttonWrapper: {
    marginTop: SCREEN_WIDTH * 0.08,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
});