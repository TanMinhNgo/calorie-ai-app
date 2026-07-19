import { useQuery } from "@tanstack/react-query";

import { authClient } from "@/lib/auth-client";
import { getWeeklyInsights } from "@/lib/api-client";

export function useWeeklyInsights() {
  const { data: session } = authClient.useSession();

  return useQuery({
    queryKey: ["insights", "weekly"],
    queryFn: getWeeklyInsights,
    enabled: !!session?.user,
  });
}