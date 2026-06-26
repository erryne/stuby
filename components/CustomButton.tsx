import React from "react";
import {
  ActivityIndicator,
  DimensionValue,
  Text,
  TextStyle,
  TouchableOpacity,
} from "react-native";

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  backgroundColor?: string;
  textColor?: string;
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  fontSize?: number;
  fontWeight?: TextStyle["fontWeight"];
  containerStyle?: string;
  textStyle?: string;
  loading?: boolean; // ✅ Added this
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  backgroundColor = "#7DD3FC",
  textColor = "text-[#0F172A]",
  width = "100%",
  height = 50,
  borderRadius = 16,
  fontSize = 18,
  fontWeight = "700",
  containerStyle,
  textStyle,
  loading = false, // ✅ Default to false
}) => {
  const isHex = backgroundColor.startsWith("#");

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      disabled={loading} // ✅ Disable button when loading
      className={`${!isHex ? backgroundColor : ""} ${containerStyle || ""}`}
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: isHex ? backgroundColor : undefined,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "black",
        opacity: loading ? 0.7 : 1, // ✅ Visual feedback
      }}
    >
      {loading ? (
        <ActivityIndicator color={isHex ? "#0F172A" : "black"} />
      ) : (
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
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;
