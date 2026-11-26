# grittech.io

Website of GRIT Technologies FZE LLC. Static site built with Vite and Tailwind CSS (Matte Tactile design system, `mt-` components), hosted on Firebase Hosting.

## Develop
```bash
npm install
npm run dev      # local server
npm run build    # production build in dist/
```

## Deploy
- Every pull request gets a temporary preview link (GitHub Actions → Firebase preview channel).
- Merging to `main` deploys the live site.
- Requires the repository secret `FIREBASE_SERVICE_ACCOUNT` (Firebase service-account JSON).

## Service and store pages
- All service and store content lives in `src/data.js` (services, store categories, products, cover media).
- `scripts/build-pages.mjs` generates `/services/<slug>/` and `/store/<slug>/` and refreshes the homepage tiles. It runs automatically before `npm run dev` and `npm run build`; the generated folders are not committed.
- Cover images/videos: put the file in `public/media/` and set `media: '/media/<file>'` in `src/data.js`.
- Recent work items live in the `work` list in the homepage script.

## Member area (`/account`)
- Firebase Authentication (email + password, Google) and Firestore (lite client).
- Data: `users/{uid}` profile; `purchases`, `projects`, `enrollments` sub-collections are written only by GRIT (admin / Cloud Functions).
- Rules live in `firestore.rules` and publish automatically when they change on `main`.
- Local preview with sample data: `npm run dev`, then open `/account/?demo`.

## Structure
- `index.html` — homepage markup and page script
- `account/index.html` + `src/account.js` — member sign-in and dashboard
- `src/firebase.js` — Firebase web config (public by design)
- `src/main.css` — Tailwind + Matte Tactile tokens and components
- `public/` — static files served as-is (favicon, later images and videos)
