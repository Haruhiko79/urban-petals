# Urban Petals frontend API contract

This document describes the future API expected by the mobile frontend. **No backend, database migration, or payment integration is implemented by this change.** The existing PHP files are unchanged and do not yet implement this contract.

Set `apiUrl` in both `src/environments/environment.ts` and `environment.prod.ts` to your API base URL, for example `https://your-store.example/api`. An empty URL deliberately prevents requests and displays the existing collection as a labeled browsing preview. Preview products have unknown (`null`) stock and cannot be ordered. Preview bags use a separate storage key so their IDs never enter the live catalog. Never add database passwords or private payment keys to Angular environment files: they are included in the app bundle.

Requests use JSON and `Authorization: Bearer <token>` after sign-in; cookies are omitted. Support CORS for the actual web and Capacitor origins (normally `https://localhost` on Android and `capacitor://localhost` on iOS), including preflight for Content-Type and Authorization. Use HTTPS in deployed apps.

## Endpoints

| Method | Path | Request | Successful response |
| --- | --- | --- | --- |
| POST | `/auth/register` | `{name, phone, email, password}` | `{token, user}` |
| POST | `/auth/login` | `{email, password}` (name/phone may also be empty) | `{token, user}` |
| GET | `/auth/me` | — | `{user}` |
| POST | `/auth/logout` | — | `{success: true}` |
| PATCH | `/profile` | `{name, phone, imageUrl}` | `{user}` |
| GET | `/products` | — | `{products: Product[]}` |
| POST | `/orders` | See below | `{order}` |
| GET | `/orders` | — | `{orders: Order[]}` for the authenticated customer only |
| POST | `/contact` | `{firstName, lastName, email, phone, subject, message}` | `{success: true}` only after accepting the message |

Return a non-2xx status and `{ "error": "User-readable explanation" }` on failure. A 401 invalidates the frontend session. Use 409 for stock or price conflicts and 422 for invalid fields. Do not return a successful status for rejected orders.

`User`: `{id: number, name: string, email: string, phone: string, imageUrl: string}`. The profile picker crops images to 256 × 256 and sends a JPEG data URL. Return the saved photo as a data URL or HTTPS URL. The backend must validate image content, size and dimensions; frontend validation is only a convenience.

`Product`: `{id: number, name: string, group: string, category: string, price: number, stock: number, image: string, description: string}`. Group is one of `Plants`, `Flowers`, `Tools`, `Pots`, `Fertilizers`; prices are PHP amounts and stock is a nonnegative integer. IDs must be stable database IDs. Images must be HTTPS URLs (empty images use the bundled brand icon).

`Order`: `{id: string, currency: "PHP", total: number, status: string, createdAt: string, address: string, payment: string, items: [{name: string, qty: number, price: number}]}`. Dates should be ISO 8601 with a timezone. Statuses such as `pending`, `approved`, `in-transit`, `delivered`, `cancelled`, `rejected` are displayed directly. `price` is the unit price. Return the amount and delivery address actually accepted by the server.

Order request:

```json
{
  "requestKey": "a-client-generated-UUID",
  "name": "Recipient name",
  "phone": "09123456789",
  "address": "House, street, barangay, city, province, ZIP",
  "currency": "PHP",
  "payment": "Cash on Delivery",
  "items": [{"id": 7, "qty": 2, "price": 199.95}]
}
```

All catalog, bag, receipt and order amounts display as `₱1,234.50`. Order requests explicitly include `currency: "PHP"`; order responses must also include it. Other currencies are rejected rather than mislabeled. `/orders` opens the dedicated customer My Orders screen.

The frontend currently supports cash on delivery with no separate delivery charge. Confirm the store's delivery policy before enabling checkout. Online card/GCash payments require a separate provider integration and verified server callbacks.

## Required server behavior before enabling real transactions

- Hash passwords on the server, validate inputs, rate-limit authentication, issue expiring sessions, and revoke tokens on sign-out. Never trust a profile stored by the client as authentication.
- Authorize every profile and order operation using the token. Derive the customer ID/email from the session, not request fields. Return only that customer's orders.
- Look up IDs in the real catalog and calculate prices on the server. Reject changed prices or unavailable quantities so the customer can review them.
- Persist the order and reserve/decrement inventory atomically. Stock cannot go negative under concurrent checkouts.
- Enforce a unique `(customer, requestKey)` and return the original order on retries without decrementing stock again. The frontend retains this key across reloads when local storage is available. Check idempotency before revalidating stock for a previously accepted order.
- Return errors without exposing database or infrastructure details.

## Frontend persistence and limits

The session token is kept in sessionStorage (or memory when storage is unavailable), and the profile is loaded from `/auth/me`. Passwords are never saved by the app. Reopening a closed browser session requires sign-in. Native secure token storage is not implemented.

The bag stores product IDs and quantities in `urban-petals.bag.v2`. Old demo bag IDs are intentionally not imported because they may refer to different live products. Failed requests preserve the bag. A successful response must contain an order ID, finite total and item list before the bag is cleared. The retry key and item fingerprint contain no delivery details. Signing out clears the shared device bag.

Profile and order UI states are tested with mocked API responses. These tests establish the frontend behavior, not authentication security or database correctness. Before launch, test registration, duplicate emails, incorrect passwords, expired tokens, profile persistence, stock conflicts, concurrent/retried checkout, and customer isolation against the actual backend.

## Example order response

Use this shape for `POST /orders`. `GET /orders` returns the same objects inside an `orders` array. Values below are illustrative contract data, not records created by the app.

```json
{
  "order": {
    "id": "UP-2026-0001",
    "currency": "PHP",
    "total": 1234.50,
    "status": "pending",
    "createdAt": "2026-10-11T08:00:00+08:00",
    "address": "Recipient's complete delivery address",
    "payment": "Cash on Delivery",
    "items": [{"name": "Plant", "qty": 2, "price": 617.25}]
  }
}
```
