import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, useWindowDimensions } from "react-native";

import GeometricBackground from "@/components/GeometricBackground";

interface WelcomeScreenProps {
  onFinish: () => void;
}

const WelcomeScreen = ({ onFinish }: WelcomeScreenProps) => {
  const { width, height } = useWindowDimensions();
  const opacity = useRef(new Animated.Value(1)).current;

  // Use the smaller dimension to keep aspect ratios consistent
  const shortSide = Math.min(width, height);

  // Responsive sizing logic
  const stubySize = shortSide * 0.9;
  const titleSize = shortSide * 0.75;
  const overlapMargin = -(titleSize * 0.8);

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 500,
      delay: 4000,
      useNativeDriver: true,
    }).start(() => {
      onFinish();
    });
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <LinearGradient
        colors={["#7DD3FC", "#38BDF8", "#0EA5E9"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      >
        <GeometricBackground />
      </LinearGradient>

      <View style={styles.contentWrapper}>
        <LottieView
          source={require("../assets/animations/title.json")}
          autoPlay
          loop
          style={{ width: stubySize, height: stubySize, marginLeft: 15 }}
        />
        <LottieView
          source={require("../assets/animations/Stuby.json")}
          autoPlay
          loop
          style={{
            width: titleSize,
            height: titleSize,
            marginTop: overlapMargin,
          }}
          resizeMode="contain"
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  contentWrapper: {
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    // Add flexShrink to prevent content overflow on very small devices
    flexShrink: 1,
  },
});

export default WelcomeScreen;
