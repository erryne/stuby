import React from "react";
import {
  Platform,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

interface GreenButtonProps {
  title: string;
  onPress: () => void;
  backgroundColor?: string;
  textColor?: string;
  width?: number;
  height?: number;
  borderRadius?: number;
  fontSize?: number;
  fontWeight?: TextStyle["fontWeight"];
  containerStyle?: string;
  textStyle?: string;
}

const GreenButton: React.FC<GreenButtonProps> = ({
  title,
  onPress,
  backgroundColor = "#80CF8F",
  textColor = "#000000",
  width = 76,
  height = 33,
  borderRadius = 20,
  fontSize = 12,
  fontWeight = "700",
  containerStyle,
  textStyle,
}) => {
  const isHexBg = backgroundColor.startsWith("#");
  const isHexText = textColor.startsWith("#");

  const shadowStyle: ViewStyle = Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    android: {
      elevation: 2,
    },
  }) as ViewStyle;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      // "items-center" and "justify-center" handle the vertical and horizontal centering
      className={`${!isHexBg ? backgroundColor : ""} ${containerStyle || ""} items-center justify-center`}
      style={{
        width: width,
        height: height,
        borderRadius: borderRadius,
        backgroundColor: isHexBg ? backgroundColor : undefined,
        display: "flex",
        alignItems: "center", // Center horizontal
        justifyContent: "center", // Center vertical
        ...shadowStyle,
      }}
    >
      <Text
        className={`${!isHexText ? textColor : ""} ${textStyle || ""}`}
        style={{
          fontSize,
          fontWeight,
          color: isHexText ? textColor : undefined,
          textAlign: "center", // Horizontal text alignment
          textAlignVertical: "center", // Vertical text alignment (Android specific)
          includeFontPadding: false, // CRITICAL: Removes extra top space on Android
        }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default GreenButton;
