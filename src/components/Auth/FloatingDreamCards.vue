<template>
  <div class="floating-cards">
    <div
      v-for="(dream, index) in displayDreams"
      :key="dream.id || index"
      :class="['card', `card--${index}`]"
      :style="getCardStyle(dream, index)"
    >
      <img
        :src="dream.imageUrl || placeholderImage"
        :alt="dream.title"
        class="card-image"
        @error="handleImageError"
      />
      <div class="card-info">
        <span class="card-author">{{ dream.authorName }}</span>
        <span class="card-title">{{ dream.title }}</span>
        <img
          :src="dream.avatarUrl || placeholderAvatar"
          :alt="dream.authorName"
          class="card-avatar"
          @error="handleAvatarError"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

export interface CompletedDream {
  id: number;
  title: string;
  authorName: string;
  avatarUrl: string;
  imageUrl: string;
  locationLabel: string; // napr. "Iceland, Reykjavik"
  mapX: number; // 0-100 - horizontálna pozícia na mape v percentách
  mapY: number; // 0-100 - vertikálna pozícia na mape v percentách
  completedAt: string; // ISO dátum
}

const props = defineProps<{
  dreams?: CompletedDream[];
}>();

// Placeholder images - použijeme existujúce obrázky z assets
import placeholderImage from "src/assets/Auth/islandImg.png";
import placeholderAvatar from "src/assets/Auth/profilePicture.jpeg";
import teslaImage from "src/assets/Auth/teslaImg.png";
import surgeryImage from "src/assets/Auth/surgeryImg.png";

// Aurora používa rovnaký obrázok ako placeholder
const auroraImage = placeholderImage;

// Zobrazíme vždy 3 karty (doplníme placeholdermi ak treba)
const displayDreams = computed(() => {
  const dreams = props.dreams || [];
  const defaultDreams: CompletedDream[] = [
    {
      id: 1,
      title: "Aurora Expedition",
      authorName: "Felix Dhomberg",
      avatarUrl: placeholderAvatar,
      imageUrl: auroraImage,
      locationLabel: "Iceland, Reykjavik",
      mapX: 50,
      mapY: 20,
      completedAt: new Date().toISOString()
    },
    {
      id: 2,
      title: "Driving Tesla",
      authorName: "Katie Horvath",
      avatarUrl: placeholderAvatar,
      imageUrl: teslaImage,
      locationLabel: "USA, California",
      mapX: 20,
      mapY: 40,
      completedAt: new Date().toISOString()
    },
    {
      id: 3,
      title: "Eyes Surgery",
      authorName: "Eric Doe",
      avatarUrl: placeholderAvatar,
      imageUrl: surgeryImage,
      locationLabel: "Germany, Berlin",
      mapX: 80,
      mapY: 40,
      completedAt: new Date().toISOString()
    }
  ];

  // Ak máme reálne dáta, použijeme ich, inak použijeme default
  const result = dreams.length > 0 ? [...dreams] : [...defaultDreams];

  // Doplníme na 3 karty placeholdermi ak treba
  while (result.length < 3) {
    result.push({
      id: result.length + 1,
      title: "Dream",
      authorName: "User",
      avatarUrl: placeholderAvatar,
      imageUrl: placeholderImage,
      locationLabel: "Unknown",
      mapX: 50,
      mapY: 50,
      completedAt: new Date().toISOString()
    });
  }

  return result.slice(0, 3);
});

const getCardStyle = (dream: CompletedDream, index: number) => {
  // Pozície podľa indexu (môžeme neskôr použiť mapX, mapY)
  const positions = [
    { top: "0%", left: "50%", transform: "translateX(-50%) rotate(-3deg)" },
    { top: "25%", left: "12%", transform: "rotate(-6deg)" },
    { top: "25%", right: "8%", transform: "rotate(4deg)" }
  ];

  return positions[index] || {};
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = placeholderImage;
};

const handleAvatarError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = placeholderAvatar;
};
</script>

<style lang="scss" scoped>
.floating-cards {
  position: absolute;
  top: 8%;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 390px;
  height: 50%;
  pointer-events: none;
  z-index: 2;
}

.floating-cards .card {
  position: absolute;
  width: 200px;
  border-radius: 16px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  animation: float 6s ease-in-out infinite alternate;
  --rotate: 0deg;
}

.card--0 {
  top: 0;
  left: 50%;
  transform: translateX(-50%) rotate(-3deg);
  --rotate: -3deg;
  animation: float 6s ease-in-out infinite alternate;
}

.card--1 {
  top: 25%;
  left: 12%;
  transform: rotate(-6deg);
  --rotate: -6deg;
  animation: float 6s ease-in-out infinite alternate;
  animation-delay: -2s;
}

.card--2 {
  top: 25%;
  right: 8%;
  transform: rotate(4deg);
  --rotate: 4deg;
  animation: float 6s ease-in-out infinite alternate;
  animation-delay: -4s;
}

@keyframes float {
  0% {
    transform: translateY(0) rotate(var(--rotate, 0deg));
  }
  100% {
    transform: translateY(-10px) rotate(calc(var(--rotate, 0deg) + 1.5deg));
  }
}

.card-image {
  width: 100%;
  height: 120px;
  object-fit: cover;
  display: block;
}

.card-info {
  padding: 12px;
  background: linear-gradient(180deg, rgba(45, 16, 57, 0.9) 0%, rgba(26, 11, 46, 0.95) 100%);
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;
}

.card-author {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

.card-title {
  font-size: 0.9rem;
  color: #ffffff;
  font-weight: 600;
}

.card-avatar {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid rgba(255, 44, 139, 0.5);
}
</style>
