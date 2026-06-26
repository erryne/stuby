import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";

const BackgroundPattern: React.FC = () => {
  // 25 Icons para puno ang screen
  const manualPositions = [
    // Top Row
    { top: 2, left: 5, rotate: "10deg", icon: "book" as const },
    { top: 5, left: 35, rotate: "-15deg", icon: "pencil" as const },
    { top: 2, left: 65, rotate: "5deg", icon: "school" as const },
    { top: 5, left: 90, rotate: "-10deg", icon: "library" as const },
    // Upper Middle
    { top: 20, left: 15, rotate: "-20deg", icon: "laptop" as const },
    { top: 25, left: 45, rotate: "15deg", icon: "flask" as const },
    { top: 18, left: 75, rotate: "0deg", icon: "calculator" as const },
    { top: 22, left: 95, rotate: "20deg", icon: "create" as const },
    // Center
    { top: 40, left: 5, rotate: "30deg", icon: "book" as const },
    { top: 42, left: 30, rotate: "-5deg", icon: "school" as const },
    { top: 45, left: 55, rotate: "10deg", icon: "pencil" as const },
    { top: 38, left: 85, rotate: "-25deg", icon: "laptop" as const },
    { top: 55, left: 15, rotate: "0deg", icon: "library" as const },
    { top: 58, left: 45, rotate: "15deg", icon: "flask" as const },
    { top: 52, left: 70, rotate: "-10deg", icon: "create" as const },
    // Lower Middle
    { top: 70, left: 5, rotate: "-30deg", icon: "calculator" as const },
    { top: 75, left: 35, rotate: "20deg", icon: "book" as const },
    { top: 72, left: 60, rotate: "-5deg", icon: "school" as const },
    { top: 78, left: 90, rotate: "10deg", icon: "pencil" as const },
    // Bottom
    { top: 92, left: 10, rotate: "5deg", icon: "laptop" as const },
    { top: 95, left: 40, rotate: "-15deg", icon: "library" as const },
    { top: 90, left: 65, rotate: "25deg", icon: "flask" as const },
    { top: 95, left: 92, rotate: "-10deg", icon: "calculator" as const },
    { top: 85, left: 50, rotate: "0deg", icon: "create" as const },
    { top: 15, left: 5, rotate: "45deg", icon: "book" as const },
  ];

  return (
    <View style={styles.patternContainer} pointerEvents="none">
      {manualPositions.map((item, index) => (
        <View
          key={index}
          style={[
            styles.iconWrapper,
            {
              top: `${item.top}%`,
              left: `${item.left}%`,
              transform: [{ rotate: item.rotate }],
            },
          ]}
        >
          <Ionicons
            name={item.icon}
            size={56} // Bahagyang pinaliit para hindi mag-overlap nang sobra
            color="rgba(255, 255, 255, 0.1)" // Mas light para hindi distract sa content
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  patternContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  iconWrapper: {
    position: "absolute",
  },
});

export default BackgroundPattern;
