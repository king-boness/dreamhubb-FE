<template>
  <div class="openSharePage">
    <q-spinner-dots color="primary" size="48px" />
    <p class="openSharePage-text">Opening...</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { recordShareVisit } from "src/services/shareTrackingService";
import { markShareVisitRecorded } from "src/utils/shareVisitCapture";
import type { ShareableType } from "src/types/shareTracking";

const route = useRoute();
const router = useRouter();

function redirectForShare(
  shareableType: ShareableType,
  shareableId: string | null
): void {
  if (shareableType === "post" && shareableId) {
    void router.replace({
      name: "donor-post-detail",
      params: { id: shareableId }
    });
    return;
  }

  if (shareableType === "profile" && shareableId) {
    void router.replace({
      name: "donor-user-profile",
      params: { userId: shareableId }
    });
    return;
  }

  if (shareableType === "inspiration") {
    void router.replace({ name: "donor-inspirations" });
    return;
  }

  void router.replace({ name: "donor-posts" });
}

function redirectFallback(): void {
  void router.replace({ name: "donor-posts" });
}

onMounted(async () => {
  const raw = route.query.s;
  const token = typeof raw === "string" ? raw.trim() : "";

  if (!token) {
    redirectFallback();
    return;
  }

  try {
    const response = await recordShareVisit(token);
    markShareVisitRecorded(token);

    if (import.meta.env?.DEV) {
      console.debug("[open-share] visit recorded", {
        deduped: response.deduped,
        self_visit: response.self_visit ?? false,
        shareable_type: response.share.shareable_type
      });
    }

    redirectForShare(response.share.shareable_type, response.share.shareable_id);
  } catch (err) {
    if (import.meta.env?.DEV) {
      console.debug("[open-share] visit failed, fallback redirect", err);
    }
    redirectFallback();
  }
});
</script>

<style scoped lang="scss">
.openSharePage {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  background: #0f0f0f;
  color: rgba(255, 255, 255, 0.85);
}

.openSharePage-text {
  margin: 0;
  font-size: 1rem;
  font-family: poppins, sans-serif;
}
</style>
