import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import LottieView from "lottie-react-native";
import React from "react";
import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import GeometricBackground from "@/components/GeometricBackground";
import TitleHeader from "@/components/TitleHeader";

// --- Scaling Utilities ---
const { width, height } = Dimensions.get("window");
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

const horizontalScale = (size: number) => (width / guidelineBaseWidth) * size;
const verticalScale = (size: number) => (height / guidelineBaseHeight) * size;
const moderateScale = (size: number, factor = 0.5) =>
  size + (horizontalScale(size) - size) * factor;

// --- Component ---
export default function WelcomeIntroduction() {
  const router = useRouter();

  const handleNextPage = () => {
    router.push("/introduction/introductionFlow");
  };

  return (
    <LinearGradient
      colors={["#7DD3FC", "#38BDF8", "#0EA5E9"]}
      style={styles.container}
    >
      <View style={StyleSheet.absoluteFill}>
        <GeometricBackground />
      </View>
      <StatusBar style="light" />

      <SafeAreaView style={styles.content}>
        <LottieView
          autoPlay
          loop
          style={styles.lottie}
          source={require("../../assets/animations/Stuby.json")}
        />

        <TitleHeader title="WELCOME" size="xl" align="center" color="#ffffff" />

        <Text style={styles.description}>
          Welcome to STUBY, your smart study buddy for better learning, designed
          to transform your academic journey into a seamless and highly
          productive experience.
        </Text>

        <TouchableOpacity onPress={handleNextPage} style={styles.customButton}>
          <Text style={styles.customButtonText}>Get Started</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: horizontalScale(40),
  },
  lottie: {
    width: horizontalScale(280),
    height: horizontalScale(280),
  },
  description: {
    color: "white",
    textAlign: "center",
    fontSize: moderateScale(18),
    marginVertical: verticalScale(20),
    marginHorizontal: horizontalScale(20),
    lineHeight: horizontalScale(24),
  },
  customButton: {
    backgroundColor: "#334155",
    borderRadius: moderateScale(16),
    height: verticalScale(52),
    width: "80%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: verticalScale(14),
  },
  customButtonText: {
    color: "white",
    fontSize: moderateScale(16),
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
