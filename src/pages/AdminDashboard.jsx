import { useAuth0 } from '@auth0/auth0-react';
import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, doc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

function AdminDashboard() {
  const { user, logout } = useAuth0();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      const projectsRef = collection(db, 'projects');
      const q = query(
        projectsRef, 
        where('status', '!=', 'deleted'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const projectsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setProjects(projectsData);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  const filteredProjects = projects
    .filter(project => {
      // Filter by tab
      if (activeTab !== 'all') {
        if (project.status !== activeTab) return false;
      }
      // Filter by search
      if (searchTerm) {
        return (
          project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.contactEmail?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'desc' 
          ? new Date(b.createdAt) - new Date(a.createdAt)
          : new Date(a.createdAt) - new Date(b.createdAt);
      }
      if (sortBy === 'title') {
        return sortOrder === 'desc'
          ? b.title.localeCompare(a.title)
          : a.title.localeCompare(b.title);
      }
      return 0;
    });

  async function handleStatusUpdate(projectId, newStatus) {
    try {
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, {
        status: newStatus,
        updatedAt: new Date().toISOString(),
        updatedBy: user.email
      });
      
      const project = projects.find(p => p.id === projectId);
      const subject = encodeURIComponent(`Your startup idea status has been updated: ${project.title}`);
      const body = encodeURIComponent(
        `Your startup idea "${project.title}" has been ${newStatus}.\n\n` +
        `Next steps and feedback:\n` +
        (newStatus === 'approved' 
          ? '1. We will contact you soon for next steps\n2. Please prepare any additional documentation'
          : 'We encourage you to refine your idea and submit again.')
      );
      window.open(`mailto:${project.contactEmail}?subject=${subject}&body=${body}`);
      
      await fetchProjects();
      setSelectedProject(null);
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Failed to update project status');
    }
  }

  async function handleDelete(projectId) {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    
    try {
      const projectRef = doc(db, 'projects', projectId);
      await deleteDoc(projectRef);
      await fetchProjects();
      setSelectedProject(null);
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project');
    }
  }

  if (loading) return <div className="container mx-auto px-4 py-8">Loading projects...</div>;
  if (error) return <div className="container mx-auto px-4 py-8 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Startup Ideas Dashboard</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user?.email}</span>
          <button
            onClick={() => logout({ returnTo: window.location.origin })}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-6 space-y-4">
        {/* Tabs */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-full ${
                activeTab === 'pending' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`px-4 py-2 rounded-full ${
                activeTab === 'approved' ? 'bg-green-500 text-white' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setActiveTab('deleted')}
              className={`px-4 py-2 rounded-full ${
                activeTab === 'deleted' ? 'bg-red-500 text-white' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Deleted
            </button>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-full px-4 py-2"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-full px-4 py-2"
            >
              <option value="date">Date</option>
              <option value="title">Title</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="border border-gray-300 rounded-full px-4 py-2"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map(project => (
          <div key={project.id} className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
            <p className="text-gray-600 mb-4">{project.description}</p>
            <div className="flex justify-between items-center">
              <span className={`px-3 py-1 rounded-full text-sm ${
                project.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                project.status === 'approved' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {project.status}
              </span>
              <button 
                className="text-blue-500 hover:text-blue-700"
                onClick={() => window.location.href = `mailto:${project.contactEmail}`}
              >
                Contact
              </button>
            </div>
            <div className="mt-4">
              <button
                className="text-blue-500 hover:text-blue-700"
                onClick={() => handleStatusUpdate(project.id, 'pending')}
              >
                Mark as Pending
              </button>
              <button
                className="text-green-500 hover:text-green-700"
                onClick={() => handleStatusUpdate(project.id, 'approved')}
              >
                Mark as Approved
              </button>
              <button
                className="text-red-500 hover:text-red-700"
                onClick={() => handleStatusUpdate(project.id, 'deleted')}
              >
                Mark as Deleted
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard; 