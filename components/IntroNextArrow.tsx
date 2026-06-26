import { router } from "expo-router"; // <- import router
import { Animated, Dimensions, Pressable, ScrollView } from "react-native";

type IntroNextArrowProps = {
  scrollRef: React.RefObject<ScrollView>;
  page: number;
  totalPages: number;
};

export default function IntroNextArrow({
  scrollRef,
  page,
  totalPages,
}: IntroNextArrowProps) {
  const width = Dimensions.get("window").width;

  return (
    <Pressable
      onPress={() => {
        if (page + 1 < totalPages) {
          // scroll to next page
          scrollRef.current?.scrollTo({
            x: width * (page + 1),
            animated: true,
          });
        } else {
          // last page → navigate to dashboard
          router.push("/");
        }
      }}
      style={{
        position: "absolute",
        bottom: 40,
        right: 30,
      }}
    >
      <Animated.Text style={{ fontSize: 32, color: "#5DCCFC" }}>
        →
      </Animated.Text>
    </Pressable>
  );
}
