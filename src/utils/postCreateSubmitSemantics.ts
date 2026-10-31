/**
 * Pure helpers for create-post toast / navigation semantics (regression for dual toast bug).
 */

export type CreateSubmitOutcome =
  | { kind: "api_failure"; showSuccess: false; showError: true; clearForm: false; navigate: false; refreshFeeds: false }
  | { kind: "create_success"; showSuccess: true; showError: false; clearForm: true; navigate: true; refreshFeeds: "best_effort" }
  | {
      kind: "create_success_refresh_failed";
      showSuccess: true;
      showError: false;
      clearForm: true;
      navigate: true;
      refreshFeeds: "best_effort";
      treatRefreshFailureAsCreateFailure: false;
    };

export function outcomeForCreateResult(
  result: { post_id?: number } | null | undefined
): Extract<CreateSubmitOutcome, { kind: "api_failure" | "create_success" }> {
  if (!result?.post_id) {
    return {
      kind: "api_failure",
      showSuccess: false,
      showError: true,
      clearForm: false,
      navigate: false,
      refreshFeeds: false
    };
  }
  return {
    kind: "create_success",
    showSuccess: true,
    showError: false,
    clearForm: true,
    navigate: true,
    refreshFeeds: "best_effort"
  };
}

export function outcomeWhenRefreshFailsAfterCreate(): Extract<
  CreateSubmitOutcome,
  { kind: "create_success_refresh_failed" }
> {
  return {
    kind: "create_success_refresh_failed",
    showSuccess: true,
    showError: false,
    clearForm: true,
    navigate: true,
    refreshFeeds: "best_effort",
    treatRefreshFailureAsCreateFailure: false
  };
}
