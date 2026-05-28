<template>
  <q-dialog
    v-model="isOpen"
    maximized
    class="info-modal"
    @hide="handleClose"
  >
    <q-card class="info-modal-card">
      <header class="info-modal-header">
        <button class="info-modal-backBtn" type="button" @click="handleClose">
          <q-icon name="chevron_left" />
        </button>
      </header>

      <section class="info-modal-content">
        <div class="info-modal-stack">
          <div class="info-modal-logo">
            <img
              :src="iconPath"
              :alt="stylizedText"
              class="info-modal-logo-img"
            />
          </div>
          <p class="info-modal-description">{{ description }}</p>
        </div>
      </section>

      <footer class="info-modal-actions">
        <button class="info-modal-cta" type="button" @click="handleCta">
          {{ ctaLabel }}
        </button>
      </footer>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  modelValue: boolean;
  title: string;
  stylizedText: string;
  description: string;
  ctaLabel: string;
  icon?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  cta: [];
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value)
});

const displayTitle = computed(() => (props.title || "").toLowerCase());

// Map stylizedText to SVG icon path
const iconPath = computed(() => {
  const basePath = "/icons/CategoryIcons/";
  const text = props.stylizedText.toLowerCase();

  // Map text to icon file names
  const iconMap: Record<string, string> = {
    donors: "donors",
    donees: "donees",
    dream: "dream",
    problem: "problem",
    idea: "idea",
    travelling: "traveling",
    traveling: "traveling",
    health: "health",
    possesions: "possesions",
    possessions: "possesions",
    relationships: "relationships",
    learning: "learning",
    events: "events",
    profession: "proffesion",
    other: "other"
  };

  const iconName = iconMap[text] || text;
  return `${basePath}${iconName}.svg`;
});

const handleClose = () => {
  emit("update:modelValue", false);
};

const handleCta = () => {
  emit("cta");
  handleClose();
};
</script>

<style lang="scss" scoped>
.info-modal {
  :deep(.q-dialog__inner),
  :deep(.q-dialog__inner--maximized) {
    padding: 0 !important;
    min-width: 100%;
    min-height: 100%;
    max-width: 100%;
    display: flex !important;
    align-items: stretch !important;
    justify-content: flex-start !important;
  }

  :deep(.q-dialog__inner > div) {
    width: 100%;
    height: 100%;
    max-height: 100%;
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }
  :deep(.q-dialog__backdrop) {
    background: #0a0a0a;
  }
}

/*
 * Flex column (not grid 1fr + center): stack sits under back button, CTA pinned to bottom.
 * Previous grid minmax(0,1fr) + align-items:center left a huge empty band above the logo.
 */
.info-modal-card {
  --info-pad-x: 20px;
  --info-gap-logo-text: 16px;
  --info-logo-size: 140px;

  width: 100%;
  min-width: 100%;
  min-height: 100dvh;
  height: 100%;
  max-width: none;
  background: #0a0a0a;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding-left: var(--info-pad-x);
  padding-right: var(--info-pad-x);
  padding-top: env(safe-area-inset-top, 0px);
  padding-bottom: 0;
  box-sizing: border-box;
  box-shadow: none !important;
}

.info-modal-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding: 8px 0 0;
}

.info-modal-backBtn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.28);
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  text-transform: none;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.28);
  -webkit-tap-highlight-color: transparent;

  &:hover {
    border-color: rgba(255, 255, 255, 0.5);
    background: rgba(255, 255, 255, 0.16);
  }

  .q-icon {
    font-size: 26px;
    color: #ffffff;
  }
}

.info-modal-content {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 0;
  padding: 0;
}

.info-modal-actions {
  flex-shrink: 0;
  width: 100%;
  margin-top: 0;
  padding-top: 12px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px));
}

.info-modal-stack {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: var(--info-gap-logo-text);
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
  transform: translateY(-21px);
}

.info-modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 32px 0;
  text-align: center;
  flex-shrink: 0;
  text-transform: none;
}

.info-modal-logo {
  width: var(--info-logo-size);
  height: var(--info-logo-size);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  flex-shrink: 0;
}

.info-modal-logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 0 20px rgba(189, 0, 67, 0.5));
}

.info-modal-description {
  font-size: 0.98rem;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  line-height: 1.55;
  max-width: 300px;
  margin: 0;
  flex-shrink: 0;
  text-transform: none;
}

.info-modal-cta {
  width: 100%;
  height: 56px;
  border-radius: 9999px;
  background: #BD0043;
  border: none;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 8px 24px rgba(189, 0, 67, 0.3);
  margin: 0;
  flex-shrink: 0;
  text-transform: none;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(189, 0, 67, 0.4);
  }
}
</style>

<style lang="scss">
/* Light mode: full-screen info sheet matches app canvas, not forced dark overlay */
.body--light .info-modal :deep(.q-dialog__backdrop) {
  background: rgba(0, 0, 0, 0.42) !important;
}

.body--light .info-modal-card {
  background: #f5f5f5 !important;
}

.body--light .info-modal-backBtn {
  border-color: rgba(0, 0, 0, 0.14) !important;
  background: #ffffff !important;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1) !important;

  .q-icon {
    color: #0a0a0a !important;
  }
}

.body--light .info-modal-description {
  color: rgba(0, 0, 0, 0.72) !important;
}

.body--light .info-modal-header {
  padding-top: 8px;
}

.body--light .info-modal-cta {
  color: #ffffff !important;
}

/* Teleported QDialog — iOS q-ios-padding adds extra top inset on dialog host (double gap with card safe-area) */
body.q-ios-padding .q-dialog.info-modal,
body.q-ios-padding .q-dialog.info-modal.fullscreen {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}

.q-dialog.info-modal .q-dialog__inner,
.q-dialog.info-modal .q-dialog__inner--maximized {
  padding: 0 !important;
  margin: 0 !important;
  align-items: stretch !important;
  justify-content: flex-start !important;
}

.q-dialog.info-modal .q-dialog__inner > div {
  width: 100%;
  height: 100%;
  max-height: 100%;
  margin: 0 !important;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.q-dialog.info-modal .info-modal-card {
  flex: 1 1 auto;
  align-self: stretch;
}
</style>
