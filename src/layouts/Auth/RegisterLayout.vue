<template>
  <q-layout
    view="lHh Lpr fff "
    class="LayoutBackground"
    :class="{ iphoneDevice: $q.platform.is.ios }"
  >
    <q-page-container>
      <div class="row bgExplain">
        <div class="row col-12">
          <q-btn class="arrowButtonBack" @click="previousRegister">
            <img
              class="arrowButtonBack-icon"
              src="/icons/arrowIcon.svg"
              alt=""
            />
          </q-btn>
          <div class="col-7 q-mx-auto">
            <q-linear-progress
              :value="progress"
              rounded
              animationSpeed="600"
              color="negative"
              class="q-mt-sm linearProgress"
              style="margin-top: 1.2rem; margin-left: -1.2rem"
            />
          </div>
        </div>
        <div class="col-12 row justify-center explainBody">
          <Transition name="fade" mode="out-in">
            <keep-alive>
              <component
                :is="activeComponent.name"
                v-bind="activeComponent.props"
                :next-page="nextRegister"
                @changedHoriz="horiz = !horiz"
              />
            </keep-alive>
          </Transition>
        </div>
        <q-btn
          v-if="registrationIndex == 1 && horiz"
          :label="'Pick ' + registrationInfo.side"
          :disabled="nextDisabled"
          color="primary"
          class="button"
          @click="nextRegister(), (horiz = !horiz)"
        />
        <q-btn
          v-if="registrationIndex !== 3 && !horiz"
          label="NEXT STEP"
          :disabled="nextDisabled"
          color="primary"
          class="button"
          @click="nextRegister"
        />
        <q-btn
          v-else-if="registrationIndex !== 1 && !horiz"
          label="JOIN"
          :disabled="nextDisabled"
          color="primary"
          class="button"
          @click="register"
        />
      </div>
    </q-page-container>
  </q-layout>
</template>
<script lang="ts" setup>
import { reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import RegistrationPage1 from "src/pages/Auth/Registration/RegistrationPage1.vue";
import RegistrationPage4 from "src/pages/Auth/Registration/RegistrationPage4.vue";
import RegistrationPage5 from "src/pages/Auth/Registration/RegistrationPage5.vue";
import { useApiCallStore } from "src/stores/api-calls-store";

const horiz = ref(false);
const { t } = useI18n();
const apiCalls = useApiCallStore();
const router = useRouter();
const registrationIndex = ref(1);

const progress = ref(registrationIndex.value * 0.33);
const nextDisabled = ref(false);

const $q = useQuasar();
const registrationInfo = reactive({
  side: "",
  country: "",
  state: "",
  city: "",
  username: "",
  birthDate: "",
  gender: "",
  email: "",
  password: "",
  passwordConfirm: "",
  image: new Blob()
});
const changeSide: (side: string) => void = (side: string) => {
  registrationInfo.side = side;
};
const changeCountry: (city: string, state: string, country: string) => void = (
  city: string,
  state: string,
  country: string
) => {
  registrationInfo.city = city;
  registrationInfo.state = state;
  registrationInfo.country = country;
};
const changeDetails: (
  username: string,
  birthDate: string,
  gender: string,
  email: string,
  password: string,
  passwordConfirm: string,
  image: File
) => void = (
  username: string,
  birthDate: string,
  gender: string,
  email: string,
  password: string,
  passwordConfirm: string,
  image: File
) => {
  registrationInfo.username = username;
  registrationInfo.birthDate = birthDate;
  registrationInfo.gender = gender;
  registrationInfo.email = email;
  registrationInfo.password = password;
  registrationInfo.passwordConfirm = passwordConfirm;
  registrationInfo.image = image;
};

const register = async () => {
  const form = new FormData();
  form.append("userFirstName", "jozko");
  form.append("userLastName", "ferko");
  form.append("userName", registrationInfo.username);
  form.append("userEmail", registrationInfo.email);
  form.append("userGender", registrationInfo.gender);
  form.append("userBirthDate", registrationInfo.birthDate);
  form.append("userPassword", registrationInfo.password);
  form.append("userSide", registrationInfo.side);
  form.append("userGoal", "goal");
  form.append("userDream", "dream");
  form.append("userCountry", registrationInfo.country);
  form.append("userState", registrationInfo.state);
  form.append("userCity", registrationInfo.city);
  form.append("file", registrationInfo.image);
  await apiCalls
    .register(form)
    .then(() => {
      $q.notify({
        message: t("registrationSuccess"),
        color: "positive",
        icon: "check"
      });
      return router.push({ name: "login" });
    })
    .catch((err) => {
      if (err.response.status === 406) {
        return $q.notify({
          message: t("registrationUsernameExists"),
          color: "negative",
          icon: "report_problem"
        });
      } else {
        return $q.notify({
          message: t("registrationError"),
          color: "negative",
          icon: "report_problem"
        });
      }
    });
};

const comps = [
  {
    name: RegistrationPage1,
    props: {
      changeSide: changeSide as (side: string) => void,
      registrationInfo
    }
  },
  {
    name: RegistrationPage4,
    props: {
      changeCountry
    }
  },
  {
    name: RegistrationPage5,
    props: {
      image: registrationInfo.image,
      username: registrationInfo.username,
      changeDetails
    }
  }
];
let activeComponent = comps[registrationIndex.value - 1] as {
  name: object;
  props: object;
};

watch(registrationInfo, () => {
  disabledCheck();
  if (process.env.NODE_ENV === "development") {
    console.log(registrationInfo);
  }
});

const disabledCheck = () => {
  if (registrationIndex.value !== 2 && registrationIndex.value !== 3) {
    nextDisabled.value = false;
  }
  if (registrationIndex.value === 2) {
    if (
      registrationInfo.city === "" ||
      registrationInfo.state === "" ||
      registrationInfo.country === ""
    ) {
      nextDisabled.value = true;
    } else {
      nextDisabled.value = false;
    }
  }
  if (registrationIndex.value === 3) {
    if (
      registrationInfo.side === "" ||
      // registrationInfo.goal === "" ||
      // registrationInfo.dream === "" ||
      registrationInfo.username === "" ||
      registrationInfo.birthDate === "" ||
      registrationInfo.gender === "" ||
      registrationInfo.email === "" ||
      registrationInfo.password === "" ||
      registrationInfo.passwordConfirm !== registrationInfo.password
    ) {
      nextDisabled.value = true;
    } else {
      nextDisabled.value = false;
    }
  }
};
const nextRegister = async () => {
  if (registrationIndex.value + 1 > 3) {
    await router.push({ name: "components" });
  } else {
    progress.value += 0.33;
    registrationIndex.value++;
    activeComponent = comps[registrationIndex.value - 1];
  }
  disabledCheck();
};

const previousRegister = () => {
  if (registrationIndex.value - 1 < 1) {
    router.push({ name: "landing" });
  } else {
    progress.value -= 0.33;
    registrationIndex.value--;
    activeComponent = comps[registrationIndex.value - 1];
  }
  disabledCheck();
};
</script>
<style scoped lang="scss">
.buttonContainer {
  display: flex;
  justify-content: center;
  align-items: center;
}
.q-btn::before {
  box-shadow: none;
}
.LayoutBackground {
  background-image: url("/images/Auth/bg-explain.png");
  background-repeat: no-repeat;
  background-size: cover;
  background-position: top;
}
</style>
<style scoped>
.arrowButtonBack {
  background-color: none;
  border: 0.1rem solid white;
  border-radius: 50%;
  height: 2.5rem;
  width: 2.5rem;
  padding-right: 1.11rem;
}
.registerLocationButton {
  margin-top: 1rem !important;
}
.button {
  background-color: rgba(182, 0, 67, 1);
  color: white;
  border: none;
  font-size: 1.2rem;
  height: 3.2rem;
  width: 22rem;
  font-family: montseraatSemiBold;
  border-radius: 0.5rem !important;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
