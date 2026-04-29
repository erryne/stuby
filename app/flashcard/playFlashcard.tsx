import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  ImageBackground,
  PanResponder,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

// Firebase Imports
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../../firebaseConfig";

interface FlashcardData {
  id: string;
  front: string;
  back: string;
}

export default function PlayFlashcard() {
  const { height, width } = useWindowDimensions();
  const { folderId } = useLocalSearchParams();

  const [cards, setCards] = useState<FlashcardData[]>([]);
  const [initialCards, setInitialCards] = useState<FlashcardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [flipped, setFlipped] = useState(false);

  const cardHeight = height * 0.5;
  const cardWidth = width * 0.8;

  const pan = useRef(new Animated.ValueXY()).current;
  const flipAnim = useRef(new Animated.Value(0)).current;

  // --- DATABASE LOGIC ---
  useEffect(() => {
    const fetchCards = async () => {
      if (!folderId) return;

      try {
        const cardsRef = collection(
          db,
          "flashcardFolders",
          folderId as string,
          "cards",
        );
        const q = query(cardsRef, orderBy("createdAt", "asc"));
        const querySnapshot = await getDocs(q);

        const fetchedCards: FlashcardData[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          front: doc.data().question,
          back: doc.data().answer,
        }));

        // Always put the instruction card at the top
        const deckWithInstruction = [
          { id: "instruction", front: "instruction", back: "" },
          ...fetchedCards,
        ];

        setInitialCards(deckWithInstruction);
        setCards(deckWithInstruction);
      } catch (error) {
        console.error("Error fetching cards for play:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, [folderId]);

  // --- ANIMATION LOGIC ---
  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ["180deg", "360deg"],
  });

  const flipCard = () => {
    if (cards[0]?.front === "instruction") return;

    Animated.spring(flipAnim, {
      toValue: flipped ? 0 : 180,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();

    setFlipped(!flipped);
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 20,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gesture) => {
        if (Math.abs(gesture.dx) > 100) {
          Animated.timing(pan, {
            toValue: { x: gesture.dx > 0 ? width : -width, y: 0 },
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            pan.setValue({ x: 0, y: 0 });
            setCards((prev) => prev.slice(1));
            setFlipped(false);
            flipAnim.setValue(0);
          });
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  // --- PROGRESS CALCULATION ---
  const realCardsCount = initialCards.length - 1;
  const completedCards =
    initialCards.length -
    cards.length -
    (cards[0]?.front === "instruction" ? 0 : 1);
  const progress = cards[0]?.front === "instruction" ? 0 : completedCards + 1;
  const cardsLeft =
    cards[0]?.front === "instruction"
      ? realCardsCount
      : Math.max(0, realCardsCount - completedCards);

  if (loading) {
    return (
      <ImageBackground
        source={require("../../assets/images/flashcardBg.png")}
        className="flex-1 justify-center items-center"
      >
        <ActivityIndicator size="large" color="#FDE6B1" />
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require("../../assets/images/flashcardBg.png")}
      className="flex-1"
      resizeMode="cover"
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 mt-12">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#ffffff" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setCards(initialCards);
            setFlipped(false);
            flipAnim.setValue(0);
          }}
          className="flex-row items-center bg-[#FDE6B1] px-4 py-2 rounded-xl shadow-sm"
        >
          <Ionicons
            name="reload"
            size={18}
            color="#502707"
            style={{ marginRight: 5 }}
          />
          <Text className="text-[#502707] font-bold">Restart</Text>
        </TouchableOpacity>
      </View>

      {/* Cards Stack */}
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        {cards.length > 0 ? (
          <View style={{ height: cardHeight, width: cardWidth }}>
            {/* Background stack effect */}
            {cards
              .slice(1, 4)
              .reverse()
              .map((card, index) => (
                <View
                  key={card.id}
                  style={{
                    position: "absolute",
                    top: index * 5,
                    left: index * 2,
                    height: cardHeight,
                    width: cardWidth,
                    backgroundColor: "#FFF9EC",
                    borderRadius: 20,
                    opacity: 0.5,
                    elevation: 1,
                  }}
                />
              ))}

            {/* Active Swipeable Card */}
            <Animated.View
              {...panResponder.panHandlers}
              style={{
                transform: [
                  ...pan.getTranslateTransform(),
                  {
                    rotate: pan.x.interpolate({
                      inputRange: [-width, 0, width],
                      outputRange: ["-15deg", "0deg", "15deg"],
                    }),
                  },
                ],
                height: cardHeight,
                width: cardWidth,
              }}
            >
              <TouchableOpacity
                activeOpacity={1}
                onPress={flipCard}
                style={{ flex: 1 }}
              >
                {/* Front Side */}
                <Animated.View
                  style={{
                    position: "absolute",
                    backfaceVisibility: "hidden",
                    backgroundColor: "#FFF9EC",
                    height: cardHeight,
                    width: cardWidth,
                    borderRadius: 20,
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 20,
                    transform: [{ rotateY: frontInterpolate }],
                    elevation: 5,
                    shadowOpacity: 0.3,
                    shadowRadius: 10,
                  }}
                >
                  {cards[0].front === "instruction" ? (
                    <View className="items-center">
                      <Ionicons
                        name="hand-right-outline"
                        size={40}
                        color="#39675F"
                      />
                      <Text className="text-center mt-4">
                        <Text className="text-lg font-semibold text-[#A57C00]">
                          Instruction:{"\n"}
                        </Text>
                        <Text className="text-base text-[#502707]">
                          Tap to see answer.{"\n"}Swipe to skip/next.
                        </Text>
                      </Text>
                      <Text className="text-xl font-black text-[#39675F] mt-10">
                        Swipe to start!
                      </Text>
                    </View>
                  ) : (
                    <>
                      <Text className="text-sm font-bold text-[#39675F] uppercase mb-4 tracking-widest">
                        Question
                      </Text>
                      <Text className="text-2xl font-semibold text-center text-[#502707]">
                        {cards[0].front}
                      </Text>
                    </>
                  )}
                </Animated.View>

                {/* Back Side */}
                <Animated.View
                  style={{
                    position: "absolute",
                    backfaceVisibility: "hidden",
                    backgroundColor: "#FDE6B1",
                    height: cardHeight,
                    width: cardWidth,
                    borderRadius: 20,
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 20,
                    transform: [{ rotateY: backInterpolate }],
                    elevation: 5,
                  }}
                >
                  <Text className="text-sm font-bold text-[#39675F] uppercase mb-4 tracking-widest">
                    Answer
                  </Text>
                  <Text className="text-2xl font-bold text-center text-[#502707]">
                    {cards[0].back}
                  </Text>
                </Animated.View>
              </TouchableOpacity>
            </Animated.View>
          </View>
        ) : (
          <View className="items-center">
            <Ionicons name="checkmark-circle" size={80} color="#FDE6B1" />
            <Text className="text-3xl font-bold text-[#FDE6B1] mt-4">
              All Done!
            </Text>
            <TouchableOpacity
              onPress={() => router.back()}
              className="mt-6 bg-white/20 px-6 py-2 rounded-full border border-white"
            >
              <Text className="text-white font-bold">Go Back</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Progress Footer */}
      <View className="mb-12 px-10">
        <View className="w-full h-2 bg-black/20 rounded-full mb-2">
          <View
            style={{
              width: `${Math.min((progress / Math.max(realCardsCount, 1)) * 100, 100)}%`,
              height: "100%",
              backgroundColor: "#FDE6B1",
              borderRadius: 5,
            }}
          />
        </View>
        <Text className="text-[#FDE6B1] text-center font-medium">
          {cardsLeft} {cardsLeft === 1 ? "card" : "cards"} left
        </Text>
      </View>
    </ImageBackground>
  );
}
