import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as DocumentPicker from "expo-document-picker";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import {
  Check,
  Pause,
  Pencil,
  Play,
  PlusCircle,
  SkipForward,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { SlideInDown, SlideOutDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

// Components & Context
import AddMusicModal from "../../components/AddMusicModal";
import CustomHeader from "../../components/CustomHeader";
import GeometricBackground from "../../components/GeometricBackground";
import MusicPlayerModal from "../../components/MusicPlayerModal";
import SongList from "../../components/SongList";
import { useMusic } from "./../context/MusicContext";

// Firebase
import { getAuth } from "firebase/auth";
import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "../../firebaseConfig";

export default function Playlist() {
  const params = useLocalSearchParams();
  const auth = getAuth();
  const user = auth.currentUser;

  const {
    playSong,
    currentSong,
    setCurrentSong,
    setCurrentFolderImage,
    isPlaying,
    togglePlay,
    handleNext,
  } = useMusic();

  const folderId = Array.isArray(params?.id)
    ? params.id[0]
    : (params?.id ?? "");
  const folderTitle = Array.isArray(params?.title)
    ? params.title[0]
    : (params?.title ?? "Playlist");
  const folderImage = Array.isArray(params?.image)
    ? params.image[0]
    : (params?.image ?? "");

  const [playlistSongs, setPlaylistSongs] = useState<any[]>([]);
  const [masterLibrary, setMasterLibrary] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isPlayerModalVisible, setIsPlayerModalVisible] = useState(false);
  const [stagedSongs, setStagedSongs] = useState<any[]>([]);

  // Ref para ma-track kung ang pagbabago ay dahil sa deletion
  const isDeletionPending = useRef(false);

  // Logic: Mawawala lang ang song kung ito ay dinelete, hindi dahil nag-navigate ka
  useEffect(() => {
    if (currentSong && playlistSongs.length > 0 && isDeletionPending.current) {
      const isStillInPlaylist = playlistSongs.some(
        (song) => song.id === currentSong.id,
      );
      if (!isStillInPlaylist) {
        setCurrentSong(null);
      }
      isDeletionPending.current = false;
    }
  }, [playlistSongs]);

  const handleSelectSong = (id: string) => {
    const index = playlistSongs.findIndex((s) => s.id === id);
    if (index !== -1) {
      setCurrentFolderImage(folderImage || null);
      playSong(playlistSongs[index], playlistSongs, index, folderImage);
      setIsPlayerModalVisible(true);
    }
  };

  const handleDeleteSong = async (id: string) => {
    isDeletionPending.current = true; // Signal na delete ang action
    if (folderId === "all") {
      await deleteDoc(doc(db, "songs", id));
    } else {
      await updateDoc(doc(db, "songs", id), {
        playlistIds: arrayRemove(folderId),
      });
    }
  };

  const uploadAudioAsync = async (uri: string, fileName: string) => {
    const blob: any = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => resolve(xhr.response);
      xhr.onerror = () => reject(new TypeError("Network request failed"));
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    });
    const fileRef = ref(
      storage,
      `users/${user?.uid}/music/${Date.now()}-${fileName}`,
    );
    await uploadBytes(fileRef, blob);
    blob.close();
    return await getDownloadURL(fileRef);
  };

  const handleImportMusic = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "audio/*",
      multiple: true,
    });
    if (!result.canceled) {
      setUploading(true);
      try {
        const newStagedFiles: any[] = [];
        for (const file of result.assets) {
          const { sound } = await Audio.Sound.createAsync(
            { uri: file.uri },
            { shouldPlay: false },
          );
          const status = await sound.getStatusAsync();
          await sound.unloadAsync();
          newStagedFiles.push({
            uri: file.uri,
            title: file.name.split(".")[0],
            duration:
              status.isLoaded && status.durationMillis
                ? `${Math.floor(status.durationMillis / 60000)}:${Math.floor(
                    (status.durationMillis % 60000) / 1000,
                  )
                    .toString()
                    .padStart(2, "0")}`
                : "0:00",
          });
        }
        setStagedSongs((prev) => [...prev, ...newStagedFiles]);
      } catch (err) {
        Alert.alert("Error", "Could not read audio file.");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleUploadAllStaged = async () => {
    if (stagedSongs.length === 0 || !user) return;
    setUploading(true);
    try {
      const batch = writeBatch(db);
      for (const song of stagedSongs) {
        const permanentUrl = await uploadAudioAsync(song.uri, song.title);
        const newDocRef = doc(collection(db, "songs"));
        batch.set(newDocRef, {
          userId: user.uid,
          title: song.title,
          fileUri: permanentUrl,
          duration: song.duration,
          playlistIds: folderId === "all" ? ["all"] : ["all", folderId],
          createdAt: serverTimestamp(),
        });
      }
      await batch.commit();
      setIsAddModalVisible(false);
      setStagedSongs([]);
    } catch (e) {
      Alert.alert("Error", "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const toggleSongInPlaylist = async (
    songId: string,
    isInPlaylist: boolean,
  ) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await updateDoc(doc(db, "songs", songId), {
      playlistIds: isInPlaylist ? arrayRemove(folderId) : arrayUnion(folderId),
    });
  };

  useEffect(() => {
    if (!folderId || !user) return;
    const qPlaylist = query(
      collection(db, "songs"),
      where("userId", "==", user.uid),
      where("playlistIds", "array-contains", folderId),
      orderBy("createdAt", "desc"),
    );
    const unsubscribePlaylist = onSnapshot(qPlaylist, (snapshot) =>
      setPlaylistSongs(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))),
    );
    const qMaster = query(
      collection(db, "songs"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
    );
    const unsubscribeMaster = onSnapshot(qMaster, (snapshot) =>
      setMasterLibrary(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))),
    );
    return () => {
      unsubscribePlaylist();
      unsubscribeMaster();
    };
  }, [folderId, user?.uid]);

  return (
    <LinearGradient
      colors={["#7DD3FC", "#38BDF8", "#0EA5E9"]}
      style={styles.gradientContainer}
    >
      <View style={StyleSheet.absoluteFillObject}>
        <GeometricBackground />
      </View>
      <SafeAreaView>
        <CustomHeader />
      </SafeAreaView>

      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={28} color="#334155" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {folderTitle}
        </Text>
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
          {isEditing ? (
            <View style={styles.checkIconWrapper}>
              <Check size={20} color="#334155" />
            </View>
          ) : (
            <Pencil size={24} color="#334155" />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.mainContentContainer}>
        <TouchableOpacity
          onPress={() => setIsAddModalVisible(true)}
          style={styles.actionButton}
        >
          <PlusCircle size={24} color="#ffffff" />
          <Text style={styles.actionButtonText}>
            {folderId === "all" ? "Upload Songs" : "Add Songs"}
          </Text>
        </TouchableOpacity>
        <SongList
          songs={playlistSongs}
          currentId={currentSong?.id || ""}
          isEditing={isEditing}
          onSelect={handleSelectSong}
          onDelete={handleDeleteSong}
        />
      </View>

      {currentSong && (
        <Animated.View
          entering={SlideInDown}
          exiting={SlideOutDown}
          style={styles.miniPlayer}
        >
          <TouchableOpacity
            style={styles.miniPlayerContent}
            onPress={() => setIsPlayerModalVisible(true)}
          >
            <Text numberOfLines={1} style={styles.miniPlayerTitle}>
              {currentSong.title}
            </Text>
            <View style={styles.miniPlayerControls}>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                style={styles.icon}
              >
                {isPlaying ? (
                  <Pause size={24} color="#334155" fill="#334155" />
                ) : (
                  <Play size={24} color="#334155" fill="#334155" />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                style={styles.icon}
              >
                <SkipForward size={24} color="#334155" fill="#334155" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}

      <AddMusicModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        folderId={folderId}
        stagedSongs={stagedSongs}
        setStagedSongs={setStagedSongs}
        uploading={uploading}
        masterLibrary={masterLibrary}
        onImportMusic={handleImportMusic}
        onUploadAllStaged={handleUploadAllStaged}
        onToggleSongInPlaylist={toggleSongInPlaylist}
      />
      <MusicPlayerModal
        visible={isPlayerModalVisible}
        onClose={() => setIsPlayerModalVisible(false)}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    marginBottom: 32,
    paddingVertical: 12,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "900",
    color: "#334155",
  },
  checkIconWrapper: {
    backgroundColor: "white",
    padding: 8,
    borderRadius: 9999,
  },
  mainContentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 80,
  },
  iconBtn: {
    padding: 8,
    backgroundColor: "white",
    borderRadius: 12,
    elevation: 2,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(51, 65, 85, 0.2)",
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "white",
  },
  actionButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 10,
  },
  miniPlayer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 20,
    justifyContent: "center",
    elevation: 10,
  },
  miniPlayerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  miniPlayerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
    marginRight: 15,
  },
  miniPlayerControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    padding: 8,
  },
});
