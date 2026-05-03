import React, { useRef } from "react";
import {
  ImageBackground,
  Text,
  TouchableWithoutFeedback,
  View,
  Animated,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import EditDeletePopUp from "./EditDeletePopUp";

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
  hideHeart?: boolean; // ✅ key prop
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
    className:
      "flex-1 bg-[#1D173A] rounded-2xl justify-between overflow-hidden p-4",
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
      <Animated.View
        style={{ transform: [{ scale: scaleAnim }] }}
        className="flex-1"
      >
        {React.createElement(
          musicImage ? ImageBackground : View,
          containerProps,
          <>
            {musicImage && <View className="absolute inset-0 bg-black/30" />}

            {/* TOP BLUE BAR */}
            
{/* TOP BLUE BAR */}
{/* TOP BLUE BAR */}
<View className="absolute top-0 left-0 right-0 h-[22%] bg-[#5867A3] z-10 flex-row justify-end items-center px-2">
  {musicFolderId !== "all" &&
    [0, 1, 2].map((i) => (
      <TouchableWithoutFeedback
        key={i}
        onPress={() =>
          setPopupVisibleFolder(isPopupVisible ? null : musicFolderId)
        }
      >
        <View
          className="w-2 h-2 rounded-full bg-white mx-[2px]"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        />
      </TouchableWithoutFeedback>
    ))}
</View>




            {/* EDIT/DELETE POPUP */}
            {isPopupVisible && (
              <View className="absolute top-2 right-2 z-20">
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

            {/* TITLE */}
            <View className="mt-5">
              <Text className="text-white text-xl font-extrabold">
                {musicFolderTitle}
              </Text>
              <Text className="text-white/70 text-xs mt-1">
                {totalSongs} songs · {totalStreamingMinutes}
              </Text>
            </View>

            {/* ACTION ROW */}
            <View className="flex-row items-center justify-end mt-3 gap-2">

              {/* ✅ HEART: hide only for All Songs */}
              {!hideHeart && (
                <TouchableOpacity onPress={onHeartToggle}>
                  <Ionicons
                    name={isHearted ? "heart" : "heart-outline"}
                    size={28}
                    color={isHearted ? "#FF6B6B" : "white"}
                  />
                </TouchableOpacity>
              )}

              {/* PLAY BUTTON */}
              <TouchableOpacity className="bg-white rounded-full p-2">
                <Ionicons name="play" size={18} color="#4C5C8A" />
              </TouchableOpacity>

            </View>
          </>
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

export default MusicFolderCard;
