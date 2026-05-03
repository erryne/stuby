import AddFloatingButton from "@/components/AddFloatingButton";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  ImageBackground,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

// Firebase Imports
import TitleHeader from "@/components/TitleHeader";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebaseConfig";

const CreateFlashcardItem = () => {
  const { folderId } = useLocalSearchParams();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const toastOpacity = useState(new Animated.Value(0))[0];

  const handleAddFlashcardItem = async () => {
    if (!question.trim() || !answer.trim()) {
      Alert.alert("Error", "Please provide both a question and an answer.");
      return;
    }

    if (!folderId) {
      Alert.alert("Error", "Folder ID not found. Please try again.");
      return;
    }

    setLoading(true);

    try {
      const cardsRef = collection(
        db,
        "flashcardFolders",
        folderId as string,
        "cards"
      );

      await addDoc(cardsRef, {
        question: question.trim(),
        answer: answer.trim(),
        createdAt: serverTimestamp(),
      });

      setQuestion("");
      setAnswer("");
      Keyboard.dismiss();
      triggerToast();
    } catch (error) {
      console.error("Error adding flashcard:", error);
      Alert.alert(
        "Upload Failed",
        "Could not save the flashcard. Check your connection."
      );
    } finally {
      setLoading(false);
    }
  };

  const triggerToast = () => {
    setShowToast(true);
    Animated.timing(toastOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setShowToast(false));
      }, 2000);
    });
  };

  return (
    <ImageBackground
      source={require("../../assets/images/flashcardBg.png")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.mainContainer}>
          {/* TOP CONTROLS */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()}>
              <ChevronLeft size={28} color="#ffffff" />
            </TouchableOpacity>

            <TitleHeader
              image={require("../../assets/images/flashcardCreateCard.png")}
            />

            <View style={styles.headerSpacer} />
          </View>

          {/* MAIN CONTENT */}
          <View style={styles.contentContainer}>
            <View style={styles.cardFrame}>
              {/* QUESTION SECTION */}
              <View style={styles.questionSection}>
                <Text style={styles.sectionTitleWhite}>Question</Text>
                <TextInput
                  value={question}
                  onChangeText={setQuestion}
                  placeholder="Type your question here..."
                  placeholderTextColor="#9C8A5D"
                  multiline
                  editable={!loading}
                  textAlignVertical="top"
                  style={styles.questionInput}
                />
              </View>

              {/* ANSWER SECTION */}
              <View style={styles.answerSection}>
                <Text style={styles.sectionTitleGreen}>Answer</Text>
                <TextInput
                  value={answer}
                  onChangeText={setAnswer}
                  placeholder="Type your answer here..."
                  placeholderTextColor="#A8D5CD"
                  multiline
                  editable={!loading}
                  textAlignVertical="top"
                  style={styles.answerInput}
                />
              </View>
            </View>
          </View>

          {/* LOADING OR ADD BUTTON */}
          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#FDE6B1" />
            </View>
          ) : (
            <AddFloatingButton onPress={handleAddFlashcardItem} />
          )}

          {/* TOAST */}
          {showToast && (
            <Animated.View style={[styles.toast, { opacity: toastOpacity }]}>
              <Text style={styles.toastText}>Flashcard added!</Text>
            </Animated.View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </ImageBackground>
  );
};

export default CreateFlashcardItem;

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: "20%",
  },
  headerSpacer: {
    width: 28,
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
  },
  cardFrame: {
    height: "50%",
    width: "90%",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#39675F",
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  questionSection: {
    height: "65%",
    backgroundColor: "#39675F",
    padding: 16,
  },
  sectionTitleWhite: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  questionInput: {
    flex: 1,
    backgroundColor: "#FFF9E5",
    color: "#553A00",
    fontSize: 16,
    fontWeight: "600",
    borderRadius: 12,
    padding: 16,
  },
  answerSection: {
    height: "35%",
    backgroundColor: "#FFF9E5",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitleGreen: {
    color: "#39675F",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  answerInput: {
    flex: 1,
    backgroundColor: "#79D0C1",
    color: "#083D36",
    fontSize: 14,
    fontWeight: "600",
    borderRadius: 12,
    padding: 12,
  },
  loaderContainer: {
    position: "absolute",
    bottom: 40,
    right: 30,
  },
  toast: {
    position: "absolute",
    bottom: 100,
    alignSelf: "center",
    backgroundColor: "#39675F",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    elevation: 5,
  },
  toastText: {
    color: "white",
    fontWeight: "600",
  },
});