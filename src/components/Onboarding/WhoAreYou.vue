<template>
  <div class="whoAreYou">
    <!-- Back button + Progress -->
    <div class="who-header">
      <button class="who-backBtn" @click="emit('back')">
        <q-icon name="chevron_left" />
      </button>
      <div class="who-progress">
        <span class="who-progress_fill" style="width: 100%"></span>
      </div>
    </div>

    <div class="who-content">
      <h1 class="who-title">Who are you?</h1>

      <!-- Profile picture upload -->
      <div class="who-avatar">
        <div class="who-avatarPlaceholder" @click="handleAvatarClick">
          <img
            v-if="avatarPreview"
            :src="avatarPreview"
            alt="Profile"
            class="who-avatarImage"
          />
          <q-icon v-else name="image" size="48px" class="who-avatarIcon" />
          <div class="who-avatarPlus">
            <q-icon name="add" size="16px" />
          </div>
        </div>
        <input
          ref="avatarInput"
          type="file"
          accept="image/*"
          class="who-avatarInput"
          @change="handleAvatarChange"
        />
      </div>

      <!-- Form -->
      <div class="who-form">
        <q-input
          v-model="localUsername"
          label="Username"
          dark
          outlined
          class="who-input"
        />

        <q-input
          v-model="localDateOfBirth"
          label="Date of birth"
          dark
          outlined
          class="who-input"
          type="date"
        >
          <template #append>
            <q-icon name="event" />
          </template>
        </q-input>

        <q-select
          v-model="localGender"
          :options="genderOptions"
          label="Gender"
          dark
          outlined
          class="who-input"
        />

        <q-input
          v-model="localEmail"
          label="Email Address"
          dark
          outlined
          class="who-input"
          type="email"
        />

        <q-input
          v-model="localPassword"
          label="Password"
          dark
          outlined
          class="who-input"
          :type="showPassword ? 'text' : 'password'"
        >
          <template #append>
            <q-icon
              :name="showPassword ? 'visibility' : 'visibility_off'"
              @click="showPassword = !showPassword"
              class="cursor-pointer"
            />
          </template>
        </q-input>

        <q-input
          v-model="localRepeatPassword"
          label="Repeat Password"
          dark
          outlined
          class="who-input"
          :type="showRepeatPassword ? 'text' : 'password'"
        >
          <template #append>
            <q-icon
              :name="showRepeatPassword ? 'visibility' : 'visibility_off'"
              @click="showRepeatPassword = !showRepeatPassword"
              class="cursor-pointer"
            />
          </template>
        </q-input>
      </div>

      <p class="who-instruction">Fill up your data</p>
    </div>

    <!-- Finish button -->
    <button class="who-finishBtn" @click="handleFinish" :disabled="!isFormValid">
      FINISH UP THE ACCOUNT
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useApiCallStore } from "src/stores/api-calls-store";
import { Notify } from "quasar";

const router = useRouter();
const apiStore = useApiCallStore();

const props = defineProps<{
  username: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  password: string;
  repeatPassword: string;
  userSide?: "donor" | "donee" | null;
}>();

const emit = defineEmits<{
  "update:username": [value: string];
  "update:dateOfBirth": [value: string];
  "update:gender": [value: string];
  "update:email": [value: string];
  "update:password": [value: string];
  "update:repeatPassword": [value: string];
  finish: [];
  back: [];
}>();

const localUsername = ref(props.username || "");
const localDateOfBirth = ref(props.dateOfBirth || "");
const localGender = ref(props.gender || "");
const localEmail = ref(props.email || "");
const localPassword = ref(props.password || "");
const localRepeatPassword = ref(props.repeatPassword || "");

const showPassword = ref(false);
const showRepeatPassword = ref(false);
const avatarInput = ref<HTMLInputElement | null>(null);
const avatarPreview = ref<string | null>(null);

const genderOptions = ["Male", "Female", "Other", "Prefer not to say"];

const handleAvatarClick = () => {
  avatarInput.value?.click();
};

const handleAvatarChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      avatarPreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const isFormValid = computed(() => {
  return (
    localUsername.value &&
    localDateOfBirth.value &&
    localGender.value &&
    localEmail.value &&
    localPassword.value &&
    localRepeatPassword.value &&
    localPassword.value === localRepeatPassword.value
  );
});

const isSubmitting = ref(false);

const handleFinish = async () => {
  if (!isFormValid.value || isSubmitting.value) return;

  try {
    isSubmitting.value = true;

    // Call registration API
    const registrationData = {
      name: localUsername.value,
      email: localEmail.value,
      password: localPassword.value,
      password_confirmation: localRepeatPassword.value,
      date_of_birth: localDateOfBirth.value,
      gender: localGender.value
    };

    // Register user and automatically log them in
    const response = await apiStore.register(registrationData);

    // Save JWT token
    if (response.data?.authorization?.token || response.data?.token) {
      const token = response.data?.authorization?.token || response.data?.token;
      localStorage.setItem("jwtToken", token);
      apiStore.isAuthenticated = true;

      // Synchronizovať s user-store
      const { useUserStore } = await import("src/stores/user-store");
      const userStore = useUserStore();
      userStore.isAuthenticated = true;
      userStore.token = token;

      // Fetch user data
      await apiStore.fetchUser();

      // Show success message
      Notify.create({
        type: "positive",
        message: "Account created successfully!",
        position: "top"
      });

      // Emit finish event
      emit("finish");

      // Redirect based on userSide
      if (props.userSide === "donee") {
        router.replace({ name: "donee-posts" });
      } else {
        router.replace({ name: "donor-posts" });
      }
    }
  } catch (error: unknown) {
    console.error("Registration error:", error);

    // Show error message
    const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Registration failed. Please try again.";

    Notify.create({
      type: "negative",
      message: errorMessage,
      position: "top"
    });
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style lang="scss" scoped>
.whoAreYou {
  width: 100%;
  max-width: 390px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 24px 20px 40px;
  margin: 0 auto;
  background: radial-gradient(circle at top, #0b001c 0%, #05000e 40%, #010006 100%);
  overflow: hidden;
  position: relative;
}

.who-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
  flex-shrink: 0;
}

.who-backBtn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    border-color: rgba(255, 255, 255, 0.6);
  }

  .q-icon {
    font-size: 24px;
    color: #ffffff;
  }
}

.who-progress {
  flex: 1;
  height: 4px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 18px;
}

.who-progress_fill {
  display: block;
  height: 100%;
  background: #BD0043;
  transition: width 0.3s ease;
}

.who-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
}

.who-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 20px 0;
  text-align: center;
  flex-shrink: 0;
  line-height: 1.2;
}

.who-avatar {
  width: 120px;
  height: 120px;
  margin-bottom: 24px;
  position: relative;
  flex-shrink: 0;
}

.who-avatarInput {
  display: none;
}

.who-avatarPlaceholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid #BD0043;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  transition: background 0.2s ease;
  overflow: hidden;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }
}

.who-avatarImage {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.who-avatarIcon {
  color: #BD0043;
}

.who-avatarPlus {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  background: #BD0043;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(0, 0, 0, 0.2);
  z-index: 1;

  .q-icon {
    color: #ffffff;
  }
}

.who-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.who-input {
  :deep(.q-field__control) {
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    height: 56px;
    color: #ffffff;
  }

  :deep(.q-field__label) {
    color: rgba(255, 255, 255, 0.6);
  }

  :deep(.q-field__native) {
    color: #ffffff;
  }

  :deep(.q-icon) {
    color: rgba(255, 255, 255, 0.6);
  }
}

.who-instruction {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  text-align: center;
  flex-shrink: 0;
}

.who-finishBtn {
  width: 100%;
  height: 56px;
  border-radius: 9999px;
  background: #BD0043;
  border: none;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 8px 24px rgba(189, 0, 67, 0.3);

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(189, 0, 67, 0.4);
  }
}
</style>
