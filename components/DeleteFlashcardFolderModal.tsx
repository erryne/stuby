import { Feather } from "@expo/vector-icons";
import React from "react";
import { Dimensions, Modal, Pressable, Text, View } from "react-native";

const { width } = Dimensions.get("window");

type DeleteFlashcardFolderModalProps = {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function DeleteFlashcardFolderModal({
  visible,
  onCancel,
  onConfirm,
}: DeleteFlashcardFolderModalProps) {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onCancel}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.4)",
        }}
      >
        <View
          style={{
            width: width * 0.8,
            backgroundColor: "#A4E4D7",
            padding: 20,
            borderRadius: 20,
            alignItems: "center",
          }}
        >
          <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 10 }}>
            Delete Deck
          </Text>
          <Text style={{ marginBottom: 20, textAlign: "center" }}>
            Are you sure you want to delete this flashcards?
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#DEF0E5",
              padding: 10,
              borderRadius: 10,
              marginBottom: 20,
            }}
          >
            <Feather
              name="alert-triangle"
              size={20}
              color="#555"
              style={{ marginRight: 10 }}
            />
            <Text style={{ color: "#555", flex: 1 }}>
              Warning! Once deleted, you will no longer retrieve these
              flashcards.
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Pressable
              onPress={onConfirm}
              style={{
                backgroundColor: "#E64A45",
                flex: 1,
                marginRight: 10,
                padding: 10,
                borderRadius: 10,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>Delete</Text>
            </Pressable>
            <Pressable
              onPress={onCancel}
              style={{
                backgroundColor: "#FFF",
                flex: 1,
                marginLeft: 10,
                padding: 10,
                borderRadius: 10,
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#E64A45",
              }}
            >
              <Text style={{ color: "#E64A45", fontWeight: "bold" }}>
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
