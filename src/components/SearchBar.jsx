function SearchBar({ onSearch }) {
  return (
    <div className="relative mb-6">
      <input
        type="text"
        placeholder="Search projects..."
        onChange={(e) => onSearch(e.target.value)}
        className="w-full p-3 pl-10 rounded-lg border border-gray-200 focus:border-old-glory-blue focus:ring-1 focus:ring-old-glory-blue"
      />
      <svg
        className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
  );
}

export default SearchBar; 