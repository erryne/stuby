import React, { useRef } from "react";
import {
  ImageBackground,
  Text,
  TouchableWithoutFeedback,
  View,
  Animated,
} from "react-native";
import EditDeletePopUp from "./EditDeletePopUp";

interface FlashcardFolderProps {
  folderId: string;
  text: string;
  image?: any;
  isPopupVisible: boolean;
  setPopupVisibleFolder: (id: string | null) => void;
  onFolderEdit: (id: string) => void;
  onFolderDelete: (id: string) => void;
  onFolderPress: (id: string) => void;
}

const FlashcardFolderCard: React.FC<FlashcardFolderProps> = ({
  folderId,
  text,
  image,
  isPopupVisible,
  setPopupVisibleFolder,
  onFolderEdit,
  onFolderDelete,
  onFolderPress,
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
      "flex-1 bg-[#FFF9E5] rounded-2xl items-center justify-center overflow-hidden p-3",
  };

  if (image) {
    containerProps.source = image;
    containerProps.resizeMode = "cover";
  }

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={() => onFolderPress(folderId)}
      disabled={isPopupVisible}

       style={{
            
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 0.3,
              shadowRadius: 10,
              
            }}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }} className="flex-1">
        {React.createElement(
          image ? ImageBackground : View,
          containerProps,
          <>
            {image && <View className="absolute inset-0 bg-white/30" />}

            {/* TOP GREEN BAR */}
            <View className="absolute top-0 left-0 right-0 h-[20%] bg-[#39675F] z-10 flex-row justify-end items-center px-2">
              {[0, 1, 2].map((i) => (
                <TouchableWithoutFeedback
                  key={i}
                  onPress={() =>
                    setPopupVisibleFolder(isPopupVisible ? null : folderId)
                  }
                >
                  <View
                    className="w-2 h-2 rounded-full bg-white mx-[2px]"
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  />
                </TouchableWithoutFeedback>
              ))}
            </View>

            {/* POPUP */}
            {isPopupVisible && (
              <View className="absolute top-2 right-2 z-20">
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

            {/* TITLE */}
            <Text className="text-3xl font-bold text-[#553A00] px-2">{text}</Text>
          </>
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

export default FlashcardFolderCard;
