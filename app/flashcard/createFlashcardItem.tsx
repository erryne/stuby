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
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

// Firebase Imports
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebaseConfig";

const CreateFlashcardItem = () => {
  const { folderId } = useLocalSearchParams(); // Retrieve the ID of the current deck
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const toastOpacity = useState(new Animated.Value(0))[0];

  const handleAddFlashcardItem = async () => {
    // 1. Validation
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
      // 2. Save to Firestore Sub-collection
      // Path: flashcardFolders -> [folderId] -> cards -> [new document]
      const cardsRef = collection(
        db,
        "flashcardFolders",
        folderId as string,
        "cards",
      );

      await addDoc(cardsRef, {
        question: question.trim(),
        answer: answer.trim(),
        createdAt: serverTimestamp(),
      });

      // 3. Clear Inputs
      setQuestion("");
      setAnswer("");
      Keyboard.dismiss();

      // 4. Show Success Toast
      triggerToast();
    } catch (error) {
      console.error("Error adding flashcard:", error);
      Alert.alert(
        "Upload Failed",
        "Could not save the flashcard. Check your connection.",
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
      className="flex-1"
      resizeMode="cover"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 mt-4">
          {/* TOP CONTROLS */}
          <View
            className="flex flex-row items-center justify-between px-4"
            style={{ marginBottom: "20%", marginTop: 20 }}
          >
            <TouchableOpacity onPress={() => router.back()}>
              <ChevronLeft size={28} color="#ffffff" />
            </TouchableOpacity>
            <Text className="text-[#FDE6B1] text-xl font-bold">New Card</Text>
            <View style={{ width: 28 }} />
          </View>

          {/* MAIN CONTENT */}
          <View className="flex-1 items-center">
            <View className="h-[50%] w-[90%] rounded-2xl overflow-hidden shadow-lg border border-[#39675F]">
              {/* QUESTION */}
              <View className="h-[65%] bg-[#39675F] px-4 py-4">
                <Text className="text-white text-2xl font-bold mb-2">
                  Question
                </Text>
                <TextInput
                  value={question}
                  onChangeText={setQuestion}
                  placeholder="Type your question here..."
                  placeholderTextColor="#9C8A5D"
                  multiline
                  editable={!loading}
                  textAlignVertical="top"
                  className="flex-1 bg-[#FFF9E5] text-[#553A00] text-base font-semibold rounded-xl p-4"
                />
              </View>

              {/* ANSWER */}
              <View className="h-[35%] bg-[#FFF9E5] px-4 py-3">
                <Text className="text-[#39675F] text-2xl font-bold mb-1">
                  Answer
                </Text>
                <TextInput
                  value={answer}
                  onChangeText={setAnswer}
                  placeholder="Type your answer here..."
                  placeholderTextColor="#A8D5CD"
                  multiline
                  editable={!loading}
                  textAlignVertical="top"
                  className="flex-1 bg-[#79D0C1] text-[#083D36] text-sm font-semibold rounded-xl p-3"
                />
              </View>
            </View>
          </View>

          {/* LOADING OR ADD BUTTON */}
          {loading ? (
            <View style={{ position: "absolute", bottom: 40, right: 30 }}>
              <ActivityIndicator size="large" color="#FDE6B1" />
            </View>
          ) : (
            <AddFloatingButton onPress={handleAddFlashcardItem} />
          )}

          {/* TOAST */}
          {showToast && (
            <Animated.View
              style={{
                position: "absolute",
                bottom: 100,
                alignSelf: "center",
                backgroundColor: "#39675F",
                paddingVertical: 12,
                paddingHorizontal: 24,
                borderRadius: 25,
                opacity: toastOpacity,
                elevation: 5,
              }}
            >
              <Text className="text-white font-semibold">Flashcard added!</Text>
            </Animated.View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </ImageBackground>
  );
};

export default CreateFlashcardItem;
