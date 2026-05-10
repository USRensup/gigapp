# GigBoard Clone

This project supports two backend persistence modes:

1. **Local JSON file** (`data/gigs.json`) for local development.
2. **Google Sheets backend** via Apps Script webhook for a hosted, shared data store.

## Run locally

```bash
npm install
npm start
```

## Use Google Sheets as backend

Set environment variable before running:

```bash
export GOOGLE_SHEETS_WEBHOOK_URL="https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec"
npm start
```

When set, server routes `/api/gigs` and `/api/gigs/:id/apply` through the webhook instead of `data/gigs.json`.

### Expected webhook contract

The server sends JSON payloads:

- `{ "action": "list" }`
- `{ "action": "create", "payload": { ...gigFields } }`
- `{ "action": "apply", "id": "g123" }`

Expected JSON responses:

- list: `{ "gigs": [...] }`
- create: `{ "gig": { ... } }`
- apply: `{ "success": true, "applications": 3 }`

## API

- `GET /api/gigs`
- `POST /api/gigs`
- `POST /api/gigs/:id/apply`
