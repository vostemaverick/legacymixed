# Firebase Functions

The `removeMember` callable function permanently deletes a selected student's
or non-administrator staff member's Firebase Authentication account and
Firestore profile. It checks the caller's staff profile and admin/principal
role on the server. It does not delete submitted schemes, results, or notices.

Deploy from the repository root after installing the Firebase CLI and signing
in to an account with permission to deploy to the `legacy-secondary` project:

```sh
cd functions
npm install
cd ..
firebase deploy --only functions
```

Cloud Functions deployment requires the Firebase project to have billing and
the required Google Cloud APIs enabled. The admin portal's Remove buttons will
work after `removeMember` has been deployed.
