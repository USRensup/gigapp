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


## 404 on GitHub Pages?

If you see `404 File not found`, check these first:

1. **Pages source is set to GitHub Actions** in `Settings → Pages`.
2. You are pushing to a branch that triggers deployment (`main`, `master`, or `work`).
3. The latest Actions run named **Deploy static site to GitHub Pages** succeeded.
4. The site URL matches your repo type:
   - User/org site: `https://<user>.github.io/`
   - Project site: `https://<user>.github.io/<repo>/`

This repo includes `index.html` at the root, which is required for Pages root routing.


## Netlify deployment (fixes common failures)

If Netlify deployment fails for this repo, use these exact settings:

- **Build command**: *(leave empty)*
- **Publish directory**: `.`

This repo now includes `netlify.toml` to force the publish directory and SPA fallback routing.

### Typical failure causes

1. Publish directory set incorrectly (for example `dist` or `build` when those folders do not exist).
2. Build command provided even though this is static HTML/CSS/JS.
3. Wrong site URL checked after deploy.

### CLI verify locally

```bash
npx netlify-cli deploy --dir=. --prod
```
