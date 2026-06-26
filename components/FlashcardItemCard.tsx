import { Trash2 } from "lucide-react-native";
import React from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

const DESIGN_ICONS: Record<string, any> = {
  calculus: require("../assets/images/designs/calculus.png"),
  drrr: require("../assets/images/designs/drrr.png"),
  english: require("../assets/images/designs/english.png"),
  experiment: require("../assets/images/designs/experiment.png"),
  health: require("../assets/images/designs/health.png"),
  "media-literacy": require("../assets/images/designs/mainl.png"),
  math: require("../assets/images/designs/math.png"),
  pe: require("../assets/images/designs/pe.png"),
  philosophy: require("../assets/images/designs/philosophy.png"),
  science: require("../assets/images/designs/science.png"),
  "social-studies": require("../assets/images/designs/socialstudies.png"),
  statistics: require("../assets/images/designs/statistics.png"),
  technology: require("../assets/images/designs/technology.png"),
  writings: require("../assets/images/designs/writings.png"),
};

interface FlashcardItemProps {
  folderId: string;
  questionNumber: number;
  question: string;
  answer: string;
  isEditing?: boolean;
  onDelete?: () => void;
  design?: string;
  searchQuery?: string; // <-- Added searchQuery to props
}

const FlashcardItemCard: React.FC<FlashcardItemProps> = ({
  questionNumber,
  question,
  answer,
  isEditing = false,
  onDelete,
  design,
  searchQuery = "", // <-- Default to empty string
}) => {
  // Helper function to find matching search query text fragments and highlight them yellow
  const renderHighlightedText = (text: string, highlight: string) => {
    if (!highlight || !highlight.trim()) {
      return text;
    }

    // Escape regex special characters to prevent app crashes on dynamic user input
    const escapedHighlight = highlight.replace(
      /[-\/\\^$*+?.()|[\]{}]/g,
      "\\$&",
    );
    const regex = new RegExp(`(${escapedHighlight})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <Text key={i} style={styles.highlight}>
          {part}
        </Text>
      ) : (
        part
      ),
    );
  };

  return (
    <View style={styles.cardContainer}>
      {design && DESIGN_ICONS[design] && (
        <Image
          source={DESIGN_ICONS[design]}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
      )}

      <View style={styles.overlay} />

      {/* Content Container - Uses flex-1 to handle dynamic heights */}
      <View style={styles.contentContainer}>
        <Text
          className="text-white text-lg font-black"
          style={styles.textShadow}
        >
          Question {questionNumber}:
        </Text>
        <Text
          className="text-white text-base font-bold mt-1"
          style={styles.textShadow}
          numberOfLines={3} // Limits to 3 lines before adding "..."
        >
          {renderHighlightedText(question, searchQuery)}
        </Text>
      </View>

      {/* Answer Section */}
      <View style={styles.footerContainer}>
        <Text
          className="text-[#334155] font-bold text-sm flex-1 mr-2"
          numberOfLines={2}
        >
          Answer: {renderHighlightedText(answer, searchQuery)}
        </Text>
        {isEditing && (
          <TouchableOpacity onPress={onDelete}>
            <Trash2 size={18} color="red" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: width * 0.9,
    minHeight: 130, // Changed to minHeight to allow growth
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 16,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  contentContainer: {
    flex: 1, // Allows this to expand
    padding: 16,
    justifyContent: "center",
  },
  footerContainer: {
    padding: 12,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textShadow: {
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  highlight: {
    backgroundColor: "yellow", // Change this to "yellow" for full neon brightness!
    color: "#000000",
  },
});

export default FlashcardItemCard;
