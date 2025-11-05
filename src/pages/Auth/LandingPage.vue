<template>
  <div class="col-12 landingPage-contentSection">
    <p class="text-white text-center col-12 textLanding">
      {{ $t("description") }}
    </p>
    <q-btn
      color="primary"
      @click="$router.push('/login')"
      class="LandingPage-loginButton"
      style="margin-bottom: 1rem"
      >{{ $t("signIn") }}</q-btn
    >
    <q-btn
      class="LandingPage-registerButton"
      @click="$router.push('/register/form')"
      >{{ $t("createAccount") }}</q-btn
    >
    <div class="LandingPage-questionContainer">
      <q-btn
        class="LandingPage-questiobButton"
        @click="$router.push('/register/explainers/1')"
        ><img
          v-if="isBodyLight"
          class="LandingPage-questiobImg"
          src="/icons/question-icon-light.svg"
          alt="" />
        <img
          v-else
          class="LandingPage-questiobImg"
          src="/icons/question-icon.svg"
          alt=""
      /></q-btn>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from "vue";

const isBodyLight = ref(false);

const checkBodyClass = () => {
  isBodyLight.value = document.body.classList.contains("body--light");
};

onMounted(() => {
  checkBodyClass();
});
</script>
<style scoped lang="scss">
.landingPage-contentSection {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.LandingPage-registerButton {
  width: 100%;
  background-color: rgba(141, 31, 70, 0.338) !important;
  color: rgba(218, 3, 82, 0.77);
  font-family: montseraatSemiBold;
  font-size: 1.1rem !important;
  border-radius: 0.5rem !important;
  margin-bottom: 1rem;
  width: 22rem;
}
.textLanding {
  font-family: poppins;
  width: 50%;
  font-size: 1.1rem;
  margin-top: 0.1rem;
  margin-bottom: 1rem;
}

.LandingPage-loginButton {
  margin-top: 1.1rem;
  background-color: rgba(182, 0, 67, 1);
  color: white;
  border: none;
  font-size: 1.1rem;
  font-family: montseraatSemiBold;
  border-radius: 0.5rem !important;
  margin-bottom: 0.8rem !important;
  width: 22rem;
}
.LandingPage-questionContainer {
  display: flex;
  justify-content: center;
  align-items: center;
  .LandingPage-questiobButton {
    width: 3rem;
    border-radius: 100%;
  }
}
</style>
