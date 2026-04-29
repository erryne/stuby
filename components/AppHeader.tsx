// import { Ionicons } from "@expo/vector-icons";
// import { DrawerActions } from "@react-navigation/native";
// import { useNavigation } from "expo-router";
// import React from "react";
// import { Platform, Text, TouchableOpacity, View } from "react-native";
// import { usePomodoro } from "../context/PomodoroContext";
// import { router } from "expo-router";

// export default function AppHeader() {
//   const navigation = useNavigation();
//   const { secondsLeft, isRunning, toggle } = usePomodoro();

//   const formatTime = (seconds: number) => {
//     const m = Math.floor(seconds / 60).toString().padStart(2, "0");
//     const s = (seconds % 60).toString().padStart(2, "0");
//     return `${m}:${s}`;
//   };

//   return (
//     <View
//       className="flex-row items-center justify-between"
//       style={{
//         paddingHorizontal: 16,
//         paddingTop: Platform.OS === "ios" ? 50 : 40,
//         paddingBottom: 12,
//         backgroundColor: "#FFFFFF",
//       }}
//     >
//       {/* LEFT: Menu + Title */}
//       <View className="flex-row items-center">
//         <TouchableOpacity
//           className="p-2"
//           onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
//         >
//           <Ionicons name="menu" size={28} color="#502707" />
//         </TouchableOpacity>
//         <Text className="ml-2 text-[20px] font-extrabold text-[#502707]">
//           STUBY
//         </Text>
//       </View>

//       {/* RIGHT: Pomodoro + Music */}
//       <View className="flex-row items-center space-x-2">
//         {/* Pomodoro Pill */}
//         <View className="flex-row items-center px-3 py-1 mr-2 rounded-full bg-[#DED4C1]">
//           {/* Numbers: navigate to Pomodoro */}
//           <TouchableOpacity
//             onPress={() => router.push("/pomodoro")} }
//             className="mr-2"
//           >
//             <Text className="text-[#502707] font-bold text-[19px]">
//               {formatTime(secondsLeft)}
//             </Text>
//           </TouchableOpacity>

//           {/* Play/Pause button */}
//           <TouchableOpacity
//             onPress={toggle}
//             className="flex-row items-center justify-center p-1"
//           >
//             <Ionicons
//               name={isRunning ? "pause" : "play"}
//               size={16}
//               color="#502707"
//             />
//           </TouchableOpacity>
//         </View>

//         {/* Music Circle */}
//         <TouchableOpacity className="w-9 h-9 rounded-full bg-[#DED4C1] justify-center items-center" onPress={() => router.push("/music")} >
//           <Ionicons name="musical-notes-outline" size={18} color="#502707" />
          
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }
