import React, { useRef } from "react";
import {
    ActivityIndicator,
    Animated,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface CustomSpringButtonProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
}

export default function CustomSpringButton({
  title,
  onPress,
  isLoading = false,
}: CustomSpringButtonProps) {
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;

  // Tactile Spring Button Animations
  const handlePressIn = () => {
    Animated.spring(buttonScaleAnim, {
      toValue: 0.94,
      tension: 100,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScaleAnim, {
      toValue: 1,
      tension: 100,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View className="w-full mt-[10px]">
      {isLoading ? (
        <ActivityIndicator size="large" color="#0EA5E9" />
      ) : (
        <Animated.View
          style={{ transform: [{ scale: buttonScaleAnim }] }}
          className="w-full"
        >
          <TouchableOpacity
            activeOpacity={1} // Prevents default fade-out overlay so our spring effect feels mechanical
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onPress}
            className="w-full bg-[#1E293B] h-14 rounded-2xl items-center justify-center"
            style={{
              shadowColor: "#1E293B",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4, // Android shadow fallback
            }}
          >
            <Text className="text-white font-extrabold text-lg tracking-wide">
              {title}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}
