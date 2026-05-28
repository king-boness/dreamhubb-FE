<template>
  <div>
    <p class="explainTitle">{{ $t("registerTitle5") }}</p>
    <div class="row col-12">
      <div class="col-12">
        <!-- <div class="imagePicker q-pa-md">
        <div v-if="data.imageSrc">
          <img class="avatar" :src="data.imageSrc" />
        </div>
        <div v-else class="custom-file-input"></div>
        <input type="file" @change="onFileChange" />
      </div> -->
        <div class="avatar-upload">
          <div class="avatar-edit">
            <input
              type="file"
              @change="onFileChange"
              id="imageUpload"
              accept=".png, .jpg, .jpeg"
            />

            <label for="imageUpload" class="imageUpload"
              ><img src="/images/Auth/plus-solid.svg" class="imgPlus" alt=""
            /></label>
          </div>
          <div class="avatar-preview">
            <div
              v-if="data.imageSrc"
              id="imagePreview"
              :style="`background-image: url(${data.imageSrc}); background-size: cover;`"
            ></div>
            <div
              v-else
              id="imagePreview"
              class="addImageIcon"
              style="background-image: url(/images/Auth/uploadImg-icon.svg)"
            ></div>
          </div>
        </div>
        <div class="inputContainer">
          <q-input
            borderless
            dark
            v-model="data.username"
            label="Username"
            class="registerDatas"
          ></q-input>
          <q-input
            borderless
            dark
            v-model="data.birthDate"
            type="date"
            :rules="[
              () => validateDate(data.birthDate) || 'Must be a valid date.'
            ]"
            class="registerDatas"
            label="Date of birth"
          />
          <q-select
            borderless
            dark
            class="registerDatas"
            v-model="data.gender"
            :options="[$t('male'), $t('female'), $t('preferNotToSay')]"
            label="Gender"
            behavior="menu"
          />
          <q-input
            borderless
            dark
            hide-bottom-space
            v-model="data.email"
            :rules="[(val) => validateEmail(val) || 'Must be a valid email.']"
            :label="$t('emailAddress')"
            class="registerDatas"
            style="margin-top: 1.5rem !important"
          />
          <q-input
            borderless
            dark
            hide-bottom-space
            :type="!isPwd ? 'password' : 'text'"
            :rules="[
              (val) =>
                (val && val.length >= 8) ||
                'Password must be at least 8 characters.'
            ]"
            bottom-slots
            v-model="data.password"
            label="Password"
            class="registerDatas"
          >
            <!-- <template v-slot:hint> Field hint </template> -->

            <template v-slot:append>
              <q-btn
                round
                flat
                :icon="!isPwd ? 'visibility' : 'visibility_off'"
                @click="isPwd = !isPwd"
              />
            </template>
          </q-input>
          <q-input
            borderless
            dark
            hide-bottom-space
            :type="!isPwdConfirm ? 'password' : 'text'"
            bottom-slots
            v-model="data.passwordConfirm"
            label="Repeat Password"
            :rules="[
              (val) => (val && val === data.password) || 'Must match password.'
            ]"
            class="registerDatas"
            style="margin-bottom: 2rem !important"
          >
            <template v-slot:append>
              <q-btn
                round
                flat
                :icon="!isPwdConfirm ? 'visibility' : 'visibility_off'"
                @click="isPwdConfirm = !isPwdConfirm"
              />
            </template>
          </q-input>
        </div>
      </div>
    </div>
    <p class="registerLabel">{{ $t("registerText5") }}</p>
  </div>
</template>
<script setup lang="ts">
import { defineProps, PropType, reactive, watch, ref, onBeforeUnmount } from "vue";

interface Props {
  changeDetails: (
    username: string,
    birthDate: string,
    gender: string,
    email: string,
    password: string,
    passwordConfirm: string,
    image: File
  ) => void;
}
const props: Props = defineProps({
  changeDetails: {
    type: Function as PropType<Props["changeDetails"]>,
    required: true
  }
});
const isPwd = ref(false);
const isPwdConfirm = ref(false);

const validateEmail = (email: string): boolean => {
  return /[a-z0-9]+@[a-z]+\.[a-z]{2,3}/.test(email);
};
const validateDate = (date: string): boolean => {
  return /\d{4}-\d{2}-\d{2}/.test(date);
};
// type PasswordValidator = {
//   length: boolean;
//   capital: boolean;
//   number: boolean;
//   symbol: boolean;
// };

// const validPassword: PasswordValidator = reactive({
//   length: false,
//   capital: false,
//   number: false,
//   symbol: false
// });

// const validatePassword = (password: string): boolean => {
//   // Test length
//   validPassword.length = password.length >= 12;

//   // Test capital
//   validPassword.capital = /^(?=.*[A-Z])/.test(password);

//   // Test number
//   validPassword.number = /^(?=.*[0-9])/.test(password);

//   // Test symbol
//   validPassword.symbol = /^(?=.*[!@#$%^&*_\-=+])/.test(password);

//   return (
//     validPassword.length &&
//     validPassword.capital &&
//     validPassword.number &&
//     validPassword.symbol
//   );
// };
const data = reactive({
  image: new Blob(),
  imageSrc: "",
  username: "",
  birthDate: "",
  gender: "",
  email: "",
  password: "",
  passwordConfirm: ""
});
const onFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) {
    return;
  }
  if (data.imageSrc && data.imageSrc.startsWith("blob:")) {
    URL.revokeObjectURL(data.imageSrc);
  }
  const file = input.files[0];
  const src = URL.createObjectURL(file);
  data.imageSrc = src;
  data.image = file as File;
};
onBeforeUnmount(() => {
  if (data.imageSrc && data.imageSrc.startsWith("blob:")) {
    URL.revokeObjectURL(data.imageSrc);
  }
});
fetch("/images/Auth/default-avatar-male.jpg").then((response) =>
  response.blob().then((blob) => {
    data.image = blob;
  })
);
watch(data, () => {
  props.changeDetails(
    data.username,
    data.birthDate,
    data.gender,
    data.email,
    data.password,
    data.passwordConfirm,
    data.image as File
  );
});
</script>
<style lang="scss" scoped>
.inputContainer {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  * {
    margin: 0.7rem 0 !important;
  }
  margin-bottom: 1rem;
}

.registerDatas {
  width: 100%;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -webkit-tap-highlight-color: transparent;

  :deep(.q-field__control) {
    will-change: transform;
    transform: translateZ(0);
    -webkit-transform: translateZ(0);
    transition: all 0.2s ease;
  }

  :deep(.q-select) {
    will-change: transform;
    transform: translateZ(0);
    -webkit-transform: translateZ(0);
  }

  :deep(.q-menu) {
    will-change: transform, opacity;
    transform: translateZ(0);
    -webkit-transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    transform-origin: top center;
  }

  :deep(.q-menu:not(.q-menu--hide)) {
    animation: slideDownFade 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  :deep(.q-list) {
    padding: 4px 0;
  }

  :deep(.q-item) {
    will-change: transform, opacity;
    transform: translateZ(0);
    -webkit-transform: translateZ(0);
    transition: background-color 0.2s ease, transform 0.15s ease;
    opacity: 0;
    transform: translateY(-4px);
    animation: fadeInUp 0.2s ease forwards;

    @for $i from 1 through 10 {
      &:nth-child(#{$i}) {
        animation-delay: #{$i * 0.02}s;
      }
    }

    &:hover {
      transform: translateY(0) scale(1.01);
      background-color: rgba(189, 0, 67, 0.1);
    }

    &.q-item--active {
      opacity: 1;
      transform: translateY(0);
    }
  }
}

@keyframes slideDownFade {
  0% {
    opacity: 0;
    transform: translateY(-8px) scale(0.96);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(-4px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
// .avatar {
//   vertical-align: middle;
//   width: 124px;
//   height: 124px;
//   border-radius: 50%;
//   object-fit: cover;
// }
// .custom-file-input::-webkit-file-upload-button {
//   visibility: hidden;
// }
// .custom-file-input::before {
//   content: "";
//   display: block;
//   background-image: url("src/assets/Icons/AddImageIcon.png");
//   background-position: center center;
//   background-repeat: no-repeat;
//   border: 1px solid $primary;
//   border-radius: 50%;
//   width: 124px;
//   height: 124px;
//   outline: none;
//   white-space: nowrap;

//   cursor: pointer;
// }
// .custom-file-input:hover::before {
//   border-color: black;
// }
// .custom-file-input:active::before {
//   background: -webkit-linear-gradient(top, #e3e3e3, #f9f9f9);
// }
.avatar-upload {
  position: relative;
  max-width: 150px;
  margin: 50px auto;

  .avatar-edit {
    position: absolute;
    right: 12px;
    z-index: 1;
    top: 10px;

    input {
      display: none;

      + label {
        display: inline-block;
        width: 34px;
        height: 34px;
        margin-bottom: 0;
        border-radius: 100%;
        background: $primary;
        border: 1px solid transparent;
        box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.12);
        cursor: pointer;
        font-weight: normal;
        transition: all 0.2s ease-in-out;

        &:hover {
          background: #f1f1f1;
          border-color: $primary;
        }

        // &:after {
        // content: "\f040";
        // font-family: "FontAwesome";
        // color: #757575;
        // position: absolute;
        // top: 10px;
        // left: 0;
        // right: 0;
        // text-align: center;
        // margin: auto;
        // }
      }
    }
  }

  .avatar-preview {
    width: 124px;
    height: 124px;
    position: relative;
    border-radius: 100%;
    border: 0.1rem solid rgba(189, 0, 67, 1);
    box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.1);

    > div {
      width: 100%;
      height: 100%;
      border-radius: 100%;
      background-repeat: no-repeat;
      background-position: center;
    }
  }
}
</style>
