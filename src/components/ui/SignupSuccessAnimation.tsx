import React, { useState, useEffect } from 'react';
import { CheckCircle, Heart, Star, Sparkles, Users, Trophy } from 'lucide-react';
import { Button } from './Button';
import { lockScroll, unlockScroll } from '../../utils/scrollLock';

interface SignupSuccessAnimationProps {
  userName?: string;
  userRole?: 'employee' | 'employer';
  onComplete?: () => void;
  isVisible: boolean;
}

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  velocity: { x: number; y: number };
}

export const SignupSuccessAnimation: React.FC<SignupSuccessAnimationProps> = ({
  userName = 'there',
  userRole = 'employee',
  onComplete,
  isVisible
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [showMessage, setShowMessage] = useState(false);

  // Animation steps
  const steps = [
    { duration: 1000, message: "Welcome to ParttimePays!" },
    { duration: 1500, message: `Thank you for joining us, ${userName}!` },
    { duration: 2000, message: "You're about to embark on an amazing journey!" },
    { duration: 1500, message: "You're the best! 🎉" }
  ];

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isVisible) {
      lockScroll();
    } else {
      unlockScroll();
    }
    
    // Cleanup function to ensure scroll is unlocked when component unmounts
    return () => {
      unlockScroll();
    };
  }, [isVisible]);

  // Generate confetti pieces
  const generateConfetti = () => {
    const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];
    const pieces: ConfettiPiece[] = [];
    
    // Use viewport dimensions for better mobile support
    const viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const viewportHeight = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
    
    for (let i = 0; i < 50; i++) {
      pieces.push({
        id: i,
        x: Math.random() * viewportWidth,
        y: -10,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        velocity: {
          x: (Math.random() - 0.5) * 4,
          y: Math.random() * 3 + 2
        }
      });
    }
    
    setConfetti(pieces);
  };

  // Animate confetti
  useEffect(() => {
    if (!isVisible) return;

    const animateConfetti = () => {
      const viewportHeight = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
      setConfetti(prev => 
        prev.map(piece => ({
          ...piece,
          x: piece.x + piece.velocity.x,
          y: piece.y + piece.velocity.y,
          rotation: piece.rotation + 5
        })).filter(piece => piece.y < viewportHeight + 50)
      );
    };

    const interval = setInterval(animateConfetti, 16);
    return () => clearInterval(interval);
  }, [isVisible]);

  // Step progression
  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        setShowMessage(true);
        setTimeout(() => {
          onComplete?.();
        }, 2000);
      }
    }, steps[currentStep].duration);

    return () => clearTimeout(timer);
  }, [currentStep, isVisible, onComplete]);

  // Generate confetti on mount
  useEffect(() => {
    if (isVisible) {
      generateConfetti();
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const getRoleMessage = () => {
    if (userRole === 'employer') {
      return "Ready to find amazing talent?";
    }
    return "Ready to find your perfect part-time job?";
  };

  const getRoleIcon = () => {
    if (userRole === 'employer') {
      return <Users className="w-8 h-8 text-blue-500" />;
    }
    return <Star className="w-8 h-8 text-yellow-500" />;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Confetti Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confetti.map(piece => (
          <div
            key={piece.id}
            className="absolute rounded-full animate-bounce"
            style={{
              left: piece.x,
              top: piece.y,
              width: piece.size,
              height: piece.size,
              backgroundColor: piece.color,
              transform: `rotate(${piece.rotation}deg)`,
              transition: 'all 0.1s ease-out'
            }}
          />
        ))}
      </div>

      {/* Main Animation Container */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-8 max-w-sm sm:max-w-md w-full text-center animate-fade-in-up">
        {/* Success Icon */}
        <div className="relative mb-4 sm:mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center animate-scale-in">
            <CheckCircle className="w-8 h-8 sm:w-12 sm:h-12 text-white animate-pulse" />
          </div>
          
          {/* Floating Icons */}
          <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 animate-bounce">
            <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-400" />
          </div>
          <div className="absolute -bottom-1 -left-1 sm:-bottom-2 sm:-left-2 animate-bounce" style={{ animationDelay: '0.5s' }}>
            <Heart className="w-4 h-4 sm:w-6 sm:h-6 text-red-400" />
          </div>
          <div className="absolute top-1/2 -left-3 sm:-left-4 animate-bounce" style={{ animationDelay: '1s' }}>
            <Trophy className="w-3 h-3 sm:w-5 sm:h-5 text-purple-400" />
          </div>
        </div>

        {/* Dynamic Message */}
        <div className="mb-4 sm:mb-6 min-h-[50px] sm:min-h-[60px] flex items-center justify-center">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white animate-fade-in-up leading-tight px-2">
            {steps[currentStep]?.message}
          </h2>
        </div>

        {/* Role-specific content */}
        {currentStep >= 2 && (
          <div className="mb-4 sm:mb-6 animate-fade-in-up">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              {getRoleIcon()}
              <p className="text-sm sm:text-lg text-gray-700 dark:text-gray-300 font-medium leading-tight">
                {getRoleMessage()}
              </p>
            </div>
          </div>
        )}

        {/* Final Message */}
        {showMessage && (
          <div className="mb-4 sm:mb-6 animate-fade-in-up">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-3 sm:p-4 border border-blue-200 dark:border-blue-700">
              <p className="text-sm sm:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1 sm:mb-2 leading-tight">
                🎉 You're absolutely amazing! 🎉
              </p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Thank you for choosing ParttimePays. We're excited to have you on board!
              </p>
            </div>
          </div>
        )}

        {/* Progress Indicator */}
        <div className="flex justify-center space-x-1.5 sm:space-x-2 mb-4 sm:mb-6">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300 ${
                index <= currentStep 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 scale-125' 
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Action Button */}
        {showMessage && (
          <div className="animate-fade-in-up">
            <Button
              onClick={onComplete}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-all duration-200 transform hover:scale-105 text-sm sm:text-base"
            >
              Let's Get Started! 🚀
            </Button>
          </div>
        )}

        {/* Background Pattern */}
        <div className="absolute inset-0 rounded-xl sm:rounded-2xl overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5"></div>
        </div>
      </div>
    </div>
  );
};
