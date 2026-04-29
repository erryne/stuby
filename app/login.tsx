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
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={{
              flex: 1,
              paddingHorizontal: "8%",
              justifyContent: "center", // Centers the content vertically
            }}
          >
            {/* Header */}
            <View style={{ marginBottom: 40, marginTop: 60 }}>
              <Text
                style={{
                  fontSize: width < 380 ? 54 : 68,
                  fontWeight: "900",
                  color: "#FFEF9A",
                  textShadowColor: "#000",
                  textShadowOffset: { width: 4, height: 4 },
                  textShadowRadius: 1,
                  letterSpacing: 1,
                }}
              >
                LOGIN
              </Text>

              <Text
                style={{
                  marginTop: 4,
                  fontSize: 18,
                  color: "#553A00",
                  fontWeight: "700",
                  textShadowColor: "rgba(0,0,0,0.25)",
                  textShadowOffset: { width: 0, height: 2 },
                  textShadowRadius: 4,
                }}
              >
                Excited to see you again, buddy!
              </Text>
            </View>

            {/* Form Section */}
            <View className="items-center">
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

              <TouchableOpacity className="self-end mt-2 mb-8">
                <Text className="text-white font-bold text-base">
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
            </View>

            {/* Footer */}
            <View className="flex-row justify-center mt-10 mb-10">
              <Link href="/register" asChild>
                <TouchableOpacity>
                  <Text style={{ color: "white", fontSize: 16 }}>
                    Don't have an account?{" "}
                    <Text
                      style={{
                        fontWeight: "bold",
                        textDecorationLine: "underline",
                      }}
                    >
                      Register
                    </Text>
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}
