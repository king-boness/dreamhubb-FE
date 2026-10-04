import { api } from "boot/axios";

export type TranslationEntityType = "post" | "user";

export interface TranslationResponseData {
  source_language: string;
  target_language: string;
  fields: Record<string, string>;
  same_language: boolean;
  cached: boolean;
}

export interface TranslationResponse {
  status: string;
  data: TranslationResponseData;
}

const sessionCache = new Map<string, TranslationResponseData>();

function sessionKey(
  entityType: TranslationEntityType,
  entityId: number,
  targetLanguage: string,
  contentFingerprint: string
): string {
  return `${entityType}:${entityId}:${targetLanguage}:${contentFingerprint}`;
}

export function clearTranslationSessionCache(): void {
  sessionCache.clear();
}

export async function translateEntity(params: {
  entityType: TranslationEntityType;
  entityId: number;
  targetLanguage: string;
  contentFingerprint: string;
}): Promise<TranslationResponseData> {
  const key = sessionKey(
    params.entityType,
    params.entityId,
    params.targetLanguage,
    params.contentFingerprint
  );

  const existing = sessionCache.get(key);
  if (existing) {
    return existing;
  }

  const { data } = await api.post<TranslationResponse>("/translations", {
    entity_type: params.entityType,
    entity_id: params.entityId,
    target_language: params.targetLanguage
  });

  if (data?.status !== "success" || !data.data?.fields) {
    throw new Error("Translation failed");
  }

  sessionCache.set(key, data.data);
  return data.data;
}
