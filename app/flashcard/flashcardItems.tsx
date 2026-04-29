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
  ScrollView,
  Text,
  TouchableOpacity,
  View,
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

const { width } = Dimensions.get("window");

interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

const FlashcardItems = () => {
  const { folderId } = useLocalSearchParams(); // Get the ID of the deck we clicked
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [folderName, setFolderName] = useState("Loading...");
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);

  // 1. Fetch Folder Details (to get the title)
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

  // 2. Real-time Listener for Cards inside this Folder
  useEffect(() => {
    if (!folderId) return;

    // We assume cards are stored in a sub-collection: flashcardFolders -> folderId -> cards
    const cardsRef = collection(
      db,
      "flashcardFolders",
      folderId as string,
      "cards",
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
        cardId,
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
    <ImageBackground
      source={require("../../assets/images/flashcardBg.png")}
      className="flex-1"
      resizeMode="cover"
    >
      {/* HEADER */}
      <View className="flex-row items-center justify-between px-6 mt-12 mb-6">
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={28} color="#ffffff" />
        </TouchableOpacity>

        <Text
          numberOfLines={1}
          className="text-3xl font-bold text-[#FDE6B1] text-center flex-1 px-2"
        >
          {folderName}
        </Text>

        <TouchableOpacity onPress={() => setEditing(!editing)}>
          {editing ? (
            <View className="bg-[#06402B] p-1 rounded-full">
              <Check size={24} color="white" />
            </View>
          ) : (
            <Pencil size={24} color="white" />
          )}
        </TouchableOpacity>
      </View>

      {/* PLAY BUTTON */}
      <View className="flex-row justify-end px-6 mb-4">
        <TouchableOpacity onPress={handlePlayFlashcard} disabled={loading}>
          <View className="bg-[#FFF9E5] rounded-full p-3 shadow-md">
            <Play size={30} fill="#000" color="#000" />
          </View>
        </TouchableOpacity>
      </View>

      {/* FLASHCARDS LIST */}
      {loading ? (
        <ActivityIndicator size="large" color="#FDE6B1" className="mt-10" />
      ) : (
        <ScrollView
          contentContainerStyle={{
            alignItems: "center",
            paddingBottom: 100,
          }}
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
            <Text className="text-white/60 mt-10 text-lg">Deck is empty</Text>
          )}
        </ScrollView>
      )}

      {/* FLOATING BUTTON */}
      <AddFloatingButton
        onPress={() =>
          router.push({
            pathname: "/flashcard/createFlashcardItem",
            params: { folderId }, // Pass folderId so the create screen knows where to save
          })
        }
      />
    </ImageBackground>
  );
};

export default FlashcardItems;
