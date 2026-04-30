import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

// Firebase Config
import EditDeletePopUp from "../../components/EditDeletePopUp";
import GreenButton from "../../components/GreenButton";
import { auth, db } from "../../firebaseConfig";

export default function AddNoteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const user = auth.currentUser;

  // States
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Controls View vs Edit mode
  const [isEditing, setIsEditing] = useState(false);

  /* ---------------- LOAD INITIAL DATA ---------------- */
  useEffect(() => {
    if (params.title)
      setTitle(Array.isArray(params.title) ? params.title[0] : params.title);
    if (params.content)
      setContent(
        Array.isArray(params.content) ? params.content[0] : params.content,
      );

    if (params.mode !== "edit") {
      setIsEditing(true);
    }
  }, [params.title, params.content, params.mode]);

  /* ---------------- SAVE / UPDATE LOGIC ---------------- */
  const handleSaveOrUpdate = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert(
        "Empty Fields",
        "Please provide both a title and some content.",
      );
      return;
    }
    setLoading(true);
    try {
      if (params.mode === "edit" && params.id) {
        await updateDoc(doc(db, "notes", params.id as string), {
          title: title.trim(),
          content: content.trim(),
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "notes"), {
          userId: user?.uid,
          title: title.trim(),
          content: content.trim(),
          createdAt: serverTimestamp(),
        });
      }
      router.back();
    } catch (error) {
      Alert.alert("Error", "Could not save the note.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- DELETE LOGIC ---------------- */
  const handleDelete = async () => {
    if (!params.id) return;
    setLoading(true);
    try {
      await deleteDoc(doc(db, "notes", params.id as string));
      setShowDeleteModal(false);
      router.back();
    } catch (error) {
      Alert.alert("Error", "Could not delete the note.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/images/notepadBg.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            {/* Header Row */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <TouchableOpacity
                  onPress={() => router.back()}
                  style={styles.backButton}
                >
                  <Ionicons name="chevron-back" size={35} color="#FDE6B1" />
                </TouchableOpacity>

                <TextInput
                  placeholder="ENTER TITLE"
                  placeholderTextColor="rgba(253, 230, 177, 0.5)"
                  value={title}
                  onChangeText={setTitle}
                  editable={isEditing}
                  style={styles.titleInput}
                />
              </View>

              <View style={styles.headerRight}>
                {isEditing ? (
                  <View style={styles.buttonContainer}>
                    {loading ? (
                      <ActivityIndicator size="small" color="#80CF8F" />
                    ) : (
                      <GreenButton
                        title={params.mode === "edit" ? "UPDATE" : "SAVE"}
                        onPress={handleSaveOrUpdate}
                        fontSize={12}
                        borderRadius={20}
                        // Center-middle is now handled internally by GreenButton
                      />
                    )}
                  </View>
                ) : (
                  <View style={{ zIndex: 50 }}>
                    <TouchableOpacity onPress={() => setShowMenu(!showMenu)}>
                      <Ionicons
                        name="ellipsis-horizontal"
                        size={30}
                        color="#FDE6B1"
                      />
                    </TouchableOpacity>

                    {showMenu && (
                      <EditDeletePopUp
                        onEdit={() => {
                          setIsEditing(true);
                          setShowMenu(false);
                        }}
                        onDelete={() => {
                          setShowMenu(false);
                          setShowDeleteModal(true);
                        }}
                      />
                    )}
                  </View>
                )}
              </View>
            </View>

            {/* Note Input Area */}
            <View style={styles.noteArea}>
              <TextInput
                multiline
                placeholder="Enter notes......."
                textAlignVertical="top"
                value={content}
                onChangeText={setContent}
                editable={isEditing}
                style={styles.contentInput}
              />
            </View>

            {/* DELETE MODAL */}
            <Modal transparent visible={showDeleteModal} animationType="fade">
              <Pressable
                style={styles.modalOverlay}
                onPress={() => setShowDeleteModal(false)}
              >
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Delete Note</Text>
                  <Text style={styles.modalSubText}>
                    Are you sure you want to delete this note?
                  </Text>

                  <View style={styles.warningBox}>
                    <Ionicons
                      name="warning-outline"
                      size={20}
                      color="#FDE6B1"
                    />
                    <View style={{ marginLeft: 10, flex: 1 }}>
                      <Text style={styles.warningTitle}>Warning!</Text>
                      <Text style={styles.warningText}>
                        Once deleted, you will no longer be able to retrieve
                        this note.
                      </Text>
                    </View>
                  </View>

                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      onPress={handleDelete}
                      style={styles.deleteBtn}
                    >
                      <Text style={styles.btnText}>Delete</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setShowDeleteModal(false)}
                      style={styles.cancelBtn}
                    >
                      <Text style={[styles.btnText, { color: "#3D435C" }]}>
                        Cancel
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Pressable>
            </Modal>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 50,
    marginBottom: 20,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  headerRight: {
    minWidth: 80,
    height: 40, // Height to align with the text input
    justifyContent: "center",
    alignItems: "flex-end",
  },
  buttonContainer: {
    width: 76, // Match the exact width of your GreenButton
    height: 33, // Match the exact height of your GreenButton
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: { marginRight: 8 },
  titleInput: {
    color: "#FDE6B1",
    fontSize: 24,
    fontWeight: "900",
    flex: 1,
    textTransform: "uppercase",
  },
  noteArea: {
    flex: 1,
    marginHorizontal: 20,
    marginBottom: 40,
    backgroundColor: "#FFF9E3",
    borderRadius: 40,
    padding: 24,
  },
  contentInput: { flex: 1, color: "#502707", fontSize: 18, lineHeight: 28 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  modalContent: {
    backgroundColor: "#6B728E",
    width: "100%",
    borderRadius: 30,
    padding: 24,
  },
  modalTitle: {
    textAlign: "center",
    color: "white",
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 8,
  },
  modalSubText: {
    textAlign: "center",
    color: "#D1D5DB",
    fontSize: 14,
    marginBottom: 16,
  },
  warningBox: {
    backgroundColor: "#3D435C",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    marginBottom: 24,
  },
  warningTitle: { color: "#FDE6B1", fontWeight: "bold", fontSize: 12 },
  warningText: { color: "#D1D5DB", fontSize: 10 },
  modalButtons: { flexDirection: "row", justifyContent: "center", gap: 15 },
  deleteBtn: {
    backgroundColor: "#FF5A5F",
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 25,
  },
  cancelBtn: {
    backgroundColor: "white",
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 25,
  },
  btnText: { color: "white", fontWeight: "900" },
});
