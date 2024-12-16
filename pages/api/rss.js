import { generateRssFeed } from '../../utils/rssGenerator';

export default async function handler(req, res) {
  try {
    const feed = await generateRssFeed();
    
    // Set the content type for RSS
    res.setHeader('Content-Type', 'application/xml');
    // Send the RSS feed
    res.send(feed.rss2);
  } catch (error) {
    res.status(500).json({ error: 'Error generating feed' });
  }
} 