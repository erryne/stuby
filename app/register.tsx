import emailjs from "@emailjs/react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { db } from "../firebaseConfig";

// Components
import { CustomAlert } from "@/components/CustomAlert";
import CustomGlowInput from "@/components/CustomGlowInput";
import CustomSpringButton from "@/components/CustomSpringButton";
import GeometricBackground from "@/components/GeometricBackground";

emailjs.init({ publicKey: "bYzbLSbuDg4fOHWFK" });

const { width, height } = Dimensions.get("window");
const isSmallDevice = width < 380;

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Alert State
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: "", message: "" });

  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 1,
      tension: 45,
      friction: 9,
      useNativeDriver: true,
    }).start();
  }, []);

  const cardTranslateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [height * 0.45, 0],
  });

  const showAlert = (title: string, message: string) => {
    setAlertConfig({ title, message });
    setAlertVisible(true);
  };

  const checkIfEmailExists = async (userEmail: string) => {
    try {
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("email", "==", userEmail.toLowerCase().trim()),
      );
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error: any) {
      if (error.code === "permission-denied") return false;
      return false;
    }
  };

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleGoToVerification = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      showAlert("Error", "Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      showAlert("Error", "Passwords do not match.");
      return;
    }
    if (!passwordRegex.test(password)) {
      showAlert(
        "Invalid Password",
        "Password must be at least 8 characters long and includes uppercase, lowercase, number, and special character.",
      );
      return;
    }
    if (!emailRegex.test(email)) {
      showAlert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    setIsLoading(true);

    try {
      const exists = await checkIfEmailExists(email);
      if (exists) {
        showAlert(
          "Account Exists",
          "This email is already registered. Please login instead.",
        );
        setIsLoading(false);
        return;
      }

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiryTime = Date.now() + 15 * 60 * 1000;

      await emailjs.send("service_njnkvtb", "template_lgroee7", {
        to_email: email.trim(),
        to_name: `${firstName} ${lastName}`,
        otp_code: code,
      });

      router.push({
        pathname: "/verify",
        params: {
          firstName,
          lastName,
          email: email.toLowerCase().trim(),
          password,
          correctOtp: code,
          expiry: expiryTime.toString(),
        },
      });
    } catch (error: any) {
      showAlert(
        "Error",
        error.message || "Something went wrong. Please check your connection.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#7DD3FC", "#38BDF8", "#0EA5E9"]}
      style={{ flex: 1 }}
    >
      <GeometricBackground />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 justify-end">
            <Animated.View
              className="bg-white rounded-t-[40px] px-[8%] pt-8"
              style={{
                height: "85%",
                shadowColor: "#334155",
                shadowOffset: { width: 0, height: -14 },
                shadowOpacity: 0.12,
                shadowRadius: 24,
                elevation: 20,
                transform: [{ translateY: cardTranslateY }],
              }}
            >
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
              >
                <View className="mb-6 justify-center items-center">
                  <Text
                    className="font-black text-[#334155] tracking-wider"
                    style={{ fontSize: isSmallDevice ? 40 : 50 }}
                  >
                    REGISTER
                  </Text>
                  <Text className="mt-1 text-base font-bold text-[#64748B] text-center">
                    Time to get inky — it's time to study!
                  </Text>
                </View>

                <View className="gap-3">
                  <CustomGlowInput
                    placeholder="First Name"
                    iconName="user"
                    value={firstName}
                    onChangeText={setFirstName}
                    editable={!isLoading}
                  />
                  <CustomGlowInput
                    placeholder="Last Name"
                    iconName="user"
                    value={lastName}
                    onChangeText={setLastName}
                    editable={!isLoading}
                  />
                  <CustomGlowInput
                    placeholder="Email"
                    iconName="mail"
                    value={email}
                    keyboardType="email-address"
                    onChangeText={setEmail}
                    editable={!isLoading}
                    autoCapitalize="none"
                  />
                  <CustomGlowInput
                    placeholder="Password"
                    iconName="lock"
                    isPassword={true}
                    value={password}
                    onChangeText={setPassword}
                    editable={!isLoading}
                    autoCapitalize="none"
                  />
                  <CustomGlowInput
                    placeholder="Confirm Password"
                    iconName="lock"
                    isPassword={true}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    editable={!isLoading}
                    autoCapitalize="none"
                  />
                </View>

                <View className="mt-6">
                  <CustomSpringButton
                    title="Continue to Verification"
                    onPress={handleGoToVerification}
                    isLoading={isLoading}
                  />
                  <TouchableOpacity
                    onPress={() => router.push("/login")}
                    className="mt-6 items-center"
                  >
                    <Text className="text-slate-500 text-[15px] font-medium">
                      Already a buddy?{" "}
                      <Text className="font-extrabold underline text-[#0EA5E9]">
                        Sign In
                      </Text>
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => setAlertVisible(false)}
      />
    </LinearGradient>
  );
}
