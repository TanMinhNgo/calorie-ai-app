import type { Hono } from "hono";
import authRouter from "./auth";
import profileRouter from "./profile";
import mealRouter from "./meals";
import insightsRouter from "./insights";
import analyzeRouter from "./analyze";

export function registerRoutes(app: Hono) {
  app.route("/", authRouter);
  app.route("/api", profileRouter);
  app.route("/api/meals", mealRouter);
  app.route("/api/insights", insightsRouter);
  app.route("/api/analyze", analyzeRouter);
}