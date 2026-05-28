<template>
  <div class="inspiration-Component">
    <div
      class="inspiration-media"
      role="button"
      tabindex="0"
      @click="openLinkedPostOrNotice"
      @keyup.enter.space.prevent="openLinkedPostOrNotice"
    >
      <q-img
        :src="coverImageSrc"
        :ratio="4 / 5"
        fit="cover"
        no-spinner
        loading="lazy"
        img-class="inspiration-imgEl"
        class="inspiration-qimg"
        :class="{ 'inspiration-qimg--ready': mainImageReady }"
        @load="onCoverLoad"
        @error="onCoverLoad"
      >
        <template #loading>
          <div class="inspiration-imgPlaceholder">
            <q-skeleton type="rect" square class="inspiration-imgSkeleton" />
          </div>
        </template>
      </q-img>
      <div class="inspiration-mediaChrome">
        <div class="profileSection" @click.stop="openAuthorProfile">
          <img
            class="userPicture"
            :src="props.inspiration.user.userPicture"
            alt=""
            width="35"
            height="35"
            loading="lazy"
            decoding="async"
          />
          <span class="userName">{{ props.inspiration.user.userName }}</span>
        </div>
        <div class="inspiration-icons" @click.stop>
        <q-btn class="PostDetail-btn"
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="14"
            viewBox="0 0 12 14"
            fill="none"
          >
            <path
              d="M10 13.6666C9.44444 13.6666 8.97222 13.4721 8.58333 13.0833C8.19444 12.6944 8 12.2221 8 11.6666C8 11.5888 8.00556 11.5081 8.01667 11.4246C8.02778 11.3415 8.04445 11.2666 8.06667 11.1999L3.36667 8.46659C3.17778 8.63325 2.96667 8.7637 2.73333 8.85792C2.5 8.95259 2.25556 8.99992 2 8.99992C1.44444 8.99992 0.972222 8.80547 0.583333 8.41659C0.194444 8.0277 0 7.55547 0 6.99992C0 6.44436 0.194444 5.97214 0.583333 5.58325C0.972222 5.19436 1.44444 4.99992 2 4.99992C2.25556 4.99992 2.5 5.04703 2.73333 5.14125C2.96667 5.23592 3.17778 5.36659 3.36667 5.53325L8.06667 2.79992C8.04445 2.73325 8.02778 2.65836 8.01667 2.57525C8.00556 2.4917 8 2.41103 8 2.33325C8 1.7777 8.19444 1.30547 8.58333 0.916585C8.97222 0.527696 9.44444 0.333252 10 0.333252C10.5556 0.333252 11.0278 0.527696 11.4167 0.916585C11.8056 1.30547 12 1.7777 12 2.33325C12 2.88881 11.8056 3.36103 11.4167 3.74992C11.0278 4.13881 10.5556 4.33325 10 4.33325C9.74444 4.33325 9.5 4.28592 9.26667 4.19125C9.03333 4.09703 8.82222 3.96659 8.63333 3.79992L3.93333 6.53325C3.95556 6.59992 3.97222 6.67481 3.98333 6.75792C3.99444 6.84147 4 6.92214 4 6.99992C4 7.0777 3.99444 7.15814 3.98333 7.24125C3.97222 7.32481 3.95556 7.39992 3.93333 7.46659L8.63333 10.1999C8.82222 10.0333 9.03333 9.90259 9.26667 9.80792C9.5 9.7137 9.74444 9.66659 10 9.66659C10.5556 9.66659 11.0278 9.86103 11.4167 10.2499C11.8056 10.6388 12 11.111 12 11.6666C12 12.2221 11.8056 12.6944 11.4167 13.0833C11.0278 13.4721 10.5556 13.6666 10 13.6666Z"
              fill="#FCFCFC"
            />
          </svg>
        </q-btn>
        <q-btn
          class="PostDetail-btn"
          @click.stop="isLiked = !isLiked"
          :class="{ liked: isLiked }"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            class="likedIcon"
          >
            <path
              d="M7.99992 14.2333L7.03325 13.3533C3.59992 10.24 1.33325 8.18 1.33325 5.66667C1.33325 3.60667 2.94659 2 4.99992 2C6.15992 2 7.27325 2.54 7.99992 3.38667C8.72659 2.54 9.83992 2 10.9999 2C13.0533 2 14.6666 3.60667 14.6666 5.66667C14.6666 8.18 12.3999 10.24 8.96659 13.3533L7.99992 14.2333Z"
              fill="#FCFCFC"
            />
          </svg>
        </q-btn>
        </div>
      </div>
    </div>
    <div class="inspiration-info">
      <span class="inspiration-description">{{
        props.inspiration.description
      }}</span>
      <div class="inspiration-details">
        <span>{{ props.inspiration.inspirationInfo.dateCreated }}</span>
        <div class="inspiration-likes">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="11"
            height="9"
            viewBox="0 0 11 9"
            fill="none"
            style="margin-right: 0.4rem; scale: 1.2; margin-bottom: 0.01rem"
          >
            <path
              d="M5.50008 8.78542L4.8355 8.18042C2.47508 6.04 0.916748 4.62375 0.916748 2.89583C0.916748 1.47958 2.02591 0.375 3.43758 0.375C4.23508 0.375 5.0005 0.74625 5.50008 1.32833C5.99966 0.74625 6.76508 0.375 7.56258 0.375C8.97425 0.375 10.0834 1.47958 10.0834 2.89583C10.0834 4.62375 8.52508 6.04 6.16466 8.18042L5.50008 8.78542Z"
              fill="#CF0A50"
            />
          </svg>
          <span>{{ props.inspiration.inspirationInfo.likes }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, PropType, ref, computed, watch } from "vue";
import { Inspiration } from "src/components/models";
import { useRouter, useRoute } from "vue-router";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";

const isLiked = ref(false);
const mainImageReady = ref(false);

interface Props {
  inspiration: Inspiration;
}

const props: Props = defineProps({
  inspiration: {
    type: Object as PropType<Inspiration>,
    required: true
  }
});

const coverImageSrc = computed(
  () => props.inspiration.inspirationInfo.inspirationImage
);

watch(
  coverImageSrc,
  () => {
    mainImageReady.value = false;
  },
  { immediate: true }
);

const onCoverLoad = () => {
  mainImageReady.value = true;
};

const router = useRouter();
const route = useRoute();
const $q = useQuasar();
const { t } = useI18n();

const routesName = route.name?.toString() || "";
const isDonor = () => routesName.startsWith("donor");

const openLinkedPostOrNotice = () => {
  const id = props.inspiration.linkedPostId;
  if (isDonor() && id != null && id > 0) {
    void router.push({ name: "donor-post-detail", params: { id: String(id) } });
    return;
  }
  $q.notify({
    type: "info",
    message: t("inspirationNoLinkedPost"),
    timeout: 2800
  });
};

const openAuthorProfile = () => {
  const uid = props.inspiration.user.userId;
  if (uid != null && uid > 0) {
    if (isDonor()) {
      void router.push({ name: "donor-user-profile", params: { userId: String(uid) } });
    } else {
      void router.push({ name: "donee-user-profile", params: { userId: String(uid) } });
    }
    return;
  }
  if (isDonor()) {
    void router.push({ name: "donor-userProfile" });
    return;
  }
  $q.notify({
    type: "info",
    message: t("inspirationProfileUnavailable"),
    timeout: 2800
  });
};
</script>
<style scoped lang="scss">
$text-max-length: 10000; // set the maximum length of the text

.body--light {
  .inspiration-info {
    background-color: white !important;
  }
  .profileSection {
    background: linear-gradient(
      108deg,
      rgba(255, 255, 255, 0.7) 0%,
      rgba(243, 243, 243, 0.7) 50%,
      rgba(200, 200, 200, 0.7) 100%
    ) !important;
  }
  .PostDetail-btn {
    background: linear-gradient(
      108deg,
      rgba(255, 255, 255, 0.7) 0%,
      rgba(200, 200, 200, 0.7) 100%
    ) !important;
  }
}

.liked {
  * {
    fill: #bd0043;
    opacity: 1 !important;
  }
}
.likedIcon {
  scale: 1.2;
}
.PostDetail-btn {
  margin: 0 0.4rem;
  width: 2.8rem;
  height: 2.8rem;
  border-radius: 2rem;
  background: linear-gradient(
    108.46deg,
    rgba(0, 0, 0, 0.121) 0%,
    rgba(23, 23, 23, 0.212) 100%
  );
  backdrop-filter: blur(1rem);
}
.inspiration-Component {
  width: 100%;

  /* q-img + ratio="4/5" rezervuje výšku ešte pred načítaním siete */
  .inspiration-media {
    position: relative;
    width: 100%;
    overflow: hidden;
  }

  .inspiration-qimg {
    width: 100%;
    display: block;
  }

  .inspiration-qimg :deep(.inspiration-imgEl) {
    opacity: 0;
    transition: opacity 0.42s ease;
  }

  .inspiration-qimg--ready :deep(.inspiration-imgEl) {
    opacity: 1;
  }

  .inspiration-imgPlaceholder {
    position: absolute;
    inset: 0;
  }

  .inspiration-imgSkeleton {
    width: 100%;
    height: 100%;
    min-height: 12rem;
  }

  .inspiration-mediaChrome {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 0.7rem;
    pointer-events: none;
    z-index: 1;

    .profileSection,
    .inspiration-icons {
      pointer-events: auto;
    }

    .inspiration-icons {
      display: flex;
      width: 100%;
      justify-content: flex-end;
    }

    .profileSection {
      background: linear-gradient(
        108.46deg,
        rgba(0, 0, 0, 0.441) 1%,
        rgba(23, 23, 23, 0.599) 100%
      );
      border-radius: 1.3rem;
      width: 9.3rem;
      height: 3rem;
      min-height: 3rem;
      padding: 0.4rem;
      display: flex;
      align-items: center;
      color: white;
      flex-shrink: 0;

      .userPicture {
        height: 2.2rem;
        width: 2.2rem;
        min-width: 2.2rem;
        min-height: 2.2rem;
        border-radius: 1.5rem;
        margin-left: 0.3rem;
        margin-right: 0.5rem;
        object-fit: cover;
        flex-shrink: 0;
      }

      .userName {
        margin-right: 0.7rem;
        color: white;
        font-weight: bold;
        font-size: 0.9rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: #{$text-max-length}ch;
      }
    }
  }

  .inspiration-info {
    min-height: 10rem;
    background-color: rgba(2, 2, 2, 0.354);
    backdrop-filter: blur(10px);
    color: white;
    font-family: poppins;
    padding: 0.8rem;
    .inspiration-description {
      font-size: 0.9rem;
    }
    .inspiration-details {
      margin-top: 1.5rem;
      display: flex;
      justify-content: space-between;
      color: rgba(255, 255, 255, 0.676);
      font-size: 0.8rem;
    }
  }
}
</style>
