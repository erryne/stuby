import React from "react";
import { TouchableOpacity, ViewStyle } from "react-native";
import { Plus } from "lucide-react-native";

interface AddFloatingButtonProps {
  onPress: () => void;
  size?: number;
  backgroundColor?: string;
  iconColor?: string;
  style?: ViewStyle;
}

const AddFloatingButton: React.FC<AddFloatingButtonProps> = ({
  onPress,
  size = 64,
  backgroundColor = "#F5CE8E",
  iconColor = "black",
  style,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
          alignItems: "center",
          justifyContent: "center",
          position: "absolute",
          bottom: 24,
          right: 24,
          elevation: 6, // Android shadow

            
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 0.3,
              shadowRadius: 10,
              
            
        },
        style,
      ]}
    >
      <Plus size={size * 0.5} color={iconColor} />
    </TouchableOpacity>
  );
};

export default AddFloatingButton;
