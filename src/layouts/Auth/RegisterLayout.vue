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
          :disabled="nextDisabled || !acceptedTerms"
          color="primary"
          class="button"
          @click="register"
        />
        <div v-if="registrationIndex !== 1 && !horiz" class="registerLegal">
          <q-checkbox v-model="acceptedTerms" dark dense class="registerLegal-checkbox">
            <span class="registerLegal-label">
              I agree to the
              <router-link :to="{ name: 'terms-of-use' }" @click.stop>Terms of Use</router-link>
              and
              <router-link :to="{ name: 'privacy-policy' }" @click.stop>Privacy Policy</router-link>.
            </span>
          </q-checkbox>
          <AuthLegalNotice />
        </div>
      </div>
    </q-page-container>
  </q-layout>
</template>
<script lang="ts" setup>
import { reactive, ref, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import RegistrationPage1 from "src/pages/Auth/Registration/RegistrationPage1.vue";
import RegistrationPage4 from "src/pages/Auth/Registration/RegistrationPage4.vue";
import RegistrationPage5 from "src/pages/Auth/Registration/RegistrationPage5.vue";
import { api } from "boot/axios";
import { notifyError } from "src/utils/notify";
import { mapAxiosErrorToDhError } from "src/utils/httpError";
import { API_BASE_SOURCE, API_BASE_URL } from "src/config/apiBase";
import AuthLegalNotice from "src/components/Auth/AuthLegalNotice.vue";

const horiz = ref(false);
const acceptedTerms = ref(false);
const { t } = useI18n();
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

const summarizeBodyPreview = (value: unknown) => {
  if (!value || typeof value !== "object") return value;
  const rec = value as Record<string, unknown>;
  return {
    status: rec.status,
    message: rec.message,
    errorKeys: rec.errors && typeof rec.errors === "object" ? Object.keys(rec.errors as Record<string, unknown>) : undefined
  };
};

onMounted(() => {
  console.info("[DH-REGISTER-DIAG]", "mount", {
    resolvedApiBase: API_BASE_URL || "(empty)",
    resolvedApiBaseSource: API_BASE_SOURCE,
    axiosDefaultBaseURL: api.defaults.baseURL ?? "(empty)",
    mode: import.meta.env.MODE,
    href: typeof window !== "undefined" ? window.location.href : "",
    navigatorOnLine: typeof navigator !== "undefined" ? navigator.onLine : null
  });
});

const register = async () => {
  const payload = {
    username: registrationInfo.username,
    email: registrationInfo.email,
    password: registrationInfo.password,
    // BE currently validates only password, but this keeps parity with modern FE flows.
    password_confirmation: registrationInfo.passwordConfirm,
    date_birth: registrationInfo.birthDate,
    gender: registrationInfo.gender,
    // Legacy register layout captures only city/state/country names; IDs are required by BE.
    // Send parsed numeric values if present, otherwise null (BE returns validation errors).
    location_country_id: Number(registrationInfo.country) || null,
    location_continent_id: Number(registrationInfo.state) || null,
    location_city_id: Number(registrationInfo.city) || null,
    accepted_terms: acceptedTerms.value
  };

  const resolvedBase = String(api.defaults.baseURL || "").replace(/\/$/, "");
  const requestUrl = `${resolvedBase}/register`;
  console.info("[DH-REGISTER-DIAG]", "submit.start", {
    requestUrl,
    method: "post",
    payloadKeys: Object.keys(payload),
    payloadLocationPreview: {
      location_country_id: payload.location_country_id,
      location_continent_id: payload.location_continent_id,
      location_city_id: payload.location_city_id
    },
    navigatorOnLine: typeof navigator !== "undefined" ? navigator.onLine : null
  });

  try {
    const response = await api.post("/register", payload);
    console.info("[DH-REGISTER-DIAG]", "submit.success", {
      status: response.status,
      bodyPreview: summarizeBodyPreview(response.data)
    });
    // Success handled by redirect, no toast needed
    await router.push({ name: "login" });
  } catch (err: unknown) {
    const status: number | undefined = (err as { response?: { status?: number } })?.response?.status;
    const mapped = mapAxiosErrorToDhError(err);
    console.info("[DH-REGISTER-DIAG]", "submit.error", {
      status,
      code: (err as { code?: string })?.code,
      message: (err as { message?: string })?.message,
      mappedKind: mapped.kind,
      mappedAsOffline: mapped.kind === "offline",
      navigatorOnLine: typeof navigator !== "undefined" ? navigator.onLine : null,
      bodyPreview: summarizeBodyPreview((err as { response?: { data?: unknown } })?.response?.data)
    });

    if (status === 406) {
      notifyError({
        kind: "validation",
        status,
        messageKey: "registrationUsernameExists",
        fallbackMessage: t("registrationUsernameExists"),
        retryable: false
      });
      return;
    }

    // Fallback: map common network/offline/timeout/5xx to safe texts
    notifyError(mapped);
  }
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
  // Never log registration payloads (PII) even in dev
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
/* Background from global app (iosSafeArea.scss) */
.LayoutBackground {
  background-image: none !important;
  background-color: transparent !important;
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

.registerLegal {
  width: 22rem;
  margin: 0.75rem auto 0;
  text-align: left;
}

.registerLegal-label {
  font-size: 0.85rem;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.85);

  a {
    color: #ff4db8;
    text-decoration: underline;
  }
}
</style>
