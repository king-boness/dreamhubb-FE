import { api } from "boot/axios";
import type {
  ClaimEarnTaskResponse,
  EarnTasksResponse
} from "src/types/earnTasks";

export async function fetchEarnTasks(): Promise<EarnTasksResponse> {
  const { data } = await api.get<EarnTasksResponse>("/me/earn-tasks");

  if (data?.status !== "success") {
    throw new Error("Failed to load earn tasks.");
  }

  return data;
}

export async function claimEarnTask(taskKey: string): Promise<ClaimEarnTaskResponse> {
  const { data } = await api.post<ClaimEarnTaskResponse>(
    `/me/earn-tasks/${encodeURIComponent(taskKey)}/claim`
  );

  if (data?.status !== "success") {
    throw new Error("Failed to claim earn task.");
  }

  return data;
}
