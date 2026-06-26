import CustomHeader from "@/components/CustomHeader";
import GeometricBackground from "@/components/GeometricBackground";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import LottieView from "lottie-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Image,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import Reanimated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../../firebaseConfig";

const DESIGN_MAP: Record<string, any> = {
  calculus: require("../../assets/images/designs/calculus.png"),
  drrr: require("../../assets/images/designs/drrr.png"),
  english: require("../../assets/images/designs/english.png"),
  experiment: require("../../assets/images/designs/experiment.png"),
  health: require("../../assets/images/designs/health.png"),
  "media-literacy": require("../../assets/images/designs/mainl.png"),
  math: require("../../assets/images/designs/math.png"),
  pe: require("../../assets/images/designs/pe.png"),
  philosophy: require("../../assets/images/designs/philosophy.png"),
  science: require("../../assets/images/designs/science.png"),
  "social-studies": require("../../assets/images/designs/socialstudies.png"),
  statistics: require("../../assets/images/designs/statistics.png"),
  technology: require("../../assets/images/designs/technology.png"),
  writings: require("../../assets/images/designs/writings.png"),
};

// Helper: Fisher-Yates Shuffle
const shuffleArray = (array: any[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export default function PlayFlashcard() {
  const { folderId, design } = useLocalSearchParams();
  const [cards, setCards] = useState<any[]>([]);
  const [initialCards, setInitialCards] = useState<any[]>([]);
  const [flipped, setFlipped] = useState(false);
  const [trackWidth, setTrackWidth] = useState(0);

  const pan = useRef(new Animated.ValueXY()).current;
  const flipAnim = useRef(new Animated.Value(0)).current;

  const animatedProgress = useSharedValue(0);
  const footerYOffset = useSharedValue(0);

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ["0deg", "180deg"],
  });
  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ["180deg", "360deg"],
  });

  useEffect(() => {
    const fetchCards = async () => {
      const user = auth.currentUser;
      if (!folderId || !user) return;

      const q = query(
        collection(db, "cards"),
        where("folderId", "==", folderId),
        where("userId", "==", user.uid),
        orderBy("createdAt", "asc"),
      );

      try {
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((d) => ({
          id: d.id,
          front: d.data().question,
          back: d.data().answer,
        }));

        const shuffledData = shuffleArray(data);

        const deck = [
          {
            id: "instruction",
            front: "Tap to flip. Swipe to next.",
            back: "Tap to flip.",
          },
          ...shuffledData,
        ];
        setInitialCards(deck);
        setCards(deck);
      } catch (error) {
        console.error("Error fetching cards:", error);
      }
    };

    fetchCards();
  }, [folderId]);

  const totalCount = initialCards.length > 0 ? initialCards.length - 1 : 0;
  const finishedCount = initialCards.length - cards.length;
  const progressPercent =
    totalCount > 0 ? Math.min(100, (finishedCount / totalCount) * 100) : 0;
  const isDeckCleared = cards.length === 0 && initialCards.length > 0;

  useEffect(() => {
    let vibrationInterval: ReturnType<typeof setInterval> | null = null;
    animatedProgress.value = withSpring(progressPercent, {
      damping: 15,
      stiffness: 90,
    });

    if (isDeckCleared) {
      Vibration.vibrate([0, 200, 100, 200]);
      vibrationInterval = setInterval(() => {
        Vibration.vibrate([0, 150, 100, 150]);
      }, 2000);
      footerYOffset.value = withSpring(-180, { damping: 15, stiffness: 70 });
    } else {
      Vibration.cancel();
      footerYOffset.value = withTiming(0, { duration: 200 });
    }

    return () => {
      if (vibrationInterval) clearInterval(vibrationInterval);
      Vibration.cancel();
    };
  }, [progressPercent, isDeckCleared]);

  const animatedColors = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      Math.max(0, animatedProgress.value),
      [0, 50, 80, 100],
      ["#EF4444", "#FBBF24", "#10B981", "#10B981"],
    ),
  }));

  const animatedBarStyles = useAnimatedStyle(() => ({
    width: trackWidth
      ? (Math.max(0, Math.min(100, animatedProgress.value)) / 100) * trackWidth
      : 0,
  }));

  const animatedGlassStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      Math.max(0, animatedProgress.value),
      [0, 5],
      [0, 1],
      "clamp",
    ),
  }));

  const animatedFooterTransform = useAnimatedStyle(() => ({
    transform: [{ translateY: footerYOffset.value }],
  }));

  const toggleFlip = () => {
    if (cards[0]?.id === "instruction") return;
    Animated.spring(flipAnim, {
      toValue: flipped ? 0 : 180,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setFlipped(!flipped);
  };

  const handleRestart = () => {
    const instructionCard = initialCards[0];
    const restOfDeck = initialCards.slice(1);
    setCards([instructionCard, ...shuffleArray(restOfDeck)]);
    setFlipped(false);
    flipAnim.setValue(0);
    pan.setValue({ x: 0, y: 0 });
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 5,
        onPanResponderMove: Animated.event([null, { dx: pan.x }], {
          useNativeDriver: false,
        }),
        onPanResponderRelease: (_, gesture) => {
          if (Math.abs(gesture.dx) < 5 && Math.abs(gesture.dy) < 5) {
            toggleFlip();
            return;
          }
          if (Math.abs(gesture.dx) > 120) {
            Animated.timing(pan, {
              toValue: { x: gesture.dx > 0 ? 600 : -600, y: 0 },
              duration: 250,
              useNativeDriver: true,
            }).start(() => {
              setCards((prev) => {
                const updated = prev.slice(1);
                pan.setValue({ x: 0, y: 0 });
                setFlipped(false);
                flipAnim.setValue(0);
                return updated;
              });
            });
          } else {
            Animated.spring(pan, {
              toValue: { x: 0, y: 0 },
              useNativeDriver: true,
            }).start();
          }
        },
      }),
    [pan, flipAnim, flipped, cards],
  );

  return (
    <LinearGradient
      colors={["#7DD3FC", "#38BDF8", "#0EA5E9"]}
      style={styles.container}
    >
      <View style={StyleSheet.absoluteFillObject}>
        <GeometricBackground />
      </View>
      <SafeAreaView>
        <CustomHeader />
      </SafeAreaView>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={18} color="#334155" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleRestart} style={styles.restartBtn}>
          <Ionicons name="reload" size={18} color="#334155" />
          <Text style={styles.btnText}>Restart</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.stackContainer}>
        {cards.length > 0 ? (
          <View style={styles.cardContainer}>
            {cards.length > 2 && (
              <View
                style={[
                  styles.side,
                  styles.bgCardBacking,
                  {
                    zIndex: 1,
                    transform: [
                      { scale: 0.88 },
                      { translateY: 32 },
                      { rotate: "4deg" },
                    ],
                    opacity: 0.5,
                  },
                ]}
              >
                {DESIGN_MAP[design as string] && (
                  <Image
                    source={DESIGN_MAP[design as string]}
                    style={styles.cardBg}
                  />
                )}
                <View style={styles.overlay} />
              </View>
            )}
            {cards.length > 1 && (
              <View
                style={[
                  styles.side,
                  styles.bgCardBacking,
                  {
                    zIndex: 2,
                    transform: [
                      { scale: 0.94 },
                      { translateY: 16 },
                      { rotate: "-3deg" },
                    ],
                  },
                ]}
              >
                {DESIGN_MAP[design as string] && (
                  <Image
                    source={DESIGN_MAP[design as string]}
                    style={styles.cardBg}
                  />
                )}
                <View style={styles.overlay} />
                <Text style={styles.cardText}>{cards[1].front}</Text>
              </View>
            )}
            <Animated.View
              {...panResponder.panHandlers}
              style={[
                StyleSheet.absoluteFillObject,
                { zIndex: 10, transform: [{ translateX: pan.x }] },
              ]}
            >
              <Animated.View
                style={[
                  styles.side,
                  { transform: [{ rotateY: frontInterpolate }] },
                ]}
              >
                {DESIGN_MAP[design as string] && (
                  <Image
                    source={DESIGN_MAP[design as string]}
                    style={styles.cardBg}
                  />
                )}
                <View style={styles.overlay} />
                <Text style={styles.cardText}>{cards[0].front}</Text>
              </Animated.View>
              <Animated.View
                style={[
                  styles.side,
                  { transform: [{ rotateY: backInterpolate }] },
                ]}
              >
                {DESIGN_MAP[design as string] && (
                  <Image
                    source={DESIGN_MAP[design as string]}
                    style={styles.cardBg}
                  />
                )}
                <View style={styles.overlay} />
                <Text style={styles.cardText}>{cards[0].back}</Text>
              </Animated.View>
            </Animated.View>
          </View>
        ) : (
          <View style={styles.clearedContainer}>
            <LottieView
              source={require("../../assets/animations/deck_cleared.json")}
              autoPlay
              loop={true}
              style={styles.lottieAnimation}
            />
            <Text style={styles.doneText}>Deck Completed!</Text>
          </View>
        )}
      </View>
      <Reanimated.View
        style={[styles.footerContainer, animatedFooterTransform]}
      >
        <View style={styles.trackWrapper}>
          <View
            onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
            className="w-full bg-sky-950/20 rounded-full h-5 border border-white/5 overflow-hidden justify-center relative z-10"
          >
            <Reanimated.View
              style={[
                animatedBarStyles,
                animatedColors,
                { overflow: "hidden" },
              ]}
              className="h-full rounded-full relative"
            >
              <Reanimated.View
                style={[styles.glassGlowIndicator, animatedGlassStyle]}
              />
            </Reanimated.View>
          </View>
          <View style={styles.labelContainer}>
            {isDeckCleared ? (
              <Text style={styles.completedText}>Completed</Text>
            ) : (
              <Text style={styles.cardsRemainingText}>
                {cards.length > 0 ? cards.length - 1 : 0} cards left
              </Text>
            )}
          </View>
        </View>
      </Reanimated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  iconBtn: { padding: 8, backgroundColor: "white", borderRadius: 12 },
  stackContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  cardContainer: { width: "85%", height: "85%", position: "relative" },
  clearedContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: 300,
    position: "relative",
  },
  lottieAnimation: { width: "100%", height: "100%", position: "absolute" },
  side: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    borderRadius: 30,
    backgroundColor: "white",
    backfaceVisibility: "hidden",
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  bgCardBacking: { opacity: 0.9 },
  cardBg: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: "cover",
    opacity: 0.5,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  cardText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#334155",
    textAlign: "center",
  },
  footerContainer: { paddingHorizontal: 30, paddingBottom: 40 },
  trackWrapper: { width: "100%" },
  glassGlowIndicator: {
    height: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.4)",
    position: "absolute",
    top: 4,
    left: 6,
    right: 6,
  },
  labelContainer: { alignItems: "center", marginTop: 12 },
  cardsRemainingText: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  completedText: {
    color: "#E0F2FE",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    textShadowColor: "rgba(0, 0, 0, 0.15)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  restartBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 12,
  },
  btnText: { fontWeight: "bold", color: "#334155", marginLeft: 5 },
  doneText: {
    fontSize: 36,
    fontWeight: "900",
    color: "white",
    zIndex: 10,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 6,
  },
});
