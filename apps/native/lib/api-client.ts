import { env } from "@calorie-ai-app/env/native";
import { authClient } from "./auth-client";
import Constants from "expo-constants";
import { MealAnalysisResponse, SaveMealRequest } from "@calorie-ai-app/auth/schemas";
import { MealAnalysisResult, MealRecord, TodayMealsResponse, WeeklyInsightsResponse } from "@/types";
import { File } from "expo-file-system";

function getAuthHeaders(): Record<string, string> {
  const cookies = authClient.getCookie();
  const scheme = Constants.expoConfig?.scheme as string;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "expo-origin": `${scheme}://`,
  };

  if (cookies) {
    headers["cookie"] = cookies;
  }

  return headers;
}

function extractErrorMessage(body: unknown, status: number): string {
  return body &&
    typeof body === "object" &&
    "error" in body &&
    typeof (body as Record<string, unknown>).error === "string"
    ? ((body as Record<string, unknown>).error as string)
    : `Request failed (${status})`;
}

export async function getProfile() {
  const headers = getAuthHeaders();

  const response = await fetch(
    `${env.EXPO_PUBLIC_SERVER_URL}/api/user/profile`,
    {
      method: "GET",
      headers,
    },
  );

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(extractErrorMessage(body, response.status));
  }

  return response.json() as Promise<{
    profile: Record<string, unknown> | null;
  }>;
}

export async function saveProfile(data: {
  age: number;
  height: number;
  weight: number;
  goal: string;
}) {
  const headers = getAuthHeaders();

  const response = await fetch(
    `${env.EXPO_PUBLIC_SERVER_URL}/api/user/profile`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(extractErrorMessage(body, response.status));
  }

  return response.json();
}

export async function saveMeal(data: SaveMealRequest) {
  const headers = getAuthHeaders();

  const response = await fetch(`${env.EXPO_PUBLIC_SERVER_URL}/api/meals`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(extractErrorMessage(body, response.status));
  }

  return response.json() as Promise<{ success: boolean; meal: MealRecord }>;
}

export async function getTodayMeals(date: string) {
  const headers = getAuthHeaders();

  const response = await fetch(
    `${env.EXPO_PUBLIC_SERVER_URL}/api/meals/today?date=${date}`,
    { method: "GET", headers },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch today's meals");
  }

  return response.json() as Promise<TodayMealsResponse>;
}

export async function getMealsByDate(date: string) {
  const headers = getAuthHeaders();

  const response = await fetch(
    `${env.EXPO_PUBLIC_SERVER_URL}/api/meals?date=${date}`,
    { method: "GET", headers },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch meals");
  }

  return response.json() as Promise<{ meals: MealRecord[] }>;
}

export async function getMealById(id: string) {
  const headers = getAuthHeaders();

  const response = await fetch(
    `${env.EXPO_PUBLIC_SERVER_URL}/api/meals/${id}`,
    {
      method: "GET",
      headers,
    },
  );

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(extractErrorMessage(body, response.status));
  }

  return response.json() as Promise<{ meal: MealRecord }>;
}

export async function getWeeklyInsights() {
  const headers = getAuthHeaders();

  const response = await fetch(
    `${env.EXPO_PUBLIC_SERVER_URL}/api/insights/weekly`,
    { method: "GET", headers },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch weekly insights");
  }

  return response.json() as Promise<WeeklyInsightsResponse>;
}

export async function uriToBase64(uri: string): Promise<string> {
  try {
    const file = new File(uri);
    return await file.base64();
  } catch (error) {
    console.error("[uriToBase64] Failed to read file:", { uri, error });
    throw error;
  }
}

export async function analyzeMeal(data: {
  image_base64: string;
  media_type: string;
}) {
  const headers = getAuthHeaders();

  const response = await fetch(
    `${env.EXPO_PUBLIC_SERVER_URL}/api/analyze/meal`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(extractErrorMessage(body, response.status));
  }

  return response.json() as Promise<MealAnalysisResult>;
}

export function mapAnalysisToSavePayload(
  analysis: MealAnalysisResponse,
  imageUrl?: string,
): SaveMealRequest {
  return {
    food_items: analysis.food_items,
    nutrition: analysis.nutrition,
    portion_estimate: analysis.portion_estimate,
    dietary_tags: analysis.dietary_tags,
    health_notes: analysis.health_notes,
    meal_type: analysis.meal_type,
    image_url: imageUrl,
  };
}