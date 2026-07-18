import { db } from "@calorie-ai-app/db";
import { userProfile } from "@calorie-ai-app/db/schema/profile";
import type { ProfileFormValues } from "@calorie-ai-app/auth/schemas";
import { eq } from "@calorie-ai-app/db/drizzle";

export type UserProfile = typeof userProfile.$inferSelect;

export async function getUserProfile(
  userId: string,
): Promise<UserProfile | null> {
  const [profile] = await db
    .select()
    .from(userProfile)
    .where(eq(userProfile.userId, userId))
    .limit(1);

  return profile ?? null;
}

export async function upsertUserProfile(
  userId: string,
  data: ProfileFormValues,
): Promise<void> {
  const existing = await getUserProfile(userId);

  if (existing) {
    await db
      .update(userProfile)
      .set({
        age: data.age,
        height: data.height.toString(),
        weight: data.weight.toString(),
        goal: data.goal,
        updatedAt: new Date(),
      })
      .where(eq(userProfile.userId, userId));
    return;
  }

  await db.insert(userProfile).values({
    id: crypto.randomUUID(),
    userId,
    age: data.age,
    height: data.height.toString(),
    weight: data.weight.toString(),
    goal: data.goal,
  });
}