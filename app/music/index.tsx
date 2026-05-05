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
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import DeletePlaylistModal from "../../components/DeletePlaylistModal";

// Firebase Imports
import TitleHeader from "@/components/TitleHeader";
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

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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
  if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  const [musicFolders, setMusicFolders] = useState<MusicFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [popupVisibleFolderId, setPopupVisibleFolderId] = useState<string | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "musicFolders"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const foldersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<MusicFolder, "id">),
      })) as MusicFolder[];

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

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setMusicFolders([allSongs, ...hearted, ...unhearted]);
      setLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDeleteFolder = async (id: string) => {
    if (id === "all") return;
    try {
      await deleteDoc(doc(db, "musicFolders", id));
      setFolderToDelete(null);
    } catch (error) {
      Alert.alert("Error", "Could not delete playlist.");
    }
  };

  const toggleHeartFolder = async (id: string, currentStatus: boolean) => {
    if (id === "all") return;
    try {
      await updateDoc(doc(db, "musicFolders", id), { isHearted: !currentStatus });
    } catch (error) {
      console.error("Error toggling heart:", error);
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../assets/images/musicBg.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.contentContainer}>
          <TitleHeader image={require("../../assets/images/musicHeader.png")} />

          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#FDE6B1" />
            </View>
          ) : (
            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent} 
              showsVerticalScrollIndicator={false}
            >
              {musicFolders.map((folder) => (
                <View key={folder.id} style={styles.cardContainer}>
                  <MusicFolderCard
                    musicFolderId={folder.id}
                    musicFolderTitle={folder.musicFolderTitle}
                    musicImage={
                      folder.musicImage
                        ? { uri: folder.musicImage }
                        : require("../../assets/images/musicDefault.png")
                    }
                    totalSongs={folder.totalSongs}
                    totalStreamingMinutes={folder.totalStreamingMinutes}
                    isPopupVisible={popupVisibleFolderId === folder.id}
                    setPopupVisibleFolder={folder.id === "all" ? () => {} : setPopupVisibleFolderId}
                    onFolderDelete={() => setFolderToDelete(folder.id)}
                    onFolderPress={() =>
                      router.push({
                        pathname: "/music/playlist",
                        params: { id: folder.id, title: folder.musicFolderTitle },
                      })
                    }
                    isHearted={folder.isHearted}
                    onHeartToggle={() => toggleHeartFolder(folder.id, folder.isHearted)}
                    hideHeart={folder.id === "all"}
                  />
                </View>
              ))}

              {musicFolders.length === 1 && (
                <Text style={styles.emptyText}>No playlists yet. Create one!</Text>
              )}
            </ScrollView>
          )}

          {/* Floating Add Button */}
          <TouchableOpacity 
            activeOpacity={0.8}
            style={styles.floatingButton} 
            onPress={() => router.push("/music/createMusicFolder")}
          >
            <Ionicons name="add" size={40} color="#2E2A25" />
          </TouchableOpacity>

          <DeletePlaylistModal
            visible={!!folderToDelete}
            onCancel={() => setFolderToDelete(null)}
            onConfirm={() => folderToDelete && handleDeleteFolder(folderToDelete)}
          />
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: "5%",
    marginTop: "5%",
    alignItems: "center",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
    width: "100%",
    marginTop: 10,
  },
  scrollContent: {
    alignItems: "center",
    paddingBottom: 100, // Space for floating button matching Flashcard screen
  },
  cardContainer: {
    width: "100%", // Controlled by contentContainer padding
    height: SCREEN_WIDTH * 0.35,
    borderRadius: 16,
    marginBottom: 15,
    overflow: "hidden",
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  emptyText: {
    color: "rgba(255, 255, 255, 0.5)",
    marginTop: 40,
    fontSize: 16,
    textAlign: "center",
  },
  floatingButton: {
    position: "absolute",
    bottom: 30, // Adjusted to sit properly within the view
    right: 10,
    width: 65,
    height: 65,
    backgroundColor: "#EFE2B6",
    borderRadius: 32.5,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
});