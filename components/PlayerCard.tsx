import React, { useRef, useState } from "react";
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  PanResponder,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface PlayerCardProps {
  image: any;
  folderTitle: string;
  totalSongs: number;
  totalDuration: string;
  currentTitle: string;
  duration: number;
  position: number;
  isPlaying: boolean;
  isShuffle: boolean;
  isRepeat: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onSeek: (millis: number) => void;
  onAddSong: () => void;

  
}

export default function PlayerCard({
  image,
  folderTitle,
  totalSongs,
  totalDuration,
  currentTitle,
  duration,
  position,
  isPlaying,
  isShuffle,
  isRepeat,
  onPlayPause,
  onNext,
  onPrev,
  onToggleShuffle,
  onToggleRepeat,
  onSeek,
  onAddSong,
}: PlayerCardProps) {
  const barWidth = useRef(0);

  const [isDragging, setIsDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);

  const realProgress = duration ? position / duration : 0;
  const progress = isDragging ? dragProgress : realProgress;

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes} min ${seconds} s`;
  };

  const formatClock = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleMove = (x: number) => {
    if (!barWidth.current || !duration) return;

    let percentage = x / barWidth.current;
    if (percentage < 0) percentage = 0;
    if (percentage > 1) percentage = 1;

    setDragProgress(percentage);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,

    onPanResponderGrant: (evt) => {
      setIsDragging(true);
      handleMove(evt.nativeEvent.locationX);
    },

    onPanResponderMove: (evt) => {
      handleMove(evt.nativeEvent.locationX);
    },

    onPanResponderRelease: () => {
      setIsDragging(false);
      const newPosition = dragProgress * duration;
      onSeek(newPosition);
    },
  });

  return (
    <ImageBackground
      source={image}
      resizeMode="cover"
      className="rounded-t-3xl overflow-hidden"
    >
      {/* ADD SONG BUTTON */}
<View className="absolute top-4 right-4 z-10">
  <TouchableOpacity
    onPress={onAddSong}
    className="flex-row items-center px-4 py-2 rounded-full bg-black/50"
  >
    <View className="w-6 h-6 bg-white rounded-full items-center justify-center mr-2">
      <Ionicons name="add" size={16} color="black" />
    </View>

    <Text className="text-white font-semibold text-sm">
      Add a song
    </Text>
  </TouchableOpacity>
</View>

      <View className="bg-black/60 px-6 py-6">

        {/* HEADER */}
        <Text className="text-white text-3xl font-bold">
          {folderTitle}
        </Text>

        <Text className="text-gray-200 mt-1">
  {totalSongs} songs · {totalDuration}
</Text>

        <View className="flex-row justify-between mt-6">

          {/* LEFT SIDE */}
          <View className="flex-1 pr-4">
            <Text className="text-white text-lg font-semibold">
              {currentTitle}
            </Text>

            <View
              className="mt-3"
              onLayout={(e) =>
                (barWidth.current = e.nativeEvent.layout.width)
              }
              {...panResponder.panHandlers}
            >
              <View className="h-[4px] bg-white/30 rounded-full">
                <View
                  className="h-[4px] bg-red-500 rounded-full"
                  style={{
                    width: `${progress * 100}%`,
                  }}
                />
              </View>

              {/* Thumb */}
              <View
                style={{
                  position: "absolute",
                  left: `${progress * 100}%`,
                  marginLeft: -6,
                  top: -4,
                }}
                className={`${
                  isDragging ? "w-4 h-4" : "w-3 h-3"
                } bg-white rounded-full`}
              />

              <Text className="text-white text-xs mt-2">
                {formatClock(
                  isDragging
                    ? dragProgress * duration
                    : position
                )}
              </Text>
            </View>
          </View>

          {/* RIGHT SIDE */}
          <View className="items-center justify-center">

            {/* Controls */}
            <View className="flex-row items-center space-x-4">
              <TouchableOpacity onPress={onPrev}>
                <Ionicons
                  name="play-skip-back"
                  size={22}
                  color="white"
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onPlayPause}
                className="w-14 h-14 bg-white rounded-full justify-center items-center"
              >
                <Ionicons
                  name={isPlaying ? "pause" : "play"}
                  size={26}
                  color="#7C5CFF"
                />
              </TouchableOpacity>

              <TouchableOpacity onPress={onNext}>
                <Ionicons
                  name="play-skip-forward"
                  size={22}
                  color="white"
                />
              </TouchableOpacity>
            </View>

            {/* Shuffle + Repeat */}
            <View className="flex-row space-x-6 mt-4">
              <TouchableOpacity onPress={onToggleShuffle}>
                <Ionicons
                  name="shuffle"
                  size={20}
                  color={isShuffle ? "#7C5CFF" : "white"}
                />
              </TouchableOpacity>

              <TouchableOpacity onPress={onToggleRepeat}>
                <Ionicons
                  name="repeat"
                  size={20}
                  color={isRepeat ? "#7C5CFF" : "white"}
                />
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </View>
    </ImageBackground>

    
    
  );
}
