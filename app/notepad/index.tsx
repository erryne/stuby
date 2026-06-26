import AddFloatingButton from "@/components/AddFloatingButton";
import CustomHeader from "@/components/CustomHeader";
import GeometricBackground from "@/components/GeometricBackground";
import SearchBar from "@/components/SearchBar";
import StickyNote from "@/components/StickyNote";
import TitleHeader from "@/components/TitleHeader";

import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../../firebaseConfig";

interface Note {
  id: string;
  title: string;
  content: string;
  userId: string;
  isFavorite?: boolean;
}

export default function NotepadScreen() {
  const router = useRouter();
  const user = auth.currentUser;
  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "notes"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notesList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Note[];
      setNotes(notesList);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const handleToggleFavorite = async (
    noteId: string,
    currentStatus: boolean,
  ) => {
    if (!user) return;
    const nextFavoriteState = !currentStatus;

    try {
      const noteRef = doc(db, "notes", noteId);
      const favoriteRef = doc(db, "favorites", `note_${noteId}`);

      // Hanapin ang note object para makuha ang pinakabagong title structure
      const targetNote = notes.find((n) => n.id === noteId);
      const noteTitle = targetNote?.title || "Untitled Note";

      await updateDoc(noteRef, { isFavorite: nextFavoriteState });

      if (nextFavoriteState) {
        await setDoc(favoriteRef, {
          userId: user.uid,
          title: noteTitle,
          type: "note",
          route: `/notepad/addnote?id=${noteId}&title=${encodeURIComponent(noteTitle)}&content=${encodeURIComponent(targetNote?.content || "")}&mode=edit`,
          createdAt: new Date(),
        });
      } else {
        await deleteDoc(favoriteRef);
      }
    } catch (error) {
      console.error(
        "Error updating favorite notepad structural record: ",
        error,
      );
    }
  };

  const searchedNotes = notes.filter(
    (note) =>
      note.title?.toLowerCase().includes(search.toLowerCase()) ||
      note.content?.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredNotes = [...searchedNotes].sort((a, b) => {
    const aFav = a.isFavorite ? 1 : 0;
    const bFav = b.isFavorite ? 1 : 0;
    return bFav - aFav;
  });

  return (
    <LinearGradient
      colors={["#7DD3FC", "#38BDF8", "#0EA5E9"]}
      style={styles.fullFlex}
    >
      <View style={StyleSheet.absoluteFillObject}>
        <GeometricBackground />
      </View>
      <SafeAreaView>
        <CustomHeader />
      </SafeAreaView>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        {loading ? (
          <View style={styles.centeredLoader}>
            <ActivityIndicator size="large" color="#FDE6B1" />
          </View>
        ) : (
          <View style={styles.fullFlex}>
            <TitleHeader
              title="NOTEPAD"
              size="xl"
              align="center"
              color="#ffffff"
              containerStyle={{ marginBottom: 10 }}
              titleStyle={{
                textShadowColor: "rgba(0, 0, 0, 0.8)",
                textShadowOffset: { width: 2, height: 2 },
                textShadowRadius: 4,
              }}
            />
            {/* <TitleHeader
            title="TO-DO LIST"
            size="xl"
            align="center"
            color="#ffffff"
            containerStyle={styles.titleContainer}
            titleStyle={styles.titleText}
        /> */}

            <SearchBar
              value={search}
              onChangeText={setSearch}
              placeholder="Search notes..."
            />

            <FlatList
              data={filteredNotes}
              keyExtractor={(item) => item.id}
              numColumns={2}
              key="two-column-grid"
              renderItem={({ item, index }) => (
                <StickyNote
                  title={item.title}
                  content={item.content}
                  isFavorite={item.isFavorite || false}
                  onToggleFavorite={() =>
                    handleToggleFavorite(item.id, item.isFavorite || false)
                  }
                  index={index}
                  onPress={() =>
                    router.push({
                      pathname: "/notepad/addnote",
                      params: {
                        id: item.id,
                        title: item.title,
                        content: item.content,
                        mode: "edit",
                      },
                    })
                  }
                />
              )}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 8,
                paddingBottom: 100,
              }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    {search ? "No matches found." : "Your notepad is empty."}
                  </Text>
                </View>
              }
            />

            <AddFloatingButton
              onPress={() => router.push("/notepad/addnote")}
            />
          </View>
        )}
      </TouchableWithoutFeedback>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fullFlex: { flex: 1 },
  centeredLoader: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerText: {
    color: "#FDE6B1",
    fontSize: 36,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 4,
  },
  emptyContainer: { marginTop: 50, alignItems: "center" },
  emptyText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    fontStyle: "italic",
  },
});
