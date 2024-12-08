import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-navy-blue p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-xl font-bold">
          <span className="text-patriot-red">RFS</span>Government
        </Link>
        <div className="flex items-center space-x-4">
          <Link 
            to="/submit" 
            className="bg-patriot-red px-4 py-2 rounded text-white hover:bg-red-700 transition"
          >
            Submit
          </Link>
          <Link to="/" className="text-white hover:text-gray-200">Projects</Link>
          <Link to="/about" className="text-white hover:text-gray-200">About</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 