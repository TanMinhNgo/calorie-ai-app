import AnalysisResultsSheet from "@/components/containers/meals/analysis-result-sheet";
import { CameraPermissionGate } from "@/components/containers/meals/camera-permission-gate";
import ImageReviewOverlay from "@/components/containers/meals/image-review-overlay";
import ScanAnalyzingOverlay from "@/components/containers/meals/scan-analyzing-overlay";
import ScanBottomControls from "@/components/containers/meals/scan-bottom-controls";
import ScanHeader from "@/components/containers/meals/scan-header";
import ScanFrameOverlay from "@/components/containers/meals/scan-overlay";
import { useScanFlow } from "@/hooks/use-scan-flow";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Scan = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    cameraRef,
    flash,
    isTakingPicture,
    isAnalyzing,
    showResults,
    capturedImageUri,
    hasSavedCurrentAnalysis,
    analysisData,
    isSaving,
    toggleFlash,
    takePicture,
    pickImage,
    handleAnalyze,
    handleRetake,
    handleSaveToDiary,
    handleResultsOpenChange,
  } = useScanFlow();

  if (!permission || !permission.granted) {
    return (
      <CameraPermissionGate
        isLoading={!permission}
        isGranted={permission?.granted ?? false}
        onRequestPermission={requestPermission}
      />
    );
  }

  if (capturedImageUri && !isAnalyzing && !showResults) {
    return (
      <View className="flex-1 bg-background">
        <ImageReviewOverlay
          imageUri={capturedImageUri}
          isAnalyzing={false}
          onAnalyze={handleAnalyze}
          onRetake={handleRetake}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        flash={flash}
        mode="picture"
        active={true}
      />

      <ScanHeader topInset={insets.top} onClose={() => router.back()} />

      <ScanFrameOverlay />

      <ScanBottomControls
        isTakingPicture={isTakingPicture || isAnalyzing}
        onTakePicture={takePicture}
        onPickImage={pickImage}
        flash={flash}
        onToggleFlash={toggleFlash}
      />

      <ScanAnalyzingOverlay visible={isAnalyzing} />

      <AnalysisResultsSheet
        isOpen={showResults}
        onOpenChange={handleResultsOpenChange}
        analysis={analysisData}
        isSaving={isSaving}
        isSaved={hasSavedCurrentAnalysis}
        onSave={handleSaveToDiary}
      />
    </View>
  );
};

export default Scan;