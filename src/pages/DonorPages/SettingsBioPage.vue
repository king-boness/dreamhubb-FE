<template>
  <div class="settingsBio-page">
    <div class="settingsBio-main">
      <span class="settingsBio-title">Change Bio</span>
      <q-input
        borderless
        dark
        hide-bottom-space
        bottom-slots
        v-model="bio"
        label="Tell something about yourself..."
        class="registerDatas registerSecrete bioPage-input"
        type="textarea"
      >
      </q-input>
    </div>
    <div class="confirmationButton-div">
      <q-btn class="confirmButton" @click="$router.go(-1)">
        Save changes
      </q-btn>
    </div>
    <div class="pageFooter-div">
      <q-btn class="cancelButton" @click="$router.go(-1)"> Cancel </q-btn>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";

const bio = ref("");
</script>
<style scoped lang="scss">
.settingsBio-page {
  padding: 0 1rem;
  .settingsBio-main {
    display: flex;
    width: 100%;
    justify-content: start;
    align-items: start;
    margin: 1.5rem 0;
    flex-direction: column;

    .settingsBio-title {
      font-size: 1.4rem;
      font-family: poppinsSemiBold;
      margin-bottom: 0.7rem;
      color: white;
    }

    .bioPage-input {
      font-family: montseraat;
      margin: 0.5rem auto;
      width: 100%;
      height: 10rem;
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
