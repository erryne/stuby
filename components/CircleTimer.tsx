import LottieView from "lottie-react-native";
import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

const { width } = Dimensions.get("window");
const circleSize = width * 0.72;
const strokeWidth = 12;
const radius = (circleSize - strokeWidth) / 2;
const circumference = 2 * Math.PI * radius;

interface CircleTimerProps {
  progress: number;
  mode: string;
}

export default function CircleTimer({ progress, mode }: CircleTimerProps) {
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View
      style={[styles.circleWrap, { width: circleSize, height: circleSize }]}
    >
      <Svg
        width={circleSize}
        height={circleSize}
        style={StyleSheet.absoluteFill}
      >
        {/* Background Circle */}
        <Circle
          stroke="#64748B"
          fill="#FFFFFF"
          cx={circleSize / 2}
          cy={circleSize / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        {/* Progress Circle */}
        <Circle
          stroke="#1E293B"
          fill="none"
          cx={circleSize / 2}
          cy={circleSize / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          originX={circleSize / 2}
          originY={circleSize / 2}
        />
      </Svg>

      <LottieView
        source={
          mode === "Pomodoro"
            ? require("../assets/animations/Stuby.json")
            : require("../assets/animations/stuby-eating.json")
        }
        style={{ width: "75%", aspectRatio: 1 }}
        autoPlay
        loop
      />
    </View>
  );
}

const styles = StyleSheet.create({
  circleWrap: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
});
