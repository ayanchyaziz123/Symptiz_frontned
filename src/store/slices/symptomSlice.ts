import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

const API_URL = `${API_ENDPOINTS.symptoms}/checks`;

export interface SymptomAnalysis {
  urgency: string;
  condition: string;
  description: string;
  recommendation: string;
  providerType: string;
  symptoms: string;
  possibleCauses: string[];
  whenToSeek: string;
  confidence?: number;
  recommendedSpecialties?: string[];
}

export interface ConversationQuestion {
  id: string;
  question: string;
  type: string;
  placeholder?: string;
}

export interface ConversationStep {
  step: number;
  step_title: string;
  questions: ConversationQuestion[];
  is_final: boolean;
}

export interface ConversationHistoryItem {
  question: string;
  answer: string;
}

interface SymptomState {
  symptomInput: string;
  analysisResult: SymptomAnalysis | null;
  isAnalyzing: boolean;
  error: string | null;

  // Conversational flow state
  useConversationalMode: boolean;
  currentStep: number;
  conversationQuestions: ConversationQuestion[];
  conversationStepTitle: string;
  conversationHistory: ConversationHistoryItem[];
  conversationAnswers: { [key: string]: string };
  isLoadingQuestions: boolean;
}

const initialState: SymptomState = {
  symptomInput: '',
  analysisResult: null,
  isAnalyzing: false,
  error: null,

  // Conversational flow state
  useConversationalMode: true, // Enable by default
  currentStep: 0,
  conversationQuestions: [],
  conversationStepTitle: '',
  conversationHistory: [],
  conversationAnswers: {},
  isLoadingQuestions: false,
};

// Mock AI analysis logic
const performMockAnalysis = (symptoms: string): SymptomAnalysis => {
  const lowerSymptoms = symptoms.toLowerCase();
  
  // Emergency conditions
  if (
    lowerSymptoms.includes('chest pain') ||
    lowerSymptoms.includes('difficulty breathing') ||
    lowerSymptoms.includes('shortness of breath') ||
    lowerSymptoms.includes('severe bleeding') ||
    lowerSymptoms.includes('unconscious') ||
    lowerSymptoms.includes('stroke') ||
    lowerSymptoms.includes('heart attack')
  ) {
    return {
      urgency: 'emergency',
      condition: 'Potential Medical Emergency',
      description: 'Your symptoms may indicate a serious medical condition requiring immediate attention.',
      recommendation: 'Call 911 or go to the nearest Emergency Room immediately. Do not wait.',
      providerType: 'Emergency Medicine',
      symptoms,
      possibleCauses: ['Cardiac event', 'Respiratory distress', 'Medical emergency'],
      whenToSeek: 'IMMEDIATELY - Call 911 now',
      confidence: 0.95,
      recommendedSpecialties: ['Emergency Medicine'],
    };
  }
  
  // Respiratory symptoms
  if (
    (lowerSymptoms.includes('cough') || lowerSymptoms.includes('fever')) &&
    (lowerSymptoms.includes('days') || lowerSymptoms.includes('week'))
  ) {
    return {
      urgency: 'doctor_visit',
      condition: 'Possible Respiratory Infection',
      description: 'You may have a respiratory infection such as bronchitis, flu, or another viral illness. Persistent symptoms warrant medical evaluation.',
      recommendation: 'Schedule an appointment with a family medicine doctor or internal medicine specialist within 2-3 days.',
      providerType: 'Internal Medicine',
      symptoms,
      possibleCauses: ['Viral infection', 'Bacterial infection', 'Influenza', 'COVID-19'],
      whenToSeek: 'Within 2-3 days, sooner if symptoms worsen',
      confidence: 0.82,
      recommendedSpecialties: ['Internal Medicine', 'Family Medicine'],
    };
  }
  
  // Skin conditions
  if (lowerSymptoms.includes('rash') || lowerSymptoms.includes('skin')) {
    return {
      urgency: 'doctor_visit',
      condition: 'Dermatological Concern',
      description: 'Skin rashes can have various causes including allergic reactions, infections, or inflammatory conditions. A dermatologist can provide proper diagnosis and treatment.',
      recommendation: 'Schedule an appointment with a dermatologist for skin evaluation.',
      providerType: 'Dermatology',
      symptoms,
      possibleCauses: ['Allergic reaction', 'Eczema', 'Contact dermatitis', 'Infection'],
      whenToSeek: 'Within 1-2 weeks, sooner if spreading or painful',
      confidence: 0.78,
      recommendedSpecialties: ['Dermatology'],
    };
  }
  
  // Cardiac symptoms
  if (
    lowerSymptoms.includes('chest') ||
    lowerSymptoms.includes('heart') ||
    lowerSymptoms.includes('palpitations')
  ) {
    return {
      urgency: 'urgent_care',
      condition: 'Cardiac Evaluation Needed',
      description: 'Chest discomfort and heart-related symptoms should be evaluated promptly to rule out serious conditions.',
      recommendation: 'See a cardiologist or visit urgent care within 24 hours for evaluation.',
      providerType: 'Cardiology',
      symptoms,
      possibleCauses: ['Cardiac concerns', 'Anxiety', 'Muscle strain', 'GERD'],
      whenToSeek: 'Within 24 hours - do not delay',
      confidence: 0.85,
      recommendedSpecialties: ['Cardiology'],
    };
  }
  
  // Mental health
  if (
    lowerSymptoms.includes('anxiety') ||
    lowerSymptoms.includes('depression') ||
    lowerSymptoms.includes('sleeping') ||
    lowerSymptoms.includes('stress')
  ) {
    return {
      urgency: 'doctor_visit',
      condition: 'Mental Health Concern',
      description: 'Mental health is as important as physical health. Anxiety, sleep issues, and stress can significantly impact your wellbeing and deserve professional attention.',
      recommendation: 'Schedule an appointment with a mental health professional or psychiatrist.',
      providerType: 'Psychiatry',
      symptoms,
      possibleCauses: ['Anxiety disorder', 'Depression', 'Stress', 'Sleep disorder'],
      whenToSeek: 'Within 1-2 weeks. If having thoughts of self-harm, seek immediate help.',
      confidence: 0.80,
      recommendedSpecialties: ['Psychiatry', 'Psychology'],
    };
  }
  
  // Musculoskeletal pain
  if (
    lowerSymptoms.includes('back pain') ||
    lowerSymptoms.includes('joint') ||
    lowerSymptoms.includes('muscle')
  ) {
    return {
      urgency: 'doctor_visit',
      condition: 'Musculoskeletal Issue',
      description: 'Persistent pain in muscles, joints, or back may indicate injury, strain, or an underlying condition that can benefit from medical evaluation.',
      recommendation: 'Schedule an appointment with an orthopedic specialist or physical medicine doctor.',
      providerType: 'Orthopedics',
      symptoms,
      possibleCauses: ['Muscle strain', 'Arthritis', 'Herniated disc', 'Injury'],
      whenToSeek: 'Within 1-2 weeks, sooner if pain is severe or worsening',
      confidence: 0.76,
      recommendedSpecialties: ['Orthopedics', 'Physical Medicine'],
    };
  }
  
  // Gastrointestinal
  if (
    lowerSymptoms.includes('stomach') ||
    lowerSymptoms.includes('nausea') ||
    lowerSymptoms.includes('abdominal') ||
    lowerSymptoms.includes('digestive')
  ) {
    return {
      urgency: 'doctor_visit',
      condition: 'Gastrointestinal Concern',
      description: 'Digestive symptoms may indicate various conditions from gastritis to food intolerance. Medical evaluation can identify the cause and appropriate treatment.',
      recommendation: 'Schedule an appointment with a gastroenterologist or internal medicine doctor.',
      providerType: 'Gastroenterology',
      symptoms,
      possibleCauses: ['Gastritis', 'Food intolerance', 'IBS', 'Infection'],
      whenToSeek: 'Within 3-5 days, sooner if severe pain or blood present',
      confidence: 0.79,
      recommendedSpecialties: ['Gastroenterology', 'Internal Medicine'],
    };
  }
  
  // Mild symptoms - self care
  if (
    lowerSymptoms.includes('mild') ||
    (lowerSymptoms.includes('headache') && !lowerSymptoms.includes('severe')) ||
    lowerSymptoms.includes('runny nose') ||
    lowerSymptoms.includes('minor cold')
  ) {
    return {
      urgency: 'home_care',
      condition: 'Minor Illness',
      description: 'Your symptoms appear to be mild and may resolve with rest and home care. Monitor your condition over the next few days.',
      recommendation: 'Rest, stay hydrated, and use over-the-counter medications as needed. Seek care if symptoms worsen or persist beyond 7 days.',
      providerType: 'Self-Care',
      symptoms,
      possibleCauses: ['Common cold', 'Minor viral infection', 'Dehydration'],
      whenToSeek: 'Only if symptoms worsen or persist beyond 7 days',
      confidence: 0.70,
      recommendedSpecialties: [],
    };
  }
  
  // Default case
  return {
    urgency: 'doctor_visit',
    condition: 'General Health Concern',
    description: 'Based on your symptoms, we recommend consulting with a healthcare provider for proper evaluation.',
    recommendation: 'Schedule an appointment with a primary care physician for evaluation.',
    providerType: 'Family Medicine',
    symptoms,
    possibleCauses: ['Requires medical evaluation'],
    whenToSeek: 'Schedule an appointment within 1-2 weeks',
    confidence: 0.65,
    recommendedSpecialties: ['Family Medicine'],
  };
};

// Async thunk for starting conversational symptom analysis
export const startConversation = createAsyncThunk<
  ConversationStep,
  string,
  { rejectValue: string }
>(
  'symptom/startConversation',
  async (initialSymptom, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/start_conversation/`, {
        initial_symptom: initialSymptom,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to start conversation. Please try again.');
    }
  }
);

// Async thunk for continuing the conversation
export const continueConversation = createAsyncThunk<
  ConversationStep | SymptomAnalysis,
  { step: number; conversationHistory: ConversationHistoryItem[] },
  { rejectValue: string }
>(
  'symptom/continueConversation',
  async ({ step, conversationHistory }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/continue_conversation/`, {
        step,
        conversation_history: conversationHistory,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to continue conversation. Please try again.');
    }
  }
);

// Async thunk for analyzing symptoms (original non-conversational mode)
export const analyzeSymptoms = createAsyncThunk<
  SymptomAnalysis,
  string,
  { rejectValue: string }
>(
  'symptom/analyze',
  async (symptoms, { rejectWithValue }) => {
    try {
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 1500));

      // TODO: Replace with actual API call
      // const response = await axios.post(`${API_URL}/analyze/`, { symptoms });
      // return response.data;

      return performMockAnalysis(symptoms);
    } catch (error) {
      return rejectWithValue('Failed to analyze symptoms. Please try again.');
    }
  }
);

const symptomSlice = createSlice({
  name: 'symptom',
  initialState,
  reducers: {
    setSymptomInput: (state, action: PayloadAction<string>) => {
      state.symptomInput = action.payload;
    },
    clearSymptomError: (state) => {
      state.error = null;
    },
    clearAnalysisResult: (state) => {
      state.analysisResult = null;
    },
    toggleConversationalMode: (state) => {
      state.useConversationalMode = !state.useConversationalMode;
    },
    setConversationAnswer: (state, action: PayloadAction<{ questionId: string; answer: string }>) => {
      state.conversationAnswers[action.payload.questionId] = action.payload.answer;
    },
    resetConversation: (state) => {
      state.currentStep = 0;
      state.conversationQuestions = [];
      state.conversationStepTitle = '';
      state.conversationHistory = [];
      state.conversationAnswers = {};
      state.analysisResult = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Original analyze symptoms
      .addCase(analyzeSymptoms.pending, (state) => {
        state.isAnalyzing = true;
        state.error = null;
      })
      .addCase(analyzeSymptoms.fulfilled, (state, action) => {
        state.isAnalyzing = false;
        state.analysisResult = action.payload;
      })
      .addCase(analyzeSymptoms.rejected, (state, action) => {
        state.isAnalyzing = false;
        state.error = action.payload || 'Failed to analyze symptoms';
      })

      // Start conversation
      .addCase(startConversation.pending, (state) => {
        state.isLoadingQuestions = true;
        state.error = null;
      })
      .addCase(startConversation.fulfilled, (state, action) => {
        state.isLoadingQuestions = false;
        state.currentStep = action.payload.step;
        state.conversationQuestions = action.payload.questions;
        state.conversationStepTitle = action.payload.step_title;

        // Add initial symptom to conversation history
        const initialQuestion = "What brings you in today? Please describe your main symptom or concern.";
        state.conversationHistory.push({
          question: initialQuestion,
          answer: state.symptomInput,
        });

        state.conversationAnswers = {};
      })
      .addCase(startConversation.rejected, (state, action) => {
        state.isLoadingQuestions = false;
        state.error = action.payload || 'Failed to start conversation';
      })

      // Continue conversation
      .addCase(continueConversation.pending, (state) => {
        state.isLoadingQuestions = true;
        state.error = null;
      })
      .addCase(continueConversation.fulfilled, (state, action) => {
        state.isLoadingQuestions = false;

        // Check if this is the final analysis
        if ('is_final' in action.payload && action.payload.is_final) {
          // This is the final analysis
          const finalResult = action.payload as any;
          state.analysisResult = {
            urgency: finalResult.urgency,
            condition: finalResult.possible_conditions?.[0] || 'Medical Assessment',
            description: finalResult.recommendation,
            recommendation: finalResult.recommendation,
            providerType: finalResult.provider_type,
            symptoms: state.conversationHistory.map(h => `${h.question}: ${h.answer}`).join(' | '),
            possibleCauses: finalResult.possible_conditions || [],
            whenToSeek: finalResult.urgency === 'emergency' ? 'IMMEDIATELY' :
                        finalResult.urgency === 'urgent_care' ? 'Within 24 hours' :
                        finalResult.urgency === 'doctor_visit' ? 'Within a few days' : 'Monitor symptoms',
            confidence: finalResult.confidence,
            recommendedSpecialties: finalResult.recommended_specialties || [],
          };

          // Reset conversation state
          state.currentStep = 0;
          state.conversationQuestions = [];
        } else {
          // Continue with next step
          const nextStep = action.payload as ConversationStep;
          state.currentStep = nextStep.step;
          state.conversationQuestions = nextStep.questions;
          state.conversationStepTitle = nextStep.step_title;
          state.conversationAnswers = {};
        }
      })
      .addCase(continueConversation.rejected, (state, action) => {
        state.isLoadingQuestions = false;
        state.error = action.payload || 'Failed to continue conversation';
      });
  },
});

export const {
  setSymptomInput,
  clearSymptomError,
  clearAnalysisResult,
  toggleConversationalMode,
  setConversationAnswer,
  resetConversation,
} = symptomSlice.actions;

export default symptomSlice.reducer;