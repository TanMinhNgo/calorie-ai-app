import { View, Text } from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { Typography, useThemeColor } from "heroui-native";
import { useForm } from "react-hook-form";
import {
  ForgotPasswordFormValues,
  forgotPasswordSchema,
} from "@calorie-ai-app/auth/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForgotPassword } from "@/hooks/use-auth-mutations";
import AuthTemplate from "@/components/templates/auth-template";
import { Ionicons } from "@expo/vector-icons";
import { Button, BUTTON_LABEL_CLASSNAME } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AuthFooterLink from "@/components/containers/auth/auth-footer-link";

const ForgotPassword = () => {
  const router = useRouter();
  const mutedColor = useThemeColor("muted");
  const accentForegroundColor = useThemeColor("accent-foreground");
  const [emailSent, setEmailSent] = useState(false);

  const { control, handleSubmit, getValues } =
    useForm<ForgotPasswordFormValues>({
      resolver: zodResolver(forgotPasswordSchema),
      defaultValues: {
        email: "",
      },
    });

  const { mutate: sendResetEmail, isPending, error } = useForgotPassword();

  const onSubmit = (data: ForgotPasswordFormValues) => {
    sendResetEmail(data, {
      onSuccess: () => setEmailSent(true),
    });
  };
  return (
    <View className="flex-1">
      <AuthTemplate
        title="Forgot Password?"
        subTitle="Enter your email address and we'll send you instructions to reset your password."
        onBack={() => router.back()}
      >
        {emailSent ? (
          <View className="gap-8 items-center py-10">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Ionicons name="mail-outline" size={28} color="#2ab3b1" />
            </View>
            <View className="gap-3 items-center">
              <Typography type="h3" className="text-center text-heading">
                Check Your Inbox
              </Typography>
              <Typography type="body" className="text-center text-neutral-400">
                We've sent password reset instructions to{"\n"}
                <Typography className="text-foreground">
                  {getValues("email")}
                </Typography>
              </Typography>
            </View>
            <Button onPress={() => router.push("/sign-in")} className="w-full">
              <Button.Label className={BUTTON_LABEL_CLASSNAME}>
                Back to Login
              </Button.Label>
            </Button>
          </View>
        ) : (
          <View className="gap-8">
            <Input
              label="Email Address"
              name="email"
              control={control}
              placeholder="name@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              leftElement={
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color={mutedColor as string}
                />
              }
            />

            {error && (
              <Typography type="body-sm" className="text-center text-red-500">
                {error.message}
              </Typography>
            )}

            <Button
              onPress={handleSubmit(onSubmit)}
              isLoading={isPending}
              className="w-full"
            >
              <View className="flex-row items-center gap-2">
                <Button.Label className={BUTTON_LABEL_CLASSNAME}>
                  Send Instructions
                </Button.Label>
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={accentForegroundColor as string}
                />
              </View>
            </Button>

            <AuthFooterLink
              question="Wait, I remember my password..."
              linkText="Back to Login"
              onPress={() => router.push("/sign-in")}
            />
          </View>
        )}
      </AuthTemplate>
    </View>
  );
};

export default ForgotPassword;