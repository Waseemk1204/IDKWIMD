import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { 
  Shield, 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Plus,
  Trash2,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface VerificationDocument {
  type: string;
  url: string;
  filename: string;
  uploadedAt: Date;
}

interface Verification {
  _id: string;
  type: 'identity' | 'employment' | 'education' | 'company';
  status: 'pending' | 'approved' | 'rejected';
  documents: VerificationDocument[];
  additionalData?: any;
  verifiedBy?: {
    _id: string;
    fullName: string;
    email: string;
  };
  verifiedAt?: Date;
  rejectionReason?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const Verification: React.FC = () => {
  const { user: _user, isAuthenticated } = useAuth();
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null);
  
  // Form state
  const [verificationType, setVerificationType] = useState<'identity' | 'employment' | 'education' | 'company'>('identity');
  const [documents, setDocuments] = useState<Array<{ type: string; url: string; filename: string }>>([]);
  const [additionalData, setAdditionalData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchVerifications();
    }
  }, [isAuthenticated]);

  const fetchVerifications = async () => {
    try {
      const response = await apiService.getMyVerifications();
      if (response.success) {
        setVerifications(response.data.verifications);
      } else {
        toast.error(response.message || 'Failed to load verifications');
      }
    } catch (error) {
      console.error('Error fetching verifications:', error);
      toast.error('An error occurred while loading verifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitVerification = async () => {
    if (documents.length === 0) {
      toast.error('Please upload at least one document');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiService.submitVerification({
        type: verificationType,
        documents,
        additionalData: Object.keys(additionalData).length > 0 ? additionalData : undefined
      });

      if (response.success) {
        toast.success('Verification request submitted successfully');
        setShowSubmitForm(false);
        setDocuments([]);
        setAdditionalData({});
        fetchVerifications();
      } else {
        toast.error(response.message || 'Failed to submit verification');
      }
    } catch (error) {
      console.error('Error submitting verification:', error);
      toast.error('An error occurred while submitting verification');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVerification = async (id: string) => {
    if (!confirm('Are you sure you want to delete this verification request?')) {
      return;
    }

    try {
      const response = await apiService.deleteVerification(id);
      if (response.success) {
        toast.success('Verification request deleted successfully');
        fetchVerifications();
      } else {
        toast.error(response.message || 'Failed to delete verification');
      }
    } catch (error) {
      console.error('Error deleting verification:', error);
      toast.error('An error occurred while deleting verification');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const getVerificationTypeLabel = (type: string) => {
    switch (type) {
      case 'identity':
        return 'Identity Verification';
      case 'employment':
        return 'Employment Verification';
      case 'education':
        return 'Education Verification';
      case 'company':
        return 'Company Verification';
      default:
        return type;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600 dark:text-gray-400">Please log in to access verification.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            Verification Center
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Submit documents to verify your identity, employment, education, or company
          </p>
        </div>
        <Button onClick={() => setShowSubmitForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Submit Verification
        </Button>
      </div>

      {/* Verification Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {verifications.filter(v => v.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Approved</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {verifications.filter(v => v.status === 'approved').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Rejected</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {verifications.filter(v => v.status === 'rejected').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verification Requests */}
      <Card>
        <CardHeader>
          <CardTitle>My Verification Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : verifications.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No verification requests yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Submit your first verification request to get started
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {verifications.map((verification) => (
                <div
                  key={verification._id}
                  className="border dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(verification.status)}
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {getVerificationTypeLabel(verification.type)}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Submitted {formatDistanceToNow(new Date(verification.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(verification.status)}
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedVerification(verification)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {verification.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteVerification(verification._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {verification.rejectionReason && (
                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <p className="text-sm text-red-800 dark:text-red-200">
                        <strong>Rejection Reason:</strong> {verification.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Verification Modal */}
      {showSubmitForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Submit Verification Request
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Verification Type
                  </label>
                  <Select 
                    value={verificationType} 
                    onChange={(e) => setVerificationType(e.target.value as "identity" | "employment" | "education" | "company")}
                    options={[
                      { value: 'identity', label: 'Identity Verification' },
                      { value: 'employment', label: 'Employment Verification' },
                      { value: 'education', label: 'Education Verification' },
                      { value: 'company', label: 'Company Verification' }
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Documents
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Upload your verification documents
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Supported formats: PDF, JPG, PNG (Max 10MB each)
                    </p>
                    <Button className="mt-3" variant="outline">
                      Choose Files
                    </Button>
                  </div>
                </div>

                {verificationType === 'employment' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Company Name
                      </label>
                      <Input
                        value={additionalData.companyName || ''}
                        onChange={(e) => setAdditionalData({ ...additionalData, companyName: e.target.value })}
                        placeholder="Enter company name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Position
                      </label>
                      <Input
                        value={additionalData.position || ''}
                        onChange={(e) => setAdditionalData({ ...additionalData, position: e.target.value })}
                        placeholder="Enter your position"
                      />
                    </div>
                  </div>
                )}

                {verificationType === 'education' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Institution Name
                      </label>
                      <Input
                        value={additionalData.institutionName || ''}
                        onChange={(e) => setAdditionalData({ ...additionalData, institutionName: e.target.value })}
                        placeholder="Enter institution name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Degree
                      </label>
                      <Input
                        value={additionalData.degree || ''}
                        onChange={(e) => setAdditionalData({ ...additionalData, degree: e.target.value })}
                        placeholder="Enter degree"
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowSubmitForm(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitVerification}
                    disabled={isSubmitting}
                    className="flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4" />
                        Submit Request
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verification Details Modal */}
      {selectedVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Verification Details
                </h2>
                <Button variant="ghost" size="icon" onClick={() => setSelectedVerification(null)}>
                  ×
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {getStatusIcon(selectedVerification.status)}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {getVerificationTypeLabel(selectedVerification.type)}
                    </h3>
                    {getStatusBadge(selectedVerification.status)}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Documents</h4>
                  <div className="space-y-2">
                    {selectedVerification.documents.map((doc, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{doc.filename}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedVerification.verifiedBy && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Verified By</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedVerification.verifiedBy.fullName} ({selectedVerification.verifiedBy.email})
                    </p>
                    {selectedVerification.verifiedAt && (
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        On {new Date(selectedVerification.verifiedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}

                {selectedVerification.notes && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Notes</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedVerification.notes}</p>
                  </div>
                )}

                {selectedVerification.rejectionReason && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Rejection Reason</h4>
                    <p className="text-sm text-red-700 dark:text-red-300">{selectedVerification.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
