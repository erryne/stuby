import { Feather } from "@expo/vector-icons";
import { Check, PlusCircle } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

// Import ang iyong DeleteAlert component dito
import { DeleteAlert } from "@/components/DeleteAlert";

interface AddMusicModalProps {
  visible: boolean;
  onClose: () => void;
  folderId: string;
  stagedSongs: any[];
  setStagedSongs: React.Dispatch<React.SetStateAction<any[]>>;
  uploading: boolean;
  masterLibrary: any[];
  onImportMusic: () => Promise<void>;
  onUploadAllStaged: () => Promise<void>;
  onToggleSongInPlaylist: (
    songId: string,
    isInPlaylist: boolean,
  ) => Promise<void>;
}

export default function AddMusicModal({
  visible,
  onClose,
  folderId,
  stagedSongs,
  setStagedSongs,
  uploading,
  masterLibrary,
  onImportMusic,
  onUploadAllStaged,
  onToggleSongInPlaylist,
}: AddMusicModalProps) {
  const isAllSongsRoute = folderId === "all";
  const [shouldRender, setShouldRender] = useState(visible);
  const [showDiscardAlert, setShowDiscardAlert] = useState(false);

  const scaleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          friction: 8,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const animateClose = () => {
    Animated.parallel([
      Animated.timing(scaleValue, {
        toValue: 0.85,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShouldRender(false);
      onClose();
    });
  };

  const handleRequestClose = () => {
    // Kung may staged songs, ipakita ang alert bago i-close
    if (isAllSongsRoute && stagedSongs.length > 0) {
      setShowDiscardAlert(true);
    } else {
      animateClose();
    }
  };

  const handleRemoveStagedSong = (indexToRemove: number) => {
    setStagedSongs((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    );
  };

  if (!shouldRender) return null;

  return (
    <>
      <Modal
        visible={visible}
        transparent
        statusBarTranslucent
        animationType="none"
        onRequestClose={handleRequestClose}
      >
        <Animated.View style={[styles.modalOverlay, { opacity: opacityValue }]}>
          <TouchableWithoutFeedback onPress={handleRequestClose}>
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>

          <Animated.View
            style={[
              styles.modalContainer,
              { transform: [{ scale: scaleValue }] },
            ]}
          >
            <View style={styles.header}>
              <Text style={styles.headerText}>
                {isAllSongsRoute ? "Import Music" : "Add to Playlist"}
              </Text>
              <TouchableOpacity
                onPress={handleRequestClose}
                style={styles.closeButtonContainer}
              >
                <Feather name="x" size={22} color="black" />
              </TouchableOpacity>
            </View>

            {isAllSongsRoute ? (
              <View style={styles.contentWrapper}>
                <View style={styles.fieldWrapper}>
                  <Text style={styles.label}>Select Audio Source</Text>
                  <TouchableOpacity
                    onPress={onImportMusic}
                    style={styles.compactDropzoneButton}
                    disabled={uploading}
                  >
                    <View style={styles.compactDropzoneContent}>
                      <Feather name="upload" size={20} color="#64748B" />
                      <Text style={styles.compactDropzoneText}>
                        Choose Local Audio Files
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>

                {stagedSongs.length > 0 && (
                  <View style={styles.previewWrapper}>
                    <Text style={styles.label}>
                      Selected Files ({stagedSongs.length})
                    </Text>
                    <ScrollView
                      style={styles.previewScroll}
                      nestedScrollEnabled={true}
                    >
                      {stagedSongs.map((song, index) => (
                        <View key={index} style={styles.stagedRow}>
                          <View style={styles.stagedLeft}>
                            <Feather name="music" size={16} color="#64748B" />
                            <View style={styles.stagedDetails}>
                              <Text
                                style={styles.stagedTitle}
                                numberOfLines={1}
                              >
                                {song.title}
                              </Text>
                              {song.duration && (
                                <Text style={styles.stagedDuration}>
                                  {song.duration}
                                </Text>
                              )}
                            </View>
                          </View>
                          <TouchableOpacity
                            onPress={() => handleRemoveStagedSong(index)}
                            style={styles.trashContainer}
                          >
                            <Feather name="trash-2" size={18} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                )}

                <TouchableOpacity
                  style={[
                    styles.customButton,
                    (uploading || stagedSongs.length === 0) &&
                      styles.buttonDisabled,
                  ]}
                  onPress={onUploadAllStaged}
                  disabled={uploading || stagedSongs.length === 0}
                >
                  {uploading ? (
                    <ActivityIndicator size="small" color="#047857" />
                  ) : (
                    <Text style={styles.customButtonText}>Upload Songs</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.listWrapper}>
                <Text style={styles.label}>Your Library</Text>
                <FlatList
                  data={masterLibrary}
                  keyExtractor={(item) => item.id}
                  style={styles.libraryList}
                  renderItem={({ item }) => {
                    const isIn = item.playlistIds?.includes(folderId);
                    return (
                      <TouchableOpacity
                        onPress={() => onToggleSongInPlaylist(item.id, isIn)}
                        style={styles.songRow}
                      >
                        <View style={styles.songInfo}>
                          <Feather
                            name="music"
                            size={16}
                            color="#64748B"
                            style={styles.musicIcon}
                          />
                          <View style={styles.stagedDetails}>
                            <Text style={styles.songTitle}>{item.title}</Text>
                          </View>
                        </View>
                        {isIn ? (
                          <Check size={22} color="#10B981" />
                        ) : (
                          <PlusCircle size={22} color="#CBD5E1" />
                        )}
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>
            )}
          </Animated.View>
        </Animated.View>
      </Modal>

      {/* Logic para sa pag-discard */}
      <DeleteAlert
        visible={showDiscardAlert}
        title="Discard Changes?"
        message="You have unsaved music in the queue. Are you sure you want to discard them?"
        onCancel={() => setShowDiscardAlert(false)}
        onConfirm={async () => {
          setStagedSongs([]);
          setShowDiscardAlert(false);
          animateClose();
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "white",
    borderRadius: 30,
    padding: 24,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerText: { fontSize: 24, fontWeight: "900" },
  closeButtonContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  contentWrapper: { width: "100%" },
  listWrapper: { maxHeight: 400 },
  fieldWrapper: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "600", color: "#334155", marginBottom: 8 },
  compactDropzoneButton: {
    height: 64,
    width: "100%",
    borderRadius: 16,
    borderStyle: "dashed",
    borderWidth: 2,
    borderColor: "#CBD5E1",
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
  },
  compactDropzoneContent: { flexDirection: "row", alignItems: "center" },
  compactDropzoneText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
    marginLeft: 8,
  },
  previewWrapper: { marginBottom: 20 },
  previewScroll: {
    maxHeight: 180,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
  },
  stagedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#F1F5F9",
  },
  stagedLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  stagedDetails: { flex: 1, marginLeft: 10 },
  stagedTitle: { color: "#1E293B", fontWeight: "600", fontSize: 14 },
  stagedDuration: { fontSize: 11, color: "#94A3B8" },
  trashContainer: { padding: 6, borderRadius: 8, backgroundColor: "#FEF2F2" },
  libraryList: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
  },
  songRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "#F1F5F9",
  },
  songInfo: { flexDirection: "row", alignItems: "center", flex: 1 },
  musicIcon: { marginRight: 10 },
  songTitle: { color: "#1E293B", fontWeight: "600", fontSize: 15 },
  customButton: {
    backgroundColor: "#A7F3D0",
    borderRadius: 16,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  buttonDisabled: { backgroundColor: "#E2E8F0" },
  customButtonText: { color: "#065F46", fontSize: 16, fontWeight: "700" },
});
