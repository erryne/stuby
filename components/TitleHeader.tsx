import { useFonts } from "expo-font";
import React from "react";
import { Text, TextStyle, View, ViewStyle } from "react-native";

type TitleSize = "sm" | "md" | "lg" | "xl" | "2xl";
type TitleAlign = "left" | "center" | "right";

interface TitleHeaderProps {
  title: string;
  subtitle?: string;
  size?: TitleSize;
  align?: TitleAlign;
  color?: string;
  subtitleColor?: string;
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
}

const fontSizeMap: Record<TitleSize, number> = {
  sm: 20,
  md: 28,
  lg: 36,
  xl: 44,
  "2xl": 56,
};

const TitleHeader: React.FC<TitleHeaderProps> = ({
  title,
  subtitle,
  size = "lg",
  align = "left",
  color = "#1a1a1a",
  subtitleColor = "#6b7280",
  containerStyle,
  titleStyle,
  subtitleStyle,
}) => {
  const [fontsLoaded] = useFonts({
    "Chunko-Bold": require("../assets/font/Chunko-Bold.otf"),
  });

  if (!fontsLoaded) return null;

  return (
    <View style={[{ marginBottom: 8 }, containerStyle]}>
      <Text
        style={[
          {
            fontFamily: "Chunko-Bold",
            fontSize: fontSizeMap[size],
            color,
            textAlign: align,
            letterSpacing: 2,
            lineHeight: fontSizeMap[size] * 1.2,
          },
          titleStyle,
        ]}
      >
        {title}
      </Text>

      {subtitle ? (
        <Text
          style={[
            {
              fontSize: fontSizeMap[size] * 0.45,
              color: subtitleColor,
              textAlign: align,
              lineHeight: fontSizeMap[size] * 0.45 * 1.5,
              fontWeight: "400",
              marginTop: 4,
            },
            subtitleStyle,
          ]}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
};

export default TitleHeader;
