import Slider from "@react-native-community/slider";
import { LinearGradient } from "expo-linear-gradient";
import { getDownloadURL, getStorage, ref } from "firebase/storage";
import {
    ChevronDown,
    Pause,
    Play,
    Repeat,
    Shuffle,
    SkipBack,
    SkipForward,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    Dimensions,
    Image,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import {
    Gesture,
    GestureDetector,
    GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
    cancelAnimation,
    Easing,
    Extrapolation,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMusic } from "../app/context/MusicContext";
import GeometricBackground from "./GeometricBackground";

const { width, height } = Dimensions.get("window");
const CD_SIZE = width * 0.7;

export default function MusicPlayerModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const {
    currentSong,
    isPlaying,
    togglePlay,
    handleNext,
    handlePrev,
    position,
    duration,
    seekSong,
    isShuffle,
    setIsShuffle,
    isRepeat,
    setIsRepeat,
    currentFolderImage,
  } = useMusic();

  const [displayImage, setDisplayImage] = useState<string | null>(null);
  const [textWidth, setTextWidth] = useState(0);

  const rotation = useSharedValue(0);
  const textOffset = useSharedValue(0);
  const translateY = useSharedValue(height);

  // --- CLEANUP: I-stop at i-close kung nabura ang kanta ---
  useEffect(() => {
    if (!currentSong && isPlaying) {
      // Optional: tawagin ang stop function mo kung meron sa context
      togglePlay();
      onClose();
    }
  }, [currentSong, isPlaying]);

  // Sync entry/exit animation
  useEffect(() => {
    translateY.value = withTiming(visible ? 0 : height, {
      duration: 300,
      easing: Easing.out(Easing.exp),
    });
  }, [visible]);

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > 150 || event.velocityY > 500) {
        translateY.value = withTiming(
          height,
          { duration: 200, easing: Easing.out(Easing.exp) },
          () => {
            runOnJS(onClose)();
          },
        );
      } else {
        translateY.value = withTiming(0, {
          duration: 200,
          easing: Easing.out(Easing.exp),
        });
      }
    });

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const bgOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [0, height],
      [0.6, 0],
      Extrapolation.CLAMP,
    ),
  }));

  useEffect(() => {
    if (!currentSong) return; // Iwasan ang error kung null

    const rawUrl =
      currentSong?.musicImage ||
      currentSong?.image ||
      currentSong?.coverPhoto ||
      currentFolderImage;

    if (
      rawUrl &&
      typeof rawUrl === "string" &&
      rawUrl.includes("firebasestorage.googleapis.com")
    ) {
      const storage = getStorage();
      try {
        const path = decodeURIComponent(rawUrl.split("/o/")[1].split("?")[0]);
        getDownloadURL(ref(storage, path))
          .then(setDisplayImage)
          .catch(() => setDisplayImage(rawUrl));
      } catch {
        setDisplayImage(rawUrl);
      }
    } else {
      setDisplayImage(rawUrl || null);
    }
  }, [currentSong, currentFolderImage]);

  useEffect(() => {
    if (isPlaying) {
      rotation.value = withRepeat(
        withTiming(rotation.value + 360, {
          duration: 8000,
          easing: Easing.linear,
        }),
        -1,
        false,
      );
    } else {
      cancelAnimation(rotation);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (textWidth > 0) {
      textOffset.value = 0;
      textOffset.value = withRepeat(
        withTiming(-textWidth, {
          duration: textWidth * 30,
          easing: Easing.linear,
        }),
        -1,
        false,
      );
    }
  }, [textWidth, currentSong]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));
  const animatedTextStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: textOffset.value }],
  }));

  const formatTime = (millis: number) => {
    const mins = Math.floor(millis / 60000);
    const secs = Math.floor((millis % 60000) / 1000);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (!visible && translateY.value === height) return null;

  return (
    <GestureHandlerRootView style={StyleSheet.absoluteFill}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: "black" },
          bgOpacity,
        ]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <Animated.View style={[styles.modalContainer, animatedContainerStyle]}>
        <GestureDetector gesture={gesture}>
          <LinearGradient
            colors={["#7DD3FC", "#38BDF8", "#0EA5E9"]}
            style={{ flex: 1 }}
          >
            <View style={styles.handle} />
            <View style={StyleSheet.absoluteFillObject}>
              <GeometricBackground />
            </View>
            <SafeAreaView style={{ flex: 1, padding: 20 }}>
              <TouchableOpacity onPress={onClose}>
                <ChevronDown size={32} color="white" />
              </TouchableOpacity>

              <Animated.View style={[styles.cdContainer, animatedStyle]}>
                <Image
                  key={displayImage || "default"}
                  source={
                    displayImage
                      ? { uri: displayImage }
                      : require("../assets/images/musicfolder_default.png")
                  }
                  style={styles.cdImage}
                />
                <View style={styles.centerDot} />
              </Animated.View>

              <View style={styles.titleContainer}>
                <Animated.View
                  style={[styles.animatedTrack, animatedTextStyle]}
                >
                  <Text
                    style={styles.title}
                    numberOfLines={1}
                    onLayout={(e) => setTextWidth(e.nativeEvent.layout.width)}
                  >
                    {currentSong?.title || "Walang napiling kanta"}
                  </Text>
                  <View style={{ width: 50 }} />
                  <Text style={styles.title} numberOfLines={1}>
                    {currentSong?.title || "Walang napiling kanta"}
                  </Text>
                </Animated.View>
              </View>

              <Slider
                style={styles.slider}
                value={position}
                maximumValue={duration}
                onSlidingComplete={seekSong}
                minimumTrackTintColor="#FFFFFF"
                thumbTintColor="#FFFFFF"
              />
              <View style={styles.timeContainer}>
                <Text style={styles.timeText}>{formatTime(position)}</Text>
                <Text style={styles.timeText}>{formatTime(duration)}</Text>
              </View>

              <View style={styles.controls}>
                <TouchableOpacity onPress={() => setIsShuffle(!isShuffle)}>
                  <Shuffle size={24} color={isShuffle ? "#FDE6B1" : "white"} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handlePrev}>
                  <SkipBack size={40} color="white" fill="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={togglePlay}
                  style={styles.playButton}
                >
                  {isPlaying ? (
                    <Pause size={40} color="#0EA5E9" fill="#0EA5E9" />
                  ) : (
                    <Play size={40} color="#0EA5E9" fill="#0EA5E9" />
                  )}
                </TouchableOpacity>
                <TouchableOpacity onPress={handleNext}>
                  <SkipForward size={40} color="white" fill="white" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsRepeat(!isRepeat)}>
                  <Repeat size={24} color={isRepeat ? "#FDE6B1" : "white"} />
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </LinearGradient>
        </GestureDetector>
      </Animated.View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  // ... (Panatilihin ang iyong existing styles)
  modalContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: "90%",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: "hidden",
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: "rgba(255,255,255,0.5)",
    alignSelf: "center",
    borderRadius: 2,
    marginTop: 10,
  },
  cdContainer: {
    width: CD_SIZE,
    height: CD_SIZE,
    borderRadius: CD_SIZE / 2,
    alignSelf: "center",
    marginTop: 20,
    borderWidth: 8,
    borderColor: "#334155",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  cdImage: { width: "100%", height: "100%" },
  centerDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "transparent",
    position: "absolute",
    zIndex: 10,
  },
  titleContainer: {
    width: "80%",
    alignSelf: "center",
    overflow: "hidden",
    marginTop: 30,
    height: 40,
    justifyContent: "center",
  },
  animatedTrack: { flexDirection: "row", alignItems: "center", width: 2000 },
  title: { fontSize: 24, fontWeight: "bold", color: "white" },
  slider: { width: "100%", height: 40, marginTop: 10 },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  timeText: { color: "white", fontSize: 12, opacity: 0.8 },
  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    paddingHorizontal: 20,
  },
  playButton: { backgroundColor: "white", padding: 20, borderRadius: 50 },
});
