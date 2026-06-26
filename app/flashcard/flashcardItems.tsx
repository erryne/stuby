import AddFloatingButton from "@/components/AddFloatingButton";
import CreateFlashcardItemModal from "@/components/CreateFlashcardItemModal";
import CustomHeader from "@/components/CustomHeader";
import { DeleteAlert } from "@/components/DeleteAlert";
import FlashcardItemCard from "@/components/FlashcardItemCard";
import GeometricBackground from "@/components/GeometricBackground";
import SearchBar from "@/components/SearchBar"; // Imported SearchBar
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  increment,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { Check, Pencil, Play } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  LayoutAnimation,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../../firebaseConfig";

interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

const FlashcardItems = () => {
  const { width } = useWindowDimensions();
  const { folderId } = useLocalSearchParams();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [folderData, setFolderData] = useState<any>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [searchQuery, setSearchQuery] = useState(""); // Added search state

  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<{
    id: string;
    label: string;
  } | null>(null);

  const tickerAnim = useRef(new Animated.Value(0)).current;
  const [containerWidth, setContainerWidth] = useState(0);
  const [textWidth, setTextWidth] = useState(0);

  const titleText = folderData?.title || "Loading";
  const isLongText = containerWidth > 0 && textWidth > containerWidth + 5;
  const spacerWidth = 60;

  // Filter logic looking into both question and answer fields
  const filteredFlashcards = flashcards.filter(
    (card) =>
      card.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.answer.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  useEffect(() => {
    if (!folderId) return;

    const fetchFolderData = async () => {
      try {
        const docRef = doc(db, "flashcardFolders", folderId as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setFolderData(docSnap.data());
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchFolderData();

    const user = auth.currentUser;
    const cardsRef = collection(db, "cards");
    const q = query(
      cardsRef,
      where("folderId", "==", folderId),
      where("userId", "==", user!.uid),
      orderBy("createdAt", "asc"),
    );

    return onSnapshot(q, (snapshot) => {
      setFlashcards(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Flashcard[],
      );
      setLoading(false);
    });
  }, [folderId]);

  useEffect(() => {
    tickerAnim.setValue(0);
    if (isLongText) {
      const scrollDistance = textWidth + spacerWidth;
      const loop = Animated.loop(
        Animated.timing(tickerAnim, {
          toValue: -scrollDistance,
          duration: (scrollDistance / 50) * 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      );
      loop.start();
      return () => loop.stop();
    }
  }, [textWidth, containerWidth, isLongText]);

  const executeDeleteCard = async () => {
    if (!cardToDelete) return;
    const previousCards = [...flashcards];
    setFlashcards((prev) => prev.filter((c) => c.id !== cardToDelete.id));

    try {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      await deleteDoc(doc(db, "cards", cardToDelete.id));
      await updateDoc(doc(db, "flashcardFolders", folderId as string), {
        cardCount: increment(-1),
      });
      setDeleteModalVisible(false);
      setCardToDelete(null);
    } catch (error) {
      console.error(error);
      setFlashcards(previousCards);
    }
  };

  return (
    <LinearGradient
      colors={["#7DD3FC", "#38BDF8", "#0EA5E9"]}
      style={styles.flex1}
    >
      <View style={StyleSheet.absoluteFillObject}>
        <GeometricBackground />
      </View>

      <View style={styles.hiddenTextRig}>
        <Text
          onLayout={(e) => setTextWidth(e.nativeEvent.layout.width)}
          style={styles.measurementStyle}
          numberOfLines={1}
        >
          {titleText}
        </Text>
      </View>

      <SafeAreaView style={styles.flex1}>
        <CustomHeader />
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.iconBtn}
          >
            <Ionicons name="chevron-back" size={24} color="#334155" />
          </TouchableOpacity>

          <View
            style={styles.titleContainerFrame}
            onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
          >
            {isLongText ? (
              <Animated.View
                style={[
                  styles.animatedTrack,
                  {
                    width: (textWidth + spacerWidth) * 2,
                    transform: [{ translateX: tickerAnim }],
                  },
                ]}
              >
                <Text style={styles.textBaseStyle} numberOfLines={1}>
                  {titleText}
                </Text>
                <View style={{ width: spacerWidth }} />
                <Text style={styles.textBaseStyle} numberOfLines={1}>
                  {titleText}
                </Text>
              </Animated.View>
            ) : (
              <Text
                style={[styles.textBaseStyle, styles.textCenterFix]}
                numberOfLines={1}
              >
                {titleText}
              </Text>
            )}
          </View>

          <View style={styles.rightActions}>
            <TouchableOpacity
              onPress={() =>
                flashcards.length > 0 &&
                router.push({
                  pathname: "/flashcard/playFlashcard",
                  params: { folderId, design: folderData?.design },
                })
              }
              disabled={loading || flashcards.length === 0}
            >
              <Play size={24} fill="#334155" color="#334155" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEditing(!editing)}>
              {editing ? (
                <View style={styles.checkBtn}>
                  <Check size={18} color="#334155" />
                </View>
              ) : (
                <Pencil size={22} color="#334155" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Added Search Bar right under the custom header line layout */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search items by question or answer..."
          containerStyle={styles.searchContainer}
        />

        {loading ? (
          <ActivityIndicator size="large" color="#ffffff" style={styles.mt10} />
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {filteredFlashcards.map((card, index) => (
              <View
                key={card.id}
                style={[
                  styles.cardWrapper,
                  { width: width > 600 ? "70%" : "95%" },
                ]}
              >
                <TouchableOpacity
                  activeOpacity={editing ? 0.7 : 1}
                  onPress={() =>
                    editing && (setEditingCard(card), setAddModalVisible(true))
                  }
                  style={styles.flex1}
                >
                  {/* Note: Passed searchQuery down to the card component */}
                  <FlashcardItemCard
                    folderId={folderId as string}
                    questionNumber={index + 1}
                    question={card.question}
                    answer={card.answer}
                    isEditing={editing}
                    searchQuery={searchQuery}
                    onDelete={() => {
                      setCardToDelete({ id: card.id, label: card.question });
                      setDeleteModalVisible(true);
                    }}
                    design={folderData?.design}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>

      <AddFloatingButton
        onPress={() => {
          setEditingCard(null);
          setAddModalVisible(true);
        }}
      />
      <CreateFlashcardItemModal
        visible={isAddModalVisible}
        folderId={folderId as string}
        design={folderData?.design}
        cardToEdit={editingCard}
        onClose={() => setAddModalVisible(false)}
      />
      <DeleteAlert
        visible={deleteModalVisible}
        title="Delete Flashcard"
        message="Are you sure?"
        onCancel={() => setDeleteModalVisible(false)}
        onConfirm={executeDeleteCard}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  mt10: { marginTop: 40 },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 10,
    marginTop: 10,
  },
  iconBtn: { padding: 8, backgroundColor: "white", borderRadius: 12 },
  titleContainerFrame: { flex: 1, overflow: "hidden", marginHorizontal: 12 },
  rightActions: { flexDirection: "row", alignItems: "center", gap: 15 },
  textBaseStyle: { fontSize: 24, fontWeight: "900", color: "#334155" },
  textCenterFix: { textAlign: "center" },
  animatedTrack: { flexDirection: "row", alignItems: "center" },
  checkBtn: { backgroundColor: "white", padding: 6, borderRadius: 20 },
  scrollContent: {
    alignItems: "center",
    paddingBottom: 100,
    width: "100%",
    marginTop: 10,
  },
  cardWrapper: { alignItems: "center", marginBottom: 12 },
  hiddenTextRig: {
    position: "absolute",
    top: -9999,
    opacity: 0,
    marginBottom: 10,
  },
  measurementStyle: { fontSize: 24, fontWeight: "900" },
  searchContainer: {
    width: "90%",
    alignSelf: "center",
    marginBottom: 10,
  },
});

export default FlashcardItems;
