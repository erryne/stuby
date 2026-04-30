import LottieView from "lottie-react-native";
import {
  Alert,
  Dimensions,
  ImageBackground,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import { create } from "zustand";
import TitleHeader from "../../components/TitleHeader";

const { width, height } = Dimensions.get("window");
const circleSize = width * 0.72;
const strokeWidth = 12;
const radius = (circleSize - strokeWidth) / 2;
const circumference = 2 * Math.PI * radius;

const MODE = {
  POMODORO: "Pomodoro",
  SHORT_BREAK: "Short Break",
  LONG_BREAK: "Long Break",
} as const;

type ModeType = (typeof MODE)[keyof typeof MODE];

const DEFAULT_TIMES: Record<ModeType, number> = {
  [MODE.POMODORO]: 25 * 60,
  [MODE.SHORT_BREAK]: 5 * 60,
  [MODE.LONG_BREAK]: 15 * 60,
};

interface TimerStore {
  mode: ModeType;
  isRunning: boolean;
  timers: Record<ModeType, number>;
  setMode: (mode: ModeType) => void;
  toggle: () => void;
  reset: () => void;
  tick: () => void;
}

let globalInterval: any = null;

export const useTimerStore = create<TimerStore>((set, get) => ({
  mode: MODE.POMODORO,
  isRunning: false,
  timers: { ...DEFAULT_TIMES },

  setMode: (mode) => {
    if (globalInterval) { clearInterval(globalInterval); globalInterval = null; }
    set({ mode, isRunning: false });
  },

  toggle: () => {
    const wasRunning = get().isRunning;
    const nextRunning = !wasRunning;
    set({ isRunning: nextRunning });
    if (nextRunning) {
      if (globalInterval) clearInterval(globalInterval);
      globalInterval = setInterval(() => get().tick(), 1000);
    } else {
      if (globalInterval) { clearInterval(globalInterval); globalInterval = null; }
    }
  },

  reset: () => {
    if (globalInterval) { clearInterval(globalInterval); globalInterval = null; }
    set((state) => ({
      isRunning: false,
      timers: { ...state.timers, [state.mode]: DEFAULT_TIMES[state.mode] },
    }));
  },

  tick: () => {
    const { mode, timers, isRunning } = get();
    if (!isRunning) return;
    if (timers[mode] > 0) {
      set({ timers: { ...timers, [mode]: timers[mode] - 1 } });
    } else {
      if (globalInterval) { clearInterval(globalInterval); globalInterval = null; }
      Vibration.vibrate(Platform.OS === "android" ? [0, 500, 200, 500] : [0, 1000]);
      set((state) => ({
        isRunning: false,
        timers: { ...state.timers, [state.mode]: DEFAULT_TIMES[state.mode] },
      }));
      Alert.alert("Time's Up!", `${mode} is over.`);
    }
  },
}));

export default function Pomodoro() {
  const { mode, timers, isRunning, setMode, toggle, reset } = useTimerStore();
  const secondsLeft = timers[mode];

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const progress = secondsLeft / DEFAULT_TIMES[mode];
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <ImageBackground
        source={require("../../assets/images/pomodoroBg.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.contentContainer}>

          {/* <TitleHeader image={require("../../assets/images/pomodoroHeader.png")} /> */}

          {/* Mode Tabs */}
          <View style={styles.tabsRow}>
            {(Object.values(MODE) as ModeType[]).map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setMode(tab)}
                style={[styles.tabBtn, mode === tab && styles.tabBtnActive]}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, mode === tab && styles.tabTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Progress Circle */}
          <View style={[styles.circleWrap, { width: circleSize, height: circleSize }]}>
            <Svg width={circleSize} height={circleSize} style={StyleSheet.absoluteFill}>
              <Circle stroke="#A8B6A5" fill="#FDFBEA" cx={circleSize / 2} cy={circleSize / 2} r={radius} strokeWidth={strokeWidth} />
              <Circle
                stroke="#81967A"
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
              <Circle cx={circleSize / 2} cy={strokeWidth / 2} r={8} fill="#3A5245" />
            </Svg>
            <LottieView
              source={
                mode === MODE.POMODORO
                  ? require("../../assets/animations/Stuby.json")
                  : require("../../assets/animations/stuby-eating.json")
              }
              style={{ width: "75%", aspectRatio: 1 }}
              autoPlay
              loop
            />
          </View>

          {/* Timer */}
          <Text style={styles.timerText}>{formatTime(secondsLeft)}</Text>

          {/* Buttons */}
          <View style={styles.buttonsContainer}>

            {/* Play / Pause */}
            <TouchableOpacity
              onPress={toggle}
              style={[styles.playBtn, isRunning && styles.playBtnActive]}
              activeOpacity={0.75}
            >
              <Text style={styles.playBtnText}>
                {isRunning ? "PAUSE" : "PLAY"}
              </Text>
            </TouchableOpacity>

            {/* Reset */}
            <TouchableOpacity
              onPress={reset}
              style={styles.resetBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.resetBtnText}>Reset Current</Text>
            </TouchableOpacity>

          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width,
    height,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: "6%",
    marginTop: "5%",
    alignItems: "center",
    justifyContent: "center",
  },

  // --- Tabs ---
  tabsRow: {
    flexDirection: "row",
    backgroundColor: "#FBFFE4",
    borderRadius: 999,
    padding: 4,
    marginBottom: 40,
  },
  tabBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  tabBtnActive: {
    backgroundColor: "#D7A38F",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "500",
    color: "rgba(74, 60, 48, 0.6)",
  },
  tabTextActive: {
    color: "#4A3C30",
  },

  // --- Circle ---
  circleWrap: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },

  // --- Timer ---
  timerText: {
    fontSize: 50,
    fontWeight: "700",
    color: "#3B3B3B",
    marginBottom: 24,
    letterSpacing: -2,
  },

  // --- Buttons ---
  buttonsContainer: {
    alignItems: "center",
    width: "100%",
    gap: 12,
  },
  playBtn: {
    width: "50%",
    backgroundColor: "#FBFFE4",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(0,0,0,0.08)",
  },
  playBtnActive: {
    backgroundColor: "rgba(0,0,0,0.16)",
    borderColor: "rgba(0,0,0,0.14)",
  },
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
    backgroundColor: "#FBFFE4",
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
});