import { Feather, Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import EditDeletePopUp from "./EditDeletePopUp";

interface FlashcardFolderProps {
  folderId: string;
  text: string;
  cardCount: number;
  image?: string | any;
  design?: string;
  isPopupVisible: boolean;
  isFavorite: boolean;
  setPopupVisibleFolder: (id: string | null) => void;
  onFolderEdit: (id: string) => void;
  onFolderDelete: (id: string) => void;
  onFolderPress: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

const DESIGN_ICONS: Record<string, any> = {
  calculus: require("../assets/images/designs/calculus.png"),
  drrr: require("../assets/images/designs/drrr.png"),
  english: require("../assets/images/designs/english.png"),
  experiment: require("../assets/images/designs/experiment.png"),
  health: require("../assets/images/designs/health.png"),
  "media-literacy": require("../assets/images/designs/mainl.png"),
  math: require("../assets/images/designs/math.png"),
  pe: require("../assets/images/designs/pe.png"),
  philosophy: require("../assets/images/designs/philosophy.png"),
  science: require("../assets/images/designs/science.png"),
  "social-studies": require("../assets/images/designs/socialstudies.png"),
  statistics: require("../assets/images/designs/statistics.png"),
  technology: require("../assets/images/designs/technology.png"),
  writings: require("../assets/images/designs/writings.png"),
};

const FlashcardFolderCard: React.FC<FlashcardFolderProps> = ({
  folderId,
  text,
  cardCount,
  image,
  design,
  isPopupVisible,
  isFavorite,
  setPopupVisibleFolder,
  onFolderEdit,
  onFolderDelete,
  onFolderPress,
  onToggleFavorite,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const heartScaleAnim = useRef(new Animated.Value(1)).current;

  // --- Animation Layout States for Text Ticker ---
  const tickerAnim = useRef(new Animated.Value(0)).current;
  const [containerWidth, setContainerWidth] = useState(0);
  const [textWidth, setTextWidth] = useState(0);

  // Ref to track if the animation is actively looping/moving without causing re-renders
  const isAnimatedRef = useRef(false);

  const isLongText = textWidth > containerWidth && containerWidth > 0;

  useEffect(() => {
    // Only animate if the text is wider than the allowed container bounds
    if (isLongText) {
      isAnimatedRef.current = true;
      const scrollDistance = textWidth - containerWidth + 20; // Added padding buffer

      const tickerLoop = Animated.loop(
        Animated.sequence([
          // Hold briefly at the start position
          Animated.delay(1500),
          // Smoothly scroll text left
          Animated.timing(tickerAnim, {
            toValue: -scrollDistance,
            duration: text.length * 180, // Adapts speed naturally to text length
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          // Hold briefly at the end position
          Animated.delay(1000),
          // Snaps back instantly
          Animated.timing(tickerAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      );

      tickerLoop.start();

      // Clean up looping animation on unmount or layout variance change
      return () => {
        tickerLoop.stop();
        isAnimatedRef.current = false;
      };
    } else {
      tickerAnim.setValue(0);
      isAnimatedRef.current = false;
    }
  }, [textWidth, containerWidth, text]);

  const handlePressIn = () =>
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      friction: 6,
    }).start();

  const handlePressOut = () =>
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
    }).start();

  const handleFavoritePress = () => {
    onToggleFavorite(folderId);

    Animated.sequence([
      Animated.timing(heartScaleAnim, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(heartScaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={() => onFolderPress(folderId)}
      disabled={isPopupVisible}
    >
      <Animated.View
        style={[styles.container, { transform: [{ scale: scaleAnim }] }]}
      >
        <View style={styles.peekingCard}>
          {design && DESIGN_ICONS[design] && (
            <Image
              source={DESIGN_ICONS[design]}
              style={styles.designImage}
              resizeMode="cover"
            />
          )}
        </View>

        <View style={styles.mainCard}>
          <View style={styles.headerBar}>
            <TouchableWithoutFeedback
              onPress={() =>
                setPopupVisibleFolder(isPopupVisible ? null : folderId)
              }
            >
              <View style={styles.menuDotsBox}>
                {[0, 1, 2].map((i) => (
                  <View key={i} style={styles.dot} />
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>

          <View style={styles.contentArea}>
            {image ? (
              <ImageBackground
                source={typeof image === "string" ? { uri: image } : image}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
              >
                <View style={styles.overlay} />
              </ImageBackground>
            ) : (
              <View style={styles.placeholderBackground} />
            )}

            <TouchableOpacity
              onPress={handleFavoritePress}
              style={styles.floatingFavoriteButton}
              activeOpacity={0.7}
            >
              <Animated.View style={{ transform: [{ scale: heartScaleAnim }] }}>
                <Ionicons
                  name={isFavorite ? "heart" : "heart-outline"}
                  size={26}
                  color={isFavorite ? "#EF4444" : "#FFFFFF"}
                  style={styles.heartShadow}
                />
              </Animated.View>
            </TouchableOpacity>

            <View style={styles.contentOverlay}>
              {/* Calculates maximum safe width */}
              <View
                style={styles.titleContainer}
                onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
              >
                <Animated.View
                  style={{
                    flexDirection: "row",

                    /* If it's long text, remove constraints to span out to its full layout width.
                       If it's short, keep it bounded at 100% so standard ellipsis properties can apply.
                    */
                    width: isLongText ? undefined : "100%",
                  }}
                >
                  <Text
                    numberOfLines={1}
                    ellipsizeMode={isLongText ? "clip" : "tail"}
                    style={styles.titleText}
                    onLayout={(e) => {
                      // Fully type-safe layout update check via ref
                      if (!isAnimatedRef.current) {
                        setTextWidth(e.nativeEvent.layout.width);
                      }
                    }}
                  >
                    {text}
                  </Text>
                </Animated.View>
              </View>

              <View style={styles.countContainer}>
                <Feather name="layers" size={16} color="#fff" />
                <Text style={styles.countText}>{cardCount} Cards</Text>
              </View>
            </View>
          </View>

          {isPopupVisible && (
            <View style={styles.popupContainer}>
              <EditDeletePopUp
                onEdit={() => {
                  onFolderEdit(folderId);
                  setPopupVisibleFolder(null);
                }}
                onDelete={() => {
                  onFolderDelete(folderId);
                  setPopupVisibleFolder(null);
                }}
              />
            </View>
          )}
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 180,
    justifyContent: "flex-end",
    position: "relative",
  },
  peekingCard: {
    position: "absolute",
    top: 0,
    left: 12,
    right: 12,
    height: "90%",
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#fff",
  },
  designImage: {
    width: "100%",
    height: "100%",
    transform: [{ rotate: "180deg" }],
  },
  mainCard: {
    height: "90%",
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#fff",
    elevation: 5,
  },
  headerBar: {
    height: 34,
    backgroundColor: "#1D2532",
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 12,
  },
  contentArea: { flex: 1, position: "relative" },
  contentOverlay: { flex: 1, justifyContent: "space-between", padding: 16 },
  floatingFavoriteButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
    padding: 6,
    borderRadius: 99,
  },
  heartShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  placeholderBackground: { flex: 1, backgroundColor: "rgba(217, 119, 6, 0.3)" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  titleContainer: {
    alignSelf: "flex-start",
    maxWidth: "75%",
    overflow: "hidden",
  },
  titleText: {
    fontSize: 28,
    fontWeight: "900",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  countContainer: {
    alignSelf: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  countText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  menuDotsBox: {
    flexDirection: "row",
    gap: 4,
    padding: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
  },
  dot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: "#fff" },
  popupContainer: { position: "absolute", top: 15, right: 8, zIndex: 50 },
});

export default FlashcardFolderCard;
