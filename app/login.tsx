import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import LottieView from "lottie-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { auth } from "../firebaseConfig";

// Siguraduhin na ang path ay tama base sa kung nasaan ang file mo
import { CustomAlert } from "@/components/CustomAlert";
import CustomGlowInput from "@/components/CustomGlowInput";
import CustomSpringButton from "@/components/CustomSpringButton";
import GeometricBackground from "@/components/GeometricBackground";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // States para sa CustomAlert
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertData, setAlertData] = useState({ title: "", message: "" });

  const { width, height } = useWindowDimensions();
  const router = useRouter();

  const slideAnim = useRef(new Animated.Value(0)).current;
  const keyboardShift = useRef(new Animated.Value(0)).current;

  const showAlert = (title: string, message: string) => {
    setAlertData({ title, message });
    setAlertVisible(true);
  };

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 1,
      tension: 45,
      friction: 9,
      useNativeDriver: true,
    }).start();

    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showListener = Keyboard.addListener(showEvent, (event) => {
      Animated.timing(keyboardShift, {
        toValue: -event.endCoordinates.height * 0.55,
        duration: Platform.OS === "ios" ? event.duration : 250,
        useNativeDriver: true,
      }).start();
    });

    const hideListener = Keyboard.addListener(hideEvent, () => {
      Animated.timing(keyboardShift, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  const cardTranslateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [height * 0.45, 0],
  });

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert("Error", "Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (error: any) {
      let errorMessage = "Please enter a valid email address or password.";
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        errorMessage = "Invalid email or password.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address.";
      }
      showAlert("Login Failed", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#7DD3FC", "#38BDF8", "#0EA5E9"]}
      style={StyleSheet.absoluteFill}
    >
      <View style={StyleSheet.absoluteFillObject}>
        <GeometricBackground />
      </View>

      <Animated.View
        style={[{ flex: 1 }, { transform: [{ translateY: keyboardShift }] }]}
      >
        <View style={{ flex: 1 }}>
          <View style={styles.animationContainer}>
            <LottieView
              source={require("../assets/animations/Stuby.json")}
              autoPlay
              loop
              style={{ flex: 1, width: "100%" }}
              resizeMode="contain"
            />
          </View>

          <Animated.View
            style={[
              styles.card,
              { transform: [{ translateY: cardTranslateY }] },
            ]}
          >
            <ScrollView
              style={{ width: "100%" }}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <View style={{ marginBottom: 24, alignItems: "center" }}>
                <Text
                  style={[styles.title, { fontSize: width < 380 ? 46 : 56 }]}
                >
                  LOGIN
                </Text>
                <Text style={styles.subtitle}>
                  Excited to see you again, buddy!
                </Text>
              </View>

              <View style={styles.inputContainer}>
                <CustomGlowInput
                  placeholder="Email"
                  iconName="user"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                <CustomGlowInput
                  placeholder="Password"
                  iconName="lock"
                  isPassword={true}
                  value={password}
                  onChangeText={setPassword}
                />

                <TouchableOpacity
                  style={styles.forgotBtn}
                  onPress={() => router.push("/forgetpass")}
                >
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>

                <CustomSpringButton
                  title="Login"
                  onPress={handleLogin}
                  isLoading={isLoading}
                />

                <View style={styles.registerContainer}>
                  <Link href="/register" asChild>
                    <TouchableOpacity>
                      <Text style={styles.registerText}>
                        Don't have an account?{" "}
                        <Text style={styles.registerLink}>Register</Text>
                      </Text>
                    </TouchableOpacity>
                  </Link>
                </View>
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      </Animated.View>

      <CustomAlert
        visible={alertVisible}
        title={alertData.title}
        message={alertData.message}
        onClose={() => setAlertVisible(false)}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  animationContainer: {
    height: 200,
    marginTop: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: 20,
  },
  scrollContent: { flexGrow: 1, paddingTop: 32, paddingBottom: 40 },
  inputContainer: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: "8%",
  },
  title: { fontWeight: "900", color: "#334155", letterSpacing: 2 },
  subtitle: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: "bold",
    color: "#64748B",
  },
  forgotBtn: { alignSelf: "flex-end", marginTop: 4, marginBottom: 24 },
  forgotText: { color: "#0EA5E9", fontWeight: "bold", fontSize: 16 },
  registerContainer: { marginTop: 24, alignItems: "center" },
  registerText: { color: "#64748B", fontSize: 16 },
  registerLink: {
    fontWeight: "bold",
    textDecorationLine: "underline",
    color: "#0EA5E9",
  },
});
