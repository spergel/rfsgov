import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

function ProjectDetails() {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    async function fetchProject() {
      try {
        const docRef = doc(db, 'projects', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProject({ id: docSnap.id, ...docSnap.data() });
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching project:', error);
        setLoading(false);
      }
    }

    fetchProject();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!project) return <div>Project not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-navy-blue mb-4">{project.title}</h1>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Description</h2>
          <p className="text-gray-600 whitespace-pre-wrap">{project.description}</p>
        </div>

        <div className="border-t pt-4">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Contact Information</h2>
          <p className="text-gray-600">
            Email: <a href={`mailto:${project.contactEmail}`} className="text-blue-600 hover:underline">
              {project.contactEmail}
            </a>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Posted: {new Date(project.createdAt?.toDate()).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ProjectDetails; 