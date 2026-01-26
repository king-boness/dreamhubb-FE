<template>
  <q-page class="userPostsByType">
    <div class="userPostsByType-inner">
      <div class="userPostsByType-header">
        <h2 class="userPostsByType-title">
          {{ titleWithCount }}
        </h2>
      </div>

      <div class="userPostsByType-toggle">
        <button
          type="button"
          class="userPostsByType-toggleBtn"
          :class="{ 'userPostsByType-toggleBtn--active': true }"
        >
          {{ t("active") }}
        </button>

        <button
          type="button"
          class="userPostsByType-toggleBtn userPostsByType-toggleBtn--disabled"
          @click="handleCompletedClick"
        >
          {{ t("completed") }}
        </button>
      </div>

      <div v-if="loading" class="userPostsByType-state">
        <q-spinner color="primary" size="32px" />
      </div>

      <div v-else-if="error" class="userPostsByType-error">
        <div class="userPostsByType-errorText">{{ error }}</div>
        <q-btn
          class="userPostsByType-retryBtn"
          unelevated
          no-caps
          color="primary"
          :disable="loading"
          @click="handleRetry"
        >
          {{ retryLabel }}
        </q-btn>
      </div>

      <q-list v-else class="userPostsByType-list">
        <q-item v-if="items.length === 0" class="userPostsByType-empty">
          <q-item-section>
            <div class="userPostsByType-emptyText">{{ t("noUserPostsYet") }}</div>
          </q-item-section>
        </q-item>

        <q-item
          v-for="p in items"
          :key="p.post_id"
          clickable
          v-ripple
          class="userPostsByType-item"
          @click="openPost(p.post_id)"
        >
          <q-item-section>
            <div class="userPostsByType-itemTitle">{{ p.title }}</div>
            <div class="userPostsByType-itemMeta">
              <span class="userPostsByType-itemMetaText">{{ formatDate(p.date_created) }}</span>
              <span class="userPostsByType-itemMetaDot">•</span>
              <span class="userPostsByType-itemMetaText">{{ p.tokens }} tokens</span>
            </div>
          </q-item-section>
          <q-item-section side>
            <q-icon name="chevron_right" size="22px" color="grey-5" />
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { notifyInfo } from "src/utils/notify";
import { api } from "boot/axios";
import { normalizePost, type NormalizedPost, type RawPostFromAPI } from "src/utils/normalizePost";
import { mapAxiosErrorToDhError } from "src/utils/httpError";
import { tGlobal } from "src/utils/i18nGlobal";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const userId = computed(() => Number(route.params.userId));
const type = computed(() => String(route.params.type || "dream"));

const typeLabel = computed(() => {
  if (type.value === "problem") return t("problems");
  if (type.value === "idea") return t("ideas");
  return t("dreams");
});

const loading = ref(false);
const items = ref<NormalizedPost[]>([]);
const error = ref<string | null>(null);
const retryLabel = computed(() => {
  const label = t("common.actions.retry");
  return label === "common.actions.retry" ? "Retry" : label;
});

const titleWithCount = computed(() => `${typeLabel.value} (${items.value.length})`);

let abortCtrl: AbortController | null = null;

const fetchPosts = async () => {
  const uid = userId.value;
  const category = type.value;
  if (!uid || Number.isNaN(uid)) return;
  if (!["dream", "problem", "idea"].includes(category)) return;

  if (abortCtrl) abortCtrl.abort();
  abortCtrl = new AbortController();

  loading.value = true;
  error.value = null;
  try {
    const { data } = await api.get("/posts", {
      params: { category },
      signal: abortCtrl.signal
    });
    const rawPosts = (data?.data || data?.posts || data || []) as RawPostFromAPI[];
    const normalized = rawPosts.map((p) => normalizePost(p));
    items.value = normalized.filter((p) => (p.user_id || p.author_id) === uid);
  } catch (e: unknown) {
    const mapped = mapAxiosErrorToDhError(e);
    error.value = tGlobal(mapped.messageKey, mapped.fallbackMessage);
    items.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  void fetchPosts();
});

watch([userId, type], () => {
  void fetchPosts();
});

const handleRetry = () => {
  void fetchPosts();
};

const openPost = (postId: number) => {
  router.push({ name: "donor-post-detail", params: { id: String(postId) } });
};

const handleCompletedClick = () => {
  notifyInfo("common.info.comingSoon", t("completedComingSoon") || "Coming soon", { timeout: 2500 });
};

// Format date as DD/MM/YYYY (same behavior as donor feed)
const formatDate = (dateString: string): string => {
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) {
    const dateParts = dateString.split("/");
    if (dateParts.length === 3) {
      const [month, day, year] = dateParts;
      return `${day}/${month}/${year}`;
    }
    return dateString;
  }
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};
</script>

<style scoped lang="scss">
.userPostsByType {
  min-height: 100vh;
  padding: 18px 16px 28px;
  color: #fff;
}

.userPostsByType-inner {
  max-width: 520px;
  margin: 0 auto;
}

.userPostsByType-header {
  padding-top: 8px;
  padding-bottom: 12px;
}

.userPostsByType-title {
  margin: 0;
  font-family: poppinsSemiBold;
  font-size: 1.4rem;
  text-align: left;
}

.userPostsByType-toggle {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 14px;
}

.userPostsByType-toggleBtn {
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.9);
  padding: 10px 12px;
  border-radius: 12px;
  font-family: poppinsSemiBold;
  cursor: pointer;
}

.userPostsByType-toggleBtn--active {
  border-color: rgba(255, 255, 255, 0.22);
  background: rgba(255, 255, 255, 0.1);
}

.userPostsByType-toggleBtn--disabled {
  opacity: 0.55;
}

.userPostsByType-state {
  display: flex;
  justify-content: center;
  padding: 28px 0;
}

.userPostsByType-error {
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  padding: 16px 14px;
  text-align: center;
}

.userPostsByType-errorText {
  font-family: poppins;
  color: rgba(255, 255, 255, 0.75);
}

.userPostsByType-retryBtn {
  margin-top: 10px;
}

.userPostsByType-list {
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
}

.userPostsByType-item {
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.userPostsByType-itemTitle {
  font-family: poppinsSemiBold;
  color: rgba(255, 255, 255, 0.95);
}

.userPostsByType-itemMeta {
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.65);
  font-family: poppins;
  font-size: 0.9rem;
}

.userPostsByType-itemMetaDot {
  opacity: 0.7;
}

.userPostsByType-emptyText {
  color: rgba(255, 255, 255, 0.75);
  font-family: poppins;
}
</style>
