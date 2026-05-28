# Web Payments API – Laravel contract

Frontend calls these endpoints to create checkout sessions. Backend creates Stripe Checkout Session or PayPal order and returns the URL for redirect.

Base path: same as other API (e.g. `VITE_API_BASE` = `http://localhost:8000/api`). All requests use `Content-Type: application/json`, `Accept: application/json`, and Bearer token when user is authenticated.

---

## 1. Stripe Checkout Session

**Endpoint:** `POST /payments/stripe/session`

**Request body:** (same shape as `StripeWebCheckoutPayload`)

```json
{
  "packageId": "tokens_100",
  "provider": "web",
  "platform": "web",
  "webSku": "tokens_100",
  "selectedMethod": "card",
  "tokenAmount": 100,
  "price": 1.99,
  "currency": "EUR"
}
```

- `selectedMethod` is one of: `"card"`, `"apple_pay"`, `"google_pay"`.
- `webSku` must match your Stripe Price/Product IDs.

**Success response:** `200 OK`

```json
{
  "checkoutUrl": "https://checkout.stripe.com/c/pay/cs_...",
  "provider": "stripe"
}
```

- `checkoutUrl` – redirect the user here to complete payment. After payment, Stripe can redirect back to your success/cancel URLs (configured when creating the session).

**Error response:** `4xx` or `5xx`

- Body may contain `message` or Laravel validation/error format. FE will show a generic "Something went wrong" or the backend `message` if present.

---

## 2. PayPal Order

**Endpoint:** `POST /payments/paypal/order`

**Request body:** (same shape as `PayPalWebCheckoutPayload`)

```json
{
  "packageId": "tokens_100",
  "provider": "web",
  "platform": "web",
  "webSku": "tokens_100",
  "selectedMethod": "paypal",
  "tokenAmount": 100,
  "price": 1.99,
  "currency": "EUR"
}
```

**Success response:** `200 OK`

```json
{
  "checkoutUrl": "https://www.sandbox.paypal.com/checkoutnow?token=...",
  "provider": "paypal"
}
```

- `checkoutUrl` – redirect the user here to complete PayPal payment.

**Error response:** `4xx` or `5xx`

- Body may contain `message` or Laravel validation/error format.

---

## Summary

| Endpoint                      | Request payload                        | Success response              |
|-----------------------------|----------------------------------------|-------------------------------|
| `POST /payments/stripe/session` | StripeWebCheckoutPayload (see above) | `{ checkoutUrl, provider: "stripe" }` |
| `POST /payments/paypal/order`   | PayPalWebCheckoutPayload (see above) | `{ checkoutUrl, provider: "paypal" }` |

FE behaviour: on success with `checkoutUrl`, the frontend redirects the user to `checkoutUrl`. On error, it shows an error toast and does not redirect.
