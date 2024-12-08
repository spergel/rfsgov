import { Feed } from 'feed';
import { db } from '../firebase.js';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

export async function generateRssFeed() {
  const feed = new Feed({
    title: "Government Project Requests",
    description: "Latest government project requests and opportunities",
    id: "https://govrfs-4d6cb.web.app/",
    link: "https://govrfs-4d6cb.web.app/",
    language: "en",
    favicon: "https://govrfs-4d6cb.web.app/favicon.ico",
    copyright: "All rights reserved 2024",
    updated: new Date(),
    generator: "Government Project Requests Feed"
  });

  try {
    const projectsRef = collection(db, 'projects');
    const q = query(
      projectsRef,
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      const project = doc.data();
      feed.addItem({
        title: project.title,
        id: doc.id,
        link: `https://govrfs-4d6cb.web.app/project/${doc.id}`,
        description: project.description,
        content: project.description,
        author: [{
          name: "Government Project Request",
          email: project.contactEmail,
        }],
        date: project.createdAt.toDate()
      });
    });

    return {
      rss2: feed.rss2(),
      atom: feed.atom1(),
      json: feed.json1()
    };
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    throw error;
  }
} 