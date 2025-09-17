import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CardContent, ElevatedCard } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Share2, 
  Bookmark,
  ThumbsUp,
  MessageCircle,
  Eye,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { getBlogById, getRelatedBlogs, formatBlogDate, formatBlogViews } from '../../data/blogs';

export const BlogPostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Get blog post from unified data source
  const currentPost = id ? getBlogById(id) : null;
  const relatedPosts = id ? getRelatedBlogs(id, 3) : [];

  if (!currentPost) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Blog Post Not Found
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            The blog post you're looking for doesn't exist or has been moved.
          </p>
          <Button onClick={() => navigate('/blogs')} className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Blogs</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="mb-8">
          <Button 
            onClick={() => navigate('/blogs')} 
            variant="outline" 
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Blogs</span>
          </Button>
        </div>

        {/* Article Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Badge variant="primary">{currentPost.category}</Badge>
            <div className="flex items-center space-x-4 text-sm text-neutral-600 dark:text-neutral-400">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{formatBlogDate(currentPost.publishDate)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{currentPost.readTime}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>{formatBlogViews(currentPost.views)}</span>
              </div>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-6 leading-tight">
            {currentPost.title}
          </h1>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                <span className="text-primary-600 dark:text-primary-400 font-semibold text-lg">
                  {currentPost.author.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-white">
                  {currentPost.author}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {currentPost.authorRole}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <ThumbsUp className="h-4 w-4" />
                <span>{currentPost.likes}</span>
              </Button>
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <MessageCircle className="h-4 w-4" />
                <span>{currentPost.comments}</span>
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Bookmark className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <div className="mb-8">
          <img 
            src={currentPost.thumbnail} 
            alt={currentPost.title}
            className="w-full h-64 md:h-96 object-cover rounded-xl"
          />
        </div>

        {/* Article Content */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <ElevatedCard>
              <CardContent className="p-8">
                <div 
                  className="prose prose-lg dark:prose-invert max-w-none
                    prose-headings:text-neutral-900 dark:prose-headings:text-white
                    prose-p:text-neutral-700 dark:prose-p:text-neutral-300
                    prose-li:text-neutral-700 dark:prose-li:text-neutral-300
                    prose-strong:text-neutral-900 dark:prose-strong:text-white
                    prose-a:text-primary-600 dark:prose-a:text-primary-400
                    prose-blockquote:border-primary-500
                    prose-code:text-primary-600 dark:prose-code:text-primary-400"
                  dangerouslySetInnerHTML={{ __html: currentPost.content }}
                />

                {/* Tags */}
                <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-700">
                  <div className="flex flex-wrap gap-2">
                    {currentPost.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-sm rounded-full hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors cursor-pointer"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </ElevatedCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Author Bio */}
            <ElevatedCard>
              <CardContent className="p-6">
                <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">
                  About the Author
                </h3>
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-600 dark:text-primary-400 font-semibold">
                      {currentPost.author.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900 dark:text-white">
                      {currentPost.author}
                    </h4>
                    <p className="text-sm text-primary-600 dark:text-primary-400 mb-2">
                      {currentPost.authorRole}
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {currentPost.authorBio}
                    </p>
                  </div>
                </div>
              </CardContent>
            </ElevatedCard>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <ElevatedCard>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">
                    Related Articles
                  </h3>
                  <div className="space-y-4">
                    {relatedPosts.map((post) => (
                      <Link 
                        key={post.id} 
                        to={`/blogs/${post.id}`}
                        className="block group"
                      >
                        <div className="flex space-x-3">
                          <img 
                            src={post.thumbnail} 
                            alt={post.title}
                            className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-neutral-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                              {post.title}
                            </h4>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                              {formatBlogDate(post.publishDate)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </ElevatedCard>
            )}

            {/* Newsletter Signup */}
            <ElevatedCard>
              <CardContent className="p-6 text-center">
                <BookOpen className="h-8 w-8 text-primary-600 dark:text-primary-400 mx-auto mb-4" />
                <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
                  Stay Updated
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                  Get the latest articles and career tips delivered to your inbox.
                </p>
                <div className="space-y-3">
                  <input 
                    type="email" 
                    placeholder="Enter your email"
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <Button className="w-full">
                    Subscribe
                  </Button>
                </div>
              </CardContent>
            </ElevatedCard>
          </div>
        </div>

        {/* Back to Top */}
        <div className="mt-12 text-center">
          <Button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            variant="outline"
            className="flex items-center space-x-2 mx-auto"
          >
            <ArrowRight className="h-4 w-4 rotate-[-90deg]" />
            <span>Back to Top</span>
          </Button>
        </div>
      </div>
    </div>
  );
};