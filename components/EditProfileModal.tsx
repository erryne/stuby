import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { doc, getDoc, setDoc } from "firebase/firestore";
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

const defaultProfileImage = require("../assets/images/defaultProfile.png");

interface Props {
  visible: boolean;
  onClose: () => void;
  onSaveSuccess: () => void;
  onChangePasswordTrigger: () => void;
}

const EditProfileModal = ({
  visible,
  onClose,
  onSaveSuccess,
  onChangePasswordTrigger,
}: Props) => {
  const user = auth.currentUser;
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profileImage, setProfileImage] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Track whether the keyboard is open
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const scaleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  // Keyboard Event Listeners to toggle scrolling
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
      fetchUserData();
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          friction: 8,
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

  const fetchUserData = async () => {
    if (!user) return;
    try {
      const docSnap = await getDoc(doc(db, "users", user.uid));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFirstName(data.firstName || "");
        setLastName(data.lastName || "");
        setProfileImage(data.profileImage ? { uri: data.profileImage } : null);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      let finalImageUrl = profileImage?.uri;

      if (profileImage?.uri?.startsWith("file://")) {
        const response = await fetch(profileImage.uri);
        const blob = await response.blob();
        const fileRef = ref(storage, `profiles/${user.uid}.jpg`);
        await uploadBytes(fileRef, blob);
        finalImageUrl = await getDownloadURL(fileRef);
      }

      await setDoc(
        doc(db, "users", user.uid),
        {
          firstName: firstName,
          lastName: lastName,
          profileImage: finalImageUrl || null,
        },
        { merge: true },
      );

      onClose();
      onSaveSuccess();
      showAlert("Success", "Profile updated successfully!");
    } catch (e) {
      console.error("Save Error:", e);
      showAlert("Error", "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        statusBarTranslucent
        animationType="none"
        onRequestClose={onClose}
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
                <View style={styles.header}>
                  <Text style={styles.headerText}>Edit Profile</Text>
                  <TouchableOpacity
                    onPress={onClose}
                    style={styles.closeButton}
                  >
                    <Feather name="x" size={22} />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  scrollEnabled={isKeyboardVisible}
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                  bounces={isKeyboardVisible} // Prevents awkward pulling effects when locked
                >
                  <TouchableOpacity
                    onPress={async () => {
                      const res = await ImagePicker.launchImageLibraryAsync({
                        allowsEditing: true,
                        aspect: [1, 1],
                        quality: 0.5,
                      });
                      if (!res.canceled)
                        setProfileImage({ uri: res.assets[0].uri });
                    }}
                    style={styles.imageWrapper}
                  >
                    <Image
                      source={
                        profileImage
                          ? { uri: profileImage.uri }
                          : defaultProfileImage
                      }
                      style={styles.profilePic}
                    />
                    <View style={styles.pencilOverlay}>
                      <Feather name="edit-2" size={20} color="white" />
                    </View>
                  </TouchableOpacity>

                  <View style={styles.inputSection}>
                    <Text style={styles.label}>First Name</Text>
                    <TextInput
                      style={styles.input}
                      value={firstName}
                      onChangeText={setFirstName}
                      placeholder="Enter first name"
                    />
                    <Text style={styles.label}>Last Name</Text>
                    <TextInput
                      style={styles.input}
                      value={lastName}
                      onChangeText={setLastName}
                      placeholder="Enter last name"
                    />
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                      style={[
                        styles.input,
                        { backgroundColor: "#F1F5F9", color: "#64748B" },
                      ]}
                      value={user?.email || ""}
                      editable={false}
                    />
                  </View>

                  <TouchableOpacity
                    style={styles.changePassBtn}
                    onPress={() => {
                      onClose();
                      onChangePasswordTrigger();
                    }}
                  >
                    <Text style={styles.changePassText}>Change Password</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.saveBtn}
                    onPress={saveProfile}
                    disabled={saving}
                  >
                    {saving ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.saveText}>Save Changes</Text>
                    )}
                  </TouchableOpacity>
                </ScrollView>
              </Animated.View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </Animated.View>
      </Modal>

      {/* Custom Alert */}
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15, // Responsive padding base
    flexShrink: 1, // Shrinks dynamically to prevent layout breaks on small screens
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15, // Tighter margin for responsive baseline
  },
  headerText: { fontSize: 20, fontWeight: "800" },
  closeButton: { padding: 5, backgroundColor: "#F1F5F9", borderRadius: 15 },
  scrollContent: {
    alignItems: "center",
    paddingBottom: 5,
  },
  imageWrapper: {
    width: 90, // Marginally scaled down to optimize initial viewport
    height: 90,
    borderRadius: 45,
    overflow: "hidden",
    marginBottom: 15,
  },
  profilePic: { width: "100%", height: "100%" },
  pencilOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  inputSection: { width: "100%", gap: 6 }, // Slightly optimized gap spacing
  label: { fontWeight: "600", color: "#64748B", marginLeft: 5, fontSize: 13 },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 12, // Compact padding for a responsive look
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
  },
  changePassBtn: { alignSelf: "flex-end", marginTop: 8 },
  changePassText: {
    color: "#CB4848",
    fontWeight: "bold",
    textDecorationLine: "underline",
    fontSize: 13,
  },
  saveBtn: {
    width: "100%",
    backgroundColor: "#80CF8F",
    padding: 14,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 15,
  },
  saveText: { color: "white", fontWeight: "bold" },
});

export default EditProfileModal;
