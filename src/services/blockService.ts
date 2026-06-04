import { api } from "boot/axios";

export interface BlockedUserSummary {
  id: number;
  username?: string;
  profile_picture?: string | null;
  blocked_at?: string;
}

export async function fetchBlockedUsers(): Promise<BlockedUserSummary[]> {
  const { data } = await api.get<{ status: string; blocked_users: BlockedUserSummary[] }>(
    "/me/blocked-users"
  );

  if (data?.status !== "success") {
    throw new Error("Failed to load blocked users.");
  }

  return data.blocked_users ?? [];
}

export async function blockUser(userId: number): Promise<void> {
  const { data } = await api.post<{ status: string }>(`/users/${userId}/block`);

  if (data?.status !== "success") {
    throw new Error("Failed to block user.");
  }
}

export async function unblockUser(userId: number): Promise<void> {
  const { data } = await api.delete<{ status: string }>(`/users/${userId}/block`);

  if (data?.status !== "success") {
    throw new Error("Failed to unblock user.");
  }
}
