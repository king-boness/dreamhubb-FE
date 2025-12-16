<template>
  <div class="settingsEmail-page">
    <div class="changeEmail-div">
      <span class="changeEmail-title">Change Email Address</span>
      <q-input
        borderless
        dark
        hide-bottom-space
        bottom-slots
        v-model="userEmail"
        :label="maskEmail(profile.email)"
        class="registerDatas registerSecrete emailPage-input"
        disable
      >
      </q-input>
      <a class="requestLink">Request code →</a>
      <q-input
        borderless
        dark
        hide-bottom-space
        bottom-slots
        v-model="resetEmail"
        label="Enter Confirmation Code"
        type="email"
        class="registerDatas registerSecrete emailPage-input"
      >
      </q-input>
    </div>
    <div class="confirmationButton-div">
      <q-btn class="confirmButton" @click="$router.push('email/confirmation')">
        Confirm
      </q-btn>
    </div>
    <div class="pageFooter-div">
      <q-btn class="cancelButton" @click="$router.go(-1)"> Cancel </q-btn>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { UserDatas } from "src/components/models";
import { maskEmail } from "src/components/partials/FunctionsComponent.vue";
import { useAuthStore } from "src/stores/auth";

const authStore = useAuthStore();
const resetEmail = ref("");
const userEmail = ref("");

const profile = computed(() => ({
  email: authStore.user?.email || ""
} as UserDatas));

onMounted(async () => {
  // Ensure user data is loaded
  if (!authStore.user && authStore.isAuthenticated) {
    try {
      await authStore.fetchUser();
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to fetch user:", error);
      }
    }
  }
});
</script>
<style scoped lang="scss">
.settingsEmail-page {
  padding: 0 1.2rem;
  .changeEmail-div {
    display: flex;
    width: 100%;
    justify-content: start;
    align-items: start;
    margin: 1.5rem 0;
    flex-direction: column;

    .changeEmail-title {
      font-size: 1.4rem;
      font-family: poppinsSemiBold;

      margin-bottom: 0.7rem;
      color: white;
    }

    .emailPage-input {
      font-family: montseraat;
      margin: 0.5rem 0;
      width: 100%;
    }

    .requestLink {
      color: $primary;

      font-family: poppins;
      margin-top: 0.1rem;
      width: 9rem;
      font-size: 1rem;
      margin-bottom: 1.4rem;
    }
  }

  .confirmationButton-div {
    display: flex;
    align-items: center;
    justify-content: center;

    .confirmButton {
      background-color: rgba(182, 0, 67, 1);
      color: white;
      border: none;
      font-size: 1.2rem;
      height: 3.3rem;
      border-radius: 0.5rem;
      width: 100%;
      margin-top: 1.1rem;
      font-family: montseraatSemiBold;
    }
  }
}

.pageFooter-div {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2rem;

  .cancelButton {
    background-color: rgba(221, 31, 97, 0.2) !important;
    color: rgb(218, 3, 82) !important;
    font-family: montseraatSemiBold;
    border: none;
    font-size: 1.2rem;
    height: 3.3rem;
    border-radius: 0.5rem;
    width: 100%;
  }
}
</style>
