import { BlurView } from "expo-blur";
import { cn, Typography } from "heroui-native";
import React, { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AuthHeader from "../containers/auth/auth-header";

interface AuthTemplateProps {
  children: ReactNode;
  title: string;
  subTitle?: string;
  onBack?: () => void;
  showBack?: boolean;
  headerTitle?: string;
  className?: string;
}

const AuthTemplate: React.FC<AuthTemplateProps> = ({
  children,
  title,
  subTitle,
  onBack,
  showBack = true,
  headerTitle,
  className,
}) => {
  const insets = useSafeAreaInsets();
  return (
    <View
      className={cn("flex-1 bg-background", className)}
      style={{ paddingTop: insets.top }}
    >
      <View className="absolute top-0 right-0 h-75 w-75 overflow-hidden rounded-full">
        <BlurView
          intensity={50}
          tint="light"
          className="absolute inset-0 bg-primary/5"
        />
      </View>
      <View className="absolute bottom-0 left-0 h-62.5 w-62.5 overflow-hidden rounded-full">
        <BlurView
          intensity={40}
          tint="light"
          className="absolute inset-0 bg-primary-light/5"
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <AuthHeader onBack={onBack} showBack={showBack} title={headerTitle} />

        <ScrollView
          className="flex-1 px-6 pt-10"
          contentContainerClassName="pb-10"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View className="mb-10 items-center gap-2">
            <Typography type="h1" className="text-center">
              {title}
            </Typography>
            {subTitle && (
              <Typography type="body" className="text-center text-neutral-400">
                {subTitle}
              </Typography>
            )}
          </View>

          {/* Form Content */}
          <View className="flex-1">
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default AuthTemplate;