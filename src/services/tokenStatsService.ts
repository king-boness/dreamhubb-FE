import { api } from "boot/axios";
import type { TokenStatsResponse } from "src/types/tokenStats";

export async function fetchTokenStats(): Promise<TokenStatsResponse> {
  const { data } = await api.get<TokenStatsResponse>("/me/token-stats");

  if (data?.status !== "success") {
    throw new Error("Failed to load token stats.");
  }

  return data;
}
