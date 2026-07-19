import { useMutation } from "@tanstack/react-query";
import { analyzeMeal, uriToBase64 } from "@/lib/api-client";

export function useAnalyzeMeal() {
  return useMutation({
    mutationFn: async (data: { imageUri: string }) => {
      console.log("[useAnalyzeMeal] 1. Starting image conversion...", { imageUri: data.imageUri });
      const imageBase64 = await uriToBase64(data.imageUri);
      console.log("[useAnalyzeMeal] 2. Image converted to base64", {
        base64Length: imageBase64.length,
        preview: imageBase64.substring(0, 50) + "...",
      });
      console.log("[useAnalyzeMeal] 3. Sending to server...");
      const result = await analyzeMeal({
        image_base64: imageBase64,
        media_type: "image/jpeg",
      });
      console.log("[useAnalyzeMeal] 4. Server response received:", JSON.stringify(result, null, 2));
      return result;
    },
  });
}