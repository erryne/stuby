import React from "react";
import { Text, TextStyle, TouchableOpacity } from "react-native";

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  backgroundColor?: string; // Tailwind class
  textColor?: string; // Tailwind class
  width?: number; // always in pixels
  height?: number; // always in pixels
  borderRadius?: number;
  fontSize?: number;
  fontWeight?: TextStyle["fontWeight"];
  containerStyle?: string; // extra Tailwind classes
  textStyle?: string;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  backgroundColor = "#FFEF9A",
  textColor = "text-black",
  width = "100%", // number in pixels
  height = 50,
  borderRadius = 16,
  fontSize = 18,
  fontWeight = "700",
  containerStyle,
  textStyle,
}) => {
  const isHex = backgroundColor.startsWith("#");

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className={`items-center justify-center border-2 border-black ${!isHex ? backgroundColor : ""} ${containerStyle || ""}`}
      style={{
        height,
        borderRadius,
        backgroundColor: isHex ? backgroundColor : undefined,
      }}
    >
      <Text
        className={`${textColor} ${textStyle}`}
        style={{
          fontSize,
          fontWeight,
          textAlign: "center",
          justifyContent: "center",
        }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default CustomButton;
