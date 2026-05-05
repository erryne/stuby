import React from "react";
import { Image, StyleSheet, View } from "react-native";

type TitleHeaderProps = {
  image: any; 
};

export default function TitleHeader({ image }: TitleHeaderProps) {
  return (
    <View style={styles.container}>
      <Image source={image} style={styles.image} resizeMode="contain" />
    </View>
  );
}

// Inside your TitleHeader.tsx
const styles = StyleSheet.create({
  container: {
    width: "60%",
    height: 80, // Fixed height for the banner area
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});