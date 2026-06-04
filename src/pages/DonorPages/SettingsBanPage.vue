<template>
  <div class="settingsBan-page">
    <div class="settingsBan-header">
      <span class="settingsBan-heading">Blocked users</span>
    </div>
    <div class="settingsBan-rules">
      <p class="rulesText">
        Blocked users cannot appear in your feed. Their posts are removed immediately when you block them.
      </p>
      <p class="rulesText">
        To report harmful content, open a post and use <strong>Report a post</strong>. For urgent issues, visit
        <router-link class="settingsBan-link" :to="{ name: 'support' }">Support</router-link>
        or email
        <a class="settingsBan-link" href="mailto:matej.kostun@gmail.com">matej.kostun@gmail.com</a>.
      </p>
    </div>

    <div v-if="loading" class="settingsBan-loading">
      <q-spinner color="primary" size="28px" />
    </div>

    <p v-else-if="!blockedUsers.length" class="rulesText rulesText--muted">
      You have not blocked anyone yet.
    </p>

    <ul v-else class="settingsBan-list">
      <li v-for="user in blockedUsers" :key="user.id" class="settingsBan-item">
        <span class="settingsBan-name">{{ user.username || `User #${user.id}` }}</span>
        <q-btn
          flat
          dense
          no-caps
          color="primary"
          label="Unblock"
          :loading="unblockingId === user.id"
          @click="handleUnblock(user.id)"
        />
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useBlocksStore } from "src/stores/blocks";
import { notifyError, notifySuccess } from "src/utils/notify";
import { mapAxiosErrorToDhError } from "src/utils/httpError";

const blocksStore = useBlocksStore();
const loading = ref(true);
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
    notifySuccess("common.success.saved", "User unblocked.", { timeout: 2500 });
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
    justify-content: start;
    align-items: start;
    margin: 1.5rem 0;
    flex-direction: column;

    .settingsBan-heading {
      font-size: 1.4rem;
      font-family: poppinsSemiBold;
      color: white;
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
