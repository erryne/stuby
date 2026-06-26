import { CustomAlert } from "@/components/CustomAlert";
import CustomHeader from "@/components/CustomHeader";
import { DeleteAlert } from "@/components/DeleteAlert";
import GeometricBackground from "@/components/GeometricBackground";
import { UnsavedChangesAlert } from "@/components/UnsavedChangesAlert";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EditDeletePopUp from "../../components/EditDeletePopUp";
import { auth, db } from "../../firebaseConfig";

export default function AddNoteScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const user = auth.currentUser;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Custom Alert States
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [containerWidth, setContainerWidth] = useState(0);
  const [textWidth, setTextWidth] = useState(0);
  const tickerAnim = useRef(new Animated.Value(0)).current;
  const spacerWidth = 80;
  const isLongText = textWidth > containerWidth && containerWidth > 0;

  const triggerError = (message: string) => {
    setErrorMsg(message);
    setShowErrorAlert(true);
  };

  useEffect(() => {
    if (params.title)
      setTitle(Array.isArray(params.title) ? params.title[0] : params.title);
    if (params.content)
      setContent(
        Array.isArray(params.content) ? params.content[0] : params.content,
      );
    if (params.mode !== "edit") setIsEditing(true);
  }, [params.title, params.content, params.mode]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (!isEditing) return;
      e.preventDefault();
      setShowDiscardModal(true);
    });
    return unsubscribe;
  }, [navigation, isEditing]);

  useEffect(() => {
    if (isEditing || !isLongText) {
      tickerAnim.setValue(0);
      return;
    }
    tickerAnim.setValue(0);
    const scrollDistance = textWidth + spacerWidth;
    const duration = scrollDistance / 0.04;
    const marquee = Animated.loop(
      Animated.timing(tickerAnim, {
        toValue: -scrollDistance,
        duration: duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    marquee.start();
    return () => marquee.stop();
  }, [textWidth, containerWidth, title, isLongText, isEditing]);

  const handleDelete = async () => {
    if (!params.id) return;
    const noteId = params.id as string;
    const noteRef = doc(db, "notes", noteId);
    const favRef = doc(db, "favorites", `note_${noteId}`);

    try {
      const batch = writeBatch(db);
      batch.delete(noteRef);
      batch.delete(favRef);
      await batch.commit();
      setIsEditing(false);
      router.back();
    } catch (error) {
      triggerError("Error, Please try again.");
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleSaveOrUpdate = async () => {
    if (!title.trim() || !content.trim()) {
      triggerError("Please provide both a title and some content.");
      return;
    }
    setLoading(true);
    try {
      if (params.mode === "edit" && params.id) {
        await updateDoc(doc(db, "notes", params.id as string), {
          title: title.trim(),
          content: content.trim(),
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "notes"), {
          userId: user?.uid,
          title: title.trim(),
          content: content.trim(),
          createdAt: serverTimestamp(),
        });
      }
      setIsEditing(false);
      router.back();
    } catch (error) {
      triggerError("Could not save.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#7DD3FC", "#38BDF8", "#0EA5E9"]}
      style={styles.flexOne}
    >
      <DeleteAlert
        visible={showDeleteModal}
        title="Delete Note?"
        message="Are you sure you want to delete this note?"
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
      />
      <CustomAlert
        visible={showErrorAlert}
        title="Attention"
        message={errorMsg}
        onClose={() => setShowErrorAlert(false)}
      />
      <UnsavedChangesAlert
        visible={showDiscardModal}
        onCancel={() => setShowDiscardModal(false)}
        onConfirm={() => {
          setIsEditing(false);
          setShowDiscardModal(false);
          router.back();
        }}
      />

      <View style={StyleSheet.absoluteFillObject}>
        <GeometricBackground />
      </View>

      <View style={styles.hiddenTextRig}>
        <Text
          onLayout={(e) => setTextWidth(e.nativeEvent.layout.width)}
          style={styles.titleInput}
        >
          {title || "ENTER TITLE"}
        </Text>
      </View>

      <SafeAreaView>
        <CustomHeader />
      </SafeAreaView>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flexOne}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.iconBtn}
            >
              <Ionicons name="chevron-back" size={28} color="#334155" />
            </TouchableOpacity>

            <View
              style={styles.titleContainerFrame}
              onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
            >
              {isEditing ? (
                <TextInput
                  placeholder="ENTER TITLE"
                  placeholderTextColor="rgba(51, 65, 85, 0.4)"
                  value={title}
                  onChangeText={setTitle}
                  style={[styles.titleInput, { flex: 1 }]}
                />
              ) : isLongText ? (
                <Animated.View
                  style={[
                    styles.animatedTrack,
                    {
                      width: (textWidth + spacerWidth) * 2,
                      transform: [{ translateX: tickerAnim }],
                    },
                  ]}
                >
                  <Text style={styles.titleInput}>{title}</Text>
                  <View style={{ width: spacerWidth }} />
                  <Text style={styles.titleInput}>{title}</Text>
                </Animated.View>
              ) : (
                <Text numberOfLines={1} style={styles.titleInput}>
                  {title || "ENTER TITLE"}
                </Text>
              )}
            </View>

            <View style={styles.headerRight}>
              {isEditing ? (
                <TouchableOpacity
                  onPress={handleSaveOrUpdate}
                  style={styles.customButton}
                >
                  <Text style={styles.btnText}>
                    {params.mode === "edit" ? "UPDATE" : "SAVE"}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.menuAnchorContainer}>
                  <TouchableOpacity
                    onPress={() => setShowMenu(!showMenu)}
                    style={styles.menuIconButton}
                  >
                    <Ionicons
                      name="ellipsis-horizontal"
                      size={20}
                      color="#334155"
                    />
                  </TouchableOpacity>
                  {showMenu && (
                    <View style={styles.popupDropdownContainer}>
                      <EditDeletePopUp
                        onEdit={() => {
                          setIsEditing(true);
                          setShowMenu(false);
                        }}
                        onDelete={() => setShowDeleteModal(true)}
                      />
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>

          <View style={styles.noteArea}>
            <ScrollView
              style={styles.flexOne}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <TextInput
                multiline
                placeholder="Enter notes...."
                textAlignVertical="top"
                value={content}
                onChangeText={setContent}
                editable={isEditing}
                style={styles.contentInput}
              />
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flexOne: { flex: 1 },
  container: { flex: 1, marginTop: -18 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
    height: 50,
  },
  iconBtn: {
    padding: 8,
    backgroundColor: "white",
    borderRadius: 12,
    marginRight: 12,
  },
  titleContainerFrame: {
    flex: 1,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
  },
  titleInput: {
    color: "#334155",
    fontSize: 24,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  animatedTrack: { flexDirection: "row", alignItems: "center" },
  hiddenTextRig: { position: "absolute", top: -9999, left: -9999, opacity: 0 },
  headerRight: { minWidth: 80, alignItems: "flex-end" },
  customButton: {
    backgroundColor: "#A7F3D0",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  btnText: { color: "#065F46", fontWeight: "900", fontSize: 12 },
  menuIconButton: { padding: 10 },
  popupDropdownContainer: {
    position: "absolute",
    top: 10,
    right: 0,
    zIndex: 100,
  },
  noteArea: {
    flex: 1,
    marginHorizontal: 20,
    marginBottom: 40,
    backgroundColor: "#FEF9C3",
    borderRadius: 40,
    padding: 24,
    borderWidth: 5,
    borderColor: "#FFFFFF",
  },
  scrollContent: { flexGrow: 1, paddingBottom: 50 },
  contentInput: { fontSize: 16, lineHeight: 30, flex: 1 },
  menuAnchorContainer: { position: "relative", zIndex: 50 },
});
