import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CardContent, ElevatedCard } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  ArrowRight, 
  TrendingUp,
  GraduationCap,
  Briefcase,
  Target,
  Lightbulb,
  Users,
  Star,
  Filter,
  Search
} from 'lucide-react';
import blogService, { BlogPost } from '../../services/blogService';

// BlogPost interface is now imported from unified data source

export const Blogs: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Array<{ name: string; count: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoryData = await blogService.getBlogCategoriesWithCounts();
        setCategories(categoryData);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    loadCategories();
  }, []);

  // Load blogs when filters change
  useEffect(() => {
    const loadBlogs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await blogService.getBlogsForBlogsPage({
          category: selectedCategory === 'All' ? undefined : selectedCategory,
          search: searchQuery || undefined,
          sortBy: 'publishedDate',
          sortOrder: 'desc',
          limit: 20
        });
        
        console.log('🔍 Blog data received:', {
          blogsCount: response.blogs?.length || 0,
          blogs: response.blogs?.map(blog => ({
            id: blog._id,
            title: blog.title,
            category: blog.category,
            author: blog.author?.name || blog.author?.fullName,
            hasContent: !!blog.content,
            hasExcerpt: !!blog.excerpt
          })) || []
        });
        
        setBlogPosts(response.blogs);
      } catch (error) {
        console.error('Error loading blogs:', error);
        setError('Failed to load blogs. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    loadBlogs();
  }, [selectedCategory, searchQuery]);

  const categoryIcons = {
    'All': BookOpen,
    'Career Tips': TrendingUp,
    'Skill Building': GraduationCap,
    'Workplace Trends': Briefcase,
    'Productivity': Target,
    'Employer Insights': Users
  };

  const categoriesWithIcons = categories.map(cat => ({
    name: cat.name,
    icon: categoryIcons[cat.name as keyof typeof categoryIcons] || BookOpen,
    count: cat.count
  }));

  const featuredPost = blogPosts.find(post => post.isFeatured);
  const recentPosts = blogPosts.filter(post => !post.isFeatured);
  
  // If all posts are featured or no recent posts, show all posts in the grid
  const postsToShow = recentPosts.length > 0 ? recentPosts : blogPosts;
  
  console.log('🔍 Blog filtering results:', {
    totalBlogs: blogPosts.length,
    featuredPost: featuredPost ? { id: featuredPost._id, title: featuredPost.title } : null,
    recentPostsCount: recentPosts.length,
    postsToShowCount: postsToShow.length,
    allPostsFeatured: recentPosts.length === 0 && blogPosts.length > 0,
    recentPosts: recentPosts.map(post => ({ id: post._id, title: post.title, isFeatured: post.isFeatured }))
  });

  // formatDate and formatViews are now imported from unified data source

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 bg-primary-50 dark:bg-primary-900/20 px-4 py-2 rounded-full">
          <BookOpen className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          <span className="text-primary-700 dark:text-primary-300 font-medium">PART-TIME PAY$ Blog</span>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
          Insights for
          <span className="text-primary-600 dark:text-primary-400"> Smart Workers</span>
        </h1>
        
        <p className="text-base md:text-lg text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
          Expert advice, career tips, and industry insights to help you succeed in the world of flexible work
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-neutral-500" />
          <div className="flex flex-wrap gap-2">
            {categoriesWithIcons.map((category) => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category.name
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-primary-50 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-600'
                }`}
              >
                <div className="flex items-center space-x-1">
                  <category.icon className="h-4 w-4" />
                  <span>{category.name}</span>
                  <span className="text-xs opacity-75">({category.count})</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Blog */}
      {featuredPost && (
        <ElevatedCard className="overflow-hidden">
          <div className="relative">
            <Badge 
              variant="primary" 
              className="absolute top-4 left-4 z-10 flex items-center space-x-1"
            >
              <Star className="h-3 w-3" />
              <span>Featured</span>
            </Badge>
            
            <div className="grid md:grid-cols-2 gap-0">
              <div className="relative h-64 md:h-full">
                <img
                  src={featuredPost.thumbnail}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              
              <div className="p-8 flex flex-col justify-center">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 text-sm text-neutral-600 dark:text-neutral-400">
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium">
                      {featuredPost.category}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{blogService.formatBlogDate(featuredPost.publishedDate)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{blogService.formatReadingTime(featuredPost.readingTime)}</span>
                    </div>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-white leading-tight">
                    {featuredPost.title}
                  </h2>
                  
                  <p className="text-neutral-600 dark:text-neutral-300 text-lg leading-relaxed">
                    {featuredPost.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {featuredPost.author.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-neutral-900 dark:text-white">
                          {featuredPost.author.name}
                        </div>
                        <div className="text-sm text-neutral-600 dark:text-neutral-400">
                          Author
                        </div>
                      </div>
                    </div>
                    
                    <Link to={`/blogs/${featuredPost._id}`}>
                      <Button variant="primary" className="flex items-center space-x-2">
                        <span>Read Article</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                  
                  <div className="text-sm text-neutral-500 dark:text-neutral-400">
                    {blogService.formatBlogViews(featuredPost.views)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ElevatedCard>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">Loading blogs...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Recent Blogs */}
      {!isLoading && !error && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
              {recentPosts.length > 0 ? 'Recent Articles' : 'All Articles'}
            </h2>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              {postsToShow.length} articles found
            </div>
          </div>
        
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {postsToShow.map((post) => (
              <ElevatedCard key={post._id} className="overflow-hidden">
                <div className="relative h-48">
                  <img
                    src={post.thumbnail}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
                    {post.category}
                  </span>
                </div>
                
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 text-xs text-neutral-500 dark:text-neutral-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{blogService.formatBlogDate(post.publishedDate)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{blogService.formatReadingTime(post.readingTime)}</span>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white leading-tight line-clamp-2">
                      {post.title}
                    </h3>
                    
                    <p className="text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {post.author.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-medium text-neutral-900 dark:text-white">
                            {post.author.name}
                          </div>
                          <div className="text-xs text-neutral-500 dark:text-neutral-400">
                            {blogService.formatBlogViews(post.views)}
                          </div>
                        </div>
                      </div>
                      
                      <Link to={`/blogs/${post._id}`}>
                        <Button variant="outline" size="sm" className="flex items-center space-x-1">
                          <span>Read More</span>
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 pt-2">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs rounded-md"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </ElevatedCard>
            ))}
          </div>
        </div>
      )}

      {/* Newsletter Signup */}
      <ElevatedCard className="text-center bg-primary-50 dark:bg-primary-900/20">
        <CardContent className="py-12">
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-full">
              <Lightbulb className="h-5 w-5" />
              <span className="font-medium">Stay Updated</span>
            </div>
            
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
              Never Miss an Insight
            </h2>
            
            <p className="text-neutral-600 dark:text-neutral-400">
              Get the latest career tips, industry trends, and success stories delivered to your inbox weekly.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <Button variant="primary" className="px-6">
                Subscribe
              </Button>
            </div>
            
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Join 10,000+ professionals already subscribed. Unsubscribe anytime.
            </p>
          </div>
        </CardContent>
      </ElevatedCard>
    </div>
  );
};

export default Blogs;
