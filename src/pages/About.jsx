import React from 'react';

function About() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">About RFS Government</h1>
      
      <div className="prose lg:prose-xl">
        <p className="mb-4">
          RFS Government (Request For Startup - Government) is a platform dedicated to bridging the gap 
          between government needs and startup solutions, with a particular focus on legislative branch challenges.
        </p>
        
        <h2 className="text-2xl font-bold mt-8 mb-4">Our Mission</h2>
        <p className="mb-4">
          While the executive branch often receives significant technological attention and resources,
          legislative bodies face unique challenges that remain underserved. Our mission is to identify
          these opportunities and connect innovative startups with government needs, particularly in
          areas where legislative efficiency and transparency can be improved.
        </p>
        
        <h2 className="text-2xl font-bold mt-8 mb-4">How It Works</h2>
        <ul className="list-disc pl-6 mb-4">
          <li>Government employees submit requests for startup solutions</li>
          <li>Requests are tagged and categorized for easy discovery</li>
          <li>Startups can browse real government needs and opportunities</li>
          <li>We facilitate connections between government needs and innovative solutions</li>
        </ul>
        
        <h2 className="text-2xl font-bold mt-8 mb-4">Contact Us</h2>
        <p className="mb-4">
          Questions or suggestions? Contact us at:{' '}
          <a href="mailto:rfsgovernment@rfsgovernment.com" className="text-blue-600 hover:text-blue-800">
            rfsgovernment@rfsgovernment.com
          </a>
        </p>
      </div>
    </div>
  );
}

export default About; 