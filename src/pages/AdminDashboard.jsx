import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, getDocs, doc, updateDoc, deleteDoc, where, orderBy } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

function AdminDashboard() {
  const { currentUser, signOut } = useAuth();
  const [projects, setProjects] = useState({
    pending: [],
    approved: [],
    declined: [],
    pendingDeletion: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const sortedProjects = {
        pending: [],
        approved: [],
        declined: [],
        pendingDeletion: []
      };

      querySnapshot.docs.forEach(doc => {
        const project = { id: doc.id, ...doc.data() };
        if (project.pendingDeletion) {
          sortedProjects.pendingDeletion.push(project);
        } else if (project.status === 'pending') {
          sortedProjects.pending.push(project);
        } else if (project.status === 'approved') {
          sortedProjects.approved.push(project);
        } else if (project.status === 'declined') {
          sortedProjects.declined.push(project);
        }
      });

      setProjects(sortedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate(projectId, newStatus) {
    try {
      await updateDoc(doc(db, 'projects', projectId), {
        status: newStatus,
        statusUpdatedAt: new Date()
      });
      await fetchProjects(); // Refresh all projects
    } catch (error) {
      console.error('Error updating project status:', error);
    }
  }

  async function markForDeletion(projectId) {
    if (window.confirm('Mark this project for deletion? It will be permanently deleted after 30 days.')) {
      try {
        await updateDoc(doc(db, 'projects', projectId), {
          pendingDeletion: true,
          deletionMarkedAt: new Date()
        });
        await fetchProjects();
      } catch (error) {
        console.error('Error marking project for deletion:', error);
      }
    }
  }

  async function handleImmediateDelete(projectId) {
    if (window.confirm('Are you sure you want to permanently delete this project immediately?')) {
      try {
        await deleteDoc(doc(db, 'projects', projectId));
        await fetchProjects();
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  }

  function handleEmail(email, title) {
    const subject = encodeURIComponent(`Regarding your project: ${title}`);
    const body = encodeURIComponent(`Hello,\n\nI am contacting you about your project "${title}"...`);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  }

  if (loading) return <div className="container mx-auto px-4 py-8">Loading...</div>;

  const ProjectCard = ({ project, section }) => (
    <div className="p-4 border rounded bg-white shadow-sm mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold">{project.title}</h3>
          <p className="mt-2">{project.description}</p>
          <p className="text-gray-600">Contact: {project.contactEmail}</p>
          <p className="text-gray-600">Status: <span className={`font-semibold ${
            project.status === 'approved' ? 'text-green-600' : 
            project.status === 'declined' ? 'text-red-600' : 
            'text-yellow-600'
          }`}>{project.status}</span></p>
          {project.pendingDeletion && (
            <p className="text-red-500">Marked for deletion on: {new Date(project.deletionMarkedAt?.toDate()).toLocaleDateString()}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleEmail(project.contactEmail, project.title)}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            ✉️
          </button>
          {section !== 'pendingDeletion' ? (
            <button
              onClick={() => markForDeletion(project.id)}
              className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
            >
              🗑️
            </button>
          ) : (
            <button
              onClick={() => handleImmediateDelete(project.id)}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              ❌
            </button>
          )}
        </div>
      </div>
      
      {section === 'pending' && (
        <div className="mt-4 space-x-4">
          <button
            onClick={() => handleStatusUpdate(project.id, 'approved')}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Approve
          </button>
          <button
            onClick={() => handleStatusUpdate(project.id, 'declined')}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Decline
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {currentUser?.email}
          </span>
          <button
            onClick={signOut}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
      
      {/* Pending Projects Section */}
      <div className="mb-12">
        <h3 className="text-xl font-semibold mb-4 text-yellow-600">
          Pending Review ({projects.pending.length})
        </h3>
        {projects.pending.map(project => (
          <ProjectCard key={project.id} project={project} section="pending" />
        ))}
      </div>

      {/* Projects Pending Deletion */}
      <div className="mb-12">
        <h3 className="text-xl font-semibold mb-4 text-red-600">
          Pending Deletion ({projects.pendingDeletion.length})
        </h3>
        {projects.pendingDeletion.map(project => (
          <ProjectCard key={project.id} project={project} section="pendingDeletion" />
        ))}
      </div>

      {/* Approved Projects */}
      <div className="mb-12">
        <h3 className="text-xl font-semibold mb-4 text-green-600">
          Approved Projects ({projects.approved.length})
        </h3>
        {projects.approved.map(project => (
          <ProjectCard key={project.id} project={project} section="approved" />
        ))}
      </div>

      {/* Declined Projects */}
      <div className="mb-12">
        <h3 className="text-xl font-semibold mb-4 text-red-600">
          Declined Projects ({projects.declined.length})
        </h3>
        {projects.declined.map(project => (
          <ProjectCard key={project.id} project={project} section="declined" />
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard; 