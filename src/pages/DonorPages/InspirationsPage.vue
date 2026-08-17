<template>
  <q-page class="inspiration-page donorPostsPage donorPostsPage--unifiedScroll" :padding="false">
    <div v-if="!initialFetchDone" class="inspiration-feed inspiration-feed--boot">
      <div
        v-for="n in 3"
        :key="'sk-' + n"
        class="inspiration-skeletonCard"
        aria-hidden="true"
      >
        <div class="inspiration-skeletonCard__media">
          <q-skeleton type="rect" square class="inspiration-skeletonCard__mediaInner" />
        </div>
        <div class="inspiration-skeletonCard__body">
          <q-skeleton type="text" width="92%" class="q-mb-sm" />
          <q-skeleton type="text" width="70%" class="q-mb-md" />
          <q-skeleton type="text" width="40%" />
        </div>
      </div>
    </div>

    <template v-else>
      <StorieShowComponent
        :my-story="myStory"
        :stories="stories"
        @seen="(i: number) => feedStore.markStorySeen(i)"
      />

      <div class="inspiration-header">
        <h2 class="inspiration-heading">{{ t("inspirationsForYou") }}</h2>
        <q-btn
          class="add-post-btn"
          no-caps
          @click="openComposer"
        >
          <img src="/images/Auth/tokenButton.png" alt="" />
          <span>{{ t("addPost") }}</span>
        </q-btn>
      </div>

      <div class="inspiration-body">
        <q-pull-to-refresh @refresh="onPullRefresh">
          <div v-if="errorMessage" class="inspiration-panel inspiration-panel--error">
            <RetryPanel
              :message="errorMessage"
              :on-retry="retryFetch"
              variant="inline"
              button-class="inspiration-retry-btn"
            />
          </div>

          <div
            v-else-if="items.length === 0"
            class="inspiration-panel inspiration-panel--empty"
          >
            <p class="inspiration-empty-title">{{ t("inspirationsEmptyTitle") }}</p>
            <p class="inspiration-empty-text">{{ t("inspirationsEmptyHint") }}</p>
            <q-btn
              class="add-post-btn add-post-btn--inline"
              no-caps
              @click="openComposer"
            >
              <img src="/images/Auth/tokenButton.png" alt="" />
              <span>{{ t("addPost") }}</span>
            </q-btn>
          </div>

          <div v-else class="inspiration-feed">
            <InspirationComponent
              v-for="item in items"
              :key="item.id"
              :inspiration="item"
            />
          </div>
        </q-pull-to-refresh>
      </div>
    </template>

    <div v-if="dialog">
      <q-card
        class="slide-drawer slide-drawer--bottom text-white fixed-bottom column no-wrap"
        :class="`slide-drawer--open-${drawerMode}`"
        :style="drawerStyle"
        v-touch-pan.mouse.vertical.prevent="() => {}"
      >
        <q-card-section
          class="slide-drawer__handler--horizontal row flex-center"
          v-touch-pan.mouse.vertical.prevent="slideDrawer"
        >
          <div class="cursor-pointer"></div>
        </q-card-section>
        <q-card-section class="badge-swiper-title-div">
          <span class="badge-swiper-title">{{ t("addInspirationPost") }}</span>
        </q-card-section>
        <q-card-section class="badge-swiper-uploader-div">
          <ImageUploader
            :key="uploaderKey"
            :max="5"
            :upload-msg="t('inspirationAddImage')"
            @images-updated="onComposerImages"
          />
        </q-card-section>
        <q-card-section class="badge-swiper-message-div">
          <q-input
            v-model="inspirationMessage"
            borderless
            dark
            hide-bottom-space
            bottom-slots
            type="textarea"
            :label="t('inspirationPostPlaceholder')"
            class="registerDatas registerSecrete badge-swiper-inspiration-message"
          />
        </q-card-section>
        <q-card-section class="badge-swiper-desc-div">
          <q-btn
            class="confirm-button"
            :loading="composerSubmitting"
            @click="submitInspiration"
          >
            {{ t("postInspiration") }}
          </q-btn>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { useQuasar } from "quasar";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";
import InspirationComponent from "src/components/partials/InspirationComponent.vue";
import StorieShowComponent from "src/components/partials/StorieShowComponent.vue";
import ImageUploader from "src/components/partials/UploadImgComponent.vue";
import RetryPanel from "src/components/common/RetryPanel.vue";
import { useInspirationsFeedStore } from "src/stores/inspirationsFeed";
import type { UploadedImage } from "src/composables/useUpload";
import { mapAxiosErrorToDhError } from "src/utils/httpError";

const { t } = useI18n();
const $q = useQuasar();
const feedStore = useInspirationsFeedStore();

const { items, myStory, stories, error } = storeToRefs(feedStore);

const initialFetchDone = ref(false);
const inspirationMessage = ref("");
const composerImages = ref<UploadedImage[]>([]);
const uploaderKey = ref(0);
const dialog = ref(false);
const composerSubmitting = ref(false);

const errorMessage = computed(() => error.value);

const drawerMinHeight = 100;
const drawerTopOffset = $q.screen.height - 630;
const drawerOpenRatioHalf = 50;
let animateTimeout: ReturnType<typeof setTimeout> | null = null;
const drawerPos = ref(drawerMinHeight);

const drawerMaxHeight = computed(() => Math.max(0, $q.screen.height - drawerTopOffset));

const drawerOpenRatio = computed(() =>
  Math.round(
    (Math.max(0, drawerPos.value - drawerMinHeight) /
      Math.max(1, drawerMaxHeight.value - drawerMinHeight)) *
      100
  )
);

const drawerStyle = computed(() => ({
  height: `${drawerMaxHeight.value}px`,
  transform: `translateY(${-drawerPos.value}px)`
}));

const drawerMode = computed(() => {
  if (drawerOpenRatio.value > drawerOpenRatioHalf) return "full";
  return drawerOpenRatio.value > 0 ? "half" : "handler";
});

const slideDrawer = (ev: {
  direction: "up" | "down" | "left" | "right";
  delta: { y: number };
  isFinal: boolean;
}) => {
  const { direction, delta, isFinal } = ev;
  drawerPos.value = Math.max(
    drawerMinHeight,
    Math.min(drawerMaxHeight.value, drawerPos.value - delta.y)
  );
  if (isFinal === true) {
    nextTick(() => {
      const aboveHalf = drawerOpenRatio.value > drawerOpenRatioHalf;
      const targetHeight =
        direction === "up"
          ? aboveHalf
            ? drawerMaxHeight.value
            : Math.round(drawerMaxHeight.value / 2)
          : null;
      animateDrawerTo(targetHeight);
    });
  }
};

const animateDrawerTo = (height: number | null) => {
  if (animateTimeout) clearTimeout(animateTimeout);
  if (height === null) return;
  const diff = height - drawerPos.value;
  if (diff !== 0) {
    drawerPos.value += Math.abs(diff) < 2 ? diff : Math.round(diff / 2);
    animateTimeout = setTimeout(() => animateDrawerTo(height), 30);
  }
};

const cycleDrawerOpen = () => {
  animateDrawerTo(Math.round(drawerMaxHeight.value));
};

watch(
  () => drawerOpenRatio.value,
  (newVal) => {
    if (newVal === 0) {
      animateDrawerTo(drawerMinHeight);
      dialog.value = false;
    }
  }
);

const runInitialFetch = async () => {
  await feedStore.fetchFeed(t("inspirationsYourStory"), true);
  initialFetchDone.value = true;
};

onMounted(() => {
  void runInitialFetch();
});

const retryFetch = async () => {
  feedStore.clearError();
  await feedStore.fetchFeed(t("inspirationsYourStory"), true);
};

const onPullRefresh = async (done: () => void) => {
  await feedStore.fetchFeed(t("inspirationsYourStory"), true);
  setTimeout(() => done(), 400);
};

const openComposer = () => {
  dialog.value = true;
  inspirationMessage.value = "";
  composerImages.value = [];
  uploaderKey.value += 1;
  nextTick(() => cycleDrawerOpen());
};

const onComposerImages = (imgs: UploadedImage[]) => {
  composerImages.value = imgs;
};

const submitInspiration = async () => {
  const text = inspirationMessage.value.trim();
  const cover = composerImages.value[0]?.secure_url;
  if (!text && !cover) {
    $q.notify({
      type: "warning",
      message: t("inspirationNeedTextOrImage")
    });
    return;
  }
  if (!cover) {
    $q.notify({
      type: "warning",
      message: t("inspirationNeedTextOrImage")
    });
    return;
  }
  composerSubmitting.value = true;
  try {
    await feedStore.createInspiration(text, cover);
    inspirationMessage.value = "";
    composerImages.value = [];
    uploaderKey.value += 1;
    dialog.value = false;
    drawerPos.value = drawerMinHeight;
    $q.notify({
      type: "positive",
      message: t("inspirationPosted")
    });
  } catch (e) {
    $q.notify({
      type: "negative",
      message: mapAxiosErrorToDhError(e).fallbackMessage || "Failed to post inspiration."
    });
  } finally {
    composerSubmitting.value = false;
  }
};
</script>

<style lang="scss">
.q-field__label {
  color: rgba(255, 255, 255, 0.366) !important;
}
</style>

<style scoped lang="scss">
.inspiration-page {
  min-height: 100%;
  box-sizing: border-box;
}

.inspiration-feed--boot {
  padding-bottom: 0.5rem;
}

.inspiration-skeletonCard {
  width: 100%;
}

/* Rovnaký pomer 4/5 ako InspirationComponent (q-img ratio) */
.inspiration-skeletonCard__media {
  width: 100%;
  aspect-ratio: 4 / 5;
  position: relative;
}

.inspiration-skeletonCard__mediaInner {
  position: absolute !important;
  inset: 0;
  width: 100% !important;
  height: 100% !important;
}

.inspiration-skeletonCard__body {
  min-height: 10rem;
  padding: 0.8rem;
  box-sizing: border-box;
}

.inspiration-header {
  display: flex;
  align-items: center;
  padding: 1rem 0.8rem;
  flex-direction: row;
  justify-content: space-between;
}

.inspiration-heading {
  color: white;
  margin: 0;
  font-family: poppinsSemiBold, sans-serif;
  font-size: 1.1rem;
  margin-right: 2rem;
}

.add-post-btn {
  background-color: rgba(221, 31, 97, 0.176) !important;
  color: rgb(218, 3, 82) !important;
  font-family: montseraat, sans-serif;
  font-size: 0.9rem !important;
  width: 7.1rem !important;
  height: 2rem;
  border-radius: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;

  &--inline {
    width: auto !important;
    min-width: 7.5rem;
    padding: 0 1rem;
    margin-top: 0.75rem;
  }

  img {
    margin-right: 0.3rem;
    margin-left: -0.3rem;
  }

  span {
    padding-bottom: 0.07rem;
  }
}

.inspiration-body {
  background-image: none !important;
  background-color: transparent !important;
  padding-bottom: 0.5rem;
}

.inspiration-panel {
  padding: 1.5rem 1rem;
  text-align: center;

  &--empty {
    max-width: 22rem;
    margin: 0 auto;
  }
}

.inspiration-empty-title {
  margin: 0 0 0.5rem;
  font-family: poppinsSemiBold, sans-serif;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.92);
}

.inspiration-empty-text {
  margin: 0;
  font-size: 0.88rem;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.65);
}

.inspiration-feed {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  width: 100%;
}

.inspiration-retry-btn {
  color: #ff4db8;
  font-family: poppinsSemiBold, sans-serif;
}

.badge-swiper-uploader-div {
  padding: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;

  :deep(.container) {
    padding: 1rem 0;
    min-height: 8rem;
    display: flex;
    flex-wrap: wrap;
  }
}

.badge-swiper-title-div {
  display: flex;
  justify-content: center;

  .badge-swiper-title {
    color: white;
    font-family: poppins, sans-serif;
    font-weight: 600;
    font-size: 1.2rem;
  }
}

.badge-swiper-message-div {
  padding: 0.5rem;

  .badge-swiper-inspiration-message {
    height: 9rem;
    width: 100%;
    margin-bottom: 0;
    margin-top: 0;
  }
}

.badge-swiper-desc-div {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 0.5rem;
  padding-top: 0;

  .confirm-button {
    background-color: rgba(182, 0, 67, 1);
    color: white;
    border: none;
    font-size: 1.2rem;
    height: 3.3rem;
    border-radius: 0.5rem;
    width: 22rem;
    max-width: 92vw;
    margin-top: 0.5rem;
    font-family: montseraatSemiBold, sans-serif;
  }
}

.slide-drawer {
  height: 40rem !important;
  border-radius: 20px !important;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;

  &--bottom {
    border-radius: 20px;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    background-color: #333;
    background-image: radial-gradient(circle, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%);
    bottom: unset;
    top: 100%;
    transition: background-color 0.3s ease-in-out;
    z-index: 111;

    > div:last-child,
    > img:last-child {
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }

    &.slide-drawer--open-half {
      opacity: 0.9;
    }
  }

  &__handler--horizontal {
    cursor: grab;

    > div {
      width: 50%;
      height: 8px;
      border-radius: 4px;
      background-color: rgba(200, 200, 200, 0.7);
    }
  }
}

.slide-drawer::before {
  content: "\A";
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.5);
  opacity: 1;
  transition: all 0.5s;
  border-radius: 20px;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.body--light {
  .inspiration-heading {
    color: #1d1d1d;
  }

  .inspiration-empty-title {
    color: rgba(0, 0, 0, 0.88);
  }

  .inspiration-empty-text {
    color: rgba(0, 0, 0, 0.55);
  }
}
</style>
