<template>
  <div class="legal-page">
    <div class="legal-page__inner">
      <button class="legal-page__back" type="button" aria-label="Back" @click="goBack">
        <q-icon name="chevron_left" />
      </button>
      <main class="legal-page__card">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLegalPageBack } from "src/composables/useLegalPageBack";

const { goBack } = useLegalPageBack();
</script>

<style scoped lang="scss">
.legal-page {
  min-height: 100dvh;
  background: #0b0b10;
  color: #f2f2f5;
  padding-top: calc(env(safe-area-inset-top, 0px) + 12px);
  padding-right: 16px;
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 40px);
  padding-left: 16px;
  box-sizing: border-box;
}

.legal-page__inner {
  width: 100%;
  max-width: 880px;
  margin: 0 auto;
}

.legal-page__back {
  width: 40px;
  height: 40px;
  margin: 0 0 10px;
  padding: 0;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: rgba(255, 255, 255, 0.6);
  }

  .q-icon {
    font-size: 24px;
    color: #ffffff;
  }
}

.legal-page__card {
  width: 100%;
  background: #11111a;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 24px 18px;
  box-sizing: border-box;
}

.legal-page__card :deep(h1),
.legal-page__card :deep(h2) {
  margin: 0 0 10px;
  font-family: poppinsSemiBold, sans-serif;
}

.legal-page__card :deep(h1) {
  font-size: 2rem;
}

.legal-page__card :deep(h2) {
  font-size: 1.2rem;
  margin-top: 22px;
}

.legal-page__card :deep(p),
.legal-page__card :deep(li) {
  line-height: 1.65;
}

.legal-page__card :deep(a) {
  color: #ff1f74;
}

.legal-page__card :deep(section[id]) {
  scroll-margin-top: calc(env(safe-area-inset-top, 0px) + 72px);
}

.legal-page__card :deep(.legal-page__updated) {
  margin-top: -4px;
  color: rgba(255, 255, 255, 0.65);
}

.body--light .legal-page {
  background: #f2f4f8;
  color: #111218;
}

.body--light .legal-page__back {
  border-color: rgba(0, 0, 0, 0.2);

  .q-icon {
    color: #111218;
  }
}

.body--light .legal-page__card {
  background: #ffffff;
  border-color: rgba(0, 0, 0, 0.08);
}

.body--light .legal-page__card :deep(.legal-page__updated) {
  color: rgba(0, 0, 0, 0.55);
}

.body--light .legal-page__card :deep(a) {
  color: #bd0043;
}
</style>
