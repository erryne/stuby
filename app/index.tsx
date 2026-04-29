import { Href, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { signOut } from "firebase/auth";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import LottieView from "lottie-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Firebase and Local Constants
import { auth, db } from "../firebaseConfig";

interface Todo {
  id: string;
  task: string;
  done: boolean;
}

/* ---------------- CONSTANTS ---------------- */
const quickAccess = [
  { id: "1", label: "Flashcard", bgColor: "#4E9C8F", route: "/flashcard" },
  { id: "2", label: "Notepad", bgColor: "#5971C0", route: "/notepad" },
  { id: "3", label: "Music", bgColor: "#EBC176", route: "/music" },
  { id: "4", label: "Pomodoro", bgColor: "#EE8D8D", route: "/pomodoro" },
  { id: "5", label: "Todo", bgColor: "#B5A6E4", route: "/todo" },
];

const recents = [
  { id: "1", title: "Filipino", count: "10 cards" },
  { id: "2", title: "Science", count: "15 cards" },
  { id: "3", title: "Chemistry", count: "10 cards" },
];

export default function Home() {
  const router = useRouter();
  const user = auth.currentUser;

  // 1. Setup State for To-Dos
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  // 2. Real-time Listener (Syncing Dashboard with Database)
  useEffect(() => {
    if (!user) return;

    // We only fetch the top 5 most recent tasks for the dashboard
    const q = query(
      collection(db, "tasks"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Todo, "id">),
      }));
      const sortedItems = items.sort((a, b) => Number(a.done) - Number(b.done));

      setTodos(sortedItems);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // 3. Logic for Toggling Tasks directly from Dashboard
  const toggleTodo = async (id: string, currentStatus: boolean) => {
    try {
      const taskRef = doc(db, "tasks", id);
      await updateDoc(taskRef, { done: !currentStatus });
    } catch (error) {
      console.error("Dashboard Toggle Error:", error);
    }
  };

  const unfinishedCount = todos.filter((t) => !t.done).length;

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await signOut(auth);
          router.replace("/login");
        },
      },
    ]);
  };

  return (
    <ImageBackground
      source={require("../assets/images/dashboard.png")}
      style={{ flex: 1 }}
    >
      <StatusBar style="light" />

      <View style={styles.mainContainer}>
        {/* ---------------- TO-DO SECTION ---------------- */}
        <View style={{ marginBottom: "8%", marginTop: "6%" }}>
          <Text className="text-[#F5CE8E] font-extrabold mb-2 text-xl self-end">
            TO-DO
          </Text>

          <View style={styles.todoCard}>
            {/* LEFT: Animation & Counter */}
            <View style={{ width: "35%", position: "relative" }}>
              <LottieView
                source={require("../assets/animations/Stuby.json")}
                autoPlay
                loop
                style={{ width: "130%", aspectRatio: 1, marginLeft: "-10%" }}
                resizeMode="contain"
              />
              <View style={styles.counterContainer}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unfinishedCount}</Text>
                </View>
                <Text style={styles.counterText}>Unfinished</Text>
              </View>
            </View>

            {/* RIGHT: Real-time Todo Items */}
            <View style={styles.todoListContainer}>
              {loading ? (
                <ActivityIndicator size="small" color="#6FAE9A" />
              ) : (
                <>
                  {/* Limit to 5 tasks */}
                  {todos.slice(0, 5).map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => toggleTodo(item.id, item.done)}
                      style={styles.todoItem}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          {
                            backgroundColor: item.done
                              ? "#6FAE9A"
                              : "transparent",
                            borderColor: "#6FAE9A",
                          },
                        ]}
                      >
                        {item.done && <View style={styles.checkboxInner} />}
                      </View>

                      <Text
                        numberOfLines={1}
                        style={[
                          styles.todoText,
                          item.done && styles.todoDoneText,
                        ]}
                      >
                        {item.task || "Untitled Task"}
                      </Text>
                    </TouchableOpacity>
                  ))}

                  {/* Show More Link - Positioned at bottom right */}
                  {todos.length > 5 && (
                    <TouchableOpacity
                      onPress={() => router.push("/todo")}
                      style={{ alignSelf: "flex-end", marginTop: 4 }}
                    >
                      <Text
                        style={{
                          color: "#4E9C8F",
                          fontWeight: "700",
                          fontSize: 12,
                        }}
                      >
                        Show More →
                      </Text>
                    </TouchableOpacity>
                  )}

                  {todos.length === 0 && (
                    <Text style={{ color: "#999", fontSize: 12 }}>
                      No tasks for today!
                    </Text>
                  )}
                </>
              )}
              {/* 
              {totalUnfinished > 5 && (
                <TouchableOpacity onPress={() => router.push("/todo")}>
                  <Text>Show More →</Text>
                </TouchableOpacity>
              )} */}
            </View>
          </View>
        </View>

        {/* ---------------- QUICK ACCESS ---------------- */}
        <View style={{ marginTop: "5%" }}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.quickAccessRow}>
            {quickAccess.map((item) => (
              <View key={item.id} style={{ alignItems: "center", flex: 1 }}>
                <TouchableOpacity
                  onPress={() => router.navigate(item.route as Href)}
                  style={[
                    styles.quickAccessCircle,
                    { backgroundColor: item.bgColor },
                  ]}
                >
                  <Text style={styles.quickAccessText}>{item.label[0]}</Text>
                </TouchableOpacity>
                <Text style={styles.quickLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ---------------- RECENTS ---------------- */}
        <View style={{ marginTop: "5%" }}>
          <Text style={styles.sectionTitle}>Recents</Text>
          {recents.map((item) => (
            <TouchableOpacity key={item.id} style={styles.recentItem}>
              <View style={styles.recentIconBox} />
              <View>
                <Text style={styles.recentTitle}>{item.title}</Text>
                <Text style={styles.recentCount}>{item.count}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingHorizontal: "5%",
  },

  todoCard: {
    backgroundColor: "#FFF6E5",
    borderRadius: 25,
    padding: 15,
    flexDirection: "row",
    minHeight: 160,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: -5,
  },
  badge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#C9B6F3",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "white", fontWeight: "bold", fontSize: 11 },
  counterText: {
    marginLeft: 6,
    color: "#555",
    fontWeight: "700",
    fontSize: 12,
  },
  todoListContainer: {
    flex: 1,
    marginLeft: 15,
    justifyContent: "center",
  },
  todoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginRight: 10,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  todoText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    flex: 1,
  },
  todoDoneText: {
    textDecorationLine: "line-through",
    color: "#AAA",
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 15,
    color: "#222",
    fontSize: 18,
  },
  quickAccessRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickAccessCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },
  quickAccessText: { color: "white", fontWeight: "bold", fontSize: 20 },
  quickLabel: { fontSize: 10, marginTop: 6, color: "#444", fontWeight: "500" },
  recentItem: {
    backgroundColor: "#F8EBD4",
    borderRadius: 20,
    padding: 15,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  recentIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    marginRight: 15,
    backgroundColor: "#4E9C8F",
  },
  recentTitle: { fontWeight: "bold", fontSize: 16, color: "#333" },
  recentCount: { color: "#777", fontSize: 12 },
});
