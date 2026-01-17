<template>
  <q-page class="postDetail post-edit-page">
    <!-- Loading state -->
    <div v-if="loading" class="postDetail-loading">
      <AppSplash />
        </div>

    <!-- Post content -->
    <template v-else-if="postDetail">
      <!-- HERO + SLIDER (rovnaký komponent ako na detaile) -->
      <PostHeader
        v-if="postDetail.images && postDetail.images.length > 0"
        :images="postDetail.images"
        :auto-slide="true"
        :show-progress="true"
        :show-arrows="true"
        :show-dots="true"
        :image-wrapper-style="heroStyle"
        :title="displayTitle"
        :date="displayDate"
        :location="displayLocation"
        :views="displayViews"
        :category-name="displayCategoryName"
        :category-icon="displayCategoryIcon"
        :is-liked="isLiked"
        :show-share-and-like="false"
        @close="goBack"
        @share="onShare"
        @like="onLike"
        @image-click="onHeroImageClick"
      />
      <!-- Placeholder for empty images - same layout as PostHeader -->
      <div
        v-else
        class="post-edit-hero-placeholder"
      >
        <!-- Close button (same as PostHeader) -->
        <div class="post-edit-hero-placeholder-topIcons">
          <q-btn
            round
            flat
            dense
            class="post-header-iconBtn post-header-iconBtn--left"
            icon="img:/assets/icons/post/icon-close.svg"
            @click.stop="goBack"
          />
      </div>
        <!-- Subtle "Add image" CTA in center (non-intrusive) -->
    <div
          class="post-edit-hero-placeholder-content"
          @click="openPhotosEditor"
    >
      <img
            src="/icons/addImg-icon.svg"
            alt="Add image"
            class="post-edit-hero-placeholder-icon"
          />
          <span class="post-edit-hero-placeholder-text">Add image</span>
        </div>
        <!-- Category badge and title overlay (EXACT same as PostHeader) -->
        <div class="post-edit-hero-placeholder-infoOverlay">
          <div class="post-header-chipRow">
            <div class="post-header-categoryPill">
              <img
                v-if="displayCategoryIcon"
                :src="displayCategoryIcon"
                class="post-header-categoryIcon"
        alt=""
              />
              <span class="post-header-categoryText">
                {{ displayCategoryName }}
              </span>
      </div>
    </div>
          <h1 class="post-header-title">{{ displayTitle }}</h1>
          <div class="post-header-metaRow">
            <div class="post-header-metaItem">
              <q-icon
                class="post-header-metaIcon"
                :name="'img:/assets/icons/ui/icon-date.svg'"
              />
              <span>{{ displayDate }}</span>
          </div>
            <div class="post-header-metaItem">
              <q-icon
                class="post-header-metaIcon"
                :name="'img:/assets/icons/ui/icon-location.svg'"
              />
              <span>{{ displayLocation }}</span>
            </div>
            <div class="post-header-metaItem">
              <q-icon
                class="post-header-metaIcon"
                :name="'img:/assets/icons/ui/icon-views.svg'"
              />
              <span>{{ displayViews }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ABOUT YOUR PROBLEM ROLL-UP SECTION -->
      <section class="edit-rollup q-mt-md">
        <div class="edit-rollup_card" :class="{ 'edit-rollup_card--open': isEditRollupOpen }">
          <!-- HLAVIČKA / NEODKLIKNUTÝ STAV -->
          <button type="button" class="edit-rollup_header" @click="isEditRollupOpen = !isEditRollupOpen">
            <span class="edit-rollup_header-eyebrow">I WANT TO EDIT...</span>
            <div class="edit-rollup_header-right">
              <!-- vtáčik vpravo -->
              <img src="/icons/birdy.png" alt="" class="edit-rollup_header-bird" />
              <!-- chevron icon -->
              <q-icon
                name="keyboard_arrow_down"
                :class="['edit-rollup_header-chevron', { 'is-open': isEditRollupOpen }]"
                size="20px"
              />
            </div>
          </button>
          <!-- OBSAH / ODKLIKNUTÝ STAV -->
          <q-slide-transition>
            <div v-show="isEditRollupOpen" class="edit-rollup_body">
              <p class="edit-rollup_eyebrow">ABOUT YOUR {{ postTypeLabel.toUpperCase() }}</p>
              <p class="edit-rollup_title">
                Let everyone know about your {{ postTypeLabelLower }}
              </p>
              <p class="edit-rollup_text">
                Any person that can give or provide anything or any service that someone else might be.
              </p>
              <ul class="edit-rollup_list">
                <li
                  v-for="item in editActions"
                  :key="item.key"
                  class="edit-rollup_list-item"
                  @click="item.onClick()"
                >
                  <span class="edit-rollup_list-label">{{ item.label }}</span>
                  <q-icon name="chevron_right" size="18px" color="white" />
                </li>
              </ul>
        </div>
          </q-slide-transition>
      </div>
      </section>
      <!-- Sekcia "Top up the post" -->
      <section class="edit-topup-section q-px-md q-mt-md">
        <div class="eyebrow-label">{{ isEditMode ? t("topUpThePost") : t("topUpTheDream") }}</div>

        <!-- Topup card with both rows -->
        <div class="topup-card q-mt-md">
          <!-- Available from -->
          <div class="topup-row">
            <div class="topup-row-left">
              <img
                src="/other_icons/gift.svg"
                alt="Gift"
                class="topup-row-icon"
              />
              <div class="topup-row-labels">
                <div class="topup-row-overline">AVAILABLE FROM</div>
                <div class="topup-row-title">Donations</div>
          </div>
    </div>
            <div class="topup-row-value with-icon">
              <img src="/other_icons/star.svg" alt="Tokens" class="topup-value-icon" />
              <span>{{ availableFromDonations }}</span>
            </div>
          </div>
          <!-- Your full balance -->
          <q-separator dark inset class="q-my-sm" />
          <div class="topup-row" style="margin-top: 0;">
            <div class="topup-row-left">
              <img
                src="/other_icons/star.svg"
                alt="Tokens"
                class="topup-row-icon"
              />
              <div class="topup-row-labels">
                <div class="topup-row-overline">YOUR FULL BALANCE</div>
                <div class="topup-row-title">Tokens</div>
          </div>
        </div>
            <div class="topup-row-value with-icon">
              <img src="/other_icons/star.svg" alt="Tokens" class="topup-value-icon" />
              <span>{{ fullBalance }}</span>
      </div>
    </div>
      </div>

        <!-- Tokens to top up -->
        <div class="tokens-section q-mt-lg">
          <div class="tokens-header">
            <span class="tokens-label">TOKENS TO TOP UP</span>
            <q-icon name="help_outline" size="16px" />
    </div>
          <!-- manuálny input -->
          <q-input
            v-model.number="form.tokensToTopUp"
            type="number"
            dense
            outlined
            rounded
            class="tokens-input q-mt-sm"
            :min="0"
            :max="maxTokens"
            @update:model-value="onTokensInputChange"
          >
            <template #append>
              <img src="/other_icons/star.svg" alt="Tokens" />
            </template>
          </q-input>
          <!-- slider naviazaný na rovnakú hodnotu -->
          <q-slider
            v-model.number="form.tokensToTopUp"
            :min="0"
            :max="maxTokens"
            :step="1"
            :disable="maxTokens <= 0"
            color="primary"
            track-size="10px"
            thumb-size="22px"
            class="tokens-slider q-mt-md"
            @update:model-value="onTokensSliderChange"
          />
          <div class="tokens-funds q-mt-xs q-mb-lg">
            Funds: {{ remainingTokens }} tokens
      </div>
    </div>
      </section>

      <!-- CTA "Save Changes" - sticky na spodku -->
      <BottomCtaButton
        label="SAVE CHANGES"
        :loading="isSaving"
        loading-label="SAVING..."
        :disabled="!hasChanges"
        @click="onSaveChanges"
      />
    </template>

    <!-- DIALOGS -->
    <!-- Headline Dialog -->
    <q-dialog v-model="dialogs.headline">
      <q-card class="edit-category-dialog">
        <q-card-section class="flex justify-center items-center q-pa-md">
          <div class="edit-dialog-title">Edit headline</div>
        </q-card-section>
        <q-card-section class="q-pa-md">
          <q-input
            ref="headlineInputRef"
            v-model="editForm.headline"
            label="Headline"
            outlined
            dark
            autofocus
            :maxlength="80"
            class="headline-input"
            @vue:mounted="focusHeadlineInput"
          />
        </q-card-section>
        <q-card-actions align="center" class="q-pa-md category-dialog-actions">
          <q-btn
            class="primary-cta category-cancel-btn"
            color="grey-8"
            unelevated
            no-caps
            padding="14px 24px"
            label="CANCEL"
            @click="dialogs.headline = false"
          />
          <q-btn
            class="primary-cta category-save-btn"
            color="primary"
            unelevated
            no-caps
            padding="14px 24px"
            label="SAVE"
            @click="applyHeadlineChange"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Category Dialog -->
    <q-dialog v-model="dialogs.category">
      <q-card class="edit-category-dialog">
        <q-card-section class="flex justify-center items-center q-pa-md relative-position">
          <div class="edit-dialog-title">Edit category</div>
        </q-card-section>
        <q-card-section class="q-pa-md edit-category-picker-section">
          <div ref="categoryPickerContainer" class="category-picker-container">
            <div
              v-for="(option, index) in categoryOptions"
              :key="option.id"
              class="category-picker-item"
              :class="{ 'category-picker-item--selected': editForm.categoryId === option.id }"
              :style="getPickerItemStyle(index)"
              @click="handleCategoryItemClick(option.id)"
            >
              <img
                :src="getCategoryTypeIcon(option.name)"
                :alt="option.name"
                class="category-picker-icon"
              />
              <span class="category-picker-text">{{ option.name.toLowerCase() }}</span>
  </div>
          </div>
        </q-card-section>
        <q-card-actions align="center" class="q-pa-md category-dialog-actions">
          <q-btn
            class="primary-cta category-cancel-btn"
            color="grey-8"
            unelevated
            no-caps
            padding="14px 24px"
            label="CANCEL"
            @click="closeCategoryPicker"
          />
          <q-btn
            class="primary-cta category-save-btn"
            color="primary"
            unelevated
            no-caps
            padding="14px 24px"
            label="SAVE"
            @click="applyCategoryChange"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Subcategory Dialog -->
    <q-dialog v-model="dialogs.subcategory">
      <q-card class="edit-category-dialog">
        <q-card-section class="flex justify-center items-center q-pa-md relative-position">
          <div class="edit-dialog-title">Edit subcategory</div>
        </q-card-section>
        <q-card-section class="q-pa-md edit-category-picker-section">
          <div ref="subcategoryPickerContainer" class="category-picker-container">
            <div
              v-for="(option, index) in subcategoryOptions"
              :key="option.id"
              class="category-picker-item"
              :class="{ 'category-picker-item--selected': editForm.subcategoryId === option.id }"
              :style="getSubcategoryPickerItemStyle(index)"
              @click="handleSubcategoryItemClick(option.id)"
            >
              <img
                :src="getSubcategoryIcon(option.name)"
                :alt="option.name"
                class="category-picker-icon"
              />
              <span class="category-picker-text">{{ option.name.toLowerCase() }}</span>
          </div>
        </div>
        </q-card-section>
        <q-card-actions align="center" class="q-pa-md category-dialog-actions">
          <q-btn
            class="primary-cta category-cancel-btn"
            color="grey-8"
            unelevated
            no-caps
            padding="14px 24px"
            label="CANCEL"
            @click="dialogs.subcategory = false"
          />
          <q-btn
            class="primary-cta category-save-btn"
            color="primary"
            unelevated
            no-caps
            padding="14px 24px"
            label="SAVE"
            @click="applySubcategoryChange"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Deadline Dialog -->
    <q-dialog v-model="dialogs.deadline">
      <q-card class="edit-category-dialog">
        <q-card-section class="flex justify-center items-center q-pa-md">
          <div class="edit-dialog-title">Edit deadline</div>
        </q-card-section>
        <q-card-section>
          <q-date
            v-model="editForm.deadline"
            mask="YYYY-MM-DD"
            minimal
          />
        </q-card-section>
        <q-card-actions align="center" class="q-pa-md category-dialog-actions">
          <q-btn
            class="primary-cta category-cancel-btn"
            color="grey-8"
            unelevated
            no-caps
            padding="14px 24px"
            label="CANCEL"
            @click="dialogs.deadline = false"
          />
          <q-btn
            class="primary-cta category-save-btn"
            color="primary"
            unelevated
            no-caps
            padding="14px 24px"
            label="SAVE"
            @click="applyDeadlineChange"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Photos Dialog -->
    <q-dialog v-model="dialogs.photos" @hide="onPhotosDialogHide">
      <q-card class="edit-photos-dialog">
        <q-card-section class="flex justify-center items-center q-pa-md">
          <div class="edit-photos-title">Edit photos</div>
        </q-card-section>
        <q-card-section class="q-pa-md edit-photos-content">
          <div class="edit-photos-grid">
            <!-- Existing photos -->
            <div
              v-for="(img, index) in editForm.photos"
              :key="`photo-${index}-${typeof img === 'string' ? img : (img.url || img.secure_url || '')}`"
              class="edit-photo-wrapper"
            >
              <q-card class="edit-photo-card relative-position">
                <q-img
                  :src="typeof img === 'string' ? img : (img.url || img.secure_url || '')"
                  ratio="1"
                  class="edit-photo-image cursor-pointer"
                  fit="cover"
                  @click="openLightbox(index)"
                />
                <q-btn
                  icon="close"
                  round
                  dense
                  flat
                  class="edit-photo-remove-btn absolute-top-right"
                  @click.stop="removePhoto(index)"
                />
              </q-card>
      </div>
            <!-- Add new photo card -->
            <div class="edit-photo-wrapper">
              <q-card
                class="edit-photo-card edit-photo-add-card cursor-pointer"
                @click="triggerAddPhoto"
              >
                <img
                  src="/icons/addImg-icon.svg"
                  alt="Add photo"
                  class="edit-photo-add-icon"
                />
              </q-card>
    </div>
      </div>
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            multiple
            class="hidden"
            @change="onPhotosSelected"
          />
        </q-card-section>
        <q-card-actions align="center" class="q-pa-md category-dialog-actions">
          <q-btn
            class="primary-cta category-cancel-btn"
            color="grey-8"
            unelevated
            no-caps
            padding="14px 24px"
            label="CANCEL"
            @click="cancelPhotosEdit"
          />
          <q-btn
            class="primary-cta category-save-btn"
            color="primary"
            unelevated
            no-caps
            padding="14px 24px"
            label="SAVE"
            @click="applyPhotosChange"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Image Preview Modal -->
    <ImagePreviewModal
      v-model="isLightboxOpen"
      :images="lightboxImages"
      :initial-index="lightboxInitialIndex"
    />
  </q-page>
</template>
<style scoped lang="scss">
.post-edit-page {
  min-height: 100vh;
  padding-bottom: 140px; // Priestor pre sticky tlačidlo "SAVE CHANGES"
  // Použije sa pozadie z .postDetail classy (rovnaké ako detail stránka)
}

/* Hero placeholder for empty images */
.post-edit-hero-placeholder {
  width: 100%;
  min-height: 360px; // Match PostHeader min-height
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(22, 22, 22, 0.9) 0%, rgba(40, 40, 40, 0.8) 100%);
  position: relative;
  overflow: hidden;
  transition: background 0.3s ease;
  border-radius: 0 0 24px 24px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.75);
  margin-bottom: 0;

  // Gradient overlay (same as PostHeader)
  &::before {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 175px;
    border-radius: 0 0 24px 24px;
    background: linear-gradient(
      to bottom,
      rgba(1, 3, 16, 0) 0%,
      rgba(1, 3, 16, 0.9) 60%,
      rgba(1, 3, 16, 1) 100%
    );
    pointer-events: none;
    z-index: 1;
  }

  // Top icons container (for close button)
  .post-edit-hero-placeholder-topIcons {
    position: absolute;
    top: calc(3rem - 21px);
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 0 1rem;
    z-index: 15;
    pointer-events: none;

    > * {
      pointer-events: auto;
    }
  }

  .post-edit-hero-placeholder-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 2rem;
    cursor: pointer;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 3; // Below info overlay (10) but above gradient (1)
    opacity: 0.5; // Make it subtle, not intrusive
    transition: opacity 0.3s ease;

    &:hover {
      opacity: 0.8;
      .post-edit-hero-placeholder-icon {
        transform: scale(1.1);
      }
    }
  }

  // Info overlay (category badge, title, meta) - EXACT same as PostHeader
  .post-edit-hero-placeholder-infoOverlay {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 0 16px 20px; // Match PostHeader padding exactly (0 16px 20px)
    z-index: 10; // Match PostHeader z-index (10)
    pointer-events: none;
    display: flex;
    flex-direction: column;
    gap: 0.35rem; // Match PostHeader gap
    box-sizing: border-box;
    align-items: flex-start; // Match PostHeader alignment

    // Category chip row (badge) - EXACT same as PostHeader
    .post-header-chipRow {
      position: relative;
      margin-bottom: 0.75rem; // Spacing above title (same as PostHeader)
      padding: 0;
      z-index: 12;
      pointer-events: none;
      width: 100%;
    }

    .post-header-categoryPill {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem 0.75rem;
      background: rgba(0, 0, 0, 0.45);
      backdrop-filter: blur(14px);
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      pointer-events: auto;
    }

    .post-header-categoryIcon {
      width: 16px;
      height: 16px;
      object-fit: contain;
    }

    .post-header-categoryText {
      font-size: 0.75rem;
      font-weight: 600;
      color: #ffffff;
      /* text-transform removed - formatting is handled by formatSubcategoryLabel() in JavaScript */
    }

    // Ensure title has correct size (same as PostHeader)
    .post-header-title {
      margin: 0;
      margin-bottom: 8px;
      padding: 0;
      font-size: 1.15rem !important; // Match PostHeader exactly
      font-weight: 700 !important;
      color: #ffffff !important;
      line-height: 1.3 !important;
      text-align: left !important;
      width: 100%;
      box-sizing: border-box;
    }

    // Ensure meta row has correct styling
    .post-header-metaRow {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.75);
    }

    .post-header-metaItem {
      display: flex;
      align-items: center;
      gap: 4px;

      .post-header-metaIcon {
        font-size: 14px;
        width: 14px;
        height: 14px;
        opacity: 0.7;
      }

      span {
        line-height: 1.2;
      }
    }
  }

  // Import PostHeader styles for close button
  .post-header-iconBtn {
    width: 40px;
    height: 40px;
    border-radius: 999px;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.45) !important;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(14px);
    color: #fff;
    cursor: pointer;
    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.15s ease;

    &:hover {
      transform: translateY(-1px);
      background: rgba(0, 0, 0, 0.6) !important;
    }

    &:active {
      transform: scale(0.95);
      background: rgba(0, 0, 0, 0.75) !important;
    }
  }

  .post-edit-hero-placeholder-icon {
    width: 48px;
    height: 48px;
    opacity: 0.6;
    transition: transform 0.3s ease, opacity 0.3s ease;
  }

  .post-edit-hero-placeholder-text {
    font-size: 14px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.6);
    font-family: 'Poppins', sans-serif;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  &:hover .post-edit-hero-placeholder-content {
    opacity: 0.9;
    .post-edit-hero-placeholder-text {
      color: rgba(255, 255, 255, 0.9);
    }
  }
}

.post-edit-header-row {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.post-edit-category-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.post-edit-category-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.75rem;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(14px);
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.post-edit-category-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.post-edit-category-text {
  font-size: 0.75rem;
  font-weight: 600;
  color: #ffffff;
  text-transform: capitalize;
}

.post-edit-subcategory-text {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.7);
  text-transform: capitalize;
}

/* Edit rollup section */
.edit-rollup {
  padding: 16px 16px 0;
}

.edit-rollup_card {
  border-radius: 24px;
  padding: 12px 18px;
  background: radial-gradient(
    ellipse at top,
    rgba(83, 24, 92, 0.95) 0%,
    rgba(38, 17, 61, 0.98) 50%,
    rgba(20, 10, 30, 1) 100%
  );
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.45);
  color: #fff;
  transition: padding 160ms ease-out;

  &--open {
    padding-bottom: 20px;
  }
}

/* HLAVIČKA - stav pred kliknutím */
.edit-rollup_header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: none;
  background: transparent;
  padding: 4px 0 2px;
  cursor: pointer;
}

.edit-rollup_header-eyebrow {
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  opacity: 0.7;
  color: #fff;
}

.edit-rollup_header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.edit-rollup_header-bird {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.edit-rollup_header-chevron {
  color: #fff;
  opacity: 0.7;
  transition: transform 0.2s ease-out;

  &.is-open {
    transform: rotate(180deg);
  }
}

/* Telo roll-upu po rozkliknutí */
.edit-rollup_body {
  margin-top: 10px;
}

.edit-rollup_eyebrow {
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  opacity: 0.7;
  margin-bottom: 4px;
  color: #fff;
}

.edit-rollup_title {
  font-size: 18px;
  line-height: 1.3;
  font-weight: 700;
  margin-bottom: 6px;
  color: #fff;
}

.edit-rollup_text {
  font-size: 12px;
  line-height: 1.4;
  opacity: 0.9;
  margin-bottom: 12px;
  color: #fff;
}

.edit-rollup_list {
  list-style: none;
  padding: 0;
  margin: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.18);
}

.edit-rollup_list-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 0;
  cursor: pointer;
  color: #fff;

  & + & {
    border-top: 1px solid rgba(255, 255, 255, 0.12);
  }
}

.edit-rollup_list-label {
  text-transform: lowercase;
  font-size: 16px;
  font-weight: 700;
  text-align: center;
}

/* Old edit-about-section styles removed - replaced by edit-panel */

.post-edit-textarea {
  :deep(.q-field__control) {
    background: rgba(23, 23, 23, 0.72);
    border-radius: 0.625rem;
    color: white;
  }
  :deep(textarea) {
    color: white;
  }
}

/* Sekcie / karty */
.section-label {
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #9ca3af;
  opacity: 0.9;
  margin-bottom: 8px;
}

.section-label-sm {
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #9ca3af;
  opacity: 0.9;
}

.about-input {
  :deep(.q-field__control) {
    background: transparent;
    border-radius: 18px;
    padding: 10px 14px;
    color: white;
  }
  :deep(textarea) {
    color: white;
    font-size: 13px;
  }
}

/* Top up section */
.edit-topup-section {
  padding: 0 16px;
  margin-top: 24px; // 24px medzi "about" kartou a "Top up the post"
}

.eyebrow-label {
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0.7;
  margin-bottom: 8px;
  color: #9ca3af;
  // Rovnaký font-size a letter-spacing ako TOP UP THE DREAM v dizajne
}

.topup-card {
  background: #05000f;
  border-radius: 20px;
  padding: 0;
  margin-bottom: 18px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.45);
}

.topup-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  margin: 0;
}

.topup-row-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.topup-row-icon {
  width: 24px;
  height: 24px;
}

.topup-row-labels {
  display: flex;
  flex-direction: column;
}

.topup-row-overline {
  font-size: 10px;
  text-transform: uppercase;
  opacity: 0.7;
  margin-bottom: 2px;
  color: #9ca3af;
}

.topup-row-title {
  font-size: 13px;
  font-weight: 600;
  color: #e5e7eb;
}

.topup-row-value {
  font-weight: 700;
  font-size: 16px;
  color: #e5e7eb;

  &.with-icon {
    display: flex;
    align-items: center;
    gap: 6px;
  }
}

.topup-value-icon {
  width: 18px;
  height: 18px;
}

.tokens-section {
  margin: 16px 16px 0;
}

.tokens-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  opacity: 0.7;
  color: #9ca3af;
}

.tokens-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  opacity: 0.7;
  color: #9ca3af;
}

.tokens-input {
  :deep(.q-field__control) {
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.4);
    color: #fff;
  }
  :deep(.q-field__native) {
    color: #fff;
  }
  :deep(img) {
    width: 18px;
    height: 18px;
  }
}

.tokens-slider {
  margin-top: 12px;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  touch-action: pan-x;
  -webkit-tap-highlight-color: transparent;

  :deep(.q-slider__track-container) {
    cursor: pointer;
    touch-action: pan-x;
    will-change: transform;
    -webkit-tap-highlight-color: transparent;
  }

  :deep(.q-slider__thumb-container) {
    transform: translate(-50%, -50%);
    -webkit-transform: translate(-50%, -50%);
  }

  :deep(.q-slider__thumb) {
    cursor: grab;
    will-change: transform;
    transition: none;
    -webkit-tap-highlight-color: transparent;
    transform: translateZ(0) translateY(-5.5px) translateX(-3.5px);
    -webkit-transform: translateZ(0) translateY(-5.5px) translateX(-3.5px);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    margin-top: -5.5px;
    margin-left: -3.5px;

    &:active {
      cursor: grabbing;
      transform: translateZ(0) translateY(-5.5px) translateX(-3.5px) scale(1.1);
      -webkit-transform: translateZ(0) translateY(-5.5px) translateX(-3.5px) scale(1.1);
    }

    &:hover {
      cursor: grab;
    }
  }

  :deep(.q-slider__track) {
    cursor: pointer;
    will-change: width;
    transform: translateZ(0);
    -webkit-transform: translateZ(0);
  }

  :deep(.q-slider__track-fill) {
    will-change: width;
    transition: none;
    transform: translateZ(0);
    -webkit-transform: translateZ(0);
  }

  :deep(.q-slider__track-container),
  :deep(.q-slider__thumb-container) {
    transform: translateZ(0);
    -webkit-transform: translateZ(0);
  }
}

.tokens-funds {
  margin-top: 6px;
  margin-bottom: 2rem;
  font-size: 11px;
  opacity: 0.7;
  color: #9ca3af;
  text-align: center;
}

/* CTA - Sticky save button */
// BottomCtaButton component handles its own styling

/* Dialog blur background */
:deep(.q-dialog__backdrop) {
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* Edit photos dialog styles */
.edit-photos-dialog {
  background: rgba(22, 22, 22, 0.7) !important;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 16px;
  min-width: 90%;
  max-width: 600px;
}

.edit-photos-title {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  text-align: center;
  font-family: 'Poppins', sans-serif;
}

.edit-photos-content {
  padding: 16px;
  max-height: 70vh;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  min-height: 200px;
  scroll-behavior: smooth;
}

.edit-photos-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.edit-photo-wrapper {
  width: 120px;
  height: 120px;
  flex-shrink: 0;
}

.edit-photo-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  width: 100%;
  height: 100%;
  position: relative;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    border-color: rgba(255, 255, 255, 0.3);
  }
}

.edit-photo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  pointer-events: auto;
}

.edit-photo-remove-btn {
  background: rgba(244, 67, 54, 0.95) !important;
  color: white !important;
  width: 28px;
  height: 28px;
  margin: 4px;
  z-index: 10;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
  min-height: 28px;
  padding: 0;

  &:hover {
    background: rgba(244, 67, 54, 1) !important;
    transform: scale(1.1);
  }

  :deep(.q-icon) {
    font-size: 16px;
  }
}

.edit-photo-add-card {
  background: rgba(255, 255, 255, 0.05);
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.5);
    transform: scale(1.05);
  }
}

.edit-photo-add-icon {
  width: 40px;
  height: 40px;
  opacity: 0.7;
  transition: opacity 0.2s ease, transform 0.2s ease;
  filter: brightness(0) invert(1);

  .edit-photo-add-card:hover & {
    opacity: 1;
    transform: scale(1.1);
  }
}

/* Edit category dialog styles */
.edit-category-dialog {
  background: rgba(22, 22, 22, 0.7) !important;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 16px;
  min-width: 90%;
  max-width: 420px;
}

.edit-dialog-title {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  text-align: center;
  font-family: 'Poppins', sans-serif;
}

.category-close-btn {
  z-index: 1000 !important;
  background: rgba(0, 0, 0, 0.3) !important;

  &:hover {
    background: rgba(0, 0, 0, 0.5) !important;
    color: rgba(255, 255, 255, 1) !important;
  }
}

.headline-input {
  :deep(.q-field__control) {
    color: #ffffff;
  }

  :deep(.q-field__native) {
    color: #ffffff;
  }

  :deep(.q-field__label) {
    color: rgba(255, 255, 255, 0.7);
  }
}

.edit-category-picker-section {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: 24px 16px;
}

.category-picker-container {
  position: relative;
  width: 100%;
  max-width: 280px;
  height: 300px;
  overflow-y: scroll;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  scroll-behavior: smooth;
  padding: 120px 0;

  /* Hide scrollbar */
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }
}

.category-picker-item {
  width: 100%;
  padding: 12px 16px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  user-select: none;
  scroll-snap-align: center;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  gap: 12px;

  &:hover {
    color: rgba(255, 255, 255, 0.9);
  }

  &--selected {
    color: #ffffff;
    font-weight: 700;

    &::before,
    &::after {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      height: 1px;
      background: rgba(255, 255, 255, 0.2);
    }

    &::before {
      top: 0;
    }

    &::after {
      bottom: 0;
    }
  }
}

.category-picker-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  filter: brightness(0) invert(1);
  transition: opacity 0.2s ease;
}

.category-picker-item {
  .category-picker-icon,
  .category-picker-text {
    transition: opacity 0.2s ease;
  }
}

.category-picker-text {
  font-size: 14px;
  font-weight: 400;
  transition: all 0.2s ease;
}

.category-picker-item--selected .category-picker-text {
  font-size: 14px;
  font-weight: 700;
}

.category-dialog-actions {
  gap: 16px;
  justify-content: center;
}

.category-cancel-btn,
.category-save-btn {
  width: 120px !important;
  min-width: 120px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;

  :deep(.q-btn__content) {
    justify-content: center !important;
    text-align: center !important;
  }
}

.category-cancel-btn {
  background: rgba(255, 255, 255, 0.1) !important;
  color: rgba(255, 255, 255, 0.9) !important;

  &:hover {
    background: rgba(255, 255, 255, 0.15) !important;
  }
}

.category-save-btn {
  margin-left: 0;
}
</style>
<style scoped lang="scss">
.topDream-page {
  .topDream-imageSwiperContainer {
    height: 19rem;
    position: relative;

    .detailIconDiv {
      width: 100%;
      margin-top: 2.5rem;
      display: flex;
      justify-content: space-evenly;
      position: absolute;
      top: 0;
      z-index: 2;
      .detailIconDivRight {
        margin-left: 12rem;
      }
      .PostDetail-btn {
        margin: 0 0.4rem;
        width: 2.8rem;
        height: 2.8rem;
        border-radius: 6.1875rem;
        background: linear-gradient(
          135deg,
          rgba(106, 105, 105, 0.656) 0%,
          rgba(0, 0, 0, 0.483) 100%
        );
        backdrop-filter: blur(1rem);
      }
      * {
        fill: white;
      }
      svg {
        scale: 1.3 !important;
      }
    }
    .topDream-titleContainer {
      position: absolute;
      top: 67%;
      z-index: 11;
      left: 18%;
      background: linear-gradient(
        108.46deg,
        rgba(0, 0, 0, 0.786) 1%,
        rgba(23, 23, 23, 0.789) 100%
      );
      width: auto;
      padding: 0.9rem 0.7rem;
      border-radius: 1.3rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      .topDream-postCategoryImage {
        height: 1.2rem;
      }
      .topDream-postTitle {
        font-size: 1.4rem;
        font-family: poppinsSemiBold;
        color: white;
      }
    }
  }
  .topDream-descriptionContainer {
    position: relative;
    background-image: url("/icons/topUpDream-gradientBg.png");
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
    height: 15rem;
    display: flex;
    flex-direction: column;
    padding: 1rem;
    padding-top: 2rem;
    gap: 0.8rem;
    .topDream-birdImg {
      position: absolute;
      top: 40%;
      left: 40%;
    }
    .topDream-description-title {
      color: white;
      font-family: poppinsSemiBold;
      font-size: 1.5rem;
    }
    .topDream-textContainer {
      padding-right: 5.9rem;
    }
    .topDream-description {
      color: rgba(255, 255, 255, 0.736);
      font-family: inter;
      font-size: 1rem;
    }
  }
  .topDream-valuesContainer {
    padding: 1rem 1rem;
    display: flex;
    flex-direction: column;
    justify-content: start;

    .topDream-valueTitle {
      color: white;
      font-family: poppinsSemiBold;
      font-size: 0.9rem;
      margin-bottom: 0.8rem;
    }
    .karmaGainedCard {
      background: linear-gradient(
        108.46deg,
        rgba(37, 37, 37, 0.405) 0%,
        rgba(23, 23, 23, 0.33) 100%
      );
      // background-color: pink;
      height: 3.6rem;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1rem;
      margin-bottom: 0.5rem;
      border-radius: 0.8rem;

      .karmaGainedTitleDiv {
        width: 5rem;
        display: flex;

        .karmaGainedTitle {
          color: white;
          font-size: 0.7rem;
          font-family: poppins;
          line-height: 0.9rem;
          text-transform: Uppercase;
        }
      }

      .overwievDonationsDiv {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-left: -4.5rem;

        .karmaGainedImgGift {
          height: 1.7rem;
          margin-right: 0.5rem;
          margin-bottom: 0.2rem;
        }

        .karmaGainedDescription {
          color: white;
          font-family: poppins;
          font-size: 0.9rem;
        }
      }

      .karmaValue {
        display: flex;
        align-items: center;
        background-color: rgba(189, 0, 67, 0.1);
        height: 2.5rem;
        width: auto;
        border-radius: 0.6rem;
        padding: 0.3rem 0.6rem;

        .karmaGainedImgKarma {
          height: 1.2rem;
        }

        .karmaGainedKarmaValue {
          color: $primary;
          font-family: poppinsBold;
          margin-left: 0.1rem;
          font-size: 1rem;
        }
      }
    }
  }
  .topDream-sliderContainer {
    padding: 0 1.8rem;
    .topDream-sliderTitleContainer {
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      .topDream-sliderTitle {
        color: white;
        font-family: poppinsSemiBold;
        font-size: 1.1rem;
      }
      .topDream-questiobButton {
        width: 1.5rem;
        border-radius: 100%;
        padding: 0;
        margin-left: 0.5rem;
      }
      .topDream-questionImg {
        height: 1.5em;
      }
    }
    .topDream-tokenInputWrapper {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      margin-bottom: 1rem;
    }
    .topDream-tokenInput {
      width: 60%;
      max-width: 200px;
      :deep(.q-field__control) {
        display: flex;
        align-items: center;
        background: rgba(23, 23, 23, 0.72);
        border-radius: 0.625rem;
        height: 2.875rem;
      }
      :deep(.q-field__append) {
        display: flex;
        align-items: center;
        justify-content: center;
        padding-left: 0.3rem;
      }
      :deep(.q-icon) {
        color: $primary;
        font-size: 1.2rem;
      }
    }
    .topDream-sliderWrapper {
      margin-bottom: 1rem;
    }
    .topDream-slider {
      width: 100%;
    }
    .topDream-tokenBalance {
      color: rgba(255, 255, 255, 0.7);
      font-family: poppins;
      font-size: 0.9rem;
      text-align: center;
      margin-top: 0.5rem;
    }
  }
  .topDream-buttonContainer {
    display: flex;
    justify-content: center;
    padding-top: 1rem;
  }
  .topDream-topUpButton {
    background-color: rgba(182, 0, 67, 1);
    color: white;
    border: none;
    font-size: 1.2rem;
    height: 3.2rem;
    width: 22rem;
    font-family: montseraatSemiBold;
    border-radius: 0.5rem !important;
    margin-bottom: 0.8rem !important;

    img {
      margin-right: 0.5rem;
    }
  }
}
</style>
<script setup lang="ts">
import { formatNumber } from "src/components/partials/FunctionsComponent.vue";
import { ref, onMounted, onBeforeUnmount, computed, reactive, nextTick, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { usePostsStore } from "src/stores/posts";
import { useAuthStore } from "src/stores/auth";
import { getPostTypeIcon } from "src/utils/postIcons";
import { getCategoryIcon } from "src/domain/categories";
import { getLocationLabel } from "src/utils/cityNames";
import { normalizePost } from "src/utils/normalizePost";
import { formatSubcategoryLabel } from "src/utils/formatSubcategoryLabel";
import PostHeader from "src/components/post/PostHeader.vue";
import AppSplash from "src/components/common/AppSplash.vue";
import ImagePreviewModal from "src/components/common/ImagePreviewModal.vue";
import BottomCtaButton from "src/components/ui/BottomCtaButton.vue";
import { api } from "boot/axios";
import type { PostDetail } from "src/stores/posts";
import { useQuasar } from "quasar";
import { useUpload } from "src/composables/useUpload";
import { useRemainingFunds } from "src/composables/useRemainingFunds";

const route = useRoute();
const router = useRouter();
const postsStore = usePostsStore();
const authStore = useAuthStore();
const { t, locale } = useI18n();
const $q = useQuasar();
const { uploadMultipleImages } = useUpload();

const isBodyLight = ref(false);
const loading = ref(false);
const isEditRollupOpen = ref(false); // default: CLOSED when the user lands on the page
const isSaving = ref(false);
// Draft model with primitives (no Proxy objects)
interface PostDraft {
  title: string;
  description: string;
  tokens: number;
  deadline: string | null;
  images: string[];
  categorySlug: "dream" | "problem" | "idea" | null;
  subcategorySlug: string | null;
}

const originalDraft = ref<PostDraft | null>(null);
const draft = ref<PostDraft | null>(null);

// Keep editedPost for backward compatibility with existing code
const editedPost = ref<PostDetail | null>(null);
const originalPost = ref<PostDetail | null>(null);
const isLiked = ref(false);

// Image lightbox state
const isLightboxOpen = ref(false);
const lightboxInitialIndex = ref(0);

// Dialogs state
const dialogs = reactive({
  photos: false,
  category: false,
  subcategory: false,
  headline: false,
  deadline: false
});

// Edit form state
const editForm = reactive({
  photos: [] as Array<string | { url?: string; secure_url?: string; public_id?: string }>,
  categoryId: null as number | null,
  subcategoryId: null as number | null,
  headline: "",
  deadline: null as string | null // ISO date string 'YYYY-MM-DD'
});

// File input ref for photos
const fileInput = ref<HTMLInputElement | null>(null);

// Temporary photos state for cancel functionality
const tempPhotos = ref<Array<string | { url?: string; secure_url?: string; public_id?: string }>>([]);
// Flag to track if photos were saved (to prevent restore on dialog close)
const photosSaved = ref(false);
const headlineInputRef = ref<{ focus:() => void; $el?: { querySelector: (selector: string) => HTMLInputElement | null } } | null>(null);

// Scroll tracking for blur effect (same as PostDetailPage)
type ScrollEventTarget = Window | HTMLElement;
const scrollY = ref(0);
const lastKnownScrollY = ref(0); // Last known scroll position (updated only when dialogs are closed)
const frozenScrollY = ref(0); // Frozen scroll position when dialog is open
const cleanupFns: Array<() => void> = [];

// Check if any edit dialog is open
const isEditDialogOpen = computed(() => {
  return dialogs.photos || dialogs.category || dialogs.subcategory || dialogs.headline || dialogs.deadline;
});

const readScrollPosition = () => {
  // Always use window.scrollY for consistency with Quasar QLayout
  return window.scrollY || document.documentElement?.scrollTop || document.body?.scrollTop || 0;
};

const handleScroll = () => {
  // Don't update lastKnownScrollY if a dialog is open (to prevent reset to 0)
  if (isEditDialogOpen.value) {
    return;
  }
  const newScrollY = readScrollPosition();
  scrollY.value = newScrollY;
  lastKnownScrollY.value = newScrollY;
};

const attachScrollListener = (target: ScrollEventTarget) => {
  target.addEventListener("scroll", handleScroll, { passive: true });
  cleanupFns.push(() => target.removeEventListener("scroll", handleScroll));
};

// Effective scroll Y: use frozen value when dialog is open, otherwise use lastKnownScrollY
const effectiveScrollY = computed(() => {
  if (isEditDialogOpen.value) {
    return frozenScrollY.value;
  }
  return lastKnownScrollY.value;
});

const heroStyle = computed(() => {
  const maxBlur = 14;
  const maxTranslate = 40;
  const maxScroll = 400; // Increased for smoother, more gradual blur

  // Use effectiveScrollY instead of scrollY.value to preserve blur when dialogs open
  // This ensures blur stays frozen at the current value when a dialog is open
  const progress = Math.min(effectiveScrollY.value / maxScroll, 1);
  const clampedProgress = Math.max(0, Math.min(1, progress)); // Clamp between 0 and 1

  const styles = {
    filter: `blur(${clampedProgress * maxBlur}px)`,
    transform: `translateY(${-clampedProgress * maxTranslate}px)`
  };

  return styles;
});

// Form state
const form = reactive({
  title: "",
  description: "",
  tokensToTopUp: 0
});

// Router navigation
const goBack = () => router.back();
const onShare = () => {
  // TODO: Implement share logic
};
const onLike = () => {
  isLiked.value = !isLiked.value;
  // TODO: Implement like logic
};
// toggleInfo removed - replaced by toggleEditPanel

const checkBodyClass = () => {
  isBodyLight.value = document.body.classList.contains("body--light");
};

// Check if we're in edit mode (route name is "donee-post-edit")
const isEditMode = computed(() => route.name === "donee-post-edit");
const postId = computed(() => {
  if (isEditMode.value) {
    return Number(route.params.id);
  }
  return null;
});

// Load post if in edit mode
onMounted(async () => {
  checkBodyClass();
  if (isEditMode.value && postId.value) {
    loading.value = true;
    try {
      await postsStore.fetchPostById(postId.value);
      if (postsStore.currentPost) {
        fillFormFromPost(postsStore.currentPost);
      }
    } catch (error) {
      console.error("Failed to load post:", error);
    } finally {
      loading.value = false;
    }
  } else {
    // For non-edit mode, initialize originalPost and editedPost
    if (postsStore.currentPost) {
      originalPost.value = JSON.parse(JSON.stringify(postsStore.currentPost));
      editedPost.value = JSON.parse(JSON.stringify(postsStore.currentPost));
    }
  }

  // Attach scroll listener for blur effect (same as PostDetailPage)
  attachScrollListener(window);
  handleScroll();

  // Initialize lastKnownScrollY with current scroll position
  lastKnownScrollY.value = readScrollPosition();
});

// Watch for dialog open/close to freeze/unfreeze blur
watch(isEditDialogOpen, (isOpen) => {
  if (isOpen) {
    // Freeze blur: save current scroll position
    frozenScrollY.value = lastKnownScrollY.value;
    if (process.env.NODE_ENV === "development") {
      console.log("🔒 [Blur Freeze] Dialog opened, freezing blur at scrollY:", frozenScrollY.value);
    }
  } else {
    // Unfreeze blur: update lastKnownScrollY with current position
    const currentScrollY = readScrollPosition();
    lastKnownScrollY.value = currentScrollY;
    if (process.env.NODE_ENV === "development") {
      console.log("🔓 [Blur Unfreeze] Dialog closed, updating lastKnownScrollY to:", currentScrollY);
    }
  }
});

onBeforeUnmount(() => {
  // Run cleanup functions
  cleanupFns.forEach((fn) => {
    try {
      fn();
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn("Error in cleanup function:", error);
      }
    }
  });
  cleanupFns.length = 0;
});

// Post type label for display
const postTypeLabel = computed(() => {
  if (!postsStore.currentPost) return "dream";
  if (postsStore.currentPost.type === "problem") return "problem";
  if (postsStore.currentPost.type === "idea") return "idea";
  return "dream";
});

// Typ postu pre text (dream / problem / idea)
const postType = computed(() => postsStore.currentPost?.type || "problem");

// Post type label lowercase
const postTypeLabelLower = computed(() => {
  if (postType.value === "dream") return "dream";
  if (postType.value === "idea") return "idea";
  return "problem";
});

// Category and subcategory options (reuse from SubmitLayout)
// Categories from SubmitLayout.vue
const categoryOptions = ref([
  { id: 1, name: "problem", title: "problem" },
  { id: 2, name: "dream", title: "dream" },
  { id: 3, name: "idea", title: "idea" }
]);

// Get icon for category type (problem, dream, idea)
const getCategoryTypeIcon = (categoryName: string): string => {
  const iconMap: Record<string, string> = {
    problem: "/icons/problemIcon.svg",
    dream: "/icons/redCloudIcon.svg",
    idea: "/icons/ideaIcon.svg"
  };
  return iconMap[categoryName.toLowerCase()] || "/icons/redCloudIcon.svg";
};

// Get icon for subcategory type
const getSubcategoryIcon = (subcategoryName: string): string => {
  const iconMap: Record<string, string> = {
    traveling: "traveling",
    travelling: "traveling",
    health: "health",
    learning: "learning",
    possesions: "possesions",
    possessions: "possesions",
    relationships: "relationships",
    events: "events",
    profession: "proffesion",
    other: "other",
    others: "other"
  };
  const iconName = iconMap[subcategoryName.toLowerCase()] || "traveling";
  return `/icons/CategoryIcons/${iconName}.svg`;
};

// Subcategories from SubmitLayout.vue (specificCategory)
const subcategoryOptions = computed(() => {
  // All subcategories (from SubmitLayout.vue specificCategory)
  const allSubcategories = [
    { id: 6, name: "profession", title: "profession", categoryId: null },
    { id: 7, name: "events", title: "events", categoryId: null },
    { id: 8, name: "other", title: "other", categoryId: null },
    { id: 3, name: "traveling", title: "traveling", categoryId: null },
    { id: 2, name: "health", title: "health", categoryId: null },
    { id: 1, name: "learning", title: "learning", categoryId: null },
    { id: 4, name: "possessions", title: "possessions", categoryId: null },
    { id: 5, name: "relationships", title: "relationships", categoryId: null }
  ];

  // If category is selected, filter subcategories (for now, return all)
  // TODO: Implement proper filtering based on category_id if backend provides this mapping
  return allSubcategories;
});

// Helper functions
// Map type (problem/dream/idea) to category_id
function mapTypeToCategoryId(type: string | null | undefined): number | null {
  if (!type) return null;
  const typeLower = type.toLowerCase();
  if (typeLower === "problem") return 1;
  if (typeLower === "dream") return 2;
  if (typeLower === "idea") return 3;
  return null;
}

function resolveCategoryName(categoryId: number | null): string {
  if (!categoryId) return "";
  const category = categoryOptions.value.find(c => c.id === categoryId);
  return category?.name || "";
}

function resolveSubcategoryName(subcategoryId: number | null): string {
  if (!subcategoryId) return "";
  const subcategory = subcategoryOptions.value.find(s => s.id === subcategoryId);
  return subcategory?.name || "";
}

// Helper function to map fe_category to subcategory_id
const mapFeCategoryToSubcategoryId = (feCategory: string | null): number | null => {
  if (!feCategory) return null;
  const category = subcategoryOptions.value.find(s => s.name.toLowerCase() === feCategory.toLowerCase());
  return category?.id || null;
};

// Handler funkcie pre edit akcie
const openPhotosEditor = () => {
  // Save current photos state for cancel functionality
  tempPhotos.value = JSON.parse(JSON.stringify(editForm.photos));
  photosSaved.value = false; // Reset saved flag
  dialogs.photos = true;
};

// Open lightbox for image preview (from edit photos dialog)
const openLightbox = (imageIndex: number) => {
  if (editForm.photos && editForm.photos.length > 0) {
    lightboxInitialIndex.value = imageIndex;
    isLightboxOpen.value = true;
  }
};

// Open lightbox for hero image click (from PostHeader)
const onHeroImageClick = (index: number) => {
  if (postDetail.value?.images && postDetail.value.images.length > 0) {
    lightboxInitialIndex.value = index;
    isLightboxOpen.value = true;
  }
};

// Get image URLs array for lightbox
// Uses images from postDetail (hero) or editForm.photos (edit dialog)
const lightboxImages = computed(() => {
  // Priority: use postDetail.images if available (from hero), otherwise use editForm.photos (from edit dialog)
  let images: Array<string | { url?: string; secure_url?: string }> = [];

  if (postDetail.value?.images && postDetail.value.images.length > 0) {
    // Use images from postDetail (hero section)
    images = postDetail.value.images;
  } else if (editForm.photos && editForm.photos.length > 0) {
    // Fallback to editForm.photos (edit photos dialog)
    images = editForm.photos;
  }

  return images.map((img: string | { url?: string; secure_url?: string }) => {
    if (typeof img === "string") {
      return img;
    }
    return img.url || img.secure_url || "";
  }).filter((url: string) => url !== "");
});

const categoryPickerContainer = ref<HTMLElement | null>(null);
let categoryPickerScrollHandler: (() => void) | null = null;
let categoryPickerObserver: IntersectionObserver | null = null;

const subcategoryPickerContainer = ref<HTMLElement | null>(null);
let subcategoryPickerScrollHandler: (() => void) | null = null;
let subcategoryPickerObserver: IntersectionObserver | null = null;
const isInitialSubcategoryScroll = ref(false);

// Handle scroll in category picker - select item closest to center using Intersection Observer
const setupCategoryPickerObserver = () => {
  if (!categoryPickerContainer.value) return;

  // Cleanup existing observer
  if (categoryPickerObserver) {
    categoryPickerObserver.disconnect();
    categoryPickerObserver = null;
  }

  const container = categoryPickerContainer.value;
  const items = container.querySelectorAll(".category-picker-item");

  // Create intersection observer with root margin to detect center area
  categoryPickerObserver = new IntersectionObserver(
    (entries) => {
      if (!categoryPickerContainer.value) return;

      const containerRect = categoryPickerContainer.value.getBoundingClientRect();
      const containerCenter = containerRect.top + containerRect.height / 2;

      let closestEntry: IntersectionObserverEntry | null = null;
      let closestDistance = Infinity;

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const itemRect = entry.boundingClientRect;
          const itemCenter = itemRect.top + itemRect.height / 2;
          const distance = Math.abs(itemCenter - containerCenter);

          if (distance < closestDistance) {
            closestDistance = distance;
            closestEntry = entry;
          }
        }
      });

      if (closestEntry) {
        const target = (closestEntry as IntersectionObserverEntry).target;
        if (target instanceof Element) {
          const itemIndex = Array.from(items).indexOf(target);
          if (itemIndex >= 0 && categoryOptions.value[itemIndex]) {
            const newCategoryId = categoryOptions.value[itemIndex].id;
            if (editForm.categoryId !== newCategoryId) {
              editForm.categoryId = newCategoryId;
            }
          }
        }
      }
    },
    {
      root: container,
      rootMargin: "-35% 0px -35% 0px", // Only observe center 30% of container
      threshold: [0, 0.25, 0.5, 0.75, 1.0]
    }
  );

  // Observe all items
  items.forEach((item) => {
    categoryPickerObserver?.observe(item);
  });
};

// Handle scroll in category picker - select item closest to center
const handleCategoryPickerScroll = () => {
  if (!categoryPickerContainer.value) return;

  const container = categoryPickerContainer.value;
  const containerRect = container.getBoundingClientRect();
  const viewportCenter = containerRect.top + containerRect.height / 2;

  const items = container.querySelectorAll(".category-picker-item");
  let closestItem: Element | null = null;
  let closestDistance = Infinity;

  items.forEach((item) => {
    const itemRect = item.getBoundingClientRect();
    const itemCenter = itemRect.top + itemRect.height / 2;
    const distance = Math.abs(itemCenter - viewportCenter);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestItem = item;
    }
  });

  if (closestItem) {
    const itemIndex = Array.from(items).indexOf(closestItem);
    if (itemIndex >= 0 && categoryOptions.value[itemIndex]) {
      const newCategoryId = categoryOptions.value[itemIndex].id;
      if (editForm.categoryId !== newCategoryId) {
        editForm.categoryId = newCategoryId;
      }
    }
  }
};

const openCategoryPicker = () => {
  // Always update editForm.categoryId from current post value
  // This ensures the picker always shows the current value, even after changes
  // Priority: draft > editedPost > currentPost
  let currentCategoryId: number | null = null;

  // First try to get from draft (most up-to-date, what user is currently editing)
  if (draft.value?.categorySlug) {
    const categoryOption = categoryOptions.value.find(opt => opt.name === draft.value.categorySlug);
    if (categoryOption) {
      currentCategoryId = categoryOption.id;
    }
  }

  // Second try to get from editedPost (intermediate state) using category.slug (new format)
  if (currentCategoryId === null && editedPost.value) {
    const editedPostValue = editedPost.value;
    // Prefer category.slug (new format)
    if (editedPostValue.category?.slug) {
      const categoryOption = categoryOptions.value.find(opt => opt.name === editedPostValue.category?.slug);
      if (categoryOption) {
        currentCategoryId = categoryOption.id;
      }
    }
    // Fallback to category_id if slug is not available
    if (currentCategoryId === null) {
      currentCategoryId = (editedPostValue as PostDetail & { category_id?: number }).category_id || null;
    }
    // Last fallback: try to map from type (legacy)
    if (currentCategoryId === null && editedPostValue.type) {
      const typeValue = typeof editedPostValue.type === "string" ? editedPostValue.type : String(editedPostValue.type);
      currentCategoryId = mapTypeToCategoryId(typeValue);
    }
  }

  // Fallback to postsStore.currentPost if draft/editedPost doesn't have it
  if (currentCategoryId === null && postsStore.currentPost) {
    const currentPost = postsStore.currentPost;
    // Prefer category.slug (new format)
    if (currentPost.category?.slug) {
      const categoryOption = categoryOptions.value.find(opt => opt.name === currentPost.category?.slug);
      if (categoryOption) {
        currentCategoryId = categoryOption.id;
      }
    }
    // Fallback to category_id if slug is not available
    if (currentCategoryId === null) {
      currentCategoryId = (currentPost as PostDetail & { category_id?: number }).category_id || null;
    }
    // Last fallback: try to map from type (legacy)
    if (currentCategoryId === null && currentPost.type) {
      const typeValue = typeof currentPost.type === "string" ? currentPost.type : String(currentPost.type);
      currentCategoryId = mapTypeToCategoryId(typeValue);
    }
  }

  // Update editForm.categoryId with current value BEFORE opening dialog
  // Always update, even if it's null (to clear selection if needed)
  editForm.categoryId = currentCategoryId;

  // Open dialog AFTER setting the value to prevent flicker
  dialogs.category = true;
  // Scroll to selected item IMMEDIATELY without animation
  // Use requestAnimationFrame to ensure DOM is ready before scrolling
  requestAnimationFrame(() => {
    nextTick(() => {
      if (categoryPickerContainer.value) {
        const categoryIdToScroll = editForm.categoryId;
        if (categoryIdToScroll) {
          const selectedIndex = categoryOptions.value.findIndex(opt => opt.id === categoryIdToScroll);
          if (selectedIndex >= 0) {
            const items = categoryPickerContainer.value.querySelectorAll(".category-picker-item");
            if (items[selectedIndex]) {
              // Calculate scroll position directly to avoid any animation
              const item = items[selectedIndex] as HTMLElement;
              const container = categoryPickerContainer.value;
              const itemTop = item.offsetTop;
              const itemHeight = item.offsetHeight;
              const containerHeight = container.clientHeight;
              // Center the item in the container
              const scrollTop = itemTop - (containerHeight / 2) + (itemHeight / 2);
              // Set scroll position directly (no animation)
              container.scrollTop = scrollTop;
            }
          }
        } else {
          // If no selection, select first item
          if (categoryOptions.value.length > 0) {
            editForm.categoryId = categoryOptions.value[0].id;
            const items = categoryPickerContainer.value.querySelectorAll(".category-picker-item");
            if (items[0]) {
              const item = items[0] as HTMLElement;
              const container = categoryPickerContainer.value;
              const itemTop = item.offsetTop;
              const itemHeight = item.offsetHeight;
              const containerHeight = container.clientHeight;
              const scrollTop = itemTop - (containerHeight / 2) + (itemHeight / 2);
              container.scrollTop = scrollTop;
            }
          }
        }

        // Setup Intersection Observer and scroll listener AFTER initial positioning
        // Use a minimal delay to ensure DOM is ready, but no visible animation
        setTimeout(() => {
          if (categoryPickerContainer.value) {
            setupCategoryPickerObserver();
            categoryPickerScrollHandler = handleCategoryPickerScroll;
            categoryPickerContainer.value.addEventListener("scroll", categoryPickerScrollHandler, { passive: true });
            // Initial calculation after positioning
            handleCategoryPickerScroll();
          }
        }, 10);
      }
    });
  });
};

// Handle category item click - update selection and center it
const handleCategoryItemClick = (categoryId: number) => {
  editForm.categoryId = categoryId;
  // Center the selected item
  nextTick(() => {
    if (categoryPickerContainer.value) {
      const selectedIndex = categoryOptions.value.findIndex(opt => opt.id === categoryId);
      if (selectedIndex >= 0) {
        const items = categoryPickerContainer.value.querySelectorAll(".category-picker-item");
        if (items[selectedIndex]) {
          const item = items[selectedIndex] as HTMLElement;
          const container = categoryPickerContainer.value;
          const itemTop = item.offsetTop;
          const itemHeight = item.offsetHeight;
          const containerHeight = container.clientHeight;
          const scrollTop = itemTop - (containerHeight / 2) + (itemHeight / 2);
          // Smooth scroll to center (with animation for user interaction)
          container.scrollTo({ top: scrollTop, behavior: "smooth" });
        }
      }
    }
  });
};

// Cleanup scroll listener when dialog closes
const closeCategoryPicker = () => {
  cleanupCategoryPickerScroll();
  dialogs.category = false;
};

const cleanupCategoryPickerScroll = () => {
  if (categoryPickerObserver) {
    categoryPickerObserver.disconnect();
    categoryPickerObserver = null;
  }
  if (categoryPickerContainer.value && categoryPickerScrollHandler) {
    categoryPickerContainer.value.removeEventListener("scroll", categoryPickerScrollHandler);
    categoryPickerScrollHandler = null;
  }
};

// Watch for dialog close to cleanup scroll listener
watch(() => dialogs.category, (isOpen) => {
  if (!isOpen) {
    cleanupCategoryPickerScroll();
  }
});

// Category picker style calculation
const getPickerItemStyle = (index: number) => {
  const selectedIndex = categoryOptions.value.findIndex(opt => opt.id === editForm.categoryId);
  const distance = Math.abs(index - selectedIndex);

  // Calculate opacity based on distance
  const opacity = Math.max(0.3, 1 - (distance * 0.3));

  return {
    opacity: opacity.toString()
  };
};

// Subcategory picker style calculation
const getSubcategoryPickerItemStyle = (index: number) => {
  const selectedIndex = subcategoryOptions.value.findIndex(opt => opt.id === editForm.subcategoryId);
  const distance = Math.abs(index - selectedIndex);

  // Calculate opacity based on distance
  const opacity = Math.max(0.3, 1 - (distance * 0.3));

  return {
    opacity: opacity.toString()
  };
};

// Handle scroll in subcategory picker - select item closest to center using Intersection Observer
const setupSubcategoryPickerObserver = () => {
  if (!subcategoryPickerContainer.value) return;

  // Cleanup existing observer
  if (subcategoryPickerObserver) {
    subcategoryPickerObserver.disconnect();
    subcategoryPickerObserver = null;
  }

  const container = subcategoryPickerContainer.value;
  const items = container.querySelectorAll(".category-picker-item");

  // Create intersection observer with root margin to detect center area
  subcategoryPickerObserver = new IntersectionObserver(
    (entries) => {
      if (!subcategoryPickerContainer.value) return;

      const containerRect = subcategoryPickerContainer.value.getBoundingClientRect();
      const containerCenter = containerRect.top + containerRect.height / 2;

      let closestEntry: IntersectionObserverEntry | null = null;
      let closestDistance = Infinity;

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const itemRect = entry.boundingClientRect;
          const itemCenter = itemRect.top + itemRect.height / 2;
          const distance = Math.abs(itemCenter - containerCenter);

          if (distance < closestDistance) {
            closestDistance = distance;
            closestEntry = entry;
          }
        }
      });

      // Don't update if we're still in initial scroll phase
      if (isInitialSubcategoryScroll.value) return;

      if (closestEntry) {
        const target = (closestEntry as IntersectionObserverEntry).target;
        if (target instanceof Element) {
          const itemIndex = Array.from(items).indexOf(target);
          if (itemIndex >= 0 && subcategoryOptions.value[itemIndex]) {
            const newSubcategoryId = subcategoryOptions.value[itemIndex].id;
            if (editForm.subcategoryId !== newSubcategoryId) {
              editForm.subcategoryId = newSubcategoryId;
            }
          }
        }
      }
    },
    {
      root: container,
      rootMargin: "-35% 0px -35% 0px", // Only observe center 30% of container
      threshold: [0, 0.25, 0.5, 0.75, 1.0]
    }
  );

  // Observe all items
  items.forEach((item) => {
    subcategoryPickerObserver?.observe(item);
  });
};

// Handle scroll in subcategory picker - select item closest to center
const handleSubcategoryPickerScroll = () => {
  if (!subcategoryPickerContainer.value) return;
  // Don't update if we're still in initial scroll phase
  if (isInitialSubcategoryScroll.value) return;

  const container = subcategoryPickerContainer.value;
  const containerRect = container.getBoundingClientRect();
  const viewportCenter = containerRect.top + containerRect.height / 2;

  const items = container.querySelectorAll(".category-picker-item");
  let closestItem: Element | null = null;
  let closestDistance = Infinity;

  items.forEach((item) => {
    const itemRect = item.getBoundingClientRect();
    const itemCenter = itemRect.top + itemRect.height / 2;
    const distance = Math.abs(itemCenter - viewportCenter);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestItem = item;
    }
  });

  if (closestItem) {
    const itemIndex = Array.from(items).indexOf(closestItem);
    if (itemIndex >= 0 && subcategoryOptions.value[itemIndex]) {
      const newSubcategoryId = subcategoryOptions.value[itemIndex].id;
      if (editForm.subcategoryId !== newSubcategoryId) {
        editForm.subcategoryId = newSubcategoryId;
      }
    }
  }
};

const openSubcategoryPicker = () => {
  // Always update editForm.subcategoryId from current post value
  // This ensures the picker always shows the current value, even after changes
  // Priority: draft > editedPost > currentPost
  let currentSubcategoryId: number | null = null;

  // First try to get from draft (most up-to-date, what user is currently editing)
  if (draft.value?.subcategorySlug) {
    const subcategoryOption = subcategoryOptions.value.find(opt => opt.name === draft.value.subcategorySlug);
    if (subcategoryOption) {
      currentSubcategoryId = subcategoryOption.id;
    }
  }

  // Second try to get from editedPost (intermediate state) using subcategory.slug (new format)
  if (currentSubcategoryId === null && editedPost.value) {
    const editedPostValue = editedPost.value;
    // Prefer subcategory.slug (new format)
    if (editedPostValue.subcategory?.slug) {
      const subcategoryOption = subcategoryOptions.value.find(opt => opt.name === editedPostValue.subcategory?.slug);
      if (subcategoryOption) {
        currentSubcategoryId = subcategoryOption.id;
      }
    }
    // Fallback to subcategory_id if slug is not available
    if (currentSubcategoryId === null) {
      currentSubcategoryId = (editedPostValue as PostDetail & { subcategory_id?: number }).subcategory_id || null;
    }
    // Last fallback: try to map from fe_category (legacy)
    if (currentSubcategoryId === null && editedPostValue.fe_category) {
      const feCategoryValue = typeof editedPostValue.fe_category === "string" ? editedPostValue.fe_category : String(editedPostValue.fe_category);
      currentSubcategoryId = mapFeCategoryToSubcategoryId(feCategoryValue);
    }
  }

  // Fallback to postsStore.currentPost if draft/editedPost doesn't have it
  if (currentSubcategoryId === null && postsStore.currentPost) {
    const currentPost = postsStore.currentPost;
    // Prefer subcategory.slug (new format)
    if (currentPost.subcategory?.slug) {
      const subcategoryOption = subcategoryOptions.value.find(opt => opt.name === currentPost.subcategory?.slug);
      if (subcategoryOption) {
        currentSubcategoryId = subcategoryOption.id;
      }
    }
    // Fallback to subcategory_id if slug is not available
    if (currentSubcategoryId === null) {
      currentSubcategoryId = (currentPost as PostDetail & { subcategory_id?: number }).subcategory_id || null;
    }
    // Last fallback: try to map from fe_category (legacy)
    if (currentSubcategoryId === null && currentPost.fe_category) {
      const feCategoryValue = typeof currentPost.fe_category === "string" ? currentPost.fe_category : String(currentPost.fe_category);
      currentSubcategoryId = mapFeCategoryToSubcategoryId(feCategoryValue);
    }
  }

  // Update editForm.subcategoryId with current value BEFORE opening dialog
  // Always update, even if it's null (to clear selection if needed)
  editForm.subcategoryId = currentSubcategoryId;

  // Open dialog AFTER setting the value to prevent flicker
  dialogs.subcategory = true;
  // Mark initial scroll phase to prevent Intersection Observer from interfering
  isInitialSubcategoryScroll.value = true;
  // Scroll to selected item IMMEDIATELY without animation
  // Use requestAnimationFrame to ensure DOM is ready before scrolling
  requestAnimationFrame(() => {
    nextTick(() => {
      if (subcategoryPickerContainer.value) {
        const currentSubcategoryId = editForm.subcategoryId;
        if (currentSubcategoryId) {
          const selectedIndex = subcategoryOptions.value.findIndex(opt => opt.id === currentSubcategoryId);
          if (selectedIndex >= 0) {
            const items = subcategoryPickerContainer.value.querySelectorAll(".category-picker-item");
            if (items[selectedIndex]) {
              // Calculate scroll position directly to avoid any animation
              const item = items[selectedIndex] as HTMLElement;
              const container = subcategoryPickerContainer.value;
              const itemTop = item.offsetTop;
              const itemHeight = item.offsetHeight;
              const containerHeight = container.clientHeight;
              // Center the item in the container
              const scrollTop = itemTop - (containerHeight / 2) + (itemHeight / 2);
              // Set scroll position directly (no animation)
              container.scrollTop = scrollTop;
            }
          }
        } else {
          // If no selection, select first item
          if (subcategoryOptions.value.length > 0) {
            editForm.subcategoryId = subcategoryOptions.value[0].id;
            const items = subcategoryPickerContainer.value.querySelectorAll(".category-picker-item");
            if (items[0]) {
              const item = items[0] as HTMLElement;
              const container = subcategoryPickerContainer.value;
              const itemTop = item.offsetTop;
              const itemHeight = item.offsetHeight;
              const containerHeight = container.clientHeight;
              const scrollTop = itemTop - (containerHeight / 2) + (itemHeight / 2);
              container.scrollTop = scrollTop;
            }
          }
        }

        // Setup Intersection Observer and scroll listener AFTER initial positioning
        // Use a minimal delay to ensure DOM is ready, but no visible animation
        setTimeout(() => {
          isInitialSubcategoryScroll.value = false;
          setupSubcategoryPickerObserver();
          subcategoryPickerScrollHandler = handleSubcategoryPickerScroll;
          if (subcategoryPickerContainer.value) {
            subcategoryPickerContainer.value.addEventListener("scroll", subcategoryPickerScrollHandler, { passive: true });
          }
          // Initial calculation after positioning
          handleSubcategoryPickerScroll();
        }, 10);
      }
    });
  });
};

// Handle subcategory item click - update selection and center it
const handleSubcategoryItemClick = (subcategoryId: number) => {
  editForm.subcategoryId = subcategoryId;
  // Center the selected item
  nextTick(() => {
    if (subcategoryPickerContainer.value) {
      const selectedIndex = subcategoryOptions.value.findIndex(opt => opt.id === subcategoryId);
      if (selectedIndex >= 0) {
        const items = subcategoryPickerContainer.value.querySelectorAll(".category-picker-item");
        if (items[selectedIndex]) {
          const item = items[selectedIndex] as HTMLElement;
          const container = subcategoryPickerContainer.value;
          const itemTop = item.offsetTop;
          const itemHeight = item.offsetHeight;
          const containerHeight = container.clientHeight;
          const scrollTop = itemTop - (containerHeight / 2) + (itemHeight / 2);
          // Smooth scroll to center (with animation for user interaction)
          container.scrollTo({ top: scrollTop, behavior: "smooth" });
        }
      }
    }
  });
};

// Cleanup scroll listener when subcategory dialog closes
const cleanupSubcategoryPickerScroll = () => {
  if (subcategoryPickerObserver) {
    subcategoryPickerObserver.disconnect();
    subcategoryPickerObserver = null;
  }
  if (subcategoryPickerContainer.value && subcategoryPickerScrollHandler) {
    subcategoryPickerContainer.value.removeEventListener("scroll", subcategoryPickerScrollHandler);
    subcategoryPickerScrollHandler = null;
  }
};

// Watch for subcategory dialog close to cleanup scroll listener
watch(() => dialogs.subcategory, (isOpen) => {
  if (!isOpen) {
    cleanupSubcategoryPickerScroll();
    isInitialSubcategoryScroll.value = false;
  }
});

const openHeadlineEditor = () => {
  dialogs.headline = true;
};

const openDeadlinePicker = () => {
  dialogs.deadline = true;
};

// Focus headline input when dialog opens
const focusHeadlineInput = () => {
  nextTick(() => {
    if (headlineInputRef.value) {
      headlineInputRef.value.focus();
      const input = headlineInputRef.value.$el?.querySelector("input");
      if (input && editForm.headline) {
        input.setSelectionRange(editForm.headline.length, editForm.headline.length);
      }
    }
  });
};

// Apply changes functions
const applyHeadlineChange = async () => {
  if (draft.value) {
    // IMPORTANT: Update draft model with new title (primitives)
    draft.value.title = editForm.headline;
  }
  if (editedPost.value) {
    editedPost.value.title = editForm.headline;
    // Update postsStore.currentPost.title immediately for UI reactivity
    if (postsStore.currentPost) {
      postsStore.currentPost.title = editForm.headline;
    }
  }
  dialogs.headline = false;
  await nextTick();
};

const applyCategoryChange = async () => {
  const categoryName = resolveCategoryName(editForm.categoryId);
  if (!categoryName || !draft.value) {
    dialogs.category = false;
    await nextTick();
    return;
  }

  // IMPORTANT: Update draft model with new category slug (primitives)
  draft.value.categorySlug = categoryName as "dream" | "problem" | "idea";

  // IMPORTANT: After category change, check if subcategory is still valid
  // All subcategories are valid for all categories
  // But if subcategory is null, set default to "other"
  if (!draft.value.subcategorySlug) {
    draft.value.subcategorySlug = "other";
    // Also update editForm for UI consistency
    const otherSubcategory = subcategoryOptions.value.find(opt => opt.name === "other");
    if (otherSubcategory) {
      editForm.subcategoryId = otherSubcategory.id;
    }
  }

  // Update editedPost for backward compatibility with existing code
  if (editedPost.value) {
    (editedPost.value as PostDetail & { category_id?: number | null }).category_id = editForm.categoryId ?? undefined;
    editedPost.value.category_name = categoryName;
    editedPost.value.type = categoryName;
    if (!editedPost.value.category) {
      editedPost.value.category = { slug: categoryName as "dream" | "problem" | "idea" };
    } else {
      editedPost.value.category.slug = categoryName as "dream" | "problem" | "idea";
    }
    editedPost.value.category.id = editForm.categoryId ?? undefined;
  }

  // Update postsStore.currentPost immediately for UI reactivity
  if (postsStore.currentPost) {
    (postsStore.currentPost as PostDetail & { category_id?: number | null }).category_id = editForm.categoryId ?? undefined;
    postsStore.currentPost.category_name = categoryName;
    postsStore.currentPost.type = categoryName;
    if (!postsStore.currentPost.category) {
      postsStore.currentPost.category = { slug: categoryName as "dream" | "problem" | "idea" };
    } else {
      postsStore.currentPost.category.slug = categoryName as "dream" | "problem" | "idea";
    }
    postsStore.currentPost.category.id = editForm.categoryId ?? undefined;
  }

  // Close modal and wait for DOM update
  dialogs.category = false;
  await nextTick();

  // Debug log
  if (process.env.NODE_ENV === "development") {
    console.log("[applyCategoryChange] After category change:", {
      categoryId: editForm.categoryId,
      categorySlug: draft.value.categorySlug,
      subcategorySlug: draft.value.subcategorySlug,
      hasChanges: hasChanges.value
    });
  }
};

const applySubcategoryChange = async () => {
  const subcategoryName = resolveSubcategoryName(editForm.subcategoryId);

  // IMPORTANT: Update draft model with new subcategory slug (primitives)
  // This is the source of truth for hasChanges computed property
  if (draft.value && subcategoryName) {
    draft.value.subcategorySlug = subcategoryName as "traveling" | "health" | "learning" | "possessions" | "relationships" | "profession" | "events" | "other";
  } else if (draft.value) {
    // If no subcategory selected, set to null
    draft.value.subcategorySlug = null;
  }

  // Update editedPost for backward compatibility with existing code
  if (editedPost.value) {
    (editedPost.value as PostDetail & { subcategory_id?: number | null }).subcategory_id = editForm.subcategoryId ?? undefined;
    if (subcategoryName) {
      (editedPost.value as PostDetail & { subcategory_name?: string | null }).subcategory_name = subcategoryName;
      // Update fe_category to match subcategory name (backend uses fe_category)
      editedPost.value.fe_category = subcategoryName;
      // IMPORTANT: Update subcategory.slug and subcategory.id (new format)
      if (!editedPost.value.subcategory) {
        editedPost.value.subcategory = { slug: subcategoryName as "traveling" | "health" | "learning" | "possessions" | "relationships" | "profession" | "events" | "other" };
      } else {
        editedPost.value.subcategory.slug = subcategoryName as "traveling" | "health" | "learning" | "possessions" | "relationships" | "profession" | "events" | "other";
      }
      editedPost.value.subcategory.id = editForm.subcategoryId ?? undefined;

      // Update postsStore.currentPost immediately for UI reactivity
      if (postsStore.currentPost) {
        (postsStore.currentPost as PostDetail & { subcategory_id?: number | null; subcategory_name?: string | null }).subcategory_id = editForm.subcategoryId ?? undefined;
        (postsStore.currentPost as PostDetail & { subcategory_name?: string | null }).subcategory_name = subcategoryName;
        postsStore.currentPost.fe_category = subcategoryName;
        // IMPORTANT: Update subcategory.slug and subcategory.id (new format)
        if (!postsStore.currentPost.subcategory) {
          postsStore.currentPost.subcategory = { slug: subcategoryName as "traveling" | "health" | "learning" | "possessions" | "relationships" | "profession" | "events" | "other" };
        } else {
          postsStore.currentPost.subcategory.slug = subcategoryName as "traveling" | "health" | "learning" | "possessions" | "relationships" | "profession" | "events" | "other";
        }
        postsStore.currentPost.subcategory.id = editForm.subcategoryId ?? undefined;
      }
    } else {
      // If no subcategory selected, clear it
      if (postsStore.currentPost) {
        (postsStore.currentPost as PostDetail & { subcategory_id?: number | null; subcategory_name?: string | null }).subcategory_id = undefined;
        (postsStore.currentPost as PostDetail & { subcategory_name?: string | null }).subcategory_name = null;
        // Don't clear fe_category if subcategory is cleared - keep existing value
      }
    }
  }

  dialogs.subcategory = false;
  await nextTick();

  // Debug log
  if (process.env.NODE_ENV === "development") {
    console.log("[applySubcategoryChange] After subcategory change:", {
      subcategoryId: editForm.subcategoryId,
      subcategorySlug: draft.value?.subcategorySlug,
      originalSubcategorySlug: originalDraft.value?.subcategorySlug,
      hasChanges: hasChanges.value,
      sameSubcategory: originalDraft.value?.subcategorySlug === draft.value?.subcategorySlug
    });
  }
};

const applyDeadlineChange = () => {
  if (editedPost.value && editForm.deadline) {
    editedPost.value.date_deadline = editForm.deadline;
  }
  dialogs.deadline = false;
  markDirty();
};

// Photos functions
const removePhoto = (index: number) => {
  editForm.photos.splice(index, 1);
  markDirty();
};

const triggerAddPhoto = () => {
  fileInput.value?.click();
};

const onPhotosSelected = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  if (!files?.length) return;

  // Reuse the same upload / preview logic as in the post creation page
  try {
    const folder = "post-images";
    const uploaded = await uploadMultipleImages(Array.from(files), folder);
    const imageUrls = uploaded.map(img => img.secure_url || "");
    editForm.photos.push(...imageUrls);
    markDirty();
  } catch (error) {
    console.error("Failed to upload images:", error);
    $q.notify({
      type: "negative",
      message: "Failed to upload images. Please try again."
    });
  }

  // Reset input
  if (target) {
    target.value = "";
  }
};

const cancelPhotosEdit = () => {
  // Restore original photos state
  editForm.photos = JSON.parse(JSON.stringify(tempPhotos.value));
  dialogs.photos = false;
};

// Handle photos dialog close (when clicking outside or ESC)
const onPhotosDialogHide = () => {
  // If dialog is being closed and photos were not saved, restore original photos state
  // This ensures that if user clicks outside or presses ESC, changes are discarded
  if (!photosSaved.value) {
    editForm.photos = JSON.parse(JSON.stringify(tempPhotos.value));
  }
  // Reset flag for next time
  photosSaved.value = false;
};

const applyPhotosChange = () => {
  // Mark as saved so @hide handler doesn't restore tempPhotos
  photosSaved.value = true;

  if (editedPost.value) {
    // Update images array
    const imageUrls = editForm.photos.map(img =>
      typeof img === "string" ? img : (img.url || img.secure_url || "")
    );
    editedPost.value.images = imageUrls;

    // Update postsStore.currentPost.images immediately for UI reactivity
    if (postsStore.currentPost) {
      postsStore.currentPost.images = imageUrls;
    }
  }
  // Update tempPhotos to match current state after save
  tempPhotos.value = JSON.parse(JSON.stringify(editForm.photos));
  dialogs.photos = false;
  markDirty();
};

// Mark form as dirty
const markDirty = () => {
  // Sync draft images from editForm.photos so hasChanges reflects photo edits.
  if (draft.value) {
    draft.value.images = editForm.photos
      .map((img) => (typeof img === "string" ? img : (img.url || img.secure_url || "")))
      .filter((url) => typeof url === "string" && url.length > 0);
  }
};

// Edit actions array
const editActions = [
  { key: "photos", label: "photos", onClick: openPhotosEditor },
  { key: "category", label: "category", onClick: openCategoryPicker },
  { key: "subcategory", label: "subcategory", onClick: openSubcategoryPicker },
  { key: "headline", label: "headline", onClick: openHeadlineEditor },
  { key: "deadline", label: "deadline", onClick: openDeadlinePicker }
];

// Use real post data if in edit mode, otherwise use default
const postDetail = computed(() => {
  if (isEditMode.value && postsStore.currentPost) {
    const p = postsStore.currentPost;
    // Ensure images is always an array, never null or undefined
    const images = Array.isArray(p.images) ? p.images : [];

    return {
      name: p.title || "Untitled",
      goalImage: getPostTypeIcon(typeof p.type === "string" ? p.type : "dream"),
      images,
      date: p.date_created || "",
      location: getLocationLabel(p),
      views: p.views || 0,
      description: p.description || "",
      aboutDonee: "",
      doneeName: p.author_name || "",
      karmaValue: p.tokens || 0,
      category: p.fe_category || p.category_name || null,
      subcategory: (p as PostDetail & { subcategory_name?: string | null }).subcategory_name || null,
      type: p.type || "dream"
    };
  }
  // Default data for top-up mode
  return {
    name: "Aurora Expedition",
    goalImage: "/images/Auth/goalPicture.png",
    images: [
      "https://images.unsplash.com/photo-1528155124528-06c125d81e89?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=689&q=80",
      "https://images.unsplash.com/photo-1568607689150-17e625c1586e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      "https://i.etsystatic.com/32050623/r/il/76af79/4305610002/il_fullxfull.4305610002_2o9t.jpg",
      "https://images.unsplash.com/photo-1686890121573-5feec595490e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1287&q=80"
    ],
    date: "09/15/2023",
    location: "Island, Reykjavik",
    views: 156,
    description:
      "Adipiscing viverra netus ultricies lacus consectetur. Neque nulla fusce lorem ac nunc semper pellentesque vitae enim. Eu id nibh iaculis orci bibendum aenean morbi id. Bibendum semper viverra aenean turpis risus libero amet aliquam. ",
    aboutDonee:
      "Adipiscing viverra netus ultricies lacus consectetur. Neque nulla fusce lorem ac nunc semper pellentesque vitae enim. Eu id nibh iaculis orci bibendum aenean morbi id. Bibendum semper viverra aenean turpis risus libero amet aliquam. ",
    doneeName: "John Doe",
    karmaValue: 1584,
    category: null,
    subcategory: null,
    type: "dream"
  };
});

// Display properties for PostHeader
const displayTitle = computed(() => postsStore.currentPost?.title || "");
const displayDate = computed(() => {
  if (!postsStore.currentPost?.date_created) return "";
  const date = new Date(postsStore.currentPost.date_created);
  return date.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
});
// Use unified getLocationLabel helper for consistent location display
const displayLocation = computed(() => {
  if (!postsStore.currentPost) return "";
  return getLocationLabel(postsStore.currentPost, locale.value as string);
});
const displayViews = computed(() => postsStore.currentPost?.views || 0);
// Display subcategory name (traveling/health/etc.) using i18n
// IMPORTANT: Use draft state (source of truth for edit), fallback to currentPost
const displayCategoryName = computed(() => {
  // Prefer draft state (what user is editing)
  const subcategorySlug = draft.value?.subcategorySlug || postsStore.currentPost?.subcategory?.slug;
  if (!subcategorySlug) {
    const translated = t("subcategories.other") || "Other";
    const result = formatSubcategoryLabel(translated);
    if (process.env.NODE_ENV === "development") {
      console.log("[displayCategoryName] No subcategory slug, using 'other':", { translated, result });
    }
    return result;
  }
  // Use i18n key: subcategories.traveling, subcategories.health, etc.
  const i18nKey = `subcategories.${subcategorySlug}`;
  const translated = t(i18nKey);
  // If translation doesn't exist, return capitalized slug, then apply formatSubcategoryLabel
  const finalText = translated !== i18nKey ? translated : subcategorySlug.charAt(0).toUpperCase() + subcategorySlug.slice(1);
  const result = formatSubcategoryLabel(finalText);
  if (process.env.NODE_ENV === "development") {
    console.log("[displayCategoryName] Computed:", { subcategorySlug, i18nKey, translated, finalText, result });
  }
  return result;
});
// Display category icon (dream/problem/idea)
// IMPORTANT: Use draft state (source of truth for edit), fallback to currentPost
const displayCategoryIcon = computed(() => {
  // Prefer draft state (what user is editing)
  const categorySlug = draft.value?.categorySlug || postsStore.currentPost?.category?.slug;
  if (!categorySlug) {
    return getCategoryIcon("dream"); // Default to dream
  }
  return getCategoryIcon(categorySlug);
});
// displaySubcategoryName removed - not used in template

// Fill form from post data
const fillFormFromPost = (p: PostDetail) => {
  // Initialize originalPost and editedPost (deep copy for editedPost)
  originalPost.value = JSON.parse(JSON.stringify(p));
  editedPost.value = JSON.parse(JSON.stringify(p));

  // Extract slugs from post (prefer new format, fallback to legacy)
  const categorySlug = p.category?.slug || (p.type as "dream" | "problem" | "idea" | null) || null;
  const subcategorySlug = p.subcategory?.slug || p.fe_category || null;

  // Initialize draft model with primitives (slugs) - this is the source of truth for hasChanges
  draft.value = {
    title: p.title || "",
    description: p.description || "",
    tokens: p.tokens || 0,
    deadline: p.date_deadline || null,
    images: Array.isArray(p.images) ? p.images.filter((img): img is string => typeof img === "string") : [],
    categorySlug: categorySlug as "dream" | "problem" | "idea" | null,
    subcategorySlug: subcategorySlug as string | null
  };

  // Deep clone for original draft (snapshot for comparison)
  originalDraft.value = JSON.parse(JSON.stringify(draft.value));

  // Also update form for backward compatibility
  form.title = p.title || "";
  form.description = p.description || "";
  // tokensToTopUp starts at 0 - user can add tokens to top up the post
  form.tokensToTopUp = 0;

  // Initialize editForm from post data (for UI pickers)
  editForm.photos = Array.isArray(p.images) ? p.images.map(img => typeof img === "string" ? img : { url: img, secure_url: img }) : [];
  // Get category_id from post, or map from type if category_id is not available
  editForm.categoryId = (p as PostDetail & { category_id?: number }).category_id || null;
  if (editForm.categoryId === null && p.type) {
    const typeValue = typeof p.type === "string" ? p.type : String(p.type);
    editForm.categoryId = mapTypeToCategoryId(typeValue);
  }
  // Map fe_category to subcategory_id if subcategory_id is not available
  let subcategoryId = (p as PostDetail & { subcategory_id?: number }).subcategory_id || null;
  if (!subcategoryId && p.fe_category) {
    const feCategoryValue = typeof p.fe_category === "string" ? p.fe_category : String(p.fe_category);
    subcategoryId = mapFeCategoryToSubcategoryId(feCategoryValue);
  }
  editForm.subcategoryId = subcategoryId;
  editForm.headline = p.title || "";
  editForm.deadline = p.date_deadline || null;

  // Initialize tempPhotos to match current photos
  tempPhotos.value = JSON.parse(JSON.stringify(editForm.photos));
};

// Computed property to check if there are changes
// IMPORTANT: Compare using draft model with primitives (slugs), not objects
const hasChanges = computed(() => {
  if (!originalDraft.value || !draft.value) {
    if (process.env.NODE_ENV === "development") {
      console.log("[hasChanges] Missing originalDraft or draft:", {
        hasOriginal: !!originalDraft.value,
        hasDraft: !!draft.value
      });
    }
    return false;
  }

  const o = originalDraft.value;
  const d = draft.value;

  // Compare using primitives (slugs) - this ensures reliable comparison
  const sameTitle = o.title === d.title;
  const sameCategory = o.categorySlug === d.categorySlug;
  const sameSubcategory = o.subcategorySlug === d.subcategorySlug;
  const sameDeadline = o.deadline === d.deadline;
  const sameImages = JSON.stringify(o.images || []) === JSON.stringify(d.images || []);
  const sameTokens = form.tokensToTopUp === 0; // tokens_to_top_up starts at 0

  const hasChangesResult = !(
    sameTitle &&
    sameCategory &&
    sameSubcategory &&
    sameDeadline &&
    sameImages &&
    sameTokens
  );

  // Debug log
  if (process.env.NODE_ENV === "development" && hasChangesResult) {
    console.log("[hasChanges] Changes detected:", {
      sameTitle,
      sameCategory: { original: o.categorySlug, draft: d.categorySlug, result: sameCategory },
      sameSubcategory: { original: o.subcategorySlug, draft: d.subcategorySlug, result: sameSubcategory },
      sameDeadline,
      sameImages,
      sameTokens,
      hasChanges: hasChangesResult
    });
  }

  return hasChangesResult;
});

// Save handler
const onSaveChanges = async () => {
  if (!draft.value || !hasChanges.value || isSaving.value || !originalDraft.value) {
    if (process.env.NODE_ENV === "development") {
      console.log("[onSaveChanges] Cannot save:", {
        hasDraft: !!draft.value,
        hasChanges: hasChanges.value,
        isSaving: isSaving.value,
        hasOriginal: !!originalDraft.value
      });
    }
    return;
  }
  isSaving.value = true;
  try {
    // Build payload - only include changed fields
    // IMPORTANT: Use draft model (primitives) for comparison and payload
    const o = originalDraft.value;
    const d = draft.value;

    const payload: Record<string, unknown> = {};

    // Debug log before building payload
    if (process.env.NODE_ENV === "development") {
      console.log("[SaveChanges] store category/subcategory:", {
        categorySlug: d.categorySlug,
        subcategorySlug: d.subcategorySlug,
        originalCategory: o.categorySlug,
        originalSubcategory: o.subcategorySlug
      });
    }

    // Only send title if it changed
    if (o.title !== d.title) {
      payload.title = d.title;
    }

    // Only send category/subcategory if they changed (compare slugs)
    const sameCategory = o.categorySlug === d.categorySlug;
    const sameSubcategory = o.subcategorySlug === d.subcategorySlug;

    if (!sameCategory || !sameSubcategory) {
      // IMPORTANT: Send ONLY new API format (category/subcategory slugs)
      // NO legacy fields (type, fe_category, category_name)
      if (d.categorySlug) {
        payload.category = d.categorySlug;
      }
      if (d.subcategorySlug) {
        payload.subcategory = d.subcategorySlug;
      }

      // Debug log
      if (process.env.NODE_ENV === "development") {
        console.log("[onSaveChanges] Category/subcategory payload (NEW FORMAT ONLY):", {
          category: payload.category,
          subcategory: payload.subcategory,
          originalCategory: o.categorySlug,
          draftCategory: d.categorySlug,
          originalSubcategory: o.subcategorySlug,
          draftSubcategory: d.subcategorySlug
        });
      }
    }

    // Only send deadline if it changed
    if (o.deadline !== d.deadline) {
      payload.deadline = d.deadline;
    }

    // Send images if they changed (backend supports URL array after BE update)
    if (JSON.stringify(o.images || []) !== JSON.stringify(d.images || [])) {
      payload.images = d.images || [];
    }

    // Always send tokens_to_top_up (it's additive)
    if (form.tokensToTopUp > 0) {
      payload.tokens_to_top_up = form.tokensToTopUp;
    }

    // Debug log before API call
    if (process.env.NODE_ENV === "development") {
      console.log("[onSaveChanges] About to send update request:", {
        postId: postId.value,
        payload,
        hasChanges: hasChanges.value,
        isSaving: isSaving.value
      });
    }

    const { data } = await api.put(`/post-update/${postId.value}`, payload);

    // Debug log after API call
    if (process.env.NODE_ENV === "development") {
      console.log("[onSaveChanges] Update response:", data);
    }

    // IMPORTANT: Refetch post detail to get updated data from backend
    // This ensures we have the latest data including category/subcategory
    // Use force: true to bypass cache and always fetch fresh data from BE
    if (postId.value !== null) {
      await postsStore.fetchPostById(postId.value, { force: true });
    }

    // IMPORTANT: Update cache everywhere using upsertPostEverywhere
    // This ensures the post is updated in all lists (feed, my-posts, etc.) immediately
    if (postsStore.currentPost) {
      // Normalize the post to ensure it's in the correct format
      const normalizedPost = normalizePost(postsStore.currentPost);

      // Update in all cache arrays (feed, my-posts, detail, etc.)
      postsStore.upsertPostEverywhere(normalizedPost);

      // Update editedPost and originalPost from normalized response
      editedPost.value = JSON.parse(JSON.stringify(normalizedPost));
      originalPost.value = JSON.parse(JSON.stringify(normalizedPost));

      // IMPORTANT: Update draft model from refetched post (sync with BE)
      const categorySlug = normalizedPost.category?.slug || (normalizedPost.type as "dream" | "problem" | "idea" | null) || null;
      const subcategorySlug = normalizedPost.subcategory?.slug || normalizedPost.fe_category || null;

      if (draft.value) {
        draft.value.title = normalizedPost.title || "";
        draft.value.deadline = normalizedPost.date_deadline || null;
        draft.value.images = Array.isArray(normalizedPost.images) ? normalizedPost.images.filter((img): img is string => typeof img === "string") : [];
        draft.value.categorySlug = categorySlug as "dream" | "problem" | "idea" | null;
        draft.value.subcategorySlug = subcategorySlug as string | null;
      }

      // Update originalDraft to match draft (hasChanges becomes false)
      if (draft.value) {
        originalDraft.value = JSON.parse(JSON.stringify(draft.value));
      }

      // Debug log after cache update
      if (process.env.NODE_ENV === "development") {
        console.log("[onSaveChanges] After cache update:", {
          category: normalizedPost.category?.slug,
          subcategory: normalizedPost.subcategory?.slug,
          draftCategory: draft.value?.categorySlug,
          draftSubcategory: draft.value?.subcategorySlug,
          hasChanges: hasChanges.value
        });
      }
    }

    // Update editForm to reflect saved values (so dialogs show correct values when reopened)
    // After refetch, postsStore.currentPost has the latest data, so sync editForm from it
    if (postsStore.currentPost) {
      const currentPost = postsStore.currentPost;
      editForm.headline = currentPost.title || "";
      // Get category_id from currentPost, or map from category.slug/type if category_id is not available
      editForm.categoryId = (currentPost as PostDetail & { category_id?: number }).category_id || null;
      if (editForm.categoryId === null && currentPost.category?.slug) {
        // Map from category.slug to categoryId
        const categoryOption = categoryOptions.value.find(opt => opt.name === currentPost.category?.slug);
        if (categoryOption) {
          editForm.categoryId = categoryOption.id;
        } else if (currentPost.type) {
          const typeValue = typeof currentPost.type === "string" ? currentPost.type : String(currentPost.type);
          editForm.categoryId = mapTypeToCategoryId(typeValue);
        }
      }
      // Get subcategory_id from currentPost, or map from subcategory.slug/fe_category if subcategory_id is not available
      let subcategoryId = (currentPost as PostDetail & { subcategory_id?: number }).subcategory_id || null;
      if (!subcategoryId && currentPost.subcategory?.slug) {
        // Map from subcategory.slug to subcategoryId
        const subcategoryOption = subcategoryOptions.value.find(opt => opt.name === currentPost.subcategory?.slug);
        if (subcategoryOption) {
          subcategoryId = subcategoryOption.id;
        } else if (currentPost.fe_category) {
          const feCategoryValue = typeof currentPost.fe_category === "string" ? currentPost.fe_category : String(currentPost.fe_category);
          subcategoryId = mapFeCategoryToSubcategoryId(feCategoryValue);
        }
      }
      editForm.subcategoryId = subcategoryId;
      editForm.deadline = postsStore.currentPost.date_deadline || null;
      editForm.photos = Array.isArray(postsStore.currentPost.images) ? postsStore.currentPost.images.map(img => typeof img === "string" ? img : { url: img, secure_url: img }) : [];
    }

    // Show success toast
    $q.notify({
      type: "positive",
      message: "Post has been updated."
    });

    // Update post in lists (feed, my-posts, etc.) to reflect changes everywhere
    if (postId.value && postsStore.currentPost) {
      const updatedPost = postsStore.currentPost;
      const postIdToUpdate = updatedPost.post_id;

      // Update in posts array (feed)
      const postIndex = postsStore.posts.findIndex(
        (p) => (p.post_id || p.id) === postIdToUpdate
      );
      if (postIndex !== -1) {
        postsStore.posts[postIndex] = {
          ...postsStore.posts[postIndex],
          title: updatedPost.title,
          category_id: (updatedPost as PostDetail & { category_id?: number }).category_id,
          category_name: updatedPost.category_name,
          type: updatedPost.type,
          subcategory_id: (updatedPost as PostDetail & { subcategory_id?: number }).subcategory_id,
          subcategory_name: (updatedPost as PostDetail & { subcategory_name?: string | null }).subcategory_name,
          fe_category: updatedPost.fe_category,
          date_deadline: updatedPost.date_deadline,
          images: updatedPost.images
        };
      }

      // Update in myDreams array
      const myDreamIndex = postsStore.myDreams.findIndex(
        (p) => (p.post_id || p.id) === postIdToUpdate
      );
      if (myDreamIndex !== -1) {
        postsStore.myDreams[myDreamIndex] = {
          ...postsStore.myDreams[myDreamIndex],
          title: updatedPost.title,
          category_id: (updatedPost as PostDetail & { category_id?: number }).category_id,
          category_name: updatedPost.category_name,
          type: updatedPost.type,
          subcategory_id: (updatedPost as PostDetail & { subcategory_id?: number }).subcategory_id,
          subcategory_name: (updatedPost as PostDetail & { subcategory_name?: string | null }).subcategory_name,
          fe_category: updatedPost.fe_category,
          date_deadline: updatedPost.date_deadline,
          images: updatedPost.images
        };
      }

      // Update in myProblems array
      const myProblemIndex = postsStore.myProblems.findIndex(
        (p) => (p.post_id || p.id) === postIdToUpdate
      );
      if (myProblemIndex !== -1) {
        postsStore.myProblems[myProblemIndex] = {
          ...postsStore.myProblems[myProblemIndex],
          title: updatedPost.title,
          category_id: (updatedPost as PostDetail & { category_id?: number }).category_id,
          category_name: updatedPost.category_name,
          type: updatedPost.type,
          subcategory_id: (updatedPost as PostDetail & { subcategory_id?: number }).subcategory_id,
          subcategory_name: (updatedPost as PostDetail & { subcategory_name?: string | null }).subcategory_name,
          fe_category: updatedPost.fe_category,
          date_deadline: updatedPost.date_deadline,
          images: updatedPost.images
        };
      }

      // Update in myIdeas array
      const myIdeaIndex = postsStore.myIdeas.findIndex(
        (p) => (p.post_id || p.id) === postIdToUpdate
      );
      if (myIdeaIndex !== -1) {
        postsStore.myIdeas[myIdeaIndex] = {
          ...postsStore.myIdeas[myIdeaIndex],
          title: updatedPost.title,
          category_id: (updatedPost as PostDetail & { category_id?: number }).category_id,
          category_name: updatedPost.category_name,
          type: updatedPost.type,
          subcategory_id: (updatedPost as PostDetail & { subcategory_id?: number }).subcategory_id,
          subcategory_name: (updatedPost as PostDetail & { subcategory_name?: string | null }).subcategory_name,
          fe_category: updatedPost.fe_category,
          date_deadline: updatedPost.date_deadline,
          images: updatedPost.images
        };
      }
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error: unknown) {
    // Show error notify with backend message
    const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to update post. Please try again.";
    $q.notify({
      type: "negative",
      message: errorMessage
    });
  } finally {
    isSaving.value = false;
  }
};

// Cards removed - now using new topup-card components

// Token balance and validation (same logic as PostCreationPage)
const userTokensBalance = computed(() => {
  return authStore.user?.tokens ?? 0;
});

const maxTokens = computed(() => userTokensBalance.value ?? 0);

// Remaining tokens after spending (using composable)
const { remainingTokens } = useRemainingFunds(
  userTokensBalance,
  () => form.tokensToTopUp
);

// Available from donations (from post tokens)
const availableFromDonations = computed(() => {
  if (isEditMode.value && postsStore.currentPost) {
    return formatNumber(postsStore.currentPost.tokens || 0);
  }
  return formatNumber(1450); // Default value
});

// Full balance (user tokens)
const fullBalance = computed(() => {
  return formatNumber(userTokensBalance.value);
});

// Handle token input change
const onTokensInputChange = (val: string | number | null) => {
  if (val == null) return;
  const numVal = typeof val === "string" ? Number(val) : val;
  if (isNaN(numVal)) return;
  if (numVal < 0) {
    form.tokensToTopUp = 0;
  } else if (numVal > maxTokens.value) {
    form.tokensToTopUp = maxTokens.value;
  } else {
    form.tokensToTopUp = numVal;
  }
  // hasChanges computed property will automatically detect the change
};

// Handle token slider change
// slider ti drží range, input sa syncne automaticky cez v-model
const onTokensSliderChange = (val: number | null) => {
  if (val == null) return;
  if (val > maxTokens.value) {
    form.tokensToTopUp = maxTokens.value;
  } else {
    form.tokensToTopUp = val;
  }
  // hasChanges computed property will automatically detect the change
};
</script>
