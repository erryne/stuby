// components/CustomTextInput.tsx
import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Dimensions,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";

interface CustomTextInputProps extends TextInputProps {
  placeholder?: string;
  inputName?: string;
  iconName?: keyof typeof Feather.glyphMap;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const CustomTextInput: React.FC<CustomTextInputProps> = ({
  placeholder,
  inputName,
  iconName,
  secureTextEntry,
  ...props
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const shouldHideText = secureTextEntry ? !isPasswordVisible : false;

  // Responsive sizes

  const inputHeight = SCREEN_WIDTH * 0.12; // roughly 12% of screen width for height
  const borderRadius = inputHeight / 2; // pill-shaped
  const iconSize = SCREEN_WIDTH * 0.05; // icon ~5% of screen width
  const fontSize = SCREEN_WIDTH * 0.033; // text ~4% of screen width
  const labelFontSize = SCREEN_WIDTH * 0.035; // label slightly smaller

  return (
    <View style={{ justifyContent: "center", marginBottom: 8 }}>
      {inputName ? (
        <Text
          style={{
            color: "#6B7280",
            fontWeight: "bold",
            marginBottom: 4,
            marginLeft: 8,
            fontSize: labelFontSize,
          }}
        >
          {inputName}
        </Text>
      ) : null}

      <View
        style={{
          width: "100%",
          height: inputHeight,
          backgroundColor: "white",
          borderWidth: 2,
          borderColor: "black",
          borderRadius: borderRadius,
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
        }}
      >
        {iconName && (
          <Feather name={iconName} size={iconSize} color="#D1D1D1" />
        )}

        <TextInput
          style={{
            flex: 1,
            marginLeft: iconName ? 8 : 0,
            color: "black",
            fontWeight: "bold",
            fontSize: fontSize,
          }}
          placeholder={placeholder}
          placeholderTextColor="#D1D1D1"
          secureTextEntry={shouldHideText}
          {...props}
        />

        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            activeOpacity={0.7}
          >
            <Feather
              name={isPasswordVisible ? "eye" : "eye-off"}
              size={iconSize}
              color="#D1D1D1"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default CustomTextInput;
