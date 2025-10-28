import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock } from 'lucide-react';

interface HorizontalBlogScrollProps {
  blogs: any[];
  isLoading?: boolean;
}

export const HorizontalBlogScroll: React.FC<HorizontalBlogScrollProps> = ({ blogs, isLoading }) => {
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
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
                <div className="h-40 bg-gray-200 dark:bg-gray-700"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!blogs || blogs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">No career tips available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="relative group">
      {/* Left Arrow - Desktop Only */}
      <button
        onClick={() => scroll('left')}
        className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 items-center justify-center bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all opacity-0 group-hover:opacity-100"
        aria-label="Scroll left"
      >
        <span className="text-2xl font-bold text-gray-700 dark:text-gray-300">&lt;</span>
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
          className="grid grid-flow-col auto-cols-[calc(85%)] sm:auto-cols-[calc(45%)] md:auto-cols-[calc(32%)] lg:auto-cols-[calc(23%)] xl:auto-cols-[calc((100%-3*1rem)/4.5)] gap-4"
          style={{ minWidth: 'min-content' }}
        >
          {blogs.map((blog) => (
            <Link
              key={blog._id || blog.id}
              to={`/blogs/${blog._id || blog.id}`}
              className="block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm transition-all duration-200 scroll-snap-align-start h-full flex flex-col"
              style={{ scrollSnapAlign: 'start' }}
            >
              {/* Thumbnail */}
              <div className="h-40 overflow-hidden flex-shrink-0">
                <img 
                  src={blog.thumbnail} 
                  alt={blog.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              
              {/* Content */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div className="flex-1">
                  {/* Category Badge */}
                  {blog.category && (
                    <span className="inline-block px-2 py-0.5 text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 rounded mb-2">
                      {blog.category}
                    </span>
                  )}
                  
                  {/* Title */}
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 min-h-[3rem]">
                    {blog.title}
                  </h3>
                  
                  {/* Excerpt */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                    {blog.excerpt || blog.description}
                  </p>
                </div>
                
                {/* Meta */}
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-700">
                  {blog.publishedAt && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(blog.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  )}
                  {blog.readTime && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{blog.readTime} min read</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Right Arrow - Desktop Only */}
      <button
        onClick={() => scroll('right')}
        className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 items-center justify-center bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all opacity-0 group-hover:opacity-100"
        aria-label="Scroll right"
      >
        <span className="text-2xl font-bold text-gray-700 dark:text-gray-300">&gt;</span>
      </button>
    </div>
  );
};

