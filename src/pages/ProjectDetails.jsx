import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

function ProjectDetails() {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    async function fetchRequest() {
      try {
        const docRef = doc(db, 'legislative-requests', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setRequest({ id: docSnap.id, ...docSnap.data() });
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching request:', error);
        setLoading(false);
      }
    }

    fetchRequest();
  }, [id]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-lg">Loading...</div>
    </div>
  );
  
  if (!request) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-lg">Request not found</div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-3xl font-bold text-navy-blue">{request.title}</h1>
          <span className={`px-4 py-2 rounded-full text-sm ${
            request.projectType === 'volunteer' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            {request.projectType === 'volunteer' ? 'Volunteer Project' : 'Paid Project'}
          </span>
        </div>

        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Problem Statement</h2>
            <p className="text-gray-600">{request.problemStatement}</p>
          </section>

          {request.description && (
            <section>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Description</h2>
              <p className="text-gray-600">{request.description}</p>
            </section>
          )}

          {request.currentSituation && (
            <section>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Current Situation</h2>
              <p className="text-gray-600">{request.currentSituation}</p>
            </section>
          )}

          {request.desiredOutcome && (
            <section>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Desired Outcome</h2>
              <p className="text-gray-600">{request.desiredOutcome}</p>
            </section>
          )}

          {request.additionalNotes && (
            <section>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Additional Notes</h2>
              <p className="text-gray-600">{request.additionalNotes}</p>
            </section>
          )}
        </div>

        <div className="border-t pt-4">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Contact Information</h2>
          <p className="text-gray-600">
            Email: <a href={`mailto:${request.contactEmail}`} className="text-blue-600 hover:underline">
              {request.contactEmail}
            </a>
          </p>
          <div className="text-sm text-gray-500 border-t pt-4">
            <p>Created: {new Date(request.createdAt).toLocaleDateString()}</p>
            {request.updatedAt && (
              <p>Last Updated: {new Date(request.updatedAt).toLocaleDateString()}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectDetails; 