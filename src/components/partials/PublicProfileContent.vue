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

    <!-- Donor: profile menu list -->
    <div v-if="isDonorSide" class="publicProfileMenu">
      <ProfileMenuItem
        :label="`${t('reviews')} (${counts.reviews})`"
        icon-src="/icons/starIcon.svg"
        @click="goToReviews"
      />
      <ProfileMenuItem
        :label="`${t('contributions')} (${counts.contributions})`"
        icon-src="/icons/redGiftIcon.svg"
        @click="goToContributions"
      />
      <ProfileMenuItem
        :label="`${t('dreams')} (${counts.dreams})`"
        icon-src="/icons/redCloudIcon.svg"
        @click="goToPosts('dream')"
      />
      <ProfileMenuItem
        :label="`${t('problems')} (${counts.problems})`"
        icon-src="/icons/problemIcon.svg"
        @click="goToPosts('problem')"
      />
      <ProfileMenuItem
        :label="`${t('ideas')} (${counts.ideas})`"
        icon-src="/icons/ideaIcon.svg"
        @click="goToPosts('idea')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { api } from "boot/axios";
import UserAvatar from "src/components/common/UserAvatar.vue";
import { translateCityName, translateCountryName } from "src/utils/cityNames";
import PageTitle from "src/components/ui/PageTitle.vue";
import ProfileMenuItem from "src/components/common/ProfileMenuItem.vue";
import { normalizePost } from "src/utils/normalizePost";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

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

const isDonorSide = computed(() => route.meta?.side === "donor");

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

type MenuCounts = {
  reviews: number;
  contributions: number;
  dreams: number;
  problems: number;
  ideas: number;
};

const counts = ref<MenuCounts>({
  reviews: 0,
  contributions: 0,
  dreams: 0,
  problems: 0,
  ideas: 0
});

let countsAbort: AbortController | null = null;

const loadCategoryCount = async (category: "dream" | "problem" | "idea"): Promise<number> => {
  const userId = props.userData?.id;
  if (!userId) return 0;

  try {
    const { data } = await api.get("/posts", {
      params: { category },
      signal: countsAbort?.signal
    });
    const rawPosts = (data?.data || data?.posts || data || []) as unknown[];
    const normalized = rawPosts.map((p) => normalizePost(p as never));
    return normalized.filter((p) => (p.user_id || p.author_id) === userId).length;
  } catch {
    return 0;
  }
};

const refreshCounts = async () => {
  if (!isDonorSide.value) return;
  if (!props.userData?.id) return;

  if (countsAbort) countsAbort.abort();
  countsAbort = new AbortController();

  // Safe-first: reviews & contributions counts are not implemented yet
  counts.value.reviews = 0;
  counts.value.contributions = 0;

  const [dreams, problems, ideas] = await Promise.all([
    loadCategoryCount("dream"),
    loadCategoryCount("problem"),
    loadCategoryCount("idea")
  ]);

  counts.value.dreams = dreams;
  counts.value.problems = problems;
  counts.value.ideas = ideas;
};

onMounted(() => {
  void refreshCounts();
});

watch(
  () => props.userData?.id,
  () => {
    void refreshCounts();
  }
);

const goToReviews = () => {
  const userId = props.userData?.id;
  if (!userId) return;
  router.push({ name: "donor-user-reviews", params: { userId: String(userId) } });
};

const goToContributions = () => {
  const userId = props.userData?.id;
  if (!userId) return;
  router.push({ name: "donor-user-contributions", params: { userId: String(userId) } });
};

const goToPosts = (type: "dream" | "problem" | "idea") => {
  const userId = props.userData?.id;
  if (!userId) return;
  router.push({
    name: "donor-user-posts-type",
    params: { userId: String(userId), type }
  });
};
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

.publicProfileMenu {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 0 24px 0;
}
</style>
