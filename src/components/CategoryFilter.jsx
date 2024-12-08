function CategoryFilter({ selectedCategory, onCategoryChange }) {
  const categories = [
    'All',
    'Technology',
    'Infrastructure',
    'Public Safety',
    'Healthcare',
    'Education',
    'Environmental'
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {categories.map(category => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={`px-4 py-2 rounded ${
            selectedCategory === category 
              ? 'bg-old-glory-blue text-white' 
              : 'bg-white text-navy-blue border border-gray-200 hover:bg-gray-50'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}

export default CategoryFilter; 