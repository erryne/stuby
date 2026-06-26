import { Check, Trash2 } from "lucide-react-native";
import React from "react";
// Image component remains for rendering PNG icons
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface TaskItemProps {
  item: { id: string; task: string; done: boolean; emoji?: string };
  isEditingMode: boolean;
  onToggle: (id: string, done: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (item: any) => void;
}

// --- Dynamic Asset Mapping base sa TaskModal ---
const TASK_IMAGES: Record<string, any> = {
  chem: require("../assets/images/todo_items/todoChemIcon.png"),
  health: require("../assets/images/todo_items/todoHealthIcon.png"),
  lit: require("../assets/images/todo_items/todoLitIcon.png"),
  math: require("../assets/images/todo_items/todoMathIcon.png"),
  media: require("../assets/images/todo_items/todoMediaIcon.png"),
  philo: require("../assets/images/todo_items/todoPhiloIcon.png"),
  phone: require("../assets/images/todo_items/todoPhoneIcon.png"),
  science: require("../assets/images/todo_items/todoScienceIcon.png"),
  sports: require("../assets/images/todo_items/todoSportsIcon.png"),
  stats: require("../assets/images/todo_items/todoStatsIcon.png"),
};

// EMOJI_BG_COLORS array has been removed

const TaskItem = React.memo(
  ({ item, isEditingMode, onToggle, onDelete, onEdit }: TaskItemProps) => {
    // Hash function and color selection logic have been removed

    return (
      <View
        style={styles.shadow}
        className="mx-5 mb-3 bg-white p-4 rounded-2xl flex-row items-center"
      >
        {/* Category Image Icon Container (Background logic removed) */}
        <View
          // Dynamic dynamic background style removed.
          // Removed rounded-full to allow icon padding to handle shape.
          className="w-10 h-10 items-center justify-center mr-3 overflow-hidden"
        >
          {/* Renders the PNG icon using mapping with fallback */}
          <Image
            source={TASK_IMAGES[item.emoji || "chem"] || TASK_IMAGES.chem}
            style={styles.iconImage}
          />
        </View>

        {/* Task Text */}
        <TouchableOpacity className="flex-1 mr-4" onPress={() => onEdit(item)}>
          <Text
            className={`text-lg font-semibold ${
              item.done ? "text-slate-400 line-through" : "text-slate-800"
            }`}
          >
            {item.task}
          </Text>
        </TouchableOpacity>

        {/* Delete Button (Only visible in editing mode) */}
        {isEditingMode && (
          <TouchableOpacity
            onPress={() => onDelete(item.id)}
            className="mr-3 p-2 bg-red-50 rounded-lg"
          >
            <Trash2 size={20} color="#EF4444" />
          </TouchableOpacity>
        )}

        {/* Toggle Done Button */}
        <TouchableOpacity
          onPress={() => onToggle(item.id, item.done)}
          className={`w-10 h-10 rounded-full border-2 items-center justify-center ${
            item.done
              ? "bg-emerald-500 border-emerald-500"
              : "bg-slate-50 border-slate-200"
          }`}
        >
          {item.done && <Check size={20} color="white" strokeWidth={3} />}
        </TouchableOpacity>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Android shadow
  },
  iconImage: {
    // Standardized size to fit well within the 10x10 (w-10 h-10) container
    width: 32,
    height: 32,
    resizeMode: "contain",
  },
});

export default TaskItem;
