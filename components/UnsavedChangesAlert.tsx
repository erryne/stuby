import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface UnsavedChangesAlertProps {
  visible: boolean;
  onCancel: () => void; // Keep editing
  onConfirm: () => void; // Discard changes and go back
}

export const UnsavedChangesAlert = ({
  visible,
  onCancel,
  onConfirm,
}: UnsavedChangesAlertProps) => {
  const [shouldRender, setShouldRender] = useState(visible);
  const scaleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

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
    } else {
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

  if (!shouldRender) return null;

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="none"
    >
      <Animated.View style={[styles.overlay, { opacity: opacityValue }]}>
        <Animated.View
          style={[styles.container, { transform: [{ scale: scaleValue }] }]}
        >
          <View style={styles.iconWrapper}>
            <Feather name="alert-triangle" size={28} color="#F59E0B" />
          </View>
          <Text style={styles.title}>Unsaved Changes</Text>
          <Text style={styles.message}>
            You have unsaved changes. Are you sure you want to discard them?
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelBtn]}
              onPress={onCancel}
            >
              <Text style={styles.cancelText}>Keep Editing</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.confirmBtn]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmText}>Discard</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  title: { fontSize: 19, fontWeight: "900", color: "#1E293B", marginBottom: 8 },
  message: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 24,
  },
  buttonContainer: { flexDirection: "row", gap: 12, width: "100%" },
  button: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelBtn: { backgroundColor: "#F1F5F9" },
  confirmBtn: { backgroundColor: "#EF4444" },
  cancelText: { fontWeight: "700", color: "#64748B" },
  confirmText: { fontWeight: "700", color: "#FFFFFF" },
});
