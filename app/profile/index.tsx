import ChangePasswordModal from "@/components/ChangePasswordModal";
import CustomHeader from "@/components/CustomHeader";
import DeleteAccPopOut from "@/components/DeleteAccPopOut";
import EditProfileModal from "@/components/EditProfileModal";
import GeometricBackground from "@/components/GeometricBackground";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  deleteUser,
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { deleteObject, getStorage, listAll, ref } from "firebase/storage";
import { SquarePen, Trash2 } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../../firebaseConfig";

const defaultProfileImage = require("../../assets/images/defaultProfile.png");

const Profile = () => {
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  // Single State Engine for tracking which layout window is active
  const [activeModal, setActiveModal] = useState<
    "edit" | "password" | "delete" | null
  >(null);

  const [userData, setUserData] = useState<any>(null);
  const [stats, setStats] = useState({
    folders: 0,
    music: 0,
    notes: 0,
    tasks: 0,
  });
  const [accountAge, setAccountAge] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // Function para i-refresh ang user data pagkatapos mag-edit
  const refreshUserData = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      } catch (e) {
        console.error("Error refreshing data:", e);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (user.metadata.creationTime) {
          const createdAt = new Date(user.metadata.creationTime).getTime();
          const now = new Date().getTime();
          setAccountAge(Math.floor((now - createdAt) / (1000 * 60 * 60 * 24)));
        }
        try {
          // Fetch User Data
          await refreshUserData();

          // Fetch Stats
          const collections = ["flashcardFolders", "tasks", "notes", "music"];
          let counts = { folders: 0, music: 0, notes: 0, tasks: 0 };
          for (const col of collections) {
            const snap = await getDocs(
              query(collection(db, col), where("userId", "==", user.uid)),
            );
            if (col === "flashcardFolders") counts.folders = snap.size;
            if (col === "tasks") counts.tasks = snap.size;
            if (col === "notes") counts.notes = snap.size;
            if (col === "music") counts.music = snap.size;
          }
          setStats(counts);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      } else {
        router.replace("/login");
      }
    });
    return () => unsubscribe();
  }, []);

  const handleDeleteAccount = async (password: string) => {
    const user = auth.currentUser;
    if (!user || !user.email) return;

    setIsDeleting(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);

      const storage = getStorage();
      const userStorageRef = ref(storage, `users/${user.uid}`);
      try {
        const list = await listAll(userStorageRef);
        await Promise.all(list.items.map((itemRef) => deleteObject(itemRef)));
      } catch (e) {
        console.log("No storage files found to clean up.");
      }

      const collectionsToCleanup = [
        "tasks",
        "notes",
        "music",
        "songs",
        "flashcardFolders",
        "favorites",
        "cards",
      ];
      for (const colName of collectionsToCleanup) {
        const q = query(
          collection(db, colName),
          where("userId", "==", user.uid),
        );
        let snapshot = await getDocs(q);
        while (!snapshot.empty) {
          const batch = writeBatch(db);
          snapshot.forEach((d) => batch.delete(d.ref));
          await batch.commit();
          snapshot = await getDocs(q);
        }
      }

      await deleteDoc(doc(db, "users", user.uid));
      await deleteUser(user);
    } catch (e: any) {
      if (e.code === "auth/wrong-password")
        Alert.alert("Error", "Mali ang password.");
      else Alert.alert("Error", "Hindi ma-delete ang account: " + e.message);
    } finally {
      setIsDeleting(false);
      setActiveModal(null);
    }
  };

  if (loading || isDeleting)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0EA5E9" />
      </View>
    );

  return (
    <LinearGradient
      colors={["#7DD3FC", "#38BDF8", "#0EA5E9"]}
      style={styles.container}
    >
      <View style={StyleSheet.absoluteFill}>
        <GeometricBackground />
      </View>
      <StatusBar style="light" />

      {/* Conditional rendering tree blocks modal overlapping across OS types entirely */}

      {/* 1. Delete Account PopOut */}
      {activeModal === "delete" && (
        <DeleteAccPopOut
          visible={true}
          onCancel={() => setActiveModal(null)}
          onDelete={handleDeleteAccount}
        />
      )}

      {/* 2. Edit Profile Modal */}
      {activeModal === "edit" && (
        <EditProfileModal
          visible={true}
          onClose={() => setActiveModal(null)}
          onSaveSuccess={refreshUserData}
          onChangePasswordTrigger={() => {
            setActiveModal(null); // Step 1: Wipe current edit modal configuration out
            requestAnimationFrame(() => {
              setActiveModal("password"); // Step 2: Safe frame schedule execution for Android UI engine layout swap
            });
          }}
        />
      )}

      {/* 3. Change Password Modal */}
      {activeModal === "password" && (
        <ChangePasswordModal
          visible={true}
          onClose={() => setActiveModal(null)}
        />
      )}

      <SafeAreaView>
        <CustomHeader />
      </SafeAreaView>

      <View style={styles.topActions}>
        <TouchableOpacity
          onPress={() => setIsPopupVisible(!isPopupVisible)}
          style={styles.dotsButton}
        >
          <View style={{ flexDirection: "row" }}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={styles.dot} />
            ))}
          </View>
        </TouchableOpacity>
        {isPopupVisible && (
          <View style={styles.popup}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setIsPopupVisible(false);
                setActiveModal("edit");
              }}
            >
              <SquarePen size={18} color="#85ADDA" />
              <Text style={{ marginLeft: 8, fontWeight: "600" }}>
                Edit Profile
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.menuItem, { marginTop: 15 }]}
              onPress={() => {
                setIsPopupVisible(false);
                setActiveModal("delete");
              }}
            >
              <Trash2 size={18} color="red" />
              <Text style={{ marginLeft: 8, fontWeight: "600", color: "red" }}>
                Delete Account
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.userInfo}>
        <View style={styles.imageBorder}>
          <Image
            source={
              userData?.profileImage
                ? { uri: userData.profileImage }
                : defaultProfileImage
            }
            style={styles.image}
          />
        </View>
        <Text style={styles.name}>
          {userData?.firstName} {userData?.lastName}
        </Text>
        <Text style={styles.email}>@{userData?.email?.split("@")[0]}</Text>
      </View>

      <View style={styles.brickContainer}>
        {[
          {
            label: "FOLDERS",
            val: stats.folders,
            color: "#FDE68A",
            width: "40%",
          },
          { label: "TASKS", val: stats.tasks, color: "#DDD6FE", width: "50%" },
          { label: "NOTES", val: stats.notes, color: "#BFDBFE", width: "55%" },
          { label: "MUSIC", val: stats.music, color: "#A7F3D0", width: "35%" },
        ].map((item, index) => (
          <View
            key={index}
            style={[
              styles.brick,
              { backgroundColor: item.color, width: item.width as any },
            ]}
          >
            <Text style={styles.brickVal}>{item.val}</Text>
            <Text style={styles.brickLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.fullWidthBrick}>
        <Text style={styles.fullWidthText}>
          It's been {accountAge} days since you became a buddy!
        </Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  topActions: { alignItems: "flex-end", paddingRight: 20, zIndex: 10 },
  dotsButton: { padding: 10 },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFF",
    marginLeft: 4,
  },
  popup: {
    position: "absolute",
    top: 40,
    right: 10,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    elevation: 5,
    zIndex: 20,
  },
  menuItem: { flexDirection: "row", alignItems: "center" },
  imageBorder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 5,
    borderColor: "#FFF",
    elevation: 10,
  },
  image: { width: "100%", height: "100%", borderRadius: 75 },
  userInfo: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
    width: "100%",
  },
  name: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FFF",
    marginTop: 20,
    textAlign: "center",
    width: "90%",
  },
  email: { fontSize: 16, color: "#E0F2FE", fontWeight: "600", marginTop: 5 },
  brickContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingHorizontal: 15,
    gap: 12,
  },
  brick: {
    height: 110,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
  },
  brickVal: { fontSize: 34, fontWeight: "900", color: "#1E293B" },
  brickLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: "#475569",
    letterSpacing: 2,
    marginTop: 4,
  },
  fullWidthBrick: {
    margin: 20,
    padding: 20,
    backgroundColor: "#F8FAFC",
    borderRadius: 20,
    alignItems: "center",
  },
  fullWidthText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748B",
    fontStyle: "italic",
  },
});

export default Profile;
