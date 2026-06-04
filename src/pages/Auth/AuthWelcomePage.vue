<template>
  <q-page class="authWelcome">
    <!-- Background gradient -->
    <div class="authWelcome-background"></div>

    <!-- Map wrapper with proper positioning -->
    <div class="auth-map-wrapper">
      <img
        :src="mapImage"
        alt="World map"
        class="auth-map"
        @error="handleMapError"
      />
    </div>

    <!-- Floating dream cards with slot system -->
    <div class="auth-floating-cards">
      <div
        v-for="card in activeCards"
        :key="card.id"
        class="auth-card"
        :style="{
          top: getSlotPosition(card.slotId).top,
          left: getSlotPosition(card.slotId).left
        }"
      >
        <img :src="card.imageUrl" alt="" class="auth-card_image" />
        <div class="auth-card_footer">
          <div class="auth-card_user">
            <img :src="card.avatarUrl" alt="" class="auth-card_avatar" />
            <div class="auth-card_user-text">
              <div class="auth-card_user-name">{{ card.userName }}</div>
              <div class="auth-card_title">{{ card.title }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="authWelcome-content">
      <!-- Logo and tagline -->
      <div class="authWelcome-brand">
        <img
          :src="logoImage"
          alt="dreamhubb logo"
          class="authWelcome-logo"
        />
        <p class="authWelcome-tagline">&apos;Cause dreams matter.</p>
      </div>

      <!-- CTA buttons -->
      <div class="authWelcome-actions">
        <button class="authWelcome-btn auth-cta-primary" @click="handleSignIn">
          SIGN IN
        </button>
        <button class="authWelcome-btn auth-cta-secondary" @click="handleCreateAccount">
          CREATE AN ACCOUNT
        </button>

        <!-- Help button -->
        <button class="authWelcome-help" @click="handleHelp">
          <q-icon name="help_outline" />
          <span class="authWelcome-help_badge"></span>
        </button>
      </div>

      <AuthLegalNotice class="authWelcome-legal" />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import AuthLegalNotice from "src/components/Auth/AuthLegalNotice.vue";
import { useRouter } from "vue-router";
import { useOnboardingStore } from "src/stores/onboarding";
import { completedDreamsBank, type CompletedDreamCard } from "src/data/completedDreamsBank";

const router = useRouter();
const onboardingStore = useOnboardingStore();

// Map image
import mapImage from "src/assets/Auth/map-image.svg";
// Logo
import logoImage from "src/assets/logos/dreamhubb.svg";

// Slot definitions
const CARD_SLOTS = [
  { id: "slot-1", top: "10%", left: "15%" }, // Amerika
  { id: "slot-2", top: "18%", left: "50%" }, // Európa
  { id: "slot-3", top: "26%", left: "75%" } // Ázia
];

// Active card interface
interface ActiveCard {
  id: string;
  slotId: string;
  userName: string;
  dreamTitle: string;
  avatarUrl: string;
  imageUrl: string;
}

// State for active cards and queue
const activeCards = ref<ActiveCard[]>([]);
const cardQueue = ref<ActiveCard[]>([]);
const usedCardIds = ref<Set<number>>(new Set());

// Get slot position
function getSlotPosition(slotId: string) {
  const slot = CARD_SLOTS.find((s) => s.id === slotId);
  return slot ? { top: slot.top, left: slot.left } : { top: "0%", left: "0%" };
}

// Check if slot is free
function isSlotFree(slotId: string): boolean {
  return !activeCards.value.some((card) => card.slotId === slotId);
}

// Get random free slot
function getRandomFreeSlot(): string | null {
  const freeSlots = CARD_SLOTS.filter((slot) => isSlotFree(slot.id));
  if (freeSlots.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * freeSlots.length);
  return freeSlots[randomIndex].id;
}

// Get random card from bank (avoid duplicates)
function getRandomCard(): CompletedDreamCard | null {
  const availableCards = completedDreamsBank.filter(
    (card) => !usedCardIds.value.has(card.id)
  );
  if (availableCards.length === 0) {
    // Reset if all cards were used
    usedCardIds.value.clear();
    return completedDreamsBank[Math.floor(Math.random() * completedDreamsBank.length)];
  }
  const randomCard =
    availableCards[Math.floor(Math.random() * availableCards.length)];
  usedCardIds.value.add(randomCard.id);
  return randomCard;
}

// Create ActiveCard from CompletedDreamCard
function createActiveCard(card: CompletedDreamCard, slotId: string): ActiveCard {
  return {
    id: `card-${card.id}-${Date.now()}`,
    slotId,
    userName: card.userName,
    dreamTitle: card.title,
    avatarUrl: card.avatarUrl,
    imageUrl: card.imageUrl
  };
}

// Add new card to display
function tryAddCard() {
  const freeSlot = getRandomFreeSlot();
  if (freeSlot) {
    const card = getRandomCard();
    if (card) {
      const activeCard = createActiveCard(card, freeSlot);
      activeCards.value.push(activeCard);

      // Remove card after 6-7 seconds
      setTimeout(() => {
        const index = activeCards.value.findIndex((c) => c.id === activeCard.id);
        if (index !== -1) {
          activeCards.value.splice(index, 1);

          // Check queue for next card
          if (cardQueue.value.length > 0) {
            const queuedCard = cardQueue.value.shift();
            if (queuedCard) {
              queuedCard.slotId = freeSlot;
              activeCards.value.push(queuedCard);

              // Schedule removal for queued card
              setTimeout(() => {
                const queuedIndex = activeCards.value.findIndex(
                  (c) => c.id === queuedCard.id
                );
                if (queuedIndex !== -1) {
                  activeCards.value.splice(queuedIndex, 1);
                }
              }, 6500);
            }
          }
        }
      }, 6500);
    }
  } else {
    // No free slot, add to queue
    const card = getRandomCard();
    if (card) {
      const queuedCard = createActiveCard(card, "");
      cardQueue.value.push(queuedCard);
    }
  }
}

let intervalId: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  // Start with 1-2 cards
  tryAddCard();
  setTimeout(() => tryAddCard(), 1000);

  // Try to add new card every 4-5 seconds
  intervalId = setInterval(() => {
    tryAddCard();
  }, 4500);
});

onBeforeUnmount(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});

const handleSignIn = () => {
  router.push({ name: "login" });
};

const handleCreateAccount = () => {
  // Reset onboarding store pri začatí nového onboarding-u
  onboardingStore.reset();
  router.push({ name: "onboarding" });
};

const handleHelp = () => {
  router.push({ name: "auth-help-page" });
};

const handleMapError = (event: Event) => {
  // Fallback - skryj obrázok ak sa nenačíta
  const img = event.target as HTMLImageElement;
  img.style.display = "none";
};
</script>

<style lang="scss" scoped>
.authWelcome {
  position: relative;
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0;
  overflow: hidden;
  /* Background from global app (iosSafeArea.scss) */
  background-image: none !important;
  background-color: transparent !important;
}

.authWelcome-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

// Map wrapper
.auth-map-wrapper {
  position: relative;
  padding-top: 5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  width: 100%;
  pointer-events: none;
  z-index: 1;
}

// Mapa v pozadí - nad gradientom, pod floating kartami
.auth-map {
  height: 16rem;
  width: 100%;
  margin-bottom: 2rem;
  object-fit: contain;
  opacity: 0.65;
}

.authWelcome-content {
  position: relative;
  z-index: 3;
  width: 100%;
  max-width: 390px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.5rem;
  margin: 0;
  padding: 0 1rem;
}

.authWelcome-brand {
  text-align: center;
}

.authWelcome-logo {
  max-width: 220px;
  width: 100%;
  height: auto;
  margin: 0 auto 12px;
  display: block;
}

.authWelcome-tagline {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-weight: 400;
  line-height: 1.5;
  text-align: center;
}

.authWelcome-actions {
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  position: relative;
}

.authWelcome-btn {
  width: 100%;
  height: 56px;
  border-radius: 9999px;
  border: none;
  font-size: 1rem;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
  }
}

// Primary CTA - brand farba #BD0043
.auth-cta-primary {
  background: #BD0043;
  color: #ffffff;
  font-weight: 600;
  box-shadow: 0 8px 24px rgba(189, 0, 67, 0.3);

  &:hover {
    background: #a0003a;
    box-shadow: 0 12px 32px rgba(189, 0, 67, 0.4);
  }

  &:focus {
    outline: 2px solid #BD0043;
    outline-offset: 2px;
  }
}

// Secondary CTA - brand farba #BD0043
.auth-cta-secondary {
  background: rgba(0, 0, 0, 0.35);
  border-radius: 999px;
  border: 1px solid #BD0043;
  color: #BD0043;
  font-weight: 500;

  &:hover {
    background: rgba(0, 0, 0, 0.45);
    border-color: #BD0043;
    color: #BD0043;
  }

  &:focus {
    outline: 2px solid #BD0043;
    outline-offset: 2px;
  }
}

.authWelcome-help {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.2);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-top: 1rem;
  transition: all 0.2s ease;

  &:hover {
    border-color: rgba(255, 255, 255, 0.4);
    transform: scale(1.05);
  }

  .q-icon {
    font-size: 24px;
    color: rgba(255, 255, 255, 0.6);
  }
}

.authWelcome-help_badge {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #BD0043; // Brand farba
  border: 2px solid #0f0026;
}

// Floating cards - slot system
.auth-floating-cards {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
}

.auth-card {
  position: absolute;
  width: 140px; // Menšie karty (25-30% zmenšenie z 200px)
  border-radius: 16px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  animation: cardFadeIn 0.5s ease-in, float 6s ease-in-out infinite alternate 0.5s;
  opacity: 0;
  animation-fill-mode: forwards;
}

@keyframes cardFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes float {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-8px);
  }
}

.auth-card_image {
  width: 100%;
  height: 90px; // Zmenšené proporčne k menšej šírke karty
  object-fit: cover;
  display: block;
}

.auth-card_footer {
  padding: 12px;
  background: linear-gradient(180deg, rgba(45, 16, 57, 0.9) 0%, rgba(26, 11, 46, 0.95) 100%);
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;
}

.auth-card_user {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.auth-card_user-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.auth-card_user-name {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

.auth-card_title {
  font-size: 0.9rem;
  color: #ffffff;
  font-weight: 600;
}

.auth-card_avatar {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 28px; // Zmenšené proporčne
  height: 28px;
  border-radius: 50%;
  border: 2px solid rgba(189, 0, 67, 0.5); // Brand farba
}

// Responzivita - nad 390px centrálne zarovnanie
@media (min-width: 391px) {
  .authWelcome {
    justify-content: center;
  }

  .auth-map-wrapper {
    max-width: 390px;
  }

  .auth-map {
    max-width: 390px;
  }

  .authWelcome-content {
    max-width: 390px;
  }
}
</style>
