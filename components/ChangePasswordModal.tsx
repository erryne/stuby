import emailjs from "@emailjs/browser";
import { Feather } from "@expo/vector-icons";
import { sendPasswordResetEmail } from "firebase/auth";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../firebaseConfig";
import { CustomAlert } from "./CustomAlert";

interface Props {
  visible: boolean;
  onClose: () => void;
}

const ChangePasswordModal = ({ visible, onClose }: Props) => {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertContent, setAlertContent] = useState({ title: "", message: "" });

  const inputsRef = useRef<Array<TextInput | null>>([]);
  const scaleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  const triggerAlert = (title: string, message: string) => {
    setAlertContent({ title, message });
    setAlertVisible(true);
  };

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleInitiateChange = async () => {
    if (!auth.currentUser?.email) {
      triggerAlert("Error", "User email not found.");
      return;
    }

    setIsSending(true);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);

    try {
      await emailjs.send(
        "service_njnkvtb",
        "template_lgroee7",
        { to_email: auth.currentUser.email, otp_code: code },
        "bYzbLSbuDg4fOHWFK",
      );
      setIsOtpSent(true);
    } catch (error) {
      triggerAlert("Error", "Failed to send OTP email.");
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyAndComplete = async () => {
    if (otp.join("") !== generatedOtp) {
      triggerAlert("Error", "Invalid OTP.");
      return;
    }

    if (!auth.currentUser?.email) return;

    setIsSending(true);
    try {
      await sendPasswordResetEmail(auth, auth.currentUser.email);
      triggerAlert(
        "Check Your Email",
        "We already sent you an email. Please check your inbox.",
      );
      onClose();
    } catch (error: any) {
      triggerAlert("Error", error.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        statusBarTranslucent={Platform.OS === "android"}
        animationType="none"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.flex1}
        >
          <Animated.View
            style={[styles.modalOverlay, { opacity: opacityValue }]}
          >
            <Animated.View
              style={[
                styles.modalContainer,
                { transform: [{ scale: scaleValue }] },
              ]}
            >
              <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.header}>
                  <Text style={styles.title}>
                    {isOtpSent ? "Verify OTP" : "Reset Password"}
                  </Text>
                  <TouchableOpacity
                    onPress={onClose}
                    style={styles.closeButton}
                  >
                    <Feather name="x" size={24} />
                  </TouchableOpacity>
                </View>

                {!isOtpSent ? (
                  <View>
                    <Text style={styles.infoText}>
                      A verification code will be sent to your email to confirm
                      your password reset request.
                    </Text>
                    <TouchableOpacity
                      style={styles.button}
                      onPress={handleInitiateChange}
                      disabled={isSending}
                    >
                      {isSending ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <Text style={styles.buttonText}>
                          Send Verification Code
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View>
                    <Text style={styles.label}>Enter 6-digit code</Text>
                    <View style={styles.otpRow}>
                      {otp.map((digit, i) => (
                        <TextInput
                          key={i}
                          ref={(el: TextInput | null) => {
                            inputsRef.current[i] = el;
                          }}
                          style={styles.otpInput}
                          maxLength={1}
                          keyboardType="number-pad"
                          value={otp[i]}
                          onChangeText={(t) => {
                            let n = [...otp];
                            n[i] = t;
                            setOtp(n);

                            if (t) {
                              // If a character is added, shift focus forward
                              if (i < 5) inputsRef.current[i + 1]?.focus();
                            } else {
                              // FIX FOR iOS: If text is cleared, shift focus backward
                              if (i > 0) inputsRef.current[i - 1]?.focus();
                            }
                          }}
                        />
                      ))}
                    </View>
                    <TouchableOpacity
                      style={styles.button}
                      onPress={handleVerifyAndComplete}
                      disabled={isSending}
                    >
                      {isSending ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <Text style={styles.buttonText}>Confirm & Reset</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            </Animated.View>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>

      <CustomAlert
        visible={alertVisible}
        title={alertContent.title}
        message={alertContent.message}
        onClose={() => setAlertVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 30,
    padding: 24,
    maxHeight: "80%",
  },
  scrollContent: { paddingBottom: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: { fontSize: 24, fontWeight: "800" },
  closeButton: { padding: 5 },
  infoText: {
    fontSize: 15,
    color: "#475569",
    marginBottom: 20,
    textAlign: "center",
  },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  otpInput: {
    width: 42, // Slipped slightly down to avoid row layout wrapping issues on narrow screens
    height: 55,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
  },
  button: {
    backgroundColor: "#A7F3D0",
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: { color: "#065F46", fontWeight: "700" },
});

export default ChangePasswordModal;
