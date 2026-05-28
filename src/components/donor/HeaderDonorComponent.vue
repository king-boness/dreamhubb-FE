<template>
  <div
    class="header row"
    :class="{ 'iphoneDevice-large': $q.platform.is.ios }"
  >
    <div class="row">
      <template v-if="!shouldShowBack">
        <div class="iconContainer" @click="handleLogoClick">
          <DreamhubbHeaderMark :is-body-light="props.isBodyLight" class="logoIcon" />
          <img src="/header_icons/donor.svg" alt="" class="header-roleIcon" />
          <img src="/header_icons/swap.svg" alt="" class="navbarIcon" />
        </div>
      </template>
      <template v-else>
        <q-btn class="settingsHeader-button" @click="handleHeaderBack">
          <img src="/icons/arrowIcon.svg" alt="" />
        </q-btn>
      </template>
    </div>
    <div class="row">
      <div class="row items-center">
        <svg
          width="49"
          height="49"
          viewBox="0 0 44 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          @click="$router.push({ name: 'donor-search' })"
          class="searchIcon"
        >
          <g opacity="0.8">
            <path
              d="M31 31L26.65 26.65M29 21C29 25.4183 25.4183 29 21 29C16.5817 29 13 25.4183 13 21C13 16.5817 16.5817 13 21 13C25.4183 13 29 16.5817 29 21Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </g>
        </svg>
      </div>
      <div class="displayKarma">
        <div class="textWrapper">
          <img src="/icons/KarmaIcon.png" alt="" class="navbarKarmaIcon" />
          <span class="karmaValue">{{ formatNumber(props.karma) }}</span>
          <q-btn class="navbarButton" @click="$router.push({ name: 'donor-tokenshop' })">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              class="buttonIcon"
            >
              <path
                d="M9.16667 4.16667H5.83333V0.833333C5.83333 0.61232 5.74554 0.400358 5.58926 0.244078C5.43297 0.0877975 5.22101 0 5 0C4.77899 0 4.56702 0.0877975 4.41074 0.244078C4.25446 0.400358 4.16667 0.61232 4.16667 0.833333V4.16667H0.833333C0.61232 4.16667 0.400358 4.25446 0.244078 4.41074C0.0877975 4.56702 0 4.77899 0 5C0 5.22101 0.0877975 5.43297 0.244078 5.58926C0.400358 5.74554 0.61232 5.83333 0.833333 5.83333H4.16667V9.16667C4.16667 9.38768 4.25446 9.59964 4.41074 9.75592C4.56702 9.9122 4.77899 10 5 10C5.22101 10 5.43297 9.9122 5.58926 9.75592C5.74554 9.59964 5.83333 9.38768 5.83333 9.16667V5.83333H9.16667C9.38768 5.83333 9.59964 5.74554 9.75592 5.58926C9.9122 5.43297 10 5.22101 10 5C10 4.77899 9.9122 4.56702 9.75592 4.41074C9.59964 4.25446 9.38768 4.16667 9.16667 4.16667Z"
                fill="#BD0043"
              />
            </svg>
          </q-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, computed } from "vue";
import DreamhubbHeaderMark from "src/components/common/DreamhubbHeaderMark.vue";
import { useRoute, useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { usePreferencesStore } from "src/stores/preferences";
import { formatNumber } from "src/components/partials/FunctionsComponent.vue";
import { goBackOrFallback, resolveBackFallback } from "src/utils/navigation";
import { refreshTokenIfNeeded } from "boot/axios";

const $q = useQuasar();

interface Props {
  karma: number;
  showBack?: boolean;
  /** Optional: logo reads theme from DOM; kept for API compatibility. */
  isBodyLight?: boolean;
}

const props = defineProps<Props>();

const router = useRouter();
const route = useRoute();
const preferencesStore = usePreferencesStore();

const emit = defineEmits(["role-switch-start", "role-switch-end"]);

const shouldShowBack = computed(() => {
  return Boolean(props.showBack || route.meta?.showHeaderBack);
});

const handleHeaderBack = () => {
  const routeName = route.name?.toString() || "";
  const defaultFallback =
    routeName.startsWith("donor-settings") && routeName !== "donor-settings"
      ? { name: "donor-settings" }
      : { name: "donor-posts" };
  const fallback = resolveBackFallback(route.meta?.headerBackFallback, route, defaultFallback);
  goBackOrFallback(router, fallback);
};

const handleLogoClick = async () => {
  await refreshTokenIfNeeded();
  preferencesStore.setCurrentSide("donee");
  document.body.classList.add("splash-active", "dh-role-switching");
  emit("role-switch-start");
  await new Promise((resolve) => setTimeout(resolve, 500));
  await router.push({ name: "donee-posts" });
  setTimeout(() => {
    emit("role-switch-end");
    document.body.classList.remove("splash-active", "dh-role-switching");
  }, 300);
};
</script>

<style scoped lang="scss">
/* Match HeaderDoneeComponent; parent .roleChrome-topStack is sticky (not this row). */
.header {
  background-image: none !important;
  background-color: transparent !important;
  position: relative;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.3rem var(--dh-header-pad-x, 1rem) 1rem;
  border-bottom: 0.05rem solid rgba(255, 255, 255, 0.202);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 255, 255, 0.1);
  z-index: 1;
}

.settingsHeader-button {
  margin: 0 0.4rem;
  width: 2.8rem;
  height: 2.8rem;
  border-radius: 2rem;
  margin-right: 4.1rem;
  background: linear-gradient(
    90deg,
    rgba(44, 44, 44, 0.832) 10%,
    rgba(67, 66, 66, 0.986) 100%
  );
}

.iconContainer {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-shrink: 0;
  cursor: pointer;
}

.logoIcon {
  height: 1.6rem;
  width: 1.6rem;
  object-fit: contain;
}

.header-roleIcon {
  height: 1rem;
  width: auto;
  object-fit: contain;
}

.navbarIcon {
  height: 1.6rem;
  width: auto;
  object-fit: contain;
}

.searchIcon {
  color: rgba(255, 255, 255, 0.82);
  cursor: pointer;
}

.buttonIcon {
  width: 1rem;
  height: 1rem;
}

.displayKarma {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(47, 47, 47, 0.6);
  border: 0.1rem solid #5a0e29b8;
  width: auto;
  height: 3rem;
  padding: 0.3rem;
  border-radius: 0.6rem;

  .textWrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.6rem;

    .navbarKarmaIcon {
      height: 1.3rem;
    }

    .karmaValue {
      color: rgba(255, 255, 255, 0.64);
      font-size: 1.2rem;
      font-family: poppinsBold;
      margin-right: 0.5rem;
    }
  }

  .navbarButton {
    background: rgba(189, 0, 67, 0.1);
    padding: 0.5rem;
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 0.4rem;
    padding-left: 0.5rem;
  }
}
</style>
