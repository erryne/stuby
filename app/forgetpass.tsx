import { CustomAlert } from "@/components/CustomAlert"; // Siguraduhing tama ang import path
import CustomSpringButton from "@/components/CustomSpringButton";
import CustomTextInput from "@/components/CustomTextInput";
import GeometricBackground from "@/components/GeometricBackground";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { sendPasswordResetEmail } from "firebase/auth";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { auth } from "../firebaseConfig";

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // States para sa CustomAlert
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [shouldNavigate, setShouldNavigate] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      setAlertTitle("Error");
      setAlertMessage("Please enter your email address first.");
      setAlertVisible(true);
      return;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      setAlertTitle("Error");
      setAlertMessage("Please enter a valid email address.");
      setAlertVisible(true);
      return;
    }

    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email.toLowerCase().trim());

      setAlertTitle("Link Sent!");
      setAlertMessage(
        "A password reset link has been sent to your email. Please check your inbox (and spam folder).",
      );
      setShouldNavigate(true);
      setAlertVisible(true);
    } catch (error: any) {
      console.error("Reset Error:", error.code, error.message);

      let errorMessage = "Something went wrong. Please try again.";
      if (error.code === "auth/user-not-found") {
        errorMessage = "No user found with this email address.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "The email address is badly formatted.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many requests. Please try again later.";
      }

      setAlertTitle("Reset Failed");
      setAlertMessage(errorMessage);
      setShouldNavigate(false);
      setAlertVisible(true);
    } finally {
      setLoading(false);
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
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.flexFill}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.cardContainer}>
              <Text style={styles.headerText}>Forgot Password?</Text>
              <Text style={styles.subText}>
                No worries! Enter your email and we'll send you a link to reset
                your password.
              </Text>

              <CustomTextInput
                placeholder="Enter your email"
                iconName="mail"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                editable={!loading}
              />

              {loading ? (
                <ActivityIndicator
                  size="large"
                  color="#0EA5E9"
                  style={{ marginTop: 20 }}
                />
              ) : (
                <CustomSpringButton
                  title="SEND RESET LINK"
                  onPress={handleResetPassword}
                />
              )}

              <TouchableOpacity
                onPress={() => router.back()}
                style={{ marginTop: 24, alignItems: "center" }}
                disabled={loading}
              >
                <Text style={{ color: "#94A3B8", fontWeight: "600" }}>
                  Back to Login
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      {/* Custom Alert Component */}
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => {
          setAlertVisible(false);
          if (shouldNavigate) {
            router.replace("/login");
          }
        }}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  rootContainer: { flex: 1 },
  flexFill: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  cardContainer: {
    backgroundColor: "white",
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 32,
    shadowColor: "#334155",
    shadowOpacity: 0.12,
    shadowRadius: 15,
    elevation: 8,
  },
  headerText: {
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
    color: "#334155",
    marginBottom: 8,
  },
  subText: {
    textAlign: "center",
    color: "#64748B",
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
  },
});

export default ForgotPasswordScreen;
