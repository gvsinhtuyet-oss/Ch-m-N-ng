
import express from 'express';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';

const app = express();
const dataDir = path.resolve(process.env.CONTENT_DATA_DIR || './content-data');
const dataFile = path.join(dataDir, 'stations.json');
const password = process.env.CONTENT_ADMIN_PASSWORD;
if (!password || password.length < 12) throw new Error('Set CONTENT_ADMIN_PASSWORD to a password of at least 12 characters.');
await mkdir(dataDir, { recursive: true });
let stations = {};
try { stations = JSON.parse(await readFile(dataFile, 'utf8')); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
const tokens = new Map();
let failures = 0;
let blockedUntil = 0;
let writes = Promise.resolve();
app.disable('x-powered-by');
app.use('/api/content', (_req,res,next) => { res.setHeader('Cache-Control','no-store'); next(); });
app.use(express.json({ limit: '32mb' }));
app.get('/api/content', (_req, res) => res.json({ schemaVersion: 1, stations }));
app.post('/api/content/login', (req,res) => {
  if (Date.now() < blockedUntil) return res.status(429).json({ error: 'Try again later' });
  const supplied = Buffer.from(typeof req.body.password === 'string' ? req.body.password : '');
  const expected = Buffer.from(password);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    failures++;
    if (failures >= 10) { blockedUntil = Date.now() + 60000; failures = 0; }
    return res.status(401).json({ error: 'Invalid password' });
  }
  failures = 0;
  for (const [token, expiry] of tokens) if (expiry < Date.now()) tokens.delete(token);
  const token = randomBytes(32).toString('hex');
  tokens.set(token, Date.now() + 3600000);
  res.json({ token });
});
const validUrl = value => typeof value === 'string' && (
  value === '' || /^https:\/\//i.test(value) ||
  /^data:(image\/(png|jpeg|webp|gif)|application\/pdf|audio\/(mpeg|mp3|wav|ogg|mp4|x-wav)|video\/(mp4|webm|ogg));base64,/i.test(value)
);
app.put('/api/content/:stationId', async (req,res,next) => {
  const token = (req.headers.authorization || '').replace(/^Bearer /, '');
  if ((tokens.get(token) || 0) < Date.now()) return res.status(401).json({ error: 'Authentication required' });
  const id = req.params.stationId;
  const content = req.body;
  if (!/^[a-zA-Z0-9_-]{1,100}$/.test(id) ||
      !validUrl(content.coverImage) || !validUrl(content.mapImage) ||
      !Array.isArray(content.hotspots) || content.hotspots.length < 1 || content.hotspots.length > 30 ||
      !content.hotspots.every(h => typeof h.id === 'string' && typeof h.titleVi === 'string' && typeof h.narrationVi === 'string' && typeof h.keyFactVi === 'string' && validUrl(h.image)) ||
      !Array.isArray(content.resources) || content.resources.length > 50 ||
      !content.resources.every(r => typeof r.id === 'string' && typeof r.title === 'string' && r.title.trim() && validUrl(r.url) && r.url && ['document','video','audio','image'].includes(r.kind))) {
    return res.status(400).json({ error: 'Invalid station content' });
  }
  const clean = { coverImage: content.coverImage, mapImage: content.mapImage, hotspots: content.hotspots, resources: content.resources };
  try {
    // Serialize edits so simultaneous saves do not overwrite another station.
    const operation = writes.then(async () => {
      const nextStations = { ...stations, [id]: clean };
      const temporary = dataFile + '.tmp';
      await writeFile(temporary, JSON.stringify(nextStations), { mode: 0o600 });
      await rename(temporary, dataFile);
      stations = nextStations;
    });
    writes = operation.catch(() => {});
    await operation;
    res.json({ saved: true });
  } catch (error) { next(error); }
});
app.use(express.static('dist'));
app.get('*', (_req,res) => res.sendFile(path.resolve('dist/index.html')));
app.use((error,_req,res,_next) => {
  console.error('Content API error:', error.message);
  res.status(error.status || 500).json({ error: 'Could not save content' });
});
const port = Number(process.env.PORT || 3000);
app.listen(port, '0.0.0.0', () => console.log('CHAM DA NANG listening on port ' + port));
