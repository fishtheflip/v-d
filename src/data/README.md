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

Askhat was added locally on 2026-11-12, bringing the author count to 10.
His portrait is bundled at `public/images/authors/askhat.jpg`.
His separate Locking course (`locking1`) contains public Intro, Locking Grooves and Up/Lock/Twirl/Point/Pace/High five lessons on YouTube.
The first four Locking videos (Intro and numbered lessons 1-3) are public; all lessons are available after sign-in.
The fourth numbered Locking lesson (Scoobot, Scooby doo, Scoobot hop, Skeeter rabbit) also requires registration.
The fifth numbered Locking lesson (Rock steady, The bump, The seek) requires registration.
The sixth numbered Locking lesson (Stop & Go) requires registration.
The seventh numbered Locking lesson (Robot shuffle, Хамбон, Which a way) requires registration.
The eighth numbered Locking lesson (James brown, 4 corner temptation walk, The freak) requires registration.
The ninth numbered Locking lesson (Groove: смена сторон и ощущений во время танца) requires registration.
The tenth numbered Locking lesson (Freestyle) requires registration.
Locking ends with Outro after Freestyle; Outro requires registration.
Current totals: 8 courses, 3 choreographies, 10 authors, 8 categories, 104 lessons.
Existing images are still external URLs; video files are not bundled.
Registration gates are UI behavior, not content protection:
bundled video URLs can be inspected by any visitor.

`node scripts/export-catalog.mjs` explicitly re-exports the four public
collections. It overwrites `catalog.json`, so review local edits before
running it. It never overwrites `videoOverrides.json` or writes to Firebase.
Deploy the app after editing either JSON file to publish catalog changes.
