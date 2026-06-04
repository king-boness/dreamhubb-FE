import { api } from "boot/axios";
import type {
  CreateSharePayload,
  CreateShareResponse,
  RecordShareEventPayload,
  RecordShareEventResponse,
  RecordShareVisitResponse
} from "src/types/shareTracking";

function normalizeShareableId(
  id: string | number | null | undefined
): string | undefined {
  if (id === null || id === undefined || id === "") {
    return undefined;
  }

  return String(id);
}

export async function createTrackedShare(
  payload: CreateSharePayload
): Promise<CreateShareResponse> {
  const shareableId = normalizeShareableId(payload.shareable_id);

  const { data } = await api.post<CreateShareResponse>("/me/shares", {
    shareable_type: payload.shareable_type,
    ...(shareableId !== undefined ? { shareable_id: shareableId } : {}),
    ...(payload.channel != null && payload.channel !== ""
      ? { channel: payload.channel }
      : {}),
    ...(payload.metadata ? { metadata: payload.metadata } : {})
  });

  if (data?.status !== "success") {
    throw new Error("Failed to create tracked share.");
  }

  return data;
}

export async function recordShareEvent(
  payload: RecordShareEventPayload
): Promise<RecordShareEventResponse> {
  const { data } = await api.post<RecordShareEventResponse>("/share-events", {
    share_token: payload.share_token,
    event_type: payload.event_type,
    ...(payload.channel != null && payload.channel !== ""
      ? { channel: payload.channel }
      : {}),
    ...(payload.metadata ? { metadata: payload.metadata } : {})
  });

  if (data?.status !== "success") {
    throw new Error("Failed to record share event.");
  }

  return data;
}

export async function recordShareVisit(
  shareToken: string
): Promise<RecordShareVisitResponse> {
  const { data } = await api.post<RecordShareVisitResponse>("/share/visit", {
    share_token: shareToken
  });

  if (data?.status !== "success") {
    throw new Error("Failed to record share visit.");
  }

  return data;
}
