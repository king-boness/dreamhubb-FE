<template>
  <div class="col-12 LoginPage-form">
    <q-input
      v-model="email"
      placeholder="Email"
      :rules="[(val) => !!val || 'Email is required']"
      borderless
      hide-bottom-space
      bottom-slots
      class="loginPage-email loginPage-input registerDatas registerSecrete"
    />
    <q-input
      :type="showPassword ? 'text' : 'password'"
      v-model="password"
      placeholder="Password"
      :rules="[(val) => !!val || 'Password is required']"
      borderless
      hide-bottom-space
      bottom-slots
      class="loginPage-password loginPage-input registerDatas registerSecrete"
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
    />
    <q-btn class="LoginPage-forgotPswButton">Forgot Password?</q-btn>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useQuasar } from "quasar";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "src/stores/auth";

const $q = useQuasar();
const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const email = ref("");
const password = ref("");
const remember = ref(false);
const showPassword = ref(false);

// No pre-filled data

const onSubmit = async () => {
  if (!email.value || !password.value) {
    $q.notify({
      message: "Please fill in both email and password.",
      color: "negative",
      icon: "error"
    });
    return;
  }

  try {
    await auth.login({ email: email.value, password: password.value });
    await auth.fetchUser();

    $q.notify({
      message: "Login successful!",
      color: "positive",
      icon: "check"
    });

    // Redirect na feed (donor-posts) alebo podľa query parametra
    const redirect = (route.query.redirect as string) || { name: "donor-posts" };
    router.push(redirect);
  } catch (err: unknown) {
    if (process.env.NODE_ENV === "development") {
      console.error("Login error:", err);
    }

    const error = err as {
      response?: {
        data?: {
          message?: string;
          error?: string;
        };
      };
    };

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Login failed. Please try again.";

    $q.notify({
      message,
      color: "negative",
      icon: "error"
    });
  }
};
</script>

<style lang="scss" scoped>
.LoginPage-form {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
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
