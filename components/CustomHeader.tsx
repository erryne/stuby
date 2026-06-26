import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Href, useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTimer } from "../app/context/TimerContext";
import { auth } from "../firebaseConfig";
import { ConfirmationAlert } from "./ConfirmationAlert";
import TitleHeader from "./TitleHeader";

interface FeatureItem {
  name: string;
  image: any;
  path: Href;
}

const featureItems: FeatureItem[] = [
  {
    name: "To-Do List",
    image: require("../assets/images/todo-logo.png"),
    path: "/todo" as Href,
  },
  {
    name: "Flashcard",
    image: require("../assets/images/flashcard-logo.png"),
    path: "/flashcard" as Href,
  },
  {
    name: "Notepad",
    image: require("../assets/images/notepad-logo.png"),
    path: "/notepad" as Href,
  },
  {
    name: "Pomodoro",
    image: require("../assets/images/pomodoro-logo.png"),
    path: "/pomodoro" as Href,
  },
  {
    name: "Music",
    image: require("../assets/images/music-logo.png"),
    path: "/music" as Href,
  },
];

export default function CustomHeader() {
  const router = useRouter();
  const { isRunning, setIsRunning, timers, mode, resetTimer } = useTimer();
  const secondsLeft = timers[mode];

  const [menuOpen, setMenuOpen] = useState(false);
  const [isLogoutAlertVisible, setIsLogoutAlertVisible] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isRunning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRunning]);

  const toggleModal = (visible: boolean) => {
    if (visible) {
      setMenuOpen(true);
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 10,
      }).start();
    } else {
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setMenuOpen(false));
    }
  };

  // Triggers the slide-out animation first, then safely reveals the confirmation dialog on completion
  const handleLogoutPress = () => {
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setMenuOpen(false);
      // Wait exactly until the core iOS modal unmounts fully
      setTimeout(() => {
        setIsLogoutAlertVisible(true);
      }, 50);
    });
  };

  const handleLogoutConfirm = async () => {
    resetTimer();
    await signOut(auth);
    setIsLogoutAlertVisible(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.leftGroup}>
        <TouchableOpacity
          onPress={() => toggleModal(true)}
          style={styles.menuButton}
        >
          <Ionicons name="apps" size={20} color="#334155" />
        </TouchableOpacity>
        <TitleHeader
          title="STUBY"
          size="md"
          align="center"
          color="#334155"
          containerStyle={{ marginTop: 14, marginLeft: 8 }}
        />
      </View>

      <View style={styles.rightGroup}>
        <TouchableOpacity
          onPress={() => router.navigate("/music" as Href)}
          style={styles.musicCircleButton}
        >
          <Ionicons name="musical-notes" size={20} color="#334155" />
        </TouchableOpacity>
        <View
          style={[
            styles.timerPill,
            { backgroundColor: isRunning ? "#ECFDF5" : "#FFFFFF" },
          ]}
        >
          <TouchableOpacity
            onPress={() => router.navigate("/pomodoro" as Href)}
            style={styles.timerLink}
          >
            <Animated.View
              style={[
                styles.dot,
                {
                  opacity: pulseAnim,
                  backgroundColor: isRunning ? "#10B981" : "#F59E0B",
                },
              ]}
            />
            <Text style={styles.timerText}>{formatTime(secondsLeft)}</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            onPress={() => setIsRunning(!isRunning)}
            style={[styles.playButton, { backgroundColor: "#334155" }]}
          >
            <Ionicons
              name={isRunning ? "pause" : "play"}
              size={12}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={menuOpen}
        transparent={true}
        statusBarTranslucent
        animationType="none"
      >
        <Pressable style={styles.overlay} onPress={() => toggleModal(false)} />
        <View style={styles.modalCenterWrapper}>
          <Animated.View
            style={[styles.modalContent, { transform: [{ scale: scaleAnim }] }]}
          >
            <LinearGradient
              colors={["#FFFFFF", "#F8FAFC"]}
              style={styles.modalGradient}
            >
              <Text style={styles.modalTitle}>STUBY</Text>
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => {
                    toggleModal(false);
                    router.navigate("/");
                  }}
                >
                  <Ionicons name="home-outline" size={22} color="#5971C0" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => {
                    toggleModal(false);
                    router.navigate("/profile");
                  }}
                >
                  <Ionicons name="person-outline" size={22} color="#5971C0" />
                </TouchableOpacity>

                {/* --- Adjusted Action Button Target --- */}
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: "#FFF1F2" }]}
                  onPress={handleLogoutPress}
                >
                  <Ionicons name="log-out-outline" size={22} color="#E11D48" />
                </TouchableOpacity>
              </View>
              <Text style={styles.sectionHeader}>Features</Text>

              <View style={styles.gridContainer}>
                {featureItems.map((item) => (
                  <TouchableOpacity
                    key={item.path as string}
                    style={styles.iconGridItem}
                    onPress={() => {
                      toggleModal(false);
                      router.navigate(item.path);
                    }}
                  >
                    <View style={styles.iconWrapper}>
                      <Image source={item.image} style={styles.iconImage} />
                    </View>
                    <Text style={styles.gridText}>{item.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>

      <ConfirmationAlert
        visible={isLogoutAlertVisible}
        title="Logout"
        message="Are you sure you want to log out?"
        iconName="log-out-outline"
        confirmText="Log Out"
        confirmColor="#E11D48"
        onCancel={() => setIsLogoutAlertVisible(false)}
        onConfirm={handleLogoutConfirm}
      />
    </View>
  );
}

CustomHeader.displayName = "CustomHeader";

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    height: 65,
    marginBottom: 15,
  },
  leftGroup: { flexDirection: "row", alignItems: "center", gap: 5 },
  rightGroup: { flexDirection: "row", alignItems: "center", gap: 5 },
  menuButton: {
    padding: 10,
    backgroundColor: "white",
    borderRadius: 14,
    elevation: 3,
  },
  musicCircleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  timerPill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 50,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
  },
  timerLink: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
    gap: 4,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  timerText: { fontSize: 14, fontWeight: "800", color: "#334155" },
  divider: { width: 1, height: 16, backgroundColor: "#E2E8F0" },
  playButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalCenterWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    borderRadius: 30,
    overflow: "hidden",
    elevation: 10,
    backgroundColor: "white",
  },
  modalGradient: { padding: 30 },
  modalTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 20,
    textAlign: "center",
  },
  actionRow: { flexDirection: "row", gap: 12, marginBottom: 30 },
  actionBtn: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    padding: 16,
    borderRadius: 20,
    alignItems: "center",
    elevation: 2,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "800",
    color: "#94A3B8",
    marginBottom: 15,
    letterSpacing: 1,
  },

  /* --- Style Tweaks to achieve staggered row placement --- */
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center", // Centers the bottom row elements if they wrap down
    rowGap: 20,
  },
  iconGridItem: {
    width: "33.33%", // Ensures exactly 3 elements fit per row maximum
    alignItems: "center",
  },
  iconWrapper: {
    width: 72, // Reduced wrapper sizing to guarantee perfect fit on narrow screens without collision
    height: 72,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    elevation: 3,
  },
  iconImage: { width: 48, height: 48, resizeMode: "contain" },
  gridText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#475569",
    textAlign: "center",
  },
});
