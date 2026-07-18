import { mealAnalysisRequestSchema } from "@calorie-ai-app/auth/schemas";
import { Hono } from "hono";
import { requireAuth, type AuthEnv } from "../middleware/require-auth";
import { analyzeMealImage } from "../services/ai";

const analyzeRouter = new Hono<AuthEnv>().post(
  "/meal",
  requireAuth,
  async (c) => {
    const parsed = mealAnalysisRequestSchema.safeParse(await c.req.json());

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Invalid input";
      console.log("[analyze/meal] Validation failed:", firstError);
      return c.json({ error: firstError }, 400);
    }

    const { image_base64, media_type } = parsed.data;
    const apiKey =
      c.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    try {
      const analysis = await analyzeMealImage(image_base64, media_type, apiKey);
      console.log(
        "[analyze/meal] AI analysis result:",
        JSON.stringify(analysis, null, 2),
      );

      return c.json({
        success: true,
        analysis: {
          ...analysis,
          metadata: {
            user_id: c.get("user").id,
            timestamp: new Date().toISOString(),
            meal_type: analysis.meal_type,
          },
        },
      });
    } catch (error) {
      console.error("[analyze/meal] AI analysis failed:", error);
      return c.json(
        { error: "Failed to analyze meal. Please try again." },
        500,
      );
    }
  },
);

export default analyzeRouter;