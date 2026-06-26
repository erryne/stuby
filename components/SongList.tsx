import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

interface Song {
  id: string;
  title: string;
  duration?: string; // <-- Updated from durationMillis to accept the string format (e.g., "3:42")
}

interface SongListProps {
  songs: Song[];
  currentId: string;
  isEditing: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function SongList({
  songs,
  currentId,
  isEditing,
  onSelect,
  onDelete,
}: SongListProps) {
  return (
    <ScrollView className="mt-4 flex-1" showsVerticalScrollIndicator={false}>
      {songs.map((item) => (
        <TouchableOpacity
          key={item.id}
          onPress={() => onSelect(item.id)}
          className={`flex-row items-center justify-between p-4 mb-2 rounded-2xl ${
            currentId === item.id ? "bg-[#1E293B]/20" : "bg-white"
          }`}
        >
          <View className="flex-1 mr-4">
            <Text
              className={`text-lg font-bold ${currentId === item.id ? "text-white" : "text-black"}`}
              numberOfLines={1}
            >
              {item.title}
            </Text>

            {/* Renders the pre-saved string directly or defaults to 0:00 if missing */}
            <Text
              className={`${currentId === item.id ? "text-white/70" : "text-black/50"} text-sm mt-0.5`}
            >
              {item.duration || "0:00"}
            </Text>
          </View>

          {isEditing && (
            <TouchableOpacity
              onPress={() => onDelete(item.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // Makes the button easier to tap
            >
              <Ionicons name="trash-outline" size={24} color="#FF6B6B" />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
