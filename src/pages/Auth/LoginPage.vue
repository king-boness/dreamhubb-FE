<template>
  <div class="col-12 LoginPage-form">
    <q-input
      v-model="state.email"
      placeholder="Email"
      :rules="[(val) => !!val || 'Email is required']"
      borderless
      hide-bottom-space
      bottom-slots
      class="loginPage-email loginPage-input registerDatas registerSecrete"
    />
    <q-input
      type="password"
      v-model="state.password"
      placeholder="Password"
      :rules="[(val) => !!val || 'Password is required']"
      borderless
      hide-bottom-space
      bottom-slots
      class="loginPage-password loginPage-input registerDatas registerSecrete"
    />
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
    />
    <q-btn class="LoginPage-forgotPswButton">Forgot Password?</q-btn>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useApiCallStore } from "src/stores/api-calls-store";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";

const remember = ref(false);
const $q = useQuasar();
const router = useRouter();
const apiCall = useApiCallStore();

const state = reactive({
  email: "",
  password: ""
});

const onSubmit = async () => {
  try {
    const res = await apiCall.login(state);
    if (res.data && res.data.status === "success") {
      $q.notify({
        message: "Login successful!",
        color: "positive",
        icon: "check"
      });
      router.push({ name: "donor-posts" });
    } else {
      $q.notify({
        message: "Invalid credentials",
        color: "negative",
        icon: "error"
      });
    }
  } catch (err: unknown) {
    if (process.env.NODE_ENV === "development") {
      console.error("Login error:", err);
    }
    // Nový BE error formát: {status: "error", message: "..."}
    const error = err as { response?: { data?: { message?: string; error?: string } } };
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
