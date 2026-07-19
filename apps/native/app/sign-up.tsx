import { View, Text } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { Typography, useThemeColor } from "heroui-native";
import { useForm } from "react-hook-form";
import {
  RegisterFormValues,
  registerSchema,
} from "@calorie-ai-app/auth/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import AuthTemplate from "@/components/templates/auth-template";
import SocialAuthGroup from "@/components/containers/auth/social-auth-group";
import { Divider } from "@/components/ui/divider";
import { Input } from "@/components/ui/input";
import { Ionicons } from "@expo/vector-icons";
import { Button, BUTTON_LABEL_CLASSNAME } from "@/components/ui/button";
import AuthFooterLink from "@/components/containers/auth/auth-footer-link";
import { Checkbox } from "@/components/ui/checkbox";
import { useSignUp } from "@/hooks/use-auth-mutations";

const SignUp = () => {
  const router = useRouter();
  const mutedColor = useThemeColor("muted");

  const { control, handleSubmit } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      terms: false,
    },
  });

  const { mutate: signUp, isPending, error } = useSignUp();
  return (
    <AuthTemplate
      title="Create Account"
      subTitle="Start your intelligent nutrition tracking today."
      onBack={() => router.back()}
    >
      <View className="gap-6">
        <SocialAuthGroup />

        <Divider label="Or register with email" />

        <View className="gap-4">
          <Input
            label="Full Name"
            name="fullName"
            control={control}
            placeholder="John Doe"
            leftElement={
              <Ionicons name="person-outline" size={18} color={mutedColor} />
            }
          />
          <Input
            label="Email Address"
            name="email"
            control={control}
            placeholder="john@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            leftElement={
              <Ionicons name="mail-outline" size={18} color={mutedColor} />
            }
          />
          <Input
            label="Password"
            name="password"
            control={control}
            placeholder="••••••••"
            secureTextEntry
          />
        </View>

        <Checkbox
          name="terms"
          control={control}
          label={
            <Typography className="text-neutral-400">
              I agree to the{" "}
              <Typography type="body-sm" className="text-primary">
                Terms
              </Typography>{" "}
              &{" "}
              <Typography type="body-sm" className="text-primary">
                Privacy Policy
              </Typography>
            </Typography>
          }
        />

        {error && (
          <Typography className="text-center text-red-500">
            {error.message}
          </Typography>
        )}

        <Button
          onPress={handleSubmit((data) => signUp(data))}
          isLoading={isPending}
          className="w-full mt-4"
        >
          <Button.Label className={BUTTON_LABEL_CLASSNAME}>
            Register
          </Button.Label>
        </Button>

        <AuthFooterLink
          question="Already have an account?"
          linkText="Log In"
          onPress={() => router.push("/sign-in")}
        />
      </View>
    </AuthTemplate>
  );
};

export default SignUp;