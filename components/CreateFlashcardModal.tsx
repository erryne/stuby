import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import {
  addDoc,
  collection,
  doc,
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
import { auth, db, storage } from "../firebaseConfig";
import { CustomAlert } from "./CustomAlert";

const DEFAULT_COVER = require("../assets/images/designs/default_flashcardfolder.png");

const PRESET_DESIGNS = [
  {
    id: "calculus",
    label: "Calculus",
    src: require("../assets/images/designs/calculus.png"),
  },
  {
    id: "drrr",
    label: "Disaster Risk Reduction Management ",
    src: require("../assets/images/designs/drrr.png"),
  },
  {
    id: "enghlish",
    label: "English",
    src: require("../assets/images/designs/english.png"),
  },
  {
    id: "experiment",
    label: "Experiment",
    src: require("../assets/images/designs/experiment.png"),
  },
  {
    id: "health",
    label: "Health",
    src: require("../assets/images/designs/health.png"),
  },
  {
    id: "media-literacy",
    label: "Media and Information Literacy",
    src: require("../assets/images/designs/mainl.png"),
  },
  {
    id: "math",
    label: "Math",
    src: require("../assets/images/designs/math.png"),
  },
  {
    id: "pe",
    label: "Physical Education",
    src: require("../assets/images/designs/pe.png"),
  },
  {
    id: "philosophy",
    label: "Philosophy",
    src: require("../assets/images/designs/philosophy.png"),
  },
  {
    id: "science",
    label: "Science",
    src: require("../assets/images/designs/science.png"),
  },
  {
    id: "social-studies",
    label: "Social Studies",
    src: require("../assets/images/designs/socialstudies.png"),
  },
  {
    id: "statistics",
    label: "Statistics",
    src: require("../assets/images/designs/statistics.png"),
  },
  {
    id: "technology",
    label: "Technology",
    src: require("../assets/images/designs/technology.png"),
  },
  {
    id: "writings",
    label: "Writings",
    src: require("../assets/images/designs/writings.png"),
  },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  deckToEdit?: {
    id: string;
    title: string;
    design: string;
    coverPhoto?: string;
  } | null;
}

const CreateFlashcardModal = ({ visible, onClose, deckToEdit }: Props) => {
  const [title, setTitle] = useState("");
  const [selectedDesign, setSelectedDesign] = useState<string | null>(
    PRESET_DESIGNS[0]?.id || null,
  );
  const [customPhoto, setCustomPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Track keyboard state to turn scrolling on/off dynamically
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: "", message: "" });

  const [shouldRender, setShouldRender] = useState(visible);
  const scaleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;
  const titleFocusAnim = useRef(new Animated.Value(0)).current;

  // Track keyboard visibility changes
  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => setIsKeyboardVisible(true),
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setIsKeyboardVisible(false),
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

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

      if (deckToEdit) {
        setTitle(deckToEdit.title);
        setSelectedDesign(deckToEdit.design);
        setCustomPhoto(deckToEdit.coverPhoto || null);
      } else {
        setSelectedDesign(PRESET_DESIGNS[0]?.id || null);
      }
    } else if (shouldRender) {
      animateClose();
    }
  }, [visible, deckToEdit]);

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
      setTitle("");
      setSelectedDesign(PRESET_DESIGNS[0]?.id || null);
      setCustomPhoto(null);
      onClose();
    });
  };

  const triggerAlert = (title: string, message: string) => {
    setAlertConfig({ title, message });
    setAlertVisible(true);
  };

  const handleFocus = () =>
    Animated.timing(titleFocusAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: false,
    }).start();

  const handleBlur = () =>
    Animated.timing(titleFocusAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: false,
    }).start();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
    });
    if (!result.canceled) setCustomPhoto(result.assets[0].uri);
  };

  const uploadImageAsync = async (uri: string) => {
    if (uri.startsWith("http")) return uri;
    const response = await fetch(uri);
    const blob = await response.blob();
    const filename = `covers/${auth.currentUser?.uid}/${Date.now()}.jpg`;
    const storageRef = ref(storage, filename);
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      return triggerAlert("Missing Title", "Please enter a deck title.");
    }
    setLoading(true);
    try {
      let coverUrl = "";
      if (customPhoto) {
        coverUrl = await uploadImageAsync(customPhoto);
      } else {
        coverUrl = Image.resolveAssetSource(DEFAULT_COVER).uri;
      }

      if (deckToEdit) {
        await updateDoc(doc(db, "flashcardFolders", deckToEdit.id), {
          title: title.trim(),
          coverPhoto: coverUrl,
          design: selectedDesign,
        });
      } else {
        await addDoc(collection(db, "flashcardFolders"), {
          userId: auth.currentUser?.uid,
          title: title.trim(),
          coverPhoto: coverUrl,
          design: selectedDesign,
          createdAt: serverTimestamp(),
          cardCount: 0,
        });
      }
      animateClose();
    } catch (e) {
      triggerAlert(
        "Error",
        "Could not save your deck. Please check your connection.",
      );
    } finally {
      setLoading(false);
    }
  };

  const titleBorderColor = titleFocusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#E2E8F0", "#38BDF8"],
  });

  const titleShadowOpacity = titleFocusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.4],
  });

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
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingContainer}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <Animated.View
              style={[
                styles.modalContainer,
                { transform: [{ scale: scaleValue }] },
              ]}
            >
              {/* Added scrollEnabled conditional toggling based on keyboard state */}
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                scrollEnabled={isKeyboardVisible}
                bounces={isKeyboardVisible}
              >
                <View style={styles.header}>
                  <Text style={styles.headerText}>
                    {deckToEdit ? "Edit Deck" : "New Deck"}
                  </Text>
                  <TouchableOpacity
                    onPress={animateClose}
                    style={styles.closeButtonContainer}
                    activeOpacity={0.7}
                  >
                    <Feather name="x" size={22} color="black" />
                  </TouchableOpacity>
                </View>

                {/* Cover Picker Field */}
                <View style={styles.fieldWrapper}>
                  <Text style={styles.label}>Folder Cover</Text>
                  <TouchableOpacity
                    onPress={pickImage}
                    style={styles.imagePicker}
                    activeOpacity={0.8}
                  >
                    {customPhoto ? (
                      <Image
                        source={{ uri: customPhoto }}
                        style={styles.uploadedImage}
                      />
                    ) : (
                      <View style={styles.uploadPlaceholder}>
                        <Feather name="upload" size={24} color="#64748B" />
                        <Text style={styles.uploadText}>
                          Upload Cover Image
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Theme Selection Field */}
                <View style={styles.fieldWrapper}>
                  <Text style={styles.label}>Theme preset</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalScrollPadding}
                  >
                    {PRESET_DESIGNS.map((d) => {
                      const isSelected = selectedDesign === d.id;
                      return (
                        <View key={d.id} style={styles.designWrapper}>
                          <TouchableOpacity
                            onPress={() => setSelectedDesign(d.id)}
                            style={[
                              styles.designOption,
                              isSelected && styles.selectedDesign,
                            ]}
                            activeOpacity={0.85}
                          >
                            <Image source={d.src} style={styles.designImage} />
                          </TouchableOpacity>
                          <Text
                            style={[
                              styles.designLabel,
                              isSelected && styles.selectedDesignLabel,
                            ]}
                            numberOfLines={1}
                          >
                            {d.label}
                          </Text>
                        </View>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* Deck Title Input Field */}
                <View style={styles.fieldWrapper}>
                  <Text style={styles.label}>Deck Title</Text>
                  <Animated.View
                    style={[
                      styles.inputContainer,
                      {
                        borderColor: titleBorderColor,
                        shadowOpacity: titleShadowOpacity,
                      },
                    ]}
                  >
                    <View style={styles.iconContainer}>
                      <Feather name="folder" size={20} color="#64748B" />
                    </View>
                    <TextInput
                      value={title}
                      onChangeText={setTitle}
                      placeholder="Enter deck title..."
                      placeholderTextColor="#94A3B8"
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      style={styles.input}
                    />
                  </Animated.View>
                </View>

                {/* Inline Action Button */}
                <TouchableOpacity
                  style={[
                    styles.customButton,
                    loading && styles.buttonDisabled,
                  ]}
                  onPress={handleSave}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#065F46" />
                  ) : (
                    <Text style={styles.customButtonText}>
                      {deckToEdit ? "Update Deck" : "Create Deck"}
                    </Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </Animated.View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Animated.View>

      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => setAlertVisible(false)}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  keyboardAvoidingContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 30,
    overflow: "hidden",
    flexShrink: 1, // Let card stay tight and scale intelligently down
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16, // Snug layout spacing
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerText: {
    fontSize: 22,
    fontWeight: "900",
    color: "black",
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
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
  },
  imagePicker: {
    height: 105, // Marginally scaled for immediate visibility layout parameters
    width: "100%",
    borderRadius: 16,
    borderStyle: "dashed",
    borderWidth: 2,
    borderColor: "#CBD5E1",
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadedImage: {
    width: "100%",
    height: "100%",
    borderRadius: 14,
  },
  uploadPlaceholder: {
    alignItems: "center",
  },
  uploadText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#64748B",
    marginTop: 4,
  },
  horizontalScrollPadding: {
    paddingRight: 4,
    gap: 12,
  },
  designWrapper: {
    alignItems: "center",
    width: 64,
  },
  designOption: {
    width: 64,
    height: 60,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    padding: 2,
    backgroundColor: "#F8FAFC",
  },
  selectedDesign: {
    borderColor: "#38BDF8",
    borderWidth: 2.5,
  },
  designImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  designLabel: {
    fontSize: 10,
    fontWeight: "500",
    color: "#64748B",
    marginTop: 4,
    textAlign: "center",
    width: "100%",
  },
  selectedDesignLabel: {
    color: "#0284C7",
    fontWeight: "700",
  },
  inputContainer: {
    flexDirection: "row",
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 12,
    backgroundColor: "#F8FAFC",
    height: 48,
    alignItems: "center",
    shadowColor: "#38BDF8",
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 6,
    elevation: 5,
  },
  iconContainer: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#1E293B",
    height: "100%",
  },
  customButton: {
    backgroundColor: "#A7F3D0",
    borderRadius: 16,
    height: 48,
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
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});

export default CreateFlashcardModal;
