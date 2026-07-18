import { createGoogleGenerativeAI, google } from "@ai-sdk/google";
import { mealAnalysisResponseSchema } from "@calorie-ai-app/auth/schemas";
import { generateText, Output } from "ai";

const ANALYSIS_PROMPT = `You are a Food Recognition and Nutrition Analysis Agent for Calorie AI.
Your task is to analyze a food image and return structured JSON data.

OUTPUT:
Return a JSON object with the following fields:
{
  "food_items": [
    {"name": "<string>", "confidence": <float 0-1>}
  ],
  "nutrition": {
    "calories": <number>,
    "protein_g": <number>,
    "carbs_g": <number>,
    "fat_g": <number>
  },
  "portion_estimate": "<string>",
  "dietary_tags": ["<string>"],
  "health_notes": "<string>",
  "meal_type": "<breakfast|lunch|dinner|snack|unknown>"
}

RULES:
- Always identify multiple food items if present.
- Include confidence scores for recognition.
- Provide approximate nutrition values (calories, macros).
- Suggest portion size in human-readable terms (e.g., "1 cup rice, 150g chicken").
- Add dietary tags (vegetarian, vegan, halal, gluten-free, etc.).
- Add a short health note (e.g., "High in carbs, moderate protein").
- If uncertain, return best guess with lower confidence.
- Do not include extra commentary outside JSON.`;

export async function analyzeMealImage(
  imageBase64: string,
  mediaType: string,
  apiKey?: string,
) {
  console.log("[ai] 1. Starting AI analysis:", {
    mediaType,
    base64Length: imageBase64.length,
  });

  try {
    const googleProvider = apiKey
      ? createGoogleGenerativeAI({ apiKey })
      : google;

    const result = await generateText({
      model: googleProvider("gemini-2.5-flash"),
      output: Output.object({
        schema: mealAnalysisResponseSchema,
      }),
      providerOptions: {
        google: {
          structuredOutputs: false,
        },
      },
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: ANALYSIS_PROMPT },
            {
              type: "image",
              image: imageBase64,
              mediaType: mediaType,
            },
          ],
        },
      ],
    });

    console.log("[ai] 2. AI response received:", {
      hasOutput: !!result.output,
      outputKeys: result.output ? Object.keys(result.output) : [],
    });
    console.log("[ai] 3. Full output:", JSON.stringify(result.output, null, 2));

    return result.output;
  } catch (error) {
    console.error("[ai] AI call failed:", error);
    throw error;
  }
}