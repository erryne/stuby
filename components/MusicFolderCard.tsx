import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { DeleteAlert } from "./DeleteAlert";
import EditDeletePopUp from "./EditDeletePopUp";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.44;

interface MusicFolderProps {
  musicFolderId: string;
  musicFolderTitle: string;
  musicImage?: any;
  totalSongs: number;
  duration?: string; // Fallback pre-calculated runtime string
  songsArray?: Array<{ duration?: string }>; // <-- NEW: Optional array fallback to calculate raw runtime safely
  isPopupVisible: boolean;
  setPopupVisibleFolder: (id: string | null) => void;
  onFolderEdit: (id: string) => void;
  onFolderDelete: (id: string) => void;
  onFolderPress: (id: string) => void;
  isHearted: boolean;
  onHeartToggle: () => void;
  hideHeart?: boolean;
}

const MusicFolderCard: React.FC<MusicFolderProps> = ({
  musicFolderId,
  musicFolderTitle,
  musicImage,
  totalSongs,
  duration,
  songsArray = [], // Fallback array if empty
  isPopupVisible,
  setPopupVisibleFolder,
  onFolderEdit,
  onFolderDelete,
  onFolderPress,
  isHearted,
  onHeartToggle,
  hideHeart,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const cdTranslation = useRef(new Animated.Value(0)).current;
  const [isAlertVisible, setIsAlertVisible] = useState(false);

  /* ================= INTERNAL PARSING BACKUPS ================= */

  const durationStringToSeconds = (str: string): number => {
    if (!str) return 0;
    const parts = str.split(":").map(Number);
    if (parts.some(isNaN)) return 0;
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return 0;
  };

  const formatTotalDuration = (totalSeconds: number): string => {
    if (totalSeconds <= 0) return "";
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const secStr = seconds < 10 ? `0${seconds}` : seconds;

    if (hours > 0) {
      const minStr = minutes < 10 ? `0${minutes}` : minutes;
      return `${hours}:${minStr}:${secStr}`;
    }
    return `${minutes}:${secStr}`;
  };

  // 1. Check if duration was provided by parent.
  // 2. If missing, calculate directly from the optional songs array.
  let displayDuration = duration || "";
  if (!displayDuration && songsArray && songsArray.length > 0) {
    const computedSeconds = songsArray.reduce(
      (acc, song) => acc + durationStringToSeconds(song.duration || ""),
      0,
    );
    displayDuration = formatTotalDuration(computedSeconds);
  }

  /* ================= GESTURE ANIMATIONS ================= */
  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        useNativeDriver: true,
        friction: 8,
      }),
      Animated.timing(cdTranslation, {
        toValue: -20,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
      }),
      Animated.timing(cdTranslation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const finalImage = musicImage
    ? { uri: musicImage }
    : require("../assets/images/musicfolder_default.png");

  return (
    <View style={styles.cardWrapper}>
      {/* PEEKING CD DISC BACKGROUND */}
      <Animated.View
        style={[styles.cdDisc, { transform: [{ translateY: cdTranslation }] }]}
      >
        <View style={styles.cdInnerHole} />
      </Animated.View>

      <TouchableWithoutFeedback
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => onFolderPress(musicFolderId)}
        disabled={isPopupVisible || isAlertVisible}
      >
        <Animated.View
          style={[styles.coverContainer, { transform: [{ scale: scaleAnim }] }]}
        >
          <ImageBackground source={finalImage} style={styles.imageBackground}>
            <LinearGradient
              colors={["rgba(0,0,0,0.6)", "transparent"]}
              style={styles.topGradient}
            />

            <View style={styles.headerRow}>
              {musicFolderId !== "all" && (
                <TouchableOpacity
                  onPress={() =>
                    setPopupVisibleFolder(isPopupVisible ? null : musicFolderId)
                  }
                  style={styles.iconButton}
                >
                  <Ionicons name="ellipsis-vertical" size={20} color="white" />
                </TouchableOpacity>
              )}
              {!hideHeart && (
                <TouchableOpacity
                  onPress={onHeartToggle}
                  style={[styles.iconButton, { marginLeft: "auto" }]}
                >
                  <Ionicons
                    name={isHearted ? "heart" : "heart-outline"}
                    size={22}
                    color={isHearted ? "#FF6B6B" : "white"}
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* DROPDOWN MENU */}
            {isPopupVisible && (
              <View style={styles.popupContainer}>
                <EditDeletePopUp
                  onEdit={() => {
                    onFolderEdit(musicFolderId);
                    setPopupVisibleFolder(null);
                  }}
                  onDelete={() => {
                    setPopupVisibleFolder(null);
                    setIsAlertVisible(true);
                  }}
                />
              </View>
            )}

            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.9)"]}
              style={styles.bottomGradient}
            />

            {/* FOOTER CONTAINER */}
            <View style={styles.footerContainer}>
              <Text numberOfLines={1} style={styles.titleText}>
                {musicFolderTitle}
              </Text>
              <Text style={styles.statsText} numberOfLines={1}>
                {totalSongs} {totalSongs === 1 ? "song" : "songs"}
                {displayDuration ? ` · ${displayDuration}` : ""}
              </Text>
            </View>
          </ImageBackground>
        </Animated.View>
      </TouchableWithoutFeedback>

      <DeleteAlert
        visible={isAlertVisible}
        title="Delete Folder"
        message={`Are you sure you want to delete "${musicFolderTitle}"? This action cannot be undone.`}
        onCancel={() => setIsAlertVisible(false)}
        onConfirm={async () => {
          // Hihintayin nito matapos ang delete bago isara ang modal
          await onFolderDelete(musicFolderId);
          setIsAlertVisible(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    width: CARD_WIDTH,
    height: CARD_WIDTH,
    marginTop: 40,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  cdDisc: {
    position: "absolute",
    top: -CARD_WIDTH * 0.25,
    width: CARD_WIDTH * 0.85,
    height: CARD_WIDTH * 0.85,
    borderRadius: (CARD_WIDTH * 0.85) / 2,
    backgroundColor: "#1a1a1a",
    borderWidth: 2,
    borderColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    zIndex: -1,
  },
  cdInnerHole: {
    width: CARD_WIDTH * 0.25,
    height: CARD_WIDTH * 0.25,
    borderRadius: (CARD_WIDTH * 0.25) / 2,
    backgroundColor: "#000",
    borderWidth: 2,
    borderColor: "#444",
  },
  coverContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: "#1D173A",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "white",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
  imageBackground: { flex: 1, padding: 10, justifyContent: "space-between" },
  topGradient: {
    ...StyleSheet.absoluteFillObject,
    height: "50%",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  bottomGradient: {
    ...StyleSheet.absoluteFillObject,
    top: "60%",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  headerRow: { flexDirection: "row", zIndex: 10, alignItems: "center" },
  iconButton: { padding: 4 },
  popupContainer: { position: "absolute", top: 0, left: 120, zIndex: 30 },
  footerContainer: { zIndex: 10 },
  titleText: { color: "white", fontSize: 16, fontWeight: "800" },
  statsText: { color: "rgba(255,255,255,0.7)", fontSize: 11, marginTop: 2 },
});

export default MusicFolderCard;
