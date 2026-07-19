import { useRouter } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ForgotPasswordFormValues,
  LoginFormValues,
  ProfileFormValues,
  RegisterFormValues,
} from "@calorie-ai-app/auth/schemas";
import { authClient } from "@/lib/auth-client";
import { getErrorMessage } from "@/lib/form-utils";
import { getProfile, saveProfile } from "@/lib/api-client";

export function useSignIn() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: LoginFormValues) => {
      const result = await authClient.signIn.email({
        email: data.email,
        password: data.password,
      });

      if (result.error) {
        throw new Error(
          getErrorMessage(result.error) ?? "Sign in failed. Please try again.",
        );
      }

      return result.data;
    },
    onSuccess: () => {
      router.push("/(tabs)");
    },
  });
}

export function useSignUp() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: RegisterFormValues) => {
      const result = await authClient.signUp.email({
        name: data.fullName,
        email: data.email,
        password: data.password,
      });

      if (result.error) {
        throw new Error(
          getErrorMessage(result.error) ??
            "Registration failed. Please try again.",
        );
      }

      return result.data;
    },
    onSuccess: () => {
      router.replace("/onboarding-profile");
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (data: ForgotPasswordFormValues) => {
      const result = await authClient.requestPasswordReset({
        email: data.email,
        redirectTo: "/reset-password",
      });

      if (result.error) {
        throw new Error(
          getErrorMessage(result.error) ??
            "Failed to send reset email. Please try again.",
        );
      }

      return result.data;
    },
  });
}

export function useSignOut() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await authClient.signOut();

      if (result.error) {
        throw new Error(
          getErrorMessage(result.error) ?? "Sign out failed. Please try again.",
        );
      }

      return result.data;
    },
    onSuccess: () => {
      queryClient.clear();
      router.replace("/");
    },
  });
}

export function useProfile() {
  const { data: session } = authClient.useSession();

  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const result = await getProfile();
      return result.profile;
    },
    enabled: !!session?.user,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      return saveProfile(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}