import CustomButton from "@/components/CustomButton";
import CustomTextInput from "@/components/CustomTextInput";
import emailjs from "@emailjs/react-native";
import { useRouter } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../firebaseConfig";

// Initialize EmailJS
emailjs.init({ publicKey: "bYzbLSbuDg4fOHWFK" });

const { width } = Dimensions.get("window");

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const checkIfEmailExists = async (userEmail: string) => {
    try {
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("email", "==", userEmail.toLowerCase().trim()),
      );
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error("Firestore Check Error:", error);
      throw new Error("Could not verify email status.");
    }
  };

  const handleGoToVerification = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const exists = await checkIfEmailExists(email);
      if (exists) {
        Alert.alert(
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
      Alert.alert(
        "Error",
        error.message || "Something went wrong. Please check your connection.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../assets/images/bglogin.png")}
      resizeMode="cover"
      style={styles.background}
    >
      {/* KeyboardAvoidingView prevents the keyboard from hiding the inputs */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, width: "100%" }}
      >
        {/* Title Section is OUTSIDE ScrollView — stays fixed when keyboard opens */}
        <View style={styles.titleContainer}>
          <Text style={styles.registerText}>REGISTER</Text>
          <Text style={styles.subtitleText}>
            Time to get inky — it's time to study!
          </Text>
        </View>

        {/* Only the form scrolls when keyboard is open */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.innerContainer}>
            {/* Input Section */}
            <View className="gap-0">
              <CustomTextInput
                placeholder="First Name"
                iconName="user"
                value={firstName}
                onChangeText={setFirstName}
                editable={!isLoading}
              />
              <CustomTextInput
                placeholder="Last Name"
                iconName="user"
                value={lastName}
                onChangeText={setLastName}
                editable={!isLoading}
              />
              <CustomTextInput
                placeholder="Email"
                iconName="mail"
                value={email}
                keyboardType="email-address"
                onChangeText={setEmail}
                editable={!isLoading}
                autoCapitalize="none"
              />
              <CustomTextInput
                placeholder="Password"
                iconName="lock"
                value={password}
                onChangeText={setPassword}
                editable={!isLoading}
                autoCapitalize="none"
                secureTextEntry
              />
              <CustomTextInput
                placeholder="Confirm Password"
                iconName="lock"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                editable={!isLoading}
                autoCapitalize="none"
                secureTextEntry
              />
            </View>

            <View style={{ height: 20 }} />

            {/* Action Section */}
            <View>
              {isLoading ? (
                <ActivityIndicator size="large" color="#FFEF9A" />
              ) : (
                <CustomButton
                  title="Continue to Verification"
                  onPress={handleGoToVerification}
                />
              )}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  marginTop: 16,
                }}
              >
                <TouchableOpacity onPress={() => router.push("/login")}>
                  <Text style={{ color: "white", fontSize: 15 }}>
                    Already a buddy?{" "}
                    <Text
                      style={{
                        fontWeight: "bold",
                        textDecorationLine: "underline",
                      }}
                    >
                      Sign In
                    </Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  innerContainer: {
    width: "100%",
    paddingHorizontal: "8%",
  },
  // Title is fixed — outside ScrollView
  titleContainer: {
    paddingHorizontal: "8%",
    paddingTop: "55%", // ✅ reduced so octopus shows at top
    marginBottom: 32,
  },
  registerText: {
    fontSize: 65,
    fontWeight: "900",
    color: "#FFEF9A",
    textShadowColor: "#000000",
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 1,
    letterSpacing: 1,
    textAlign: "center", // ✅ matches Figma
  },
  subtitleText: {
    color: "#553A00",
    fontSize: 19,
    fontFamily: "Poppins-Bold",
    fontWeight: "700",
    textAlign: "center", // ✅ matches Figma
    textShadowColor: "rgba(0, 0, 0, 0.25)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});
