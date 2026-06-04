export type ShareableType = "post" | "profile" | "inspiration";
export type ShareChannel =
  | "native"
  | "copy"
  | "facebook"
  | "whatsapp"
  | "instagram"
  | "tiktok"
  | "unknown";
export type ShareEventType = "intent" | "completed" | "copied";

export interface CreateSharePayload {
  shareable_type: ShareableType;
  shareable_id?: string | number | null;
  channel?: ShareChannel | string | null;
  metadata?: Record<string, unknown>;
}

export interface TrackedShare {
  token: string;
  shareable_type: ShareableType;
  shareable_id: string | null;
  share_url: string;
}

export interface CreateShareResponse {
  status: "success";
  share: TrackedShare;
}

export interface RecordShareEventPayload {
  share_token: string;
  event_type: ShareEventType;
  channel?: ShareChannel | string | null;
  metadata?: Record<string, unknown>;
}

export interface RecordShareEventResponse {
  status: "success";
  share: {
    shareable_type: ShareableType;
    shareable_id: string | null;
  };
}

export interface RecordShareVisitResponse {
  status: "success";
  deduped: boolean;
  self_visit?: boolean;
  share: {
    shareable_type: ShareableType;
    shareable_id: string | null;
  };
}
