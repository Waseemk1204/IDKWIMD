import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { 
  Award, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Star, 
  BookOpen, 
  Target,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

interface Skill {
  id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  verified: boolean;
  verificationMethod?: 'test' | 'portfolio' | 'certification' | 'experience';
  score?: number;
  verifiedAt?: string;
  expiresAt?: string;
}

interface SkillTest {
  id: string;
  skillId: string;
  title: string;
  description: string;
  questions: Array<{
    id: string;
    question: string;
    type: 'multiple-choice' | 'code' | 'practical';
    options?: string[];
    correctAnswer?: string;
    codeTemplate?: string;
  }>;
  timeLimit: number; // in minutes
  passingScore: number; // percentage
}

interface SkillVerificationProps {
  skills: Skill[];
  onSkillUpdate: (skills: Skill[]) => void;
  onClose?: () => void;
}

const mockTests: SkillTest[] = [
  {
    id: 'react-test',
    skillId: 'react',
    title: 'React Fundamentals Test',
    description: 'Test your knowledge of React basics, hooks, and component lifecycle',
    timeLimit: 30,
    passingScore: 70,
    questions: [
      {
        id: 'q1',
        question: 'What is the correct way to create a state variable in React?',
        type: 'multiple-choice',
        options: [
          'const [state, setState] = useState(initialValue)',
          'const state = useState(initialValue)',
          'const state = this.state',
          'const state = React.state'
        ],
        correctAnswer: 'const [state, setState] = useState(initialValue)'
      },
      {
        id: 'q2',
        question: 'Which hook is used for side effects in React?',
        type: 'multiple-choice',
        options: ['useState', 'useEffect', 'useContext', 'useReducer'],
        correctAnswer: 'useEffect'
      },
      {
        id: 'q3',
        question: 'Create a simple counter component with increment and decrement buttons',
        type: 'code',
        codeTemplate: `import React, { useState } from 'react';

const Counter = () => {
  // Your code here
  
  return (
    <div>
      {/* Your JSX here */}
    </div>
  );
};

export default Counter;`
      }
    ]
  },
  {
    id: 'javascript-test',
    skillId: 'javascript',
    title: 'JavaScript Advanced Test',
    description: 'Test your knowledge of advanced JavaScript concepts, ES6+, and async programming',
    timeLimit: 45,
    passingScore: 75,
    questions: [
      {
        id: 'q1',
        question: 'What is the output of the following code?\n\nconst arr = [1, 2, 3];\nconst doubled = arr.map(x => x * 2);\nconsole.log(doubled);',
        type: 'multiple-choice',
        options: ['[1, 2, 3]', '[2, 4, 6]', '[1, 4, 9]', 'Error'],
        correctAnswer: '[2, 4, 6]'
      },
      {
        id: 'q2',
        question: 'Which method is used to handle asynchronous operations in modern JavaScript?',
        type: 'multiple-choice',
        options: ['Promises', 'Callbacks', 'Async/Await', 'All of the above'],
        correctAnswer: 'All of the above'
      }
    ]
  }
];

export const SkillVerification: React.FC<SkillVerificationProps> = ({
  skills,
  onSkillUpdate,
  onClose
}) => {
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [currentTest, setCurrentTest] = useState<SkillTest | null>(null);
  const [testAnswers, setTestAnswers] = useState<Record<string, string>>({});
  const [testScore, setTestScore] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isTestActive, setIsTestActive] = useState(false);
  const [_verificationMethods, _setVerificationMethods] = useState<Record<string, string>>({}); // TODO: Implement verification methods functionality

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTestActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsTestActive(false);
            handleTestSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTestActive, timeRemaining]);

  const startTest = (skill: Skill) => {
    const test = mockTests.find(t => t.skillId === skill.id);
    if (!test) {
      toast.error('No test available for this skill');
      return;
    }

    setSelectedSkill(skill);
    setCurrentTest(test);
    setTimeRemaining(test.timeLimit * 60);
    setIsTestActive(true);
    setTestAnswers({});
    setTestScore(null);
  };

  const handleTestSubmit = () => {
    if (!currentTest) return;

    let correctAnswers = 0;
    const totalQuestions = currentTest.questions.length;

    currentTest.questions.forEach(question => {
      const userAnswer = testAnswers[question.id];
      if (question.type === 'multiple-choice' && userAnswer === question.correctAnswer) {
        correctAnswers++;
      }
      // For code questions, we'd need more sophisticated evaluation
    });

    const score = Math.round((correctAnswers / totalQuestions) * 100);
    setTestScore(score);
    setIsTestActive(false);

    if (score >= currentTest.passingScore) {
      toast.success(`Congratulations! You passed with ${score}%`);
      updateSkillVerification(selectedSkill!.id, 'test', score);
    } else {
      toast.error(`Test failed. You scored ${score}%. Minimum required: ${currentTest.passingScore}%`);
    }
  };

  const updateSkillVerification = async (skillId: string, method: string, score?: number) => {
    try {
      const updatedSkills = skills.map(skill => {
        if (skill.id === skillId) {
          return {
            ...skill,
            verified: true,
            verificationMethod: method as any,
            score: score || undefined,
            verifiedAt: new Date().toISOString(),
            expiresAt: method === 'test' ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : undefined
          };
        }
        return skill;
      });

      onSkillUpdate(updatedSkills);

      // TODO: Implement proper skill verification API endpoint
      // await apiService.updateVerification(skillId, {
      //   verified: true,
      //   verificationMethod: method,
      //   score,
      //   verifiedAt: new Date().toISOString()
      // });

    } catch (error: any) {
      toast.error('Failed to update skill verification');
    }
  };

  const getVerificationBadge = (skill: Skill) => {
    if (!skill.verified) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <Clock className="h-3 w-3 mr-1" />
          Not Verified
        </span>
      );
    }

    const badgeColor = skill.score && skill.score >= 80 ? 'green' : skill.score && skill.score >= 60 ? 'yellow' : 'blue';
    const colorClasses = {
      green: 'bg-green-100 text-green-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      blue: 'bg-blue-100 text-blue-800'
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorClasses[badgeColor]}`}>
        <CheckCircle className="h-3 w-3 mr-1" />
        Verified {skill.score ? `(${skill.score}%)` : ''}
      </span>
    );
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'expert': return <Star className="h-4 w-4 text-yellow-500" />;
      case 'advanced': return <Award className="h-4 w-4 text-purple-500" />;
      case 'intermediate': return <Target className="h-4 w-4 text-blue-500" />;
      default: return <BookOpen className="h-4 w-4 text-green-500" />;
    }
  };

  const getVerificationStats = () => {
    const totalSkills = skills.length;
    const verifiedSkills = skills.filter(s => s.verified).length;
    const verificationRate = totalSkills > 0 ? Math.round((verifiedSkills / totalSkills) * 100) : 0;
    
    return { totalSkills, verifiedSkills, verificationRate };
  };

  const stats = getVerificationStats();

  if (currentTest && isTestActive) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              {currentTest.title}
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {currentTest.description}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary-600">
              {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
            </div>
            <div className="text-xs text-neutral-500">Time Remaining</div>
          </div>
        </div>

        <div className="space-y-6">
          {currentTest.questions.map((question, index) => (
            <div key={question.id} className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
              <h4 className="font-medium text-neutral-900 dark:text-white mb-3">
                Question {index + 1}: {question.question}
              </h4>

              {question.type === 'multiple-choice' && question.options && (
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <label key={optionIndex} className="flex items-center">
                      <input
                        type="radio"
                        name={question.id}
                        value={option}
                        onChange={(e) => setTestAnswers(prev => ({ ...prev, [question.id]: e.target.value }))}
                        className="mr-2"
                      />
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {question.type === 'code' && (
                <div>
                  <textarea
                    value={testAnswers[question.id] || question.codeTemplate || ''}
                    onChange={(e) => setTestAnswers(prev => ({ ...prev, [question.id]: e.target.value }))}
                    className="w-full h-40 p-3 border border-neutral-300 dark:border-neutral-600 rounded-md bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-white font-mono text-sm"
                    placeholder="Write your code here..."
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-6">
          <Button onClick={() => setCurrentTest(null)} variant="outline">
            Cancel Test
          </Button>
          <Button onClick={handleTestSubmit} disabled={isTestActive}>
            Submit Test
          </Button>
        </div>
      </div>
    );
  }

  if (currentTest && testScore !== null) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 text-center">
        <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
          testScore >= currentTest.passingScore ? 'bg-green-100' : 'bg-red-100'
        }`}>
          {testScore >= currentTest.passingScore ? (
            <CheckCircle className="h-8 w-8 text-green-600" />
          ) : (
            <XCircle className="h-8 w-8 text-red-600" />
          )}
        </div>
        
        <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
          {testScore >= currentTest.passingScore ? 'Test Passed!' : 'Test Failed'}
        </h3>
        
        <div className="text-3xl font-bold text-primary-600 mb-2">
          {testScore}%
        </div>
        
        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
          {testScore >= currentTest.passingScore 
            ? `Congratulations! You scored ${testScore}% and passed the test.`
            : `You scored ${testScore}%. Minimum required: ${currentTest.passingScore}%`
          }
        </p>

        <div className="flex justify-center gap-4">
          <Button onClick={() => setCurrentTest(null)} variant="outline">
            Back to Skills
          </Button>
          {testScore < currentTest.passingScore && (
            <Button onClick={() => startTest(selectedSkill!)}>
              Retake Test
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Skill Verification</h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            Verify your skills to increase your credibility and job opportunities
          </p>
        </div>
        {onClose && (
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Award className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Total Skills</p>
              <p className="text-2xl font-semibold text-neutral-900 dark:text-white">{stats.totalSkills}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Verified</p>
              <p className="text-2xl font-semibold text-neutral-900 dark:text-white">{stats.verifiedSkills}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Verification Rate</p>
              <p className="text-2xl font-semibold text-neutral-900 dark:text-white">{stats.verificationRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Skills List */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg">
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Your Skills</h3>
        </div>
        
        <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
          {skills.map((skill) => (
            <div key={skill.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getLevelIcon(skill.level)}
                  <div>
                    <h4 className="font-medium text-neutral-900 dark:text-white">{skill.name}</h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 capitalize">
                      {skill.level} level
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {getVerificationBadge(skill)}
                  
                  {!skill.verified && (
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => startTest(skill)}
                        size="sm"
                        variant="outline"
                      >
                        Take Test
                      </Button>
                      <Button
                        onClick={() => updateSkillVerification(skill.id, 'portfolio')}
                        size="sm"
                        variant="outline"
                      >
                        Verify Portfolio
                      </Button>
                    </div>
                  )}
                  
                  {skill.verified && skill.expiresAt && (
                    <div className="text-xs text-neutral-500">
                      Expires: {new Date(skill.expiresAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verification Methods Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
          Verification Methods
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
              <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100">Skill Tests</h4>
              <p className="text-sm text-blue-700 dark:text-blue-200">
                Take online tests to verify your knowledge and skills
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
              <Award className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h4 className="font-medium text-green-900 dark:text-green-100">Portfolio Review</h4>
              <p className="text-sm text-green-700 dark:text-green-200">
                Submit your work portfolio for manual verification
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

