import { requireAuth, type AuthEnv } from "@/middleware/require-auth";
import {
  createMeal,
  dailySummary,
  getMealById,
  getMealsForDate,
} from "@/services/meals";
import { saveMealSchema } from "@calorie-ai-app/auth/schemas";
import { Hono } from "hono";

const mealRouter = new Hono<AuthEnv>()
  .post("/", requireAuth, async (c) => {
    const parsed = saveMealSchema.safeParse(await c.req.json());

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Invalid input";
      return c.json({ error: firstError }, 400);
    }

    try {
      const saved = await createMeal(c.get("user").id, parsed.data);
      return c.json({ success: true, meal: saved });
    } catch (error) {
      return c.json({ error: (error as Error).message }, 500);
    }
  })
  .get("/today", requireAuth, async (c) => {
    const date = c.req.query("date") ?? new Date().toISOString().split("T")[0]!;
    const meals = await getMealsForDate(c.get("user").id, date);
    return c.json({ summary: dailySummary(meals), meals });
  })
  .get("/", requireAuth, async (c) => {
    const date = c.req.query("date");

    if (!date) {
      return c.json(
        { error: "Date query parameter is required (YYYY-MM-DD)" },
        400,
      );
    }

    const meals = await getMealsForDate(c.get("user").id, date);
    return c.json({ meals });
  })
  .get("/:id", requireAuth, async (c) => {
    const id = c.req.param("id");
    const savedMeal = await getMealById(c.get("user").id, id);

    if (!savedMeal) {
      return c.json({ error: "Meal not found" }, 404);
    }

    return c.json({ meal: savedMeal });
  });

export default mealRouter;