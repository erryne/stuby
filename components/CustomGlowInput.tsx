import { Feather } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  Animated,
  TextInput,
  TextInputProps,
  TouchableOpacity,
} from "react-native";

interface CustomGlowInputProps extends TextInputProps {
  placeholder: string;
  iconName: keyof typeof Feather.glyphMap;
  isPassword?: boolean;
}

export default function CustomGlowInput({
  placeholder,
  iconName,
  isPassword = false,
  editable = true,
  ...restProps
}: CustomGlowInputProps) {
  const [secureText, setSecureText] = useState(isPassword);
  const focusAnim = useRef(new Animated.Value(0)).current;

  // Handles smooth glow fade-in
  const handleFocus = () => {
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: false, // Color & shadow layout bounds require false
    }).start();
  };

  // Handles smooth glow fade-out
  const handleBlur = () => {
    Animated.timing(focusAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  };

  // Interpolates border color line transitions
  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#E2E8F0", "#38BDF8"], // Gray-200 to Sky-400
  });

  return (
    <Animated.View
      style={{
        borderColor: borderColor,
        borderWidth: 2,
        shadowColor: "#38BDF8",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: focusAnim, // Controls glowing depth intensity dynamically
        shadowRadius: 6,
      }}
      className="w-full flex-row items-center bg-white h-14 rounded-2xl px-4 mb-4"
    >
      {/* Dynamic Leading Icon */}
      <Feather name={iconName} size={20} color="#64748B" />

      {/* Core Input Field */}
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        secureTextEntry={secureText}
        editable={editable}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="flex-1 h-full ml-3 text-[#1E293B] font-medium"
        {...restProps}
      />

      {/* Conditional Password Visibility Eye Trigger */}
      {isPassword && (
        <TouchableOpacity
          onPress={() => setSecureText(!secureText)}
          className="p-1"
          activeOpacity={0.6}
        >
          <Feather
            name={secureText ? "eye-off" : "eye"}
            size={20}
            color="#64748B"
          />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}
