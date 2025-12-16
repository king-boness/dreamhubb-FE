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
      <q-btn class="confirmButton" :loading="saving" @click="handleSave">
        Save changes
      </q-btn>
    </div>
    <div class="pageFooter-div">
      <q-btn class="cancelButton" :disable="saving" @click="handleCancel">
        Cancel
      </q-btn>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { useAuthStore } from "src/stores/auth";

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();

const bio = ref(authStore.user?.bio || "");
const saving = ref(false);

const handleSave = async () => {
  if (saving.value) return;
  saving.value = true;

  try {
    await authStore.updateBio(bio.value);
    $q.notify({
      type: "positive",
      message: "Bio updated",
      position: "top"
    });
    router.back();
  } catch (error) {
    $q.notify({
      type: "negative",
      message: "Failed to update bio. Please try again.",
      position: "top"
    });
  } finally {
    saving.value = false;
  }
};

const handleCancel = () => {
  router.back();
};
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
