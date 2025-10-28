import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { JobCard } from '../jobs/JobCard';

interface HorizontalJobScrollProps {
  jobs: any[];
  isLoading?: boolean;
}

export const HorizontalJobScroll: React.FC<HorizontalJobScrollProps> = ({ jobs, isLoading }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="relative">
        <div className="overflow-hidden">
          <div className="grid grid-cols-[repeat(5,minmax(280px,1fr))] gap-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-1/2"></div>
                <div className="flex justify-between items-center mt-4">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">No jobs available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="relative group">
      {/* Left Arrow - Desktop Only */}
      <button
        onClick={() => scroll('left')}
        className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 items-center justify-center bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all opacity-0 group-hover:opacity-100"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      </button>

      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto scrollbar-hide -mx-2 px-2"
        style={{
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <div 
          className="grid grid-flow-col auto-cols-[calc((100%-3*1rem)/4.5)] sm:auto-cols-[calc((100%-3*1rem)/4.5)] gap-4"
          style={{ minWidth: 'min-content' }}
        >
          {jobs.map((job) => (
            <div 
              key={job._id || job.id}
              className="scroll-snap-align-start"
              style={{ scrollSnapAlign: 'start' }}
            >
              <JobCard job={job} compact />
            </div>
          ))}
        </div>
      </div>

      {/* Right Arrow - Desktop Only */}
      <button
        onClick={() => scroll('right')}
        className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 items-center justify-center bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all opacity-0 group-hover:opacity-100"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      </button>
    </div>
  );
};

