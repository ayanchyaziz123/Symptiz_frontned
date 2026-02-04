import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../store/index';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Stethoscope,
} from 'lucide-react';
import {
  setSymptomInput,
  setConversationAnswer,
  startConversation,
  continueConversation,
  resetConversation,
  clearSymptomError,
} from '../store/slices/symptomSlice';

const ConversationalSymptomChecker: React.FC = () => {
  const dispatch = useAppDispatch();

  const {
    symptomInput,
    currentStep,
    conversationQuestions,
    conversationStepTitle,
    conversationHistory,
    conversationAnswers,
    isLoadingQuestions,
    error,
    analysisResult,
  } = useAppSelector((state) => state.symptom);

  const [localAnswers, setLocalAnswers] = useState<{ [key: string]: string }>({});
  const [showInitialInput, setShowInitialInput] = useState(true);

  // Reset local answers when questions change
  useEffect(() => {
    setLocalAnswers({});
  }, [conversationQuestions]);

  const handleStartConversation = () => {
    if (symptomInput.trim().length < 5) {
      return;
    }

    setShowInitialInput(false);
    dispatch(startConversation(symptomInput));
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setLocalAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNextStep = () => {
    // Build conversation history with current answers
    const newHistory = [...conversationHistory];

    conversationQuestions.forEach(q => {
      const answer = localAnswers[q.id] || '';
      if (answer.trim()) {
        newHistory.push({
          question: q.question,
          answer: answer,
        });
        dispatch(setConversationAnswer({ questionId: q.id, answer }));
      }
    });

    // Continue to next step
    dispatch(continueConversation({
      step: currentStep + 1,
      conversationHistory: newHistory,
    }));

    setLocalAnswers({});
  };

  const handleRestart = () => {
    dispatch(resetConversation());
    setShowInitialInput(true);
    setLocalAnswers({});
  };

  const allQuestionsAnswered = conversationQuestions.every(q =>
    localAnswers[q.id]?.trim().length > 0
  );

  // If analysis is complete, don't show the conversation UI
  if (analysisResult) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="text-center mb-4 sm:mb-6">
        <div className="inline-flex items-center bg-blue-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg mb-3 sm:mb-4 border border-blue-200">
          <Activity className="w-4 sm:w-5 h-4 sm:h-5 text-blue-600 mr-2" />
          <span className="font-semibold text-blue-700 text-sm sm:text-base">
            AI Symptom Checker
          </span>
        </div>

        {showInitialInput ? (
          <>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              How are you feeling today?
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm">
              I'll ask you a few questions to better understand your symptoms
            </p>
          </>
        ) : (
          <>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              {conversationStepTitle}
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm">
              Step {currentStep} of 3
            </p>
            <div className="flex gap-1 sm:gap-2 justify-center mt-2">
              {[1, 2, 3].map(step => (
                <div
                  key={step}
                  className={`h-1.5 sm:h-2 w-12 sm:w-16 rounded-full transition-all ${
                    step <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg mb-4">
        <div className="flex items-start">
          <AlertCircle className="w-4 h-4 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-amber-900">
            <strong>Medical Disclaimer:</strong> This AI tool provides general
            guidance only. If experiencing a medical emergency, call 911
            immediately.
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-3 rounded-lg mb-4">
          <div className="flex items-start">
            <AlertCircle className="w-4 h-4 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-red-800">{error}</div>
            <button
              onClick={() => dispatch(clearSymptomError())}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Initial symptom input */}
      {showInitialInput && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              What brings you in today? *
            </label>
            <textarea
              value={symptomInput}
              onChange={(e) => dispatch(setSymptomInput(e.target.value))}
              placeholder="Describe your main symptom or concern... Example: 'I've had a headache for 2 days'"
              rows={4}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
            />
            <p className="text-xs text-gray-500 mt-2">
              Be as detailed as possible about your main concern
            </p>
          </div>

          <button
            onClick={handleStartConversation}
            disabled={symptomInput.trim().length < 5 || isLoadingQuestions}
            className="w-full bg-blue-600 text-white py-2 sm:py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 flex items-center justify-center text-xs sm:text-sm shadow-sm"
          >
            {isLoadingQuestions ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-3.5 w-3.5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Preparing...
              </>
            ) : (
              <>
                Start Assessment
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </>
            )}
          </button>
        </div>
      )}

      {/* Conversation questions */}
      {!showInitialInput && conversationQuestions.length > 0 && (
        <div className="space-y-4">
          {conversationQuestions.map((question, index) => (
            <div key={question.id} className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs mr-2">
                  {index + 1}
                </span>
                {question.question}
              </label>
              <textarea
                value={localAnswers[question.id] || ''}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                placeholder={question.placeholder || 'Type your answer here...'}
                rows={3}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
              />
            </div>
          ))}

          <div className="flex gap-2 pt-4">
            <button
              onClick={handleRestart}
              className="flex-1 bg-white border-2 border-gray-300 text-gray-700 py-1.5 sm:py-2 rounded-lg font-semibold hover:bg-gray-50 transition text-xs sm:text-sm flex items-center justify-center"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Start Over
            </button>

            <button
              onClick={handleNextStep}
              disabled={!allQuestionsAnswered || isLoadingQuestions}
              className="flex-1 bg-blue-600 text-white py-1.5 sm:py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 text-xs sm:text-sm shadow-sm flex items-center justify-center"
            >
              {isLoadingQuestions ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-1.5 h-3.5 w-3.5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : currentStep >= 3 ? (
                <>
                  <Stethoscope className="w-3.5 h-3.5 mr-1.5" />
                  Get Analysis
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationalSymptomChecker;
