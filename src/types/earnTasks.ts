export type EarnTaskStatus = "locked" | "in_progress" | "claimable" | "claimed";

export interface EarnTaskProgress {
  current: number;
  target: number;
}

export interface EarnTask {
  key: string;
  title: string;
  description: string;
  reward_tokens: number;
  status: EarnTaskStatus;
  progress: EarnTaskProgress;
  claimed_at: string | null;
}

export interface EarnTasksResponse {
  status: "success";
  balance: number;
  tasks: EarnTask[];
}

export interface ClaimEarnTaskResponse {
  status: "success";
  balance: number;
  task: EarnTask;
}

export interface EarnTaskErrorResponse {
  status: "error";
  code?: string;
  message?: string;
}
