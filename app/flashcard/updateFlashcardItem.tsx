import GreenButton from "@/components/GreenButton";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ImageBackground,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";

// Firebase Imports
import TitleHeader from "@/components/TitleHeader";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";


const { width, height } = Dimensions.get("window");

const UpdateFlashcardItem = () => {
  const { folderId, cardId } = useLocalSearchParams();

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

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
          cardId as string
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
        cardId as string
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
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color="#FDE6B1" />
      </ImageBackground>
    );
  }

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
              image={require("../../assets/images/flashcardUpdateCard.png")}
            />

            <View style={styles.headerSpacer} />
          </View>

          {/* MAIN CONTENT */}
          <View style={styles.contentContainer}>
            {/* FLASHCARD CARD */}
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
                  textAlignVertical="top"
                  style={styles.answerInput}
                />
              </View>

              
            </View>
            <View style={styles.footer}>

             {isUpdating ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <GreenButton
                title="Save"
                onPress={handleUpdate}
                widthPercent={0.25}
                heightPercent={0.05}
              />
            )}
            
          </View>
          </View>

         
        </View>
      </TouchableWithoutFeedback>
    </ImageBackground>
  );
};

export default UpdateFlashcardItem;

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mainContainer: {
    flex: 1,
  },
  headerSpacer: {
    width: 28,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: "5%", 
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    marginTop: "20%",
  },
  cardFrame: {
    height: "55%",
    width: "90%",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#39675F",
    backgroundColor: "transparent",
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
footer: {
    marginTop: height * 0.03,
    width: "90%", 
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
});