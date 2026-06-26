import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
// Imported CustomAlert component
import { CustomAlert } from "./CustomAlert";

const TODO_ICONS = [
  {
    id: "chem",
    label: "Chemistry",
    src: require("../assets/images/todo_items/todoChemIcon.png"),
  },
  {
    id: "health",
    label: "Health",
    src: require("../assets/images/todo_items/todoHealthIcon.png"),
  },
  {
    id: "lit",
    label: "Literature",
    src: require("../assets/images/todo_items/todoLitIcon.png"),
  },
  {
    id: "math",
    label: "Math",
    src: require("../assets/images/todo_items/todoMathIcon.png"),
  },
  {
    id: "media",
    label: "Media",
    src: require("../assets/images/todo_items/todoMediaIcon.png"),
  },
  {
    id: "philo",
    label: "Philosophy",
    src: require("../assets/images/todo_items/todoPhiloIcon.png"),
  },
  {
    id: "phone",
    label: "Phone",
    src: require("../assets/images/todo_items/todoPhoneIcon.png"),
  },
  {
    id: "science",
    label: "Science",
    src: require("../assets/images/todo_items/todoScienceIcon.png"),
  },
  {
    id: "sports",
    label: "Sports",
    src: require("../assets/images/todo_items/todoSportsIcon.png"),
  },
  {
    id: "stats",
    label: "Statistics",
    src: require("../assets/images/todo_items/todoStatsIcon.png"),
  },
];

interface TodoTask {
  id: string;
  task: string;
  done: boolean;
  emoji?: string;
}

interface TaskModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (taskText: string, iconId: string) => void;
  editingTask: TodoTask | null;
  taskText: string;
  setTaskText: (text: string) => void;
  selectedEmoji: string;
  setSelectedEmoji: (iconId: string) => void;
}

export default function TaskModal({
  isVisible,
  onClose,
  onSave,
  editingTask,
  taskText,
  setTaskText,
  selectedEmoji,
  setSelectedEmoji,
}: TaskModalProps) {
  const [shouldRender, setShouldRender] = useState(isVisible);
  const [isAlertVisible, setIsAlertVisible] = useState(false);

  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const scaleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;
  const inputFocusAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => setIsKeyboardVisible(true),
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setIsKeyboardVisible(false),
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (isVisible) {
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

      if (!editingTask && !selectedEmoji) {
        setSelectedEmoji(TODO_ICONS[0]?.id || "");
      }
    } else if (shouldRender) {
      animateClose();
    }
  }, [isVisible]);

  const animateClose = () => {
    Animated.parallel([
      Animated.timing(scaleValue, {
        toValue: 0.85,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShouldRender(false);
      setTaskText("");
      setSelectedEmoji(TODO_ICONS[0]?.id || "");
      onClose();
    });
  };

  const handleValidateAndSave = () => {
    if (taskText.trim() === "") {
      setIsAlertVisible(true);
      return;
    }
    onSave(taskText, selectedEmoji);
  };

  const handleFocus = () =>
    Animated.timing(inputFocusAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: false,
    }).start();

  const handleBlur = () =>
    Animated.timing(inputFocusAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: false,
    }).start();

  const inputBorderColor = inputFocusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#E2E8F0", "#38BDF8"],
  });

  const inputShadowOpacity = inputFocusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.4],
  });

  if (!shouldRender) return null;

  return (
    <>
      <Modal
        visible={isVisible}
        transparent
        statusBarTranslucent
        animationType="none"
        onRequestClose={animateClose}
      >
        <Animated.View style={[styles.modalOverlay, { opacity: opacityValue }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "position" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
            style={styles.keyboardAvoidingContainer}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <Animated.View
                style={[
                  styles.modalContainer,
                  { transform: [{ scale: scaleValue }] },
                ]}
              >
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.scrollContent}
                  scrollEnabled={isKeyboardVisible}
                  bounces={isKeyboardVisible}
                >
                  {/* Header Section */}
                  <View style={styles.header}>
                    <Text style={styles.headerText}>
                      {editingTask ? "Edit Task" : "New Task"}
                    </Text>
                    <TouchableOpacity
                      onPress={animateClose}
                      style={styles.closeButtonContainer}
                      activeOpacity={0.7}
                    >
                      <Feather name="x" size={22} color="black" />
                    </TouchableOpacity>
                  </View>

                  {/* Theme Icon Preset Selector */}
                  <View style={styles.fieldWrapper}>
                    <Text style={styles.label}>Select Category Icon</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.horizontalScrollPadding}
                    >
                      {TODO_ICONS.map((item) => {
                        const isSelected = selectedEmoji === item.id;
                        return (
                          <View key={item.id} style={styles.iconWrapper}>
                            <TouchableOpacity
                              onPress={() => setSelectedEmoji(item.id)}
                              style={[
                                styles.iconOption,
                                isSelected && styles.selectedIcon,
                              ]}
                              activeOpacity={0.85}
                            >
                              <Image
                                source={item.src}
                                style={styles.iconImage}
                              />
                            </TouchableOpacity>
                            <Text
                              numberOfLines={1}
                              ellipsizeMode="tail"
                              style={[
                                styles.iconLabel,
                                isSelected && styles.selectedIconLabel,
                              ]}
                            >
                              {item.label}
                            </Text>
                          </View>
                        );
                      })}
                    </ScrollView>
                  </View>

                  {/* Input Field */}
                  <View style={styles.fieldWrapper}>
                    <Text style={styles.label}>Task Description</Text>
                    <Animated.View
                      style={[
                        styles.inputContainer,
                        {
                          borderColor: inputBorderColor,
                          shadowOpacity: inputShadowOpacity,
                        },
                      ]}
                    >
                      <View style={styles.iconContainer}>
                        <Feather name="edit-3" size={20} color="#64748B" />
                      </View>
                      <TextInput
                        value={taskText}
                        onChangeText={setTaskText}
                        placeholder="What needs to be done?"
                        placeholderTextColor="#94A3B8"
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        style={styles.input}
                      />
                    </Animated.View>
                  </View>

                  {/* Action Button */}
                  <TouchableOpacity
                    style={styles.customButton}
                    onPress={handleValidateAndSave}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.customButtonText}>
                      {editingTask ? "Update Task" : "Create Task"}
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </Animated.View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </Animated.View>
      </Modal>

      <CustomAlert
        visible={isAlertVisible}
        title="Empty Description"
        message="Please write something before adding or updating a task."
        onClose={() => setIsAlertVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  keyboardAvoidingContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 30,
    overflow: "hidden",
    flexShrink: 1, // Let container wrap around internal content organically
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16, // Snug layout spacing matching flashcard format
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "900",
    color: "black",
    lineHeight: 28,
  },
  closeButtonContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  fieldWrapper: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  horizontalScrollPadding: {
    paddingRight: 4,
    gap: 14,
  },
  iconWrapper: {
    alignItems: "center",
    width: 68,
  },
  iconOption: {
    width: 64,
    height: 64,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    padding: 4,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
  },
  selectedIcon: {
    borderColor: "#38BDF8",
    borderWidth: 2.5,
    backgroundColor: "#F0F9FF",
  },
  iconImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
    resizeMode: "contain",
  },
  iconLabel: {
    fontSize: 10,
    fontWeight: "500",
    color: "#64748B",
    marginTop: 6,
    textAlign: "center",
    width: "100%",
  },
  selectedIconLabel: {
    color: "#0284C7",
    fontWeight: "700",
  },
  inputContainer: {
    flexDirection: "row",
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 12,
    backgroundColor: "#F8FAFC",
    height: 50,
    alignItems: "center",
    shadowColor: "#38BDF8",
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 6,
    elevation: 5,
  },
  iconContainer: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1E293B",
    height: "100%",
  },
  customButton: {
    backgroundColor: "#A7F3D0",
    borderRadius: 16,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 14,
    shadowColor: "#A7F3D0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  customButtonText: {
    color: "#065F46",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
