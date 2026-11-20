# PC Builder

## Firebase setup

1. In the Firebase console, enable the Authentication providers used by the app and create a Cloud Firestore database.
2. Copy `.env.example` to `.env.local` and fill in the web app configuration from Firebase Project settings.
3. Select your Firebase project in the Firebase CLI (`firebase use --add`) and deploy `firestore.rules` (`firebase deploy --only firestore:rules`), or copy the rules into the Firestore Rules tab in the console.

Builds and custom hardware are stored under the signed-in user's UID in Firestore. Existing build and custom hardware values in local storage are imported once when that user's Firestore data is first initialized. Signed-out users can create an in-memory build, but it is not persisted.

Start the app with `npm run dev`.

## PWA support

The production build is an installable PWA. Its manifest and square 192px/512px icons are in `public/`; the service worker precaches the built app shell and all route chunks. Static assets use cache-first behavior. The generated public catalog list/detail endpoints use network-first caching, limited to 50 entries with a seven-day expiry. Firebase authentication, custom hardware, and other private user data are never added to the shared service-worker cache.

The app exposes `/offline` and a connection indicator. Previously fetched public catalog data remains available offline, and catalog/dashboard/detail views identify when they are showing cached data. A waiting service-worker update is announced in the app and only activated after the user selects **Update now**.

The current PC build is also saved locally in a per-user browser record. Signed-in users can keep editing it offline; pending changes are sent to Firestore when the connection returns or the app is opened online. Guest builds stay on the current device and are not synced to an account.

Test a production-like build (service workers are disabled in Vite development):

1. Run `npm run build`, then `npm run preview`.
2. Open `http://localhost:4173/PC-Builder/` and visit the catalog and at least one component detail while online.
3. In DevTools → Application, verify the manifest and active service worker. In Network, switch to Offline and reload; the app shell and visited public data should remain available. Change a component in the build and confirm the banner says it is saved locally; restore the network and confirm the build syncs to the signed-in account.
4. Visit `/PC-Builder/offline` to test the dedicated offline screen. Restore the network and verify the status changes and retry works.
5. To test updates, publish/build a changed version, reload the current app until the “new version” notice appears, and select **Update now**.

Use the configured GitHub Pages deployment (`npm run deploy`) after a production build. Firebase-backed operations still require a connection.