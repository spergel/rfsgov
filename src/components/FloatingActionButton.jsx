import React from 'react';
import { Link } from 'react-router-dom';

const FloatingActionButton = () => (
  <Link
    to="/submit"
    className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 
               text-white font-semibold px-6 py-3 rounded-full shadow-lg 
               hover:shadow-xl transition-all duration-200 flex items-center 
               space-x-2 z-50"
  >
    <svg 
      className="w-5 h-5" 
      fill="none" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth="2" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path d="M12 4v16m8-8H4"></path>
    </svg>
    <span>New Request</span>
  </Link>
);

export default FloatingActionButton; 