/**
 * Launch-safe inspirations feed abstraction.
 * Replace body of tryFetchFromApi() when backend ships; keep normalizeApiRow() aligned with API DTO.
 */
import type { Inspiration } from "src/components/models";
import { api } from "src/boot/axios";

export const LOCAL_INSPIRATIONS_STORAGE_KEY = "dreamhubb_donor_inspirations_local_v1";

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

function isApiEnabled(): boolean {
  const v = import.meta.env.VITE_INSPIRATIONS_FEED_API;
  return v === "1" || v === "true";
}

/** Seed items use only bundled /public assets (offline-safe). */
function seedInspirations(): Inspiration[] {
  return [
    {
      id: "seed-1",
      user: {
        userName: "Community",
        userPicture: "/images/Auth/profilePicture.jpeg",
        userId: undefined
      },
      description:
        "Small steps toward a goal still count. Share what moved you today — it might be exactly what someone else needed to read.",
      inspirationInfo: {
        dateCreated: "03/15/2024",
        likes: 128,
        inspirationImage: "/images/Auth/inspirationImg.jpg"
      },
      linkedPostId: null
    },
    {
      id: "seed-2",
      user: {
        userName: "Dreamhubb",
        userPicture: "/images/Auth/profilePicture.jpeg",
        userId: undefined
      },
      description:
        "Helping others reach their dreams builds a warmer community. Explore posts, leave encouragement, or send a token of support.",
      inspirationInfo: {
        dateCreated: "02/02/2024",
        likes: 256,
        inspirationImage: "/images/Auth/postBackground.png"
      },
      linkedPostId: null
    },
    {
      id: "seed-3",
      user: {
        userName: "Dreamhubb",
        userPicture: "/images/Auth/profilePicture.jpeg",
        userId: undefined
      },
      description:
        "Your story matters. Use “Add post” to add an image and a short note — it appears in your feed for this session (saved on device until the API is live).",
      inspirationInfo: {
        dateCreated: "01/20/2024",
        likes: 89,
        inspirationImage: "/images/Auth/inspirationImg.jpg"
      },
      linkedPostId: null
    }
  ];
}

export function readLocalInspirationsFromStorage(): Inspiration[] {
  try {
    const raw = localStorage.getItem(LOCAL_INSPIRATIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((row) => row && typeof row === "object" && typeof (row as Inspiration).id === "string") as Inspiration[];
  } catch {
    return [];
  }
}

export function writeLocalInspirationsToStorage(items: Inspiration[]): void {
  try {
    localStorage.setItem(LOCAL_INSPIRATIONS_STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore quota */
  }
}

function normalizeApiRow(row: Record<string, unknown>, index: number): Inspiration | null {
  const user = row.user as Record<string, unknown> | undefined;
  const info = row.inspirationInfo as Record<string, unknown> | undefined;
  if (!user || !info) return null;
  const id = String(row.id ?? row.uuid ?? `api-${index}`);
  const pic = String(user.userPicture ?? user.picture ?? "/images/Auth/profilePicture.jpeg");
  const name = String(user.userName ?? user.name ?? "User");
  const uid = user.userId ?? user.id;
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
      inspirationImage: String(info.inspirationImage ?? info.image ?? "/images/Auth/inspirationImg.jpg")
    },
    linkedPostId:
      row.linkedPostId != null
        ? Number(row.linkedPostId)
        : row.post_id != null
          ? Number(row.post_id)
          : null
  };
}

async function tryFetchFromApi(): Promise<Inspiration[] | null> {
  if (!isApiEnabled()) return null;
  try {
    const { data } = await api.get<unknown>("/inspirations/feed");
    const payload = data as Record<string, unknown>;
    const rows =
      (Array.isArray(payload.data) ? payload.data : null) ??
      (Array.isArray(payload.inspirations) ? payload.inspirations : null) ??
      (Array.isArray(payload.items) ? payload.items : null);
    if (!Array.isArray(rows)) return null;
    const out: Inspiration[] = [];
    rows.forEach((r, i) => {
      if (r && typeof r === "object") {
        const n = normalizeApiRow(r as Record<string, unknown>, i);
        if (n) out.push(n);
      }
    });
    return out.length ? out : null;
  } catch {
    return null;
  }
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

/**
 * Remote when VITE_INSPIRATIONS_FEED_API is true and GET /inspirations/feed succeeds;
 * otherwise launch-safe seed + merged local storage.
 */
export async function loadInspirationsFeedPayload(
  viewerAvatar = "/images/Auth/profilePicture.jpeg",
  viewerStoryLabel = "Your Story"
): Promise<{
  inspirations: Inspiration[];
  myStory: InspirationStory[];
  stories: InspirationStory[];
  source: "api" | "mock";
}> {
  const local = readLocalInspirationsFromStorage();
  const apiItems = await tryFetchFromApi();

  if (apiItems) {
    const merged = dedupeById([...local, ...apiItems]);
    const { myStory, stories } = buildStoriesFromInspirations(merged, viewerAvatar, viewerStoryLabel);
    return { inspirations: merged, myStory, stories, source: "api" };
  }

  const seed = seedInspirations();
  const merged = dedupeById([...local, ...seed]);
  const { myStory, stories } = buildStoriesFromInspirations(merged, viewerAvatar, viewerStoryLabel);
  return { inspirations: merged, myStory, stories, source: "mock" };
}

function dedupeById(items: Inspiration[]): Inspiration[] {
  const seen = new Set<string>();
  const out: Inspiration[] = [];
  for (const it of items) {
    if (seen.has(it.id)) continue;
    seen.add(it.id);
    out.push(it);
  }
  return out;
}
