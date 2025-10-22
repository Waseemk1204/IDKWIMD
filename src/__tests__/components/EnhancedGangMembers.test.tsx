import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EnhancedGangMembers } from '../../pages/employee/EnhancedGangMembers';
import { ConnectionInsights } from '../../components/connections/ConnectionInsights';
import { ConnectionStrength } from '../../components/connections/ConnectionStrength';
import { AuthProvider } from '../../context/AuthContext';
import apiService from '../../services/api';

// Mock the API service
jest.mock('../../services/api');
const mockedApiService = apiService as jest.Mocked<typeof apiService>;

// Mock user data
const mockUser = {
  _id: 'user1',
  fullName: 'John Doe',
  username: 'johndoe',
  email: 'john@test.com',
  role: 'employee',
  skills: ['JavaScript', 'React', 'Node.js'],
  location: 'New York',
  companyInfo: {
    companyName: 'Tech Corp'
  }
};

// Mock API responses
const mockRecommendations = [
  {
    _id: 'rec1',
    recommendedUserId: {
      _id: 'user2',
      fullName: 'Jane Smith',
      email: 'jane@test.com',
      profilePhoto: '',
      headline: 'Senior Developer',
      skills: ['JavaScript', 'Python', 'React']
    },
    reasons: [
      {
        type: 'shared_skills',
        weight: 25,
        details: '2 shared skills: JavaScript, React'
      },
      {
        type: 'same_location',
        weight: 15,
        details: 'Both located in New York'
      }
    ],
    score: 85,
    createdAt: new Date().toISOString()
  }
];

const mockAnalytics = {
  summary: {
    totalConnections: 5,
    strongConnections: 2,
    totalMessages: 150,
    avgStrength: 75
  },
  connectionGrowth: [
    { _id: { year: 2024, month: 1 }, count: 2 },
    { _id: { year: 2024, month: 2 }, count: 3 }
  ],
  analytics: [
    {
      connectionId: 'conn1',
      strength: 85,
      strengthCategory: 'strong',
      messageCount: 50,
      lastInteraction: new Date().toISOString(),
      mutualConnections: 3,
      sharedJobApplications: 2
    }
  ]
};

const mockMutualConnections = [
  {
    _id: 'user3',
    fullName: 'Bob Wilson',
    username: 'bobwilson',
    profilePhoto: ''
  }
];

describe('Enhanced Gang Members System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful API responses
    mockedApiService.getConnectionRecommendations.mockResolvedValue({
      success: true,
      data: { recommendations: mockRecommendations }
    });
    
    mockedApiService.getConnectionAnalytics.mockResolvedValue({
      success: true,
      data: mockAnalytics
    });
    
    mockedApiService.getMutualConnections.mockResolvedValue({
      success: true,
      data: { mutualConnections: mockMutualConnections }
    });
    
    mockedApiService.sendConnectionRequest.mockResolvedValue({
      success: true,
      message: 'Connection request sent'
    });
    
    mockedApiService.dismissRecommendation.mockResolvedValue({
      success: true,
      message: 'Recommendation dismissed'
    });
  });

  describe('EnhancedGangMembers Component', () => {
    it('should render recommendations tab by default', async () => {
      render(
        <AuthProvider>
          <EnhancedGangMembers />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Enhanced Gang Members')).toBeInTheDocument();
        expect(screen.getByText('Recommendations')).toBeInTheDocument();
      });
    });

    it('should display connection recommendations', async () => {
      render(
        <AuthProvider>
          <EnhancedGangMembers />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('85% match')).toBeInTheDocument();
        expect(screen.getByText('2 shared skills: JavaScript, React')).toBeInTheDocument();
      });
    });

    it('should handle sending connection requests', async () => {
      render(
        <AuthProvider>
          <EnhancedGangMembers />
        </AuthProvider>
      );

      await waitFor(() => {
        const connectButton = screen.getByText('Connect');
        fireEvent.click(connectButton);
      });

      expect(mockedApiService.sendConnectionRequest).toHaveBeenCalledWith('user2');
    });

    it('should handle dismissing recommendations', async () => {
      render(
        <AuthProvider>
          <EnhancedGangMembers />
        </AuthProvider>
      );

      await waitFor(() => {
        const dismissButton = screen.getByRole('button', { name: '' }); // X button
        fireEvent.click(dismissButton);
      });

      expect(mockedApiService.dismissRecommendation).toHaveBeenCalledWith('rec1');
    });

    it('should switch to analytics tab', async () => {
      render(
        <AuthProvider>
          <EnhancedGangMembers />
        </AuthProvider>
      );

      await waitFor(() => {
        const analyticsTab = screen.getByText('Analytics');
        fireEvent.click(analyticsTab);
      });

      await waitFor(() => {
        expect(screen.getByText('Total Connections')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
        expect(screen.getByText('Strong Connections')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
      });
    });

    it('should display loading states', () => {
      mockedApiService.getConnectionRecommendations.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(
        <AuthProvider>
          <EnhancedGangMembers />
        </AuthProvider>
      );

      expect(screen.getByText('Loading recommendations...')).toBeInTheDocument();
    });

    it('should handle empty recommendations', async () => {
      mockedApiService.getConnectionRecommendations.mockResolvedValue({
        success: true,
        data: { recommendations: [] }
      });

      render(
        <AuthProvider>
          <EnhancedGangMembers />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('No recommendations available')).toBeInTheDocument();
        expect(screen.getByText('We\'ll suggest connections based on your profile and network')).toBeInTheDocument();
      });
    });
  });

  describe('ConnectionInsights Component', () => {
    it('should display mutual connections', async () => {
      render(
        <ConnectionInsights targetUserId="user2" />
      );

      await waitFor(() => {
        expect(screen.getByText('Mutual Connections (1)')).toBeInTheDocument();
        expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
      });
    });

    it('should display shared skills', async () => {
      mockedApiService.getUserById.mockResolvedValue({
        success: true,
        data: {
          user: {
            _id: 'user2',
            fullName: 'Jane Smith',
            skills: ['JavaScript', 'Python', 'React'],
            location: 'New York',
            companyInfo: { companyName: 'Tech Corp' }
          }
        }
      });

      render(
        <ConnectionInsights targetUserId="user2" />
      );

      await waitFor(() => {
        expect(screen.getByText('Shared Skills (2)')).toBeInTheDocument();
        expect(screen.getByText('JavaScript')).toBeInTheDocument();
        expect(screen.getByText('React')).toBeInTheDocument();
      });
    });

    it('should display connection strength', async () => {
      mockedApiService.getUserById.mockResolvedValue({
        success: true,
        data: {
          user: {
            _id: 'user2',
            fullName: 'Jane Smith',
            skills: ['JavaScript', 'Python', 'React'],
            location: 'New York',
            companyInfo: { companyName: 'Tech Corp' }
          }
        }
      });

      render(
        <ConnectionInsights targetUserId="user2" />
      );

      await waitFor(() => {
        expect(screen.getByText('Connection Strength')).toBeInTheDocument();
        expect(screen.getByText(/\d+%/)).toBeInTheDocument();
      });
    });

    it('should handle close action', () => {
      const onClose = jest.fn();
      render(
        <ConnectionInsights targetUserId="user2" onClose={onClose} />
      );

      const closeButton = screen.getByText('Close');
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('ConnectionStrength Component', () => {
    const mockProps = {
      strength: 85,
      messageCount: 50,
      lastInteraction: new Date().toISOString(),
      mutualConnections: 3,
      sharedJobApplications: 2,
      skillEndorsements: 5,
      profileViews: 20,
      contentInteractions: 10
    };

    it('should display connection strength', () => {
      render(<ConnectionStrength {...mockProps} />);

      expect(screen.getByText('Connection Strength')).toBeInTheDocument();
      expect(screen.getByText('85%')).toBeInTheDocument();
      expect(screen.getByText('Strong')).toBeInTheDocument();
    });

    it('should display strength meter', () => {
      render(<ConnectionStrength {...mockProps} />);

      const strengthMeter = screen.getByRole('progressbar', { hidden: true });
      expect(strengthMeter).toHaveStyle('width: 85%');
    });

    it('should display metrics', () => {
      render(<ConnectionStrength {...mockProps} />);

      expect(screen.getByText('50')).toBeInTheDocument(); // Messages
      expect(screen.getByText('3')).toBeInTheDocument(); // Mutual
      expect(screen.getByText('5')).toBeInTheDocument(); // Endorsements
      expect(screen.getByText('2')).toBeInTheDocument(); // Shared Jobs
    });

    it('should display strength factors', () => {
      render(<ConnectionStrength {...mockProps} />);

      expect(screen.getByText('Strength Factors')).toBeInTheDocument();
      expect(screen.getByText('Message Activity')).toBeInTheDocument();
      expect(screen.getByText('Network Overlap')).toBeInTheDocument();
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    });

    it('should handle different strength levels', () => {
      const weakProps = { ...mockProps, strength: 25 };
      render(<ConnectionStrength {...weakProps} />);

      expect(screen.getByText('25%')).toBeInTheDocument();
      expect(screen.getByText('Weak')).toBeInTheDocument();
    });

    it('should format last interaction correctly', () => {
      const recentDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // 1 day ago
      const recentProps = { ...mockProps, lastInteraction: recentDate };
      
      render(<ConnectionStrength {...recentProps} />);

      expect(screen.getByText('Yesterday')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      mockedApiService.getConnectionRecommendations.mockRejectedValue(
        new Error('API Error')
      );

      render(
        <AuthProvider>
          <EnhancedGangMembers />
        </AuthProvider>
      );

      await waitFor(() => {
        // Should not crash, should show empty state or error message
        expect(screen.getByText('Enhanced Gang Members')).toBeInTheDocument();
      });
    });

    it('should handle network errors', async () => {
      mockedApiService.getConnectionAnalytics.mockRejectedValue(
        new Error('Network Error')
      );

      render(
        <AuthProvider>
          <EnhancedGangMembers />
        </AuthProvider>
      );

      // Switch to analytics tab
      await waitFor(() => {
        const analyticsTab = screen.getByText('Analytics');
        fireEvent.click(analyticsTab);
      });

      await waitFor(() => {
        // Should show error state or empty state
        expect(screen.getByText('Enhanced Gang Members')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<ConnectionStrength {...{
        strength: 85,
        messageCount: 50,
        lastInteraction: new Date().toISOString(),
        mutualConnections: 3,
        sharedJobApplications: 2,
        skillEndorsements: 5,
        profileViews: 20,
        contentInteractions: 10
      }} />);

      expect(screen.getByText('Connection Strength')).toBeInTheDocument();
      expect(screen.getByText('Overall Strength')).toBeInTheDocument();
    });

    it('should be keyboard navigable', () => {
      render(
        <AuthProvider>
          <EnhancedGangMembers />
        </AuthProvider>
      );

      const tabs = screen.getAllByRole('tab');
      expect(tabs.length).toBeGreaterThan(0);

      // Test tab navigation
      fireEvent.keyDown(tabs[0], { key: 'ArrowRight' });
      expect(document.activeElement).toBe(tabs[1]);
    });
  });
});

