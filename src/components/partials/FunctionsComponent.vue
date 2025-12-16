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
  if (!input || input.length === 0) {
    return "";
  }

  // If email is too short, return as is
  if (input.length < 3) {
    return input;
  }

  // Check if input contains @ (email format)
  const atIndex = input.indexOf("@");

  if (atIndex === -1) {
    // Not a valid email format, just show first 3 chars + fixed asterisks
    return input.slice(0, 3) + "********";
  }

  // Extract parts before and after @
  const localPart = input.slice(0, atIndex);
  const domainPart = input.slice(atIndex + 1);

  // Show first 3 characters of local part
  const visibleChars = localPart.slice(0, 3);

  // Fixed number of asterisks (doesn't reveal actual length)
  const asterisks = "********";

  // Return: first 3 chars + fixed asterisks + @ + domain
  return visibleChars + asterisks + "@" + domainPart;
}
</script>
