import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface DeleteAlertProps {
  visible: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

export const DeleteAlert = ({
  visible,
  title,
  message,
  onCancel,
  onConfirm,
}: DeleteAlertProps) => {
  const [shouldRender, setShouldRender] = useState(visible);
  const [isDeleting, setIsDeleting] = useState(false);
  const scaleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  // Reset state when visibility changes
  useEffect(() => {
    if (!visible) {
      setIsDeleting(false);
    }
  }, [visible]);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          friction: 8,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (shouldRender) {
      Animated.parallel([
        Animated.timing(scaleValue, {
          toValue: 0.85,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start(() => setShouldRender(false));
    }
  }, [visible]);

  const handleConfirmPress = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      // We don't set setIsDeleting(false) here because if onConfirm
      // is successful, the parent component usually closes the modal,
      // triggering the cleanup useEffect above.
    } catch (error) {
      console.error("Delete failed:", error);
      setIsDeleting(false); // Only re-enable if there is an error
    }
  };

  if (!shouldRender) return null;

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="none"
      onRequestClose={isDeleting ? undefined : onCancel}
    >
      <Animated.View style={[styles.alertOverlay, { opacity: opacityValue }]}>
        <Animated.View
          style={[
            styles.alertContainer,
            { transform: [{ scale: scaleValue }] },
          ]}
        >
          <View style={styles.alertIconWrapper}>
            <Feather name="trash-2" size={26} color="#EF4444" />
          </View>

          <Text style={styles.alertTitle}>{title}</Text>
          <Text style={styles.alertMessage}>{message}</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.alertButton, styles.cancelButton]}
              onPress={onCancel}
              disabled={isDeleting}
              activeOpacity={0.7}
            >
              <Text style={[styles.alertButtonText, styles.cancelButtonText]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.alertButton,
                styles.confirmButton,
                isDeleting && { backgroundColor: "#FCA5A5" },
              ]}
              onPress={handleConfirmPress}
              disabled={isDeleting}
              activeOpacity={0.85}
            >
              {isDeleting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text
                  style={[styles.alertButtonText, styles.confirmButtonText]}
                >
                  Delete
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  alertOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  alertContainer: {
    width: "82%",
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    elevation: 20,
  },
  alertIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  alertTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: "#1E293B",
    marginBottom: 8,
    textAlign: "center",
  },
  alertMessage: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  buttonContainer: { flexDirection: "row", width: "100%", gap: 12 },
  alertButton: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: { backgroundColor: "#F1F5F9" },
  confirmButton: { backgroundColor: "#EF4444" },
  alertButtonText: { fontSize: 15, fontWeight: "700" },
  cancelButtonText: { color: "#64748B" },
  confirmButtonText: { color: "#FFFFFF" },
});
