/**
 * Inspirations feed – loads from Laravel API (GET /inspirations/feed, POST /inspirations).
 */
import type { Inspiration } from "src/components/models";
import { api } from "src/boot/axios";
import { resolveProfileImageSrc } from "src/utils/avatar";

const DEFAULT_AVATAR = "/images/Auth/profilePicture.jpeg";

export type InspirationStorySlide = {
  id: number;
  image: string;
  duration?: number;
};

export type InspirationStory = {
  id: number;
  label: string;
  userProfileImage: string;
  seen: boolean;
  slides: InspirationStorySlide[];
};

function resolveMediaUrl(raw: unknown): string {
  const resolved = resolveProfileImageSrc(raw);
  return resolved ?? "";
}

function normalizeApiRow(row: Record<string, unknown>, index: number): Inspiration | null {
  const user = row.user as Record<string, unknown> | undefined;
  const info = row.inspirationInfo as Record<string, unknown> | undefined;
  if (!user || !info) return null;

  const id = String(row.id ?? row.uuid ?? `api-${index}`);
  const picRaw = user.userPicture ?? user.picture ?? user.profile_picture ?? "";
  const pic = resolveMediaUrl(picRaw) || DEFAULT_AVATAR;
  const name = String(user.userName ?? user.name ?? user.username ?? "User");
  const uid = user.userId ?? user.id;
  const imageRaw = info.inspirationImage ?? info.image ?? "";
  const image = resolveMediaUrl(imageRaw);

  return {
    id,
    user: {
      userName: name,
      userPicture: pic,
      userId: typeof uid === "number" ? uid : uid != null ? Number(uid) : undefined
    },
    description: String(row.description ?? ""),
    inspirationInfo: {
      dateCreated: String(info.dateCreated ?? info.created_at ?? ""),
      likes: Number(info.likes ?? 0),
      inspirationImage: image
    },
    linkedPostId:
      row.linkedPostId != null
        ? Number(row.linkedPostId)
        : row.post_id != null
          ? Number(row.post_id)
          : null
  };
}

function extractFeedRows(payload: unknown): Record<string, unknown>[] {
  if (!payload || typeof payload !== "object") return [];
  const root = payload as Record<string, unknown>;
  const rows =
    (Array.isArray(root.data) ? root.data : null) ??
    (Array.isArray(root.inspirations) ? root.inspirations : null) ??
    (Array.isArray(root.items) ? root.items : null);
  if (!Array.isArray(rows)) return [];

  return rows.filter((r) => r && typeof r === "object") as Record<string, unknown>[];
}

function normalizeFeedRows(rows: Record<string, unknown>[]): Inspiration[] {
  const out: Inspiration[] = [];
  rows.forEach((r, i) => {
    const n = normalizeApiRow(r, i);
    if (n) out.push(n);
  });
  return out;
}

export async function fetchInspirationsFromApi(): Promise<Inspiration[]> {
  const { data } = await api.get<unknown>("/inspirations/feed");
  return normalizeFeedRows(extractFeedRows(data));
}

export async function createInspirationOnApi(
  description: string,
  imageUrl: string
): Promise<Inspiration> {
  const { data } = await api.post<unknown>("/inspirations", {
    description: description.trim() || null,
    image: imageUrl
  });
  const payload = data as Record<string, unknown>;
  const row = payload.data ?? payload.inspiration;
  if (!row || typeof row !== "object") {
    throw new Error("Invalid inspiration response");
  }
  const normalized = normalizeApiRow(row as Record<string, unknown>, 0);
  if (!normalized) {
    throw new Error("Invalid inspiration response");
  }
  return normalized;
}

export function buildStoriesFromInspirations(
  inspirations: Inspiration[],
  myAvatar: string,
  myLabel: string
): { myStory: InspirationStory[]; stories: InspirationStory[] } {
  const myStory: InspirationStory[] = [
    {
      id: 0,
      label: myLabel,
      userProfileImage: myAvatar,
      seen: false,
      slides: []
    }
  ];

  const byKey = new Map<string, Inspiration[]>();
  for (const it of inspirations) {
    const key = it.user.userId != null ? `u:${it.user.userId}` : `n:${it.user.userName}`;
    let bucket = byKey.get(key);
    if (!bucket) {
      bucket = [];
      byKey.set(key, bucket);
    }
    bucket.push(it);
  }

  let sid = 1;
  const stories: InspirationStory[] = [];
  for (const list of byKey.values()) {
    const first = list[0];
    const slides: InspirationStorySlide[] = list
      .filter((x) => x.inspirationInfo.inspirationImage)
      .map((x, idx) => ({
        id: sid * 100 + idx,
        image: x.inspirationInfo.inspirationImage
      }));
    if (slides.length === 0) continue;
    stories.push({
      id: sid++,
      label: first.user.userName,
      userProfileImage: first.user.userPicture,
      seen: false,
      slides
    });
  }

  return { myStory, stories };
}

export async function loadInspirationsFeedPayload(
  viewerAvatar = DEFAULT_AVATAR,
  viewerStoryLabel = "Your Story"
): Promise<{
  inspirations: Inspiration[];
  myStory: InspirationStory[];
  stories: InspirationStory[];
}> {
  const inspirations = await fetchInspirationsFromApi();
  const { myStory, stories } = buildStoriesFromInspirations(
    inspirations,
    viewerAvatar,
    viewerStoryLabel
  );
  return { inspirations, myStory, stories };
}
