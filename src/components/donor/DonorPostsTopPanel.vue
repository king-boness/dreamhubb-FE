<template>
  <div class="donorFeed-topControls">
    <div class="donorFeed-topControls-filters">
      <div class="donorPosts-filtersWrapper">
        <button
          class="donor-filters_button"
          type="button"
          @click="handleOpenFilters"
        >
          <img
            :src="filtersIcon"
            alt=""
            class="donor-filters_icon"
          />
          <span>{{ t("filters") }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter, useRoute } from "vue-router";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

/**
 * Sort tabs (by Help / by Pay / by Top) were removed for 1.0:
 * BE `GET /posts` always orders by tokens DESC then created_at DESC and
 * ignores any `sort` query param. Clickable fake modes must not ship.
 */
const filtersIcon = computed(() => {
  const isOnFiltersPage = route.name === "donor-filters";
  return isOnFiltersPage ? "/header_icons/filters_s.svg" : "/header_icons/filters_ns.svg";
});

const handleOpenFilters = () => {
  router.push({ name: "donor-filters" });
};
</script>

<style lang="scss" scoped>
.donorFeed-topControls {
  position: relative;
  z-index: 10;
  background: transparent;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  margin: 0;
  padding: 0;
}

@media (min-width: 768px) {
  .donorFeed-topControls {
    max-width: 50rem;
    margin-left: auto;
    margin-right: auto;
    width: 100%;
    box-sizing: border-box;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}

@media (min-width: 1200px) {
  .donorFeed-topControls {
    padding-left: 2rem;
    padding-right: 2rem;
  }
}

.donorPosts-filtersWrapper {
  display: flex;
  justify-content: center;
  margin: 14px 0 18px;
}

.donor-filters_button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.08);
  border: none;
  border-radius: 999px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  font-weight: 600;
  padding: 10px 32px;
  width: 85%;
  max-width: 300px;
  cursor: pointer;
  transition: background 0.2s ease;
  text-transform: lowercase;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
  }
}

.donor-filters_icon {
  width: 14px;
  height: 14px;
  display: block;
  flex-shrink: 0;
  filter: brightness(0) invert(1);
  opacity: 0.8;
}
</style>
