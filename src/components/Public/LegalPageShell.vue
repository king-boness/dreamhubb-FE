<template>
  <div class="legal-page">
    <div class="legal-page__inner">
      <button class="legal-page__back" type="button" @click="goBack">
        <span class="legal-page__backIcon" aria-hidden="true">←</span>
        <span>Back</span>
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
  padding-top: calc(env(safe-area-inset-top, 0px) + 24px);
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
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin: 0 0 14px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #ff4db8;
  font-family: poppinsSemiBold, sans-serif;
  font-size: 0.95rem;
  cursor: pointer;
}

.legal-page__backIcon {
  font-size: 1.1rem;
  line-height: 1;
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

.legal-page__card :deep(.legal-page__updated) {
  margin-top: -4px;
  color: rgba(255, 255, 255, 0.65);
}

.body--light .legal-page {
  background: #f2f4f8;
  color: #111218;
}

.body--light .legal-page__back {
  color: #bd0043;
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
