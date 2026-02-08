import { createGeminiClient } from '@/services/gemini/geminiClient';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

const geminiClient = createGeminiClient({ apiKey });

export const {
  generateProposals,
  analyzeDocument,
  analyzeFinancialHealth,
  chatWithAssistant,
} = geminiClient;
