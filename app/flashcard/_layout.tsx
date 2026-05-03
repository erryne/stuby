import { Stack } from "expo-router";

export default function FlashCardLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="createFlashcardFolder" /> 
      <Stack.Screen name="updateFlashcardFolder" />  
      <Stack.Screen name="createFlashcardItem" />      
      <Stack.Screen name="updateFlashcardItem" />    
      <Stack.Screen name="playFlashcard" />          
      <Stack.Screen name="flashcardItems" /> 

    </Stack>

    //hirarchy 

    //index mga flashcard folder
    //flashcard items eh ung mga laman ng folder
    
  );
}
