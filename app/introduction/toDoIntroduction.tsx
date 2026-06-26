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

import CustomButton from "@/components/CustomButton";
import GeometricBackground from "@/components/GeometricBackground";
import TitleHeader from "@/components/TitleHeader";

// --- Scaling Utilities ---
const { width, height } = Dimensions.get("window");
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

const hs = (size: number) => (width / guidelineBaseWidth) * size;
const vs = (size: number) => (height / guidelineBaseHeight) * size;
const ms = (size: number, factor = 0.5) => size + (hs(size) - size) * factor;

interface ToDoIntroductionProps {
  isLastPage?: boolean;
}

export default function ToDoIntroduction({
  isLastPage,
}: ToDoIntroductionProps) {
  const router = useRouter();
  const animation = useRef<LottieView>(null);

  const handleNextPage = () => {
    router.push("/");
  };

  return (
    <LinearGradient
      colors={["#38BDF8", "#0EA5E9", "#0284C7"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={StyleSheet.absoluteFill}>
        <GeometricBackground />
      </View>

      <StatusBar style="light" />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.lottieWrapper}>
          <View
            style={[
              styles.circleContainer,
              { width: hs(290), height: hs(290), borderRadius: hs(145) },
            ]}
          >
            <LottieView
              autoPlay
              loop
              ref={animation}
              style={{ width: hs(250), height: hs(250) }}
              source={require("../../assets/animations/todo.json")}
            />
          </View>
        </View>

        <TitleHeader
          title="TASK READY"
          size="xl"
          align="center"
          color="#ffffff"
          containerStyle={{ marginTop: vs(24), marginBottom: vs(16) }}
          titleStyle={styles.titleStyle}
        />

        <Text style={styles.description}>
          Organize your tasks and track your progress with ease. Stay on top of
          your goals every day!
        </Text>

        {isLastPage && (
          <View style={styles.buttonContainer}>
            <CustomButton title="Go to Dashboard" onPress={handleNextPage} />
          </View>
        )}
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
    borderColor: "#BAE6FD",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
      },
      android: { elevation: 8 },
    }),
  },
  titleStyle: {
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  description: {
    color: "white",
    textAlign: "center",
    opacity: 0.95,
    fontWeight: "bold",
    fontSize: ms(18),
    lineHeight: ms(24),
    marginHorizontal: hs(20),
  },
  buttonContainer: {
    width: "100%",
  },
});
