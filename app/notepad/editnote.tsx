import CustomHeader from "@/components/CustomHeader";
import { DeleteAlert } from "@/components/DeleteAlert";
import GeometricBackground from "@/components/GeometricBackground";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EditDeletePopUp from "../../components/EditDeletePopUp";
import { db } from "../../firebaseConfig";

export default function EditNoteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [noteData, setNoteData] = useState<any>(null); // State para sa note document

  // Fetch note data para makuha ang isFavorite status
  useEffect(() => {
    const fetchNote = async () => {
      if (!params.id) return;
      try {
        const docRef = doc(db, "notes", params.id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setNoteData(data);
          setTitle(data.title || "");
          setContent(data.content || "");
        }
      } catch (e) {
        console.error("Error fetching note:", e);
      }
    };
    fetchNote();
  }, [params.id]);

  useEffect(() => {
    if (params.mode === "edit") setIsEditing(true);
  }, [params.mode]);

  const handleUpdate = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert("Empty Fields", "Title and content cannot be empty.");
      return;
    }
    setLoading(true);
    try {
      const noteRef = doc(db, "notes", params.id as string);
      await updateDoc(noteRef, {
        title: title.trim(),
        content: content.trim(),
        updatedAt: serverTimestamp(),
      });
      setIsEditing(false);
      router.back();
    } catch (error) {
      Alert.alert("Error", "Could not update the note.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!params.id) return;
    const noteId = params.id as string;
    const favId = `note_${noteId}`;

    console.log("--- START DEBUGGING ---");
    console.log("Attempting to delete Note:", `notes/${noteId}`);
    console.log("Attempting to delete Favorite:", `favorites/${favId}`);

    setLoading(true);
    try {
      // 1. Delete Note
      await deleteDoc(doc(db, "notes", noteId));
      console.log("Note deleted successfully.");

      // 2. Delete Favorite (Directly)
      await deleteDoc(doc(db, "favorites", favId));
      console.log("Favorite delete command sent.");

      router.back();
    } catch (error) {
      // ITO ANG PINAKA-IMPORTANTE NA PART: Dito lalabas ang tunay na error message
      console.error("FIREBASE ERROR DETAILED:", JSON.stringify(error, null, 2));
      Alert.alert(
        "Error",
        "Check the console logs for the specific Firebase error.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#7DD3FC", "#38BDF8", "#0EA5E9"]}
      style={styles.flexOne}
    >
      <View style={StyleSheet.absoluteFillObject}>
        <GeometricBackground />
      </View>
      <SafeAreaView>
        <CustomHeader />
      </SafeAreaView>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flexOne}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.iconBtn}
              >
                <Ionicons name="chevron-back" size={28} color="#334155" />
              </TouchableOpacity>

              <View style={styles.titleWrapper}>
                <TextInput
                  placeholder="ENTER TITLE"
                  placeholderTextColor="rgba(51, 65, 85, 0.4)"
                  value={title}
                  onChangeText={setTitle}
                  editable={isEditing}
                  style={[styles.titleInput, { opacity: isEditing ? 1 : 0.8 }]}
                />
              </View>
            </View>

            <View style={styles.headerRight}>
              {isEditing ? (
                <TouchableOpacity
                  onPress={handleUpdate}
                  style={styles.customButton}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#065F46" />
                  ) : (
                    <Text style={styles.btnText}>UPDATE</Text>
                  )}
                </TouchableOpacity>
              ) : (
                <View style={styles.menuAnchorContainer}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setShowMenu(!showMenu)}
                    style={styles.menuIconButton}
                  >
                    <Ionicons
                      name="ellipsis-horizontal"
                      size={20}
                      color="#334155"
                    />
                  </TouchableOpacity>
                  {showMenu && (
                    <View style={styles.popupDropdownContainer}>
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
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>

          <View style={styles.noteArea}>
            <View style={styles.linesContainer}>
              {Array.from({ length: 40 }).map((_, i) => (
                <View key={i} style={styles.lineRow} />
              ))}
            </View>

            <ScrollView
              style={styles.flexOne}
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
              keyboardShouldPersistTaps="handled"
            >
              <TextInput
                multiline
                placeholder="Enter notes...."
                placeholderTextColor="rgba(51, 65, 85, 0.4)"
                textAlignVertical="top"
                value={content}
                onChangeText={setContent}
                editable={isEditing}
                style={styles.contentInput}
              />
            </ScrollView>
          </View>

          <DeleteAlert
            visible={showDeleteModal}
            title={`Delete "${title || "Note"}"?`}
            message="Are you sure you want to delete this note?"
            onCancel={() => setShowDeleteModal(false)}
            onConfirm={handleDelete}
          />
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flexOne: { flex: 1 },
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  headerRight: {
    minWidth: 90,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  iconBtn: {
    padding: 8,
    backgroundColor: "white",
    borderRadius: 12,
    marginRight: 12,
  },
  titleWrapper: { flex: 1 },
  titleInput: {
    color: "#334155",
    fontSize: 24,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  customButton: {
    backgroundColor: "#A7F3D0",
    borderRadius: 16,
    height: 40,
    width: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  btnText: { color: "#065F46", fontWeight: "900", fontSize: 12 },
  menuAnchorContainer: { position: "relative", zIndex: 50 },
  menuIconButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  popupDropdownContainer: {
    position: "absolute",
    top: 10,
    right: 0,
    zIndex: 100,
  },
  noteArea: {
    flex: 1,
    marginHorizontal: 20,
    marginBottom: 40,
    backgroundColor: "#FEF9C3",
    borderRadius: 40,
    paddingHorizontal: 24,
    paddingTop: 16,
    borderWidth: 5,
    borderColor: "#FFFFFF",
    overflow: "hidden",
  },
  linesContainer: { ...StyleSheet.absoluteFillObject, paddingTop: 24 },
  lineRow: {
    height: 30,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(51, 65, 85, 0.08)",
  },
  contentInput: {
    color: "#334155",
    fontSize: 16,
    lineHeight: 30,
    flex: 1,
    textAlignVertical: "top",
  },
});
