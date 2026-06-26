import CircleTimer from "@/components/CircleTimer";
import CustomHeader from "@/components/CustomHeader";
import GeometricBackground from "@/components/GeometricBackground";
import TitleHeader from "@/components/TitleHeader";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import React from "react";
import {
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTimer } from "../context/TimerContext";

export default function Pomodoro() {
  const { width, height } = useWindowDimensions();
  const scale = width / 375; // Baseline width of 375 (standard iPhone)

  const {
    mode,
    setMode,
    isRunning,
    setIsRunning,
    timers,
    setTimers,
    DEFAULT_TIMES,
    justFinished,
    setJustFinished,
  } = useTimer();

  const secondsLeft = timers[mode];
  const progress =
    secondsLeft / DEFAULT_TIMES[mode as keyof typeof DEFAULT_TIMES];

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleModeChange = (tab: string) => {
    setMode(tab);
    setIsRunning(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <LinearGradient
        colors={["#7DD3FC", "#38BDF8", "#0EA5E9"]}
        style={styles.fullFlex}
      >
        <View style={StyleSheet.absoluteFillObject}>
          <GeometricBackground />
        </View>

        <SafeAreaView style={styles.fullFlex}>
          <CustomHeader />

          <View style={styles.contentContainer}>
            <TitleHeader
              title="POMODORO"
              size="xl"
              align="center"
              color="#ffffff"
              containerStyle={{ marginTop: -35, marginBottom: 10 }}
              titleStyle={{
                textShadowColor: "rgba(0, 0, 0, 0.8)",
                textShadowOffset: { width: 2, height: 2 },
                textShadowRadius: 4,
              }}
            />

            <View style={styles.tabsRow}>
              {Object.keys(DEFAULT_TIMES).map((tab) => (
                <TouchableOpacity
                  key={tab}
                  onPress={() => handleModeChange(tab)}
                  style={[styles.tabBtn, mode === tab && styles.tabBtnActive]}
                >
                  <Text
                    style={[
                      styles.tabText,
                      mode === tab && styles.tabTextActive,
                      { fontSize: 13 * scale },
                    ]}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <CircleTimer progress={progress} mode={mode} />

            <Text style={[styles.timerText, { fontSize: 50 * scale }]}>
              {formatTime(secondsLeft)}
            </Text>

            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                onPress={() => setIsRunning(!isRunning)}
                style={[styles.playBtn, isRunning && styles.playBtnActive]}
              >
                <Text style={styles.playBtnText}>
                  {isRunning ? "PAUSE" : "PLAY"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setTimers((prev) => ({
                    ...prev,
                    [mode]: DEFAULT_TIMES[mode as keyof typeof DEFAULT_TIMES],
                  }));
                  setIsRunning(false);
                }}
                style={styles.resetBtn}
              >
                <Text style={styles.resetBtnText}>Reset Current</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <Modal visible={justFinished} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[styles.mascotContainer, { height: height * 0.18 }]}>
              <LottieView
                source={require("../../assets/animations/bell.json")}
                autoPlay
                loop={true}
                style={styles.mascot}
              />
            </View>
            <Text style={styles.modalTitle}>Time's Up!</Text>
            <Text style={styles.modalSub}>{mode} is over.</Text>
            <TouchableOpacity
              onPress={() => setJustFinished(false)}
              style={styles.btnCelebrate}
            >
              <Text style={styles.btnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDFBEA" },
  fullFlex: { flex: 1 },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: "6%",
  },
  tabsRow: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    padding: 4,
    marginBottom: "3%",
  },
  tabBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  tabBtnActive: { backgroundColor: "#BAE6FD" },
  tabText: { fontWeight: "500", color: "rgba(74, 60, 48, 0.6)" },
  tabTextActive: { color: "#4A3C30" },
  timerText: {
    color: "#000000",
    marginVertical: 24,
    letterSpacing: 3,
    fontWeight: "800",
  },
  buttonsContainer: { alignItems: "center", width: "100%", gap: 12 },
  playBtn: {
    width: "60%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(0,0,0,0.08)",
  },
  playBtnActive: { backgroundColor: "rgba(0,0,0,0.16)" },
  playBtnText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4A3C30",
    letterSpacing: 3,
  },
  resetBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  resetBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#7A6654",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  mascotContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  mascot: { width: "100%", height: "100%", backgroundColor: "white" },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#4A3C30",
    marginTop: 8,
  },
  modalSub: {
    fontSize: 14,
    color: "#7A6654",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 18,
  },
  btnCelebrate: {
    backgroundColor: "#0EA5E9",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 14,
  },
  btnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },
});
