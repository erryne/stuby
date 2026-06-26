import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { Check } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
  useWindowDimensions,
} from "react-native";
import ProgressTrack from "./ProgressTrack";

const TASK_IMAGES: Record<string, any> = {
  chem: require("../assets/images/todo_items/todoChemIcon.png"),
  health: require("../assets/images/todo_items/todoHealthIcon.png"),
  lit: require("../assets/images/todo_items/todoLitIcon.png"),
  math: require("../assets/images/todo_items/todoMathIcon.png"),
  media: require("../assets/images/todo_items/todoMediaIcon.png"),
  philo: require("../assets/images/todo_items/todoPhiloIcon.png"),
  phone: require("../assets/images/todo_items/todoPhoneIcon.png"),
  science: require("../assets/images/todo_items/todoScienceIcon.png"),
  sports: require("../assets/images/todo_items/todoSportsIcon.png"),
  stats: require("../assets/images/todo_items/todoStatsIcon.png"),
};

const MESSAGES = [
  "Welcome back, study buddy!",
  "Ready to crush those tasks?",
  "Focus on your goals today!",
  "You're doing great!",
  "One step at a time!",
  "Keep up the momentum!",
];

export default function TodoCard({ todos, loading, onToggleTodo }: any) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [message, setMessage] = useState(MESSAGES[0]);
  const [isCongratModalVisible, setIsCongratModalVisible] = useState(false);

  const hasShownRef = useRef(false);
  const isTablet = width > 600;
  const containerWidth = isTablet ? 500 : width * 0.9;
  const mascotSize = isTablet ? 300 : 220;

  const totalCount = todos.length;
  const finishedCount = todos.filter((t: any) => t.done).length;
  const unfinishedCount = totalCount - finishedCount;

  // Optimized Logic para sa Congrat Modal
  useEffect(() => {
    // 1. Siguraduhin na may laman ang todos
    if (totalCount === 0) {
      hasShownRef.current = false;
      return;
    }

    const isAllDone = finishedCount === totalCount;

    if (isAllDone) {
      // 2. I-lock ang logic gamit ang Ref para isang beses lang mag-trigger
      if (!hasShownRef.current) {
        hasShownRef.current = true;
        Vibration.vibrate([0, 200, 100, 200]);
        setIsCongratModalVisible(true);
      }
    } else {
      // 3. I-unlock kapag may hindi pa tapos na task
      hasShownRef.current = false;
      if (isCongratModalVisible) {
        setIsCongratModalVisible(false);
      }
    }
  }, [finishedCount, totalCount]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessage((prev) => {
        const currentIndex = MESSAGES.indexOf(prev);
        const nextIndex = (currentIndex + 1) % MESSAGES.length;
        return MESSAGES[nextIndex];
      });
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View className="mb-3 w-full items-center">
      <Modal
        visible={isCongratModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LottieView
              source={require("../assets/animations/star.json")}
              autoPlay
              loop={false}
              style={{ width: 150, height: 150 }}
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

      <View
        style={{
          height: mascotSize * 0.8,
          width: containerWidth,
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <View style={styles.speechBubble}>
          <Text style={styles.speechText}>{message}</Text>
          <View style={styles.speechArrow} />
        </View>
        <LottieView
          source={require("../assets/animations/stuby_talking.json")}
          autoPlay
          loop
          style={{ width: mascotSize, height: mascotSize }}
          resizeMode="contain"
        />
      </View>

      <View
        style={[styles.cardShadow, { width: containerWidth }]}
        className="bg-white rounded-2xl pb-4 overflow-hidden border-2 border-white"
      >
        <View className="bg-[#334155] py-3 px-4 flex-row items-center justify-between">
          <Text className="text-white font-black text-sm tracking-widest">
            TO-DO LIST
          </Text>
          <View className="flex-row items-center bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
            <Text className="text-red-400 font-extrabold text-[11px] uppercase tracking-wider">
              {unfinishedCount} Unfinished
            </Text>
          </View>
        </View>

        <View className="py-2 px-2">
          {loading ? (
            <ActivityIndicator className="my-6" size="small" color="#334155" />
          ) : (
            <>
              {todos.slice(0, 5).map((item: any) => (
                <View
                  key={item.id}
                  className="flex-row items-center justify-between py-2 px-2 border-b border-slate-50 last:border-b-0"
                >
                  <View className="flex-row items-center flex-1 mr-3">
                    <View style={styles.iconContainer}>
                      <Image
                        source={
                          TASK_IMAGES[item.emoji || "chem"] || TASK_IMAGES.chem
                        }
                        style={styles.miniIconImage}
                      />
                    </View>
                    <Text
                      numberOfLines={1}
                      className={`text-[14px] font-semibold text-slate-800 flex-1 ${item.done ? "line-through text-slate-400 font-medium italic" : ""}`}
                    >
                      {item.task || "Untitled Task"}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => onToggleTodo(item.id, item.done)}
                    className={`w-7 h-7 rounded-full border-2 items-center justify-center ${item.done ? "bg-emerald-500 border-emerald-500" : "bg-slate-50 border-slate-200"}`}
                  >
                    {item.done && (
                      <Check size={14} color="white" strokeWidth={3} />
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </>
          )}
        </View>
      </View>

      {totalCount > 0 && (
        <View style={{ width: containerWidth }} className="mt-2">
          <ProgressTrack
            finishedCount={finishedCount}
            totalCount={totalCount}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardShadow: {
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderWidth: 2,
    borderColor: "#ffffff",
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  miniIconImage: { width: 22, height: 22, resizeMode: "contain" },
  speechBubble: {
    position: "absolute",
    top: -10,
    left: "10%",
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    elevation: 4,
    zIndex: 10,
  },
  speechText: { fontSize: 12, fontWeight: "600", color: "#334155" },
  speechArrow: {
    position: "absolute",
    bottom: -6,
    left: "70%",
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#ffffff",
  },
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

