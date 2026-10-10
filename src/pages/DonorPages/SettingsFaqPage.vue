<template>
  <div class="settingsFaq-page">
    <div class="settingsFaq-header">
      <span class="settingsFaq-title">{{ t("faq") }}</span>
      <span class="settingsFaq-description">
        {{ t("settingsPages.faq.description") }}
      </span>
    </div>
    <div class="settingsFaq-accordion">
      <q-list dark class="rounded-borders">
        <template v-for="(card, index) in cardList" :key="index">
          <q-expansion-item
            class="settingsFaq-card"
            :label="card.title"
            switch-toggle-side
            group="question"
            expand-icon="img:/icons/redPlus-icon.svg"
          >
            <q-card class="settings-cardDiv">
              <q-card-section class="settingsFaq-cardBody">
                <span class="settingsFaq-cardText">{{ card.text }}</span>
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </template>
      </q-list>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const SUPPORT_EMAIL = "matej.kostun@gmail.com";

const cardList = computed(() =>
  [1, 2, 3, 4, 5, 6, 7].map((n) => ({
    title: t(`settingsPages.faq.q${n}.title`),
    text: t(`settingsPages.faq.q${n}.text`, { email: SUPPORT_EMAIL })
  }))
);
</script>
