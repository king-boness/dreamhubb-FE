<template>
  <div class="donorFeed-topControls">
    <div class="donorFeed-topControls-tabs">
      <div class="donor-tabs">
        <div class="donor-tabs_indicator" :style="indicatorStyle"></div>
        <button
          v-for="(tab, index) in tabs"
          :key="tab.value"
          :ref="(el) => { if (el) tabRefs[index] = el as HTMLElement }"
          class="donor-tabs_button"
          :class="{ 'donor-tabs_button--active': activeTab === tab.value }"
          type="button"
          @click="onSelectTab(tab.value)"
        >
          <img
            :src="getTabIcon(tab.value)"
            :alt="tab.label"
            class="donor-tabs_icon"
          />
          <span class="donor-tabs_label">{{ tab.label }}</span>
        </button>
      </div>
    </div>

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
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter, useRoute } from "vue-router";
import { usePostsStore } from "src/stores/posts";
import { useDonorPostsUiStore, type DonorPostsActiveTab } from "src/stores/donorPostsUi";

type DonorTab = {
  value: DonorPostsActiveTab;
  label: string;
  icon: string;
};

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const postsStore = usePostsStore();
const donorPostsUiStore = useDonorPostsUiStore();

const activeTab = computed(() => donorPostsUiStore.activeTab);

// Tab refs for indicator positioning
const tabRefs = ref<(HTMLElement | null)[]>([]);

const getTabIcon = (tabValue: DonorPostsActiveTab) => {
  const isActive = donorPostsUiStore.activeTab === tabValue;
  const iconMap: Record<DonorPostsActiveTab, { selected: string; nonSelected: string }> = {
    help: {
      selected: "/header_icons/hearth_s.svg",
      nonSelected: "/header_icons/hearth_ns.svg"
    },
    pay: {
      selected: "/header_icons/star_s.svg",
      nonSelected: "/header_icons/star_ns.svg"
    },
    top: {
      selected: "/header_icons/top_s.svg",
      nonSelected: "/header_icons/top_ns.svg"
    }
  };
  const icons = iconMap[tabValue];
  return isActive ? icons.selected : icons.nonSelected;
};

const tabs = computed<DonorTab[]>(() => [
  { value: "help", label: t("byHelp"), icon: getTabIcon("help") },
  { value: "pay", label: t("byPay"), icon: getTabIcon("pay") },
  { value: "top", label: t("byTop"), icon: getTabIcon("top") }
]);

const indicatorStyle = computed(() => {
  const activeIndex = tabs.value.findIndex((tab) => tab.value === donorPostsUiStore.activeTab);
  if (activeIndex === -1 || !tabRefs.value[activeIndex]) {
    return { width: "0", left: "0", opacity: "0" };
  }

  const activeButton = tabRefs.value[activeIndex];
  if (!activeButton) {
    return { width: "0", left: "0", opacity: "0" };
  }

  const tabsContainer = activeButton.parentElement;
  if (!tabsContainer) {
    return { width: "0", left: "0", opacity: "0" };
  }

  const containerRect = tabsContainer.getBoundingClientRect();
  const buttonRect = activeButton.getBoundingClientRect();
  const left = buttonRect.left - containerRect.left;
  const width = buttonRect.width;

  return {
    left: `${left}px`,
    width: `${width}px`,
    opacity: "1"
  };
});

const onSelectTab = (value: DonorPostsActiveTab) => {
  if (donorPostsUiStore.activeTab === value) return;
  donorPostsUiStore.setActiveTab(value);
  postsStore.fetchPosts({ sort: value });
};

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

.donor-tabs {
  display: flex;
  gap: 12px;
  margin: 8px 0 10px;
  border-bottom: 1px solid rgba(255, 255,255, 0.08);
  position: relative;
}

.donor-tabs_indicator {
  position: absolute;
  bottom: -1px;
  height: 2px;
  background: #ff2c8b;
  transition: left 0.3s ease, width 0.3s ease, opacity 0.3s ease;
  opacity: 0;
}

.donor-tabs_button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 12px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &.donor-tabs_button--active {
    color: #ff2c8b;

    .donor-tabs_icon {
      transform: scale(1.1);
    }
  }

  &:hover:not(.donor-tabs_button--active) {
    color: rgba(255, 255, 255, 0.8);

    .donor-tabs_icon {
      transform: scale(1.1);
    }
  }

  &:active {
    .donor-tabs_icon {
      transform: scale(0.95);
    }
  }
}

.donor-tabs_icon {
  width: 16px;
  height: 16px;
  display: block;
  transition: transform 0.2s ease;
}

.donor-tabs_label {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: lowercase;
}

.donorPosts-filtersWrapper {
  display: flex;
  justify-content: center;
  margin: 18px 0;
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
