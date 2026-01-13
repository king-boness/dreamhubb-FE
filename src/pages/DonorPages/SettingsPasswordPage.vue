<template>
  <div class="SettingsPasswordPage">
    <div class="passwordPage-header">
      <span class="passwordPage-heading">Change Password</span>

      <q-input
        borderless
        dark
        hide-bottom-space
        :type="!isPwd ? 'password' : 'text'"
        bottom-slots
        v-model="oldPassword"
        label="Old Password"
        class="registerDatas registerSecrete passwordPage-input"
      >
      </q-input>
      <a class="passwordPage-forgotPasswordLink"
        >I don’t remember my password</a
      >
      <q-input
        borderless
        dark
        hide-bottom-space
        :type="!isPwd ? 'password' : 'text'"
        bottom-slots
        v-model="newPassword"
        label="New Password"
        class="registerDatas registerSecrete passwordPage-input"
      >
      </q-input>
      <q-input
        borderless
        dark
        hide-bottom-space
        :type="!isPwd ? 'password' : 'text'"
        bottom-slots
        v-model="reNewPassword"
        label="Repeat New Password"
        class="registerDatas registerSecrete passwordPage-input"
      >
      </q-input>
    </div>
    <div class="resetPasswordDiv">
      <q-btn
        class="resetPasswordButton"
        @click="$router.push('password/confirmation')"
      >
        Request reset
      </q-btn>
    </div>
    <div class="pageFooter-div">
      <q-btn class="cancelButton" @click="$router.go(-1)"> Cancel </q-btn>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
const isPwd = ref(false);
const oldPassword = ref("");
const reNewPassword = ref("");
const newPassword = ref("");
</script>
<style scoped lang="scss">
.SettingsPasswordPage {
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0 1.2rem;
  padding-bottom: 3rem;
  .passwordPage-header {
    display: flex;
    width: 100%;
    justify-content: start;
    align-items: start;
    margin: 1rem 0;
    flex-direction: column;

    .passwordPage-heading {
      font-size: 1.4rem;
      font-family: poppinsSemiBold;

      margin-bottom: 0.7rem;
    }

    .passwordPage-input {
      font-family: montseraat;
      margin: 0.5rem auto;
      width: 100%;
    }

    .passwordPage-forgotPasswordLink {
      margin-bottom: 2rem;
      margin-top: 0.5rem;
      margin-left: 0.2rem;
      text-decoration: underline;
      font-family: poppins;
      font-size: 0.9rem;
    }
  }

  .resetPasswordDiv {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;

    .resetPasswordButton {
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
  align-items: end;
  justify-content: center;
  margin-top: 2rem;
  margin-bottom: 2rem;
  width: 100%;
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
