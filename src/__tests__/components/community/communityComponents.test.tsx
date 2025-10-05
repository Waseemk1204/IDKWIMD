import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { EnhancedPostCard } from '../../components/community/EnhancedPostCard';
import { GangCommunityIntegration } from '../../components/community/GangCommunityIntegration';
import { ProfessionalRecommendations } from '../../components/community/ProfessionalRecommendations';

// Mock the API service
jest.mock('../../services/api', () => ({
  getEnhancedCommunityPosts: jest.fn(),
  getTrendingPosts: jest.fn(),
  getConnectionRecommendations: jest.fn(),
  getJobs: jest.fn(),
  toggleEnhancedPostLike: jest.fn(),
  togglePostBookmark: jest.fn(),
  sharePost: jest.fn(),
  addHelpfulVote: jest.fn(),
  addExpertEndorsement: jest.fn(),
  dismissRecommendation: jest.fn(),
  getUserConnections: jest.fn(),
  getUserReputation: jest.fn()
}));

// Mock the auth hook
jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      _id: 'user123',
      fullName: 'John Doe',
      email: 'john@example.com',
      role: 'employee',
      skills: ['javascript', 'react', 'nodejs']
    },
    isAuthenticated: true
  })
}));

// Mock the UI components
jest.mock('../../components/ui/Avatar', () => ({
  Avatar: ({ name, src, size }: any) => (
    <div data-testid="avatar" data-name={name} data-src={src} data-size={size}>
      {name}
    </div>
  )
}));

jest.mock('../../components/ui/Button', () => ({
  Button: ({ children, onClick, variant, size, disabled, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid="button"
      data-variant={variant}
      data-size={size}
      {...props}
    >
      {children}
    </button>
  )
}));

const mockPost = {
  _id: 'post123',
  title: 'Test Post Title',
  content: 'This is a test post content that should be displayed properly.',
  author: {
    _id: 'author123',
    name: 'Jane Smith',
    email: 'jane@example.com',
    profilePhoto: 'https://example.com/photo.jpg',
    role: 'employee',
    headline: 'Senior Developer',
    skills: ['javascript', 'react']
  },
  category: {
    _id: 'cat123',
    name: 'Technology',
    slug: 'technology',
    color: '#3B82F6',
    icon: '💻'
  },
  type: 'discussion',
  createdAt: new Date().toISOString(),
  likes: 15,
  comments: [],
  views: 100,
  tags: ['react', 'javascript', 'frontend'],
  professionalContext: {
    industry: 'technology',
    skillLevel: 'intermediate',
    relatedSkills: ['javascript', 'react'],
    jobRelevance: true
  },
  engagement: {
    helpfulVotes: 8,
    expertEndorsements: 3,
    shares: 5,
    bookmarks: 12
  },
  mentorship: {
    isMentorshipRequest: false
  },
  isFeatured: false,
  isPinned: false,
  timeAgo: '2h ago',
  commentCount: 5,
  engagementScore: 45,
  isTrending: true,
  professionalRelevanceScore: 8
};

const mockGangMembers = [
  {
    _id: 'gang1',
    user: {
      _id: 'user1',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      profilePhoto: 'https://example.com/alice.jpg',
      role: 'employee',
      headline: 'Frontend Developer',
      skills: ['react', 'vue', 'css']
    },
    status: 'accepted',
    strength: 85,
    messageCount: 12,
    lastInteraction: '2024-01-15T10:00:00Z',
    mutualConnections: 5
  },
  {
    _id: 'gang2',
    user: {
      _id: 'user2',
      name: 'Bob Wilson',
      email: 'bob@example.com',
      profilePhoto: 'https://example.com/bob.jpg',
      role: 'employee',
      headline: 'Backend Developer',
      skills: ['nodejs', 'python', 'database']
    },
    status: 'accepted',
    strength: 72,
    messageCount: 8,
    lastInteraction: '2024-01-14T15:30:00Z',
    mutualConnections: 3
  }
];

const mockRecommendations = [
  {
    _id: 'rec1',
    recommendedUser: {
      _id: 'recuser1',
      name: 'Sarah Davis',
      email: 'sarah@example.com',
      profilePhoto: 'https://example.com/sarah.jpg',
      role: 'employee',
      headline: 'Full Stack Developer',
      skills: ['javascript', 'react', 'nodejs', 'mongodb'],
      location: 'San Francisco, CA'
    },
    score: 92,
    reasons: [
      'You have 3 shared skills',
      'Located in the same city',
      'Similar experience level'
    ],
    mutualConnections: 4,
    sharedSkills: ['javascript', 'react', 'nodejs'],
    sameLocation: true,
    sameCompany: false
  }
];

describe('EnhancedPostCard', () => {
  const getPostTypeIcon = (type: string) => {
    return <span data-testid={`icon-${type}`}>{type}</span>;
  };

  const getPostTypeColor = (type: string) => {
    return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
  };

  it('renders post information correctly', () => {
    render(
      <BrowserRouter>
        <EnhancedPostCard
          post={mockPost}
          getPostTypeIcon={getPostTypeIcon}
          getPostTypeColor={getPostTypeColor}
        />
      </BrowserRouter>
    );

    expect(screen.getByText('Test Post Title')).toBeInTheDocument();
    expect(screen.getByText('This is a test post content that should be displayed properly.')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Senior Developer')).toBeInTheDocument();
    expect(screen.getByText('2h ago')).toBeInTheDocument();
  });

  it('displays professional context when available', () => {
    render(
      <BrowserRouter>
        <EnhancedPostCard
          post={mockPost}
          getPostTypeIcon={getPostTypeIcon}
          getPostTypeColor={getPostTypeColor}
        />
      </BrowserRouter>
    );

    expect(screen.getByText('technology')).toBeInTheDocument();
    expect(screen.getByText('intermediate')).toBeInTheDocument();
    expect(screen.getByText('Job Relevant')).toBeInTheDocument();
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('javascript')).toBeInTheDocument();
  });

  it('displays engagement metrics', () => {
    render(
      <BrowserRouter>
        <EnhancedPostCard
          post={mockPost}
          getPostTypeIcon={getPostTypeIcon}
          getPostTypeColor={getPostTypeColor}
        />
      </BrowserRouter>
    );

    expect(screen.getByText('15')).toBeInTheDocument(); // likes
    expect(screen.getByText('100 views')).toBeInTheDocument();
    expect(screen.getByText('5 comments')).toBeInTheDocument();
    expect(screen.getByText('45 engagement')).toBeInTheDocument();
  });

  it('shows trending indicator when post is trending', () => {
    render(
      <BrowserRouter>
        <EnhancedPostCard
          post={mockPost}
          getPostTypeIcon={getPostTypeIcon}
          getPostTypeColor={getPostTypeColor}
        />
      </BrowserRouter>
    );

    expect(screen.getByText('Trending')).toBeInTheDocument();
  });

  it('handles like button click', async () => {
    const apiService = require('../../services/api');
    apiService.toggleEnhancedPostLike.mockResolvedValue({
      success: true,
      data: { likesCount: 16, isLiked: true }
    });

    render(
      <BrowserRouter>
        <EnhancedPostCard
          post={mockPost}
          getPostTypeIcon={getPostTypeIcon}
          getPostTypeColor={getPostTypeColor}
        />
      </BrowserRouter>
    );

    const likeButton = screen.getAllByTestId('button')[0]; // First button is like button
    fireEvent.click(likeButton);

    await waitFor(() => {
      expect(apiService.toggleEnhancedPostLike).toHaveBeenCalledWith('post123');
    });
  });

  it('handles bookmark button click', async () => {
    const apiService = require('../../services/api');
    apiService.togglePostBookmark.mockResolvedValue({
      success: true,
      data: { isBookmarked: true }
    });

    render(
      <BrowserRouter>
        <EnhancedPostCard
          post={mockPost}
          getPostTypeIcon={getPostTypeIcon}
          getPostTypeColor={getPostTypeColor}
        />
      </BrowserRouter>
    );

    const bookmarkButton = screen.getAllByTestId('button').find(btn => 
      btn.textContent?.includes('12') // bookmark count
    );
    
    if (bookmarkButton) {
      fireEvent.click(bookmarkButton);

      await waitFor(() => {
        expect(apiService.togglePostBookmark).toHaveBeenCalledWith('post123');
      });
    }
  });
});

describe('GangCommunityIntegration', () => {
  beforeEach(() => {
    const apiService = require('../../services/api');
    apiService.getUserConnections.mockResolvedValue({
      success: true,
      data: { connections: mockGangMembers }
    });
    apiService.getEnhancedCommunityPosts.mockResolvedValue({
      success: true,
      data: { posts: [mockPost] }
    });
  });

  it('renders gang members section', async () => {
    render(
      <BrowserRouter>
        <GangCommunityIntegration />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Your Gang Members')).toBeInTheDocument();
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
    });
  });

  it('displays gang member strength and stats', async () => {
    render(
      <BrowserRouter>
        <GangCommunityIntegration />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('85%')).toBeInTheDocument();
      expect(screen.getByText('Strong')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument(); // message count
      expect(screen.getByText('Messages')).toBeInTheDocument();
    });
  });

  it('shows empty state when no gang members', async () => {
    const apiService = require('../../services/api');
    apiService.getUserConnections.mockResolvedValue({
      success: true,
      data: { connections: [] }
    });

    render(
      <BrowserRouter>
        <GangCommunityIntegration />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("You don't have any gang members yet")).toBeInTheDocument();
      expect(screen.getByText('Start Building Your Gang')).toBeInTheDocument();
    });
  });
});

describe('ProfessionalRecommendations', () => {
  beforeEach(() => {
    const apiService = require('../../services/api');
    apiService.getConnectionRecommendations.mockResolvedValue({
      success: true,
      data: { recommendations: mockRecommendations }
    });
    apiService.getTrendingPosts.mockResolvedValue({
      success: true,
      data: { posts: [mockPost] }
    });
    apiService.getJobs.mockResolvedValue({
      success: true,
      data: { jobs: [] }
    });
  });

  it('renders connection recommendations', async () => {
    render(
      <BrowserRouter>
        <ProfessionalRecommendations />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Recommended Connections')).toBeInTheDocument();
      expect(screen.getByText('Sarah Davis')).toBeInTheDocument();
      expect(screen.getByText('Full Stack Developer')).toBeInTheDocument();
      expect(screen.getByText('92% match')).toBeInTheDocument();
    });
  });

  it('displays recommendation reasons', async () => {
    render(
      <BrowserRouter>
        <ProfessionalRecommendations />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('You have 3 shared skills')).toBeInTheDocument();
      expect(screen.getByText('Located in the same city')).toBeInTheDocument();
      expect(screen.getByText('Similar experience level')).toBeInTheDocument();
    });
  });

  it('shows shared skills', async () => {
    render(
      <BrowserRouter>
        <ProfessionalRecommendations />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('javascript')).toBeInTheDocument();
      expect(screen.getByText('react')).toBeInTheDocument();
      expect(screen.getByText('nodejs')).toBeInTheDocument();
    });
  });

  it('handles dismiss recommendation', async () => {
    const apiService = require('../../services/api');
    apiService.dismissRecommendation.mockResolvedValue({
      success: true
    });

    render(
      <BrowserRouter>
        <ProfessionalRecommendations />
      </BrowserRouter>
    );

    await waitFor(() => {
      const dismissButton = screen.getByText('×');
      fireEvent.click(dismissButton);
    });

    await waitFor(() => {
      expect(apiService.dismissRecommendation).toHaveBeenCalledWith('rec1');
    });
  });

  it('renders trending posts section', async () => {
    render(
      <BrowserRouter>
        <ProfessionalRecommendations />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Trending Professional Content')).toBeInTheDocument();
      expect(screen.getByText('Test Post Title')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('shows empty state when no recommendations', async () => {
    const apiService = require('../../services/api');
    apiService.getConnectionRecommendations.mockResolvedValue({
      success: true,
      data: { recommendations: [] }
    });
    apiService.getTrendingPosts.mockResolvedValue({
      success: true,
      data: { posts: [] }
    });

    render(
      <BrowserRouter>
        <ProfessionalRecommendations />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No recommendations yet')).toBeInTheDocument();
      expect(screen.getByText('Complete your profile and start engaging with the community to get personalized recommendations')).toBeInTheDocument();
    });
  });
});

