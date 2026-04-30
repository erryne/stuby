import CustomButton from "@/components/CustomButton";
import CustomTextInput from "@/components/CustomTextInput";
import { Link, useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../firebaseConfig";

const { width } = Dimensions.get("window");

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace("/");
    } catch (error: any) {
      let errorMessage = "An unknown error occurred.";
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        errorMessage = "Invalid email or password.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address.";
      }
      Alert.alert("Login Failed", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../assets/images/bglogin.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      {/* KeyboardAvoidingView prevents the keyboard from hiding the inputs */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* Title is OUTSIDE ScrollView — stays fixed when keyboard opens */}
        <View
          style={{
            paddingHorizontal: "8%",
            paddingTop: "55%",
            marginBottom: 32,
          }}
        >
          {/* Header */}
          <Text
            style={{
              fontSize: width < 380 ? 54 : 68,
              fontWeight: "900",
              color: "#FFEF9A",
              textShadowColor: "#000",
              textShadowOffset: { width: 4, height: 4 },
              textShadowRadius: 1,
              letterSpacing: 1,
              textAlign: "left",
            }}
          >
            LOGIN
          </Text>

          <Text
            style={{
              marginTop: 4,
              fontSize: 20,
              color: "#553A00",
              fontWeight: "700",
              textAlign: "left",
              textShadowColor: "rgba(0,0,0,0.25)",
              textShadowOffset: { width: 0, height: 2 },
              textShadowRadius: 4,
            }}
          >
            Excited to see you again, buddy!
          </Text>
        </View>

        {/* Only the form scrolls when keyboard is open */}
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: "8%", paddingBottom: 40 }}
          bounces={false}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Form Section */}
          <CustomTextInput
            placeholder="Email"
            textContentType="username"
            iconName="user"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!isLoading}
          />

          <CustomTextInput
            placeholder="Password"
            secureTextEntry
            iconName="lock"
            value={password}
            onChangeText={setPassword}
            editable={!isLoading}
          />

          <TouchableOpacity
            style={{ alignSelf: "flex-end", marginTop: 6, marginBottom: 24 }}
          >
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 15 }}>
              Forgot Password?
            </Text>
          </TouchableOpacity>

          <View style={{ width: "100%" }}>
            {isLoading ? (
              <ActivityIndicator size="large" color="#FFEF9A" />
            ) : (
              <CustomButton title="Login" onPress={handleLogin} />
            )}
          </View>

          {/* Footer */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginTop: 16,
            }}
          >
            <Link href="/register" asChild>
              <TouchableOpacity>
                <Text style={{ color: "white", fontSize: 15 }}>
                  Not a buddy?{" "}
                  <Text
                    style={{
                      fontWeight: "bold",
                      textDecorationLine: "underline",
                    }}
                  >
                    Register Here
                  </Text>
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}
