import CustomButton from "@/components/CustomButton";
import { useLocalSearchParams, useRouter } from "expo-router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import React, { useRef, useState } from "react"; // Added useRef
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../firebaseConfig";

const { height } = Dimensions.get("window");

export default function Verify() {
  const { firstName, lastName, email, password, correctOtp, expiry } =
    useLocalSearchParams();
  const router = useRouter();

  // 1. Fixed State: Array of 6 strings for the OTP boxes
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isRegistering, setIsRegistering] = useState(false);

  // 2. Refs to handle auto-focusing next/previous inputs
  const inputsRef = useRef<Array<TextInput | null>>([]);

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];

    // Only allow numeric input
    const cleanText = text.replace(/[^0-9]/g, "");
    newOtp[index] = cleanText;
    setOtp(newOtp);

    // Auto-focus next input if we typed a digit
    if (cleanText && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Move to previous input on backspace if current box is empty
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullOtp = otp.join(""); // Combine the array into one string
    const currentTime = Date.now();

    if (expiry && currentTime > Number(expiry)) {
      Alert.alert(
        "Code Expired",
        "The verification code has expired (15 min limit).",
        [{ text: "Go Back", onPress: () => router.back() }],
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

        await updateProfile(user, {
          displayName: `${firstName} ${lastName}`,
        });

        await setDoc(doc(db, "users", user.uid), {
          firstName: firstName,
          lastName: lastName,
          email: (email as string).toLowerCase().trim(),
          createdAt: new Date(),
        });

        Alert.alert("Success", "Account created!");
        router.replace("/");
      } catch (error: any) {
        Alert.alert("Registration Error", error.message);
      } finally {
        setIsRegistering(false);
      }
    } else {
      Alert.alert("Invalid Code", "The OTP entered does not match.");
    }
  };

  return (
    <ImageBackground
      source={require("../assets/images/bglogin.png")}
      resizeMode="cover"
      className="flex-1 items-center justify-center"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ width: "100%", alignItems: "center", paddingHorizontal: 24 }}
      >
        <View
          style={{
            width: "100%",
            backgroundColor: "#FFF9E5",
            borderRadius: 24,
            paddingHorizontal: 20,
            paddingVertical: 32,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 5,
          }}
        >
          <Text
            style={{
              fontSize: 26,
              fontWeight: "800",
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            Verify Email
          </Text>

          <Text
            style={{
              textAlign: "center",
              color: "#4B3A00",
              fontSize: 13,
              marginBottom: 24,
            }}
          >
            Enter the 6-digit code sent to{"\n"}
            <Text style={{ fontWeight: "bold" }}>{email}</Text>
          </Text>

          {/* 6 Individual OTP Inputs */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 30,
            }}
          >
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                // Fixed: Added explicit type to the ref parameter
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
                style={{
                  width: 45,
                  height: 55,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: digit ? "#4CAF50" : "#9CA3AF",
                  textAlign: "center",
                  fontSize: 22,
                  fontWeight: "700",
                  backgroundColor: "white",
                }}
              />
            ))}
          </View>

          {isRegistering ? (
            <ActivityIndicator size="large" color="green" />
          ) : (
            <View style={{ gap: 12 }}>
              <CustomButton
                title="Verify and Register"
                onPress={handleVerify}
              />
              <TouchableOpacity onPress={() => router.back()}>
                <Text
                  style={{
                    textAlign: "center",
                    color: "gray",
                    fontWeight: "600",
                  }}
                >
                  Back
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}
