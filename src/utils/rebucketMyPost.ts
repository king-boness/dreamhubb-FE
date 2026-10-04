import type { CategorySlug } from "src/domain/categories";
import { isCategorySlug } from "src/domain/categories";

export type MyPostBucket = "myDreams" | "myProblems" | "myIdeas";

export type MyPostsLists<T extends { post_id?: number; id?: number }> = {
  myDreams: T[];
  myProblems: T[];
  myIdeas: T[];
};

function postIdOf(post: { post_id?: number; id?: number }): number | null {
  const id = post.post_id ?? post.id;
  return typeof id === "number" ? id : null;
}

function removeFromList<T extends { post_id?: number; id?: number }>(
  list: T[],
  postId: number
): T[] {
  return list.filter((p) => postIdOf(p) !== postId);
}

/**
 * Map Dream/Problem/Idea slug → donee wall bucket.
 */
export function categorySlugToMyBucket(slug: string | null | undefined): MyPostBucket {
  if (slug && isCategorySlug(slug)) {
    if (slug === "problem") return "myProblems";
    if (slug === "idea") return "myIdeas";
  }
  return "myDreams";
}

/**
 * Move a post into the correct Dreams/Problems/Ideas list after type change.
 * Removes from all three buckets, then inserts into the target bucket.
 */
export function rebucketMyPost<T extends { post_id?: number; id?: number; category?: { slug?: string } | null; type?: string | null }>(
  lists: MyPostsLists<T>,
  post: T
): MyPostsLists<T> {
  const postId = postIdOf(post);
  if (postId === null) {
    return lists;
  }

  const next: MyPostsLists<T> = {
    myDreams: removeFromList(lists.myDreams, postId),
    myProblems: removeFromList(lists.myProblems, postId),
    myIdeas: removeFromList(lists.myIdeas, postId)
  };

  const slug = (post.category?.slug || post.type || null) as CategorySlug | string | null;
  const bucket = categorySlugToMyBucket(slug);
  next[bucket] = [...next[bucket], post];
  return next;
}
