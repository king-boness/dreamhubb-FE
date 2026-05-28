/**
 * Web payments API – contract for Laravel endpoints.
 * See docs/PAYMENTS_API.md for full request/response specification.
 */

/** Success response when backend creates a checkout session and returns redirect URL. */
export interface PaymentSessionSuccessResponse {
  checkoutUrl: string;
  provider: "stripe" | "paypal";
}

/** Error response body (backend may return message or Laravel error format). */
export interface PaymentSessionErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}
