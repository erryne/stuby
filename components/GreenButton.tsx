import React from "react";
import { Text, TextStyle, TouchableOpacity, Dimensions, Platform, ViewStyle } from "react-native";

interface GreenButtonProps {
  title: string;
  onPress: () => void;
  backgroundColor?: string; // Tailwind class or hex
  textColor?: string; // Tailwind class
  widthPercent?: number; // percentage of screen width
  heightPercent?: number; // percentage of screen height
  borderRadius?: number;
  fontSize?: number;
  fontWeight?: TextStyle["fontWeight"];
  containerStyle?: string; // extra Tailwind classes
  textStyle?: string;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const GreenButton: React.FC<GreenButtonProps> = ({
  title,
  onPress,
  backgroundColor = "#80CF8F",
  textColor = "text-black",
  widthPercent = 0.01, 
  heightPercent = 0.06, // 6% of screen height
  borderRadius = 20,
  fontSize = 15,
  fontWeight = "700",
  containerStyle,
  textStyle,
}) => {
  const isHex = backgroundColor.startsWith("#");

  const buttonWidth = SCREEN_WIDTH * widthPercent;
  const buttonHeight = SCREEN_HEIGHT * heightPercent;

  // Shadow style
  const shadowStyle: ViewStyle = Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    android: {
      elevation: 5,
    },
  }) as ViewStyle;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className={`${!isHex ? backgroundColor : ''} ${containerStyle || ''} items-center justify-center`}
      style={{
        width: buttonWidth,
        height: buttonHeight,
        borderRadius,
        backgroundColor: isHex ? backgroundColor : undefined,
        ...shadowStyle,
      }}
    >
      <Text
        className={`${textColor} ${textStyle}`}
        style={{
          fontSize,
          fontWeight,
        }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default GreenButton;
