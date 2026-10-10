<template>
  <div class="settingsBan-page">
    <div class="settingsBan-header">
      <button type="button" class="settingsBan-backBtn" :aria-label="t('back')" @click="handleBack">
        <q-icon name="chevron_left" />
      </button>
      <span class="settingsBan-heading">{{ t("settingsPages.ban.heading") }}</span>
    </div>
    <div class="settingsBan-rules">
      <p class="rulesText">
        {{ t("settingsPages.ban.rules1") }}
      </p>
      <p class="rulesText">
        <i18n-t keypath="settingsPages.ban.rules2" scope="global" tag="span">
          <template #report>
            <strong>{{ t("reportPost") }}</strong>
          </template>
          <template #support>
            <router-link class="settingsBan-link" :to="{ name: 'support' }">{{ t("settingsPages.ban.supportLink") }}</router-link>
          </template>
          <template #email>
            <a class="settingsBan-link" :href="`mailto:${SUPPORT_EMAIL}`">{{ SUPPORT_EMAIL }}</a>
          </template>
        </i18n-t>
      </p>
    </div>

    <div v-if="loading" class="settingsBan-loading">
      <q-spinner color="primary" size="28px" />
    </div>

    <p v-else-if="!blockedUsers.length" class="rulesText rulesText--muted">
      {{ t("settingsPages.ban.empty") }}
    </p>

    <ul v-else class="settingsBan-list">
      <li v-for="user in blockedUsers" :key="user.id" class="settingsBan-item">
        <span class="settingsBan-name">{{ user.username || t("settingsPages.ban.userFallback", { id: user.id }) }}</span>
        <q-btn
          flat
          dense
          no-caps
          color="primary"
          :label="t('settingsPages.ban.unblock')"
          :loading="unblockingId === user.id"
          @click="handleUnblock(user.id)"
        />
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useBlocksStore } from "src/stores/blocks";
import { goBackOrFallback } from "src/utils/navigation";
import { notifyError, notifySuccess } from "src/utils/notify";
import { mapAxiosErrorToDhError } from "src/utils/httpError";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const SUPPORT_EMAIL = "matej.kostun@gmail.com";
const blocksStore = useBlocksStore();
const loading = ref(true);

function handleBack() {
  const isDonee = String(route.name || "").startsWith("donee-");
  goBackOrFallback(router, { name: isDonee ? "donee-settings" : "donor-settings" });
}
const unblockingId = ref<number | null>(null);
const blockedUsers = ref(blocksStore.blockedUsers);

onMounted(async () => {
  loading.value = true;
  try {
    await blocksStore.loadBlockedUsers(true);
    blockedUsers.value = [...blocksStore.blockedUsers];
  } catch (error) {
    notifyError(mapAxiosErrorToDhError(error), { timeout: 4000 });
  } finally {
    loading.value = false;
  }
});

async function handleUnblock(userId: number) {
  unblockingId.value = userId;
  try {
    await blocksStore.unblockUser(userId);
    blockedUsers.value = [...blocksStore.blockedUsers];
    notifySuccess("settingsPages.ban.unblocked", "User unblocked.", { timeout: 2500 });
  } catch (error) {
    notifyError(mapAxiosErrorToDhError(error), { timeout: 4000 });
  } finally {
    unblockingId.value = null;
  }
}
</script>

<style scoped lang="scss">
.settingsBan-page {
  padding: 0 1.2rem;
  padding-bottom: calc(2rem + env(safe-area-inset-bottom, 0px));

  .settingsBan-header {
    display: flex;
    width: 100%;
    max-width: 36rem;
    align-items: center;
    gap: 0.75rem;
    margin: 1.5rem 0;

    .settingsBan-heading {
      font-size: 1.4rem;
      font-family: poppinsSemiBold;
      color: white;
      flex: 1;
    }
  }

  .settingsBan-backBtn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.3);
    background: transparent;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
    padding: 0;

    .q-icon {
      font-size: 24px;
      color: #ffffff;
    }
  }

  .settingsBan-rules {
    max-width: 36rem;

    .rulesText {
      font-family: inter;
      color: #d0dcd8;
      line-height: 1.5;
      margin-bottom: 1rem;
    }

    .rulesText--muted {
      opacity: 0.75;
      font-size: 0.95rem;
    }

    .settingsBan-link {
      color: #ff4db8;
      text-decoration: underline;
    }
  }

  .settingsBan-loading {
    display: flex;
    justify-content: center;
    padding: 2rem 0;
  }

  .settingsBan-list {
    list-style: none;
    margin: 0;
    padding: 0;
    max-width: 36rem;
  }

  .settingsBan-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.85rem 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .settingsBan-name {
    font-family: inter;
    color: #fcfcfc;
  }
}
</style>
