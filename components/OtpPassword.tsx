import React from "react";
import { View, Text, TextInput, Dimensions } from "react-native";
import CustomButton from "@/components/CustomButton";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface OtpPasswordProps {
    otp: string[];
    inputsRef: React.MutableRefObject<(TextInput | null)[]>;
    onChange: (text: string, index: number) => void;
    onVerify: () => void;
}

const OtpPassword: React.FC<OtpPasswordProps> = ({ otp, inputsRef, onChange, onVerify }) => {
    const inputWidthPercent = 12;
    const inputMarginPercent = 2;

    return (
        <View
            style={{
                width: "90%",
                backgroundColor: "#FFF9E5",
                borderRadius: SCREEN_WIDTH * 0.06,
                paddingHorizontal: "5%",
                paddingVertical: "8%",
                shadowColor: "#000",
                shadowOpacity: 0.1,
                shadowRadius: 10,
                elevation: 5,
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

            {/* OTP Inputs */}
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    width: "100%",
                    marginBottom: "6%",
                }}
            >
                {otp.map((digit, index) => (
                    <TextInput
                        key={index}
                        ref={(ref: TextInput | null) => {
                            inputsRef.current[index] = ref;
                        }}
                        value={digit}
                        onChangeText={(text) => onChange(text, index)}
                        keyboardType="number-pad"
                        maxLength={1}
                        placeholder="X"
                        placeholderTextColor="#9CA3AF"
                        style={{
                            width: `${inputWidthPercent}%`,
                            height: 45,
                            marginHorizontal: `${inputMarginPercent / 1}%`,
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: "#9CA3AF",
                            textAlign: "center",
                            fontSize: SCREEN_WIDTH * 0.05,
                            fontWeight: "600",
                            backgroundColor: "white",
                        }}
                    />
                ))}
            </View>

            <CustomButton
                title="VERIFY OTP"
                onPress={onVerify}
                containerStyle="w-full"
            />
        </View>
    );
};

export default OtpPassword;
