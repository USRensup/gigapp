import http from 'http';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const port = process.env.PORT || 8080;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gigsPath = path.join(__dirname, 'data', 'gigs.json');
const sheetsUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL || '';

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8'
};

async function readGigsFromFile() {
  const raw = await fs.readFile(gigsPath, 'utf8');
  return JSON.parse(raw);
}

async function writeGigsToFile(gigs) {
  await fs.writeFile(gigsPath, JSON.stringify(gigs, null, 2));
}

async function callSheets(payload) {
  const res = await fetch(sheetsUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    throw new Error(`Sheets backend error (${res.status})`);
  }
  return res.json();
}

async function listGigs() {
  if (sheetsUrl) {
    const data = await callSheets({ action: 'list' });
    return data.gigs || [];
  }
  return readGigsFromFile();
}

async function createGig(payload) {
  if (sheetsUrl) {
    const data = await callSheets({ action: 'create', payload });
    return data.gig;
  }
  const gigs = await readGigsFromFile();
  const newGig = { id: `g${Date.now()}`, ...payload, applications: 0 };
  gigs.unshift(newGig);
  await writeGigsToFile(gigs);
  return newGig;
}

async function applyToGig(id) {
  if (sheetsUrl) {
    const data = await callSheets({ action: 'apply', id });
    return data;
  }
  const gigs = await readGigsFromFile();
  const gig = gigs.find((g) => g.id === id);
  if (!gig) return null;
  gig.applications = (gig.applications || 0) + 1;
  await writeGigsToFile(gigs);
  return { success: true, applications: gig.applications };
}

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

async function serveStatic(urlPath, res) {
  const filePath = path.join(__dirname, urlPath === '/' ? 'index.html' : urlPath.slice(1));
  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    res.end(data);
  } catch {
    const html = await fs.readFile(path.join(__dirname, 'index.html'));
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  }
}

const server = http.createServer(async (req, res) => {
  try {
    if (!req.url || !req.method) {
      return sendJson(res, 400, { error: 'Bad request' });
    }

    if (req.method === 'GET' && req.url === '/api/health') {
      return sendJson(res, 200, { ok: true, backend: sheetsUrl ? 'google-sheets' : 'local-file' });
    }

    if (req.method === 'GET' && req.url === '/api/gigs') {
      return sendJson(res, 200, await listGigs());
    }

    if (req.method === 'POST' && req.url === '/api/gigs') {
      let body = '';
      req.on('data', (chunk) => { body += chunk; });
      req.on('end', async () => {
        try {
          const { title, company, location, type, pay, description } = JSON.parse(body || '{}');
          if (!title || !company || !location || !type || !pay || !description) {
            return sendJson(res, 400, { error: 'Missing required fields' });
          }
          const gig = await createGig({ title, company, location, type, pay, description });
          return sendJson(res, 201, gig);
        } catch {
          return sendJson(res, 500, { error: 'Failed to publish gig' });
        }
      });
      return;
    }

    if (req.method === 'POST' && req.url.startsWith('/api/gigs/') && req.url.endsWith('/apply')) {
      const id = req.url.split('/')[3];
      const result = await applyToGig(id);
      if (!result) return sendJson(res, 404, { error: 'Gig not found' });
      return sendJson(res, 200, result);
    }

    await serveStatic(req.url, res);
  } catch {
    return sendJson(res, 500, { error: 'Internal server error' });
  }
});

server.listen(port, () => {
  const backend = sheetsUrl ? `Google Sheets webhook (${sheetsUrl})` : `local file (${gigsPath})`;
  console.log(`Server running on http://localhost:${port} using ${backend}`);
});
