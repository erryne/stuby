import AddFloatingButton from "@/components/AddFloatingButton";
import FlashcardItemCard from "@/components/FlashcardItemCard";
import { router, useLocalSearchParams } from "expo-router";
import { Check, ChevronLeft, Pencil, Play } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ImageBackground,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

// Firebase Imports
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

const FlashcardItems = () => {
  const { folderId } = useLocalSearchParams();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [folderName, setFolderName] = useState("Loading...");
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);

  useEffect(() => {
    if (!folderId) return;
    const fetchFolderName = async () => {
      const docRef = doc(db, "flashcardFolders", folderId as string);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setFolderName(docSnap.data().title);
      }
    };
    fetchFolderName();
  }, [folderId]);

  useEffect(() => {
    if (!folderId) return;
    const cardsRef = collection(
      db,
      "flashcardFolders",
      folderId as string,
      "cards"
    );
    const q = query(cardsRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Flashcard[];

      setFlashcards(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [folderId]);

  const handlePlayFlashcard = () => {
    if (flashcards.length === 0) {
      Alert.alert("Empty Deck", "Add some cards before playing!");
      return;
    }
    router.push({
      pathname: "/flashcard/playFlashcard",
      params: { folderId },
    });
  };

  const handleDeleteCard = async (cardId: string) => {
    try {
      const cardRef = doc(
        db,
        "flashcardFolders",
        folderId as string,
        "cards",
        cardId
      );
      await deleteDoc(cardRef);
    } catch (error) {
      console.error("Delete Error:", error);
    }
  };

  const handleEditCard = (cardId: string) => {
    router.push({
      pathname: "/flashcard/updateFlashcardItem",
      params: { folderId, cardId },
    });
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../assets/images/flashcardBg.png")}
        style={styles.background}
        resizeMode="cover"
      >
      

      {/* HEADER */}
      <View style={styles.header}>
        {/* Left Icon: Slot 1 */}
        <TouchableOpacity style={styles.headerSlot} onPress={() => router.back()}>
          <ChevronLeft size={28} color="#ffffff" />
        </TouchableOpacity>

        {/* Title: Slot 2 (Takes up double the space) */}
        <View style={styles.titleSlot}>
          <Text numberOfLines={1} style={styles.headerTitle}>
            {folderName}
          </Text>
        </View>

        {/* Right Icon: Slot 1 */}
        <TouchableOpacity style={styles.headerSlot} onPress={() => setEditing(!editing)}>
          {editing ? (
            <View style={styles.checkIconWrapper}>
              <Check size={24} color="white" />
            </View>
          ) : (
            <Pencil size={24} color="white" />
          )}
        </TouchableOpacity>
      </View>

      {/* PLAY BUTTON */}
      <View style={styles.playButtonRow}>
        <TouchableOpacity onPress={handlePlayFlashcard} disabled={loading}>
          <View style={styles.playButton}>
            <Play size={30} fill="#000" color="#000" />
          </View>
        </TouchableOpacity>
      </View>

      {/* FLASHCARDS LIST */}
      {loading ? (
        <ActivityIndicator size="large" color="#FDE6B1" style={styles.loader} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {flashcards.map((card, index) => (
            <TouchableOpacity
              key={card.id}
              activeOpacity={0.85}
              onPress={() => (editing ? null : handleEditCard(card.id))}
            >
              <FlashcardItemCard
                folderId={folderId as string}
                questionNumber={index + 1}
                question={card.question}
                answer={card.answer}
                isEditing={editing}
                onDelete={() => handleDeleteCard(card.id)}
              />
            </TouchableOpacity>
          ))}

          {flashcards.length === 0 && !loading && (
            <Text style={styles.emptyText}>Deck is empty</Text>
          )}
        </ScrollView>
      )}

      <AddFloatingButton
        onPress={() =>
          router.push({
            pathname: "/flashcard/createFlashcardItem",
            params: { folderId },
          })
        }
      />

      </ImageBackground>
    </View>
        
  );
};

export default FlashcardItems;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
 header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: "7%", 
    marginBottom: 24,
    width: '100%',
    paddingHorizontal: 16, // Add some padding here to push icons from edges
  },
  headerSlot: {
    flex: 1, // Icon slots
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSlot: {
    flex: 3, // Changed from 2 to 3 to give text more breathing room
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: SCREEN_WIDTH * 0.08, 
    fontWeight: "900",
    color: "#FFF9E5", 
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: -1,
    paddingVertical: 5, 
    textShadowColor: "#39675F",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 1,
    
    fontFamily: Platform.OS === 'ios' ? 'Arial Rounded MT Bold' : 'sans-serif-condensed',
  },
  checkIconWrapper: {
    backgroundColor: "#06402B",
    padding: 4,
    borderRadius: 999,
    alignItems: 'flex-start'
  },
  playButtonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  playButton: {
    backgroundColor: "#FFF9E5",
    borderRadius: 999,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loader: {
    marginTop: 40,
  },
  scrollContent: {
    alignItems: "center",
    paddingBottom: 80,
  },
  emptyText: {
    color: "rgba(255, 255, 255, 0.6)",
    marginTop: 40,
    fontSize: 18,
  },
});