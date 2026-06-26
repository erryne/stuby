import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BackgroundPattern from "./BackgroundPattern";

// Update the path below to match your actual folder structure
const musicDefaultImage = require("../assets/images/musicfolder_default.png");

const { width } = Dimensions.get("window");

export interface FavoriteItem {
  id: string;
  title: string;
  type: "flashcard" | "note" | "music";
  createdAt: any;
  route: Href;
  design?: string;
  coverPhoto?: string;
}

interface FavoritesProps {
  items: FavoriteItem[];
  title?: string;
}

const getFlashcardThemeColor = (design: string | undefined) => {
  switch (design?.toLowerCase()) {
    case "red":
    case "sunset":
      return "#EF4444";
    case "purple":
    case "cosmic":
      return "#A855F7";
    case "green":
    case "nature":
      return "#10B981";
    case "orange":
    case "orange":
      return "#F97316";
    case "blue":
    default:
      return "#38BDF8";
  }
};

export default function Favorites({
  items,
  title = "FAVORITES BOARD",
}: FavoritesProps) {
  const router = useRouter();

  const flashcards = items.filter((item) => item.type === "flashcard");
  const notepads = items.filter((item) => item.type === "note");
  const playlists = items.filter((item) => item.type === "music");

  const renderEmptyState = (message: string, iconName: any) => (
    <View style={styles.emptyContainer} className="my-2">
      <Ionicons name={iconName} size={24} color="rgba(255,255,255,0.6)" />
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );

  return (
    <View style={styles.containerSection}>
      <BackgroundPattern />
      <Text style={[styles.customFont, { paddingHorizontal: width * 0.05 }]}>
        {title}
      </Text>

      {/* --- SECTION 1: FLASHCARDS --- */}
      <View className="mb-6">
        <View style={styles.sectionHeaderWrapper}>
          <Ionicons
            name="flash"
            size={18}
            color="#ffffff"
            style={styles.sectionIcon}
          />
          <Text style={styles.sectionFont}>FLASHCARDS</Text>
        </View>

        {flashcards.length === 0 ? (
          renderEmptyState("No favorite flashcards added yet.", "book-outline")
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollContent}
          >
            {flashcards.map((item) => {
              const currentThemeColor = getFlashcardThemeColor(item.design);
              const CardContent = () => (
                <View style={styles.centerCardWrapper}>
                  <View
                    style={[
                      styles.iconWrapper,
                      {
                        backgroundColor: item.coverPhoto
                          ? "rgba(0,0,0,0.4)"
                          : currentThemeColor,
                        marginBottom: 6,
                      },
                    ]}
                  >
                    <Ionicons name="book-outline" size={18} color="#ffffff" />
                  </View>
                  <Text numberOfLines={2} style={styles.cardTitle}>
                    {item.title}
                  </Text>
                  <Text
                    style={[
                      styles.cardTypeLabel,
                      { color: item.coverPhoto ? "#FFF" : currentThemeColor },
                    ]}
                  >
                    DECK
                  </Text>
                </View>
              );

              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => router.push(item.route)}
                  activeOpacity={0.8}
                  style={[
                    styles.flashcardCard,
                    {
                      backgroundColor: item.coverPhoto
                        ? "transparent"
                        : "#1E293B",
                    },
                  ]}
                >
                  {item.coverPhoto ? (
                    <ImageBackground
                      source={{ uri: item.coverPhoto }}
                      style={StyleSheet.absoluteFillObject}
                      imageStyle={{ borderRadius: 18 }}
                    >
                      <View
                        style={[
                          StyleSheet.absoluteFillObject,
                          {
                            backgroundColor: "rgba(0,0,0,0.35)",
                            borderRadius: 18,
                            padding: 12,
                            justifyContent: "center",
                          },
                        ]}
                      >
                        <CardContent />
                      </View>
                    </ImageBackground>
                  ) : (
                    <View
                      style={[
                        StyleSheet.absoluteFillObject,
                        { padding: 12, justifyContent: "center" },
                      ]}
                    >
                      <CardContent />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* --- SECTION 2: STICKY NOTES --- */}
      <View className="mb-6">
        <View style={styles.sectionHeaderWrapper}>
          <Ionicons
            name="bookmark"
            size={18}
            color="#ffffff"
            style={styles.sectionIcon}
          />
          <Text style={styles.sectionFont}>NOTEPADS</Text>
        </View>

        {notepads.length === 0 ? (
          renderEmptyState(
            "No favorite study notes added yet.",
            "document-text-outline",
          )
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollContent}
          >
            {notepads.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => router.push(item.route)}
                activeOpacity={0.85}
                style={[
                  styles.stickyNoteCard,
                  {
                    transform: [{ rotate: index % 2 === 0 ? "-2deg" : "2deg" }],
                  },
                ]}
              >
                <Ionicons
                  name="document-text"
                  size={20}
                  color="#854D0E" // Using a dark brown that matches your text color
                  style={{ alignSelf: "center", marginBottom: 8 }}
                />
                <View style={styles.stickyTape} />
                <Text numberOfLines={3} style={styles.stickyNoteText}>
                  {item.title}
                </Text>
                <Text style={styles.cdTracksLabel}>NOTEPAD</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* --- SECTION 3: MUSIC PLAYLISTS --- */}
      <View className="mb-6">
        <View style={styles.sectionHeaderWrapper}>
          <Ionicons
            name="disc"
            size={18}
            color="#ffffff"
            style={styles.sectionIcon}
          />
          <Text style={styles.sectionFont}>MUSIC ALBUMS</Text>
        </View>

        {playlists.length === 0 ? (
          renderEmptyState(
            "No favorite tracks added yet.",
            "musical-notes-outline",
          )
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollContent}
          >
            {playlists.map((item) => {
              const AlbumCoverContent = () => (
                <>
                  <View style={styles.cdSpineAccent} />
                  <View style={styles.cdCoverContent}>
                    <Ionicons
                      name="disc-outline"
                      size={22}
                      color="rgba(255,255,255,0.85)"
                    />
                    <Text numberOfLines={2} style={styles.cdAlbumTitle}>
                      {item.title}
                    </Text>
                    <Text style={styles.cdTracksLabel}>PLAYLIST</Text>
                  </View>
                </>
              );

              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => router.push(item.route)}
                  activeOpacity={0.9}
                  style={styles.cdJewelCase}
                >
                  <View style={styles.cdDisc}>
                    <View style={styles.cdInnerRing}>
                      <View style={styles.cdCenterHole} />
                    </View>
                  </View>
                  <View style={styles.cdCoverFront}>
                    <ImageBackground
                      source={
                        item.coverPhoto
                          ? { uri: item.coverPhoto }
                          : musicDefaultImage
                      }
                      style={StyleSheet.absoluteFillObject}
                      resizeMode="cover"
                    >
                      <View
                        style={[
                          StyleSheet.absoluteFillObject,
                          {
                            // Increase 0.45 to 0.75 or 0.8 to make it darker
                            backgroundColor: "rgba(15, 23, 42, 0.75)",
                            flexDirection: "row",
                          },
                        ]}
                      >
                        <AlbumCoverContent />
                      </View>
                    </ImageBackground>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  containerSection: {
    paddingVertical: 25,
    width: "100%",
    backgroundColor: "#334155",
  },
  horizontalScrollContent: {
    paddingHorizontal: width * 0.05,
    paddingBottom: 16,
    gap: 18,
  },
  sectionHeaderWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "5%",
    marginBottom: 12,
  },
  sectionIcon: {
    marginRight: 8,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  flashcardCard: {
    width: 145,
    height: 145,
    borderRadius: 20,
    borderWidth: 2.5,
    borderColor: "#ffffff",
    overflow: "hidden",
  },
  centerCardWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  iconWrapper: { padding: 6, borderRadius: 10 },
  cardTitle: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 4,
  },
  cardTypeLabel: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
    textAlign: "center",
  },
  stickyNoteCard: {
    backgroundColor: "#FEF08A",
    width: 135,
    height: 135,
    padding: 12,
    paddingTop: 22,
    borderWidth: 2.5,
    borderColor: "#ffffff",
    justifyContent: "center",
  },
  stickyTape: {
    position: "absolute",
    top: -6,
    left: "30%",
    width: "40%",
    height: 14,
    backgroundColor: "rgba(255,255,255,0.65)",
    zIndex: 10,
  },
  stickyNoteText: {
    color: "#451A03",
    fontWeight: "700",
    fontSize: 14,
    textAlign: "center",
  },

  cdJewelCase: {
    width: 160,
    height: 135,
    flexDirection: "row",
    alignItems: "center",
  },
  cdCoverFront: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 130,
    height: 135,
    borderRadius: 8,
    borderWidth: 2.5,
    borderColor: "#ffffff",
    overflow: "hidden",
    zIndex: 2,
  },
  cdSpineAccent: {
    width: 5,
    height: "100%",
    backgroundColor: "#F59E0B",
    opacity: 0.8,
  },
  cdCoverContent: {
    flex: 1,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  cdAlbumTitle: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 15,
    textAlign: "center",
  },
  cdTracksLabel: {
    color: "#F59E0B",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  cdDisc: {
    position: "absolute",
    right: 2,
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: "#475569",
    borderWidth: 2.5,
    borderColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  cdInnerRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#64748B",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  cdCenterHole: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  emptyContainer: {
    marginHorizontal: width * 0.05,
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  emptyText: {
    color: "#ffffff",
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
  },
  customFont: {
    fontFamily: "Chunko-Bold",
    fontSize: 30,
    letterSpacing: 1.5,
    textAlign: "center",
    color: "#ffffff",
    marginBottom: 20,
  },
  sectionFont: {
    fontWeight: "900",
    fontSize: 16,
    letterSpacing: 1.5,
    color: "#ffffff",
  },
});
