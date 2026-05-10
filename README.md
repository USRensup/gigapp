# GigBoard Clone

This project now includes a lightweight backend so Post/Apply actions work.

## Stack

- Frontend: static HTML/CSS/JS
- Backend: Node.js HTTP server (no external runtime dependencies)
- Storage: JSON file at `data/gigs.json`

## Run locally

```bash
npm install
npm start
```

Open `http://localhost:8080`.

## API

- `GET /api/gigs` - list gigs
- `POST /api/gigs` - create a gig
- `POST /api/gigs/:id/apply` - increment application count

## Notes

- This backend is file-based and intended for prototype/dev usage.
- For production, move to a real database and authenticated users.


## Netlify/GitHub Pages note

Those hosts are static by default, so `/api/*` will not run there unless you deploy a separate backend.
The UI now falls back to browser localStorage for Post/Apply when API calls fail.
