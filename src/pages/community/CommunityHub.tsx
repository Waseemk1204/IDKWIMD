import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SearchIcon, PlusIcon, TrendingUpIcon, ClockIcon, StarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { PostCard } from '../../components/community/PostCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

// Mock data for posts
const mockPosts = [{
  id: '1',
  title: 'Tips for freelancers working remotely',
  content: 'Working remotely as a freelancer can be challenging. Here are some tips that have helped me stay productive and maintain a work-life balance...',
  author: {
    id: '1',
    name: 'Janu Patel',
    profileImage: '',
    role: 'employee'
  },
  timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
  // 2 hours ago
  likes: 24,
  comments: 7,
  tags: ['Remote Work', 'Freelancing', 'Productivity']
}, {
  id: '2',
  title: 'How to find reliable part-time talent',
  content: 'As an employer, I have learned a lot about finding and retaining quality part‑time talent. The key is to establish clear expectations and communication channels.',
  author: {
    id: '2',
    name: 'TechSolutions Pvt Ltd',
    profileImage: '',
    role: 'employer'
  },
  timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
  // 5 hours ago
  likes: 18,
  comments: 5,
  tags: ['Hiring', 'Management', 'Best Practices']
}, {
  id: '3',
  title: 'Payment dispute resolution - My experience',
  content: "I recently had a payment dispute with a client that was resolved through the platform's mediation. Here's how the process worked and what I learned...",
  author: {
    id: '3',
    name: 'Aditya Sharma',
    profileImage: '',
    role: 'employee'
  },
  timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
  // 1 day ago
  likes: 32,
  comments: 12,
  tags: ['Disputes', 'Payments', 'Advice']
}, {
  id: '4',
  title: 'Announcing our company flexible work policy',
  content: 'We are excited to share that our company is now offering more flexible work arrangements for all employees. This includes part‑time options and remote work possibilities.',
  author: {
    id: '4',
    name: 'Creative Agency',
    profileImage: '',
    role: 'employer'
  },
  timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36),
  // 1.5 days ago
  likes: 45,
  comments: 8,
  tags: ['Company News', 'Flexible Work', 'Remote Work']
}];
export const CommunityHub: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'trending' | 'newest' | 'top'>('trending');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  
  const topicsRef = useRef<HTMLDivElement>(null);

  // Extract all unique tags from posts
  const allTags = Array.from(new Set(mockPosts.flatMap(post => post.tags || [])));

  // Filter and sort posts
  const filteredPosts = mockPosts.filter(post => post.title.toLowerCase().includes(searchTerm.toLowerCase()) || post.content.toLowerCase().includes(searchTerm.toLowerCase())).filter(post => !selectedTag || post.tags?.includes(selectedTag)).sort((a, b) => {
    if (sortBy === 'newest') {
      return b.timestamp.getTime() - a.timestamp.getTime();
    } else if (sortBy === 'top') {
      return b.likes - a.likes;
    } else {
      // Trending - combination of recency and popularity
      const recencyScore = b.timestamp.getTime() - a.timestamp.getTime();
      const popularityScore = b.likes + b.comments * 2 - (a.likes + a.comments * 2);
      return popularityScore + recencyScore / (1000 * 60 * 60 * 24); // Normalize recency to days
    }
  });

  // Handle scroll for topics
  const handleScroll = (direction: 'left' | 'right') => {
    if (!topicsRef.current) return;
    
    const scrollAmount = 200;
    const currentScroll = topicsRef.current.scrollLeft;
    const newScroll = direction === 'left' 
      ? currentScroll - scrollAmount 
      : currentScroll + scrollAmount;
    
    topicsRef.current.scrollTo({
      left: newScroll,
      behavior: 'smooth'
    });
  };

  // Handle wheel scroll for topics
  const handleWheelScroll = (e: React.WheelEvent) => {
    if (!topicsRef.current) return;
    
    e.preventDefault();
    const scrollAmount = e.deltaY > 0 ? 100 : -100;
    topicsRef.current.scrollLeft += scrollAmount;
  };

  // Handle touch gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsScrolling(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isScrolling || !topicsRef.current) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    const deltaX = touch.clientX - (topicsRef.current.dataset.lastTouchX || 0);
    topicsRef.current.scrollLeft -= deltaX;
    topicsRef.current.dataset.lastTouchX = touch.clientX.toString();
  };

  const handleTouchEnd = () => {
    setIsScrolling(false);
    if (topicsRef.current) {
      delete topicsRef.current.dataset.lastTouchX;
    }
  };
  return <>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Community Hub
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Connect, share experiences, and learn from others
            </p>
          </div>
          <Link to="/community/create">
            <Button variant="primary" leftIcon={<PlusIcon className="h-5 w-5" />}>
              Create Post
            </Button>
          </Link>
        </div>
        <div className="bg-white dark:bg-neutral-800 shadow rounded-lg p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input type="text" placeholder="Search posts..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} leftIcon={<SearchIcon className="h-4 w-4 text-neutral-400" />} />
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={() => setSortBy('trending')} className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${sortBy === 'trending' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'}`}>
                <TrendingUpIcon className="h-4 w-4 mr-1" />
                Trending
              </button>
              <button onClick={() => setSortBy('newest')} className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${sortBy === 'newest' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'}`}>
                <ClockIcon className="h-4 w-4 mr-1" />
                Newest
              </button>
              <button onClick={() => setSortBy('top')} className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${sortBy === 'top' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'}`}>
                <StarIcon className="h-4 w-4 mr-1" />
                Top
              </button>
            </div>
          </div>
          <div className="mb-6 relative">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleScroll('left')}
                className="p-2 rounded-full bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <div 
                ref={topicsRef}
                className="flex-1 overflow-x-auto scrollbar-hide"
                onWheel={handleWheelScroll}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <div className="flex space-x-2 pb-2">
                  <button 
                    onClick={() => setSelectedTag(null)} 
                    className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-all duration-200 ${selectedTag === null ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300' : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'}`}
                  >
                    All Topics
                  </button>
                  {allTags.map(tag => (
                    <button 
                      key={tag} 
                      onClick={() => setSelectedTag(tag === selectedTag ? null : tag)} 
                      className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-all duration-200 ${tag === selectedTag ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300' : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              
              <button
                onClick={() => handleScroll('right')}
                className="p-2 rounded-full bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="space-y-6">
            {filteredPosts.length > 0 ? filteredPosts.map(post => <PostCard key={post.id} id={post.id} title={post.title} content={post.content} author={post.author} timestamp={post.timestamp} likes={post.likes} comments={post.comments} tags={post.tags} />) : <div className="text-center py-10">
                <p className="text-neutral-500 dark:text-neutral-400">
                  No posts found
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                  Try adjusting your search or filters
                </p>
              </div>}
          </div>
        </div>
      </div>
    </>;
};