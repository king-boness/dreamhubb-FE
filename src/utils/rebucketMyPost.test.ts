import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { categorySlugToMyBucket, rebucketMyPost } from "./rebucketMyPost";

describe("rebucketMyPost", () => {
  const dreamPost = {
    post_id: 13,
    title: "Dream post",
    category: { slug: "dream" as const }
  };
  const problemPost = {
    post_id: 13,
    title: "Dream post",
    category: { slug: "problem" as const }
  };
  const ideaPost = {
    post_id: 13,
    title: "Dream post",
    category: { slug: "idea" as const }
  };

  it("maps category slugs to donee wall buckets", () => {
    assert.equal(categorySlugToMyBucket("dream"), "myDreams");
    assert.equal(categorySlugToMyBucket("problem"), "myProblems");
    assert.equal(categorySlugToMyBucket("idea"), "myIdeas");
  });

  it("moves Dream → Problem between wall sections", () => {
    const next = rebucketMyPost(
      {
        myDreams: [dreamPost],
        myProblems: [],
        myIdeas: []
      },
      problemPost
    );

    assert.deepEqual(next.myDreams, []);
    assert.deepEqual(next.myProblems, [problemPost]);
    assert.deepEqual(next.myIdeas, []);
  });

  it("moves Problem → Idea between wall sections", () => {
    const next = rebucketMyPost(
      {
        myDreams: [],
        myProblems: [{ ...problemPost }],
        myIdeas: []
      },
      ideaPost
    );

    assert.deepEqual(next.myProblems, []);
    assert.deepEqual(next.myIdeas, [ideaPost]);
    assert.deepEqual(next.myDreams, []);
  });

  it("moves Idea → Dream between wall sections", () => {
    const next = rebucketMyPost(
      {
        myDreams: [],
        myProblems: [],
        myIdeas: [{ ...ideaPost }]
      },
      dreamPost
    );

    assert.deepEqual(next.myIdeas, []);
    assert.deepEqual(next.myDreams, [dreamPost]);
    assert.deepEqual(next.myProblems, []);
  });

  it("keeps unrelated posts in their buckets", () => {
    const other = { post_id: 99, title: "Other", category: { slug: "dream" as const } };
    const next = rebucketMyPost(
      {
        myDreams: [dreamPost, other],
        myProblems: [],
        myIdeas: []
      },
      problemPost
    );

    assert.deepEqual(next.myDreams, [other]);
    assert.deepEqual(next.myProblems, [problemPost]);
  });
});
