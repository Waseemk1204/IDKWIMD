import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { ArrowRightIcon } from 'lucide-react';
export const AdminDashboard: React.FC = () => {
  return <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Admin Dashboard
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Verification Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Pending verification
            </p>
            <Link to="/admin/verification" className="mt-4 text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center hover:underline">
              Review requests
              <ArrowRightIcon className="ml-1 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Job Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">8</div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Pending approval
            </p>
            <Link to="/admin/job-approval" className="mt-4 text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center hover:underline">
              Review jobs
              <ArrowRightIcon className="ml-1 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Disputes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">3</div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Require resolution
            </p>
            <Link to="/admin/disputes" className="mt-4 text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center hover:underline">
              Manage disputes
              <ArrowRightIcon className="ml-1 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Platform Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">256</div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total registered users
            </p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    New User Registration
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Vikram Mehta (Employer)
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    10 minutes ago
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    New Job Posted
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Web Developer by TechSolutions
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    2 hours ago
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Dispute Filed
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Between Creative Agency and Janu Patel
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    1 day ago
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>;
};