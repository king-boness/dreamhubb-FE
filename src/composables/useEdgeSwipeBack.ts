import { onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";

export function useEdgeSwipeBack() {
  const router = useRouter();

  let startX = 0;
  let startY = 0;
  let isEdge = false;

  const onTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    // napr. 20px od ľavého okraja
    isEdge = startX < 20;
  };

  const onTouchMove = (e: TouchEvent) => {
    if (!isEdge) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - startX;
    const deltaY = Math.abs(touch.clientY - startY);

    // horizontálne gesto, aspoň ~60px doprava, nie príliš šikmo
    if (deltaX > 60 && deltaY < 40) {
      isEdge = false;
      router.back();
    }
  };

  const onTouchEnd = () => {
    isEdge = false;
  };

  onMounted(() => {
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
  });

  onBeforeUnmount(() => {
    window.removeEventListener("touchstart", onTouchStart);
    window.removeEventListener("touchmove", onTouchMove);
    window.removeEventListener("touchend", onTouchEnd);
  });
}
