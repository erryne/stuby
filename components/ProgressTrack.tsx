import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
    interpolate,
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSequence,
    withSpring,
} from "react-native-reanimated";

interface ProgressTrackProps {
  finishedCount: number;
  totalCount: number;
}

export default function ProgressTrack({
  finishedCount,
  totalCount,
}: ProgressTrackProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const progressPercent =
    totalCount > 0 ? Math.min(100, (finishedCount / totalCount) * 100) : 0;

  const animatedProgress = useSharedValue(0);
  const scale = useSharedValue(1); // Para sa bounce effect

  const translateY = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withSpring(progressPercent, {
      damping: 15,
      stiffness: 90,
    });

    // 1. Vertical Movement (translateY)
    if (progressPercent === 100 || progressPercent === 0) {
      translateY.value = withSpring(-8, { damping: 20, stiffness: 100 });
    } else {
      translateY.value = withSpring(0, { damping: 20, stiffness: 100 });
    }

    // 2. Scale Logic:
    // Mag-pop ng konti (1.15) tapos mag-settle sa 1.1 para hindi siya mukhang dambuhala
    if (progressPercent === 100 || progressPercent === 0) {
      scale.value = withSequence(
        withDelay(300, withSpring(1.15, { damping: 10, stiffness: 200 })), // Peak size
        withSpring(1.1, { damping: 10, stiffness: 200 }), // Settle size (hindi 1.0)
      );
    } else {
      // Kapag wala sa edge, balik sa normal na laki (1.0)
      scale.value = withSpring(1, { damping: 10, stiffness: 200 });
    }
  }, [progressPercent]);

  // Existing animation styles...
  const animatedColors = useAnimatedStyle(() => {
    const val = Math.max(0, animatedProgress.value);
    return {
      backgroundColor: interpolateColor(
        val,
        [0, 50, 80, 100],
        ["#EF4444", "#FBBF24", "#10B981", "#10B981"],
      ),
      borderColor: interpolateColor(
        val,
        [0, 50, 80, 100],
        ["#F87171", "#FCD34D", "#34D399", "#34D399"],
      ),
    };
  });

  const animatedBarStyles = useAnimatedStyle(() => ({
    width: trackWidth
      ? (Math.max(0, Math.min(100, animatedProgress.value)) / 100) * trackWidth
      : 0,
  }));

  const animatedBubbleStyles = useAnimatedStyle(() => {
    const progress = Math.max(0, Math.min(100, animatedProgress.value));
    const left = trackWidth ? (progress / 100) * trackWidth : 0;
    const offset = 24;

    return {
      transform: [
        { translateX: Math.max(0, Math.min(trackWidth - 48, left - offset)) },
        { translateY: translateY.value }, // Gamitin ang shared value
        { scale: scale.value },
      ],
    };
  });

  const animatedGlassStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      Math.max(0, animatedProgress.value),
      [0, 5],
      [0, 1],
      "clamp",
    ),
  }));

  return (
    <View className="mt-4 px-1 w-full">
      <View className="h-14 justify-end pb-1 relative w-full pt-6">
        <Animated.View
          style={[animatedBubbleStyles, animatedColors, styles.bubbleShadow]}
          className="items-center justify-center border rounded-md py-1 w-12 z-20"
        >
          <Text className="font-black text-[10px] text-white text-center">
            {Math.round(progressPercent)}%
          </Text>
          <Animated.View style={[styles.arrowPointer, animatedColors]} />
        </Animated.View>

        <View
          onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
          className="w-full bg-sky-950/20 rounded-full h-5 border border-white/5 overflow-hidden justify-center relative z-10"
        >
          <Animated.View
            style={[animatedBarStyles, animatedColors, { overflow: "hidden" }]}
            className="h-full rounded-full relative"
          >
            <Animated.View
              style={[
                {
                  height: 4,
                  borderRadius: 999,
                  backgroundColor: "rgba(255,255,255,0.4)",
                  position: "absolute",
                  top: 4,
                  left: 6,
                  right: 6,
                },
                animatedGlassStyle,
              ]}
            />
          </Animated.View>
        </View>
      </View>

      <View className="flex-row justify-between items-center mb-1.5 mt-1">
        <Text className="text-white font-black text-[9px] tracking-widest">
          TRACK PROGRESS
        </Text>
        <Text className="text-black font-bold text-[10px] bg-white px-2 py-0.5 rounded-full">
          {finishedCount} of {totalCount} Done
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bubbleShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 1.5,
    elevation: 3,
  },
  arrowPointer: {
    width: 8,
    height: 8,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    transform: [{ rotate: "45deg" }],
    position: "absolute",
    bottom: -4,
    alignSelf: "center",
  },
});
