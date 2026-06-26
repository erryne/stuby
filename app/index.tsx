import { LinearGradient } from "expo-linear-gradient";
import { Href } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomHeader from "@/components/CustomHeader";
import Favorites from "@/components/Favorites";
import GeometricBackground from "@/components/GeometricBackground";
import QuickAccess, { QuickAccessItem } from "@/components/QuickAccess";
import TodoCard from "@/components/TodoCard";
import { auth, db } from "../firebaseConfig";

interface Todo {
  id: string;
  task: string;
  done: boolean;
}

interface FavoriteItem {
  id: string;
  title: string;
  type: "flashcard" | "note" | "music";
  createdAt: any;
  route: Href;
}

const quickAccessData: QuickAccessItem[] = [
  {
    id: "1",
    label: "Flashcard",
    bgColor: "#FEF08A",
    route: "/flashcard" as Href,
    icon: require("../assets/images/flashcard-logo.png"),
  },
  {
    id: "2",
    label: "Notepad",
    bgColor: "#BBF7D0",
    route: "/notepad" as Href,
    icon: require("../assets/images/notepad-logo.png"),
  },
  {
    id: "3",
    label: "Music",
    bgColor: "#E9D5FF",
    route: "/music" as Href,
    icon: require("../assets/images/music-logo.png"),
  },
  {
    id: "4",
    label: "Pomodoro",
    bgColor: "#FECACA",
    route: "/pomodoro" as Href,
    icon: require("../assets/images/pomodoro-logo.png"),
  },
  {
    id: "5",
    label: "Todo",
    bgColor: "#BAE6FD",
    route: "/todo" as Href,
    icon: require("../assets/images/todo-logo.png"),
  },
];

export default function Home() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserId(user.uid);
      } else {
        setCurrentUserId(null);
        setTodos([]);
        setFavorites([]);
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!currentUserId) return;
    const q = query(
      collection(db, "tasks"),
      where("userId", "==", currentUserId),
      orderBy("createdAt", "desc"),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Todo, "id">),
      }));
      setTodos(items.sort((a, b) => Number(a.done) - Number(b.done)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId) return;
    const q = query(
      collection(db, "favorites"),
      where("userId", "==", currentUserId),
      orderBy("createdAt", "desc"),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<FavoriteItem, "id">),
      }));
      setFavorites(items);
    });
    return () => unsubscribe();
  }, [currentUserId]);

  const handleToggleTodo = useCallback(async (id: string, done: boolean) => {
    try {
      const todoRef = doc(db, "tasks", id);
      await updateDoc(todoRef, { done: !done });
    } catch (error) {
      console.error("Error:", error);
    }
  }, []);

  return (
    <LinearGradient
      colors={["#7DD3FC", "#38BDF8", "#0EA5E9"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <StatusBar style="light" />

      {/* Dito sinisigurado na transparent ang SafeAreaView para 
          makita ang kulay ng LinearGradient sa labas nito */}
      <View style={StyleSheet.absoluteFillObject}>
        <GeometricBackground />
      </View>

      <ScrollView
        style={{ flex: 1, width: "100%" }}
        showsVerticalScrollIndicator={false}
      >
        <SafeAreaView>
          <CustomHeader />
        </SafeAreaView>

        <TodoCard
          todos={todos}
          loading={loading}
          onToggleTodo={handleToggleTodo}
        />

        <View>
          <View style={{ paddingHorizontal: "5%" }}>
            <QuickAccess items={quickAccessData} />
          </View>
          <Favorites items={favorites} title="FAVORITES" />
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
