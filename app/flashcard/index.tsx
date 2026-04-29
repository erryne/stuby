import { router } from "expo-router";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ImageBackground,
  ScrollView,
  Text,
  View,
} from "react-native";

import AddFloatingButton from "@/components/AddFloatingButton";
import DeleteFlashcardFolderModal from "@/components/DeleteFlashcardFolderModal";
import FlashcardFolderCard from "@/components/FlashcardFolderCard";
import { auth, db } from "../../firebaseConfig"; // Ensure this path is correct

const { width } = Dimensions.get("window");

interface FlashcardFolder {
  id: string;
  text: string;
  image: { uri: string } | null;
}

export default function FlashcardFolderScreen() {
  const [flashcardFolders, setFlashcardFolders] = useState<FlashcardFolder[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  const [popupVisibleFolderId, setPopupVisibleFolderId] = useState<
    string | null
  >(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);

  // 1. REAL-TIME DATABASE LISTENER
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Listen to the "flashcardFolders" collection for this specific user
    const q = query(
      collection(db, "flashcardFolders"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const folders = snapshot.docs.map((doc) => ({
          id: doc.id,
          text: doc.data().title,
          image: doc.data().coverPhoto ? { uri: doc.data().coverPhoto } : null,
        })) as FlashcardFolder[];

        setFlashcardFolders(folders);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore Subscription Error:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const handleFolderPress = (folderId: string) => {
    router.push({
      pathname: "/flashcard/flashcardItems",
      params: { folderId },
    });
  };

  const confirmDeleteFolder = (folderId: string) => {
    setFolderToDelete(folderId);
    setDeleteModalVisible(true);
    setPopupVisibleFolderId(null);
  };

  // 2. DELETE FROM DATABASE
  const handleDeleteFolder = async () => {
    if (!folderToDelete) return;
    try {
      await deleteDoc(doc(db, "flashcardFolders", folderToDelete));
      setDeleteModalVisible(false);
      setFolderToDelete(null);
    } catch (error) {
      console.error("Error deleting folder:", error);
    }
  };

  const handleEditFolder = (folderId: string) => {
    const folderToEdit = flashcardFolders.find((f) => f.id === folderId);
    router.push({
      pathname: "/flashcard/updateFlashcardFolder",
      params: {
        editId: folderId,
        currentTitle: folderToEdit?.text,
      },
    });
    setPopupVisibleFolderId(null);
  };

  return (
    <ImageBackground
      source={require("../../assets/images/flashcardBg.png")}
      className="flex-1"
      resizeMode="cover"
    >
      <Text
        className="text-[#FDE6B1] mt-12 mb-8 text-4xl font-black text-center tracking-widest"
        style={{
          textShadowColor: "rgba(0, 0, 0, 0.4)",
          textShadowOffset: { width: 2, height: 2 },
          textShadowRadius: 4,
        }}
      >
        FLASHCARD
      </Text>

      {loading ? (
        <View className="flex-1 justify-center">
          <ActivityIndicator size="large" color="#FDE6B1" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ alignItems: "center", paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {flashcardFolders.map((folder) => (
            <View
              key={folder.id}
              className="overflow-hidden rounded-2xl shadow-md mb-4"
              style={{ width: width * 0.9, height: 180 }}
            >
              <FlashcardFolderCard
                folderId={folder.id}
                text={folder.text}
                image={folder.image}
                isPopupVisible={popupVisibleFolderId === folder.id}
                setPopupVisibleFolder={setPopupVisibleFolderId}
                onFolderEdit={handleEditFolder}
                onFolderDelete={() => confirmDeleteFolder(folder.id)}
                onFolderPress={handleFolderPress}
              />
            </View>
          ))}
          {flashcardFolders.length === 0 && (
            <Text className="text-white opacity-60 mt-10">
              No folders yet. Tap + to create one!
            </Text>
          )}
        </ScrollView>
      )}

      <AddFloatingButton
        onPress={() => router.push("/flashcard/createFlashcardFolder")}
      />

      <DeleteFlashcardFolderModal
        visible={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        onConfirm={handleDeleteFolder}
      />
    </ImageBackground>
  );
}
