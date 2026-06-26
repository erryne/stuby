import { Feather } from "@expo/vector-icons";
import {
  addDoc,
  collection,
  doc,
  increment,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
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
  useWindowDimensions,
} from "react-native";
import { auth, db } from "../firebaseConfig";
import { CustomAlert } from "./CustomAlert";

// --- Internal Glow Input Component ---
const StyledInput = ({ label, icon, customHeight = 80, ...props }: any) => {
  const focusAnim = useRef(new Animated.Value(0)).current;
  const isShortInput = customHeight <= 50;

  const handleFocus = () =>
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: false,
    }).start();

  const handleBlur = () =>
    Animated.timing(focusAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: false,
    }).start();

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#E2E8F0", "#38BDF8"],
  });

  const shadowOpacity = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.4],
  });

  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.label}>{label}</Text>
      <Animated.View
        style={[
          styles.inputContainer,
          {
            borderColor,
            shadowColor: "#38BDF8",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity,
            shadowRadius: 6,
            elevation: 5,
            alignItems: "center",
            paddingVertical: isShortInput ? 0 : 12,
            height: isShortInput ? customHeight : undefined,
          },
        ]}
      >
        <View
          style={[
            styles.iconContainer,
            isShortInput && {
              paddingTop: 0,
              height: "100%",
              justifyContent: "center",
            },
          ]}
        >
          <Feather name={icon} size={20} color="#64748B" />
        </View>
        <TextInput
          {...props}
          style={[
            styles.input,
            {
              paddingTop: isShortInput ? 0 : undefined,
              paddingBottom: isShortInput ? 0 : undefined,
              height: isShortInput ? "100%" : undefined,
              minHeight: !isShortInput ? customHeight : undefined,
            },
          ]}
          placeholderTextColor="#94A3B8"
          onFocus={handleFocus}
          onBlur={handleBlur}
          multiline={!isShortInput}
          textAlignVertical="center"
        />
      </Animated.View>
    </View>
  );
};

// --- Main Modal Component ---
const CreateFlashcardItemModal = ({
  visible,
  folderId,
  onClose,
  cardToEdit,
}: any) => {
  const { height: screenHeight } = useWindowDimensions();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Custom Alert state management
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: "", message: "" });

  const [shouldRender, setShouldRender] = useState(visible);
  const scaleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  // Track keyboard state
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

      if (cardToEdit) {
        setQuestion(cardToEdit.question);
        setAnswer(cardToEdit.answer);
      } else {
        setQuestion("");
        setAnswer("");
      }
    } else if (shouldRender) {
      animateClose();
    }
  }, [visible, cardToEdit]);

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
      setQuestion("");
      setAnswer("");
      onClose();
    });
  };

  const triggerAlert = (title: string, message: string) => {
    setAlertConfig({ title, message });
    setAlertVisible(true);
  };

  const handleSave = async () => {
    if (!question.trim() || !answer.trim()) {
      return triggerAlert(
        "Required Fields",
        "Please make sure both question and answer are filled out.",
      );
    }

    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);
    try {
      const cardsCollectionRef = collection(db, "cards");

      if (cardToEdit) {
        await updateDoc(doc(db, "cards", cardToEdit.id), {
          question,
          answer,
        });
      } else {
        const user = auth.currentUser;
        await addDoc(cardsCollectionRef, {
          question,
          answer,
          folderId: folderId,
          userId: user!.uid,
          createdAt: serverTimestamp(),
        });

        await updateDoc(doc(db, "flashcardFolders", folderId as string), {
          cardCount: increment(1),
        });
      }

      animateClose();
    } catch (e) {
      console.error("Save error:", e);
      triggerAlert(
        "Error",
        "Could not save your card. Please verify network access.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!shouldRender) return null;

  // Responsive calculations based on actual current screen height
  const dynamicMinHeight = screenHeight * 0.4; // Valid layout anchor point
  const dynamicMaxHeight = screenHeight * 0.85;

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      statusBarTranslucent
      onRequestClose={animateClose}
    >
      <Animated.View style={[styles.modalOverlay, { opacity: opacityValue }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingContainer}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <Animated.View
              style={[
                styles.modalContainer,
                {
                  minHeight: dynamicMinHeight,
                  maxHeight: dynamicMaxHeight,
                  transform: [{ scale: scaleValue }],
                },
              ]}
            >
              <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                scrollEnabled={isKeyboardVisible}
                bounces={isKeyboardVisible}
              >
                <View style={styles.header}>
                  <Text style={styles.headerText}>
                    {cardToEdit ? "Edit Card" : "New Card"}
                  </Text>
                  <TouchableOpacity
                    onPress={animateClose}
                    style={styles.closeButtonContainer}
                    activeOpacity={0.7}
                  >
                    <Feather name="x" size={22} color="black" />
                  </TouchableOpacity>
                </View>

                <View style={styles.formContainer}>
                  <StyledInput
                    label="Question"
                    icon="help-circle"
                    value={question}
                    onChangeText={setQuestion}
                    placeholder="Enter question..."
                    customHeight={80}
                  />

                  <StyledInput
                    label="Answer"
                    icon="check-circle"
                    value={answer}
                    onChangeText={setAnswer}
                    placeholder="Enter answer..."
                    customHeight={48}
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.customButton,
                    loading && styles.buttonDisabled,
                  ]}
                  onPress={handleSave}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#065F46" />
                  ) : (
                    <Text style={styles.customButtonText}>
                      {cardToEdit ? "Update Card" : "Add Card"}
                    </Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </Animated.View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Animated.View>

      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => setAlertVisible(false)}
      />
    </Modal>
  );
};

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
    maxWidth: 500, // Keeps structural safety on massive tablet displays
    backgroundColor: "white",
    borderRadius: 30,
    overflow: "hidden",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    flexGrow: 1, // Ensures fields stretch and take full vertical space uniformly
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
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
  formContainer: {
    flex: 1,
    justifyContent: "center", // Perfectly centers fields on tablet, moves elegantly on tiny screens
    marginBottom: 10,
  },
  inputWrapper: { marginBottom: 15 },
  label: { fontSize: 14, fontWeight: "600", color: "#334155", marginBottom: 8 },
  inputContainer: {
    flexDirection: "row",
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 12,
    backgroundColor: "#F8FAFC",
  },
  iconContainer: {
    paddingTop: 2,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1E293B",
    paddingTop: 0,
    marginTop: 0,
  },
  customButton: {
    backgroundColor: "#A7F3D0",
    borderRadius: 16,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#A7F3D0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  buttonDisabled: {
    backgroundColor: "#E6FDF4",
    opacity: 0.7,
  },
  customButtonText: {
    color: "#065F46",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});

export default CreateFlashcardItemModal;
