<template>
  <div class="myProfile">
    <!-- Minimal Profile Header -->
    <div class="myProfile-header">
      <div class="myProfile-avatarContainer" @click="openProfileActions">
        <div class="myProfile-avatarWrapper">
          <div class="myProfile-avatar" v-if="!profileImageSrc || isProfileImageBroken">
            <span class="myProfile-avatarInitials">{{ userInitials }}</span>
          </div>
          <img
            v-else
            :src="profileImageSrc"
            alt="Profile"
            class="myProfile-avatarImg"
            @load="handleProfileImgLoad"
            @error="handleProfileImgError"
          />
          <!-- Badge display on avatar -->
          <img
            v-if="selectedBadge"
            :src="selectedBadge.image"
            :alt="selectedBadge.title"
            class="myProfile-avatarBadge"
          />
        </div>
      </div>
      <div class="myProfile-info">
        <h2 class="myProfile-username">{{ displayUsername }}</h2>
        <p v-if="displayLocation" class="myProfile-location">{{ displayLocation }}</p>
        <div class="myProfile-tokens">
          <span class="myProfile-tokensLabel">Tokens:</span>
          <span class="myProfile-tokensValue">{{ displayTokens }}</span>
        </div>
        <div class="myProfile-role">
          <span class="myProfile-roleLabel">Role:</span>
          <span class="myProfile-roleValue">{{ currentRole }}</span>
        </div>
        <div v-if="displayBio" class="myProfile-bioSection">
          <PageTitle :title="`About ${displayUsername}`" />
          <p class="myProfile-bio">{{ displayBio }}</p>
        </div>
      </div>
    </div>

    <!-- Settings Button -->
    <div class="myProfile-actions">
      <q-btn
        class="myProfile-settingsBtn"
        @click="goToSettings"
      >
        {{ t("settings") }}
      </q-btn>
    </div>

    <!-- Profile Actions Sheet -->
    <ProfileActionsSheet
      v-model="isProfileActionsOpen"
      :user="authStore.user"
      @view-photo="handleViewPhoto"
      @change-photo="handleChangePhoto"
      @select-badge="handleSelectBadge"
      @share-profile="handleShareProfile"
    />

    <!-- iOS/WKWebView: stabilný file input v DOM (nie createElement + click) + musí byť .click() v tom istom user-gesture ako tap -->
    <input
      ref="profilePhotoFileInputRef"
      type="file"
      accept="image/*"
      class="myProfile-hiddenFileInput"
      aria-hidden="true"
      tabindex="-1"
      @change="onProfilePhotoFileInputChange"
    />

    <!-- Profile Photo Lightbox (shared viewer) -->
    <ImagePreviewModal
      v-model="isPhotoLightboxOpen"
      :images="profilePhotoLightboxImages"
      :initial-index="0"
    />

    <!-- Share Profile Sheet -->
    <ShareProfileSheet
      v-model="isShareProfileOpen"
      :profile-url="profileShareUrl"
      :profile-title="shareProfileTitle"
      :profile-text="shareProfileText"
    />

    <!-- Badge Selector Drawer -->
    <div
      v-if="isBadgeSelectorOpen"
      class="badgeSelector-overlay"
      @click="closeBadgeSelector"
    >
      <q-card
        class="badgeSelector-drawer"
        :class="{ dragging: badgeIsDragging }"
        :style="{ height: badgeDrawerHeightStyle }"
        @click.stop
      >
        <q-card-section
          class="badgeSelector-header"
          @touchstart="onBadgeTouchStart"
          @touchmove="onBadgeTouchMove"
          @touchend="onBadgeTouchEnd"
          @mousedown="onBadgeMouseDown"
        >
          <div class="badgeSelector-handle"></div>
          <p class="badgeSelector-pullHint">Pull up to see all badges</p>
          <h3 class="badgeSelector-title">{{ t("selectBadgeToDisplay") }}</h3>
        </q-card-section>
        <q-card-section
          class="badgeSelector-content"
          :style="{ maxHeight: badgeSelectorMaxHeight }"
        >
          <BadgeSwiperComponent
            :opened-fully="badgeSelectorFullyOpened"
            @badge-selected="handleBadgeSelected"
          />
        </q-card-section>
        <q-card-section class="badgeSelector-footer">
          <p class="badgeSelector-description">{{ t("earnMoreBadges") }}</p>
          <q-btn
            class="badgeSelector-saveBtn"
            unelevated
            text-color="white"
            @click="saveBadge"
          >
            {{ t("saveBadge") }}
          </q-btn>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useI18n } from "vue-i18n";
import { getLocationLabel } from "src/utils/cityNames";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "src/stores/auth";
import { formatNumber } from "src/components/partials/FunctionsComponent.vue";
import ProfileActionsSheet from "src/components/profile/ProfileActionsSheet.vue";
import ShareProfileSheet from "src/components/profile/ShareProfileSheet.vue";
import BadgeSwiperComponent from "src/components/partials/BadgeSwiperComponent.vue";
import ImagePreviewModal from "src/components/common/ImagePreviewModal.vue";
import PageTitle from "src/components/ui/PageTitle.vue";
import axios from "axios";
import { api } from "src/boot/axios";
import { notifyError, notifyInfo, notifySuccess } from "src/utils/notify";
import { resolveProfileImageSrc } from "src/utils/avatar";

const { t, locale } = useI18n();

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const isProfileActionsOpen = ref(false);
const isPhotoLightboxOpen = ref(false);
const reopenProfileActionsAfterPhoto = ref(false);
const isShareProfileOpen = ref(false);
const isBadgeSelectorOpen = ref(false);
const isUploading = ref(false);
const profilePhotoFileInputRef = ref<HTMLInputElement | null>(null);
let profilePickerDiagCleanup: (() => void) | null = null;
const isProfileImageBroken = ref(false);
const avatarCacheBuster = ref<number>(0);
const selectedBadge = ref<{ image: string; title: string } | null>(null);
const tempSelectedBadge = ref<{ image: string; title: string } | null>(null);

const profileImageRaw = computed(() => authStore.user?.profile_picture ?? null);
const profileImageSrc = computed(() =>
  resolveProfileImageSrc(profileImageRaw.value, {
    cacheBuster: avatarCacheBuster.value || authStore.user?.updated_at || null
  })
);

const profilePhotoLightboxImages = computed(() => {
  if (profileImageSrc.value && !isProfileImageBroken.value) {
    return [profileImageSrc.value];
  }
  return [];
});

watch(profileImageSrc, () => {
  isProfileImageBroken.value = false;
});

const handleProfileImgError = () => {
  isProfileImageBroken.value = true;
  if (import.meta.env.DEV) {
    console.info("[DH-PROFILE-UPLOAD]", "img onerror", {
      reason: "img.onerror",
      rawValue: profileImageRaw.value,
      resolvedSrc: profileImageSrc.value ?? "(none)"
    });
  }
};

const handleProfileImgLoad = () => {
  if (import.meta.env.DEV) {
    console.info("[DH-PROFILE-UPLOAD]", "img onload", {
      resolvedSrc: profileImageSrc.value ?? "(none)"
    });
  }
};

if (import.meta.env.DEV) {
  watch(
    [profileImageRaw, profileImageSrc, isProfileImageBroken],
    ([raw, resolved, broken]) => {
      console.info("[DH-PROFILE-UPLOAD]", "render src", {
        rawValue: raw,
        src: resolved ?? "(none)",
        fallbackUsed: broken || !resolved
      });
    },
    { immediate: true }
  );
}

// Badge selector drag handlers (cumulative offset so drawer follows finger)
const badgeDragOffset = ref(0);
const badgeStartY = ref(0);
const badgeLastY = ref(0);
const badgeIsDragging = ref(false);
const badgeSelectorFullyOpened = ref(false);
const BADGE_DRAG_THRESHOLD = 60;
const BADGE_EXPAND_THRESHOLD = 80; // px upward drag to snap expanded

// Content area grows with drawer when dragging up (so pull-up is visible)
const BADGE_DRAWER_EXPANDED_VH = "90vh"; // high bottom sheet (~88–90% of viewport)

const badgeSelectorMaxHeight = computed(() => {
  if (badgeSelectorFullyOpened.value) {
    // Let flex + overflow handle scrolling in expanded state (no cap)
    return "none";
  }
  const off = badgeDragOffset.value;
  const pullUp = off < 0 ? -off : 0;
  return `min(${BADGE_DRAWER_EXPANDED_VH}, ${300 + pullUp}px)`;
});

// Drawer height: always anchored to bottom, expands upward (no translateY)
const badgeDrawerHeightStyle = computed(() => {
  const off = badgeDragOffset.value;
  if (badgeSelectorFullyOpened.value) {
    if (off <= 0) return BADGE_DRAWER_EXPANDED_VH;
    return `max(300px, calc(${BADGE_DRAWER_EXPANDED_VH} - ${off}px))`;
  }
  return `max(0px, calc(300px - ${off}px))`;
});

// Watch badge selector open/close to hide footer
watch(
  () => isBadgeSelectorOpen.value,
  (isOpen) => {
    if (isOpen) {
      document.body.classList.add("bottom-sheet-open");
    } else {
      document.body.classList.remove("bottom-sheet-open");
      badgeDragOffset.value = 0;
      badgeLastY.value = 0;
    }
  }
);

const onBadgeTouchStart = (e: TouchEvent) => {
  e.stopPropagation();
  const y = e.touches[0].clientY;
  badgeStartY.value = y;
  badgeLastY.value = y;
  badgeIsDragging.value = true;
};

const onBadgeTouchMove = (e: TouchEvent) => {
  if (!badgeIsDragging.value) return;
  e.preventDefault();
  e.stopPropagation();
  const currentY = e.touches[0].clientY;
  const deltaY = currentY - badgeLastY.value;
  badgeLastY.value = currentY;
  if (badgeSelectorFullyOpened.value) {
    if (deltaY > 0) {
      badgeDragOffset.value = Math.max(0, badgeDragOffset.value + deltaY);
    }
  } else {
    badgeDragOffset.value += deltaY;
    if (badgeDragOffset.value <= -BADGE_EXPAND_THRESHOLD) {
      badgeSelectorFullyOpened.value = true;
      badgeDragOffset.value = 0;
    } else if (badgeDragOffset.value > 0) {
      badgeDragOffset.value = Math.min(badgeDragOffset.value, 400);
    }
  }
};

const onBadgeTouchEnd = () => {
  if (!badgeIsDragging.value) return;
  badgeIsDragging.value = false;
  if (badgeDragOffset.value >= BADGE_DRAG_THRESHOLD) {
    closeBadgeSelector();
  } else if (!badgeSelectorFullyOpened.value) {
    badgeDragOffset.value = 0;
  } else {
    badgeDragOffset.value = 0;
  }
};

const onBadgeMouseDown = (e: MouseEvent) => {
  badgeStartY.value = e.clientY;
  badgeLastY.value = e.clientY;
  badgeIsDragging.value = true;
  document.addEventListener("mousemove", onBadgeMouseMove);
  document.addEventListener("mouseup", onBadgeMouseUp);
};

const onBadgeMouseMove = (e: MouseEvent) => {
  if (!badgeIsDragging.value) return;
  const currentY = e.clientY;
  const deltaY = currentY - badgeLastY.value;
  badgeLastY.value = currentY;
  if (badgeSelectorFullyOpened.value) {
    if (deltaY > 0) {
      badgeDragOffset.value = Math.max(0, badgeDragOffset.value + deltaY);
    }
  } else {
    badgeDragOffset.value += deltaY;
    if (badgeDragOffset.value <= -BADGE_EXPAND_THRESHOLD) {
      badgeSelectorFullyOpened.value = true;
      badgeDragOffset.value = 0;
    } else if (badgeDragOffset.value > 0) {
      badgeDragOffset.value = Math.min(badgeDragOffset.value, 400);
    }
  }
};

const onBadgeMouseUp = () => {
  if (!badgeIsDragging.value) return;
  badgeIsDragging.value = false;
  document.removeEventListener("mousemove", onBadgeMouseMove);
  document.removeEventListener("mouseup", onBadgeMouseUp);
  if (badgeDragOffset.value >= BADGE_DRAG_THRESHOLD) {
    closeBadgeSelector();
  } else if (!badgeSelectorFullyOpened.value) {
    badgeDragOffset.value = 0;
  } else {
    badgeDragOffset.value = 0;
  }
};

const profileShareUrl = computed(() => {
  const username = authStore.user?.username || "user";
  return `${window.location.origin}/u/${username}`;
});

const shareProfileTitle = computed(() => {
  return `${authStore.user?.username || "User"}'s Profile`;
});

const shareProfileText = computed(() => {
  return `Check out ${authStore.user?.username || "this user"}'s profile on dreamhubb`;
});

// Get current role from route name
const currentRole = computed(() => {
  const routeName = route.name?.toString() || "";
  return routeName.startsWith("donee") ? "donee" : "donor";
});

// Get user initials for avatar placeholder
const userInitials = computed(() => {
  const username = authStore.user?.username || "";
  if (!username) return "U";
  const parts = username.split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return username.substring(0, 2).toUpperCase();
});

// Display username
const displayUsername = computed(() => {
  return authStore.user?.username || "User";
});

// Display tokens - must match tokenBalance in DonorMainLayout
const displayTokens = computed(() => {
  const tokens = authStore.user?.tokens;
  if (tokens !== undefined && tokens !== null) {
    return formatNumber(tokens);
  }
  // Fallback to 30 to match DonorMainLayout tokenBalance fallback
  return formatNumber(30);
});

// Display bio
const displayBio = computed(() => {
  return authStore.user?.bio?.trim() || null;
});

// Display location - use unified helper function
const displayLocation = computed(() => {
  const user = authStore.user;
  if (!user) return null;

  // Use unified getLocationLabel helper for consistent location display
  const location = getLocationLabel(user, locale.value as string);
  return location || null;
});

// Navigate to settings
const goToSettings = () => {
  const routeName = route.name?.toString() || "";
  if (routeName.startsWith("donee")) {
    router.push({ name: "donee-settings" });
  } else {
    router.push({ name: "donor-settings" });
  }
};

// Open profile actions sheet
const openProfileActions = () => {
  isProfileActionsOpen.value = true;
};

// Handle view photo
const handleViewPhoto = () => {
  isProfileActionsOpen.value = false;
  if (profileImageSrc.value && !isProfileImageBroken.value) {
    reopenProfileActionsAfterPhoto.value = true;
    isPhotoLightboxOpen.value = true;
  } else {
    notifyInfo("common.info.profilePhotoNotSet", "Profile photo is not set yet.", { position: "top", timeout: 3000 });
  }
};

watch(isPhotoLightboxOpen, (open) => {
  if (open) return;
  if (!reopenProfileActionsAfterPhoto.value) return;
  reopenProfileActionsAfterPhoto.value = false;
  setTimeout(() => {
    isProfileActionsOpen.value = true;
  }, 300);
});

const logDhProfileUpload = (tag: string, payload: unknown) => {
  console.info("[DH-PROFILE-UPLOAD]", tag, payload);
};

/** JSON string pre konzolu (Xcode); pri veľkom tele osekne. */
function dhProfileUploadJsonPreview(data: unknown, maxLen = 6000): string {
  try {
    const s = typeof data === "string" ? data : JSON.stringify(data);
    return s.length > maxLen ? `${s.slice(0, maxLen)}…(truncated)` : s;
  } catch {
    return String(data);
  }
}

/** Pri 422 z backendu vypíše celý kontext (vždy, nie len DEV – viditeľné v Xcode). */
function logDhProfileUpload422Response(error: unknown) {
  if (!axios.isAxiosError(error) || error.response?.status !== 422) {
    return;
  }
  const res = error.response;
  const data = res.data as Record<string, unknown> | undefined;
  console.info("[DH-PROFILE-UPLOAD]", "response.422", {
    "response.status": res.status,
    "response.data": data,
    "response.dataPreview": data !== undefined ? dhProfileUploadJsonPreview(data) : undefined,
    "response.data.errors": data?.errors,
    "response.data.code": data?.code,
    "response.data.max_image_upload_kb": data?.max_image_upload_kb,
    "response.data.message": data?.message,
    "response.data.status": data?.status
  });
}

const pickedKind = (x: unknown): string => {
  if (x === undefined) return "undefined";
  if (x === null) return "null";
  if (typeof x === "string") return "string";
  if (typeof File !== "undefined" && x instanceof File) return "File";
  if (x instanceof Blob) return "Blob";
  if (typeof x === "object") return "object";
  return typeof x;
};

const serializablePickedRaw = (x: unknown): unknown => {
  if (typeof File !== "undefined" && x instanceof File) {
    return {
      kind: "File",
      name: x.name,
      size: x.size,
      type: x.type,
      lastModified: x.lastModified
    };
  }
  if (x instanceof Blob) {
    return { kind: "Blob", size: x.size, type: x.type };
  }
  if (typeof x === "string") {
    return { kind: "string", length: x.length, head: x.slice(0, 100) };
  }
  if (x && typeof x === "object") {
    const o = x as Record<string, unknown>;
    return {
      kind: "object",
      keys: Object.keys(o),
      webPath:
        typeof o.webPath === "string" ? String(o.webPath).slice(0, 160) : undefined,
      path: typeof o.path === "string" ? String(o.path).slice(0, 160) : undefined,
      hasDataUrl: typeof o.dataUrl === "string"
    };
  }
  return { kind: "other", repr: String(x) };
};

/**
 * Vždy nový File s vlastným bufferom – na iOS/WKWebView sa vyhne „spotrebovanému“ File z prvého uploadu.
 * Ak picker vráti len path/webPath/dataUrl (objekt alebo reťazec), skonvertuje cez fetch → Blob.
 */
const ensureProfileUploadFile = async (picked: unknown): Promise<File> => {
  if (typeof File !== "undefined" && picked instanceof File) {
    const ab = await picked.arrayBuffer();
    const name = picked.name?.length ? picked.name : "profile.jpg";
    const type = picked.type?.length ? picked.type : "image/jpeg";
    return new File([ab], name, { type });
  }
  if (picked instanceof Blob) {
    const ab = await picked.arrayBuffer();
    const type = picked.type?.length ? picked.type : "image/jpeg";
    return new File([ab], "profile.jpg", { type });
  }
  if (typeof picked === "string" && picked.length > 0) {
    const res = await fetch(picked);
    const blob = await res.blob();
    const ab = await blob.arrayBuffer();
    const type = blob.type?.length ? blob.type : "image/jpeg";
    return new File([ab], "profile.jpg", { type });
  }
  if (picked && typeof picked === "object") {
    const o = picked as { webPath?: unknown; path?: unknown; dataUrl?: unknown };
    if (typeof o.dataUrl === "string" && o.dataUrl.length > 0) {
      return ensureProfileUploadFile(o.dataUrl);
    }
    if (typeof o.webPath === "string" && o.webPath.length > 0) {
      return ensureProfileUploadFile(o.webPath);
    }
    if (typeof o.path === "string" && o.path.length > 0) {
      const p = o.path;
      if (/^https?:\/\//i.test(p) || p.startsWith("blob:") || p.startsWith("data:")) {
        return ensureProfileUploadFile(p);
      }
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (Capacitor.isNativePlatform()) {
          const clean = p.replace(/^file:\/\//, "");
          return ensureProfileUploadFile(Capacitor.convertFileSrc(clean));
        }
      } catch {
        // fall through
      }
      const fileUrl = p.startsWith("file:") ? p : `file://${p}`;
      return ensureProfileUploadFile(fileUrl);
    }
  }
  throw new Error("Invalid profile photo selection – no usable file or URL.");
};

function attachProfilePickerReturnDiagnostics() {
  profilePickerDiagCleanup?.();
  const onVis = () => {
    logDhProfileUpload("picker.diag.visibility", {
      visibilityState: document.visibilityState,
      filesLength: profilePhotoFileInputRef.value?.files?.length ?? null
    });
  };
  const onFocus = () => {
    logDhProfileUpload("picker.diag.windowFocus", {
      filesLength: profilePhotoFileInputRef.value?.files?.length ?? null
    });
  };
  document.addEventListener("visibilitychange", onVis);
  window.addEventListener("focus", onFocus, true);
  const t = window.setTimeout(() => {
    document.removeEventListener("visibilitychange", onVis);
    window.removeEventListener("focus", onFocus, true);
  }, 120_000);
  profilePickerDiagCleanup = () => {
    window.clearTimeout(t);
    document.removeEventListener("visibilitychange", onVis);
    window.removeEventListener("focus", onFocus, true);
    profilePickerDiagCleanup = null;
  };
}

// Handle change photo — iOS: .click() musí ísť v tom istom stacku ako tap; sheet zatvoríme až po click()
const handleChangePhoto = () => {
  console.info("[DH-PROFILE-UPLOAD]", "ACTIVE_HANDLER_REACHED", {
    stage: "ProfileContent.handleChangePhoto",
    component: "ProfileContent.vue"
  });

  const input = profilePhotoFileInputRef.value;
  logDhProfileUpload("picker.beforeClick", {
    hasInputRef: Boolean(input),
    id: input?.id ?? "(no id)"
  });

  if (!input) {
    logDhProfileUpload("picker.fail", { reason: "missing profilePhotoFileInputRef" });
    notifyError({
      kind: "server",
      messageKey: "common.errors.server",
      fallbackMessage: "Failed to open photo picker.",
      retryable: true
    }, { position: "top", timeout: 3000 });
    return;
  }

  input.value = "";
  attachProfilePickerReturnDiagnostics();

  logDhProfileUpload("picker.immediateBeforeProgrammaticClick", { ts: Date.now() });
  input.click();
  logDhProfileUpload("picker.immediateAfterProgrammaticClick", { ts: Date.now() });

  queueMicrotask(() => {
    logDhProfileUpload("picker.afterClick.queueMicrotask", {
      filesLength: input.files?.length ?? null
    });
  });
  window.setTimeout(() => {
    logDhProfileUpload("picker.afterClick.setTimeout0ms", {
      filesLength: input.files?.length ?? null
    });
  }, 0);

  isProfileActionsOpen.value = false;
};

async function onProfilePhotoFileInputChange(e: Event) {
  const target = e.target as HTMLInputElement;

  logDhProfileUpload("picker.onchange.entry", {
    filesLength: target.files?.length ?? 0,
    fileItemNames:
      target.files && target.files.length
        ? Array.from(target.files).map((f) => f.name)
        : []
  });

  const rawPick = target.files?.[0] ?? null;

  logDhProfileUpload("picked.raw", { raw: serializablePickedRaw(rawPick) });
  logDhProfileUpload("picked.kind", { kind: pickedKind(rawPick) });

  if (!rawPick) {
    logDhProfileUpload("picker.cancelOrEmptyFiles", {
      filesLength: target.files?.length ?? 0,
      note: "Žiadny súbor — používateľ zrušil alebo prázdny výber."
    });
    target.value = "";
    return;
  }

  let uploadFile: File;
  try {
    uploadFile = await ensureProfileUploadFile(rawPick);
  } catch (normErr) {
    logDhProfileUpload("normalize.fail", {
      message: normErr instanceof Error ? normErr.message : String(normErr)
    });
    notifyError({
      kind: "server",
      messageKey: "common.errors.server",
      fallbackMessage: "Failed to prepare photo. Please try again.",
      retryable: true
    }, { position: "top", timeout: 3000 });
    target.value = "";
    return;
  }

  isUploading.value = true;
  const formKeys: string[] = [];
  const formDataProbe = new FormData();
  formDataProbe.append("file", uploadFile);
  for (const key of formDataProbe.keys()) formKeys.push(String(key));
  logDhProfileUpload("request.start", {
    name: uploadFile.name,
    type: uploadFile.type,
    size: uploadFile.size,
    formFieldNames: formKeys,
    endpoint: `${String(api.defaults.baseURL || "").replace(/\/$/, "")}/user/profile-picture`
  });

  try {
    logDhProfileUpload("formdata.file.meta", {
      name: uploadFile.name,
      type: uploadFile.type,
      size: uploadFile.size,
      isFile: uploadFile instanceof File,
      isBlob: uploadFile instanceof Blob
    });

    const formData = new FormData();
    formData.append("file", uploadFile, uploadFile.name);

    const response = await api.post("/user/profile-picture", formData, {
      transformRequest: [
        (data, headers) => {
          const h = headers as Record<string, unknown> & {
            get?: (n: string) => string | undefined;
          };
          let ct = "(unset)";
          try {
            if (typeof h.get === "function") {
              ct = h.get("Content-Type") ?? h.get("content-type") ?? "(unset)";
            } else {
              ct =
                (h["Content-Type"] as string) ||
                (h["content-type"] as string) ||
                "(unset)";
            }
          } catch {
            ct = "(error reading)";
          }
          logDhProfileUpload("request.isFormData", { isFormData: data instanceof FormData });
          logDhProfileUpload("request.headers", {
            ContentType: ct,
            hasAuthorization: Boolean(
              (typeof h.get === "function" && (h.get("Authorization") || h.get("authorization"))) ||
                h.Authorization ||
                h.authorization
            )
          });
          return data;
        }
      ]
    });
    if (import.meta.env.DEV) {
      console.info("[DH-PROFILE-UPLOAD]", "response.status", response.status);
      console.info("[DH-PROFILE-UPLOAD]", "response.body", response.data);
      console.info("[DH-PROFILE-UPLOAD]", "response.profile_picture", response.data?.profile_picture ?? response.data?.user?.profile_picture ?? null);
      console.info("[DH-PROFILE-UPLOAD]", "response.user", response.data?.user ?? null);
    }

    const backendUser = response.data?.user;
    const backendStatus = response.data?.status;
    if (response.status >= 200 && response.status < 300 && backendStatus === "success" && backendUser) {
      if (response.data.user) {
        if (authStore.user) {
          authStore.user.profile_picture = response.data.user.profile_picture;
          authStore.user.profile_picture_public_id = response.data.user.profile_picture_public_id;
        }
      }
      isProfileImageBroken.value = false;
      await authStore.fetchUser();
      if (import.meta.env.DEV) {
        console.info("[DH-PROFILE-UPLOAD]", "refreshed user raw", authStore.user ?? null);
      }
      const refreshedRaw = authStore.user?.profile_picture ?? null;
      avatarCacheBuster.value = Date.now();
      const finalSrc = resolveProfileImageSrc(refreshedRaw, {
        cacheBuster: avatarCacheBuster.value
      });

      if (import.meta.env.DEV) {
        console.info("[DH-PROFILE-UPLOAD]", "refreshed user.profile_picture", refreshedRaw);
        console.info("[DH-PROFILE-UPLOAD]", "authStore.avatarUrl", authStore.avatarUrl ?? null);
        console.info("[DH-PROFILE-UPLOAD]", "final resolved avatar src", finalSrc ?? "(none)");
      }

      if (!finalSrc) {
        throw new Error("Profile picture missing/invalid after refresh");
      }

      if (import.meta.env.DEV) {
        console.info("[DH-PROFILE-UPLOAD]", "request.success", {
          status: response.status,
          profile_picture: refreshedRaw
        });
      }

      notifySuccess("common.success.profilePictureUpdated", "Profile photo updated successfully", { position: "top", timeout: 3000 });
    } else {
      if (import.meta.env.DEV) {
        console.info("[DH-PROFILE-UPLOAD]", "request.fail", {
          reason: "unexpected response shape",
          status: response.status,
          body: response.data
        });
      }
      throw new Error("Invalid response from server");
    }
  } catch (error) {
    logDhProfileUpload422Response(error);
    const is422 = axios.isAxiosError(error) && error.response?.status === 422;
    if (import.meta.env.DEV && !is422) {
      console.info("[DH-PROFILE-UPLOAD]", "request.fail", {
        message: error instanceof Error ? error.message : String(error),
        status: axios.isAxiosError(error) ? error.response?.status : undefined,
        dataPreview: axios.isAxiosError(error)
          ? dhProfileUploadJsonPreview(error.response?.data)
          : undefined
      });
      console.debug("[ProfileContent] Failed to upload profile photo:", error);
    }
    notifyError({
      kind: "server",
      messageKey: "common.errors.server",
      fallbackMessage: "Failed to upload photo. Please try again.",
      retryable: true
    }, { position: "top", timeout: 3000 });
  } finally {
    isUploading.value = false;
    target.value = "";
    profilePickerDiagCleanup?.();
    profilePickerDiagCleanup = null;
  }
}

// Handle select badge
const handleSelectBadge = () => {
  isProfileActionsOpen.value = false;
  // Load saved badge if exists
  const savedBadge = localStorage.getItem("userSelectedBadge");
  if (savedBadge) {
    try {
      selectedBadge.value = JSON.parse(savedBadge);
    } catch (e) {
      // Ignore parse errors
    }
  }
  // Start expanded so the sheet is fully visible on open.
  badgeSelectorFullyOpened.value = true;
  badgeDragOffset.value = 0;
  isBadgeSelectorOpen.value = true;
};

const closeBadgeSelector = () => {
  isBadgeSelectorOpen.value = false;
  tempSelectedBadge.value = null;
  badgeSelectorFullyOpened.value = false;
  badgeDragOffset.value = 0;
};

const handleBadgeSelected = (badge: { image: string; title: string }) => {
  tempSelectedBadge.value = badge;
};

const saveBadge = async () => {
  if (tempSelectedBadge.value) {
    // Update selectedBadge immediately for UI feedback
    selectedBadge.value = { ...tempSelectedBadge.value };
    localStorage.setItem("userSelectedBadge", JSON.stringify(tempSelectedBadge.value));

    // Save to backend if possible
    try {
      // Try to find badge_id from badge data (if available)
      // For now, we'll save the badge image URL or key to a custom field
      // If BE supports badge_id, we can update this
      await api.put("/user/update", {
        selected_badge: tempSelectedBadge.value.image // or badge_id if available
      });
    } catch (error) {
      // If BE doesn't support selected_badge yet, just use localStorage
      if (import.meta.env.DEV) {
        console.debug("Failed to save badge to backend, using localStorage only:", error);
      }
    }

    closeBadgeSelector();
    notifySuccess("common.success.badgeSaved", "Badge saved successfully", { position: "top", timeout: 3000 });
  }
};

// Handle share profile
const handleShareProfile = () => {
  isProfileActionsOpen.value = false;
  isShareProfileOpen.value = true;
};

// Load saved badge on mount
const loadSavedBadge = () => {
  const savedBadge = localStorage.getItem("userSelectedBadge");
  if (savedBadge) {
    try {
      selectedBadge.value = JSON.parse(savedBadge);
    } catch (e) {
      // Ignore parse errors
    }
  }
};

// Fetch user data on mount if not loaded
onMounted(async () => {
  isProfileImageBroken.value = false;
  loadSavedBadge();
  if (authStore.isAuthenticated && !authStore.user) {
    try {
      await authStore.fetchUser();
    } catch (error) {
      // ignore
    }
  }
});

onBeforeUnmount(() => {
  profilePickerDiagCleanup?.();
  profilePickerDiagCleanup = null;
  document.removeEventListener("mousemove", onBadgeMouseMove);
  document.removeEventListener("mouseup", onBadgeMouseUp);
  document.body.classList.remove("bottom-sheet-open");
});
</script>
<style scoped lang="scss">
.myProfile {
  position: relative;
  padding: 2rem 1rem;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Skrytý file input ostáva v DOM pre spoľahlivý iOS/WKWebView picker (nie createElement). */
.myProfile-hiddenFileInput {
  position: absolute;
  width: 1px;
  height: 1px;
  left: 0;
  top: 0;
  opacity: 0.01;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

.myProfile-header {
  width: 100%;
  max-width: 400px;
  text-align: center;
  margin-bottom: 2rem;
}

.myProfile-avatarContainer {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
}

.myProfile-avatarWrapper {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto;
}

.myProfile-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(102deg, #ff006e, #ff8c00);
  display: flex;
  align-items: center;
  justify-content: center;
}

.myProfile-avatarInitials {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  font-family: poppinsSemiBold;
}

.myProfile-avatarImg {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
}

.myProfile-avatarBadge {
  position: absolute;
  bottom: -16px; // Half of badge height (32px / 2) to show half below avatar
  left: 50%;
  transform: translateX(-50%);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid #1a1a1a;
  background: #1a1a1a;
  object-fit: contain;
  z-index: 10;
}

.myProfile-info {
  color: white;
}

.myProfile-username {
  font-size: 1.8rem;
  font-weight: 700;
  font-family: poppinsSemiBold;
  margin-bottom: 0.5rem;
  color: white;
}

.myProfile-location {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 1rem;
  font-family: poppins;
}

.myProfile-tokens,
.myProfile-role {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-family: poppins;
}

.myProfile-tokensLabel,
.myProfile-roleLabel {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
}

.myProfile-tokensValue,
.myProfile-roleValue {
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
}

.myProfile-bioSection {
  margin-top: 1.5rem;
  padding-top: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: left;
  width: 100%;
}

.myProfile-bio {
  font-size: 0.95rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-family: poppins;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.myProfile-actions {
  width: 100%;
  max-width: 400px;
  margin-top: 2rem;
  margin-bottom: 1.5rem;
}

.myProfile-settingsBtn {
  width: 100%;
  height: 56px;
  background: linear-gradient(102deg, #ff006e, #ff8c00);
  color: white;
  border-radius: 9999px;
  font-size: 1rem;
  font-weight: 700;
  font-family: montseraatSemiBold;
  text-transform: none;
  box-shadow: 0 18px 40px rgba(255, 0, 110, 0.35);
}

// Badge selector drawer styles
.badgeSelector-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  z-index: 10002; // Above all other sheets
  display: flex;
  align-items: flex-end;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}

.badgeSelector-drawer {
  width: 100%;
  max-width: 600px;
  background: linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%);
  border-radius: 24px 24px 0 0;
  min-height: 0;
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  animation: slideUp 0.3s ease-out;

  &:active {
    cursor: grabbing;
  }

  // Remove transition during drag for real-time tracking
  &.dragging {
    transition: none;
  }

  // Add transition only when not dragging (height changes)
  &:not(.dragging) {
    transition: height 0.2s ease-out;
  }
}

.badgeSelector-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  flex-shrink: 0;
  touch-action: none;
  user-select: none;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
}

.badgeSelector-handle {
  width: 40px;
  height: 4px;
  background: rgba(255, 255, 255, 0.55);
  border-radius: 2px;
  margin: 0 auto 0.5rem;
  cursor: grab;
  touch-action: none;
}

.badgeSelector-pullHint {
  color: rgba(255, 255, 255, 0.78);
  font-size: 0.75rem;
  text-align: center;
  margin: 0 0 0.75rem;
  font-family: poppins;
}

.badgeSelector-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #fff;
  margin: 0 auto;
  font-family: poppinsSemiBold;
  text-align: center;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  padding-left: 0;
  padding-right: 0;
}

.badgeSelector-header .q-btn {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  color: white;
}

.badgeSelector-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
  overscroll-behavior: contain;
  padding: 1rem;
  transition: max-height 0.3s ease-out;

  :deep(.badges-column) {
    overflow: visible;
    max-height: none;
  }
}

.badgeSelector-footer {
  padding: 1.5rem;
  padding-bottom: calc(1.5rem + env(safe-area-inset-bottom, 0px));
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.badgeSelector-description {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin-bottom: 1rem;
  font-family: poppins;
}

.badgeSelector-saveBtn {
  width: 100%;
  height: 3.3rem;
  background-color: rgba(182, 0, 67, 1);
  color: white;
  border: none;
  font-size: 1.2rem;
  border-radius: 0.5rem;
  font-family: montseraatSemiBold;
  text-transform: none;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(182, 0, 67, 0.9);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
</style>

<style lang="scss">
/* Dark app: „okienka“ okolo odznakov — rovnaký padding/radius ako light sheet, tmavšia plocha + jemný lift */
body:not(.body--light) .badgeSelector-drawer .badgeIconDiv {
  padding: 0.45rem 0.35rem 0.25rem;
  border-radius: 0.9rem;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.14),
    0 4px 18px rgba(0, 0, 0, 0.45);
}

body:not(.body--light) .badgeSelector-drawer .badgeIconImg {
  filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.55));
}
</style>
