import MusicFolderCard from "@/components/MusicFolderCard";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ImageBackground,
  LayoutAnimation,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import DeletePlaylistModal from "../../components/DeletePlaylistModal";

// Firebase Imports
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";

const { width } = Dimensions.get("window");

// 1. Define the Interface to fix the "isHearted" red lines
interface MusicFolder {
  id: string;
  musicFolderTitle: string;
  musicImage?: string;
  totalSongs: number;
  totalStreamingMinutes: string;
  isHearted: boolean;
  createdAt?: any;
}

export default function Music() {
  // Android LayoutAnimation setup
  if (
    Platform.OS === "android" &&
    UIManager.setLayoutAnimationEnabledExperimental
  ) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  const [musicFolders, setMusicFolders] = useState<MusicFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [popupVisibleFolderId, setPopupVisibleFolderId] = useState<
    string | null
  >(null);
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);

  /* ---------------- 2. DATABASE LISTENER ---------------- */
  useEffect(() => {
    const q = query(
      collection(db, "musicFolders"),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const foldersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<MusicFolder, "id">),
        })) as MusicFolder[];

        // Create "All Songs" folder if it doesn't exist in DB
        // Or find it if you stored it in DB
        let allSongs = foldersData.find((f) => f.id === "all");

        if (!allSongs) {
          allSongs = {
            id: "all",
            musicFolderTitle: "All Songs",
            musicImage: undefined,
            totalSongs: 0,
            totalStreamingMinutes: "0 min",
            isHearted: false,
          };
        }

        const others = foldersData.filter((f) => f.id !== "all");
        const hearted = others.filter((f) => f.isHearted);
        const unhearted = others.filter((f) => !f.isHearted);

        // Smooth transition for hearting/sorting
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setMusicFolders([allSongs, ...hearted, ...unhearted]);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore error:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  /* ---------------- 3. DELETE FUNCTION ---------------- */
  const handleDeleteFolder = async (id: string) => {
    if (id === "all") return;
    try {
      await deleteDoc(doc(db, "musicFolders", id));
      setFolderToDelete(null);
    } catch (error) {
      console.error("Error deleting folder:", error);
      Alert.alert("Error", "Could not delete playlist.");
    }
  };

  /* ---------------- 4. HEART TOGGLE FUNCTION ---------------- */
  const toggleHeartFolder = async (id: string, currentStatus: boolean) => {
    if (id === "all") return;
    try {
      const folderRef = doc(db, "musicFolders", id);
      await updateDoc(folderRef, {
        isHearted: !currentStatus,
      });
    } catch (error) {
      console.error("Error toggling heart:", error);
    }
  };

  if (loading) {
    return (
      <ImageBackground
        source={require("../../assets/images/musicBg.png")}
        className="flex-1 justify-center items-center"
      >
        <ActivityIndicator size="large" color="#FDE6B1" />
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require("../../assets/images/musicBg.png")}
      className="flex-1"
      resizeMode="cover"
    >
      {/* Header */}
      <Text className="text-[#FDE6B1] mt-12 mb-8 text-4xl font-[900] text-center tracking-[4px]">
        Music
      </Text>

      {/* Main List */}
      <ScrollView
        contentContainerStyle={{ alignItems: "center", paddingBottom: 100 }}
      >
        {musicFolders.map((folder) => (
          <View
            key={folder.id}
            className="overflow-hidden rounded-2xl shadow-md mb-4"
            style={{ width: width * 0.9, height: 130 }}
          >
            <MusicFolderCard
              musicFolderId={folder.id}
              musicFolderTitle={folder.musicFolderTitle}
              // Handle local vs remote image
              musicImage={
                folder.musicImage
                  ? { uri: folder.musicImage }
                  : require("../../assets/images/musicDefault.png")
              }
              totalSongs={folder.totalSongs}
              totalStreamingMinutes={folder.totalStreamingMinutes}
              isPopupVisible={popupVisibleFolderId === folder.id}
              setPopupVisibleFolder={
                folder.id === "all" ? () => {} : setPopupVisibleFolderId
              }
              onFolderDelete={() => setFolderToDelete(folder.id)}
              onFolderPress={() =>
                router.push({
                  pathname: "/music/playlist",
                  params: { id: folder.id, title: folder.musicFolderTitle },
                })
              }
              isHearted={folder.isHearted}
              onHeartToggle={() =>
                toggleHeartFolder(folder.id, folder.isHearted)
              }
              hideHeart={folder.id === "all"}
            />
          </View>
        ))}

        {musicFolders.length === 1 && (
          <Text className="text-white/50 mt-10">
            No playlists yet. Create one!
          </Text>
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        className="absolute bottom-8 right-8 w-[65px] h-[65px] bg-[#EFE2B6] rounded-full justify-center items-center shadow-2xl"
        style={{ elevation: 5 }}
        onPress={() => router.push("/music/createMusicFolder")}
      >
        <Ionicons name="add" size={40} color="#2E2A25" />
      </TouchableOpacity>

      {/* Modal Overlay */}
      <DeletePlaylistModal
        visible={!!folderToDelete}
        onCancel={() => setFolderToDelete(null)}
        onConfirm={() => folderToDelete && handleDeleteFolder(folderToDelete)}
      />
    </ImageBackground>
  );
}
