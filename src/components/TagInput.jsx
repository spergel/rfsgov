import { useState, useEffect } from 'react';

function TagInput({ 
  selectedTags, 
  onTagsChange, 
  availableTags, 
  className = "" 
}) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (input.trim()) {
      const filtered = availableTags.filter(tag => 
        tag.toLowerCase().includes(input.toLowerCase()) &&
        !selectedTags.includes(tag)
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [input, availableTags, selectedTags]);

  const handleTagAdd = (tag) => {
    if (tag && !selectedTags.includes(tag)) {
      onTagsChange([...selectedTags, tag]);
    }
    setInput('');
    setSuggestions([]);
  };

  const handleTagRemove = (tagToRemove) => {
    onTagsChange(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      handleTagAdd(input.trim());
    } else if (e.key === 'ArrowDown' && suggestions.length > 0) {
      e.preventDefault();
      handleTagAdd(suggestions[0]);
    }
  };

  return (
    <div className={className}>
      {/* Input and Suggestions */}
      <div className="relative mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type to add or search tags"
          className="w-full p-2 border rounded"
        />
        
        {suggestions.length > 0 && (
          <div className="absolute z-10 w-full bg-white border rounded-b mt-1 max-h-48 overflow-y-auto shadow-lg">
            {suggestions.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagAdd(tag)}
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="bg-gray-50 p-2 border rounded">
          {selectedTags.map(tag => (
            <span
              key={tag}
              className="px-2 py-1 bg-gray-200 text-sm rounded mr-2"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleTagRemove(tag)}
                className="text-red-500 ml-2"
              >
                Remove
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default TagInput; 