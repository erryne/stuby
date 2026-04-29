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
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import GreenButton from "@/components/GreenButton";

const { width, height } = Dimensions.get("window");

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

  // 🎨 PICK IMAGE
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

  // ✅ UPDATE MUSIC FOLDER AND GO BACK TO MUSIC SCREEN
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
      className="flex-1"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
        style={{ paddingHorizontal: width * 0.06 }}
      >
        {/* HEADER */}
        <View className="flex-row items-center mt-8 justify-center mb-12 relative">
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute left-0 p-2"
          >
            <ChevronLeft size={28} color="#ffffff" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-[#FDE6B1]">
            Update Music Folder
          </Text>
        </View>

        {/* COVER PHOTO */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={pickImage}
          style={{ height: height * 0.14, marginBottom: height * 0.04 }}
          className="w-full rounded-2xl bg-gray-400/80 overflow-hidden items-center justify-center"
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

        {/* MUSIC TITLE LABEL */}
        <Text
          style={{ marginBottom: height * 0.01 }}
          className="text-base font-semibold text-black"
        >
          Playlist Title
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
            value={musicTitle}
            onChangeText={setMusicTitle}
            className="font-bold text-black"
          />
        </View>

        {/* UPDATE BUTTON */}
        <View
          style={{ marginTop: height * 0.03 }}
          className="flex-row justify-end"
        >
          <GreenButton
            title="Update"
            onPress={handleUpdate}
            widthPercent={0.25}
            heightPercent={0.05}
          />
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

export default UpdateMusicFolder;
