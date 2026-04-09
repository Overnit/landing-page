import express from 'express';
import { createClient } from 'redis';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Connect to Redis
const redis = createClient({
  url: process.env.REDIS_URL || 'redis://redis-master:6379'
});

redis.on('error', (err) => console.error('Redis Client Error', err));
await redis.connect();

app.use(express.json());

// API: Create short URL
app.post('/api/shorten', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    // Validate URL
    new URL(url);
  } catch (e) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  // Generate 6 character code
  const code = Math.random().toString(36).substring(2, 8);
  
  // Store in Redis (no expiration for now)
  await redis.set(`link:${code}`, url);

  const shortUrl = `${req.protocol}://${req.get('host')}/${code}`;
  res.json({ code, shortUrl, originalUrl: url });
});

// API: Redirect short URL
app.get('/:code', async (req, res, next) => {
  const { code } = req.params;
  
  // Exclude static assets/api paths
  if (code === 'api' || code.includes('.')) {
    return next();
  }

  const url = await redis.get(`link:${code}`);
  if (url) {
    return res.redirect(302, url);
  }
  
  next(); // Fallback to React app
});

// Serve static React files
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Fallback for React Router (Single Page Application)
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Landing page and Shortener API running on port ${port}`);
});
