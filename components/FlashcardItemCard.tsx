import React from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { Trash2 } from "lucide-react-native"; // red trash icon

const { width } = Dimensions.get("window");

interface FlashcardItemProps {
  folderId: string;
  questionNumber: number;
  question: string;
  answer: string;
  isEditing?: boolean; // show trash when editing
  onDelete?: () => void;
}

const FlashcardItemCard: React.FC<FlashcardItemProps> = ({
  questionNumber,
  question,
  answer,
  isEditing = false,
  onDelete,
}) => {
  return (
    <View
      className="overflow-hidden rounded-2xl shadow-md mb-4"
      style={{
        width: width * 0.9,
        height: 150,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      }}
    >
      {/* Top 70% Green */}
      <View className="h-[70%] w-full bg-[#39675F] flex flex-col justify-center items-start px-4">
        <Text className="text-white text-2xl font-bold">
          Question {questionNumber}:
        </Text>
        <Text className="text-white text-xl font-bold mt-1">{question}</Text>
      </View>

      {/* Bottom 30% Yellow */}
      <View className="h-[30%] w-full bg-[#FFF9E5] flex flex-row justify-between items-center px-4">
        <Text className="text-[#553A00] text-base">Answer: {answer}</Text>

        {/* Trash icon, only shows if editing */}
        {isEditing && (
          <TouchableOpacity onPress={onDelete}>
            <Trash2 size={24} color="red" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default FlashcardItemCard;
