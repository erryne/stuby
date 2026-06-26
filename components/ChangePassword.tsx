import React from "react";
import { View, Text, Dimensions } from "react-native";
import CustomButton from "@/components/CustomButton";
import CustomTextInput from "@/components/CustomTextInput";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface ChangePasswordFormProps {
  password: string;
  confirmPassword: string;
  onPasswordChange: (text: string) => void;
  onConfirmPasswordChange: (text: string) => void;
  onSubmit: () => void;
}

const ChangePassword: React.FC<ChangePasswordFormProps> = ({
  password,
  confirmPassword,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
}) => {
  return (
    <View
      style={{
        width: "100%",
        backgroundColor: "#FFF9E5",
        borderRadius: 24,
        paddingVertical: "8%",
        paddingHorizontal: "6%",
        alignItems: "center",
      }}
    >
      <Text
        style={{
          fontSize: SCREEN_WIDTH * 0.07,
          fontWeight: "800",
          textAlign: "center",
          color: "black",
          marginBottom: "3%",
        }}
      >
        Change Password
      </Text>

      <Text
        style={{
          textAlign: "center",
          color: "#4B3A00",
          fontSize: SCREEN_WIDTH * 0.035,
          marginBottom: "5%",
        }}
      >
        Please check your email for the OTP to verify your account.
      </Text>

        <View style={{ width: "100%" }}>
        <View>
          {/* Password */}
          <Text
            style={{
              width: "100%",
              marginBottom: "2%",
              textAlign: "left",
              color: "#4B3A00",
              
            }}
          >
            Password
          </Text>
          <CustomTextInput
            iconName="lock"
            secureTextEntry
            value={password}
            onChangeText={onPasswordChange}
          />

          {/* Confirm Password */}
          <Text
            style={{
              width: "100%",
              marginTop: "2%",
              marginBottom: "2%",
              textAlign: "left",
              color: "#4B3A00",
            }}
          >
            Confirm Password
          </Text>
          <CustomTextInput
            iconName="lock"
            secureTextEntry
            value={confirmPassword}
            onChangeText={onConfirmPasswordChange}
          />
        </View>
      </View>

      {/* Button */}
      <View style={{ marginTop: "5%", width: "100%", alignItems: "center" }}>
        <CustomButton title="CHANGE PASSWORD" onPress={onSubmit} containerStyle="w-full" />
      </View>
    </View>
  );
};

export default ChangePassword;
