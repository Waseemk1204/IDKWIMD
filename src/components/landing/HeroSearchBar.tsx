import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Briefcase, Sparkles } from 'lucide-react';

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
      className="w-full max-w-5xl mx-auto mb-12"
    >
      {/* Modern gradient background container */}
      <div className="relative bg-gradient-to-br from-white via-white to-blue-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-gray-700 p-2">
        
        {/* Decorative elements */}
        <div className="absolute -top-2 -right-2 w-20 h-20 bg-gradient-to-br from-primary-400 to-purple-500 rounded-full blur-2xl opacity-20"></div>
        <div className="absolute -bottom-2 -left-2 w-24 h-24 bg-gradient-to-tr from-blue-400 to-cyan-500 rounded-full blur-2xl opacity-15"></div>
        
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
          <div className="flex flex-col md:flex-row">
            
            {/* Main Search Input */}
            <div className="flex-1 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700">
              <div className="flex items-center px-5 py-4 group">
                <div className="mr-3 flex-shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                    <Search className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                    Job Title or Keyword
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Frontend Developer, Designer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-transparent border-none outline-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-base font-medium p-0"
                    style={{ boxShadow: 'none' }}
                  />
                </div>
              </div>
            </div>

            {/* Experience Level */}
            <div className="flex-1 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700">
              <div className="flex items-center px-5 py-4 group">
                <div className="mr-3 flex-shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="flex-1 relative">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                    Experience
                  </label>
                  <select
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full bg-transparent border-none outline-none focus:ring-0 text-gray-900 dark:text-white text-base font-medium cursor-pointer appearance-none pr-8 p-0"
                    style={{ 
                      boxShadow: 'none',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right center',
                      backgroundSize: '1.25rem'
                    }}
                  >
                    <option value="">Any</option>
                    <option value="fresher">Fresher</option>
                    <option value="1-2">1-2 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="5+">5+ years</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="flex-1">
              <div className="flex items-center px-5 py-4 group">
                <div className="mr-3 flex-shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bangalore, Mumbai..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-transparent border-none outline-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-base font-medium p-0"
                    style={{ boxShadow: 'none' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Search Button */}
          <div className="p-2 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-primary-600 via-purple-600 to-blue-600 hover:from-primary-700 hover:via-purple-700 hover:to-blue-700 text-white font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-5 h-5" />
              <span className="text-lg">Search Jobs</span>
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Helper text */}
      <div className="text-center mt-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          <span className="font-medium">Popular:</span> Part-time Developer, Content Writer, Designer, Marketing Assistant
        </p>
      </div>
    </form>
  );
};
