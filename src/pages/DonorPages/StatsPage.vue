<template>
  <div class="statsPage">
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
          <div class="overwievDonationsDiv">
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
        <div class="usedOnStats-title"><span>used on</span></div>
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
        <div class="usedOnStats-spendingContainer">
          <q-select
            v-model="selectedCategory"
            :options="options"
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
  </div>
</template>
<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { Stats, specificSpending } from "src/components/models";
import { formatNumber } from "src/components/partials/FunctionsComponent.vue";

const model = ref("onDream");

// TODO: Replace with API data when BE endpoint is ready
// Computed properties for stats data
const remainingKarma = computed(() => {
  // TODO: Replace with API data: await api.get('/user/stats/remaining-karma')
  return 0;
});

const tokensUsedOnDreams = computed(() => {
  // TODO: Replace with API data: await api.get('/user/stats/used-on-dreams')
  return 0;
});

const tokensUsedOnProblems = computed(() => {
  // TODO: Replace with API data: await api.get('/user/stats/used-on-problems')
  return 0;
});

const tokensUsedOnIdeas = computed(() => {
  // TODO: Replace with API data: await api.get('/user/stats/used-on-ideas')
  return 0;
});

const tokensUsedOnDonations = computed(() => {
  // TODO: Replace with API data: await api.get('/user/stats/used-on-donations')
  return 0;
});

const tokensGainedFromDonations = computed(() => {
  // TODO: Replace with API data: await api.get('/user/stats/gained-from-donations')
  return 0;
});

const categorySpecificSpending = computed(() => {
  // TODO: Replace with API data: await api.get('/user/stats/category-spending')
  return {
    Events: 0,
    Health: 0,
    Learning: 0,
    Possesions: 0,
    Proffesion: 0,
    Relationships: 0,
    Other: 0,
    Travelling: 0
  };
});

const stats = computed(() => ({
  usedKarma: {
    onDream: tokensUsedOnDreams.value,
    onProblem: tokensUsedOnProblems.value,
    onIdea: tokensUsedOnIdeas.value,
    onDonation: tokensUsedOnDonations.value
  }
} as Stats));

const cards = computed(() => [
  {
    overview: {
      title: "Gained From",
      comesFrom: "Donations",
      comesFromImg: "/icons/giftIcon-red.svg",
      comesFromValue: tokensGainedFromDonations.value
    }
  },
  {
    overview: {
      title: "Gained From",
      comesFrom: "Donations",
      comesFromImg: "/icons/giftIcon-red.svg",
      comesFromValue: tokensGainedFromDonations.value
    }
  },
  {
    overview: {
      title: "karma remaining",
      comesFromValue: remainingKarma.value
    }
  }
] as Stats[]);

const options = computed(() => [
  {
    label: "Events",
    value: "Events",
    icon: "/icons/events-icon.svg",
    tokens: categorySpecificSpending.value.Events
  },
  {
    label: "Health",
    value: "Health",
    icon: "/icons/health-icon.svg",
    tokens: categorySpecificSpending.value.Health
  },
  {
    label: "Learning",
    value: "Learning",
    icon: "/icons/learning-icon.svg",
    tokens: categorySpecificSpending.value.Learning
  },
  {
    label: "Possesions",
    value: "Possesions",
    icon: "/icons/possesion-icon.svg",
    tokens: categorySpecificSpending.value.Possesions
  },
  {
    label: "Proffesion",
    value: "Proffesion",
    icon: "/icons/proffesion-icon.svg",
    tokens: categorySpecificSpending.value.Proffesion
  },
  {
    label: "Relationships",
    value: "Relationships",
    icon: "/icons/relationship-icon.svg",
    tokens: categorySpecificSpending.value.Relationships
  },
  {
    label: "The Other",
    value: "Other",
    icon: "/icons/others-icon.svg",
    tokens: categorySpecificSpending.value.Other
  },
  {
    label: "Travelling",
    value: "Travelling",
    icon: "/icons/travelling-icon.svg",
    tokens: categorySpecificSpending.value.Travelling
  }
] as specificSpending[]);

const selectedCategory = ref({
  label: "Events",
  value: "Events",
  icon: "/icons/events-icon.svg",
  tokens: 0
});

// Update selectedCategory tokens when category changes
watch(() => selectedCategory.value.value, (newValue) => {
  const category = options.value.find(opt => opt.value === newValue);
  if (category) {
    selectedCategory.value = { ...category };
  }
}, { immediate: true });
</script>
<style scoped lang="scss">
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
    // background-color: pink;
    height: 3.6rem;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1rem;
    margin-bottom: 0.5rem;
    border-radius: 0.8rem;

    .karmaGainedTitleDiv {
      width: 0.8rem;
      display: flex;

      .karmaGainedTitle {
        color: white;
        font-size: 0.7rem;
        font-family: poppins;
        line-height: 0.9rem;
        text-transform: Uppercase;
      }
    }

    .overwievDonationsDiv {
      margin-left: 4.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      position: fixed;

      .karmaGainedImgGift {
        height: 1.7rem;
        margin-right: 0.5rem;
        margin-bottom: 0.2rem;
      }

      .karmaGainedDescription {
        color: white;
        font-family: poppins;
        font-size: 0.9rem;
      }
    }

    .karmaValue {
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
    justify-content: space-between;
    padding: 0rem 1rem;
    margin: 0 auto;
    border-radius: 0.8rem;
    width: 100%;
    height: 3.8rem;

    .usedOnStats-title {
      color: white;
      font-size: 0.7rem;
      font-family: poppins;
      line-height: 0.9rem;
      text-transform: Uppercase;
      width: 0.8rem;
    }
    .usedOnStats-categories {
      position: fixed;
      margin-left: 2.8rem;
    }
    .usedOnStats-value {
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
