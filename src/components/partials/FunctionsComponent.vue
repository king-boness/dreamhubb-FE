<script lang="ts">
import { ref } from "vue";

export const tab = ref();
export function formatNumber(num: number): string {
  if (num < 1000) {
    return num.toString();
  } else if (num < 1000000) {
    return (num / 1000).toFixed(1) + "K";
  } else if (num < 1000000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else {
    return (num / 1000000000).toFixed(1) + "B";
  }
}

export function maskEmail(input: string): string {
  if (input.length < 4) {
    return input;
  }

  const asterisks = "*".repeat(4);
  const replaced = asterisks + input.slice(4);

  return replaced;
}
</script>
