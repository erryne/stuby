import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import LottieView from "lottie-react-native";
import React, { useRef } from "react";
import {
  Dimensions,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import GeometricBackground from "@/components/GeometricBackground";
import TitleHeader from "@/components/TitleHeader";

// --- Scaling Utilities ---
const { width, height } = Dimensions.get("window");
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

const hs = (size: number) => (width / guidelineBaseWidth) * size;
const vs = (size: number) => (height / guidelineBaseHeight) * size;
const ms = (size: number, factor = 0.5) => size + (hs(size) - size) * factor;

export default function CardIntroduction() {
  const router = useRouter();
  const animation = useRef<LottieView>(null);

  // Responsive dimensions
  const LOGO_WIDTH = hs(250);
  const CIRCLE_SIZE = LOGO_WIDTH + hs(40);

  return (
    <LinearGradient
      colors={["#FDE047", "#FACC15", "#EAB308"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={StyleSheet.absoluteFill}>
        <GeometricBackground />
      </View>

      <StatusBar style="light" />

      <SafeAreaView style={styles.safeArea}>
        {/* Lottie Animation with Circular Background */}
        <View style={styles.lottieWrapper}>
          <View
            style={[
              styles.circleContainer,
              {
                width: CIRCLE_SIZE,
                height: CIRCLE_SIZE,
                borderRadius: CIRCLE_SIZE / 2,
              },
            ]}
          >
            <LottieView
              autoPlay
              loop
              ref={animation}
              style={{ width: LOGO_WIDTH, height: LOGO_WIDTH }}
              source={require("../../assets/animations/flashcard.json")}
            />
          </View>
        </View>

        {/* Title Header */}
        <TitleHeader
          title="FLASHCARD"
          size="xl"
          align="center"
          color="#ffffff"
          containerStyle={{ marginTop: vs(24), marginBottom: vs(16) }}
          titleStyle={styles.titleStyle}
        />

        {/* Bolder Sentence */}
        <Text style={styles.description}>
          Turn your lessons into quick, easy-to-review cards. Master concepts
          faster and smarter!
        </Text>

        <View style={styles.buttonContainer}>
          {/* Add your button component here */}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: hs(40),
  },
  lottieWrapper: {
    marginBottom: vs(40),
    alignItems: "center",
  },
  circleContainer: {
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: hs(10),
    borderColor: "#FEF2C7",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
      },
      android: { elevation: 6 },
    }),
  },
  titleStyle: {
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 5,
  },
  description: {
    color: "white",
    textAlign: "center",
    opacity: 0.95,
    fontWeight: "bold",
    fontSize: ms(18),
    lineHeight: ms(24),
    // Added horizontal margin
    marginHorizontal: hs(20),
  },
  buttonContainer: {
    marginTop: vs(48),
    width: "100%",
    paddingHorizontal: hs(20),
  },
});
