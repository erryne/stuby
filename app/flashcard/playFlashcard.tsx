import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  ImageBackground,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
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
const { width, height } = Dimensions.get("window");

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
          "cards"
        );
        const q = query(cardsRef, orderBy("createdAt", "asc"));
        const querySnapshot = await getDocs(q);

        const fetchedCards: FlashcardData[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          front: doc.data().question,
          back: doc.data().answer,
        }));

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
    })
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
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color="#FDE6B1" />
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require("../../assets/images/flashcardBg.png")}
      style={styles.container}
      resizeMode="cover"
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#ffffff" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setCards(initialCards);
            setFlipped(false);
            flipAnim.setValue(0);
          }}
          style={styles.restartButton}
        >
          <Ionicons
            name="reload"
            size={18}
            color="#502707"
            style={{ marginRight: 5 }}
          />
          <Text style={styles.restartText}>Restart</Text>
        </TouchableOpacity>
      </View>

      {/* Cards Stack */}
      <View style={styles.stackContainer}>
        {cards.length > 0 ? (
          <View style={{ height: cardHeight, width: cardWidth }}>
            {/* Background stack effect */}
            {cards
              .slice(1, 4)
              .reverse()
              .map((card, index) => (
                <View
                  key={card.id}
                  style={[
                    styles.cardShadow,
                    {
                      top: index * 5,
                      left: index * 2,
                      height: cardHeight,
                      width: cardWidth,
                    },
                  ]}
                />
              ))}

            {/* Active Swipeable Card */}
            <Animated.View
              {...panResponder.panHandlers}
              style={[
                styles.animatedCard,
                {
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
                },
              ]}
            >
              <TouchableOpacity
                activeOpacity={1}
                onPress={flipCard}
                style={{ flex: 1 }}
              >
                {/* Front Side */}
                <Animated.View
                  style={[
                    styles.cardSide,
                    styles.frontCard,
                    {
                      height: cardHeight,
                      width: cardWidth,
                      transform: [{ rotateY: frontInterpolate }],
                    },
                  ]}
                >
                  {cards[0].front === "instruction" ? (
                    <View style={styles.centerItems}>
                      <Ionicons
                        name="hand-right-outline"
                        size={40}
                        color="#39675F"
                      />
                      <Text style={styles.instructionText}>
                        <Text style={styles.instructionTitle}>
                          Instruction:{"\n"}
                        </Text>
                        <Text style={styles.instructionBody}>
                          Tap to see answer.{"\n"}Swipe to skip/next.
                        </Text>
                      </Text>
                      <Text style={styles.swipeToStartText}>
                        Swipe to start!
                      </Text>
                    </View>
                  ) : (
                    <>
                      <Text style={styles.cardLabel}>Question</Text>
                      <Text style={styles.cardMainText}>{cards[0].front}</Text>
                    </>
                  )}
                </Animated.View>

                {/* Back Side */}
                <Animated.View
                  style={[
                    styles.cardSide,
                    styles.backCard,
                    {
                      height: cardHeight,
                      width: cardWidth,
                      transform: [{ rotateY: backInterpolate }],
                    },
                  ]}
                >
                  <Text style={styles.cardLabel}>Answer</Text>
                  <Text style={styles.cardMainTextBold}>{cards[0].back}</Text>
                </Animated.View>
              </TouchableOpacity>
            </Animated.View>
          </View>
        ) : (
          <View style={styles.centerItems}>
            <Ionicons name="checkmark-circle" size={80} color="#FDE6B1" />
            <Text style={styles.allDoneText}>All Done!</Text>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.goBackButton}
            >
              <Text style={styles.goBackText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Progress Footer */}
      <View style={styles.footer}>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${Math.min(
                  (progress / Math.max(realCardsCount, 1)) * 100,
                  100
                )}%`,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {cardsLeft} {cardsLeft === 1 ? "card" : "cards"} left
        </Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: "7%", 
  },
  restartButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FDE6B1",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  restartText: {
    color: "#502707",
    fontWeight: "bold",
    fontSize: 14,
  },
  stackContainer: {
    flex: 1,
    marginTop: "20%",
    alignItems: "center",
  },
  cardShadow: {
    position: "absolute",
    backgroundColor: "#FFF9EC",
    borderRadius: 20,
    opacity: 0.5,
    elevation: 1,
  },
  animatedCard: {
    elevation: 5,
  },
  cardSide: {
    position: "absolute",
    backfaceVisibility: "hidden",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  frontCard: {
    backgroundColor: "#FFF9EC",
  },
  backCard: {
    backgroundColor: "#FDE6B1",
  },
  centerItems: {
    alignItems: "center",
  },
  instructionText: {
    textAlign: "center",
    marginTop: 16,
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#A57C00",
  },
  instructionBody: {
    fontSize: 16,
    color: "#502707",
  },
  swipeToStartText: {
    fontSize: 20,
    fontWeight: "900",
    color: "#39675F",
    marginTop: "5%", 
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#39675F",
    textTransform: "uppercase",
    marginBottom: 16,
    letterSpacing: 2,
  },
  cardMainText: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    color: "#502707",
  },
  cardMainTextBold: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#502707",
  },
  allDoneText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#FDE6B1",
    marginTop: 16,
  },
  goBackButton: {
    marginTop: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: "white",
  },
  goBackText: {
    color: "white",
    fontWeight: "bold",
  },
  footer: {
    marginBottom: "15%",
    paddingHorizontal: "10%",
  },
  progressBarBackground: {
    width: "100%",
    height: 8,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 4,
    marginBottom: 8,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#FDE6B1",
    borderRadius: 5,
  },
  progressText: {
    color: "#FDE6B1",
    textAlign: "center",
    fontWeight: "500",
  },
});