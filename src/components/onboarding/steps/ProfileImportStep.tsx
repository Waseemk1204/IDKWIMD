import React, { useState } from 'react';
<parameter name="content">import { Linkedin, Upload, Edit, CheckCircle, Loader2 } from 'lucide-react';
import { useOnboarding } from '../../../context/OnboardingContext';
import { useAuth } from '../../../hooks/useAuth';
import { ResumeUpload } from '../../profile/ResumeUpload';
import { ParsedDataReview } from '../../profile/ParsedDataReview';
import { linkedinAuthService } from '../../../services/linkedinAuth';
import { ParsedResumeData } from '../../../services/resumeService';
import { Button } from '../../ui/Button';

type ImportMethod = 'linkedin' | 'resume' | 'manual' | null;

export const ProfileImportStep: React.FC = () => {
  const { updateData } = useOnboarding();
  const { loginWithLinkedIn } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<ImportMethod>(null);
  const [parsedData, setParsedData] = useState<ParsedResumeData | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleLinkedInImport = async () => {
    setIsImporting(true);
    try {
      await linkedinAuthService.signIn('signup', 'employee');
      // The actual data import will happen after OAuth redirect
    } catch (error) {
      console.error('LinkedIn import failed:', error);
      setIsImporting(false);
    }
  };

  const handleResumeParseComplete = (data: ParsedResumeData) => {
    setParsedData(data);
  };

  const handleApplyParsedData = (data: ParsedResumeData) => {
    updateData({
      fullName: data.fullName,
      phone: data.phone,
      skills: data.skills,
      experiences: data.experiences,
      education: data.education
    });
    setParsedData(null);
  };

  const handleManualEntry = () => {
    setSelectedMethod('manual');
    // User will fill in the next steps manually
  };

  if (parsedData) {
    return (
      <div>
        <ParsedDataReview
          parsedData={parsedData}
          onSave={handleApplyParsedData}
          onCancel={() => setParsedData(null)}
        />
      </div>
    );
  }

  if (selectedMethod === 'resume') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient mb-3">
            Upload Your Resume
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            We'll extract your information automatically using AI
          </p>
        </div>

        <ResumeUpload
          onParseComplete={handleResumeParseComplete}
          onError={(error) => console.error(error)}
        />

        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            onClick={() => setSelectedMethod(null)}
          >
            ← Choose Different Method
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gradient mb-3">
          Import Your Professional Profile
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400">
          Choose the fastest way to complete your profile
        </p>
      </div>

      {/* Import Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* LinkedIn Import */}
        <button
          onClick={handleLinkedInImport}
          disabled={isImporting}
          className={`
            group p-6 rounded-xl border-2 transition-all duration-200
            ${selectedMethod === 'linkedin'
              ? 'border-[#0A66C2] bg-[#0A66C2]/5 dark:bg-[#0A66C2]/10'
              : 'border-neutral-200 dark:border-neutral-700 hover:border-[#0A66C2] hover:shadow-lg'
            }
            ${isImporting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-[#0A66C2] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              {isImporting ? (
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              ) : (
                <Linkedin className="w-8 h-8 text-white" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Import from LinkedIn
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              Quick import using OAuth
            </p>
            <div className="flex items-center space-x-2 text-xs text-[#0A66C2] font-medium">
              <CheckCircle className="w-4 h-4" />
              <span>Fastest method</span>
            </div>
            <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-500">
              ~30 seconds
            </div>
          </div>
        </button>

        {/* Resume Upload */}
        <button
          onClick={() => setSelectedMethod('resume')}
          className={`
            group p-6 rounded-xl border-2 transition-all duration-200
            ${selectedMethod === 'resume'
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
              : 'border-neutral-200 dark:border-neutral-700 hover:border-primary-500 hover:shadow-lg'
            }
            cursor-pointer
          `}
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Upload Resume
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              AI extracts your data
            </p>
            <div className="flex items-center space-x-2 text-xs text-primary-600 dark:text-primary-400 font-medium">
              <CheckCircle className="w-4 h-4" />
              <span>Recommended</span>
            </div>
            <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-500">
              ~1-2 minutes
            </div>
          </div>
        </button>

        {/* Manual Entry */}
        <button
          onClick={handleManualEntry}
          className={`
            group p-6 rounded-xl border-2 transition-all duration-200
            ${selectedMethod === 'manual'
              ? 'border-neutral-500 bg-neutral-50 dark:bg-neutral-700/50'
              : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 hover:shadow-lg'
            }
            cursor-pointer
          `}
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-neutral-400 dark:bg-neutral-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Edit className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Manual Entry
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              Fill in details yourself
            </p>
            <div className="flex items-center space-x-2 text-xs text-neutral-600 dark:text-neutral-400 font-medium">
              <Edit className="w-4 h-4" />
              <span>Full control</span>
            </div>
            <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-500">
              ~5-10 minutes
            </div>
          </div>
        </button>
      </div>

      {/* Comparison Table */}
      <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
        <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
          What each method imports:
        </h4>
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div className="text-neutral-600 dark:text-neutral-400 font-medium">Feature</div>
          <div className="text-center font-medium text-[#0A66C2]">LinkedIn</div>
          <div className="text-center font-medium text-primary-600">Resume</div>
          <div className="text-center font-medium text-neutral-600">Manual</div>

          <div className="text-neutral-600 dark:text-neutral-400">Contact Info</div>
          <div className="text-center"><CheckCircle className="w-4 h-4 text-success-600 mx-auto" /></div>
          <div className="text-center"><CheckCircle className="w-4 h-4 text-success-600 mx-auto" /></div>
          <div className="text-center"><CheckCircle className="w-4 h-4 text-success-600 mx-auto" /></div>

          <div className="text-neutral-600 dark:text-neutral-400">Work Experience</div>
          <div className="text-center"><CheckCircle className="w-4 h-4 text-success-600 mx-auto" /></div>
          <div className="text-center"><CheckCircle className="w-4 h-4 text-success-600 mx-auto" /></div>
          <div className="text-center"><CheckCircle className="w-4 h-4 text-success-600 mx-auto" /></div>

          <div className="text-neutral-600 dark:text-neutral-400">Education</div>
          <div className="text-center"><CheckCircle className="w-4 h-4 text-success-600 mx-auto" /></div>
          <div className="text-center"><CheckCircle className="w-4 h-4 text-success-600 mx-auto" /></div>
          <div className="text-center"><CheckCircle className="w-4 h-4 text-success-600 mx-auto" /></div>

          <div className="text-neutral-600 dark:text-neutral-400">Skills</div>
          <div className="text-center"><CheckCircle className="w-4 h-4 text-success-600 mx-auto" /></div>
          <div className="text-center"><CheckCircle className="w-4 h-4 text-success-600 mx-auto" /></div>
          <div className="text-center"><CheckCircle className="w-4 h-4 text-success-600 mx-auto" /></div>

          <div className="text-neutral-600 dark:text-neutral-400">Profile Photo</div>
          <div className="text-center"><CheckCircle className="w-4 h-4 text-success-600 mx-auto" /></div>
          <div className="text-center text-neutral-400">—</div>
          <div className="text-center"><CheckCircle className="w-4 h-4 text-success-600 mx-auto" /></div>
        </div>
      </div>

      {/* Note */}
      <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg">
        <p className="text-sm text-primary-900 dark:text-primary-100">
          💡 <strong>Tip:</strong> You can always edit the imported information in the next steps. Choose the method that works best for you!
        </p>
      </div>
    </div>
  );
};

