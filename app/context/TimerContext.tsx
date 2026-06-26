import { getAuth, onAuthStateChanged } from "firebase/auth";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Platform, Vibration } from "react-native";

const DEFAULT_TIMES = {
  Pomodoro: 25 * 60,
  "Short Break": 5 * 60,
  "Long Break": 15 * 60,
};

interface TimerContextType {
  mode: string;
  setMode: (mode: string) => void;
  isRunning: boolean;
  setIsRunning: (running: boolean) => void;
  timers: Record<string, number>;
  setTimers: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  DEFAULT_TIMES: typeof DEFAULT_TIMES;
  resetTimer: () => void;
  justFinished: boolean;
  setJustFinished: React.Dispatch<React.SetStateAction<boolean>>;
}

const TimerContext = createContext<TimerContextType | null>(null);

export const TimerProvider = ({ children }: { children: React.ReactNode }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState("Pomodoro");
  const [timers, setTimers] = useState<Record<string, number>>(DEFAULT_TIMES);
  const [justFinished, setJustFinished] = useState(false);

  const resetTimer = () => {
    setIsRunning(false);
    setMode("Pomodoro");
    setTimers(DEFAULT_TIMES);
    setJustFinished(false);
  };

  // Automatic reset kapag nag-logout o nabura ang account
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        resetTimer();
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isRunning && timers[mode] > 0) {
      interval = setInterval(() => {
        setTimers((prev) => {
          const currentModeVal = prev[mode];
          const nextVal = currentModeVal - 1;

          if (nextVal <= 0) {
            setIsRunning(false);
            Vibration.vibrate(
              Platform.OS === "android" ? [0, 500, 200, 500] : [0, 1000],
            );
            setJustFinished(true);
            return { ...prev, [mode]: 0 };
          }
          return { ...prev, [mode]: nextVal };
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, mode, timers[mode]]);

  return (
    <TimerContext.Provider
      value={{
        mode,
        setMode,
        isRunning,
        setIsRunning,
        timers,
        setTimers,
        DEFAULT_TIMES,
        resetTimer,
        justFinished,
        setJustFinished,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) throw new Error("useTimer must be used within a TimerProvider");
  return context;
};
