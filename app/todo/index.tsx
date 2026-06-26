import AddFloatingButton from "@/components/AddFloatingButton";
import CustomHeader from "@/components/CustomHeader";
import GeometricBackground from "@/components/GeometricBackground";
import ProgressTrack from "@/components/ProgressTrack";
import TaskItem from "@/components/TaskItem";
import TaskModal from "@/components/TaskModal";
import TitleHeader from "@/components/TitleHeader";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
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
import LottieView from "lottie-react-native";
import { SquarePen } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  Vibration,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../../firebaseConfig";

interface TodoTask {
  id: string;
  task: string;
  done: boolean;
  emoji?: string;
}

export default function TodolistScreen() {
  const { height } = useWindowDimensions();
  const [todos, setTodos] = useState<TodoTask[]>([]);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isCongratModalVisible, setIsCongratModalVisible] = useState(false);

  const [newTaskText, setNewTaskText] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("chem");
  const [editingTask, setEditingTask] = useState<TodoTask | null>(null);

  const hasShownRef = useRef(false);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    const q = query(
      collection(db, "tasks"),
      where("userId", "==", auth.currentUser?.uid),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: TodoTask[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<TodoTask, "id">),
      }));
      setTodos(data);

      const isAllDone = data.length > 0 && data.every((t) => t.done);

      if (isInitialLoad.current) {
        isInitialLoad.current = false;
        hasShownRef.current = isAllDone;
        return;
      }

      // Safety check: Dagdag na "&& !isCongratModalVisible" para iwas double pop-up
      if (isAllDone && !isCongratModalVisible) {
        if (!hasShownRef.current) {
          Vibration.vibrate([0, 200, 100, 200]);
          setIsCongratModalVisible(true);
          hasShownRef.current = true;
        }
      } else if (!isAllDone) {
        hasShownRef.current = false;
        setIsCongratModalVisible(false);
      }
    });

    return () => unsubscribe();
  }, [isCongratModalVisible]); // Kasama na ang isCongratModalVisible sa dependency

  const handleSaveTask = async (taskText: string, iconId: string) => {
    if (taskText.trim() === "") return;

    if (editingTask) {
      await updateDoc(doc(db, "tasks", editingTask.id), {
        task: taskText,
        emoji: iconId,
      });
    } else {
      await addDoc(collection(db, "tasks"), {
        task: taskText,
        emoji: iconId,
        done: false,
        userId: auth.currentUser?.uid,
        createdAt: serverTimestamp(),
      });
    }
    setIsAddModalVisible(false);
  };

  return (
    <LinearGradient
      colors={["#7DD3FC", "#38BDF8", "#0EA5E9"]}
      style={styles.flex1}
    >
      <StatusBar style="light" />
      <View style={StyleSheet.absoluteFillObject}>
        <GeometricBackground />
      </View>

      <SafeAreaView style={styles.flex1} edges={["top", "left", "right"]}>
        <CustomHeader />

        <TitleHeader
          title="TO-DO LIST"
          size="xl"
          align="center"
          color="#ffffff"
          containerStyle={styles.titleContainer}
          titleStyle={styles.titleText}
        />

        <View style={[styles.mascotContainer, { height: height * 0.18 }]}>
          <LottieView
            source={require("../../assets/animations/todo-checking.json")}
            autoPlay
            loop
            style={styles.mascot}
          />
        </View>

        <View style={styles.progressWrapper}>
          <ProgressTrack
            finishedCount={todos.filter((t) => t.done).length}
            totalCount={todos.length}
          />
        </View>

        <View style={styles.tasksHeader}>
          <Text style={styles.tasksTitle}>Tasks</Text>
          <TouchableOpacity
            onPress={() => setIsEditingMode(!isEditingMode)}
            style={styles.editBtn}
          >
            <SquarePen size={20} color="white" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={todos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TaskItem
              item={item}
              isEditingMode={isEditingMode}
              onToggle={async (id, done) =>
                await updateDoc(doc(db, "tasks", id), { done: !done })
              }
              onDelete={async (id) => await deleteDoc(doc(db, "tasks", id))}
              onEdit={(task) => {
                setEditingTask(task);
                setNewTaskText(task.task);
                setSelectedEmoji(task.emoji || "chem");
                setIsAddModalVisible(true);
              }}
            />
          )}
        />
      </SafeAreaView>

      <Modal
        visible={isCongratModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LottieView
              source={require("../../assets/animations/star.json")}
              autoPlay
              loop={false}
              style={styles.mascot}
            />
            <Text style={styles.modalTitle}>Great Job!</Text>
            <Text style={styles.modalSub}>
              You've cleared your task list for today!
            </Text>
            <TouchableOpacity
              onPress={() => setIsCongratModalVisible(false)}
              style={styles.btnCelebrate}
            >
              <Text style={styles.btnText}>Celebrate!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TaskModal
        isVisible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onSave={handleSaveTask}
        editingTask={editingTask}
        taskText={newTaskText}
        setTaskText={setNewTaskText}
        selectedEmoji={selectedEmoji}
        setSelectedEmoji={setSelectedEmoji}
      />

      <AddFloatingButton
        onPress={() => {
          setEditingTask(null);
          setNewTaskText("");
          setSelectedEmoji("chem");
          setIsAddModalVisible(true);
        }}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  titleContainer: { marginBottom: 10 },
  titleText: {
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  mascotContainer: { justifyContent: "center", alignItems: "center" },
  mascot: { width: 250, height: 250 },
  progressWrapper: { marginHorizontal: 20, marginBottom: 16 },
  tasksHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 10,
  },
  tasksTitle: { color: "white", fontSize: 28, fontWeight: "900" },
  editBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 12,
    borderRadius: 16,
  },
  listContent: { paddingBottom: 120, paddingHorizontal: 12 },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: "white",
    padding: 32,
    borderRadius: 24,
    alignItems: "center",
    width: "100%",
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#334155",
    marginTop: 10,
  },
  modalSub: {
    color: "#64748b",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
    fontSize: 16,
  },
  btnCelebrate: {
    width: "100%",
    backgroundColor: "#0ea5e9",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  btnText: { color: "white", fontWeight: "bold", fontSize: 16 },
});
