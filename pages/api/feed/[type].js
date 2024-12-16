import { generateRssFeed } from '../../../utils/rssGenerator';

export default async function handler(req, res) {
  const { type } = req.query;
  
  try {
    const feed = await generateRssFeed();
    
    switch (type) {
      case 'rss':
        res.setHeader('Content-Type', 'application/xml');
        return res.send(feed.rss2);
      case 'atom':
        res.setHeader('Content-Type', 'application/atom+xml');
        return res.send(feed.atom);
      case 'json':
        res.setHeader('Content-Type', 'application/json');
        return res.send(feed.json);
      default:
        return res.status(400).json({ error: 'Invalid feed type' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error generating feed' });
  }
} 