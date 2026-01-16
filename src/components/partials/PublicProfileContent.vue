<template>
  <div class="myProfile">
    <!-- Profile Header (read-only, no click actions) - same as my profile -->
    <div class="myProfile-header">
      <div class="myProfile-avatarContainer">
        <div class="myProfile-avatarWrapper">
          <UserAvatar
            :image-url="props.userData?.profile_picture || null"
            :name="displayName"
            size="120px"
          />
          <!-- Badge display on avatar (if user has selected badge) -->
          <img
            v-if="props.userData?.selected_badge"
            :src="props.userData.selected_badge"
            :alt="displayName"
            class="myProfile-avatarBadge"
          />
        </div>
      </div>
      <div class="myProfile-info">
        <h2 class="myProfile-username">{{ displayName }}</h2>
        <p v-if="displayLocation" class="myProfile-location">{{ displayLocation }}</p>
        <div v-if="displayBio" class="myProfile-bioSection">
          <PageTitle :title="`About ${displayName}`" />
          <p class="myProfile-bio">{{ displayBio }}</p>
        </div>
      </div>
    </div>

    <!-- Note: Settings button is NOT shown for public profiles -->
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import UserAvatar from "src/components/common/UserAvatar.vue";
import { translateCityName, translateCountryName } from "src/utils/cityNames";
import PageTitle from "src/components/ui/PageTitle.vue";

const { t } = useI18n();

interface PublicUser {
  id: number;
  username?: string;
  name?: string;
  email?: string;
  bio?: string | null;
  profile_picture?: string | null;
  tokens?: number;
  posts_count?: number;
  followers_count?: number;
  following_count?: number;
  selected_badge?: string | null;
  role?: string;
  location_city?: string | null;
  location_country?: string | null;
  location_continent?: string | null;
}

interface Props {
  userData: PublicUser | null;
}

const props = defineProps<Props>();

const displayName = computed(() => {
  return props.userData?.name || props.userData?.username || "User";
});

const displayLocation = computed(() => {
  const u = props.userData;
  if (!u) return null;

  // Build location string from user's location (city, country, continent)
  // Note: We need to get locale from i18n, but this component doesn't use i18n yet
  // For now, we'll use a simple approach - can be enhanced later
  const getLocale = () => {
    try {
      const savedLang = localStorage.getItem("dreamhubb_language");
      return savedLang === "sk" ? "sk" : "en-US";
    } catch {
      return "en-US";
    }
  };

  const currentLocale = getLocale();
  const parts = [];
  if (u.location_city) {
    const translatedCity = translateCityName(u.location_city, currentLocale);
    parts.push(translatedCity);
  }
  if (u.location_country) {
    const translatedCountry = translateCountryName(u.location_country, currentLocale);
    parts.push(translatedCountry);
  }
  if (u.location_continent && !parts.length) parts.push(u.location_continent);

  return parts.length > 0 ? parts.join(", ") : null;
});

const displayBio = computed(() => {
  const bio = props.userData?.bio;
  if (!bio) return null;
  const trimmed = bio.trim();
  return trimmed.length > 0 ? trimmed : null;
});
</script>

<style scoped lang="scss">
.myProfile {
  padding: 2rem 1rem;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.myProfile-header {
  width: 100%;
  max-width: 400px;
  text-align: center;
  margin-bottom: 2rem;
}

.myProfile-avatarContainer {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
  // No cursor pointer for public profile (no click action)
}

.myProfile-avatarWrapper {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto;
}

.myProfile-avatarBadge {
  position: absolute;
  bottom: -16px;
  left: 50%;
  transform: translateX(-50%);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid #1a1a1a;
  background: #1a1a1a;
  object-fit: contain;
  z-index: 10;
}

.myProfile-info {
  color: white;
}

.myProfile-username {
  font-size: 1.8rem;
  font-weight: 700;
  font-family: poppinsSemiBold;
  margin-bottom: 0.5rem;
  color: white;
}

.myProfile-location {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 1rem;
  font-family: poppins;
}

.myProfile-email {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 1rem;
  font-family: poppins;
}

.myProfile-tokens,
.myProfile-role {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-family: poppins;
}

.myProfile-tokensLabel,
.myProfile-roleLabel {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
}

.myProfile-tokensValue,
.myProfile-roleValue {
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
}

.myProfile-bioSection {
  margin-top: 1.5rem;
  padding-top: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: left;
  width: 100%;
}

.myProfile-bio {
  font-size: 0.95rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-family: poppins;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
