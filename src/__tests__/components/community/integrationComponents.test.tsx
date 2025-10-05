import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CommunityIntegrationLayer } from '../../../components/community/CommunityIntegrationLayer';
import { UnifiedActivityFeed } from '../../../components/community/UnifiedActivityFeed';

// Mock the API service
jest.mock('../../../services/api', () => ({
  messagePostAuthor: jest.fn(),
  inviteGangToDiscussion: jest.fn(),
  getPersonalizedDiscussions: jest.fn(),
  getUserConnections: jest.fn(),
  getJobs: jest.fn()
}));

// Mock the auth hook
jest.mock('../../../hooks/useAuth', () => ({
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
jest.mock('../../../components/ui/Button', () => ({
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
  content: 'This is a test post content.',
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
  tags: ['react', 'javascript', 'frontend']
};

describe('CommunityIntegrationLayer', () => {
  it('renders integration buttons correctly', () => {
    render(
      <BrowserRouter>
        <CommunityIntegrationLayer post={mockPost} />
      </BrowserRouter>
    );

    expect(screen.getByText('Message Author')).toBeInTheDocument();
    expect(screen.getByText('Invite Gang')).toBeInTheDocument();
    expect(screen.getByText('Share')).toBeInTheDocument();
  });

  it('handles message author click', async () => {
    const apiService = require('../../../services/api');
    apiService.messagePostAuthor.mockResolvedValue({
      success: true,
      data: { conversation: { _id: 'conv123' } }
    });

    const onMessageSent = jest.fn();

    render(
      <BrowserRouter>
        <CommunityIntegrationLayer post={mockPost} onMessageSent={onMessageSent} />
      </BrowserRouter>
    );

    const messageButton = screen.getByText('Message Author');
    fireEvent.click(messageButton);

    await waitFor(() => {
      expect(apiService.messagePostAuthor).toHaveBeenCalledWith('post123', 'author123');
      expect(onMessageSent).toHaveBeenCalled();
    });
  });

  it('handles invite gang click', async () => {
    const apiService = require('../../../services/api');
    apiService.inviteGangToDiscussion.mockResolvedValue({
      success: true,
      data: { invitations: [] }
    });

    const onInvitationSent = jest.fn();

    render(
      <BrowserRouter>
        <CommunityIntegrationLayer post={mockPost} onInvitationSent={onInvitationSent} />
      </BrowserRouter>
    );

    const inviteButton = screen.getByText('Invite Gang');
    fireEvent.click(inviteButton);

    // Should show modal
    expect(screen.getByText('Invite Gang Members')).toBeInTheDocument();
  });

  it('handles share button click', () => {
    // Mock navigator.share
    const mockShare = jest.fn();
    Object.defineProperty(navigator, 'share', {
      value: mockShare,
      writable: true
    });

    render(
      <BrowserRouter>
        <CommunityIntegrationLayer post={mockPost} />
      </BrowserRouter>
    );

    const shareButton = screen.getByText('Share');
    fireEvent.click(shareButton);

    expect(mockShare).toHaveBeenCalledWith({
      title: 'Test Post Title',
      url: window.location.href
    });
  });

  it('does not show message button for post author', () => {
    const apiService = require('../../../services/api');
    apiService.useAuth.mockReturnValue({
      user: {
        _id: 'author123', // Same as post author
        fullName: 'Jane Smith',
        email: 'jane@example.com',
        role: 'employee'
      },
      isAuthenticated: true
    });

    render(
      <BrowserRouter>
        <CommunityIntegrationLayer post={mockPost} />
      </BrowserRouter>
    );

    expect(screen.queryByText('Message Author')).not.toBeInTheDocument();
  });
});

describe('UnifiedActivityFeed', () => {
  beforeEach(() => {
    const apiService = require('../../../services/api');
    apiService.getPersonalizedDiscussions.mockResolvedValue({
      success: true,
      data: {
        discussions: [
          {
            _id: 'post1',
            title: 'React Best Practices',
            author: { fullName: 'Alice Johnson' },
            createdAt: new Date().toISOString(),
            relevanceScore: 85
          }
        ]
      }
    });

    apiService.getUserConnections.mockResolvedValue({
      success: true,
      data: {
        connections: [
          {
            _id: 'conn1',
            user: { fullName: 'Bob Wilson' },
            strength: 75,
            lastInteraction: new Date().toISOString()
          }
        ]
      }
    });

    apiService.getJobs.mockResolvedValue({
      success: true,
      data: {
        jobs: [
          {
            _id: 'job1',
            title: 'Frontend Developer',
            company: 'Tech Corp',
            createdAt: new Date().toISOString()
          }
        ]
      }
    });
  });

  it('renders unified activity feed', async () => {
    render(
      <BrowserRouter>
        <UnifiedActivityFeed />
      </BrowserRouter>
    );

    expect(screen.getByText('Your Unified Activity Feed')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('React Best Practices')).toBeInTheDocument();
      expect(screen.getByText('by Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('Relevance: 85%')).toBeInTheDocument();
    });
  });

  it('displays different activity types', async () => {
    render(
      <BrowserRouter>
        <UnifiedActivityFeed />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('React Best Practices')).toBeInTheDocument();
      expect(screen.getByText('Connection Activity')).toBeInTheDocument();
      expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    render(
      <BrowserRouter>
        <UnifiedActivityFeed />
      </BrowserRouter>
    );

    expect(screen.getByText('Loading activities...')).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    const apiService = require('../../../services/api');
    apiService.getPersonalizedDiscussions.mockRejectedValue(new Error('API Error'));

    render(
      <BrowserRouter>
        <UnifiedActivityFeed />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Your Unified Activity Feed')).toBeInTheDocument();
    });
  });
});
