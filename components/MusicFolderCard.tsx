import { Ionicons } from "@expo/vector-icons";
import React, { useRef } from "react";
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
import EditDeletePopUp from "./EditDeletePopUp";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface MusicFolderProps {
  musicFolderId: string;
  musicFolderTitle: string;
  musicImage?: any;
  totalSongs: number;
  totalStreamingMinutes: string;
  isPopupVisible: boolean;
  setPopupVisibleFolder: (id: string | null) => void;
  onFolderEdit?: (id: string) => void;
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
  totalStreamingMinutes,
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

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      friction: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 4,
    }).start();
  };

  const containerProps: any = {
    style: styles.folderContainer,
  };

  if (musicImage) {
    containerProps.source = musicImage;
    containerProps.resizeMode = "cover";
  }

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={() => onFolderPress(musicFolderId)}
      disabled={isPopupVisible}
    >
      <Animated.View style={[styles.flexFill, { transform: [{ scale: scaleAnim }] }]}>
        {React.createElement(
          musicImage ? ImageBackground : View,
          containerProps,
          <>
            {musicImage && <View style={styles.imageOverlay} />}

            {/* TOP BLUE BAR */}
            <View style={styles.topBar}>
              {musicFolderId !== "all" &&
                [0, 1, 2].map((i) => (
                  <TouchableWithoutFeedback
                    key={i}
                    onPress={() => setPopupVisibleFolder(isPopupVisible ? null : musicFolderId)}
                  >
                    <View
                      style={styles.dot}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    />
                  </TouchableWithoutFeedback>
                ))}
            </View>

            {/* EDIT/DELETE POPUP */}
            {isPopupVisible && (
              <View style={styles.popupContainer}>
                <EditDeletePopUp
                  onEdit={() => {
                    onFolderEdit?.(musicFolderId);
                    setPopupVisibleFolder(null);
                  }}
                  onDelete={() => {
                    onFolderDelete(musicFolderId);
                    setPopupVisibleFolder(null);
                  }}
                />
              </View>
            )}

            {/* TITLE & INFO */}
            <View style={styles.titleSection}>
              <Text style={styles.titleText}>{musicFolderTitle}</Text>
              <Text style={styles.subText}>
                {totalSongs} songs · {totalStreamingMinutes}
              </Text>
            </View>

            {/* ACTION ROW */}
            <View style={styles.actionRow}>
              {!hideHeart && (
                <TouchableOpacity onPress={onHeartToggle}>
                  <Ionicons
                    name={isHearted ? "heart" : "heart-outline"}
                    size={28}
                    color={isHearted ? "#FF6B6B" : "white"}
                  />
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.playButton}>
                <Ionicons name="play" size={18} color="#4C5C8A" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  flexFill: {
    flex: 1,

  },
  folderContainer: {
    flex: 1,
    backgroundColor: "#1D173A",
    borderRadius: 16,
    justifyContent: "space-between",
    overflow: "hidden",
    padding: 16,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_WIDTH * 0.07, // Approx 22% of a standard card height
    backgroundColor: "#5867A3",
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "white",
    marginHorizontal: 2,
  },
  popupContainer: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 20,
  },
  titleSection: {
    marginTop: 25, // To clear the absolute topBar
  },
  titleText: {
    color: "white",
    fontSize: 20,
    fontWeight: "900",
  },
  subText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
    marginTop: 4,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
  },
  playButton: {
    backgroundColor: "white",
    borderRadius: 99,
    padding: 8,
  },
});

export default MusicFolderCard;