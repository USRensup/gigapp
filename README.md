# GigBoard Clone

This project now includes a lightweight backend so Post/Apply actions work.

## Stack

- Frontend: static HTML/CSS/JS
- Backend: Node.js + Express
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
