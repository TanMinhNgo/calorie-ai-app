import { auth } from "@calorie-ai-app/auth";
import { Hono } from "hono";

const authRoutes = new Hono();

authRoutes.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

export default authRoutes;