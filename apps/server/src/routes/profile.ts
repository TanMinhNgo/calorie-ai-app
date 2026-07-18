import { Hono } from "hono";
import { profileSchema } from "@calorie-ai-app/auth/schemas";
import { requireAuth, type AuthEnv } from "@/middleware/require-auth";
import { getUserProfile, upsertUserProfile } from "@/services/profile";

const profileRouter = new Hono<AuthEnv>()
  .post("/user/profile", requireAuth, async (c) => {
    const parsed = profileSchema.safeParse(await c.req.json());

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Invalid input";
      return c.json({ error: firstError }, 400);
    }

    await upsertUserProfile(c.get("user").id, parsed.data);
    return c.json({ success: true });
  })
  .get("/user/profile", requireAuth, async (c) => {
    const profile = await getUserProfile(c.get("user").id);
    return c.json({ profile });
  });

export default profileRouter;