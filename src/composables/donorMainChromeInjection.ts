import type { ComputedRef, InjectionKey, Ref } from "vue";

export type DonorMainChromeInject = {
  showNavbar: Ref<boolean>;
  isBodyLight: Ref<boolean>;
  tokenBalance: ComputedRef<number>;
  onRoleSwitchStart: () => void;
  onRoleSwitchEnd: () => void;
};

export const donorMainChromeKey: InjectionKey<DonorMainChromeInject> = Symbol("donorMainChrome");
