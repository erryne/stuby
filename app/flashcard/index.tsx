import AddFloatingButton from "@/components/AddFloatingButton";
import CreateFlashcardModal from "@/components/CreateFlashcardModal";
import CustomHeader from "@/components/CustomHeader";
import { DeleteAlert } from "@/components/DeleteAlert";
import FlashcardFolderCard from "@/components/FlashcardFolderCard";
import GeometricBackground from "@/components/GeometricBackground";
import SearchBar from "@/components/SearchBar";
import TitleHeader from "@/components/TitleHeader";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  UIManager,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../../firebaseConfig";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface FlashcardFolder {
  id: string;
  text: string;
  image: any;
  design?: string;
  cardCount: number;
  isFavorite: boolean;
}

export default function FlashcardFolderScreen() {
  const { width } = useWindowDimensions();
  const [flashcardFolders, setFlashcardFolders] = useState<FlashcardFolder[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [popupVisibleFolderId, setPopupVisibleFolderId] = useState<
    string | null
  >(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<{
    id: string;
    title: string;
    isFavorite: boolean;
  } | null>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editingDeck, setEditingDeck] = useState<any>(null);

  const [search, setSearch] = useState("");
  const filteredFolders = flashcardFolders.filter((folder) =>
    folder.text.toLowerCase().includes(search.toLowerCase()),
  );

  const numColumns = width > 600 ? 2 : 1;

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "flashcardFolders"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const folders = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          text: data.title || "Untitled Folder",
          image: data.coverPhoto ? { uri: data.coverPhoto } : null,
          design: data.design,
          cardCount: typeof data.cardCount === "number" ? data.cardCount : 0,
          isFavorite: !!data.isFavorite,
        };
      });

      const sortedFolders = folders.sort(
        (a, b) => Number(b.isFavorite) - Number(a.isFavorite),
      );

      if (loading) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
      }

      setFlashcardFolders(sortedFolders);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [loading]);

  const handleFolderPress = (folderId: string) => {
    router.push({
      pathname: "/flashcard/flashcardItems",
      params: { folderId },
    });
  };

  const handleDeleteFolder = async () => {
    if (!folderToDelete) return;
    const user = auth.currentUser;
    if (!user) return;

    try {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

      const batch = writeBatch(db);

      // 1. Delete Cards
      const cardsQuery = query(
        collection(db, "cards"),
        where("folderId", "==", folderToDelete.id),
        where("userId", "==", user.uid),
      );
      const querySnapshot = await getDocs(cardsQuery);
      querySnapshot.forEach((doc) => batch.delete(doc.ref));

      // 2. Delete Folder
      batch.delete(doc(db, "flashcardFolders", folderToDelete.id));

      // 3. Conditional Favorite Delete
      // Dito natin ilalagay ang if statement
      if (folderToDelete.isFavorite) {
        const favRef = doc(db, "favorites", `flashcard_${folderToDelete.id}`);
        batch.delete(favRef);
      }

      // I-commit lahat ng operations sa iisang batch
      await batch.commit();

      setDeleteModalVisible(false);
      setFolderToDelete(null);
    } catch (error) {
      console.error("Error deleting folder:", error);
    }
  };
  const handleEditFolder = (folderId: string) => {
    const folderToEdit = flashcardFolders.find((f) => f.id === folderId);
    if (folderToEdit) {
      setEditingDeck({
        id: folderId,
        title: folderToEdit.text,
        design: folderToEdit.design,
        coverPhoto: folderToEdit.image?.uri || null,
      });
      setCreateModalVisible(true);
    }
    setPopupVisibleFolderId(null);
  };

  const handleToggleFavorite = async (folderId: string) => {
    const user = auth.currentUser;
    if (!user) return;

    const currentFolder = flashcardFolders.find((f) => f.id === folderId);
    if (!currentFolder) return;

    const nextFavoriteState = !currentFolder.isFavorite;

    setFlashcardFolders((prevFolders) => {
      const updated = prevFolders.map((f) =>
        f.id === folderId ? { ...f, isFavorite: nextFavoriteState } : f,
      );
      return updated.sort(
        (a, b) => Number(b.isFavorite) - Number(a.isFavorite),
      );
    });

    try {
      const folderRef = doc(db, "flashcardFolders", folderId);
      const favoriteRef = doc(db, "favorites", `flashcard_${folderId}`);
      await updateDoc(folderRef, { isFavorite: nextFavoriteState });

      if (nextFavoriteState) {
        await setDoc(favoriteRef, {
          userId: user.uid,
          title: currentFolder.text,
          type: "flashcard",
          route: `/flashcard/flashcardItems?folderId=${folderId}`,
          design: currentFolder.design || "blue",
          coverPhoto: currentFolder.image?.uri || null,
          createdAt: new Date(),
        });
      } else {
        await deleteDoc(favoriteRef);
      }
    } catch (error) {
      console.error("Error toggling favorite status:", error);
    }
  };

  return (
    <LinearGradient
      colors={["#7DD3FC", "#38BDF8", "#0EA5E9"]}
      style={styles.container}
    >
      <StatusBar style="light" />
      <View style={StyleSheet.absoluteFillObject}>
        <GeometricBackground />
      </View>

      <SafeAreaView style={{ flex: 1 }}>
        <CustomHeader />
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.loadingText}>Loading Flashcards...</Text>
          </View>
        ) : (
          <>
            <FlatList
              key={numColumns}
              numColumns={numColumns}
              data={filteredFolders}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.scrollContent}
              columnWrapperStyle={numColumns > 1 ? styles.row : null}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={
                <View style={styles.headerContainer}>
                  <TitleHeader
                    title="FLASHCARD"
                    size="xl"
                    align="center"
                    color="#ffffff"
                    containerStyle={{ marginBottom: 20 }}
                    titleStyle={{
                      textShadowColor: "rgba(0,0,0,0.8)",
                      textShadowOffset: { width: 3, height: 3 },
                      textShadowRadius: 5,
                    }}
                  />

                  <SearchBar
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Search flashcard folders..."
                    containerStyle={styles.searchContainer}
                  />
                </View>
              }
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  No folders yet. Tap + to create one!
                </Text>
              }
              renderItem={({ item: folder }) => (
                <View
                  style={[
                    styles.cardWrapper,
                    { width: numColumns > 1 ? width / 2 - 24 : width * 0.9 },
                  ]}
                >
                  <FlashcardFolderCard
                    folderId={folder.id}
                    text={folder.text}
                    cardCount={folder.cardCount}
                    image={folder.image}
                    design={folder.design}
                    isPopupVisible={popupVisibleFolderId === folder.id}
                    isFavorite={folder.isFavorite}
                    setPopupVisibleFolder={setPopupVisibleFolderId}
                    onFolderEdit={handleEditFolder}
                    onFolderDelete={() => {
                      setFolderToDelete({
                        id: folder.id,
                        title: folder.text,
                        isFavorite: folder.isFavorite,
                      });
                      setDeleteModalVisible(true);
                      setPopupVisibleFolderId(null);
                    }}
                    onFolderPress={handleFolderPress}
                    onToggleFavorite={handleToggleFavorite}
                  />
                </View>
              )}
            />
            <AddFloatingButton
              onPress={() => {
                setEditingDeck(null);
                setCreateModalVisible(true);
              }}
            />
          </>
        )}
      </SafeAreaView>

      <DeleteAlert
        visible={deleteModalVisible}
        title={`Delete "${folderToDelete?.title || "Folder"}"?`}
        message="Are you sure you want to delete this flashcard folder? This action cannot be undone."
        onCancel={() => {
          setDeleteModalVisible(false);
          setFolderToDelete(null);
        }}
        onConfirm={handleDeleteFolder}
      />
      <CreateFlashcardModal
        visible={createModalVisible}
        onClose={() => {
          setCreateModalVisible(false);
          setEditingDeck(null);
        }}
        deckToEdit={editingDeck}
      />
    </LinearGradient>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1 },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  scrollContent: {
    paddingBottom: 120,
  },

  row: {
    justifyContent: "center",
    gap: 16,
  },

  cardWrapper: {
    height: 180,
    marginBottom: 16,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },

  loadingText: {
    color: "#ffffff",
    marginTop: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  emptyText: {
    color: "#ffffff",
    opacity: 0.8,
    marginTop: 40,
    fontWeight: "700",
    textAlign: "center",
  },

  headerContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },

  searchContainer: {
    width: "90%",
    alignSelf: "center",
  },
});
