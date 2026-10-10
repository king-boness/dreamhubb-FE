/**
 * Locale-aware short date for feed cards (display only; does not alter stored values).
 */
export function formatLocaleDate(
  dateString: string,
  locale?: string | null
): string {
  const d = new Date(dateString);
  const resolved =
    (locale && String(locale).trim()) ||
    (typeof navigator !== "undefined" ? navigator.language : "en-US");

  if (!Number.isNaN(d.getTime())) {
    try {
      return new Intl.DateTimeFormat(resolved, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      }).format(d);
    } catch {
      // fall through
    }
  }

  // Fallback: if already slash-separated MM/DD/YYYY-style, swap to DD/MM/YYYY
  const dateParts = dateString.split("/");
  if (dateParts.length === 3) {
    const [month, day, year] = dateParts;
    return `${day}/${month}/${year}`;
  }
  return dateString;
}
