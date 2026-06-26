import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TextInput, View, ViewStyle } from "react-native";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  containerStyle?: ViewStyle;
}

export default function SearchBar({
  value,
  onChangeText,
  placeholder = "Search...",
  containerStyle,
}: SearchBarProps) {
  return (
    <View style={[styles.searchContainer, containerStyle]}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder={placeholder}
          placeholderTextColor="rgba(255,255,255,0.5)"
          value={value}
          onChangeText={onChangeText}
          textAlignVertical="center"
        />
        <Ionicons name="search" size={20} color="white" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    marginHorizontal: 24,
    marginBottom: 15,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(51, 65, 85, 0.2)",
    borderWidth: 3,
    borderColor: "#ffffff",
    borderRadius: 20,
    paddingHorizontal: 20,
    height: 50,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
    color: "white",
    padding: 0,
    margin: 0,
    includeFontPadding: false,
  },
});
