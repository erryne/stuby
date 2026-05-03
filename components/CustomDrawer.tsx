// import { Ionicons } from "@expo/vector-icons";
// import { DrawerContentScrollView } from "@react-navigation/drawer";
// import { useRouter } from "expo-router";
// import { Alert, Text, TouchableOpacity, View, StyleSheet } from "react-native";
// import { signOut } from "firebase/auth";
// import { auth } from "../firebaseConfig";

// export default function CustomDrawer(props: any) {
//   const router = useRouter();

//   const handleLogout = () => {
//     Alert.alert("Logout", "Are you sure you want to log out?", [
//       { text: "Cancel", style: "cancel" },
//       {
//         text: "Log Out",
//         style: "destructive",
//         onPress: async () => {
//           try {
//             await signOut(auth);
//             router.replace("/login");
//           } catch (error) {
//             Alert.alert("Error", "Could not log out. Please try again.");
//           }
//         },
//       },
//     ]);
//   };

//   return (
//     <DrawerContentScrollView
//       {...props}
//       contentContainerStyle={styles.container}
//     >
//       {/* HEADER */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => props.navigation.closeDrawer()}>
//           <Ionicons name="arrow-back" size={22} color="#502707" />
//         </TouchableOpacity>

//         <TouchableOpacity onPress={() => props.navigation.navigate("index")}>
//           <Text style={styles.logoText}>STUBY</Text>
//         </TouchableOpacity>
//       </View>

//       {/* MENU */}
//       <View style={styles.menu}>
//         <DrawerItem
//           icon="home-outline"
//           label="Dashboard"
//           onPress={() => props.navigation.navigate("index")}
//         />

//         <DrawerItem
//           icon="layers-outline"
//           label="Flashcard"
//           onPress={() => props.navigation.navigate("flashcard")}
//         />

//         <DrawerItem
//           icon="timer-outline"
//           label="Pomodoro"
//           onPress={() => props.navigation.navigate("pomodoro")}
//         />

//         <DrawerItem
//           icon="book-outline"
//           label="Notepad"
//           onPress={() => props.navigation.navigate("notepad")}
//         />

//         <DrawerItem
//           icon="musical-notes-outline"
//           label="Music"
//           onPress={() => props.navigation.navigate("music")}
//         />

//         <DrawerItem
//           icon="list-outline"
//           label="To Do List"
//           onPress={() => props.navigation.navigate("todolist")}
//         />
//       </View>

//       {/* FOOTER */}
//       <View style={styles.footer}>
//         <DrawerItem
//           icon="bug-outline"
//           label="Report a Bug"
//           onPress={() => props.navigation.navigate("reportbug")}
//         />

//         <DrawerItem
//           icon="person-outline"
//           label="Profile"
//           onPress={() => props.navigation.navigate("profile")}
//         />

//         <DrawerItem
//           icon="log-out-outline"
//           label="Logout"
//           onPress={handleLogout}
//         />
//       </View>
//     </DrawerContentScrollView>
//   );
// }

// function DrawerItem({
//   icon,
//   label,
//   onPress,
// }: {
//   icon: any;
//   label: string;
//   onPress: () => void;
// }) {
//   return (
//     <TouchableOpacity style={styles.item} onPress={onPress}>
//       <Ionicons name={icon} size={22} color="#555" />
//       <Text style={styles.itemText}>{label}</Text>
//     </TouchableOpacity>
//   );
// }

// /* ================= STYLES (BOTTOM) ================= */
// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//   },

//   header: {
//     padding: 20,
//     flexDirection: "row",
//     alignItems: "center",
//   },

//   logoText: {
//     fontWeight: "800",
//     fontSize: 20,
//     marginLeft: 30,
//     color: "#502707",
//   },

//   menu: {
//     paddingHorizontal: 20,
//   },

//   footer: {
//     marginTop: "auto",
//     padding: 20,
//     borderTopWidth: 1,
//     borderTopColor: "#f0f0f0",
//   },

//   item: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 14,
//   },

//   itemText: {
//     marginLeft: 14,
//     fontSize: 15,
//     fontWeight: "600",
//     color: "#444",
//   },
// });