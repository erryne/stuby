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

              {/* TOP DARK BAR */}
              <View style={styles.topBar}>
                <TouchableWithoutFeedback
                  onPress={() =>
                    setPopupVisibleFolder(isPopupVisible ? null : folderId)
                  }
                >
                  <View style={styles.dotContainer}>
                    {[0, 1, 2].map((i) => (
                      <View key={i} style={styles.dot} />
                    ))}
                  </View>
                </TouchableWithoutFeedback>
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

              {/* TITLE - Centered below the bar */}
              <View style={styles.titleWrapper}>
                <Text 
                   style={styles.titleText} 
                   numberOfLines={2}
                   adjustsFontSizeToFit
                >
                  {text}
                </Text>
              </View>
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
    height: SCREEN_WIDTH * 0.36, 
    width: "100%",
    marginBottom: SCREEN_WIDTH * 0.04, 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    backgroundColor: "transparent",
  },
  flexFill: {
    flex: 1,
  },
  folderContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  defaultBg: {
    backgroundColor: "#FFF9E5",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    // top green header
    height: SCREEN_WIDTH * 0.08, 
    backgroundColor: "#39675F",
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  dotContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
  },
  dot: {
    width: SCREEN_WIDTH * 0.015,
    height: SCREEN_WIDTH * 0.015,
    borderRadius: SCREEN_WIDTH * 0.01,
    backgroundColor: "white",
    marginHorizontal: 1.5,
  },
  popupContainer: {
    position: "absolute",
    top: SCREEN_WIDTH * 0.09, 
    right: 10,
    zIndex: 30,
  },
  titleWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // under the topBar
    paddingTop: SCREEN_WIDTH * 0.08, 
    paddingHorizontal: 20,
  },
  titleText: {
    fontSize: SCREEN_WIDTH * 0.075,
    fontWeight: "bold",
    color: "#553A00",
    textAlign: "center",
    marginBottom: 10,
  },
});