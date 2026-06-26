import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { View } from "react-native";

export default function GeometricBackground() {
  return (
    <>
      {/* Top Right Blurred/Transparent Gradient Circle */}
      <View
        className="absolute opacity-80 rounded-full overflow-hidden"
        style={{ top: "-5%", right: "-15%", width: 280, height: 280 }}
      >
        <LinearGradient
          colors={["rgba(255, 255, 255, 0.35)", "rgba(255, 255, 255, 0.05)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1 }}
        />
      </View>

      {/* Large right Ring */}
      <View
        style={{
          position: "absolute",
          top: "20%",
          left: "-25%",
          width: 220,
          height: 220,
          borderRadius: 110,
          borderWidth: 12,
          borderColor: "rgba(255, 255, 255, 0.25)",
          backgroundColor: "transparent",
        }}
      />

      {/* Medium Left Ring */}
      <View
        style={{
          position: "absolute",
          top: "25%",
          left: "-15%",
          width: 140,
          height: 140,
          borderRadius: 70,
          borderWidth: 4,
          borderColor: "rgba(255, 255, 255, 0.15)",
          backgroundColor: "transparent",
        }}
      />

      {/* Bottom Right Ring */}
      <View
        style={{
          position: "absolute",
          bottom: "15%",
          right: "-10%",
          width: 190,
          height: 190,
          borderRadius: 95,
          borderWidth: 6,
          borderColor: "rgba(255, 255, 255, 0.18)",
          backgroundColor: "transparent",
        }}
      />

      {/* Small Right Solid Dot */}
      <View
        style={{
          position: "absolute",
          top: "52%",
          right: "15%",
          width: 12,
          height: 12,
          borderRadius: 6,
          backgroundColor: "rgba(255, 255, 255, 0.4)",
        }}
      />

      {/* Mid Left Solid Dot */}
      <View
        style={{
          position: "absolute",
          top: "45%",
          left: "40%",
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: "rgba(255, 255, 255, 0.12)",
        }}
      />

      {/* Mid Left Solid Dot */}
      <View
        style={{
          position: "absolute",
          top: "75%",
          left: "30%",
          width: 42,
          height: 42,
          borderRadius: 21,
          backgroundColor: "rgba(255, 255, 255, 0.4)",
        }}
      />

      {/* Mid Big Left Solid Dot */}
      <View
        style={{
          position: "absolute",
          top: "85%",
          width: 152,
          height: 152,
          borderRadius: 76,
          backgroundColor: "rgba(255, 255, 255, 0.12)",
        }}
      />
    </>
  );
}
