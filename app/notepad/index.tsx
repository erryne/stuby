import AddFloatingButton from "@/components/AddFloatingButton";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ImageBackground,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Firebase Config
import { auth, db } from "../../firebaseConfig";

// Define the Note interface
interface Note {
  id: string;
  title: string;
  content: string;
  userId: string;
}

export default function NotepadScreen() {
  const router = useRouter();
  const user = auth.currentUser;

  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  /* ---------------- REAL-TIME LISTENER ---------------- */
  useEffect(() => {
    if (!user) return;

    // Query notes where userId matches current user
    const q = query(
      collection(db, "notes"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notesList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Note[];

        setNotes(notesList);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore Subscription Error:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user]);

  /* ---------------- SEARCH FILTERING ---------------- */
  const filteredNotes = notes.filter(
    (note) =>
      note.title?.toLowerCase().includes(search.toLowerCase()) ||
      note.content?.toLowerCase().includes(search.toLowerCase()),
  );

  const renderNote = ({ item, index }: { item: Note; index: number }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      style={{
        paddingHorizontal: 24,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#D3CBB4",
        backgroundColor: index === 0 ? "transparent" : "transparent",
      }}
      onPress={() =>
        router.push({
          pathname: "/notepad/editnote",
          params: {
            id: item.id,
            title: item.title,
            content: item.content,
          },
        })
      }
    >
      <Text
        style={{
          color: "#502707",
          fontSize: 18,
          fontWeight: "800",
          textTransform: "uppercase",
        }}
      >
        {item.title || "Untitled"}
      </Text>
      <Text
        style={{
          color: "#A8947D",
          fontSize: 12,
          fontWeight: "500",
          marginTop: 4,
        }}
        numberOfLines={2}
      >
        {item.content}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ImageBackground
      source={require("../../assets/images/notepadBg.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={{ flex: 1 }}>
        {/* Section Title */}
        <View style={{ marginTop: 40, marginBottom: 16 }}>
          <Text
            style={{
              color: "#FDE6B1",
              fontSize: 36,
              fontWeight: "900",
              textAlign: "center",
              letterSpacing: 4,
              textShadowColor: "rgba(0, 0, 0, 0.4)",
              textShadowOffset: { width: 2, height: 2 },
              textShadowRadius: 4,
            }}
          >
            NOTEPAD
          </Text>
        </View>

        {/* Search Bar */}
        <View style={{ marginHorizontal: 24, marginBottom: 24 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 2,
              borderColor: "rgba(253, 230, 177, 0.6)",
              borderRadius: 99,
              paddingHorizontal: 16,
              height: 48,
              backgroundColor: "rgba(0,0,0,0.1)",
            }}
          >
            <TextInput
              style={{ flex: 1, color: "white", fontSize: 16 }}
              placeholder="Search notes..."
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={search}
              onChangeText={setSearch}
            />
            <Ionicons name="search" size={20} color="#FDE6B1" />
          </View>
        </View>

        {/* Note List Container */}
        <View
          style={{
            flex: 1,
            marginHorizontal: 24,
            marginBottom: 20,
            backgroundColor: "#FFF9E3",
            borderRadius: 30,
            overflow: "hidden",
            elevation: 5,
          }}
        >
          {loading ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ActivityIndicator size="large" color="#502707" />
            </View>
          ) : filteredNotes.length === 0 ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                padding: 40,
              }}
            >
              <Text
                style={{
                  color: "#A8947D",
                  textAlign: "center",
                  fontWeight: "700",
                }}
              >
                {search
                  ? "No matches found."
                  : "Your notepad is empty. Tap the button below to add your first note!"}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredNotes}
              keyExtractor={(item) => item.id}
              renderItem={renderNote}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 100 }}
            />
          )}
        </View>

        {/* Floating Action Button (FAB) */}
        <AddFloatingButton onPress={() => router.push("/notepad/addnote")} />
      </View>
    </ImageBackground>
  );
}
