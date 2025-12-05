<template>
  <div class="myProfile">
    <!-- Minimal Profile Header -->
    <div class="myProfile-header">
      <div class="myProfile-avatarContainer">
        <div class="myProfile-avatar" v-if="!authStore.user?.profile_picture">
          <span class="myProfile-avatarInitials">{{ userInitials }}</span>
        </div>
        <img
          v-else
          :src="authStore.user.profile_picture"
          alt="Profile"
          class="myProfile-avatarImg"
        />
      </div>
      <div class="myProfile-info">
        <h2 class="myProfile-username">{{ displayUsername }}</h2>
        <p class="myProfile-email">{{ displayEmail }}</p>
        <div class="myProfile-tokens">
          <span class="myProfile-tokensLabel">Tokens:</span>
          <span class="myProfile-tokensValue">{{ displayTokens }}</span>
        </div>
        <div class="myProfile-role">
          <span class="myProfile-roleLabel">Role:</span>
          <span class="myProfile-roleValue">{{ currentRole }}</span>
        </div>
      </div>
    </div>

    <!-- Settings Button -->
    <div class="myProfile-actions">
      <q-btn
        class="myProfile-settingsBtn"
        @click="goToSettings"
      >
        Settings
      </q-btn>
    </div>

    <!-- Logout Button -->
    <div class="myProfile-logout">
      <q-btn
        class="myProfile-logoutBtn"
        @click="handleLogout"
      >
        Logout
      </q-btn>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "src/stores/auth";
import { formatNumber } from "src/components/partials/FunctionsComponent.vue";

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

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

// Display email
const displayEmail = computed(() => {
  return authStore.user?.email || "—";
});

// Display tokens
const displayTokens = computed(() => {
  // TODO: If tokens are not available, display "— tokens"
  if (authStore.user?.tokens !== undefined && authStore.user?.tokens !== null) {
    return formatNumber(authStore.user.tokens);
  }
  return "— tokens";
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

// Handle logout
const handleLogout = async () => {
  await authStore.logout();
  router.push({ name: "login" });
};

// Fetch user data on mount if not loaded
onMounted(async () => {
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
}

.myProfile-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(102deg, #ff006e, #ff8c00);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
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

.myProfile-actions {
  width: 100%;
  max-width: 400px;
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

.myProfile-logout {
  width: 100%;
  max-width: 400px;
  margin-top: auto;
  padding-bottom: 2rem;
}

.myProfile-logoutBtn {
  width: 100%;
  height: 56px;
  background-color: rgba(141, 31, 70, 0.272);
  color: rgba(218, 3, 82, 0.704);
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  font-family: montseraatSemiBold;
  text-transform: none;
}
</style>
