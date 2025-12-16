<template>
  <div class="myProfile">
    <!-- Minimal Profile Header -->
    <div class="myProfile-header">
      <div class="myProfile-avatarContainer" @click="openProfileActions">
        <div class="myProfile-avatarWrapper">
          <div class="myProfile-avatar" v-if="!authStore.user?.profile_picture">
            <span class="myProfile-avatarInitials">{{ userInitials }}</span>
          </div>
          <img
            v-else
            :src="authStore.user.profile_picture"
            alt="Profile"
            class="myProfile-avatarImg"
          />
          <!-- Badge display on avatar -->
          <img
            v-if="selectedBadge"
            :src="selectedBadge.image"
            :alt="selectedBadge.title"
            class="myProfile-avatarBadge"
          />
        </div>
      </div>
      <div class="myProfile-info">
        <h2 class="myProfile-username">{{ displayUsername }}</h2>
        <p v-if="displayLocation" class="myProfile-location">{{ displayLocation }}</p>
        <div class="myProfile-tokens">
          <span class="myProfile-tokensLabel">Tokens:</span>
          <span class="myProfile-tokensValue">{{ displayTokens }}</span>
        </div>
        <div class="myProfile-role">
          <span class="myProfile-roleLabel">Role:</span>
          <span class="myProfile-roleValue">{{ currentRole }}</span>
        </div>
        <div v-if="displayBio" class="myProfile-bioSection">
          <h3 class="myProfile-bioLabel">{{ t("about") }}</h3>
          <p class="myProfile-bio">{{ displayBio }}</p>
        </div>
      </div>
    </div>

    <!-- Settings Button -->
    <div class="myProfile-actions">
      <q-btn
        class="myProfile-settingsBtn"
        @click="goToSettings"
      >
        {{ t("settings") }}
      </q-btn>
    </div>

    <!-- Profile Actions Sheet -->
    <ProfileActionsSheet
      v-model="isProfileActionsOpen"
      :user="authStore.user"
      @view-photo="handleViewPhoto"
      @change-photo="handleChangePhoto"
      @select-badge="handleSelectBadge"
      @share-profile="handleShareProfile"
    />

    <!-- Profile Photo Lightbox -->
    <q-dialog v-model="isPhotoLightboxOpen" maximized class="photo-lightbox-dialog">
      <q-card class="photo-lightbox-card">
        <q-btn
          flat
          round
          dense
          icon="close"
          class="photo-lightbox-close"
          @click="closePhotoLightbox"
        />
        <div class="photo-lightbox-content">
          <img
            v-if="authStore.user?.profile_picture"
            :src="authStore.user.profile_picture"
            alt="Profile photo"
            class="photo-lightbox-image"
          />
        </div>
      </q-card>
    </q-dialog>

    <!-- Share Profile Sheet -->
    <ShareProfileSheet
      v-model="isShareProfileOpen"
      :profile-url="profileShareUrl"
      :profile-title="shareProfileTitle"
      :profile-text="shareProfileText"
    />

    <!-- Badge Selector Drawer -->
    <div
      v-if="isBadgeSelectorOpen"
      class="badgeSelector-overlay"
      @click="closeBadgeSelector"
    >
      <q-card
        class="badgeSelector-drawer"
        :class="{ dragging: badgeIsDragging }"
        :style="{ transform: `translateY(${badgeDragOffset}px)` }"
        @click.stop
        @touchstart.passive="onBadgeTouchStart"
        @touchmove.passive="onBadgeTouchMove"
        @touchend.passive="onBadgeTouchEnd"
        @mousedown="onBadgeMouseDown"
      >
        <q-card-section
          class="badgeSelector-header"
          @touchstart.passive="onBadgeTouchStart"
          @mousedown="onBadgeMouseDown"
        >
          <div
            class="badgeSelector-handle"
            @touchstart.passive="onBadgeTouchStart"
            @mousedown="onBadgeMouseDown"
          ></div>
          <h3 class="badgeSelector-title">{{ t("selectBadgeToDisplay") }}</h3>
        </q-card-section>
        <q-card-section
          class="badgeSelector-content"
          :style="{ maxHeight: badgeSelectorMaxHeight }"
        >
          <BadgeSwiperComponent
            :opened-fully="badgeSelectorFullyOpened"
            @badge-selected="handleBadgeSelected"
          />
        </q-card-section>
        <q-card-section class="badgeSelector-footer">
          <p class="badgeSelector-description">{{ t("earnMoreBadges") }}</p>
          <q-btn class="badgeSelector-saveBtn" @click="saveBadge">
            {{ t("saveBadge") }}
          </q-btn>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useI18n } from "vue-i18n";
import { translateCityName, translateCountryName } from "src/utils/cityNames";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "src/stores/auth";
import { formatNumber } from "src/components/partials/FunctionsComponent.vue";
import ProfileActionsSheet from "src/components/profile/ProfileActionsSheet.vue";
import ShareProfileSheet from "src/components/profile/ShareProfileSheet.vue";
import BadgeSwiperComponent from "src/components/partials/BadgeSwiperComponent.vue";
import { api } from "src/boot/axios";
import { Notify } from "quasar";

const { t, locale } = useI18n();

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const isProfileActionsOpen = ref(false);
const isPhotoLightboxOpen = ref(false);
const isShareProfileOpen = ref(false);
const isBadgeSelectorOpen = ref(false);
const isUploading = ref(false);
const selectedBadge = ref<{ image: string; title: string } | null>(null);
const tempSelectedBadge = ref<{ image: string; title: string } | null>(null);

// Badge selector drag handlers
const badgeDragOffset = ref(0);
const badgeStartY = ref(0);
const badgeIsDragging = ref(false);
const badgeSelectorFullyOpened = ref(false);
const BADGE_DRAG_THRESHOLD = 60;
const BADGE_EXPAND_THRESHOLD = -80; // Negative for upward drag

// Computed max height for badge selector content
const badgeSelectorMaxHeight = computed(() => {
  if (badgeSelectorFullyOpened.value) {
    return "60vh";
  }
  return "300px"; // Height for 6 badges (2 rows x 3 columns)
});

// Watch badge selector open/close to hide footer
watch(
  () => isBadgeSelectorOpen.value,
  (isOpen) => {
    if (isOpen) {
      document.body.classList.add("bottom-sheet-open");
    } else {
      document.body.classList.remove("bottom-sheet-open");
      badgeDragOffset.value = 0;
    }
  }
);

const onBadgeTouchStart = (e: TouchEvent) => {
  badgeStartY.value = e.touches[0].clientY;
  badgeIsDragging.value = true;
};

const onBadgeTouchMove = (e: TouchEvent) => {
  if (!badgeIsDragging.value) return;
  const currentY = e.touches[0].clientY;
  const deltaY = currentY - badgeStartY.value;
  // Allow both downward (close) and upward (expand) drag
  if (deltaY > 0) {
    badgeDragOffset.value = deltaY;
  } else if (deltaY < 0 && !badgeSelectorFullyOpened.value) {
    // Upward drag to expand
    badgeDragOffset.value = deltaY;
    if (Math.abs(deltaY) >= Math.abs(BADGE_EXPAND_THRESHOLD)) {
      badgeSelectorFullyOpened.value = true;
      badgeDragOffset.value = 0;
    }
  }
};

const onBadgeTouchEnd = () => {
  if (!badgeIsDragging.value) return;
  badgeIsDragging.value = false;
  if (badgeDragOffset.value >= BADGE_DRAG_THRESHOLD) {
    closeBadgeSelector();
  } else {
    badgeDragOffset.value = 0;
  }
};

const onBadgeMouseDown = (e: MouseEvent) => {
  badgeStartY.value = e.clientY;
  badgeIsDragging.value = true;
  document.addEventListener("mousemove", onBadgeMouseMove);
  document.addEventListener("mouseup", onBadgeMouseUp);
};

const onBadgeMouseMove = (e: MouseEvent) => {
  if (!badgeIsDragging.value) return;
  const deltaY = e.clientY - badgeStartY.value;
  // Allow both downward (close) and upward (expand) drag
  if (deltaY > 0) {
    badgeDragOffset.value = deltaY;
  } else if (deltaY < 0 && !badgeSelectorFullyOpened.value) {
    // Upward drag to expand
    badgeDragOffset.value = deltaY;
    if (Math.abs(deltaY) >= Math.abs(BADGE_EXPAND_THRESHOLD)) {
      badgeSelectorFullyOpened.value = true;
      badgeDragOffset.value = 0;
    }
  }
};

const onBadgeMouseUp = () => {
  if (!badgeIsDragging.value) return;
  badgeIsDragging.value = false;
  document.removeEventListener("mousemove", onBadgeMouseMove);
  document.removeEventListener("mouseup", onBadgeMouseUp);
  if (badgeDragOffset.value >= BADGE_DRAG_THRESHOLD) {
    closeBadgeSelector();
  } else {
    badgeDragOffset.value = 0;
  }
};

const profileShareUrl = computed(() => {
  const username = authStore.user?.username || "user";
  return `${window.location.origin}/u/${username}`;
});

const shareProfileTitle = computed(() => {
  return `${authStore.user?.username || "User"}'s Profile`;
});

const shareProfileText = computed(() => {
  return `Check out ${authStore.user?.username || "this user"}'s profile on dreamhubb`;
});

// Get current role from route name
const currentRole = computed(() => {
  const routeName = route.name?.toString() || "";
  return routeName.startsWith("donee") ? "Donee" : "Donor";
});

// Get user initials for avatar placeholder
const userInitials = computed(() => {
  const username = authStore.user?.username || "";
  if (!username) return "U";
  const parts = username.split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return username.substring(0, 2).toUpperCase();
});

// Display username
const displayUsername = computed(() => {
  return authStore.user?.username || "User";
});

// Display tokens - must match tokenBalance in DonorMainLayout
const displayTokens = computed(() => {
  const tokens = authStore.user?.tokens;
  if (tokens !== undefined && tokens !== null) {
    return formatNumber(tokens);
  }
  // Fallback to 30 to match DonorMainLayout tokenBalance fallback
  return formatNumber(30);
});

// Display bio
const displayBio = computed(() => {
  return authStore.user?.bio?.trim() || null;
});

// Display location
const displayLocation = computed(() => {
  const user = authStore.user;
  if (!user) return null;

  if (process.env.NODE_ENV === "development") {
    console.log("📍 ProfileContent displayLocation:", {
      user_id: user.id,
      username: user.username,
      location_city: user.location_city,
      location_country: user.location_country,
      location_continent: user.location_continent,
      location_city_id: user.location_city_id,
      location_country_id: user.location_country_id,
      location_continent_id: user.location_continent_id
    });
  }

  // Build location string from user's location (city, country, continent)
  const parts = [];
  if (user.location_city) {
    const translatedCity = translateCityName(user.location_city, locale.value as string);
    parts.push(translatedCity);
  }
  if (user.location_country) {
    const translatedCountry = translateCountryName(user.location_country, locale.value as string);
    parts.push(translatedCountry);
  }
  if (user.location_continent && !parts.length) parts.push(user.location_continent);

  return parts.length > 0 ? parts.join(", ") : null;
});

// Navigate to settings
const goToSettings = () => {
  const routeName = route.name?.toString() || "";
  if (routeName.startsWith("donee")) {
    router.push({ name: "donee-settings" });
  } else {
    router.push({ name: "donor-settings" });
  }
};

// Open profile actions sheet
const openProfileActions = () => {
  isProfileActionsOpen.value = true;
};

// Handle view photo
const handleViewPhoto = () => {
  isProfileActionsOpen.value = false;
  if (authStore.user?.profile_picture) {
    isPhotoLightboxOpen.value = true;
  } else {
    Notify.create({
      type: "info",
      message: "Profile photo is not set yet.",
      position: "top",
      timeout: 3000
    });
  }
};

// Close photo lightbox and return to profile actions
const closePhotoLightbox = () => {
  isPhotoLightboxOpen.value = false;
  // Return to profile actions sheet after a short delay
  setTimeout(() => {
    isProfileActionsOpen.value = true;
  }, 300);
};

// Handle change photo
const handleChangePhoto = () => {
  isProfileActionsOpen.value = false;
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    isUploading.value = true;
    try {
      // Use the backend endpoint directly - it handles upload and DB update
      const formData = new FormData();
      formData.append("file", file);
      const response = await api.post("/user/profile-picture", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      if (response.data && (response.data.status === "success" || response.data.user)) {
        // Update auth store with response data
        if (response.data.user) {
          if (authStore.user) {
            authStore.user.profile_picture = response.data.user.profile_picture;
            authStore.user.profile_picture_public_id = response.data.user.profile_picture_public_id;
          }
        }
        // Refresh user data to ensure consistency
        await authStore.fetchUser();

        Notify.create({
          type: "positive",
          message: "Profile photo updated successfully",
          position: "top",
          timeout: 3000
        });
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to upload profile photo:", error);
      }
      Notify.create({
        type: "negative",
        message: "Failed to upload photo. Please try again.",
        position: "top",
        timeout: 3000
      });
    } finally {
      isUploading.value = false;
    }
  };
  input.click();
};

// Handle select badge
const handleSelectBadge = () => {
  isProfileActionsOpen.value = false;
  // Load saved badge if exists
  const savedBadge = localStorage.getItem("userSelectedBadge");
  if (savedBadge) {
    try {
      selectedBadge.value = JSON.parse(savedBadge);
    } catch (e) {
      // Ignore parse errors
    }
  }
  badgeSelectorFullyOpened.value = false;
  badgeDragOffset.value = 0;
  isBadgeSelectorOpen.value = true;
};

const closeBadgeSelector = () => {
  isBadgeSelectorOpen.value = false;
  tempSelectedBadge.value = null;
  badgeSelectorFullyOpened.value = false;
  badgeDragOffset.value = 0;
};

const handleBadgeSelected = (badge: { image: string; title: string }) => {
  tempSelectedBadge.value = badge;
};

const saveBadge = async () => {
  if (tempSelectedBadge.value) {
    // Update selectedBadge immediately for UI feedback
    selectedBadge.value = { ...tempSelectedBadge.value };
    localStorage.setItem("userSelectedBadge", JSON.stringify(tempSelectedBadge.value));

    // Save to backend if possible
    try {
      // Try to find badge_id from badge data (if available)
      // For now, we'll save the badge image URL or key to a custom field
      // If BE supports badge_id, we can update this
      await api.put("/user/update", {
        selected_badge: tempSelectedBadge.value.image // or badge_id if available
      });
    } catch (error) {
      // If BE doesn't support selected_badge yet, just use localStorage
      if (process.env.NODE_ENV === "development") {
        console.warn("Failed to save badge to backend, using localStorage only:", error);
      }
    }

    closeBadgeSelector();
    Notify.create({
      type: "positive",
      message: "Badge saved successfully",
      position: "top",
      timeout: 3000
    });
  }
};

// Handle share profile
const handleShareProfile = () => {
  isProfileActionsOpen.value = false;
  isShareProfileOpen.value = true;
};

// Load saved badge on mount
const loadSavedBadge = () => {
  const savedBadge = localStorage.getItem("userSelectedBadge");
  if (savedBadge) {
    try {
      selectedBadge.value = JSON.parse(savedBadge);
    } catch (e) {
      // Ignore parse errors
    }
  }
};

// Fetch user data on mount if not loaded
onMounted(async () => {
  loadSavedBadge();
  if (authStore.isAuthenticated && !authStore.user) {
    try {
      await authStore.fetchUser();
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn("Failed to fetch user data:", error);
      }
    }
  }
});

onBeforeUnmount(() => {
  document.removeEventListener("mousemove", onBadgeMouseMove);
  document.removeEventListener("mouseup", onBadgeMouseUp);
  document.body.classList.remove("bottom-sheet-open");
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
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
}

.myProfile-avatarWrapper {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto;
}

.myProfile-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(102deg, #ff006e, #ff8c00);
  display: flex;
  align-items: center;
  justify-content: center;
}

.myProfile-avatarInitials {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  font-family: poppinsSemiBold;
}

.myProfile-avatarImg {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
}

.myProfile-avatarBadge {
  position: absolute;
  bottom: -16px; // Half of badge height (32px / 2) to show half below avatar
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
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: left;
  width: 100%;
}

.myProfile-bioLabel {
  font-size: 1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.75rem;
  font-family: poppinsSemiBold;
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

.myProfile-actions {
  width: 100%;
  max-width: 400px;
  margin-top: 2rem;
  margin-bottom: 1.5rem;
}

.myProfile-settingsBtn {
  width: 100%;
  height: 56px;
  background: linear-gradient(102deg, #ff006e, #ff8c00);
  color: white;
  border-radius: 9999px;
  font-size: 1rem;
  font-weight: 700;
  font-family: montseraatSemiBold;
  text-transform: none;
  box-shadow: 0 18px 40px rgba(255, 0, 110, 0.35);
}

// Photo lightbox styles
.photo-lightbox-dialog {
  :deep(.q-dialog__inner) {
    padding: 0;
  }
}

.photo-lightbox-card {
  background: rgba(0, 0, 0, 0.95);
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.photo-lightbox-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 10;
  color: white;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
}

.photo-lightbox-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.photo-lightbox-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
}

// Badge selector drawer styles
.badgeSelector-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  z-index: 10002; // Above all other sheets
  display: flex;
  align-items: flex-end;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}

.badgeSelector-drawer {
  width: 100%;
  max-width: 600px;
  background: linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%);
  border-radius: 24px 24px 0 0;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease-out;
  cursor: grab;
  user-select: none;

  &:active {
    cursor: grabbing;
  }

  // Remove transition during drag for real-time tracking
  &.dragging {
    transition: none;
  }

  // Add transition only when not dragging
  &:not(.dragging) {
    transition: transform 0.2s ease-out;
  }
}

.badgeSelector-header {
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
}

.badgeSelector-handle {
  width: 40px;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  margin: 0 auto 1rem;
  cursor: grab;
  touch-action: none;

  &:active {
    cursor: grabbing;
  }
}

.badgeSelector-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #fff;
  margin: 0;
  font-family: poppinsSemiBold;
  text-align: center;
  position: relative;
  padding-right: 2rem;
}

.badgeSelector-header .q-btn {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  color: white;
}

.badgeSelector-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  transition: max-height 0.3s ease-out;
}

.badgeSelector-footer {
  padding: 1.5rem;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.badgeSelector-description {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin-bottom: 1rem;
  font-family: poppins;
}

.badgeSelector-saveBtn {
  width: 100%;
  height: 3.3rem;
  background-color: rgba(182, 0, 67, 1);
  color: white;
  border: none;
  font-size: 1.2rem;
  border-radius: 0.5rem;
  font-family: montseraatSemiBold;
  text-transform: uppercase;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(182, 0, 67, 0.9);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
</style>
