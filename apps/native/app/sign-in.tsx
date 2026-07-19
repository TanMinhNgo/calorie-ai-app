import AuthTemplate from "@/components/templates/auth-template";
import { Input } from "@/components/ui/input";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Typography, useThemeColor } from "heroui-native";
import { useForm } from "react-hook-form";
import { Pressable, View } from "react-native";
import { loginSchema, LoginFormValues } from "@calorie-ai-app/auth/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, BUTTON_LABEL_CLASSNAME } from "@/components/ui/button";
import { useSignIn } from "@/hooks/use-auth-mutations";
import { Divider } from "@/components/ui/divider";
import SocialAuthGroup from "@/components/containers/auth/social-auth-group";
import AuthFooterLink from "@/components/containers/auth/auth-footer-link";

const SignIn = () => {
  const router = useRouter();
  const mutedColor = useThemeColor("muted");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { mutate: signIn, isPending, error } = useSignIn();

  return (
    <AuthTemplate
      title="Welcome Back"
      subTitle="Log in to continue your health journey."
      onBack={() => router.back()}
    >
      <View className="gap-6">
        <View className="gap-4">
          <Input
            label="Email"
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
          <Input
            label="Password"
            name="password"
            control={control}
            placeholder="••••••••"
            secureTextEntry
            rightElement={
              <Pressable onPress={() => router.push("/forgot-password")}>
                <Typography type="body-xs" className="text-primary">
                  Forgot?
                </Typography>
              </Pressable>
            }
          />
        </View>

        {error && (
          <Typography className="text-center text-red-500">
            {error.message}
          </Typography>
        )}

        <Button
          onPress={handleSubmit((data) => signIn(data))}
          isLoading={isPending}
          className="w-full"
        >
          <Button.Label className={BUTTON_LABEL_CLASSNAME}>Log In</Button.Label>
        </Button>

        <Divider label="Or continue with" />

        <SocialAuthGroup />

        <AuthFooterLink
          question="Don't have an account?"
          linkText="Register"
          onPress={() => router.push("/sign-up")}
        />

      </View>
    </AuthTemplate>
  );
};

export default SignIn;