# Urban Petals mobile app

Ionic Angular customer storefront, prepared for a future database-backed API. Backend implementation is intentionally excluded; the original `urban-petals/` PHP project is unchanged.

The frontend includes:

- Branded web startup screen and native Capacitor splash handling.
- Side menu showing the signed-in customer's photo, name and phone number.
- Validated registration/sign-in forms, session restoration, profile editing and photo selection.
- Responsive collection carousel with automatic rotation, swipe, arrows, dots, keyboard controls, pause and reduced-motion support.
- API-driven catalog, category filtering, search, bag quantities and availability checks.
- Cash-on-delivery checkout UI, safe retry keys, confirmed order receipt and a dedicated My Orders screen. Amounts display as Philippine pesos (₱), and order payloads explicitly use PHP.
- Loading, empty, error and unavailable-service states. No fake authentication or checkout success.

## Run

```sh
npm ci
npm start
```

Home opens at `/`; `/profile` opens Account, `/orders` opens My Orders, and `/checkout` opens Bag. Existing category URLs remain supported.

## Connect a backend later

`apiUrl` is intentionally empty in `src/environments/environment.ts` and `environment.prod.ts`. Fill it with the future HTTPS API base URL when ready. Until connected, the existing products remain available as a labeled browsing preview; authentication and order submission are unavailable. Preview bags are kept separate from live inventory IDs.

See [the frontend API contract](docs/FRONTEND_API.md) for endpoints, payloads, profile photo handling, sessions and checkout requirements. The existing PHP API is not compatible with this new contract without future backend work. No database credentials belong in the app.

Contact now submits to the future `/contact` endpoint and confirms success only on server acknowledgement. Placeholder contact details and fabricated admin totals were removed; administration shows an unavailable state until implemented. The inactive newsletter demo and nonfunctional article buttons were removed. The mobile app's catalog must use real database IDs before real orders are enabled; old demo bags are not imported.

## Android

The native project already exists; do not run `cap add android` again. With the Android SDK and Java 21 installed:

```sh
npm run android:sync
npm run android:open
# Or build a debug APK:
npm run android:apk
```

The API URL must be reachable from the phone; the phone's localhost is not your computer. Configure HTTPS and the actual Capacitor origin on the future server. The native splash is hidden once the Ionic platform and first frame are ready, independently of network requests, following [Capacitor's splash lifecycle](https://capacitorjs.com/docs/apis/splash-screen).

## Checks

```sh
npm test -- --watch=false
npm run lint
npm run build
```

Tests cover bag persistence/quantities, stock restrictions, checkout failures and retry keys, authentication responses, expired sessions, and carousel behavior using mocked API responses. Angular's disk cache remains disabled because of the existing local native LMDB issue.

The development preview server cannot bind a port in the current sandbox (`listen EPERM`), so browser visual checks are not verified here. Device checks and real API/database/payment tests are still needed before release. Existing Browserslist and stylesheet budget warnings do not prevent a production build.
