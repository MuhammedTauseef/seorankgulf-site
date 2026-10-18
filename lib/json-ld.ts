/**
 * Safely serialize data for <script type="application/ld+json">.
 * Escapes `<` to prevent `</script>` breakout from admin-editable content.
 */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
