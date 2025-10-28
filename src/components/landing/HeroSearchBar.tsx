import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Briefcase } from 'lucide-react';

export const HeroSearchBar: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [experience, setExperience] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build URL params from filled fields
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.append('search', searchTerm.trim());
    if (experience) params.append('experience', experience);
    if (location.trim()) params.append('location', location.trim());
    
    // Navigate to browse jobs with filters
    const queryString = params.toString();
    navigate(`/browse-jobs${queryString ? `?${queryString}` : ''}`);
  };

  return (
    <form 
      onSubmit={handleSearch}
      className="w-full max-w-5xl mx-auto mb-10"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1.5fr_1.5fr_auto] divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-700">
          {/* Skills/Designations/Companies */}
          <div className="relative flex items-center px-4 py-4 md:py-3">
            <Search className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
            <input
              type="text"
              placeholder="Enter skills / designations / companies"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm md:text-base"
            />
          </div>

          {/* Experience Dropdown */}
          <div className="relative flex items-center px-4 py-4 md:py-3">
            <Briefcase className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-gray-900 dark:text-white text-sm md:text-base cursor-pointer appearance-none pr-8"
              style={{ 
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.5rem center',
                backgroundSize: '1.25rem'
              }}
            >
              <option value="">Select experience</option>
              <option value="fresher">Fresher</option>
              <option value="1-2">1-2 years</option>
              <option value="3-5">3-5 years</option>
              <option value="5+">5+ years</option>
            </select>
          </div>

          {/* Location */}
          <div className="relative flex items-center px-4 py-4 md:py-3">
            <MapPin className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
            <input
              type="text"
              placeholder="Enter location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm md:text-base"
            />
          </div>

          {/* Search Button */}
          <div className="p-2 md:p-0">
            <button
              type="submit"
              className="w-full md:w-auto md:h-full px-8 py-3 md:py-0 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg md:rounded-none md:rounded-r-xl transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              <span>Search</span>
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

