import http from 'http';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const port = process.env.PORT || 8080;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gigsPath = path.join(__dirname, 'data', 'gigs.json');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8'
};

async function readGigs() {
  const raw = await fs.readFile(gigsPath, 'utf8');
  return JSON.parse(raw);
}

async function writeGigs(gigs) {
  await fs.writeFile(gigsPath, JSON.stringify(gigs, null, 2));
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
  if (!req.url || !req.method) {
    return sendJson(res, 400, { error: 'Bad request' });
  }

  if (req.method === 'GET' && req.url === '/api/gigs') {
    const gigs = await readGigs();
    return sendJson(res, 200, gigs);
  }

  if (req.method === 'POST' && req.url === '/api/gigs') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', async () => {
      const { title, company, location, type, pay, description } = JSON.parse(body || '{}');
      if (!title || !company || !location || !type || !pay || !description) {
        return sendJson(res, 400, { error: 'Missing required fields' });
      }
      const gigs = await readGigs();
      const newGig = { id: `g${Date.now()}`, title, company, location, type, pay, description, applications: 0 };
      gigs.unshift(newGig);
      await writeGigs(gigs);
      return sendJson(res, 201, newGig);
    });
    return;
  }

  if (req.method === 'POST' && req.url.startsWith('/api/gigs/') && req.url.endsWith('/apply')) {
    const id = req.url.split('/')[3];
    const gigs = await readGigs();
    const gig = gigs.find((g) => g.id === id);
    if (!gig) {
      return sendJson(res, 404, { error: 'Gig not found' });
    }
    gig.applications = (gig.applications || 0) + 1;
    await writeGigs(gigs);
    return sendJson(res, 200, { success: true, applications: gig.applications });
  }

  await serveStatic(req.url, res);
});

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
