import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { getAuth } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { db, storage } from "../firebaseConfig";

// Import your local default asset
const DEFAULT_IMAGE = require("../assets/images/musicfolder_default.png");

interface Props {
  visible: boolean;
  onClose: () => void;
  folderId?: string | null;
}

const CreateMusicFolderModal = ({ visible, onClose, folderId }: Props) => {
  const [musicTitle, setMusicTitle] = useState("");
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: "", message: "" });

  const [shouldRender, setShouldRender] = useState(visible);
  const scaleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;
  const inputFocusAnim = useRef(new Animated.Value(0)).current;

  const auth = getAuth();

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

      if (folderId) {
        const fetchFolder = async () => {
          const docSnap = await getDoc(doc(db, "music", folderId));
          if (docSnap.exists()) {
            const data = docSnap.data();
            setMusicTitle(data.musicFolderTitle || "");
            setCoverPhoto(data.musicImage || null);
          }
        };
        fetchFolder();
      }
    } else if (shouldRender) {
      animateClose();
    }
  }, [visible, folderId]);

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
      setMusicTitle("");
      setCoverPhoto(null);
      onClose();
    });
  };

  const triggerAlert = (title: string, message: string) => {
    setAlertConfig({ title, message });
    setAlertVisible(true);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      triggerAlert(
        "Permission Denied",
        "We need access to your photos to upload cover art.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setCoverPhoto(result.assets[0].uri);
    }
  };

  const uploadImageAsync = async (uri: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const fileRef = ref(
      storage,
      `music_covers/${auth.currentUser?.uid}/${Date.now()}.jpg`,
    );
    await uploadBytes(fileRef, blob);
    return await getDownloadURL(fileRef);
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!musicTitle.trim())
      return triggerAlert("Required Field", "Please enter a playlist title.");
    if (!user) return;

    setLoading(true);
    try {
      // Only upload if it's a local URI (picked from device)
      let finalImageUrl = coverPhoto;
      if (coverPhoto && !coverPhoto.startsWith("http")) {
        finalImageUrl = await uploadImageAsync(coverPhoto);
      }

      const payload = {
        musicFolderTitle: musicTitle.trim(),
        musicImage: finalImageUrl, // Will be null if no image was set
      };

      if (folderId) {
        await updateDoc(doc(db, "music", folderId), payload);
      } else {
        await addDoc(collection(db, "music"), {
          ...payload,
          userId: user.uid,
          totalSongs: 0,
          totalStreamingMinutes: "0 min",
          isHearted: false,
          createdAt: serverTimestamp(),
        });
      }
      animateClose();
    } catch (error) {
      triggerAlert("Error", "Something went wrong while saving your folder.");
    } finally {
      setLoading(false);
    }
  };

  if (!shouldRender) return null;

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="none"
      onRequestClose={animateClose}
    >
      <Animated.View style={[styles.modalOverlay, { opacity: opacityValue }]}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <Animated.View
            style={[
              styles.modalContainer,
              { transform: [{ scale: scaleValue }] },
            ]}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                <View style={styles.header}>
                  <Text style={styles.headerText}>
                    {folderId ? "Edit Playlist" : "New Playlist"}
                  </Text>
                  <TouchableOpacity
                    onPress={animateClose}
                    style={styles.closeButtonContainer}
                  >
                    <Feather name="x" size={22} color="black" />
                  </TouchableOpacity>
                </View>

                <View style={styles.fieldWrapper}>
                  <Text style={styles.label}>Playlist Cover</Text>
                  <View style={styles.boxContainerAligner}>
                    <TouchableOpacity
                      onPress={pickImage}
                      style={styles.imagePickerBox}
                      disabled={loading}
                    >
                      {coverPhoto ? (
                        <Image
                          source={{ uri: coverPhoto }}
                          style={styles.uploadedImage}
                        />
                      ) : (
                        <Image
                          source={DEFAULT_IMAGE}
                          style={styles.uploadedImage}
                        />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Remaining Input and Button JSX... */}
                <View style={styles.fieldWrapper}>
                  <Text style={styles.label}>Playlist Name</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      value={musicTitle}
                      onChangeText={setMusicTitle}
                      placeholder="e.g. My Favorite Tracks"
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.customButton}
                  onPress={handleSave}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#065F46" />
                  ) : (
                    <Text style={styles.customButtonText}>
                      {folderId ? "Update" : "Create"}
                    </Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </KeyboardAvoidingView>
          </Animated.View>
        </TouchableWithoutFeedback>
      </Animated.View>
    </Modal>
  );
};

// ... keep your existing StyleSheet

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxHeight: "85%",
    backgroundColor: "white",
    borderRadius: 30,
    overflow: "hidden",
  },
  scrollContent: { padding: 24 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "900",
    color: "black",
    lineHeight: 28,
  },
  closeButtonContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  fieldWrapper: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  boxContainerAligner: {
    width: "100%",
    alignItems: "center", // Centered to match folder appearance balance perfectly
    marginVertical: 4,
  },
  imagePickerBox: {
    height: 160, // Explicit width and height match values build a
    width: 160, // perfect square box structure mimicking your card!
    borderRadius: 16,
    borderStyle: "dashed",
    borderWidth: 2,
    borderColor: "#CBD5E1",
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  uploadedImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  uploadPlaceholder: {
    alignItems: "center",
    padding: 10,
  },
  uploadText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 6,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 12,
    backgroundColor: "#F8FAFC",
    height: 54,
    alignItems: "center",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 6,
    elevation: 5,
  },
  iconContainer: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1E293B",
    fontWeight: "600",
    height: "100%",
  },
  customButton: {
    backgroundColor: "#A7F3D0",
    borderRadius: 16,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#A7F3D0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  buttonDisabled: {
    backgroundColor: "#E6FDF4",
    opacity: 0.7,
  },
  customButtonText: {
    color: "#065F46",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});

export default CreateMusicFolderModal;
