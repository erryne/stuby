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
  StyleSheet,
  Text,
  View,
} from "react-native";

import AddFloatingButton from "@/components/AddFloatingButton";
import DeleteFlashcardFolderModal from "@/components/DeleteFlashcardFolderModal";
import FlashcardFolderCard from "@/components/FlashcardFolderCard";
import TitleHeader from "../../components/TitleHeader";
import { auth, db } from "../../firebaseConfig";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface FlashcardFolder {
  id: string;
  text: string;
  image: { uri: string } | null;
}

export default function FlashcardFolderScreen() {
  const [flashcardFolders, setFlashcardFolders] = useState<FlashcardFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [popupVisibleFolderId, setPopupVisibleFolderId] = useState<string | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "flashcardFolders"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
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
      }
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
    <View style={styles.container}>
      <ImageBackground
        source={require("../../assets/images/flashcardBg.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.contentContainer}>
          <TitleHeader image={require("../../assets/images/flashcardTitle.png")} />

          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#FDE6B1" />
            </View>
          ) : (
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {flashcardFolders.map((folder) => (
                <FlashcardFolderCard
                  key={folder.id}
                  folderId={folder.id}
                  text={folder.text}
                  image={folder.image}
                  isPopupVisible={popupVisibleFolderId === folder.id}
                  setPopupVisibleFolder={setPopupVisibleFolderId}
                  onFolderEdit={handleEditFolder}
                  onFolderDelete={() => confirmDeleteFolder(folder.id)}
                  onFolderPress={handleFolderPress}
                />
              ))}

              {flashcardFolders.length === 0 && (
                <Text style={styles.emptyText}>
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
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: "5%",
    marginTop: "5%",
    alignItems: "center",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
    width: "100%",
    marginTop: 10,
  },
  scrollContent: {
    paddingBottom: 100, // Space for the floating button
    alignItems: "center",
  },
  emptyText: {
    color: "white",
    opacity: 0.6,
    marginTop: 40,
    textAlign: "center",
  },
});