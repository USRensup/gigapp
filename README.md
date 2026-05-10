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


## Ready-to-use Google Apps Script

A complete Apps Script implementation is included at:

- `docs/google-apps-script.js`

### Quick steps

1. Create a Google Sheet and open **Extensions → Apps Script**.
2. Paste `docs/google-apps-script.js` contents.
3. Deploy as **Web app** with access set to **Anyone with the link**.
4. Set:

```bash
export GOOGLE_SHEETS_WEBHOOK_URL="<your-web-app-url>"
npm start
```

The Node backend will then persist gigs to your Google Sheet.


## Backend quick check

After `npm start`, verify backend is live:

```bash
curl http://localhost:8080/api/health
```

You should receive `{ "ok": true, ... }`.
