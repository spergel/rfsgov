import { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { getFunctions, httpsCallable } from 'firebase/functions';

function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const { currentUser, isAdmin } = useAuth();
  const functions = getFunctions();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'legislative-requests'));
        const fetchedRequests = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRequests(fetchedRequests);
      } catch (error) {
        console.error('Error fetching requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleStatusUpdate = async (request, newStatus) => {
    try {
      const requestRef = doc(db, 'legislative-requests', request.id);
      await updateDoc(requestRef, {
        status: newStatus,
        updatedAt: new Date().toISOString(),
        adminNotes: request.adminNotes
      });

      const sendStatusUpdateEmail = httpsCallable(functions, 'sendStatusUpdateEmail');
      await sendStatusUpdateEmail({
        email: request.contactEmail,
        status: newStatus,
        title: request.title
      });

      setRequests(requests.map(r => 
        r.id === request.id 
          ? { ...r, status: newStatus }
          : r
      ));

    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const filteredRequests = requests.filter(request => 
    statusFilter === 'all' ? true : request.status === statusFilter
  );

  if (loading) {
    return <div>Loading requests...</div>;
  }

  if (!currentUser || !isAdmin) {
    return <div>Access denied. Admin privileges required.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Legislative Requests Dashboard</h2>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Requests</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="declined">Declined</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRequests.map(request => (
          <div key={request.id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">{request.title}</h3>
              <span className={`px-3 py-1 rounded-full text-sm ${
                request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                request.status === 'approved' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {request.status || 'pending'}
              </span>
            </div>

            <p className="text-gray-600 mb-4">{request.problemStatement}</p>
            
            <div className="text-sm text-gray-500 mb-4">
              <p>Office: {request.legislativeOffice}</p>
              <p>Type: {request.projectType}</p>
              {request.projectType === 'paid' && <p>Budget: ${request.budget}</p>}
              <p>Submitted: {new Date(request.createdAt).toLocaleDateString()}</p>
            </div>

            <div className="mt-4">
              <textarea
                className="w-full p-2 border rounded"
                placeholder="Add admin notes..."
                value={request.adminNotes || ''}
                onChange={(e) => {
                  setRequests(requests.map(r =>
                    r.id === request.id
                      ? { ...r, adminNotes: e.target.value }
                      : r
                  ));
                }}
              />
            </div>

            <div className="flex justify-between items-center mt-4">
              <div className="flex gap-2">
                <button
                  onClick={() => handleStatusUpdate(request, 'approved')}
                  className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleStatusUpdate(request, 'declined')}
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Decline
                </button>
                <button
                  onClick={() => handleStatusUpdate(request, 'pending')}
                  className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Reset
                </button>
              </div>
              <button 
                className="text-blue-500 hover:text-blue-700"
                onClick={() => window.location.href = `mailto:${request.contactEmail}`}
              >
                Contact
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard; 