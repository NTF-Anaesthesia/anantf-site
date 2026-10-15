# Setting up the Baby MO test's shared storage

Until you do this, the test page runs in local-only mode (everything stays in the browser it was typed in). These steps
create the Firebase project that holds the settings, the MOs' logins and their results (the questions are in `qbank/`). Allow about 20 minutes.
Do them once, signed in to Google as the account that should own the project.

## A. Create the project

1. Go to https://console.firebase.google.com and click **Create a project**.
2. Name it `ntf-mo-portal` (if Firebase says the id is taken, accept the id it suggests and tell Claude). Click Continue.
3. Turn **Google Analytics off**. Click **Create project**, then Continue.

## B. Turn on the two sign-in methods

1. In the left menu choose **Build > Authentication**, then **Get started**.
2. On the **Sign-in method** tab click **Google**. Switch it **Enable**, pick your email as the support email, **Save**.
3. Click **Add new provider**, choose **Anonymous**, switch it **Enable**, **Save**. (MOs use this: they never need a
   Google account. They are let in by the passphrase, not by this.)
4. Open the **Settings** tab, then **Authorized domains**. Click **Add domain** and add `anantf.com`, then add
   `www.anantf.com` the same way. (`localhost` and the project's own domains are already there.)

## C. Create the database

1. In the left menu choose **Build > Firestore Database**, then **Create database**.
2. Location: choose **asia-southeast1 (Singapore)**. This cannot be changed later. Click Next.
3. Choose **Start in production mode** and **Create**. (The real rules come later, in step F.)

## D. Connect the web page to the project

1. Click the gear next to **Project Overview**, then **Project settings**.
2. Under **Your apps** click the **</>** (web) icon. App nickname: `babymo`. Leave "Firebase Hosting" unticked.
   Click **Register app**.
3. Copy the block that looks like `const firebaseConfig = { apiKey: "...", authDomain: "...", ... }`.
4. Open `babymo/js/firebase-config.js` and paste the values into the matching lines (apiKey, authDomain, projectId,
   storageBucket, messagingSenderId, appId). Keep the quotes. These values are public by design; commit them.
   Or just send the block to Claude and ask it to do this.

## E. Create the first records by hand

The rules below are not live yet, but the console always works, so you create the first records there.

1. In **Firestore Database > Data** click **Start collection**. Collection id: `config`. Document id: `access`.
   Add a field `passphrase`, type **string**, value: the shared passphrase for the MOs (at least 4 characters, easy to
   say aloud, e.g. three plain words). Save.
2. Click **Start collection** again. Collection id: `members`. Document id: **your own Google email, all lower case**
   (for example `you@gmail.com`). Add two **string** fields: `role` = `admin` and `name` = your name. Save.

Only this first admin is created by hand. Every other faculty member signs in with Google in the app and taps
"Ask for faculty access"; any current faculty member (editor or admin) then approves or declines the request in the
app's People tab. (An admin can still add someone directly in People, and changes the passphrase in Settings.) Changing the
passphrase signs every MO out until they enter the new one: do it when a new cohort starts.

## F. Put the rules live

The access rules are in `babymo/firestore.rules`. Until they are published the database is in "production mode" and
refuses everyone, so the test cannot be used.

1. Open `babymo/firestore.rules` on GitHub and copy the whole file.
2. In the Firebase console go to **Build > Firestore Database > Rules**, select everything in the box, paste, and
   click **Publish**.
3. Whenever that file changes later, repeat steps 1 and 2 (Claude will tell you when a change needs it). Do not edit
   the rules in the console by hand.

## G. Check it works

1. Open `https://anantf.com/babymo/` in a private window, enter a name and the passphrase: you should reach the test.
2. A wrong passphrase should be refused with a clear message.
3. In another window sign in as faculty with Google: you should see the Results, Paper, People and Settings tabs.

## Notes

- Costs: the free Spark plan is plenty for a few dozen MOs.
- Faculty who can read the Sessions list can see the current passphrase (it is stored in each login). That is accepted;
  the passphrase is a shared door code, not a secret.
- The questions are not in Firebase: they come from the question bank (`qbank/`) in this repo.
- Old projects (before 15 Oct 2026) may still hold a `questions` collection and a `config/topics` document from when
  questions were edited in the app. The rules now close both; delete them in Firestore (Data tab: the `questions`
  collection's ⋮ menu → Delete collection; `config` → `topics` → Delete document). Results are not affected.
