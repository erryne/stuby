import { Ionicons } from "@expo/vector-icons";
import { Href, Stack, useRouter, useSegments } from "expo-router";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../firebaseConfig";
import { useTimerStore } from "./pomodoro";

interface MenuItem {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  path: Href;
}

export default function RootLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const router = useRouter();
  const segments = useSegments();

  const { mode, timers, isRunning, toggle } = useTimerStore();
  const secondsLeft = timers[mode];

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const navigateAndClose = (path: Href) => {
    setMenuOpen(false);
    router.navigate(path);
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          setMenuOpen(false);
          signOut(auth);
        },
      },
    ]);
  };

  // --- Header Drawer Menu ---
  const HeaderDrawer = () => {
    const menuItems: MenuItem[] = [
      { name: "Home", icon: "home", path: "/" },
      { name: "Profile", icon: "person", path: "/profile" }, // Added Profile
      { name: "To-Do", icon: "checkmark-circle", path: "/todo" },
      { name: "Cards", icon: "layers", path: "/flashcard" },
      { name: "Notes", icon: "document-text", path: "/notepad" },
      { name: "Timer", icon: "timer", path: "/pomodoro" },
      { name: "Music", icon: "musical-notes", path: "/music" },
    ];

    return (
      <Modal
        visible={menuOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setMenuOpen(false)}
        >
          <SafeAreaView style={styles.drawerContent}>
            <View style={styles.drawerHeader}>
              <View style={{ width: 40 }} /> {/* Spacer for balance */}
              <Text style={styles.drawerTitle}>Quick Access</Text>
              {/* Logout Button in Upper Right */}
              <TouchableOpacity
                onPress={handleLogout}
                style={styles.logoutButton}
              >
                <Ionicons name="log-out-outline" size={24} color="#EE8D8D" />
              </TouchableOpacity>
            </View>

            <View style={styles.gridContainer}>
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.path as string}
                  style={styles.gridItem}
                  onPress={() => navigateAndClose(item.path)}
                >
                  <View style={styles.iconCircle}>
                    <Ionicons name={item.icon} size={24} color="#5971C0" />
                  </View>
                  <Text style={styles.itemText}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Close Button at Bottom for better reachability */}
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setMenuOpen(false)}
            >
              <Text style={styles.closeBtnText}>Close Menu</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </Pressable>
      </Modal>
    );
  };

  const LeftControls = () => (
    <View style={styles.headerLeftContainer}>
      <TouchableOpacity
        onPress={() => setMenuOpen(true)}
        style={styles.menuTrigger}
        activeOpacity={0.7}
      >
        <Ionicons name="apps" size={22} color="#5971C0" />
      </TouchableOpacity>
    </View>
  );

  const RightControls = () => (
    <View style={styles.headerRightContainer}>
      <View style={styles.headerTimerContainer}>
        <TouchableOpacity
          onPress={() => router.navigate("/pomodoro")}
          style={styles.timeSection}
        >
          <Ionicons
            name="time-outline"
            size={16}
            color={isRunning ? "#4E9C8F" : "#7A6654"}
          />
          <Text style={styles.headerTimerText}>{formatTime(secondsLeft)}</Text>
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity onPress={toggle} style={styles.controlSection}>
          <Ionicons
            name={isRunning ? "pause" : "play"}
            size={16}
            color={isRunning ? "#EE8D8D" : "#6FAE9A"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  useEffect(() => {
    const subscriber = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (initializing) setInitializing(false);
    });
    return subscriber;
  }, []);

  useEffect(() => {
    if (initializing) return;
    const isPublicRoute = ["login", "register", "verify"].includes(segments[0]);
    if (!user && !isPublicRoute) {
      router.replace("/login");
    } else if (user && isPublicRoute) {
      router.replace("/");
    }
  }, [user, initializing, segments]);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#5971C0" />
      </View>
    );
  }

  return (
    <>
      <HeaderDrawer />
      <Stack
        screenOptions={{
          headerLeft: () => <LeftControls />,
          headerRight: () => <RightControls />,
          headerTitle: "",
          headerBackVisible: false,
          gestureEnabled: false,
          headerStyle: { backgroundColor: "#FFF" },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="verify" options={{ headerShown: false }} />
        <Stack.Screen name="profile/index" options={{ title: "Profile" }} />
        <Stack.Screen name="todo/index" />
        <Stack.Screen name="flashcard/index" />
        <Stack.Screen name="music/index" />
        <Stack.Screen name="notepad/index" />
        <Stack.Screen name="pomodoro/index" />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  headerLeftContainer: { marginLeft: 15 },
  headerRightContainer: { marginRight: 15 },
  menuTrigger: {
    padding: 8,
    backgroundColor: "#F0F2F9",
    borderRadius: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center", // Centered the Modal
    alignItems: "center",
  },
  drawerContent: {
    backgroundColor: "white",
    borderRadius: 25, // Fully rounded for centered look
    padding: 24,
    width: "85%", // Constrained width for centering
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  drawerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2C1F16",
    textAlign: "center",
  },
  logoutButton: {
    padding: 4,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center", // Centered the icons
    gap: 20,
    marginBottom: 20,
  },
  gridItem: {
    width: "28%",
    alignItems: "center",
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: "#F0F2F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  itemText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#444",
  },
  closeBtn: {
    marginTop: 10,
    padding: 12,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    alignItems: "center",
  },
  closeBtnText: {
    fontWeight: "700",
    color: "#7A6654",
  },
  headerTimerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  timeSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 10,
    paddingRight: 6,
    paddingVertical: 6,
    gap: 4,
  },
  divider: { width: 1, height: "60%", backgroundColor: "#DDD" },
  controlSection: { paddingLeft: 6, paddingRight: 10, paddingVertical: 6 },
  headerTimerText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#333",
    fontVariant: ["tabular-nums"],
  },
});
