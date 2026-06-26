import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import IntroDots from "../../components/IntroDots";

import CardIntroduction from "./cardIntroduction";
import MusicIntroduction from "./musicIntroduction";
import NotesIntroduction from "./notesIntroduction";
import PomodoroIntroduction from "./pomodoroIntroduction";
import ToDoIntroduction from "./toDoIntroduction";

const { width } = Dimensions.get("window");

const pages = [
  { key: "card", component: CardIntroduction },
  { key: "notes", component: NotesIntroduction },
  { key: "music", component: MusicIntroduction },
  { key: "pomodoro", component: PomodoroIntroduction },
  { key: "todo", component: ToDoIntroduction },
];

export default function IntroductionFlow() {
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const router = useRouter();

  const isLastPage = currentPage === pages.length - 1;

  return (
    <View style={{ flex: 1 }}>
      <Animated.ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        ref={scrollRef}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          {
            useNativeDriver: false,
            listener: (event: any) => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x / width,
              );
              setCurrentPage(index);
            },
          },
        )}
      >
        {pages.map(({ key, component: Page }) => (
          <View key={key} style={{ width, flex: 1 }}>
            <Page />
          </View>
        ))}
      </Animated.ScrollView>

      {/* Footer na may custom button style */}
      <View style={styles.absoluteFooter}>
        {isLastPage ? (
          <TouchableOpacity
            onPress={async () => {
              try {
                // I-save sa storage na tapos na sila sa intro
                await AsyncStorage.setItem("hasCompletedIntro", "true");
                // Tsaka mag-redirect sa dashboard
                router.replace("/");
              } catch (error) {
                console.error("Error saving intro status:", error);
                // Kahit may error, i-redirect pa rin para hindi ma-stuck ang user
                router.replace("/");
              }
            }}
            style={styles.customButton}
          >
            <Text style={styles.customButtonText}>Go to Dashboard</Text>
          </TouchableOpacity>
        ) : (
          <IntroDots
            total={pages.length}
            scrollX={scrollX}
            width={width}
            color="#FFFFFF"
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  absoluteFooter: {
    position: "absolute",
    bottom: 40,
    left: 40, // Dinagdagan ng padding para hindi masyadong dikit sa gilid
    right: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  customButton: {
    backgroundColor: "#334155", // Kulay mula sa reference
    borderRadius: 16,
    height: 52,
    width: "100%", // Full width para magmatch sa reference
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    // Idinagdag ang shadow props para sa iOS kung kailangan
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  customButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
