<template>
  <q-page class="resetPasswordPage">
    <div class="resetPasswordPage-card">
      <h1 class="resetPasswordPage-title">{{ tOr("resetPasswordSetTitle", "Set a new password") }}</h1>

      <div v-if="!token || !email" class="resetPasswordPage-invalid">
        <p class="resetPasswordPage-subtitle">
          {{ tOr("resetLinkInvalidOrExpired", "This reset link is invalid or expired.") }}
        </p>
        <q-btn flat class="resetPasswordPage-secondaryBtn" @click="goToForgot">
          {{ tOr("sendResetLink", "Send reset link") }}
        </q-btn>
        <q-btn flat class="resetPasswordPage-secondaryBtn" @click="goToLogin">
          {{ tOr("backToSignIn", "Back to sign in") }}
        </q-btn>
      </div>

      <div v-else>
        <q-input
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          :placeholder="tOr('newPassword', 'New password')"
          borderless
          hide-bottom-space
          bottom-slots
          class="resetPasswordPage-input registerDatas registerSecrete"
          :error="!!passwordError"
          :error-message="passwordError"
        >
          <template #append>
            <q-icon
              :name="showPassword ? 'visibility' : 'visibility_off'"
              class="cursor-pointer"
              @click="showPassword = !showPassword"
            />
          </template>
        </q-input>

        <q-input
          v-model="passwordConfirm"
          :type="showPassword ? 'text' : 'password'"
          :placeholder="tOr('confirmPassword', 'Confirm password')"
          borderless
          hide-bottom-space
          bottom-slots
          class="resetPasswordPage-input registerDatas registerSecrete"
          :error="!!confirmError"
          :error-message="confirmError"
        />

        <q-btn
          class="resetPasswordPage-primaryBtn"
          color="primary"
          text-color="white"
          :loading="submitting"
          :disable="submitting || !password.trim() || !passwordConfirm.trim()"
          @click="submit"
        >
          {{ tOr("changePassword", "Change password") }}
        </q-btn>

        <q-btn flat class="resetPasswordPage-secondaryBtn" @click="goToLogin">
          {{ tOr("backToSignIn", "Back to sign in") }}
        </q-btn>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { notifyError, notifySuccess } from "src/utils/notify";
import { api } from "boot/axios";
import { mapAxiosErrorToDhError } from "src/utils/httpError";
import { tGlobal } from "src/utils/i18nGlobal";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const token = computed(() => (typeof route.query.token === "string" ? route.query.token : ""));
const email = computed(() => (typeof route.query.email === "string" ? route.query.email : ""));

const password = ref("");
const passwordConfirm = ref("");
const showPassword = ref(false);
const submitting = ref(false);

const passwordError = ref("");
const confirmError = ref("");

const tUnsafe = (key: string) => {
  return (t as unknown as (k: string) => string)(key);
};

const tOr = (key: string, fallback: string) => {
  const res = tUnsafe(key);
  return res === key ? fallback : res;
};

const submit = async () => {
  passwordError.value = "";
  confirmError.value = "";

  if (!password.value.trim()) {
    passwordError.value = tOr("passwordRequired", "Password is required");
    return;
  }
  if (password.value.trim().length < 8) {
    passwordError.value = tOr("passwordMin8", "Password must be at least 8 characters");
    return;
  }
  if (password.value !== passwordConfirm.value) {
    confirmError.value = tOr("passwordsMustMatch", "Passwords must match");
    return;
  }

  submitting.value = true;
  try {
    await api.post("/reset-password", {
      token: token.value,
      email: email.value,
      password: password.value,
      password_confirmation: passwordConfirm.value
    });

    notifySuccess("common.success.passwordChanged", tOr("passwordChanged", "Password changed."), { timeout: 4500 });
    router.push({ name: "login", query: email.value ? { email: email.value } : undefined });
  } catch (err: unknown) {
    const anyErr = err as { response?: { status?: number } };
    const status = anyErr?.response?.status;

    // Safe UX: don't show raw backend message; prefer fixed copy for invalid/expired link
    if (status === 422 || status === 400) {
      notifyError({
        kind: "validation",
        messageKey: "auth.resetLinkInvalidOrExpired",
        fallbackMessage: tOr("resetLinkInvalidOrExpired", "This reset link is invalid or expired."),
        retryable: false
      }, { timeout: 6500 });
    } else {
      notifyError(mapAxiosErrorToDhError(err), { timeout: 6500 });
    }
  } finally {
    submitting.value = false;
  }
};

const goToForgot = () => {
  router.push({ name: "forgot-password", query: email.value ? { email: email.value } : undefined });
};

const goToLogin = () => {
  router.push({ name: "login", query: email.value ? { email: email.value } : undefined });
};
</script>

<style scoped lang="scss">
.resetPasswordPage {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px 16px;
  color: #fff;
}

.resetPasswordPage-card {
  width: 100%;
  max-width: 420px;
  background: rgba(23, 23, 23, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px 16px;
}

.resetPasswordPage-title {
  margin: 0 0 12px 0;
  font-family: poppinsSemiBold;
  font-size: 1.4rem;
}

.resetPasswordPage-subtitle {
  margin: 0 0 16px 0;
  color: rgba(255, 255, 255, 0.7);
  font-family: poppins;
  font-size: 0.95rem;
}

.resetPasswordPage-input {
  width: 100%;
  margin-bottom: 14px;
}

.resetPasswordPage-primaryBtn {
  width: 100%;
  border-radius: 12px;
  font-family: poppinsSemiBold;
}

.resetPasswordPage-secondaryBtn {
  width: 100%;
  margin-top: 8px;
  color: rgba(255, 255, 255, 0.8);
}
</style>
