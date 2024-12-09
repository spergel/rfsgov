import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';

function Home() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApprovedRequests = async () => {
      try {
        // Query for only approved requests
        const q = query(
          collection(db, 'legislative-requests'),
          where('status', '==', 'approved')
        );
        
        const querySnapshot = await getDocs(q);
        const approvedRequests = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setRequests(approvedRequests);
        setError(null);
      } catch (error) {
        console.error('Error fetching approved requests:', error);
        setError('Unable to load projects at this time.');
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedRequests();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-off-white min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-navy-blue">Government Project Requests</h2>
          <Link 
            to="/submit" 
            className="bg-patriot-red text-white px-6 py-3 rounded-lg hover:bg-red-700 transition"
          >
            Submit New Request
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map(request => (
            <Link
              key={request.id}
              to={`/project/${request.id}`}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition border-l-4 border-old-glory-blue"
            >
              <h3 className="text-xl font-semibold text-navy-blue mb-2">
                {request.title}
              </h3>
              <p className="text-gray-600 mb-4 line-clamp-2">
                {request.problemStatement}
              </p>
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm text-gray-500 block">
                    Office: {request.legislativeOffice}
                  </span>
                  <span className="text-sm text-gray-500 block">
                    Type: {request.projectType}
                  </span>
                  {request.projectType === 'paid' && (
                    <span className="text-sm text-gray-500 block">
                      Budget: ${request.budget}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => window.location.href = `mailto:${request.contactEmail}`}
                  className="text-patriot-red hover:text-red-700 font-medium"
                >
                  Contact →
                </button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home; 