<template>
  <div class="col-12 LoginPage-form" :class="{ 'LoginPage-form--shake': shakeForm }">
    <q-input
      v-model="email"
      :placeholder="t('emailAddress')"
      :rules="[(val) => !!val || tOr('emailRequired', 'Email is required')]"
      borderless
      hide-bottom-space
      bottom-slots
      class="loginPage-email loginPage-input registerDatas registerSecrete"
      :error="!!emailError"
      :error-message="emailError"
      ref="emailInput"
      data-testid="dh-login-email"
    />
    <q-input
      :type="showPassword ? 'text' : 'password'"
      v-model="password"
      :placeholder="t('password')"
      :rules="[(val) => !!val || tOr('passwordRequired', 'Password is required') ]"
      borderless
      hide-bottom-space
      bottom-slots
      class="loginPage-password loginPage-input registerDatas registerSecrete"
      :error="!!passwordError"
      :error-message="passwordError"
      ref="passwordInput"
      data-testid="dh-login-password"
    >
      <template v-slot:append>
        <q-icon
          :name="showPassword ? 'visibility' : 'visibility_off'"
          class="cursor-pointer"
          @click="showPassword = !showPassword"
        />
      </template>
    </q-input>
    <div class="LoginPage-rememberContainer">
      <q-checkbox
        v-model="remember"
        label="Remember my account and keep me logged in"
        class="LoginPage-rememberInput"
      />
    </div>
    <q-btn
      label="Sign In"
      @click="onSubmit"
      color="primary"
      text-color="white"
      class="LoginPage-loginButton"
      :loading="auth.loading"
      data-testid="dh-login-submit"
    />
    <q-btn class="LoginPage-forgotPswButton" @click="handleForgotPassword">
      {{ t('forgotPassword') }}
    </q-btn>

    <div v-if="showForgotHint" class="LoginPage-forgotHint">
      <div class="LoginPage-forgotHintText">{{ forgotHintText }}</div>
      <q-btn class="LoginPage-forgotHintCta" flat @click="handleForgotPassword">
        {{ resetPasswordCtaLabel }}
      </q-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "src/stores/auth";
import { notifyError } from "src/utils/notify";
import { mapAxiosErrorToDhError } from "src/utils/httpError";

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const { t } = useI18n();

const email = ref("");
const password = ref("");
const remember = ref(false);
const showPassword = ref(false);

const emailError = ref("");
const passwordError = ref("");
const shakeForm = ref(false);

// 3x failed login UX (401 only) - keep for current tab session
const FAIL_KEY = "dh_failed_login_attempts";
const failedLoginAttempts = ref<number>(Number(sessionStorage.getItem(FAIL_KEY) || 0));
const showForgotHint = computed(() => failedLoginAttempts.value >= 3);

const emailInput = ref<any>(null);
const passwordInput = ref<any>(null);

const tOr = (key: string, fallback: string) => {
  const res = t(key as any);
  return res === key ? fallback : res;
};

const forgotHintText = computed(() =>
  tOr("forgotPasswordHint", "Forgot your password? Reset it.")
);
const resetPasswordCtaLabel = computed(() =>
  tOr("resetPasswordCta", t("forgotPassword"))
);

const safeTriggerShake = () => {
  shakeForm.value = true;
  window.setTimeout(() => {
    shakeForm.value = false;
  }, 350);
};

watch([email, password], () => {
  // User started editing -> don't "punish" them
  if (failedLoginAttempts.value !== 0) {
    failedLoginAttempts.value = 0;
    sessionStorage.setItem(FAIL_KEY, "0");
  }
  emailError.value = "";
  passwordError.value = "";
});

onMounted(() => {
  const qEmail = route.query.email;
  if (typeof qEmail === "string" && qEmail.trim()) {
    email.value = qEmail.trim();
  }
});

const onSubmit = async () => {
  if (!email.value || !password.value) {
    notifyError({
      kind: "validation",
      messageKey: "loginFillBoth",
      fallbackMessage: "Please fill in both email and password.",
      retryable: false
    }, { timeout: 6500 });
    return;
  }

  try {
    emailError.value = "";
    passwordError.value = "";

    await auth.login({ email: email.value, password: password.value });
    await auth.fetchUser();

    failedLoginAttempts.value = 0;
    sessionStorage.setItem(FAIL_KEY, "0");

    // Success handled by router redirect, no toast needed

    // Redirect na feed (donor-posts) alebo podľa query parametra
    const redirect = (route.query.redirect as string) || { name: "donor-posts" };
    router.push(redirect);
  } catch (err: unknown) {
    if (process.env.NODE_ENV === "development") {
      console.debug("Login error:", err);
    }

    const anyErr = err as any;
    const status: number | undefined = anyErr?.response?.status;
    const hasResponse = typeof status === "number";

    // 422: validation -> field-level messages, don't increment fail counter
    if (status === 422) {
      const errors = anyErr?.response?.data?.errors as
        | { email?: string[]; password?: string[] }
        | undefined;
      emailError.value = errors?.email?.[0] || "";
      passwordError.value = errors?.password?.[0] || "";

      // Focus first invalid field
      if (emailError.value) {
        emailInput.value?.focus?.();
      } else if (passwordError.value) {
        passwordInput.value?.focus?.();
      }
      return;
    }

    // 401: invalid credentials -> safe generic message (do not leak account existence)
    if (status === 401) {
      failedLoginAttempts.value += 1;
      sessionStorage.setItem(FAIL_KEY, String(failedLoginAttempts.value));

      notifyError({
        kind: "unauthorized",
        status: 401,
        messageKey: "badCredentials",
        fallbackMessage: "Incorrect email or password.",
        retryable: true
      }, { timeout: 8000 });

      safeTriggerShake();
      passwordInput.value?.focus?.();
      return;
    }

    // Network / no response
    if (!hasResponse) {
      // Map to common network/offline/timeout messages (safe + localized)
      notifyError(mapAxiosErrorToDhError(err), { timeout: 8000 });
      return;
    }

    // 5xx
    if (status >= 500) {
      notifyError({
        kind: "server",
        status,
        messageKey: "loginServerError",
        fallbackMessage: tOr("loginServerError", t("loginError")),
        retryable: true
      }, { timeout: 8000 });
      return;
    }

    // Fallback
    notifyError({
      kind: "unknown",
      status,
      messageKey: "loginError",
      fallbackMessage: tOr("loginError", "Something went wrong. Please try again later."),
      retryable: true
    }, { timeout: 8000 });
  }
};

const handleForgotPassword = () => {
  router.push({
    name: "forgot-password",
    query: email.value ? { email: email.value } : undefined
  });
};
</script>

<style lang="scss" scoped>
.LoginPage-form {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.LoginPage-form--shake {
  animation: login-shake 0.35s ease-in-out;
}

@keyframes login-shake {
  0% { transform: translateX(0); }
  20% { transform: translateX(-5px); }
  40% { transform: translateX(5px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
  100% { transform: translateX(0); }
}

.loginPage-input {
  font-family: montseraat;
  margin: 0.5rem 0;
  width: 22rem;
  background-color: rgba(0, 0, 0, 0.324);
}
.LoginPage-rememberContainer {
  width: 22rem;
  .LoginPage-rememberInput {
    color: white;
    font-family: poppins;
    font-size: 0.8rem;
    margin: 0.3rem 0;
    margin-bottom: 0.6rem;
  }
}
.LoginPage-forgotPswButton {
  width: 22rem;
  background-color: rgba(141, 31, 70, 0.338) !important;
  color: rgba(218, 3, 82, 0.77) !important;
  font-family: montseraatSemiBold;
  font-size: 1.1rem !important;
  border-radius: 0.5rem !important;
  margin-bottom: 1rem;
}

.LoginPage-forgotHint {
  width: 22rem;
  padding: 12px 14px;
  border-radius: 0.6rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(23, 23, 23, 0.72);
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  margin-bottom: 1rem;
}

.LoginPage-forgotHintText {
  font-family: poppins;
  font-size: 0.95rem;
  margin-bottom: 8px;
}

.LoginPage-forgotHintCta {
  color: rgba(218, 3, 82, 0.92) !important;
  font-family: montseraatSemiBold;
}
.LoginPage-loginButton {
  margin-top: 1rem;
  background-color: rgba(182, 0, 67, 1);
  color: white;
  border: none;
  font-size: 1.1rem;
  width: 22rem;
  font-family: montseraatSemiBold;
  border-radius: 0.5rem !important;
  margin-bottom: 0.8rem !important;
}
</style>
