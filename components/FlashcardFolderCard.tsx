import React, { useRef } from "react";
import {
  Animated,
  Dimensions,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import EditDeletePopUp from "./EditDeletePopUp";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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


  const containerStyle = [styles.folderContainer, !image && styles.defaultBg];
  const containerProps: any = {
    style: containerStyle,
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
    >
      <View style={styles.cardWrapper}>
        <Animated.View style={[styles.flexFill, { transform: [{ scale: scaleAnim }] }]}>
          {React.createElement(
            image ? ImageBackground : View,
            containerProps,
            <>
              {image && <View style={styles.imageOverlay} />}

              {/* TOP GREEN BAR */}
              <View style={styles.topBar}>
                {[0, 1, 2].map((i) => (
                  <TouchableWithoutFeedback
                    key={i}
                    onPress={() =>
                      setPopupVisibleFolder(isPopupVisible ? null : folderId)
                    }
                  >
                    <View
                      style={styles.dot}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    />
                  </TouchableWithoutFeedback>
                ))}
              </View>

              {/* POPUP */}
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

              {/* TITLE */}
              <Text style={styles.titleText}>{text}</Text>
            </>
          )}
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default FlashcardFolderCard;

const styles = StyleSheet.create({
  cardWrapper: {
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 8,
    backgroundColor: "transparent",
  },
  flexFill: {
    flex: 1,
  },
  folderContainer: {
    flex: 1,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center", 
    overflow: "hidden",
    padding: SCREEN_WIDTH * 0.03, 
    marginBottom: 16,
  },
  defaultBg: {
    backgroundColor: "#FFF9E5",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "22%", 
    backgroundColor: "#39675F",
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  dot: {
    width: SCREEN_WIDTH * 0.02, // Responsive dot size
    height: SCREEN_WIDTH * 0.02,
    borderRadius: SCREEN_WIDTH * 0.01,
    backgroundColor: "white",
    marginHorizontal: 2,
  },
  popupContainer: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 20,
  },
  titleText: {
    fontSize: SCREEN_WIDTH * 0.075,
    fontWeight: "bold",
    color: "#553A00",
    marginTop: SCREEN_WIDTH * 0.03, 
    paddingHorizontal: 8,
    textAlign: "center",
  },
});