import React from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { SquarePen, Trash2 } from "lucide-react-native";

interface EditDeletePopUpProps {
  onEdit: () => void;
  onDelete: () => void;
}

// Get screen width
const { width: SCREEN_WIDTH } = Dimensions.get("window");

const EditDeletePopUp: React.FC<EditDeletePopUpProps> = ({ onEdit, onDelete }) => {
  // Responsive width (e.g., 25% of screen width)
  const popupWidth = SCREEN_WIDTH * 0.22;

  return (
    <View
      className="absolute top-4 right-0 bg-white rounded-lg p-2 shadow-lg"
      style={{ width: popupWidth }}
    >
      {/* Edit Button */}
      <TouchableOpacity
        className="flex-row items-center space-x-3"
        onPress={onEdit}
      >
        <SquarePen size={18} color="#85ADDA" />
        <Text className="text-black font-semibold"> Edit</Text>
      </TouchableOpacity>

      {/* Delete Button */}
      <TouchableOpacity
        className=" flex-row items-center space-x-3 mt-2"
        onPress={onDelete}
      >
        <Trash2 size={18} color="red" />
        <Text className="text-black font-semibold"> Delete</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EditDeletePopUp;
