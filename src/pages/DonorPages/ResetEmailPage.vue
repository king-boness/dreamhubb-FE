<template>
  <div class="resetEmail-page">
    <div class="resetEmail-main">
      <span class="changeEmail-title">Change Email Address</span>
      <q-input
        borderless
        dark
        hide-bottom-space
        bottom-slots
        v-model="resetEmail"
        label="New Email Address"
        class="registerDatas registerSecrete emailPage-input"
      >
      </q-input>
      <q-input
        borderless
        dark
        hide-bottom-space
        bottom-slots
        v-model="repeatResetEmail"
        label="Repeat New Email Address"
        class="registerDatas registerSecrete emailPage-input"
      >
      </q-input>
    </div>
    <div class="confirmationButton-div">
      <q-btn class="confirmButton" @click="$router.go(-2)">
        Change email
      </q-btn>
    </div>
    <div class="pageFooter-div">
      <q-btn class="cancelButton" @click="$router.go(-2)"> Cancel </q-btn>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";

const resetEmail = ref("");
const repeatResetEmail = ref("");
</script>
<style scoped lang="scss">
.resetEmail-page {
  padding: 0 1rem;
  .resetEmail-main {
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
      margin: 0.5rem auto;
      width: 100%;
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

    margin: 0 auto;
  }
}
</style>
