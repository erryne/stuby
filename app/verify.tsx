import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { auth, db } from "../firebaseConfig";

// Components
import { CustomAlert } from "@/components/CustomAlert"; // Siguraduhin ang tamang path
import CustomSpringButton from "@/components/CustomSpringButton";
import GeometricBackground from "@/components/GeometricBackground";

export default function Verify() {
  const { firstName, lastName, email, password, correctOtp, expiry } =
    useLocalSearchParams();
  const router = useRouter();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isRegistering, setIsRegistering] = useState(false);

  // States para sa CustomAlert
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: "", message: "" });

  const inputsRef = useRef<Array<TextInput | null>>([]);

  const showAlert = (title: string, message: string) => {
    setAlertConfig({ title, message });
    setAlertVisible(true);
  };

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    const cleanText = text.replace(/[^0-9]/g, "");
    newOtp[index] = cleanText;
    setOtp(newOtp);

    if (cleanText && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullOtp = otp.join("");
    const currentTime = Date.now();

    if (expiry && currentTime > Number(expiry)) {
      showAlert(
        "Code Expired",
        "The verification code has expired (15 min limit).",
      );
      return;
    }

    if (fullOtp === String(correctOtp)) {
      setIsRegistering(true);
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email as string,
          password as string,
        );

        const user = userCredential.user;
        await updateProfile(user, { displayName: `${firstName} ${lastName}` });

        await setDoc(doc(db, "users", user.uid), {
          firstName: firstName,
          lastName: lastName,
          email: (email as string).toLowerCase().trim(),
          hasCompletedIntro: false,
          createdAt: new Date(),
        });

        router.replace("/introduction/welcomeIntroduction");
      } catch (error: any) {
        showAlert(
          "Registration Error",
          "Email may already be in use or invalid. Please try again.",
        );
      } finally {
        setIsRegistering(false);
      }
    } else {
      showAlert("Invalid Code", "The OTP entered does not match.");
    }
  };

  return (
    <LinearGradient
      colors={["#7DD3FC", "#38BDF8", "#0EA5E9"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.rootContainer}
    >
      <View style={StyleSheet.absoluteFillObject}>
        <GeometricBackground />
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView style={styles.keyboardView}>
          <View style={styles.cardContainer}>
            <Text style={styles.title}>Verify Email</Text>
            <Text style={styles.subtitle}>
              Enter the 6-digit code sent to{"\n"}
              <Text style={{ fontWeight: "bold", color: "#38BDF8" }}>
                {email}
              </Text>
            </Text>

            <View style={styles.otpRow}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref: TextInput | null) => {
                    inputsRef.current[index] = ref;
                  }}
                  value={digit}
                  onChangeText={(text) => handleChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  placeholder="0"
                  placeholderTextColor="#D1D5DB"
                  style={[
                    styles.input,
                    { borderColor: digit ? "#0EA5E9" : "#CBD5E1" },
                  ]}
                />
              ))}
            </View>

            {isRegistering ? (
              <ActivityIndicator size="large" color="#0EA5E9" />
            ) : (
              <View style={{ gap: 12 }}>
                <CustomSpringButton
                  title="Verify and Register"
                  onPress={handleVerify}
                />
                <TouchableOpacity onPress={() => router.back()}>
                  <Text style={styles.backButton}>Back</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => setAlertVisible(false)}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  rootContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  keyboardView: { width: "100%", alignItems: "center", paddingHorizontal: 24 },
  cardContainer: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 32,
    elevation: 8,
    shadowColor: "#334155",
    shadowOpacity: 0.12,
    shadowRadius: 15,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
    color: "#334155",
  },
  subtitle: {
    textAlign: "center",
    color: "#64748B",
    fontSize: 13,
    marginBottom: 24,
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  input: {
    width: 45,
    height: 55,
    borderRadius: 12,
    borderWidth: 2,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
    backgroundColor: "white",
    color: "#334155",
  },
  backButton: { textAlign: "center", color: "#94A3B8", fontWeight: "600" },
});
