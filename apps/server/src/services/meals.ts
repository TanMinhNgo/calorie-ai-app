import type { saveMealSchema } from "@calorie-ai-app/auth/schemas";
import { db } from "@calorie-ai-app/db";
import { and, desc, eq, gte, lt } from "@calorie-ai-app/db/drizzle";
import { meal } from "@calorie-ai-app/db/schema/meals";
import type { z } from "zod";

export type MealRow = typeof meal.$inferSelect;
export type SaveMealInput = z.infer<typeof saveMealSchema>;

export type DailySummary = {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  meal_count: number;
};

const EMPTY_SUMMARY: DailySummary = {
  calories: 0,
  protein_g: 0,
  carbs_g: 0,
  fat_g: 0,
  meal_count: 0,
};

export function dailySummary(meals: MealRow[]): DailySummary {
  return meals.reduce<DailySummary>((acc, m) => {
    const n = m.nutrition;
    return {
      calories: acc.calories + (n?.calories ?? 0),
      protein_g: acc.protein_g + (n?.protein_g ?? 0),
      carbs_g: acc.carbs_g + (n?.carbs_g ?? 0),
      fat_g: acc.fat_g + (n?.fat_g ?? 0),
      meal_count: acc.meal_count + 1,
    };
  }, EMPTY_SUMMARY);
}

export async function createMeal(
  userId: string,
  data: SaveMealInput,
): Promise<MealRow> {
  const id = crypto.randomUUID();

  await db.insert(meal).values({
    id,
    userId,
    foodItems: data.food_items,
    nutrition: data.nutrition,
    portionEstimate: data.portion_estimate,
    dietaryTags: data.dietary_tags,
    healthNotes: data.health_notes,
    mealType: data.meal_type,
    imageUrl: data.image_url ?? null,
  });

  const [saved] = await db.select().from(meal).where(eq(meal.id, id)).limit(1);

  if (!saved) {
    throw new Error("Meal was saved but could not be reloaded");
  }

  return saved;
}

export async function getMealsForDate(
  userId: string,
  date: string,
): Promise<MealRow[]> {
  const startOfDay = new Date(`${date}T00:00:00.000Z`);
  const endOfDay = new Date(`${date}T23:59:59.999Z`);

  return db
    .select()
    .from(meal)
    .where(
      and(
        eq(meal.userId, userId),
        gte(meal.createdAt, startOfDay),
        lt(meal.createdAt, endOfDay),
      ),
    )
    .orderBy(desc(meal.createdAt));
}

export async function getMealById(
  userId: string,
  id: string,
): Promise<MealRow | null> {
  const [savedMeal] = await db
    .select()
    .from(meal)
    .where(and(eq(meal.id, id), eq(meal.userId, userId)))
    .limit(1);

  return savedMeal ?? null;
}