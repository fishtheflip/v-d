# Local catalog

`catalog.json` is the public Firestore catalog exported on 2026-11-10:
7 courses, 3 choreographies, 9 authors, 7 categories, 92 lessons.
All source fields are retained. `documentId` stores the Firestore document ID;
`id` retains the original application ID. No user records are exported.

The app reads this bundled snapshot through `src/lib/localCatalog.ts`.
It does not fetch the catalog from Firebase or use old localStorage caches.
Firebase Auth and user profile writes remain unchanged.

Edit descriptions, authors, images and lesson metadata in `catalog.json`.
To replace a video, add its YouTube watch URL to `videoOverrides.json`, keyed
by course `simpId` (or `id`) and the exact lesson name without outer whitespace.
The Afro lesson Abrir is already mapped. Unmapped lessons retain
their original Vimeo source. Keep lesson names unique within each course.

Images are still external URLs; this snapshot does not bundle image files
or video files. Registration gates are UI behavior, not content protection:
bundled video URLs can be inspected by any visitor.

`node scripts/export-catalog.mjs` explicitly re-exports the four public
collections. It overwrites `catalog.json`, so review local edits before
running it. It never overwrites `videoOverrides.json` or writes to Firebase.
Deploy the app after editing either JSON file to publish catalog changes.
