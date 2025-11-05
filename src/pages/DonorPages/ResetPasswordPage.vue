<template>
  <div class="resetPasswordPage">
    <div class="resetPassword-header">
      <span class="resetPassword-heading"
        >We sent you your reset code on Email Address
        {{ maskEmail(profile.email) }}</span
      >
      <q-input
        borderless
        dark
        hide-bottom-space
        bottom-slots
        v-model="resetCode"
        label="Reset Code"
        class="registerDatas registerSecrete passwordPage-input"
      >
      </q-input>
      <a href="#" class="resendLink">Resend code →</a>
    </div>
    <div class="confirmButton-div">
      <q-btn class="confirmButton" @click="$router.go(-2)">
        Confirm code
      </q-btn>
    </div>
    <div class="pageFooter-div">
      <q-btn class="cancelButton" @click="$router.go(-2)"> Cancel </q-btn>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { UserDatas } from "src/components/models";
import { maskEmail } from "src/components/partials/FunctionsComponent.vue";

const resetCode = ref("");
const profile = ref({
  email: "perdochjakub@gmail.com"
} as UserDatas);
</script>
<style scoped lang="scss">
.resetPasswordPage {
  padding: 0 1rem;
  .resetPassword-header {
    margin: 1.5rem 0;
    color: white;
    font-family: poppinsSemiBold;
    font-size: 1.4rem;
    display: flex;
    flex-direction: column;

    .resendLink {
      color: $primary;
      font-family: poppins;
      margin-top: 0.1rem;
      width: 9rem;
      font-size: 1rem;
    }

    .passwordPage-input {
      font-family: montseraat;
      margin: 1.5rem auto;
      margin-bottom: 0.5rem;
      width: 100%;
    }
  }

  .confirmButton-div {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;

    .confirmButton {
      background-color: rgba(182, 0, 67, 1);
      color: white;
      border: none;
      font-size: 1.2rem;
      height: 3.3rem;
      border-radius: 0.5rem;
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
  width: 100%;
  .cancelButton {
    background-color: rgba(221, 31, 97, 0.2) !important;
    color: rgb(218, 3, 82) !important;
    font-family: montseraatSemiBold;
    border: none;
    font-size: 1.2rem;
    height: 3.3rem;
    border-radius: 0.5rem;
    margin: 0 auto;
  }
}
</style>
