<template>
  <div class="stats-Page">
    <div class="stats-main" style="min-height: 740px">
      <div v-if="loadError" class="tokenShop-error">
        <div class="tokenShop-errorText">{{ loadError }}</div>
        <q-btn
          class="tokenShop-retryBtn"
          unelevated
          no-caps
          color="primary"
          :disable="authStore.loading"
          @click="handleRetry"
        >
          {{ retryLabel }}
        </q-btn>
      </div>
      <div class="karmaAvailable-stats">
        <div class="karmaDisplay">
          <img src="/icons/KarmaIcon.png" alt="" />
          <span>{{ formatNumber(tokenBalance) }}</span>
        </div>
        <span>Available Tokens</span>
      </div>
      <div class="tokenShop-header">
        <h2>More Tokens</h2>
      </div>

      <div class="shopTable-stats">
        <div
          v-for="(card, i) in cards"
          :key="i"
          class="statsPage-cardsContainer"
        >
          <div class="tokenShop-card">
            <div class="cardImg">
              <img :src="card.tokens.img" alt="" />
            </div>
            <div class="cardDescription">
              <span
                >{{ card.description }} Tokens
                <span class="descriptionBolder"
                  >({{ card.tokens.amount }})</span
                >
              </span>
            </div>
            <div class="cardPrice">
              <span>{{ card.tokens.price }}€</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { PriceCards } from "src/components/models";
import { formatNumber } from "src/components/partials/FunctionsComponent.vue";
import { useAuthStore } from "src/stores/auth";
import { mapAxiosErrorToDhError } from "src/utils/httpError";
import { tGlobal } from "src/utils/i18nGlobal";

const authStore = useAuthStore();
const { t } = useI18n();
const loadError = ref<string | null>(null);
const retryLabel = computed(() => {
  const label = t("common.actions.retry");
  return label === "common.actions.retry" ? "Retry" : label;
});

// Use auth store tokens - must match tokenBalance in DonorMainLayout
const tokenBalance = computed(() => authStore.user?.tokens ?? 30);

// Fetch user data on mount if not loaded
onMounted(async () => {
  if (authStore.isAuthenticated && !authStore.user) {
    try {
      loadError.value = null;
      await authStore.fetchUser();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.debug("Failed to fetch user data:", error);
      }
      const mapped = mapAxiosErrorToDhError(error);
      loadError.value = tGlobal(mapped.messageKey, mapped.fallbackMessage);
    }
  }
});

const handleRetry = async () => {
  if (!authStore.isAuthenticated) return;
  loadError.value = null;
  try {
    await authStore.fetchUser();
  } catch (error) {
    const mapped = mapAxiosErrorToDhError(error);
    loadError.value = tGlobal(mapped.messageKey, mapped.fallbackMessage);
  }
};
const cards = ref([
  {
    description: "Fist full of",
    tokens: {
      amount: "100",
      price: 1.99,
      img: "/icons/KarmaIcon.png"
    }
  },
  {
    description: "Hands full of",
    tokens: {
      amount: "500",
      price: 3.99,
      img: "/icons/karmaIcon-500.svg"
    }
  },
  {
    description: "Wallet full of",
    tokens: {
      amount: "1.000",
      price: 6.99,
      img: "/icons/karmaIcon-1000.svg"
    }
  },
  {
    description: "Bag full of",
    tokens: {
      amount: "2.500",
      price: 11.99,
      img: "/icons/karmaIcon-2000.svg"
    }
  },
  {
    description: "Chest full of",
    tokens: {
      amount: "5.000",
      price: 19.99,
      img: "/icons/karmaIcon-5000.svg"
    }
  },
  {
    description: "Truck full of",
    tokens: {
      amount: "10.000",
      price: 36.99,
      img: "/icons/karmaIcon-10000.svg"
    }
  }
] as PriceCards[]);
</script>

<style scoped lang="scss">
.statsPage-cardsContainer {
  display: flex;
  margin: 0 0.3rem;
}
.stats-Page {
}

.tokenShop-error {
  width: 90%;
  margin: 1rem auto 0.25rem;
  padding: 0.85rem 0.9rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
}

.tokenShop-errorText {
  font-family: poppins;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.75);
}

.tokenShop-retryBtn {
  margin-top: 0.6rem;
}

.karmaAvailable-stats {
  background: rgba(47, 42, 42, 0.499);
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 90%;
  height: 3rem;
  border: 0.01rem solid rgb(90, 14, 41);
  border-radius: 0.7rem;
  padding: 0 1rem;
  margin: 2rem auto;

  .karmaDisplay {
    display: flex;
    align-items: center;
    width: 5rem;
    justify-content: space-around;

    img {
      height: 1.2rem;
      margin-right: 0.4rem;
    }

    span {
      font-family: poppinsBold;
      color: #f3f3f3aa;
      font-size: 1.1rem;
    }
  }

  span {
    color: white;
    font-family: poppinsSemiBold;
    font-size: 1rem;
  }
}

.tokenShop-header {
  display: flex;
  justify-content: center;

  h2 {
    margin: 0 auto;
    color: white;
    font-size: 2rem;
    font-family: poppinsSemiBold;
  }

  margin-bottom: 1rem;
}

.shopTable-stats {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;

  margin-bottom: 3.5rem !important;
  .tokenShop-card {
    margin: 0.4rem 0rem;
    background: linear-gradient(
      268.92deg,
      rgba(73, 54, 97, 0.338) 2.69%,
      rgba(36, 27, 36, 0.544) 100%
    );
    backdrop-filter: blur(10px);
    display: flex;
    height: 11rem;
    width: 11.5rem;
    border-radius: 1rem;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    .cardImg {
      img {
        height: 2.5rem;
      }
    }

    .cardDescription {
      color: $primary;
      font-size: 1.1rem;
      text-align: center;
      padding: 0 0.5rem;

      .descriptionBolder {
        font-family: poppinsBold !important;
      }
    }

    .cardPrice {
      color: white;
      font-family: poppinsSemiBold;
      font-size: 1.2rem;
      margin-top: 0.2rem;
    }
  }
}
</style>
