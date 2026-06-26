import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { onAuthStateChanged, User } from "firebase/auth";
import React, { createContext, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import MusicPlayerModal from "../components/MusicPlayerModal";
import { auth } from "../firebaseConfig";
import "../global.css";
import { MusicProvider, useMusic } from "./context/MusicContext";
import { TimerProvider } from "./context/TimerContext";
import WelcomeScreen from "./WelcomeScreen";

export const AuthContext = createContext<{ user: User | null }>({ user: null });

function GlobalModals() {
  const { isMusicModalVisible, setIsMusicModalVisible } = useMusic();
  return (
    <MusicPlayerModal
      visible={isMusicModalVisible}
      onClose={() => setIsMusicModalVisible(false)}
    />
  );
}

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [showAnimatedSplash, setShowAnimatedSplash] = useState(true);

  const router = useRouter();
  const segments = useSegments();

  const [fontsLoaded] = useFonts({
    "Chunko-Bold": require("../assets/font/Chunko-Bold.otf"),
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      if (initializing) setInitializing(false);
      SplashScreen.hideAsync().catch(() => {});
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (initializing || showAnimatedSplash) return;

    const checkAuthFlow = async () => {
      const currentRoute = segments[0] || "index";
      const inAuthGroup = [
        "login",
        "register",
        "forgetpass",
        "verify",
      ].includes(currentRoute);
      const isIntro = currentRoute === "introduction";

      const hasCompletedIntro = await AsyncStorage.getItem("hasCompletedIntro");

      // 1. Kung may user at nasa Login/Auth screen sila, dalhin sila sa main dashboard
      if (user && inAuthGroup) {
        router.replace("/");
      }
      // 2. Kung WALANG user at nasa labas ng Auth screens, ibalik sa login
      else if (!user && !inAuthGroup && !isIntro) {
        router.replace("/login");
      }
      // 3. Optional: Kung may user pero hindi pa tapos sa intro, dalhin sa intro
      // (Dapat i-set ang 'hasCompletedIntro' sa 'true' kapag natapos na nila ang intro)
      else if (user && !hasCompletedIntro && !isIntro) {
        router.replace("/introduction/welcomeIntroduction");
      }
    };

    checkAuthFlow();
  }, [user, initializing, segments, showAnimatedSplash]);

  if (initializing || !fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (showAnimatedSplash) {
    return <WelcomeScreen onFinish={() => setShowAnimatedSplash(false)} />;
  }

  return (
    <AuthContext.Provider value={{ user }}>
      <TimerProvider>
        <MusicProvider>
          <Stack screenOptions={{ headerShown: false, gestureEnabled: false }}>
            {user ? (
              <>
                <Stack.Screen name="introduction/welcomeIntroduction" />
                <Stack.Screen name="index" />
                <Stack.Screen name="profile/index" />
                <Stack.Screen name="todo/index" />
                <Stack.Screen name="flashcard/index" />
                <Stack.Screen name="music/index" />
                <Stack.Screen name="notepad/index" />
                <Stack.Screen name="pomodoro/index" />
              </>
            ) : (
              <>
                <Stack.Screen name="login" />
                <Stack.Screen name="forgetpass" />
                <Stack.Screen name="register" />
                <Stack.Screen name="verify" />
              </>
            )}
          </Stack>
          <GlobalModals />
        </MusicProvider>
      </TimerProvider>
    </AuthContext.Provider>
  );
}
