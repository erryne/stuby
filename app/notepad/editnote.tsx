import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ImageBackground,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";

// Firebase Config
import { db } from "../../firebaseConfig";

export default function EditNoteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. Properly handle params to ensure they are strings and not arrays
  useEffect(() => {
    if (params.title) {
      setTitle(Array.isArray(params.title) ? params.title[0] : params.title);
    }
    if (params.content) {
      setContent(
        Array.isArray(params.content) ? params.content[0] : params.content,
      );
    }
  }, [params.title, params.content]);

  /* ---------------- LOGIC: UPDATE DATABASE ---------------- */
  const handleUpdate = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert("Wait!", "Title and content cannot be empty.");
      return;
    }

    if (!params.id) {
      Alert.alert("Error", "Note ID is missing.");
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
      router.back();
    } catch (error) {
      console.error("Update Error:", error);
      Alert.alert("Error", "Failed to update the note.");
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
          <View style={styles.container} pointerEvents="box-none">
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
                  placeholder="Title"
                  placeholderTextColor="rgba(253, 230, 177, 0.5)"
                  value={title}
                  onChangeText={setTitle}
                  style={styles.titleInput}
                />
              </View>

              <TouchableOpacity
                onPress={handleUpdate}
                disabled={loading}
                style={[
                  styles.updateButton,
                  { backgroundColor: loading ? "#9ca3af" : "#7ED992" },
                ]}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#1D1D1D" />
                ) : (
                  <Text style={styles.updateText}>UPDATE</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Paper Note Area */}
            <View style={styles.noteArea} pointerEvents="box-none">
              <TextInput
                multiline
                placeholder="Start writing..."
                textAlignVertical="top"
                value={content}
                onChangeText={setContent}
                style={styles.contentInput}
                scrollEnabled={true}
                // Ensure editable is true by default
                editable={!loading}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 50,
    marginBottom: 20,
    zIndex: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  backButton: {
    marginRight: 8,
  },
  titleInput: {
    color: "#FDE6B1",
    fontSize: 24,
    fontWeight: "900",
    flex: 1,
    paddingVertical: 5,
  },
  updateButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  updateText: {
    color: "#1D1D1D",
    fontWeight: "900",
    fontSize: 12,
  },
  noteArea: {
    flex: 1,
    marginHorizontal: 20,
    marginBottom: 40,
    backgroundColor: "#FFF9E3",
    borderRadius: 40,
    padding: 24,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    zIndex: 10,
  },
  contentInput: {
    flex: 1,
    color: "#502707",
    fontSize: 18,
    lineHeight: 28,
    // Ensures the tap area fills the entire paper
    height: "100%",
  },
});
