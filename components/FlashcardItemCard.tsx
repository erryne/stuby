import { Trash2 } from "lucide-react-native";
import React from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface FlashcardItemProps {
  folderId: string;
  questionNumber: number;
  question: string;
  answer: string;
  isEditing?: boolean;
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
    <View style={styles.cardContainer}>
      {/* Top 70% Green */}
      <View style={styles.topSection}>
        <Text style={styles.questionNumberText}>
          Question {questionNumber}:
        </Text>
        <Text style={styles.questionText} numberOfLines={2}>
          {question}
        </Text>
      </View>

      {/* Bottom 30% Yellow */}
      <View style={styles.bottomSection}>
        <Text style={styles.answerText} numberOfLines={1}>
          Answer: {answer}
        </Text>

        {/* Trash icon, only shows if editing */}
        {isEditing && (
          <TouchableOpacity onPress={onDelete} activeOpacity={0.7}>
            <Trash2 size={24} color="red" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default FlashcardItemCard;

const styles = StyleSheet.create({
  cardContainer: {
    width: SCREEN_WIDTH * 0.9,
    height: 150,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    // Shadows
    backgroundColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  topSection: {
    height: "70%",
    width: "100%",
    backgroundColor: "#39675F",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingHorizontal: 16,
  },
  bottomSection: {
    height: "30%",
    width: "100%",
    backgroundColor: "#FFF9E5",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  questionNumberText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  questionText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 4,
  },
  answerText: {
    color: "#553A00",
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
});