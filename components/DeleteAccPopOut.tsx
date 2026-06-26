import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface Props {
  visible: boolean;
  onCancel: () => void;
  onDelete: (password: string) => Promise<void>;
}

const DeleteAccPopOut = ({ visible, onCancel, onDelete }: Props) => {
  const [password, setPassword] = useState("");
  const [isSecure, setIsSecure] = useState(true);
  const [loading, setLoading] = useState(false);

  const scaleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setPassword(""); // Clear input on open
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

  const handleSubmit = async () => {
    if (!password.trim()) return;
    setLoading(true);
    try {
      await onDelete(password);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent={Platform.OS === "android"}
      animationType="none"
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex1}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <Animated.View
            style={[styles.modalOverlay, { opacity: opacityValue }]}
          >
            <Animated.View
              style={[
                styles.modalContainer,
                { transform: [{ scale: scaleValue }] },
              ]}
            >
              <View style={styles.header}>
                <View style={styles.warningIconBg}>
                  <Feather name="trash-2" size={24} color="#EF4444" />
                </View>
                <Text style={styles.title}>Delete Account</Text>
                <Text style={styles.subtitle}>
                  This action cannot be undone. All your notes, folders, tasks,
                  and data will be permanently removed.
                </Text>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.passwordWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={isSecure}
                    value={password}
                    onChangeText={setPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setIsSecure(!isSecure)}
                  >
                    <Feather
                      name={isSecure ? "eye-off" : "eye"}
                      size={20}
                      color="#64748B"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.btn, styles.cancelBtn]}
                  onPress={onCancel}
                  disabled={loading}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.btn,
                    styles.deleteBtn,
                    (!password.trim() || loading) && styles.disabledBtn,
                  ]}
                  onPress={handleSubmit}
                  disabled={!password.trim() || loading}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.deleteText}>Delete</Text>
                  )}
                </TouchableOpacity>
              </View>
            </Animated.View>
          </Animated.View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
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
    width: "85%",
    backgroundColor: "white",
    borderRadius: 28,
    padding: 24,
    alignItems: "center",
    elevation: 10,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  warningIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 8,
    marginLeft: 4,
  },
  passwordWrapper: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingLeft: 16,
    paddingRight: 45,
    fontSize: 15,
    color: "#1E293B",
    fontWeight: "600",
  },
  eyeIcon: {
    position: "absolute",
    right: 14,
    height: "100%",
    justifyContent: "center",
  },
  actionRow: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
  },
  btn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelBtn: {
    backgroundColor: "#F1F5F9",
  },
  deleteBtn: {
    backgroundColor: "#EF4444",
  },
  disabledBtn: {
    backgroundColor: "#FCA5A5",
  },
  cancelText: {
    color: "#475569",
    fontWeight: "700",
    fontSize: 15,
  },
  deleteText: {
    color: "white",
    fontWeight: "700",
    fontSize: 15,
  },
});

export default DeleteAccPopOut;
