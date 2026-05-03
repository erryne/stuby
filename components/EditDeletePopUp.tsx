import { SquarePen, Trash2 } from "lucide-react-native";
import React from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface EditDeletePopUpProps {
  onEdit: () => void;
  onDelete: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const EditDeletePopUp: React.FC<EditDeletePopUpProps> = ({ onEdit, onDelete }) => {
  return (
    <View style={styles.popupContainer}>
      {/* Edit Button */}
      <TouchableOpacity style={styles.button} onPress={onEdit}>
        <SquarePen size={18} color="#85ADDA" />
        <Text style={styles.buttonText}>Edit</Text>
      </TouchableOpacity>

      {/* Delete Button */}
      <TouchableOpacity style={[styles.button, styles.marginTop]} onPress={onDelete}>
        <Trash2 size={18} color="red" />
        <Text style={styles.buttonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EditDeletePopUp;

const styles = StyleSheet.create({
  popupContainer: {
    position: "absolute",
    top: 16, // top-4
    right: 0,
    backgroundColor: "white",
    borderRadius: 8, // rounded-lg
    padding: 8, // p-2
    width: SCREEN_WIDTH * 0.22,
    // Shadows
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8, // replaces space-x-3
  },
  marginTop: {
    marginTop: 8, // mt-2
  },
  buttonText: {
    color: "black",
    fontWeight: "600", // font-semibold
    fontSize: 14,
  },
});