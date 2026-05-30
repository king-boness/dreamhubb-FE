<template>
  <div class="report-page">
    <div class="report-header">
      <span class="report-title">Report a post</span>
      <span class="report-description">
        Help us keep dreamhubb safe. Select a reason and describe the issue. Our team will review your report.
      </span>
    </div>

    <div class="InnapprContent-report report-container" @click="handleRadioClick('innaprContent')">
      <q-radio
        v-model="shape"
        val="innaprContent"
        keep-color
        dark
        size="lg"
        color="primary"
        class="radioButton-report"
        @click="category = false; subCategory = false"
      />
      <span class="reportName">Inappropriate Content</span>
    </div>
    <div class="Hate-report report-container" @click="handleRadioClick('hate')">
      <q-radio
        v-model="shape"
        val="hate"
        keep-color
        dark
        size="lg"
        color="primary"
        class="radioButton-report"
        @click="category = false; subCategory = false"
      />
      <span class="reportName">Hate speech or Racism</span>
    </div>
    <div class="WrongCategory-report report-container" @click="handleRadioClick('wrongCategory')">
      <q-radio
        v-model="shape"
        val="wrongCategory"
        keep-color
        dark
        size="lg"
        color="primary"
        class="radioButton-report"
        @click="category = true; subCategory = false"
      />
      <span class="reportName">Wrong Category</span>
    </div>
    <div class="WrongSubCategory-report report-container" @click="handleRadioClick('wrongSubCategory')">
      <q-radio
        v-model="shape"
        val="wrongSubCategory"
        keep-color
        dark
        size="lg"
        color="primary"
        class="radioButton-report"
        @click="category = false; subCategory = true"
      />
      <span class="reportName">Wrong Subcategory</span>
    </div>
    <div class="reportPage-InputsContainer">
      <q-input
        borderless
        dark
        hide-bottom-space
        bottom-slots
        v-model="helpMessage"
        label="Tell us more about the problem..."
        class="registerDatas registerSecrete reportInput"
        type="textarea"
      />
    </div>
    <div v-if="category">
      <q-select
        borderless
        dark
        class="registerDatas CategorySelect"
        v-model="CategorySelect"
        :options="['Dream', 'Idea', 'Problem']"
        label="Select the Correct Category"
        behavior="menu"
      />
    </div>
    <div v-if="subCategory">
      <q-select
        borderless
        dark
        class="registerDatas subCategorySelect"
        v-model="subCategorySelect"
        :options="subCategoryOptions"
        label="Select the Correct Subcategory"
        behavior="menu"
      />
    </div>
    <div class="reportPage-buttonContainer">
      <q-btn
        class="report-button"
        :disabled="!canSendReport || submitting"
        :loading="submitting"
        @click="handleSendReport"
      >
        <span>Send Report</span>
      </q-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { api } from "boot/axios";
import { notifySuccess, notifyError } from "src/utils/notify";
import { mapAxiosErrorToDhError } from "src/utils/httpError";
import { goBackOrFallback } from "src/utils/navigation";

const route = useRoute();
const router = useRouter();

const shape = ref("");
const helpMessage = ref("");
const subCategorySelect = ref("");
const CategorySelect = ref("");
const category = ref(false);
const subCategory = ref(false);
const submitting = ref(false);

const subCategoryOptions = [
  "Traveling",
  "Health",
  "Possessions",
  "Relationships",
  "Learning",
  "Events",
  "Profession",
  "Other"
];

const handleRadioClick = (value: string) => {
  shape.value = value;
  if (value === "wrongCategory") {
    category.value = true;
    subCategory.value = false;
  } else if (value === "wrongSubCategory") {
    category.value = false;
    subCategory.value = true;
  } else {
    category.value = false;
    subCategory.value = false;
  }
};

const postId = computed(() => {
  const fromParams = route.params.id ? String(route.params.id) : null;
  const fromQuery = route.query.postId ? String(route.query.postId) : null;
  return fromParams || fromQuery;
});

const canSendReport = computed(() => {
  return !!shape.value || !!helpMessage.value.trim();
});

const handleSendReport = async () => {
  if (!postId.value) {
    notifyError(
      {
        kind: "validation",
        messageKey: "common.errors.validation",
        fallbackMessage: "Post ID is missing. Open report from a post detail screen.",
        retryable: false
      },
      { position: "top" }
    );
    return;
  }

  submitting.value = true;
  try {
    // TODO(backend): confirm route + payload with Laravel (expected: POST /api/posts/:id/report).
    await api.post(`/posts/${postId.value}/report`, {
      reason: shape.value || "other",
      message: helpMessage.value.trim(),
      suggested_category: CategorySelect.value || null,
      suggested_subcategory: subCategorySelect.value || null
    });

    notifySuccess("common.success.reportSubmitted", "Report submitted successfully", {
      position: "top",
      timeout: 3000
    });

    const fallback = { name: "donor-post-detail", params: { id: postId.value } };
    goBackOrFallback(router, fallback);
  } catch (error) {
    notifyError(mapAxiosErrorToDhError(error), { position: "top" });
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped lang="scss">
.report-page {
  padding: 0 1.2rem;
  .radioButton-report {
    margin-left: -0.7rem;
  }
  .report-header {
    display: flex;
    flex-direction: column;
    padding: 0.5rem 0rem;
    margin: 1rem 0;

    .report-title {
      color: white;
      margin-bottom: 0.5rem;
      font-family: poppinsSemiBold;
      font-size: 1.4rem;
    }
    .report-description {
      color: rgba(255, 255, 255, 0.534);
      font-size: 1rem;
      line-height: 1.45;
    }
  }
  .report-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    padding: 0.5rem 0;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: rgba(255, 255, 255, 0.05);
      border-radius: 0.5rem;
    }

    .reportName {
      color: white;
      font-family: poppins;
      font-size: 1rem;
      flex: 1;
      user-select: none;
    }
  }
  .reportPage-InputsContainer {
    .reportInput {
      width: 100%;
      height: 10rem;
      padding-bottom: 1rem;
      border: 0.08rem solid rgba(255, 255, 255, 0.185);
      margin-bottom: 0.7rem;
    }
  }
  .reportPage-buttonContainer {
    .report-button {
      width: 100%;
      background-color: rgba(141, 31, 70, 0.193) !important;
      color: rgba(218, 3, 82, 0.77) !important;
      font-family: montseraatSemiBold;
      font-size: 1.2rem !important;
      border-radius: 0.5rem !important;
      align-items: center;
      margin-top: 1rem;
      margin-bottom: calc(8rem + env(safe-area-inset-bottom, 0px));
    }
  }
}
.subCategorySelect,
.CategorySelect {
  width: 100% !important;
  border: 0.08rem solid rgba(255, 255, 255, 0.185);
}
</style>
