import { Href, useRouter } from "expo-router";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import TitleHeader from "./TitleHeader";

// Define the shape of a single item
export interface QuickAccessItem {
  id: string;
  label: string;
  bgColor: string;
  route: Href;
  icon: any; // Handles require("../assets/...") local assets
}

interface QuickAccessProps {
  items: QuickAccessItem[];
  title?: string;
}

export default function QuickAccess({
  items,
  title = "QUICK ACCESS",
}: QuickAccessProps) {
  const router = useRouter();

  return (
    <View
      /* -mx-[5.3%] offsets the home screen's px-[5%] to stretch completely edge-to-edge.
       */
      className="mt-[5%]  -mx-[5.3%] overflow-hidden"
    >
      {/* Centered Title Header with increased size and higher z-index */}
      {/* <View className="bg-white rounded-full w-64 h-14 items-center justify-center self-center z-10">
        <Text className="font-extrabold text-[#1E293B] text-[22px] text-center tracking-wide">
          {title}
        </Text>
      </View> */}

      <View className="bg-white rounded-full w-64 h-14 items-center justify-center self-center z-10">
        <TitleHeader
          title={title}
          size="sm"
          align="center"
          color="#1E293B"
          containerStyle={{ marginTop: 0, marginBottom: 0 }}
        />
      </View>

      {/* Horizontal Scrollable Wrapper
        - mt-[-28px] pulls the background up by exactly half of the title badge's height (56px / 2)
      */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        className="mt-[-28px] pt-8 bg-white"
        contentContainerStyle={{
          paddingLeft: 20, // Margin padding internally so cards align with screen layout
          paddingRight: 20, // Prevents clipping at the far right edge
          paddingTop: 40, // Increased to give room for the half-popping circles
          paddingBottom: 15,
        }}
      >
        {items.map((item) => (
          /* Added mt-[25px] to account for the circle popping out of the top */
          <View key={item.id} className="items-center mr-8 w-[90px] ">
            <TouchableOpacity
              onPress={() => router.navigate(item.route)}
              style={{
                backgroundColor: item.bgColor,
                // iOS Shadow Settings
                shadowColor: "#000000",
                shadowOffset: { width: 2, height: 3 },
                shadowOpacity: 1, // Fixed: Must be between 0 and 1
                shadowRadius: 2, // Tweaked for a smoother look
                // Android Shadow Settings
                elevation: 4, // Fixed: Kept here, removed conflicting Tailwind class
              }}
              className="w-[110px] h-[70px] rounded-[22px] relative flex items-center justify-end pb-3"
              activeOpacity={0.7}
            >
              {/* 
                White circle background for the icon:
                - `absolute` positioning to snap to the top
                - `-top-[25px]` shifts it up by exactly half of its 50px height
                - `elevation` / `z-20` keeps it layered cleanly over the button
              */}
              <View className="absolute -top-[30px] w-[80px] h-[80px] rounded-full bg-white flex items-center justify-center elevation-2 z-20">
                <Image
                  source={item.icon}
                  className="w-[80px] h-[80px]" // Adjusted slightly for visual balance
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>

            <Text
              className="text-[15px] font-mono mt-2.5 text-[#1E293B] font-bold text-center w-full"
              numberOfLines={1}
            >
              {item.label}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
