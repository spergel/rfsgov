import { useState, useEffect } from 'react';
import { db } from '../firebase.js';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';

function Home() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchProjects() {
      try {
        const q = query(
          collection(db, 'projects'),
          where('status', '==', 'approved')
        );
        
        const querySnapshot = await getDocs(q);
        const projectsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setProjects(projectsData);
        setError(null);
      } catch (error) {
        console.error('Error fetching projects:', error);
        if (error.code === 'permission-denied') {
          setProjects([]);
        } else {
          setError('Unable to load projects at this time. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-lg">Loading...</div>
    </div>
  );

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
        
        <SearchBar onSearch={setSearchQuery} />
        <CategoryFilter 
          selectedCategory={selectedCategory} 
          onCategoryChange={setSelectedCategory} 
        />
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects
            .filter(project => 
              (selectedCategory === 'All' || project.category === selectedCategory) &&
              (project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
               project.description.toLowerCase().includes(searchQuery.toLowerCase()))
            )
            .map(project => (
              <Link
                key={project.id}
                to={`/project/${project.id}`}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition border-l-4 border-old-glory-blue"
              >
                <h3 className="text-xl font-semibold text-navy-blue mb-2">{project.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Posted: {new Date(project.createdAt?.toDate()).toLocaleDateString()}
                  </span>
                  <span className="text-patriot-red font-medium">View Details →</span>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}

export default Home; 