// import Images from "@/constants/images";
// import { Audio } from "expo-av";
// import { router, useLocalSearchParams } from "expo-router";
// import { Check, ChevronLeft, Pencil } from "lucide-react-native";
// import React, { useEffect, useRef, useState } from "react";
// import { ImageBackground, Text, TouchableOpacity, View } from "react-native";
// import AppHeader from "../../../components/AppHeader";
// import PlayerCard from "../../../components/PlayerCard";
// import SongList from "../../../components/SongList";

// import * as DocumentPicker from "expo-document-picker";
// import { Alert, Modal, TextInput } from "react-native";

// // ================= SONG DATABASE =================
// export const songsByFolder: Record<string, any[]> = {
//   // UPBEAT
//   "1": [
//     {
//       id: "u1",
//       title: "Chances",
//       file: require("../../../assets/music/upbeat1.mp3"),
//     },
//     {
//       id: "u2",
//       title: "Joy",
//       file: require("../../../assets/music/upbeat2.mp3"),
//     },
//     {
//       id: "u3",
//       title: "Energizer",
//       file: require("../../../assets/music/upbeat3.mp3"),
//     },
//     {
//       id: "u4",
//       title: "Summer Sound",
//       file: require("../../../assets/music/upbeat4.mp3"),
//     },
//     {
//       id: "u5",
//       title: "Funky",
//       file: require("../../../assets/music/upbeat5.mp3"),
//     },
//     {
//       id: "u6",
//       title: "Carnival",
//       file: require("../../../assets/music/upbeat6.mp3"),
//     },
//     {
//       id: "u7",
//       title: "Donut",
//       file: require("../../../assets/music/upbeat7.mp3"),
//     },
//     {
//       id: "u8",
//       title: "Follow the Sun",
//       file: require("../../../assets/music/upbeat8.mp3"),
//     },
//     {
//       id: "u9",
//       title: "Sweet Talks",
//       file: require("../../../assets/music/upbeat9.mp3"),
//     },
//     {
//       id: "u10",
//       title: "Last Summer",
//       file: require("../../../assets/music/upbeat10.mp3"),
//     },
//   ],
//   // CLASSICAL
//   "2": [
//     {
//       id: "c1",
//       title: "Gymnopédie No.1 4",
//       file: require("../../../assets/music/classical1.mp3"),
//     },
//     {
//       id: "c2",
//       title: "Ballet Suite_ 1.Waltz 4",
//       file: require("../../../assets/music/classical2.mp3"),
//     },
//     {
//       id: "c3",
//       title: "The Nutcraker",
//       file: require("../../../assets/music/classical3.mp3"),
//     },
//     {
//       id: "c4",
//       title: "Hungarian Dance 5",
//       file: require("../../../assets/music/classical4.mp3"),
//     },
//     {
//       id: "c5",
//       title: "Pure Dream",
//       file: require("../../../assets/music/classical5.mp3"),
//     },
//   ],
//   // POP
//   "3": [
//     {
//       id: "p1",
//       title: "Espresso",
//       file: require("../../../assets/music/pop/pop1.mp3"),
//     },
//     {
//       id: "p2",
//       title: "Birds of a Feather",
//       file: require("../../../assets/music/pop/pop2.mp3"),
//     },
//     {
//       id: "p3",
//       title: "Die With A Smile",
//       file: require("../../../assets/music/pop/pop3.mp3"),
//     },
//     {
//       id: "p4",
//       title: "Golden",
//       file: require("../../../assets/music/pop/pop4.mp3"),
//     },
//     {
//       id: "p5",
//       title: "Cruel Summer",
//       file: require("../../../assets/music/pop/pop5.mp3"),
//     },
//     {
//       id: "p6",
//       title: "Levitating",
//       file: require("../../../assets/music/pop/pop6.mp3"),
//     },
//     {
//       id: "p7",
//       title: "Flowers",
//       file: require("../../../assets/music/pop/pop7.mp3"),
//     },
//     {
//       id: "p8",
//       title: "As It Was",
//       file: require("../../../assets/music/pop/pop8.mp3"),
//     },
//     {
//       id: "p9",
//       title: "Anti-Hero",
//       file: require("../../../assets/music/pop/pop9.mp3"),
//     },
//     {
//       id: "p10",
//       title: "Greedy",
//       file: require("../../../assets/music/pop/pop10.mp3"),
//     },
//   ],
//   // NATURE
//   "4": [
//     {
//       id: "n1",
//       title: "Rain Sounds",
//       file: require("../../../assets/music/nature/nature1.mp3"),
//     },
//     {
//       id: "n2",
//       title: "Forest Ambience",
//       file: require("../../../assets/music/nature/nature2.mp3"),
//     },
//     {
//       id: "n3",
//       title: "Ocean Waves",
//       file: require("../../../assets/music/nature/nature3.mp3"),
//     },
//     {
//       id: "n4",
//       title: "Sounds of Nature",
//       artist: "Aylex",
//       file: require("../../../assets/music/nature/nature4.mp3"),
//     }, //
//     {
//       id: "n5",
//       title: "Whistle",
//       artist: "Pufino",
//       file: require("../../../assets/music/nature/nature5.mp3"),
//     }, //
//     {
//       id: "n6",
//       title: "Tranquility",
//       artist: "Project Ex",
//       file: require("../../../assets/music/nature/nature6.mp3"),
//     }, //
//     {
//       id: "n7",
//       title: "We Are",
//       artist: "Moavii",
//       file: require("../../../assets/music/nature/nature7.mp3"),
//     }, //
//     {
//       id: "n8",
//       title: "Dawn",
//       artist: "Alegend",
//       file: require("../../../assets/music/nature/nature8.mp3"),
//     }, //
//     {
//       id: "n9",
//       title: "Soaked",
//       artist: "Pufino",
//       file: require("../../../assets/music/nature/nature9.mp3"),
//     }, //
//     {
//       id: "n10",
//       title: "Wallflower",
//       artist: "Epic Spectrum",
//       file: require("../../../assets/music/nature/nature10.mp3"),
//     }, //
//   ],
//   // LOFI
//   "5": [
//     {
//       id: "l1",
//       title: "Lofi Chill",
//       file: require("../../../assets/music/pop1.mp3"),
//     },
//   ],
// };

// export default function Playlist() {
//   const params = useLocalSearchParams();
//   const folderId = Array.isArray(params?.id) ? params.id[0] : params?.id;
//   const folderTitle = Array.isArray(params?.title)
//     ? params.title[0]
//     : (params?.title ?? "Playlist");

//   /* ================= ADD SONG MODAL ================= */

//   const [isAddModalVisible, setIsAddModalVisible] = useState(false);
//   const [newSongTitle, setNewSongTitle] = useState("");
//   const [newSongFile, setNewSongFile] = useState<any>(null);

//   /* ================= INITIAL SONG LIST ================= */
//   const initialSongs =
//     folderId === "all"
//       ? Object.values(songsByFolder).flat() // ✅ Compile all songs from all folders
//       : folderId && songsByFolder[folderId]
//         ? songsByFolder[folderId]
//         : [];

//   const [playlistSongs, setPlaylistSongs] = useState(initialSongs);
//   const [isEditing, setIsEditing] = useState(false);

//   /* ================= PLAYER STATE ================= */
//   const soundRef = useRef<Audio.Sound | null>(null);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [duration, setDuration] = useState(0);
//   const [position, setPosition] = useState(0);
//   const [isShuffle, setIsShuffle] = useState(false);
//   const [isRepeat, setIsRepeat] = useState(false);
//   const [songDurations, setSongDurations] = useState<number[]>([]);

//   const repeatRef = useRef(isRepeat);
//   useEffect(() => {
//     repeatRef.current = isRepeat;
//   }, [isRepeat]);

//   /* ================= IMPORT MP4 ================= */

//   const handleImportMusic = async () => {
//     try {
//       const result = await DocumentPicker.getDocumentAsync({
//         type: "video/mp4", // STRICT MP4
//         copyToCacheDirectory: true,
//       });

//       if (result.canceled) return;

//       const file = result.assets[0];

//       if (!file.name.toLowerCase().endsWith(".mp4")) {
//         Alert.alert("Only MP4 files are allowed!");
//         return;
//       }

//       setNewSongFile(file);

//       // Auto fill title
//       const nameWithoutExt = file.name.replace(".mp4", "");
//       setNewSongTitle(nameWithoutExt);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   /* ================= ADD SONG================= */

//   const handleAddSong = () => {
//     if (!newSongTitle || !newSongFile) {
//       Alert.alert("Please enter title and import MP4 file");
//       return;
//     }

//     const newSong = {
//       id: Date.now().toString(),
//       title: newSongTitle,
//       file: { uri: newSongFile.uri },
//     };

//     setPlaylistSongs((prev) => [...prev, newSong]);

//     setNewSongTitle("");
//     setNewSongFile(null);
//     setIsAddModalVisible(false);
//   };

//   /* ================= FORMAT TOTAL TIME ================= */
//   const formatTotalDuration = (ms: number) => {
//     if (!ms) return "0 min";
//     const totalSeconds = Math.floor(ms / 1000);
//     const minutes = Math.floor(totalSeconds / 60);
//     const seconds = totalSeconds % 60;
//     if (minutes === 0) return `${seconds} sec`;
//     if (seconds === 0) return `${minutes} min`;
//     return `${minutes} min ${seconds} sec`;
//   };

//   const totalDurationMillis = songDurations.reduce((a, b) => a + b, 0);
//   const formattedTotalDuration = formatTotalDuration(totalDurationMillis);

//   /* ================= LOAD SONG ================= */
//   const loadSong = async (index: number, autoPlay = true) => {
//     if (playlistSongs.length === 0) return;
//     if (soundRef.current) await soundRef.current.unloadAsync();

//     const selected = playlistSongs[index];

//     const fileSource = selected.file?.uri
//       ? { uri: selected.file.uri }
//       : selected.file;

//     const { sound } = await Audio.Sound.createAsync(
//       fileSource,

//       { shouldPlay: autoPlay },
//       (status: any) => {
//         if (!status.isLoaded) return;
//         setDuration(status.durationMillis || 0);
//         setPosition(status.positionMillis || 0);
//         setIsPlaying(status.isPlaying);

//         if (status.didJustFinish) {
//           if (repeatRef.current) loadSong(index);
//           else autoNext(index);
//         }
//       },
//     );

//     soundRef.current = sound;
//     setCurrentIndex(index);
//   };

//   const autoNext = (index: number) => {
//     if (playlistSongs.length === 0) return;
//     let nextIndex = index;

//     if (isShuffle && playlistSongs.length > 1) {
//       do {
//         nextIndex = Math.floor(Math.random() * playlistSongs.length);
//       } while (nextIndex === index);
//     } else {
//       nextIndex = index + 1;
//       if (nextIndex >= playlistSongs.length) nextIndex = 0;
//     }

//     loadSong(nextIndex);
//   };

//   /* ================= CONTROLS ================= */
//   const handlePlayPause = async () => {
//     if (!soundRef.current || playlistSongs.length === 0) return;
//     if (isPlaying) await soundRef.current.pauseAsync();
//     else await soundRef.current.playAsync();
//   };

//   const handleNext = () => autoNext(currentIndex);

//   const handlePrev = () => {
//     if (playlistSongs.length === 0) return;
//     const prevIndex =
//       currentIndex === 0 ? playlistSongs.length - 1 : currentIndex - 1;
//     loadSong(prevIndex);
//   };

//   const handleSeek = async (millis: number) => {
//     if (!soundRef.current) return;
//     await soundRef.current.setPositionAsync(millis);
//   };

//   /* ================= PRELOAD DURATIONS ================= */
//   useEffect(() => {
//     if (playlistSongs.length === 0) {
//       setSongDurations([]);
//       return;
//     }

//     const preloadDurations = async () => {
//       const durations: number[] = [];
//       for (const song of playlistSongs) {
//         const { sound, status } = await Audio.Sound.createAsync(song.file);
//         durations.push(status.isLoaded ? (status.durationMillis ?? 0) : 0);
//         await sound.unloadAsync();
//       }
//       setSongDurations(durations);
//     };

//     preloadDurations();
//     loadSong(0, false);

//     return () => {
//       if (soundRef.current) soundRef.current.unloadAsync();
//     };
//   }, [playlistSongs]);

//   /* ================= DELETE ================= */
//   const handleDelete = (id: string) => {
//     const updated = playlistSongs.filter((s) => s.id !== id);
//     setPlaylistSongs(updated);

//     if (currentIndex >= updated.length) setCurrentIndex(0);
//   };

//   /* ================= UI ================= */
//   return (
//     <ImageBackground
//       source={Images.MusicBg}
//       className="flex-1"
//       resizeMode="cover"
//     >
//       <AppHeader />

//       <View className="flex-row items-center justify-between px-6 mt-7 mb-2">
//         <TouchableOpacity onPress={() => router.back()}>
//           <ChevronLeft size={28} color="#ffffff" />
//         </TouchableOpacity>

//         <Text className="text-4xl font-bold text-[#FDE6B1] text-center flex-1">
//           {folderTitle}
//         </Text>

//         <View>
//           {!isEditing ? (
//             <TouchableOpacity
//               className="mr-[2%]"
//               onPress={() => setIsEditing(true)}
//             >
//               <Pencil size={28} color="white" />
//             </TouchableOpacity>
//           ) : (
//             <TouchableOpacity
//               className="mr-[2%]"
//               onPress={() => setIsEditing(false)}
//             >
//               <Check size={28} color="#06402B" />
//             </TouchableOpacity>
//           )}
//         </View>
//       </View>

//       <View className="mx-6 mt-6" style={{ height: "75%" }}>
//         <PlayerCard
//           image={Images.MusicClassical}
//           folderTitle={folderTitle}
//           totalSongs={playlistSongs.length}
//           totalDuration={formattedTotalDuration}
//           currentTitle={
//             playlistSongs.length === 0
//               ? "No songs yet"
//               : playlistSongs[currentIndex]?.title
//           }
//           duration={duration}
//           position={position}
//           isPlaying={isPlaying}
//           onPlayPause={handlePlayPause}
//           onNext={handleNext}
//           onPrev={handlePrev}
//           isShuffle={isShuffle}
//           isRepeat={isRepeat}
//           onSeek={handleSeek}
//           onToggleShuffle={() => setIsShuffle(!isShuffle)}
//           onToggleRepeat={() => setIsRepeat(!isRepeat)}
//           onAddSong={() => setIsAddModalVisible(true)}
//         />

//         <SongList
//           songs={playlistSongs.map((s, i) => ({
//             ...s,
//             duration: songDurations[i],
//           }))}
//           currentId={playlistSongs[currentIndex]?.id || ""}
//           isEditing={isEditing}
//           onSelect={(id) => {
//             if (isEditing) return;
//             const index = playlistSongs.findIndex((s) => s.id === id);
//             if (index !== -1) loadSong(index);
//           }}
//           onDelete={handleDelete}
//         />
//       </View>

//       <Modal transparent visible={isAddModalVisible} animationType="fade">
//         <View className="flex-1 justify-center items-center bg-black/40">
//           <View
//             style={{
//               width: 300,
//               backgroundColor: "#EED9B6",
//               borderRadius: 20,
//               padding: 20,
//               borderWidth: 2,
//               borderColor: "black",
//             }}
//           >
//             <Text className="text-black font-bold mb-2">Song Title</Text>

//             <TextInput
//               value={newSongTitle}
//               onChangeText={setNewSongTitle}
//               placeholder="Enter song title"
//               style={{
//                 backgroundColor: "#E5E5E5",
//                 borderRadius: 15,
//                 padding: 10,
//                 borderWidth: 2,
//                 borderColor: "black",
//                 marginBottom: 15,
//               }}
//             />

//             <TouchableOpacity
//               onPress={handleImportMusic}
//               style={{ marginBottom: 20 }}
//             >
//               <Text style={{ fontWeight: "600" }}>
//                 + Import Music {newSongFile ? "| File Uploaded!" : ""}
//               </Text>
//             </TouchableOpacity>

//             <View className="flex-row justify-between">
//               <TouchableOpacity
//                 onPress={handleAddSong}
//                 style={{
//                   backgroundColor: "#6FCF97",
//                   paddingVertical: 8,
//                   paddingHorizontal: 20,
//                   borderRadius: 15,
//                   borderWidth: 2,
//                   borderColor: "black",
//                 }}
//               >
//                 <Text style={{ fontWeight: "bold" }}>+ Add</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 onPress={() => setIsAddModalVisible(false)}
//                 style={{
//                   backgroundColor: "#EB5757",
//                   paddingVertical: 8,
//                   paddingHorizontal: 20,
//                   borderRadius: 15,
//                   borderWidth: 2,
//                   borderColor: "black",
//                 }}
//               >
//                 <Text style={{ fontWeight: "bold", color: "white" }}>
//                   Cancel
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </ImageBackground>
//   );
// }
