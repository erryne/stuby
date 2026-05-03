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
    Modal,
    Pressable,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// Firebase Config
import EditDeletePopUp from "../../components/EditDeletePopUp";
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

  // Load existing data if in Edit Mode
  useEffect(() => {
    if (params.title) setTitle(params.title as string);
    if (params.content) setContent(params.content as string);
  }, [params]);

  /* ---------------- LOGIC: SAVE / UPDATE ---------------- */
  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert(
        "Empty Fields",
        "Please provide both a title and some content.",
      );
      return;
    }

    if (!user) {
      Alert.alert("Error", "You must be logged in to save notes.");
      return;
    }

    setLoading(true);
    try {
      if (params.mode === "edit" && params.id) {
        // UPDATE EXISTING NOTE
        const noteRef = doc(db, "notes", params.id as string);
        await updateDoc(noteRef, {
          title: title.trim(),
          content: content.trim(),
          updatedAt: serverTimestamp(),
        });
      } else {
        // CREATE NEW NOTE
        await addDoc(collection(db, "notes"), {
          userId: user.uid, // Foreign Key linking to current user
          title: title.trim(),
          content: content.trim(),
          createdAt: serverTimestamp(),
        });
      }
      router.back();
    } catch (error) {
      console.error("Firestore Save Error:", error);
      Alert.alert("Error", "Could not save the note.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- LOGIC: DELETE ---------------- */
  const handleDelete = async () => {
    if (!params.id) return;

    setLoading(true);
    try {
      await deleteDoc(doc(db, "notes", params.id as string));
      setShowDeleteModal(false);
      router.back();
    } catch (error) {
      console.error("Firestore Delete Error:", error);
      Alert.alert("Error", "Could not delete the note.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/images/notepadBg.png")}
      className="flex-1"
      resizeMode="cover"
    >
      <View className="flex-1">
        {/* Header Row */}
        <View className="flex-row items-center justify-between px-5 mt-4 mb-4">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={() => router.back()} className="mr-2">
              <Ionicons name="chevron-back" size={35} color="#FDE6B1" />
            </TouchableOpacity>

            <TextInput
              placeholder="Enter Title"
              placeholderTextColor="rgba(253, 230, 177, 0.5)"
              value={title}
              onChangeText={setTitle}
              className="text-[#FDE6B1] text-3xl font-[900] tracking-wider uppercase flex-1"
              style={{
                textShadowColor: "rgba(0, 0, 0, 0.4)",
                textShadowOffset: { width: 2, height: 2 },
                textShadowRadius: 4,
              }}
            />
          </View>

          {/* Conditional Header: Dots for existing notes, Save for new ones */}
          {params.mode === "edit" ? (
            <View className="flex-row items-center">
              <TouchableOpacity onPress={handleSave} className="mr-4">
                {loading ? (
                  <ActivityIndicator color="#7ED992" />
                ) : (
                  <Ionicons name="checkmark-done" size={30} color="#7ED992" />
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setShowMenu(!showMenu)}>
                <Ionicons
                  name="ellipsis-horizontal"
                  size={30}
                  color="#FDE6B1"
                />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              className="bg-[#7ED992] px-5 py-1.5 rounded-2xl shadow-md"
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#1D1D1D" />
              ) : (
                <Text className="text-[#1D1D1D] font-black">Save</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Dropdown Menu */}
        {showMenu && (
          <EditDeletePopUp
            onEdit={() => setShowMenu(false)}
            onDelete={() => {
              setShowMenu(false);
              setShowDeleteModal(true);
            }}
          />
        )}

        {/* Delete Modal */}
        <Modal transparent visible={showDeleteModal} animationType="fade">
          <Pressable className="flex-1 bg-black/60 justify-center items-center px-10">
            <View className="bg-[#6B728E] w-full rounded-[30px] p-6 shadow-2xl">
              <Text className="text-center text-white text-2xl font-black mb-2">
                Delete Note
              </Text>
              <Text className="text-center text-gray-200 text-sm mb-4">
                Are you sure you want to delete this note?
              </Text>

              <View className="bg-[#3D435C] rounded-xl p-3 flex-row items-start mb-6">
                <Ionicons name="warning-outline" size={20} color="#FDE6B1" />
                <View className="ml-2 flex-1">
                  <Text className="text-[#FDE6B1] font-bold text-xs uppercase">
                    Warning!
                  </Text>
                  <Text className="text-gray-300 text-[10px]">
                    Once deleted, you will no longer be able to retrieve this
                    note.
                  </Text>
                </View>
              </View>

              <View className="flex-row justify-center gap-4">
                <TouchableOpacity
                  onPress={handleDelete}
                  className="bg-[#FF5A5F] px-8 py-2 rounded-full"
                >
                  <Text className="text-white font-black">Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowDeleteModal(false)}
                  className="bg-white px-8 py-2 rounded-full"
                >
                  <Text className="text-[#3D435C] font-black">Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Modal>

        {/* Paper Note Area */}
        <View className="flex-1 mx-5 mb-10 bg-[#FFF9E3] rounded-[40px] shadow-2xl p-6">
          <TextInput
            multiline
            placeholder="Enter notes......."
            textAlignVertical="top"
            value={content}
            onChangeText={setContent}
            className="flex-1 text-[#502707] text-[18px] font-medium leading-7"
          />
        </View>
      </View>
    </ImageBackground>
  );
}
