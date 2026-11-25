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

## Structure
- `index.html` — page markup and page script
- `src/main.css` — Tailwind + Matte Tactile tokens and components
- `public/` — static files served as-is (favicon, later images and videos)
