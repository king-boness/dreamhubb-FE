<template>
  <div class="earn-page">
    <div v-if="loading && tasks.length === 0" class="earnPage-loading">
      <q-spinner color="primary" size="2rem" />
    </div>

    <RetryPanel
      v-else-if="error"
      :message="error"
      :on-retry="loadEarnTasks"
      variant="inline"
      button-class="earnPage-retryBtn"
      data-testid="dh-earn-tasks-retry"
    />

    <template v-else>
      <div v-if="showVerifyBanner && verifyEmailTask" class="verifyContent-earn">
        <div class="verifyContent-left">
          <span class="verifyContent-heading">Here's Your Free Tokens</span>
          <span class="verifyContent-description">
            As a new user, we are giving you some tokens for verifying your account.
          </span>
          <q-btn
            class="verifyContent-button"
            :loading="claimingTaskKey === 'verify_email'"
            :disable="isVerifyBannerDisabled"
            @click="handleClaim('verify_email')"
          >
            {{ verifyBannerButtonLabel }}
            <img src="/icons/WhiteKarmaIcon.svg" alt="" />
          </q-btn>
        </div>
        <div class="verifyContentRight">
          <img
            src="/images/Auth/Hand-tokens.svg"
            alt=""
            class="verifyContent-img"
          />
        </div>
      </div>

      <div class="onGoingTasks">
        <div class="onGoingTasks-header">
          <span class="onGoingTasks-heading">Ongoing Tasks</span>
          <a href="#" class="helpButton" @click.prevent>
            <img src="/icons/helpIcon.svg" alt=""
          /></a>
        </div>

        <p v-if="activeTasks.length === 0" class="earnPage-empty">
          No active tasks right now.
        </p>

        <div
          v-for="task in activeTasks"
          :key="task.key"
          class="task-earn task-earn--active"
        >
          <div class="taskImgDiv">
            <img src="/icons/taskTrophy.svg" alt="" class="taskTrophyImg" />
          </div>
          <div class="task-main">
            <span class="taskTitle">{{ task.title }}</span>
            <span class="taskDescription">{{ task.description }}</span>
            <span class="taskMeta">
              {{ task.progress.current }}/{{ task.progress.target }}
              · {{ statusLabel(task.status) }}
            </span>
          </div>
          <div class="task-side">
            <div class="taskReward">
              <span class="taskReward-bold">Reward:</span>
              <img src="/icons/KarmaIcon.png" alt="" />
              <span class="taskRewars-amount">{{ task.reward_tokens }}</span>
            </div>
            <q-btn
              v-if="task.status === 'claimable'"
              class="taskClaimBtn"
              color="primary"
              unelevated
              dense
              no-caps
              :loading="claimingTaskKey === task.key"
              :disable="claimingTaskKey !== null && claimingTaskKey !== task.key"
              @click="handleClaim(task.key)"
            >
              Claim
            </q-btn>
          </div>
        </div>
      </div>

      <div class="onGoingTasks finishedTasksContainer">
        <div class="onGoingTasks-header">
          <span class="onGoingTasks-heading">Completed Tasks</span>
          <a href="#" class="helpButton" @click.prevent>
            <img src="/icons/helpIcon.svg" alt=""
          /></a>
        </div>

        <p v-if="completedTasks.length === 0" class="earnPage-empty">
          No completed tasks yet.
        </p>

        <div
          v-for="task in completedTasks"
          :key="task.key"
          class="task-earn task-earn--completed"
        >
          <div class="FinishedtaskImgDiv">
            <img src="/icons/complitedTask.svg" alt="" class="taskTrophyImg" />
          </div>
          <div class="task-main">
            <span class="taskTitle">{{ task.title }}</span>
            <span class="taskDescription">{{ task.description }}</span>
            <span class="taskMeta">{{ statusLabel(task.status) }}</span>
          </div>
          <div class="FinishedtaskReward">
            <span class="taskReward-bold">Got:</span>
            <img src="/icons/KarmaIcon.png" alt="" />
            <span class="taskRewars-amount">{{ task.reward_tokens }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onActivated } from "vue";
import { isAxiosError } from "axios";
import RetryPanel from "src/components/common/RetryPanel.vue";
import { fetchEarnTasks, claimEarnTask } from "src/services/earnTasksService";
import { useAuthStore } from "src/stores/auth";
import type { EarnTask, EarnTaskStatus } from "src/types/earnTasks";
import { mapAxiosErrorToDhError } from "src/utils/httpError";
import { notifyError, notifyNegative, notifySuccess } from "src/utils/notify";

const authStore = useAuthStore();

const loading = ref(false);
const error = ref<string | null>(null);
const tasks = ref<EarnTask[]>([]);
const claimingTaskKey = ref<string | null>(null);

const verifyEmailTask = computed(() =>
  tasks.value.find((task) => task.key === "verify_email")
);

const showVerifyBanner = computed(
  () => verifyEmailTask.value !== undefined && verifyEmailTask.value.status !== "claimed"
);

const activeTasks = computed(() =>
  tasks.value.filter(
    (task) =>
      task.status !== "claimed" &&
      !(showVerifyBanner.value && task.key === "verify_email")
  )
);

const completedTasks = computed(() =>
  tasks.value.filter((task) => task.status === "claimed")
);

const verifyBannerButtonLabel = computed(() => {
  const task = verifyEmailTask.value;
  if (!task) {
    return "Verify and claim 150";
  }
  if (task.status === "claimable") {
    return `Verify and claim ${task.reward_tokens}`;
  }
  if (task.status === "in_progress") {
    return "Verify email first";
  }
  return `Verify and claim ${task.reward_tokens}`;
});

const isVerifyBannerDisabled = computed(() => {
  const task = verifyEmailTask.value;
  if (!task) {
    return true;
  }
  if (claimingTaskKey.value === "verify_email") {
    return true;
  }
  return task.status !== "claimable";
});

function statusLabel(status: EarnTaskStatus): string {
  switch (status) {
    case "in_progress":
      return "In progress";
    case "claimable":
      return "Ready to claim";
    case "claimed":
      return "Completed";
    case "locked":
      return "Locked";
    default:
      return status;
  }
}

function replaceTaskInList(updated: EarnTask) {
  const index = tasks.value.findIndex((task) => task.key === updated.key);
  if (index >= 0) {
    tasks.value[index] = updated;
  } else {
    tasks.value.push(updated);
  }
}

async function loadEarnTasks() {
  loading.value = true;
  error.value = null;
  try {
    const response = await fetchEarnTasks();
    tasks.value = response.tasks;
    authStore.updateTokens(response.balance);
  } catch (err: unknown) {
    const mapped = mapAxiosErrorToDhError(err);
    error.value = mapped.fallbackMessage;
    if (tasks.value.length === 0) {
      tasks.value = [];
    }
  } finally {
    loading.value = false;
  }
}

async function handleClaim(taskKey: string) {
  if (claimingTaskKey.value) {
    return;
  }

  claimingTaskKey.value = taskKey;
  try {
    const response = await claimEarnTask(taskKey);
    replaceTaskInList(response.task);
    authStore.updateTokens(response.balance);
    notifySuccess("earn.tokensClaimed", "Tokens claimed.");
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 422) {
      const data = err.response.data as { message?: string; code?: string };
      notifyNegative(
        data?.message ?? "Task is not claimable yet."
      );
      await loadEarnTasks();
      return;
    }
    notifyError(mapAxiosErrorToDhError(err));
  } finally {
    claimingTaskKey.value = null;
  }
}

onMounted(() => {
  void loadEarnTasks();
});

onActivated(() => {
  void loadEarnTasks();
});

defineExpose({
  refresh: loadEarnTasks
});
</script>
<style scoped lang="scss">
.earn-page {
  padding-top: 0.8rem;
}

.earnPage-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
}

.earnPage-empty {
  color: #f3f3f3aa;
  font-family: inter;
  font-size: 0.8rem;
  margin: 0 0 0.8rem 0.25rem;
}

.verifyContent-earn {
  padding: 0.7rem 0;
  display: flex;
  align-items: center;
  justify-content: center;

  .verifyContent-left {
    padding-left: 1rem;
    display: flex;
    flex-direction: column;

    .verifyContent-heading {
      color: white;
      font-family: poppinsBold;
      font-size: 1.2rem;
    }

    .verifyContent-description {
      color: #f3f3f3aa;
      font-size: 0.8rem;
      font-family: inter;
      margin-top: 0.5rem;
    }

    .verifyContent-button {
      margin-top: 1rem;
      background-color: rgba(182, 0, 67, 1);
      color: white;
      border: none;
      font-size: 0.8rem;
      height: 2.2rem;
      font-family: montseraatSemiBold;
      border-radius: 0.5rem !important;
      margin-bottom: 0.8rem !important;
      display: flex;
      align-items: center;
      padding: 0 0.75rem !important;

      img {
        height: 1rem;
        margin-left: 0.2rem;
      }
    }
  }
}

.finishedTasksContainer {
  margin-bottom: 1rem;
}

.onGoingTasks {
  padding: 0.5rem;

  .onGoingTasks-header {
    display: flex;
    align-items: center;
    justify-content: start;
    margin-bottom: 0.8rem;

    .onGoingTasks-heading {
      color: white;
      font-family: poppinsBold;
    }

    a {
      height: 1rem;
      margin-left: 0.5rem;
    }
  }

  .task-earn {
    background: linear-gradient(
      108.46deg,
      rgba(37, 37, 37, 0.525) 0%,
      rgba(23, 23, 23, 0.33) 100%
    );
    min-height: 3.6rem;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    padding: 0.5rem;
    margin-bottom: 0.8rem;
    border-radius: 0.8rem;
    gap: 0.35rem;

    .taskImgDiv {
      background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.13) 0%,
        rgba(255, 255, 255, 0.044) 100%
      );
      backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.8rem;
      border-radius: 0.6rem;
      height: 2.5rem;
      width: 2.5rem;
      flex-shrink: 0;

      .taskTrophyImg {
        height: 1.2rem;
      }
    }

    .task-main {
      flex: 1 1 auto;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      margin-left: 0.25rem;
    }

    .taskTitle {
      color: white;
      font-family: poppinsSemiBold;
      font-size: 0.82rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .taskDescription {
      color: #f3f3f3cc;
      font-family: poppins;
      font-size: 0.72rem;
      line-height: 1.2;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .taskMeta {
      color: #f3f3f3aa;
      font-family: inter;
      font-size: 0.68rem;
    }

    .task-side {
      flex: 0 0 auto;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.35rem;
      margin-left: auto;
      max-width: 46%;
    }

    .task {
      border-left: 0.07rem solid #fcfcfc1c;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;

      img {
        height: 1.2rem;
        margin-left: 0.4rem;
      }

      .taskReward-bold {
        font-family: poppinsSemiBold;
        font-size: 0.8rem;
      }

      .taskRewars-amount {
        color: $primary;
        font-family: poppinsBold;
        margin-left: 0.1rem;
        font-size: 1rem;
      }
    }

    .taskClaimBtn {
      font-size: 0.72rem;
      min-height: 1.6rem;
      padding: 0 0.55rem;
    }
  }
}

.taskReward {
  @extend .task;
  flex: 0 0 auto;
  padding-left: 0.5rem;
}

.FinishedtaskImgDiv {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 0.6rem;
  flex-shrink: 0;
}

.FinishedtaskReward {
  flex: 0 0 auto;
  padding-left: 0.5rem;
  margin-left: auto;
  max-width: 42%;
  @extend .task;
}
</style>
