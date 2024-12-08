import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { generateRssFeed } from './rssGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());

// RSS Feed endpoints
app.get('/rss.xml', async (req, res) => {
  try {
    const feeds = await generateRssFeed();
    res.set('Content-Type', 'application/xml');
    res.send(feeds.rss2);
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    res.status(500).send('Error generating feed');
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API Server running on port ${PORT}`);
}); 