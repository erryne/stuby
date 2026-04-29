import LottieView from "lottie-react-native";
import React from "react";
import {
  Alert,
  Dimensions,
  ImageBackground,
  Platform,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import { create } from "zustand";

// --- Constants ---
const { width } = Dimensions.get("window");
const circleSize = width * 0.6;
const strokeWidth = 10;
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

// --- 1. Global Store ---
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
    if (globalInterval) {
      clearInterval(globalInterval);
      globalInterval = null;
    }
    set({ mode, isRunning: false });
  },

  toggle: () => {
    const wasRunning = get().isRunning;
    const nextRunning = !wasRunning;

    set({ isRunning: nextRunning });

    if (nextRunning) {
      if (globalInterval) clearInterval(globalInterval);
      globalInterval = setInterval(() => {
        get().tick();
      }, 1000);
    } else {
      if (globalInterval) {
        clearInterval(globalInterval);
        globalInterval = null;
      }
    }
  },

  reset: () => {
    if (globalInterval) {
      clearInterval(globalInterval);
      globalInterval = null;
    }
    set((state) => ({
      isRunning: false,
      timers: { ...state.timers, [state.mode]: DEFAULT_TIMES[state.mode] },
    }));
  },

  tick: () => {
    const { mode, timers, isRunning } = get();

    if (!isRunning) return;

    if (timers[mode] > 0) {
      set({
        timers: { ...timers, [mode]: timers[mode] - 1 },
      });
    } else {
      // --- AUTO-RESET LOGIC ---
      if (globalInterval) {
        clearInterval(globalInterval);
        globalInterval = null;
      }

      // Vibrate and Alert
      const pattern =
        Platform.OS === "android" ? [0, 500, 200, 500] : [0, 1000];
      Vibration.vibrate(pattern);

      // Reset the current mode's timer to default immediately
      set((state) => ({
        isRunning: false,
        timers: {
          ...state.timers,
          [state.mode]: DEFAULT_TIMES[state.mode],
        },
      }));

      Alert.alert(
        "Time's Up!",
        `${mode} session is over. Timer has been reset.`,
      );
    }
  },
}));

// --- 2. Main UI Component ---
export default function Pomodoro() {
  const { mode, timers, isRunning, setMode, toggle, reset } = useTimerStore();
  const secondsLeft = timers[mode];

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const progress = secondsLeft / DEFAULT_TIMES[mode];
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <ImageBackground
      source={require("../../assets/images/pomodoroBg.png")}
      className="flex-1"
      resizeMode="cover"
    >
      <View className="flex-1 items-center pt-[10%]">
        <Text className="text-[36px] font-extrabold text-[#1D1D1D] mb-[5%] tracking-[2px]">
          POMODORO
        </Text>

        <View
          style={{
            width: "80%",
            height: "80%",
            backgroundColor: "#FFF9E5",
            borderLeftWidth: 10,
            borderRightWidth: 10,
            borderColor: "#81967A",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 8,
          }}
        >
          {/* Mode Tabs */}
          <View className="flex-row justify-between gap-2 mb-[12%]">
            {(Object.values(MODE) as ModeType[]).map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setMode(tab)}
                className={`rounded-[10px] px-3 py-1.5 ${
                  mode === tab ? "bg-[#B39287]" : "bg-[#E6D3C3]"
                }`}
                activeOpacity={0.8}
              >
                <Text
                  className={`text-[12px] font-bold ${
                    mode === tab ? "text-[#2C1F16]" : "text-[#7A6654]"
                  }`}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Progress Circle Container */}
          <View
            className="justify-center items-center mb-[6%]"
            style={{ width: circleSize, height: circleSize }}
          >
            <Svg
              width={circleSize}
              height={circleSize}
              style={{ position: "absolute", top: 0, left: 0 }}
            >
              <Circle
                stroke="#D9D9D9"
                fill="none"
                cx={circleSize / 2}
                cy={circleSize / 2}
                r={radius}
                strokeWidth={strokeWidth}
              />
              <Circle
                stroke="#A8B6A5"
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
                mode === MODE.POMODORO
                  ? require("../../assets/animations/Stuby.json")
                  : require("../../assets/animations/stuby-eating.json")
              }
              style={
                mode === MODE.POMODORO
                  ? { width: "80%", aspectRatio: 1 }
                  : { width: "90%", aspectRatio: 1 }
              }
              resizeMode="contain"
              autoPlay
              loop
            />
          </View>

          {/* Digital Timer */}
          <Text
            className={`text-[40px] font-bold mb-[6%] ${
              secondsLeft < 10 && secondsLeft > 0
                ? "text-red-500"
                : "text-[#3B3B3B]"
            }`}
          >
            {formatTime(secondsLeft)}
          </Text>

          {/* Control Buttons */}
          <View className="items-center w-full gap-3">
            <TouchableOpacity
              className="bg-[#E6D3C3] rounded-[15px] px-[50px] py-3 w-[200px] items-center shadow-sm"
              onPress={toggle}
              activeOpacity={0.7}
            >
              <Text className="font-bold text-[18px] text-[#4A3C30]">
                {isRunning ? "PAUSE" : "PLAY"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="py-2"
              onPress={reset}
              activeOpacity={0.6}
            >
              <Text className="font-bold text-[14px] text-[#7A6654] tracking-[1px]">
                RESET CURRENT
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}
