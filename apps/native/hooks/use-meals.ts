import {
  getMealById,
  getMealsByDate,
  getTodayMeals,
  saveMeal,
} from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";
import { SaveMealRequest } from "@calorie-ai-app/auth/schemas";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useSaveMeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SaveMealRequest) => saveMeal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meals"] });
    },
  });
}

export function useTodayMeals() {
  const { data: session } = authClient.useSession();

  const today = new Date().toISOString().split("T")[0];

  return useQuery({
    queryKey: ["meals", "today"],
    queryFn: () => getTodayMeals(today),
    enabled: !!session?.user,
  });
}

export function useMealsByDate(date: string) {
  const { data: session } = authClient.useSession();

  return useQuery({
    queryKey: ["meals", "byDate", date],
    queryFn: () => getMealsByDate(date),
    enabled: !!session?.user && !!date,
  });
}

export function useMeal(id?: string) {
  const { data: session } = authClient.useSession();

  return useQuery({
    queryKey: ["meals", "detail", id],
    queryFn: async () => {
      const result = await getMealById(id as string);
      return result.meal;
    },
    enabled: !!session?.user && !!id,
  });
}