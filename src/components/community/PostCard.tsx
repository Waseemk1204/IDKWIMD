import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from '../ui/Avatar';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquareIcon, ThumbsUpIcon } from 'lucide-react';
interface PostCardProps {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    profileImage?: string;
    role: string;
  };
  timestamp: Date;
  likes: number;
  comments: number;
  tags?: string[];
}
export const PostCard: React.FC<PostCardProps> = ({
  id,
  title,
  content,
  author,
  timestamp,
  likes,
  comments,
  tags = []
}) => {
  return <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <div className="p-5">
        <div className="flex items-center mb-4">
          <Avatar name={author.name} src={author.profileImage} size="sm" />
          <div className="ml-2">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {author.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {author.role ? author.role.charAt(0).toUpperCase() + author.role.slice(1) : 'User'} •{' '}
              {formatDistanceToNow(timestamp, {
              addSuffix: true
            })}
            </p>
          </div>
        </div>
        <Link to={`/community/post/${id}`} className="block">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 mb-2">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-3">
            {content}
          </p>
        </Link>
        {tags.length > 0 && <div className="flex flex-wrap gap-2 mb-4">
            {tags.map(tag => <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                {tag}
              </span>)}
          </div>}
        <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
          <button className="flex items-center hover:text-blue-600 dark:hover:text-blue-400 mr-4">
            <ThumbsUpIcon className="h-4 w-4 mr-1" />
            <span>{likes}</span>
          </button>
          <Link to={`/community/post/${id}`} className="flex items-center hover:text-blue-600 dark:hover:text-blue-400">
            <MessageSquareIcon className="h-4 w-4 mr-1" />
            <span>{comments}</span>
          </Link>
        </div>
      </div>
    </div>;
};