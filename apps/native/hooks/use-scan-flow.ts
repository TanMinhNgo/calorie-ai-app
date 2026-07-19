import { useCallback, useRef, useState } from "react";
import { CameraView, FlashMode } from "expo-camera";
import { useRouter } from "expo-router";
import { useToast } from "heroui-native";
import { useSaveMeal } from "./use-meals";
import { useAnalyzeMeal } from "./use-meal-analysis";
import * as ImagePicker from "expo-image-picker";
import { mapAnalysisToSavePayload } from "@/lib/api-client";
import { MealAnalysisResponse } from "@calorie-ai-app/auth/schemas";
import { MealRecord } from "@/types";

export interface PermissionAlert {
  title: string;
  description: string;
}

export function useScanFlow() {
  const [flash, setFlash] = useState<FlashMode>("off");
  const [isTakingPicture, setIsTakingPicture] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);
  const [hasSavedCurrentAnalysis, setHasSavedCurrentAnalysis] = useState(false);
  const [permissionAlert, setPermissionAlert] =
    useState<PermissionAlert | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();
  const { toast } = useToast();

  const analyzeMutation = useAnalyzeMeal();
  const saveMealMutation = useSaveMeal();

  const resetScanFlow = useCallback(() => {
    setShowResults(false);
    setCapturedImageUri(null);
    setHasSavedCurrentAnalysis(false);
    analyzeMutation.reset();
  }, [analyzeMutation]);

  const toggleFlash = useCallback(() => {
    setFlash((current) => (current === "off" ? "on" : "off"));
  }, []);

  const handleImageReady = useCallback((uri: string) => {
    setCapturedImageUri(uri);
    setHasSavedCurrentAnalysis(false);
  }, []);

  const dismissPermissionAlert = useCallback(() => {
    setPermissionAlert(null);
  }, []);

  const takePicture = useCallback(async () => {
    if (!cameraRef.current || isTakingPicture) return;
    setIsTakingPicture(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });
      if (photo?.uri) {
        handleImageReady(photo.uri);
      }
    } catch (error) {
      console.error("Failed to take picture:", error);
    } finally {
      setIsTakingPicture(false);
    }
  }, [isTakingPicture, handleImageReady]);

  const pickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      setPermissionAlert({
        title: "Permission needed",
        description: "Please grant gallery access to pick an image.",
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      handleImageReady(result.assets[0].uri);
    }
  }, [handleImageReady]);

  const navigateToMeal = useCallback(
    (mealId: string) => {
      resetScanFlow();
      router.push({
        pathname: "/meal/[id]",
        params: { id: mealId, source: "result" },
      });
    },
    [resetScanFlow, router],
  );

  const handleAnalyze = useCallback(() => {
    if (!capturedImageUri) return;

    setHasSavedCurrentAnalysis(false);

    analyzeMutation.mutate(
      { imageUri: capturedImageUri },
      {
        onSuccess: (data) => {
          const savePayload = mapAnalysisToSavePayload(
            data.analysis as unknown as MealAnalysisResponse,
            capturedImageUri,
          );

          saveMealMutation.mutate(savePayload, {
            onSuccess: (result: { success: boolean; meal: MealRecord }) => {
              setHasSavedCurrentAnalysis(true);
              navigateToMeal(result.meal.id);
            },
            onError: () => {
              setShowResults(true);
              toast.show({
                variant: "danger",
                label: "Could not save meal",
                description:
                  "Analysis worked, but storing it failed. You can retry from the sheet.",
                actionLabel: "Dismiss",
                onActionPress: ({ hide }) => hide(),
              });
            },
          });
        },
        onError: (error) => {
          console.error("[useScanFlow] Analysis failed:", error);
          setCapturedImageUri(null);
          setHasSavedCurrentAnalysis(false);
          toast.show({
            variant: "danger",
            label: "Analysis failed",
            description:
              "We couldn't analyze that image. Please try again with a clearer photo.",
            actionLabel: "Dismiss",
            onActionPress: ({ hide }) => hide(),
          });
        },
      },
    );
  }, [
    capturedImageUri,
    analyzeMutation,
    saveMealMutation,
    navigateToMeal,
    toast,
  ]);

  const handleRetake = useCallback(() => {
    setCapturedImageUri(null);
    setHasSavedCurrentAnalysis(false);
    analyzeMutation.reset();
  }, [analyzeMutation]);

  const handleSaveToDiary = useCallback(() => {
    const analysis = analyzeMutation.data?.analysis;
    if (!analysis || hasSavedCurrentAnalysis) return;

    saveMealMutation.mutate(
      mapAnalysisToSavePayload(
        analysis as unknown as MealAnalysisResponse,
        capturedImageUri ?? undefined,
      ),
      {
        onSuccess: (result: { success: boolean; meal: MealRecord }) => {
          setHasSavedCurrentAnalysis(true);
          navigateToMeal(result.meal.id);
        },
        onError: () => {
          toast.show({
            variant: "danger",
            label: "Save failed",
            description: "Please check the server logs and try saving again.",
            actionLabel: "Dismiss",
            onActionPress: ({ hide }) => hide(),
          });
        },
      },
    );
  }, [
    analyzeMutation,
    capturedImageUri,
    hasSavedCurrentAnalysis,
    saveMealMutation,
    navigateToMeal,
    toast,
  ]);

  const handleResultsOpenChange = useCallback(
    (open: boolean) => {
      setShowResults(open);
      if (!open) {
        setCapturedImageUri(null);
        setHasSavedCurrentAnalysis(false);
        analyzeMutation.reset();
      }
    },
    [analyzeMutation],
  );

  return {
    cameraRef,
    flash,
    isTakingPicture,
    isAnalyzing: analyzeMutation.isPending,
    showResults,
    capturedImageUri,
    hasSavedCurrentAnalysis,
    analysisData: analyzeMutation.data?.analysis
      ? (analyzeMutation.data.analysis as unknown as MealAnalysisResponse)
      : null,
    isSaving: saveMealMutation.isPending,
    toggleFlash,
    takePicture,
    pickImage,
    handleAnalyze,
    handleRetake,
    handleSaveToDiary,
    handleResultsOpenChange,
    resetScanFlow,
  };
}