import GreenButton from "@/components/GreenButton";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

// Firebase Imports
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

const UpdateFlashcardItem = () => {
  // folderId and cardId must be passed from the previous screen
  const { folderId, cardId } = useLocalSearchParams();

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // 1. FETCH EXISTING DATA
  useEffect(() => {
    const fetchCardData = async () => {
      if (!folderId || !cardId) {
        Alert.alert("Error", "Missing identification for this card.");
        router.back();
        return;
      }

      try {
        const docRef = doc(
          db,
          "flashcardFolders",
          folderId as string,
          "cards",
          cardId as string,
        );
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setQuestion(docSnap.data().question);
          setAnswer(docSnap.data().answer);
        } else {
          Alert.alert("Error", "Flashcard not found.");
          router.back();
        }
      } catch (error) {
        console.error("Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCardData();
  }, [folderId, cardId]);

  // 2. UPDATE DATABASE
  const handleUpdate = async () => {
    if (!question.trim() || !answer.trim()) {
      Alert.alert("Validation", "Please fill in both fields.");
      return;
    }

    setIsUpdating(true);
    try {
      const docRef = doc(
        db,
        "flashcardFolders",
        folderId as string,
        "cards",
        cardId as string,
      );

      await updateDoc(docRef, {
        question: question.trim(),
        answer: answer.trim(),
        updatedAt: new Date(),
      });

      Alert.alert("Success", "Flashcard updated!");
      router.back();
    } catch (error) {
      console.error("Update Error:", error);
      Alert.alert("Error", "Failed to update flashcard.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <ImageBackground
        source={require("../../assets/images/flashcardBg.png")}
        className="flex-1 justify-center items-center"
      >
        <ActivityIndicator size="large" color="#FDE6B1" />
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require("../../assets/images/flashcardBg.png")}
      resizeMode="cover"
      className="flex-1"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 mt-4">
          {/* TOP CONTROLS */}
          <View className="flex flex-row items-center justify-between px-4 mt-8">
            <TouchableOpacity onPress={() => router.back()}>
              <ChevronLeft size={28} color="#ffffff" />
            </TouchableOpacity>

            <Text className="text-[#FDE6B1] text-xl font-bold">Edit Card</Text>

            {isUpdating ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <GreenButton
                title="Update"
                onPress={handleUpdate}
                widthPercent={0.25}
                heightPercent={0.05}
              />
            )}
          </View>

          {/* MAIN CONTENT */}
          <View className="flex-1 items-center" style={{ marginTop: "20%" }}>
            {/* FLASHCARD */}
            <View className="h-[55%] w-[90%] rounded-2xl overflow-hidden shadow-lg border border-[#39675F]">
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
                  textAlignVertical="top"
                  className="flex-1 bg-[#79D0C1] text-[#083D36] text-sm font-semibold rounded-xl p-3"
                />
              </View>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </ImageBackground>
  );
};

export default UpdateFlashcardItem;
