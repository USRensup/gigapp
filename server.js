import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = process.env.PORT || 8080;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gigsPath = path.join(__dirname, 'data', 'gigs.json');

app.use(express.json());
app.use(express.static(__dirname));

async function readGigs() {
  const raw = await fs.readFile(gigsPath, 'utf8');
  return JSON.parse(raw);
}

async function writeGigs(gigs) {
  await fs.writeFile(gigsPath, JSON.stringify(gigs, null, 2));
}

app.get('/api/gigs', async (_req, res) => {
  const gigs = await readGigs();
  res.json(gigs);
});

app.post('/api/gigs', async (req, res) => {
  const { title, company, location, type, pay, description } = req.body;
  if (!title || !company || !location || !type || !pay || !description) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const gigs = await readGigs();
  const newGig = {
    id: `g${Date.now()}`,
    title,
    company,
    location,
    type,
    pay,
    description,
    applications: 0
  };
  gigs.unshift(newGig);
  await writeGigs(gigs);
  res.status(201).json(newGig);
});

app.post('/api/gigs/:id/apply', async (req, res) => {
  const gigs = await readGigs();
  const gig = gigs.find((g) => g.id === req.params.id);
  if (!gig) {
    return res.status(404).json({ error: 'Gig not found' });
  }
  gig.applications = (gig.applications || 0) + 1;
  await writeGigs(gigs);
  res.json({ success: true, applications: gig.applications });
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
