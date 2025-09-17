import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Home, ArrowLeft, Search } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Card className="animate-fade-in-up">
          <CardContent className="text-center py-12">
            {/* 404 Icon */}
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full mb-6">
              <Search className="h-12 w-12 text-white" />
            </div>
            
            {/* Error Code */}
            <h1 className="text-6xl font-bold text-gradient bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-4">
              404
            </h1>
            
            {/* Error Message */}
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">
              Page Not Found
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-8">
              The page you're looking for doesn't exist or has been moved to a different location.
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/">
                <Button
                  variant="gradient"
                  size="lg"
                  leftIcon={<Home className="h-4 w-4" />}
                  className="w-full sm:w-auto"
                >
                  Go Home
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                leftIcon={<ArrowLeft className="h-4 w-4" />}
                onClick={() => window.history.back()}
                className="w-full sm:w-auto"
              >
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};