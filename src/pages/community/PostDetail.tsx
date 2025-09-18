import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeftIcon, ThumbsUpIcon, MessageSquareIcon, ShareIcon, FlagIcon } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';
// Mock data for a post
const mockPost = {
  id: '1',
  title: 'Tips for freelancers working remotely',
  content: `Working remotely as a freelancer can be challenging. Here are some tips that have helped me stay productive and maintain a work-life balance:
1. **Create a dedicated workspace**: Even if it's just a corner of your room, having a designated area for work helps you get into the right mindset.
2. **Establish a routine**: Set regular working hours and stick to them. This helps separate work time from personal time.
3. **Take breaks**: Regular short breaks improve productivity. I follow the Pomodoro technique - 25 minutes of focused work followed by a 5-minute break.
4. **Stay connected**: Remote work can be isolating. Make an effort to connect with other professionals through online communities or virtual meetups.
5. **Track your time**: Use time-tracking tools to understand how you're spending your working hours and to ensure you're billing clients correctly.
What strategies have worked for you? I'd love to hear your experiences!`,
  author: {
    id: '1',
    name: 'Janu Patel',
    profileImage: '',
    role: 'employee'
  },
  timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
  likes: 24,
  comments: [{
    id: '1',
    author: {
      id: '2',
      name: 'Vikram Mehta',
      profileImage: '',
      role: 'employee'
    },
    content: 'Great tips! I also find that having a morning routine before starting work helps me get into the right mindset.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1),
    likes: 3
  }, {
    id: '2',
    author: {
      id: '3',
      name: 'TechSolutions Pvt Ltd',
      profileImage: '',
      role: 'employer'
    },
    content: 'As an employer, I encourage all our remote workers to follow these practices. Communication is key when working remotely!',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    likes: 5
  }],
  tags: ['Remote Work', 'Freelancing', 'Productivity']
};
export const PostDetail: React.FC = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const {
    user
  } = useAuth();
  const [liked, setLiked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(mockPost.comments);
  const [likesCount, setLikesCount] = useState(mockPost.likes);
  const handleLike = () => {
    if (liked) {
      setLikesCount(likesCount - 1);
    } else {
      setLikesCount(likesCount + 1);
    }
    setLiked(!liked);
  };
  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      const newComment = {
        id: `new-${Date.now()}`,
        author: {
          id: user?._id || 'current-user',
          name: user?.name || 'Current User',
          profileImage: user?.profileImage || '',
          role: user?.role || 'employee'
        },
        content: commentText,
        timestamp: new Date(),
        likes: 0
      };
      setComments([...comments, newComment]);
      setCommentText('');
    }
  };
  return <div className="space-y-6">
      <div className="flex items-center mb-4">
        <Link to="/community" className="mr-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Community Post
        </h1>
      </div>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="p-6">
          {/* Post Header */}
          <div className="flex items-center mb-4">
            <Avatar name={mockPost.author.name} src={mockPost.author.profileImage} size="md" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {mockPost.author.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {mockPost.author.role.charAt(0).toUpperCase() + mockPost.author.role.slice(1)}{' '}
                •{' '}
                {formatDistanceToNow(mockPost.timestamp, {
                addSuffix: true
              })}
              </p>
            </div>
          </div>
          {/* Post Content */}
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {mockPost.title}
          </h2>
          <div className="prose dark:prose-invert max-w-none mb-6">
            {mockPost.content.split('\n\n').map((paragraph, idx) => <p key={idx} className="mb-4 text-gray-700 dark:text-gray-300">
                {paragraph}
              </p>)}
          </div>
          {/* Tags */}
          {mockPost.tags && mockPost.tags.length > 0 && <div className="flex flex-wrap gap-2 mb-6">
              {mockPost.tags.map(tag => <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                  {tag}
                </span>)}
            </div>}
          {/* Post Actions */}
          <div className="flex items-center space-x-4 border-t border-b border-gray-200 dark:border-gray-700 py-3 mb-6">
            <button onClick={handleLike} className={`flex items-center space-x-1 ${liked ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'} hover:text-blue-600 dark:hover:text-blue-400`}>
              <ThumbsUpIcon className="h-5 w-5" />
              <span>{likesCount}</span>
            </button>
            <button className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
              <MessageSquareIcon className="h-5 w-5" />
              <span>{comments.length}</span>
            </button>
            <button className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
              <ShareIcon className="h-5 w-5" />
              <span>Share</span>
            </button>
            <button className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 ml-auto">
              <FlagIcon className="h-5 w-5" />
              <span>Report</span>
            </button>
          </div>
          {/* Comments Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Comments ({comments.length})
            </h3>
            {/* Comment Form */}
            <form onSubmit={handleComment} className="mb-6">
              <div className="flex items-start space-x-3">
                <Avatar name={user?.name || 'User'} src={user?.profileImage} size="sm" />
                <div className="flex-1">
                  <textarea value={commentText} onChange={e => setCommentText(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm" placeholder="Add a comment..."></textarea>
                  <div className="mt-2 flex justify-end">
                    <Button type="submit" variant="primary" size="sm" disabled={!commentText.trim()}>
                      Post Comment
                    </Button>
                  </div>
                </div>
              </div>
            </form>
            {/* Comments List */}
            <div className="space-y-6">
              {comments.map(comment => <div key={comment.id} className="flex space-x-3">
                  <Avatar name={comment.author.name} src={comment.author.profileImage} size="sm" />
                  <div className="flex-1">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {comment.author.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDistanceToNow(comment.timestamp, {
                          addSuffix: true
                        })}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {comment.content}
                      </p>
                    </div>
                    <div className="flex items-center mt-2 ml-4">
                      <button className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center">
                        <ThumbsUpIcon className="h-4 w-4 mr-1" />
                        <span>{comment.likes}</span>
                      </button>
                      <button className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 ml-4">
                        Reply
                      </button>
                    </div>
                  </div>
                </div>)}
            </div>
          </div>
        </div>
      </div>
    </div>;
};