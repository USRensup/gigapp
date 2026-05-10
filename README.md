# GigBoard Clone (Static)

This repository currently contains a static frontend clone:

- `index.html`
- `styles.css`
- `script.js`

There is **no backend in this repo yet**. Job data is hardcoded in `script.js` (`const gigs = [...]`).

## Where is the backend stored?

Right now, nowhere in this project.

If you want a real backend, add a service (for example):

- **Database**: Supabase Postgres / Neon Postgres
- **API**: Express / Fastify / Next.js API routes
- **Auth**: Clerk / Auth0 / Supabase Auth
- **Hosting**: Render / Railway / Fly.io / Vercel serverless

## Local run

```bash
python3 -m http.server 8080
```

Open http://localhost:8080

## Auto-deploy with GitHub Pages

This repo includes a GitHub Actions workflow at:

- `.github/workflows/deploy-pages.yml`

### Setup

1. Push this repository to GitHub.
2. In GitHub repo settings, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Push to `main` branch.

The workflow will deploy the static site automatically on each push to `main`.
