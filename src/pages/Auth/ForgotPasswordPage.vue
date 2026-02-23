<template>
  <q-page class="forgotPasswordPage">
    <div class="forgotPasswordPage-card">
      <h1 class="forgotPasswordPage-title">{{ tOr("resetPasswordTitle", "Reset password") }}</h1>
      <p class="forgotPasswordPage-subtitle">
        {{ tOr("resetPasswordSubtitle", "Enter your email and we'll send you a reset link.") }}
      </p>

      <q-input
        v-model="email"
        :placeholder="t('emailAddress')"
        borderless
        hide-bottom-space
        bottom-slots
        class="forgotPasswordPage-input registerDatas registerSecrete"
        :error="!!emailError"
        :error-message="emailError"
      />

      <q-btn
        class="forgotPasswordPage-primaryBtn"
        color="primary"
        text-color="white"
        :loading="submitting"
        :disable="submitting || !email.trim()"
        @click="submit"
      >
        {{ tOr("sendResetLink", "Send reset link") }}
      </q-btn>

      <q-btn flat class="forgotPasswordPage-secondaryBtn" @click="goBackToLogin">
        {{ tOr("backToSignIn", "Back to sign in") }}
      </q-btn>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { notifyError, notifySuccess } from "src/utils/notify";
import { api } from "boot/axios";
import { mapAxiosErrorToDhError } from "src/utils/httpError";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const email = ref("");
const emailError = ref("");
const submitting = ref(false);

const tUnsafe = (key: string) => {
  return (t as unknown as (k: string) => string)(key);
};

const tOr = (key: string, fallback: string) => {
  const res = tUnsafe(key);
  return res === key ? fallback : res;
};

onMounted(() => {
  const qEmail = route.query.email;
  if (typeof qEmail === "string" && qEmail.trim()) {
    email.value = qEmail.trim();
  }
});

const submit = async () => {
  const trimmed = email.value.trim();
  if (!trimmed) {
    emailError.value = tOr("emailRequired", "Email is required");
    return;
  }

  submitting.value = true;
  emailError.value = "";
  try {
    await api.post("/forgot-password", { email: trimmed });
    // Security: always show the same message regardless of whether account exists
    notifySuccess("auth.resetLinkSentGeneric", tOr("resetLinkSentGeneric", "If the account exists, we sent you an email with instructions."), { timeout: 6500 });
  } catch (err: unknown) {
    notifyError(mapAxiosErrorToDhError(err), { timeout: 6500 });
  } finally {
    submitting.value = false;
  }
};

const goBackToLogin = () => {
  router.push({ name: "login", query: email.value.trim() ? { email: email.value.trim() } : undefined });
};
</script>

<style scoped lang="scss">
.forgotPasswordPage {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  box-sizing: border-box;
  overflow: hidden;
  color: #fff;
}

.forgotPasswordPage-card {
  width: 100%;
  max-width: 420px;
  max-height: calc(100dvh - 40px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: rgba(23, 23, 23, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 22px 18px 18px 18px;
}

.forgotPasswordPage-title {
  margin: 0;
  font-family: poppinsSemiBold;
  font-size: 1.7rem;
  text-align: center;
}

.forgotPasswordPage-subtitle {
  margin: 0;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-family: poppins;
  font-size: 0.95rem;
  line-height: 1.5;
}

.forgotPasswordPage-input {
  width: 100%;
  margin: 0;
}

.forgotPasswordPage-primaryBtn {
  width: 100%;
  border-radius: 12px;
  font-family: poppinsSemiBold;
  min-height: 44px;
}

.forgotPasswordPage-secondaryBtn {
  width: 100%;
  margin-top: 2px;
  color: rgba(255, 255, 255, 0.8);
}
/* end */
</style>
