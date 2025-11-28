<template>
  <q-dialog
    v-model="isOpen"
    maximized
    class="info-modal"
    @hide="handleClose"
  >
    <q-card class="info-modal-card">
      <!-- Back button -->
      <button class="info-modal-backBtn" @click="handleClose">
        <q-icon name="chevron_left" />
      </button>

      <div class="info-modal-content">
        <!-- Title -->
        <h2 class="info-modal-title">{{ title }}</h2>

        <!-- Logo illustration -->
        <div class="info-modal-logo">
          <img
            :src="iconPath"
            :alt="stylizedText"
            class="info-modal-logo-img"
          />
        </div>

        <!-- Description -->
        <p class="info-modal-description">{{ description }}</p>
      </div>

      <!-- CTA Button -->
      <button class="info-modal-cta" @click="handleCta">
        {{ ctaLabel }}
      </button>
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
  :deep(.q-dialog__inner) {
    padding: 0;
  }
}

.info-modal-card {
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at top, #0b001c 0%, #05000e 40%, #010006 100%);
  display: flex;
  flex-direction: column;
  padding: 24px 20px 40px;
  position: relative;
}

.info-modal-backBtn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 24px;
  align-self: flex-start;

  &:hover {
    border-color: rgba(255, 255, 255, 0.6);
  }

  .q-icon {
    font-size: 24px;
    color: #ffffff;
  }
}

.info-modal-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 0;
  min-height: 0;
  overflow-y: auto;
}

.info-modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 32px 0;
  text-align: center;
  flex-shrink: 0;
}

.info-modal-logo {
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 0 32px 0;
  flex-shrink: 0;
}

.info-modal-logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 0 20px rgba(189, 0, 67, 0.5));
}

.info-modal-description {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  line-height: 1.6;
  max-width: 320px;
  margin: 0;
  flex-shrink: 0;
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
  margin-top: auto;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(189, 0, 67, 0.4);
  }
}
</style>
