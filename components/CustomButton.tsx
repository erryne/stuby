import React from "react";
import {
  DimensionValue,
  Text,
  TextStyle,
  TouchableOpacity,
} from "react-native";

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  backgroundColor?: string; // Tailwind class
  textColor?: string; // Tailwind class
  width?: DimensionValue; // ✅ fixed: allows both "100%" and pixel numbers
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
  width = "100%",
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
      className={`${!isHex ? backgroundColor : ""} ${containerStyle || ""}`}
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: isHex ? backgroundColor : undefined,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2, // ✅ moved from Tailwind
        borderColor: "black", // ✅ moved from Tailwind
      }}
    >
      <Text
        className={`${textColor} ${textStyle ?? ""}`}
        style={{
          fontSize,
          fontWeight,
          textAlign: "center",
        }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default CustomButton;
