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
      className="w-full max-w-4xl mx-auto mb-10"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-700">
          
          {/* Job Title/Keyword Search */}
          <div className="flex-1 flex items-center px-4 py-3.5 group">
            <Search className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <input
                type="text"
                placeholder="Job title, keyword, or company"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent border-none outline-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                style={{ boxShadow: 'none' }}
              />
            </div>
          </div>

          {/* Experience */}
          <div className="flex-1 flex items-center px-4 py-3.5 group">
            <Briefcase className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full bg-transparent border-none outline-none focus:ring-0 text-gray-900 dark:text-white text-sm cursor-pointer appearance-none pr-6"
                style={{ 
                  boxShadow: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right center',
                  backgroundSize: '1rem'
                }}
              >
                <option value="">Experience level</option>
                <option value="fresher">Fresher</option>
                <option value="1-2">1-2 years</option>
                <option value="3-5">3-5 years</option>
                <option value="5+">5+ years</option>
              </select>
            </div>
          </div>

          {/* Location */}
          <div className="flex-1 flex items-center px-4 py-3.5 group">
            <MapPin className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <input
                type="text"
                placeholder="City or state"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-transparent border-none outline-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                style={{ boxShadow: 'none' }}
              />
            </div>
          </div>

          {/* Search Button */}
          <div className="flex items-center p-2">
            <button
              type="submit"
              className="w-full md:w-auto px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Popular searches */}
      <div className="text-center mt-3">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Popular: Part-time Developer, Content Writer, Designer, Marketing
        </p>
      </div>
    </form>
  );
};
