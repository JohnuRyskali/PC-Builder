# PC Builder

## Firebase setup

1. In the Firebase console, enable the Authentication providers used by the app and create a Cloud Firestore database.
2. Copy `.env.example` to `.env.local` and fill in the web app configuration from Firebase Project settings.
3. Select your Firebase project in the Firebase CLI (`firebase use --add`) and deploy `firestore.rules` (`firebase deploy --only firestore:rules`), or copy the rules into the Firestore Rules tab in the console.

Builds and custom hardware are stored under the signed-in user's UID in Firestore. Existing build and custom hardware values in local storage are imported once when that user's Firestore data is first initialized. Signed-out users can create an in-memory build, but it is not persisted.

Start the app with `npm run dev`.
