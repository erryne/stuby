import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Check, SquarePen, Trash2 } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// FIREBASE IMPORTS
import { signOut } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";

import AddFloatingButton from "@/components/AddFloatingButton";
import GreenButton from "@/components/GreenButton";

interface Todo {
  id: string;
  task: string;
  done: boolean;
  userId: string;
}

const pastelColors = [
  "#FFB3BA",
  "#FFDFBA",
  "#FFFFBA",
  "#BAFFC9",
  "#BAE1FF",
  "#E0BAFF",
];

export default function TodolistScreen() {
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const user = auth.currentUser;

  // 1. FETCH DATA
  useEffect(() => {
    if (!user) {
      router.replace("/");
      return;
    }

    const q = query(
      collection(db, "tasks"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(
      q,
      { includeMetadataChanges: true }, // Helps handle local vs server state transitions
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Todo, "id">),
        }));
        setTodos(items);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore Error:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user]);

  // 2. CREATE TASK
  const addTodoItem = async () => {
    if (!user) return;

    try {
      // We create the doc first
      const docRef = await addDoc(collection(db, "tasks"), {
        task: "",
        done: false,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });

      // Immediately set this ID as the one being edited
      setEditingId(docRef.id);
    } catch (error) {
      Alert.alert("Error", "Could not create task.");
    }
  };

  // 3. UPDATE TASK TEXT
  const updateTask = async (id: string, text: string) => {
    try {
      const taskRef = doc(db, "tasks", id);
      await updateDoc(taskRef, { task: text });
    } catch (error) {
      console.error("Update Error:", error);
    }
  };

  // 4. TOGGLE DONE
  const toggleDone = async (id: string, currentStatus: boolean) => {
    try {
      const taskRef = doc(db, "tasks", id);
      await updateDoc(taskRef, { done: !currentStatus });
    } catch (error) {
      console.error(error);
    }
  };

  // 5. DELETE TASK
  const deleteTodo = async (id: string) => {
    try {
      await deleteDoc(doc(db, "tasks", id));
    } catch (error) {
      Alert.alert("Error", "Could not delete task.");
    }
  };

  const handleLogout = () => {
    signOut(auth).then(() => router.replace("/"));
  };

  return (
    <ImageBackground
      source={require("../../assets/images/todoBg.png")}
      resizeMode="cover"
      className="flex-1"
    >
      <StatusBar style="dark" />

      <View className="flex-1 px-6 pt-12">
        {/* HEADER */}
        <View className="flex-row justify-between items-start mb-6">
          <View>
            <Text className="text-white/70 text-lg font-medium tracking-widest uppercase">
              {user?.displayName?.split(" ")[0] || "My"} Tasks
            </Text>
            <Text
              className="text-[#FDE6B1] text-4xl font-black"
              style={{
                textShadowColor: "rgba(0, 0, 0, 0.3)",
                textShadowOffset: { width: 1, height: 1 },
                textShadowRadius: 4,
              }}
            >
              TO-DO
            </Text>
          </View>

          <View className="flex-row gap-3">
            {!isEditingMode ? (
              <TouchableOpacity
                className="bg-white/20 p-3 rounded-2xl border border-white/30"
                onPress={() => setIsEditingMode(true)}
              >
                <SquarePen size={24} color="white" />
              </TouchableOpacity>
            ) : (
              <GreenButton
                title="Done"
                onPress={() => setIsEditingMode(false)}
                widthPercent={0.2}
                heightPercent={0.045}
              />
            )}
          </View>
        </View>

        {/* TASK LIST */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1"
        >
          {loading ? (
            <View className="flex-1 justify-center">
              <ActivityIndicator size="large" color="#FDE6B1" />
            </View>
          ) : (
            <FlatList
              data={todos}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 150 }}
              renderItem={({ item, index }) => {
                const pastelColor = pastelColors[index % pastelColors.length];
                const isItemEditing = editingId === item.id;

                return (
                  <View className="flex-row items-center bg-white/95 rounded-3xl px-4 py-4 mb-3 shadow-md border border-white/50">
                    <TouchableOpacity
                      onPress={() => toggleDone(item.id, item.done)}
                      className="w-7 h-7 rounded-full border-2 items-center justify-center mr-4"
                      style={{
                        borderColor: item.done ? pastelColor : "#D1D5DB",
                        backgroundColor: item.done
                          ? pastelColor
                          : "transparent",
                      }}
                    >
                      {item.done && (
                        <Check size={16} color="white" strokeWidth={3} />
                      )}
                    </TouchableOpacity>

                    <View className="flex-1">
                      {isItemEditing ? (
                        <TextInput
                          value={item.task}
                          autoFocus
                          placeholder="Type your task..."
                          placeholderTextColor="#9CA3AF"
                          onChangeText={(text) => updateTask(item.id, text)}
                          onBlur={() => setEditingId(null)}
                          onSubmitEditing={() => setEditingId(null)}
                          className="text-gray-800 text-base font-semibold py-1"
                        />
                      ) : (
                        <TouchableOpacity onPress={() => setEditingId(item.id)}>
                          <Text
                            className={`text-base font-semibold ${
                              item.done
                                ? "line-through text-gray-400"
                                : "text-gray-700"
                            }`}
                          >
                            {item.task || "New Task"}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    {isEditingMode && (
                      <TouchableOpacity
                        onPress={() => deleteTodo(item.id)}
                        className="bg-red-50 p-2 rounded-xl"
                      >
                        <Trash2 size={20} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                );
              }}
            />
          )}
        </KeyboardAvoidingView>
      </View>

      <AddFloatingButton onPress={addTodoItem} />
    </ImageBackground>
  );
}
