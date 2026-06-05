import { useRouter } from "vue-router";

export function useLegalPageBack() {
  const router = useRouter();

  function goBack() {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    void router.push({ name: "auth-welcome-page" });
  }

  return { goBack };
}
