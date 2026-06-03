<template>
  <div class="statsPage">
    <div v-if="loading && !tokenStats" class="statsPage-loading">
      <q-spinner color="primary" size="2rem" />
    </div>

    <RetryPanel
      v-else-if="error"
      :message="error"
      :on-retry="loadTokenStats"
      variant="inline"
      button-class="statsPage-retryBtn"
      data-testid="dh-token-stats-retry"
    />

    <template v-else-if="tokenStats">
      <p
        v-if="showHistoricalNote"
        class="statsPage-historicalNote"
        data-testid="dh-token-stats-historical-note"
      >
        Stats are tracked from the latest update onward. Older token history may not be
        available.
      </p>

      <div class="overwiev-stats">
        <div class="overwievTitleDiv">
          <span class="overwievTitle">Overview</span>
        </div>
        <div class="karmaUsed"></div>
        <div v-for="(card, i) in cards" :key="i" class="cardContainer">
          <div class="karmaGainedCard">
            <div class="karmaGainedTitleDiv">
              <span class="karmaGainedTitle">{{ card.overview.title }}</span>
            </div>
            <div v-if="card.overview.comesFrom" class="overwievDonationsDiv">
              <img
                :src="card.overview.comesFromImg"
                alt=""
                class="karmaGainedImgGift"
              />
              <span class="karmaGainedDescription">{{
                card.overview.comesFrom
              }}</span>
            </div>
            <div class="karmaValue">
              <img
                src="/icons/KarmaIcon.png"
                alt=""
                class="karmaGainedImgKarma"
              />
              <span class="karmaGainedKarmaValue">{{
                formatNumber(card.overview.comesFromValue)
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="detailed-stats">
        <div class="DetailedStats-div">
          <span class="DetailedStats-Title">Detailed Stats</span>
        </div>
        <div class="usedOnStats">
          <div class="usedOnStats-title"><span>Used Tokens on</span></div>
          <div class="usedOnStats-categories">
            <div class="usedOn-buttonsDiv">
              <q-btn
                :class="{ 'usedOn-button': true, active: model === 'onDream' }"
                @click="model = 'onDream'"
              >
                <img src="/post_icons/dream_mini.svg" alt="dream" class="usedOn-icon" />
              </q-btn>
              <q-btn
                :class="{ 'usedOn-button': true, active: model === 'onProblem' }"
                @click="model = 'onProblem'"
              >
                <img src="/post_icons/problem_mini.svg" alt="problem" class="usedOn-icon" />
              </q-btn>
              <q-btn
                :class="{ 'usedOn-button': true, active: model === 'onIdea' }"
                @click="model = 'onIdea'"
              >
                <img src="/post_icons/idea_mini.svg" alt="idea" class="usedOn-icon" />
              </q-btn>
            </div>
          </div>
          <div class="usedOnStats-value">
            <img src="/icons/KarmaIcon.png" alt="" />
            <span>{{ formatNumber(stats.usedKarma?.[model]) }}</span>
          </div>
        </div>
        <div class="usedOnStats-categoryContainer">
          <span class="usedOnStats-categoryTitle"
            >Category specific spending</span
          >
          <p
            v-if="!hasSubcategorySpending"
            class="statsPage-emptySubcategory"
            data-testid="dh-token-stats-subcategory-empty"
          >
            No subcategory spending yet.
          </p>
          <div v-else class="usedOnStats-spendingContainer">
            <q-select
              v-model="selectedCategory"
              :options="subcategoryOptions"
              behavior="menu"
              borderless
              class="registerDatas usedOnStats-spendingSelect"
            >
              <template v-slot:selected-item="scope">
                <q-icon
                  :name="`img:${scope.opt.icon}`"
                  class="usedOnStats-spendingIcon"
                />
                <span class="usedOnStats-spendingText"
                  >{{ scope.opt.label }}
                </span>
              </template>

              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <q-icon
                      class="usedOnStats-dropdownSpendingIcon"
                      :name="`img:${scope.opt.icon}`"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="usedOnStats-dropdownSpendingText">{{
                      scope.opt.label
                    }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
            <div class="usedOnStats-value usedOnStats-spendingValue">
              <img src="/icons/KarmaIcon.png" alt="" />
              <span>{{ formatNumber(selectedCategory.tokens) }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, watch, onMounted, onActivated } from "vue";
import { Stats, specificSpending } from "src/components/models";
import { formatNumber } from "src/components/partials/FunctionsComponent.vue";
import { fetchTokenStats } from "src/services/tokenStatsService";
import type {
  TokenStatsCategorySpend,
  TokenStatsResponse
} from "src/types/tokenStats";
import { mapAxiosErrorToDhError } from "src/utils/httpError";
import RetryPanel from "src/components/common/RetryPanel.vue";

const DEFAULT_CATEGORY_BUCKETS: TokenStatsCategorySpend[] = [
  { key: "dreams", label: "Dreams", tokens: 0 },
  { key: "problems", label: "Problems", tokens: 0 },
  { key: "ideas", label: "Ideas", tokens: 0 }
];

const CATEGORY_KEY_TO_MODEL: Record<string, "onDream" | "onProblem" | "onIdea"> = {
  dreams: "onDream",
  problems: "onProblem",
  ideas: "onIdea"
};

const SUBCATEGORY_SPENDING_ICONS: Record<string, string> = {
  events: "/icons/events-icon.svg",
  health: "/icons/health-icon.svg",
  learning: "/icons/learning-icon.svg",
  possessions: "/icons/possesion-icon.svg",
  profession: "/icons/proffesion-icon.svg",
  relationships: "/icons/relationship-icon.svg",
  other: "/icons/others-icon.svg",
  traveling: "/icons/travelling-icon.svg"
};

const model = ref<"onDream" | "onProblem" | "onIdea">("onDream");
const loading = ref(false);
const error = ref<string | null>(null);
const tokenStats = ref<TokenStatsResponse | null>(null);

const showHistoricalNote = computed(
  () => tokenStats.value?.meta?.historical_before_ledger === "unavailable"
);

const categoryBuckets = computed(() => {
  const fromApi = tokenStats.value?.spent?.by_category ?? [];
  if (fromApi.length === 0) {
    return DEFAULT_CATEGORY_BUCKETS;
  }
  const merged = DEFAULT_CATEGORY_BUCKETS.map((bucket) => {
    const match = fromApi.find((row) => row.key === bucket.key);
    return match ?? bucket;
  });
  for (const row of fromApi) {
    if (!merged.some((item) => item.key === row.key)) {
      merged.push(row);
    }
  }
  return merged;
});

const categoryTokensByKey = computed(() => {
  const map: Record<string, number> = {};
  for (const row of categoryBuckets.value) {
    map[row.key] = row.tokens;
  }
  return map;
});

const tokensUsedOnDreams = computed(
  () => categoryTokensByKey.value.dreams ?? 0
);
const tokensUsedOnProblems = computed(
  () => categoryTokensByKey.value.problems ?? 0
);
const tokensUsedOnIdeas = computed(() => categoryTokensByKey.value.ideas ?? 0);
const tokensUsedOnDonations = computed(
  () => tokenStats.value?.spent?.on_donations ?? 0
);

const tokensGainedFromSupport = computed(
  () => tokenStats.value?.earned?.from_received_contributions ?? 0
);
const tokensGainedFromPurchases = computed(
  () => tokenStats.value?.earned?.from_purchases ?? 0
);
const tokensGainedFromHelp = computed(
  () => tokenStats.value?.earned?.from_help ?? 0
);
const remainingTokens = computed(() => tokenStats.value?.balance ?? 0);

const stats = computed(
  () =>
    ({
      usedKarma: {
        onDream: tokensUsedOnDreams.value,
        onProblem: tokensUsedOnProblems.value,
        onIdea: tokensUsedOnIdeas.value,
        onDonation: tokensUsedOnDonations.value
      }
    }) as Stats
);

const cards = computed(
  () =>
    [
      {
        overview: {
          title: "Received",
          comesFrom: "Support Received",
          comesFromImg: "/icons/giftIcon-red.svg",
          comesFromValue: tokensGainedFromSupport.value
        }
      },
      {
        overview: {
          title: "Purchased",
          comesFrom: "Purchased Tokens",
          comesFromImg: "/icons/giftIcon-red.svg",
          comesFromValue: tokensGainedFromPurchases.value
        }
      },
      {
        overview: {
          title: "Earned",
          comesFrom: "Help Rewards",
          comesFromImg: "/icons/giftIcon-red.svg",
          comesFromValue: tokensGainedFromHelp.value
        }
      },
      {
        overview: {
          title: "Remaining Tokens",
          comesFrom: "",
          comesFromImg: "",
          comesFromValue: remainingTokens.value
        }
      }
    ] as Stats[]
);

function subcategoryIconForSlug(slug: string): string {
  const normalized = slug.trim().toLowerCase();
  return SUBCATEGORY_SPENDING_ICONS[normalized] ?? "/icons/others-icon.svg";
}

const subcategoryOptions = computed(() => {
  const rows = tokenStats.value?.spent?.by_subcategory ?? [];
  return rows.map(
    (row) =>
      ({
        label: row.label || row.slug,
        value: String(row.id || row.slug),
        icon: subcategoryIconForSlug(row.slug),
        tokens: row.tokens
      }) as specificSpending
  );
});

const hasSubcategorySpending = computed(() => subcategoryOptions.value.length > 0);

const selectedCategory = ref<specificSpending>({
  label: "Events",
  value: "Events",
  icon: "/icons/events-icon.svg",
  tokens: 0
});

watch(
  subcategoryOptions,
  (options) => {
    if (options.length === 0) {
      return;
    }
    const currentStillValid = options.some(
      (opt) => opt.value === selectedCategory.value.value
    );
    if (!currentStillValid) {
      selectedCategory.value = { ...options[0] };
    } else {
      const match = options.find(
        (opt) => opt.value === selectedCategory.value.value
      );
      if (match) {
        selectedCategory.value = { ...match };
      }
    }
  },
  { immediate: true }
);

watch(
  () => selectedCategory.value.value,
  (newValue) => {
    const category = subcategoryOptions.value.find((opt) => opt.value === newValue);
    if (category) {
      selectedCategory.value = { ...category };
    }
  }
);

watch(categoryBuckets, (buckets) => {
  const currentKey = Object.entries(CATEGORY_KEY_TO_MODEL).find(
    ([, modelKey]) => modelKey === model.value
  )?.[0];
  if (currentKey && buckets.some((b) => b.key === currentKey)) {
    return;
  }
  const firstWithSpend = buckets.find((b) => b.tokens > 0);
  const key = firstWithSpend?.key ?? "dreams";
  model.value = CATEGORY_KEY_TO_MODEL[key] ?? "onDream";
});

async function loadTokenStats() {
  loading.value = true;
  error.value = null;
  try {
    tokenStats.value = await fetchTokenStats();
  } catch (err: unknown) {
    const mapped = mapAxiosErrorToDhError(err);
    error.value = mapped.fallbackMessage;
    tokenStats.value = null;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  void loadTokenStats();
});

onActivated(() => {
  void loadTokenStats();
});

defineExpose({
  refresh: loadTokenStats
});
</script>
<style scoped lang="scss">
.statsPage-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
  min-height: 12rem;
}

.statsPage-historicalNote {
  color: rgba(255, 255, 255, 0.65);
  font-family: poppins;
  font-size: 0.72rem;
  line-height: 1.25rem;
  margin: 0 1rem 0.75rem;
  text-align: center;
}

.statsPage-emptySubcategory {
  color: rgba(255, 255, 255, 0.7);
  font-family: poppins;
  font-size: 0.85rem;
  margin: 0.75rem 0 0;
}

.usedOnStats-spendingContainer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-right: 1rem;
}
.usedOnStats-spendingValue {
  display: flex;
  align-items: center;
  background-color: rgba(189, 0, 67, 0.1);
  height: 2.5rem;
  width: auto;
  border-radius: 0.6rem;
  padding: 0.3rem 0.6rem;
  img {
    height: 1.2rem;
  }

  span {
    color: $primary;
    font-family: poppinsBold;
    margin-left: 0.1rem;
    font-size: 1rem;
  }
}
.usedOnStats-categoryContainer {
  color: white;
  display: flex;
  justify-content: center;
  align-items: start;
  flex-direction: column;
  font-family: poppins;
  font-weight: 600;
  margin-top: 2rem;
}
.usedOnStats-spendingSelect {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 1rem 0;
  margin-left: -0.2rem;
  width: 15rem;
}
.usedOnStats-spendingIcon {
  margin-right: 0.5rem;
  scale: 1.3;
}
.usedOnStats-spendingText {
  font-family: poppins;
}
.usedOnStats-dropdownSpendingText {
  @extend .usedOnStats-spendingText;
  margin-left: -1.5rem;
}
.usedOnStats-dropdownSpendingIcon {
  scale: 0.8;
}
.cardContainer {
  width: 100%;
}
.usedOn-buttonsDiv {
  display: flex;
  gap: 0.5rem;
  justify-content: start;
  margin-right: 1.1rem;
  .usedOn-button {
    border: 0.1rem solid $primary;
    border-radius: 0.6rem;
    height: 2.9rem;
    width: 2.9rem;

    .icon {
      scale: 1.7;
    }
    .icons-left {
      margin-left: 0.1rem;
      scale: 2;
    }
    .usedOn-icon {
      width: 16px;
      height: 16px;
      object-fit: contain;
      display: block;
    }
  }
}
.usedOn-button.active {
  background-color: $primary;
  svg {
    * {
      fill: white;
      opacity: 1 !important;
    }
  }
  .usedOn-icon {
    // Make icon white when active - use filter to convert red (#BD0043) to white
    filter: brightness(0) saturate(100%) invert(100%) !important;
    opacity: 1 !important;
    display: block;
  }
}
.statsPage {
  padding-top: 1rem;
}
.overwiev-stats {
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  padding: 0 1rem;

  .overwievTitleDiv {
    display: flex;
    justify-content: start;
    width: 100%;
    margin-bottom: 0.8rem;

    .overwievTitle {
      color: white;
      font-family: poppinsSemiBold;
      font-size: 1rem;
    }
  }

  .karmaGainedCard {
    background: linear-gradient(
      108.46deg,
      rgba(37, 37, 37, 0.405) 0%,
      rgba(23, 23, 23, 0.33) 100%
    );
    min-height: 3.6rem;
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.35rem 1rem;
    margin-bottom: 0.5rem;
    border-radius: 0.8rem;

    .karmaGainedTitleDiv {
      flex: 0 0 4.2rem;
      width: auto;
      min-width: 0;
      display: flex;
      align-items: center;

      .karmaGainedTitle {
        color: white;
        font-size: 0.7rem;
        font-family: poppins;
        line-height: 0.9rem;
        text-transform: Uppercase;
      }
    }

    .overwievDonationsDiv {
      flex: 1 1 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 0;
      margin: 0;

      .karmaGainedImgGift {
        flex-shrink: 0;
        height: 1.7rem;
        margin-right: 0.5rem;
        margin-bottom: 0.2rem;
      }

      .karmaGainedDescription {
        color: white;
        font-family: poppins;
        font-size: 0.9rem;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .karmaValue {
      flex: 0 0 auto;
      margin-left: auto;
      display: flex;
      align-items: center;
      background-color: rgba(189, 0, 67, 0.1);
      height: 2.5rem;
      width: auto;
      border-radius: 0.6rem;
      padding: 0.3rem 0.6rem;

      .karmaGainedImgKarma {
        height: 1.2rem;
      }

      .karmaGainedKarmaValue {
        color: $primary;
        font-family: poppinsBold;
        margin-left: 0.1rem;
        font-size: 1rem;
      }
    }
  }
}

.detailed-stats {
  justify-content: center;
  flex-direction: column;
  align-items: center;
  padding: 0 1rem;

  .usedOnStats {
    background: linear-gradient(
      108.46deg,
      rgba(37, 37, 37, 0.525) 0%,
      rgba(23, 23, 23, 0.33) 100%
    );
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.35rem 1rem;
    margin: 0 auto;
    border-radius: 0.8rem;
    width: 100%;
    min-height: 3.8rem;

    .usedOnStats-title {
      flex: 0 0 3.5rem;
      color: white;
      font-size: 0.7rem;
      font-family: poppins;
      line-height: 0.9rem;
      text-transform: Uppercase;
      width: auto;
      min-width: 0;
    }
    .usedOnStats-categories {
      flex: 1 1 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 0;
      margin: 0;
    }
    .usedOnStats-value {
      flex: 0 0 auto;
      margin-left: auto;
      display: flex;
      align-items: center;
      background-color: rgba(189, 0, 67, 0.1);
      height: 2.5rem;
      width: auto;
      border-radius: 0.6rem;
      padding: 0.3rem 0.6rem;

      img {
        height: 1.2rem;
      }

      span {
        color: $primary;
        font-family: poppinsBold;
        margin-left: 0.1rem;
        font-size: 1rem;
      }
    }
  }
}
</style>
