import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
// Note: You can use @expo/vector-icons if using Expo, or react-native-vector-icons
import { Ionicons } from "@expo/vector-icons";

interface StickyNoteProps {
  title: string;
  content: string;
  onPress: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  index: number;
}

// Define the pin colors array
const PIN_COLORS = ["#BBF7D0", "#FECACA", "#E9D5FF", "#BAE6FD"];

export default function StickyNote({
  title,
  content,
  onPress,
  isFavorite,
  onToggleFavorite,
  index,
}: StickyNoteProps) {
  // Cycle through the colors array endlessly using modulo (%)
  const currentPinColor = PIN_COLORS[index % PIN_COLORS.length];

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.noteItem}
      onPress={onPress}
    >
      {/* Centered Pushpin Head Container 
        Inilagay ang pointerEvents="box-none" para hindi harangan ang heart button sa likod nito
      */}
      <View style={styles.pushPinContainer} pointerEvents="box-none">
        <View style={[styles.pinHead, { backgroundColor: currentPinColor }]} />
      </View>

      {/* Favorite Button */}
      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={onToggleFavorite}
        activeOpacity={0.7}
      >
        <Ionicons
          name={isFavorite ? "heart" : "heart-outline"}
          size={22}
          color={isFavorite ? "#EF4444" : "#A8A29E"}
        />
      </TouchableOpacity>

      <Text style={styles.noteTitle} numberOfLines={1}>
        {title || "Untitled"}
      </Text>
      <Text style={styles.noteContent} numberOfLines={3}>
        {content}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  noteItem: {
    backgroundColor: "#FEF9C3",
    flex: 1,
    aspectRatio: 1,
    margin: 8,
    padding: 20,
    paddingTop: 45,
    borderRadius: 8,
    borderWidth: 5,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  pushPinContainer: {
    position: "absolute",
    top: 12,
    left: 0, // Span the full width of the note
    right: 0, // Span the full width of the note
    alignItems: "center", // This guarantees perfect centering mathematically
    zIndex: 5,
  },
  pinHead: {
    width: 20,
    height: 20,
    borderRadius: 10,

    // Core Shadow Fixes preserved
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    elevation: 6,
  },
  favoriteButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 2,
    padding: 4,
  },
  noteTitle: {
    color: "#502707",
    fontSize: 16,
    fontWeight: "800",
    textTransform: "uppercase",
    marginBottom: 8,
    textAlign: "center",
  },
  noteContent: {
    color: "#78716C",
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
});
