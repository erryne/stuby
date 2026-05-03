import React from "react";
import { View, Text, Modal, Pressable, Dimensions } from "react-native";
import { Feather } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

type DeletePlaylistModalProps = {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function DeletePlaylistModal({
  visible,
  onCancel,
  onConfirm,
}: DeletePlaylistModalProps) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.3)",
        }}
      >
        <View
          style={{
            width: width * 0.85,
            backgroundColor: "#FDE9C6",
            padding: 20,
            borderRadius: 20,
            alignItems: "center",
          }}
        >
          <Text style={{ fontWeight: "bold", fontSize: 22, marginBottom: 12, color: "#C59F6F" }}>
            Delete Playlist
          </Text>
          <Text style={{ fontSize: 16, marginBottom: 20, textAlign: "center", color: "#2E2A25" }}>
            Are you sure you want to delete this playlist?
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#D6B984",
              padding: 12,
              borderRadius: 12,
              marginBottom: 20,
              width: "100%",
            }}
          >
            <Feather name="alert-triangle" size={20} color="#2E2A25" style={{ marginRight: 10 }} />
            <Text style={{ fontWeight: "600", color: "#2E2A25", flex: 1 }}>
              Warning! Once deleted, you will no longer retrieve this playlist.
            </Text>
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
            <Pressable
              onPress={onConfirm}
              style={{
                backgroundColor: "#E64A45",
                flex: 1,
                marginRight: 10,
                paddingVertical: 12,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#FFF", fontWeight: "bold", fontSize: 16 }}>Delete</Text>
            </Pressable>
            <Pressable
              onPress={onCancel}
              style={{
                backgroundColor: "#FFF",
                flex: 1,
                marginLeft: 10,
                paddingVertical: 12,
                borderRadius: 12,
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#E64A45",
              }}
            >
              <Text style={{ color: "#E64A45", fontWeight: "bold", fontSize: 16 }}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
