import CreateMusicFolderModal from "@/components/CreateMusicFolderModal";
import CustomHeader from "@/components/CustomHeader";
import MusicFolderCard from "@/components/MusicFolderCard";
import TitleHeader from "@/components/TitleHeader";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { getAuth } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  LayoutAnimation,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AddFloatingButton from "../../components/AddFloatingButton";
import DeletePlaylistModal from "../../components/DeletePlaylistModal";
import GeometricBackground from "../../components/GeometricBackground";
import { db } from "../../firebaseConfig";
import { useMusic } from "../context/MusicContext";

const { width } = Dimensions.get("window");

interface MusicFolder {
  id: string;
  musicFolderTitle: string;
  musicImage?: string;
  totalSongs: number;
  duration?: string;
  isHearted: boolean;
  createdAt?: any;
  userId: string;
}

export default function Music() {
  const auth = getAuth();
  const user = auth.currentUser;
  const { setCurrentFolderImage } = useMusic();

  const [loading, setLoading] = useState(true);
  const [allSongs, setAllSongs] = useState<any[]>([]);
  const [rawFolders, setRawFolders] = useState<MusicFolder[]>([]);
  const [musicFolders, setMusicFolders] = useState<MusicFolder[]>([]);

  const [popupVisibleFolderId, setPopupVisibleFolderId] = useState<
    string | null
  >(null);
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);

  const durationStringToSeconds = (durationStr: string): number => {
    if (!durationStr) return 0;
    const parts = durationStr.split(":").map(Number);
    if (parts.some(isNaN)) return 0;
    if (parts.length === 3) {
      const [hours, minutes, seconds] = parts;
      return hours * 3600 + minutes * 60 + seconds;
    } else if (parts.length === 2) {
      const [minutes, seconds] = parts;
      return minutes * 60 + seconds;
    }
    return 0;
  };

  const formatTotalDuration = (totalSeconds: number): string => {
    if (totalSeconds <= 0) return "";
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
    if (hours > 0) {
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
      return `${hours}:${formattedMinutes}:${formattedSeconds}`;
    }
    return `${minutes}:${formattedSeconds}`;
  };

  useEffect(() => {
    if (!user) return;
    const songsQ = query(
      collection(db, "songs"),
      where("userId", "==", user.uid),
    );
    const unsubscribeSongs = onSnapshot(songsQ, (snapshot) => {
      setAllSongs(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribeSongs();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const folderQ = query(
      collection(db, "music"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
    );
    const unsubscribeFolders = onSnapshot(folderQ, (snapshot) => {
      setRawFolders(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<MusicFolder, "id">),
        })),
      );
      setLoading(false);
    });
    return () => unsubscribeFolders();
  }, [user]);

  useEffect(() => {
    if (loading) return;
    const processedCustomFolders = rawFolders.map((folder) => {
      const folderSongs = allSongs.filter((song) =>
        song.playlistIds?.includes(folder.id),
      );
      const totalSeconds = folderSongs.reduce(
        (acc, song) => acc + durationStringToSeconds(song.duration || ""),
        0,
      );
      return {
        ...folder,
        totalSongs: folderSongs.length,
        duration: formatTotalDuration(totalSeconds),
      };
    });

    const globalSongs = allSongs.filter((s) => s.playlistIds?.includes("all"));
    const globalSeconds = globalSongs.reduce(
      (acc, song) => acc + durationStringToSeconds(song.duration || ""),
      0,
    );

    const allSongsFolder = {
      id: "all",
      musicFolderTitle: "All Songs",
      totalSongs: globalSongs.length,
      duration: formatTotalDuration(globalSeconds),
      isHearted: false,
      userId: user?.uid || "",
    };

    const others = processedCustomFolders.filter((f) => f.id !== "all");
    const hearted = others.filter((f) => f.isHearted);
    const unhearted = others.filter((f) => !f.isHearted);

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMusicFolders([allSongsFolder, ...hearted, ...unhearted]);
  }, [rawFolders, allSongs, loading]);

  const handleDeleteFolder = async (id: string) => {
    try {
      await deleteDoc(doc(db, "music", id));
      await deleteDoc(doc(db, "favorites", `music_${id}`));
      setFolderToDelete(null);
    } catch {
      Alert.alert("Error", "Could not delete playlist.");
    }
  };

  const toggleHeartFolder = async (id: string, currentStatus: boolean) => {
    if (!user) return;
    const nextHeartedState = !currentStatus;

    try {
      const folderRef = doc(db, "music", id);
      const favoriteRef = doc(db, "favorites", `music_${id}`);
      const folderData = musicFolders.find((f) => f.id === id);
      const folderTitle = folderData
        ? folderData.musicFolderTitle
        : "Untitled Playlist";
      const playlistImage = folderData?.musicImage || null;

      await updateDoc(folderRef, { isHearted: nextHeartedState });

      if (nextHeartedState) {
        await setDoc(favoriteRef, {
          userId: user.uid,
          title: folderTitle,
          type: "music",
          route: `/music/playlist?id=${id}&title=${encodeURIComponent(folderTitle)}&image=${encodeURIComponent(playlistImage || "")}`,
          coverPhoto: playlistImage,
          createdAt: new Date(),
        });
      } else {
        await deleteDoc(favoriteRef);
      }
    } catch (e) {
      console.error("Error updating music entry reference path:", e);
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={["#7DD3FC", "#38BDF8"]} style={styles.container}>
        <ActivityIndicator size="large" color="#FDE6B1" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#7DD3FC", "#38BDF8", "#0EA5E9"]}
      style={styles.container}
    >
      <View style={StyleSheet.absoluteFillObject}>
        <GeometricBackground />
      </View>
      <SafeAreaView>
        <CustomHeader />
      </SafeAreaView>

      <View style={styles.fixedHeaderContainer}>
        <TitleHeader
          title="MUSIC"
          size="xl"
          align="center"
          color="#ffffff"
          containerStyle={{ marginBottom: 32 }}
          titleStyle={{
            textShadowColor: "rgba(0, 0, 0, 0.8)",
            textShadowOffset: { width: 2, height: 2 },
            textShadowRadius: 4,
          }}
        />
        <TouchableOpacity
          style={styles.allSongsButton}
          onPress={() => {
            setCurrentFolderImage(null);
            router.push({
              pathname: "/music/playlist",
              params: { id: "all", title: "All Songs", image: "" },
            });
          }}
        >
          <View>
            <Text style={styles.allSongsTitle}>All Songs</Text>
            <Text style={styles.allSongsSubtitle}>
              Manage and upload your tracks
            </Text>
          </View>
          <Ionicons name="cloud-upload-outline" size={32} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.gridContainer}>
          {musicFolders
            .filter((f) => f.id !== "all")
            .map((folder) => (
              <View key={folder.id} style={styles.albumItem}>
                <MusicFolderCard
                  musicFolderId={folder.id}
                  musicFolderTitle={folder.musicFolderTitle}
                  musicImage={folder.musicImage}
                  totalSongs={folder.totalSongs}
                  duration={folder.duration}
                  isPopupVisible={popupVisibleFolderId === folder.id}
                  setPopupVisibleFolder={setPopupVisibleFolderId}
                  onFolderDelete={() => setFolderToDelete(folder.id)}
                  onFolderEdit={() => {
                    setEditingFolderId(folder.id);
                    setCreateModalVisible(true);
                  }}
                  onFolderPress={() => {
                    setCurrentFolderImage(folder.musicImage || null);
                    router.push({
                      pathname: "/music/playlist",
                      params: {
                        id: folder.id,
                        title: folder.musicFolderTitle,
                        image: folder.musicImage,
                      },
                    });
                  }}
                  isHearted={folder.isHearted}
                  onHeartToggle={() =>
                    toggleHeartFolder(folder.id, folder.isHearted)
                  }
                />
              </View>
            ))}
        </View>
      </ScrollView>

      <AddFloatingButton
        onPress={() => {
          setEditingFolderId(null);
          setCreateModalVisible(true);
        }}
      />
      <CreateMusicFolderModal
        visible={createModalVisible}
        folderId={editingFolderId}
        onClose={() => {
          setCreateModalVisible(false);
          setEditingFolderId(null);
        }}
      />
      <DeletePlaylistModal
        visible={!!folderToDelete}
        onCancel={() => setFolderToDelete(null)}
        onConfirm={() => folderToDelete && handleDeleteFolder(folderToDelete)}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fixedHeaderContainer: {
    paddingHorizontal: 15,
    marginTop: -18,
  },
  scrollContainer: {},
  scrollContent: {
    paddingVertical: 22,
    paddingHorizontal: 15,
  },
  allSongsButton: {
    backgroundColor: "rgba(51, 65, 85, 0.2)",
    borderWidth: 3,
    borderColor: "#ffffff",
    padding: 20,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  allSongsTitle: { color: "white", fontSize: 22, fontWeight: "bold" },
  allSongsSubtitle: {
    color: "#ffffff",
    fontSize: 13,
    marginTop: 4,
    opacity: 0.8,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  albumItem: { width: width * 0.44, marginBottom: 40 },
});
