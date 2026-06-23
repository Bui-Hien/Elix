import { apiClient, longApiClient } from '../api-client';

export interface ConsultationGoal {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  gradient: string;
}

export interface ConsultationRequest {
  birthDate: string;
  birthTime?: string;
  gender?: string; // male, female
}

export interface RecommendedBracelet {
  productId: number;
  name: string;
  price: number;
  imageUrl?: string;
  reason: string;
  compatibilityScore: number;
}

export interface ConsultationResult {
  element: string;
  napAmName: string;
  menhKhuyet?: string;
  elementDescription: string;
  menhKhuyetDescription?: string;
  supportiveElement: string;
  supportiveElementDescription: string;
  analysis: string;
  batTuSummary?: string;
  dayMaster?: string;
  dayMasterDescription?: string;
  strongElements: string[];
  weakElements: string[];
  recommendedBracelets: RecommendedBracelet[];
  luckyColors: string[];
  avoidColors: string[];
  advice: string;
  elementEnergyPercentages?: Record<string, number>;
  positiveTraits?: { title: string; description: string }[];
  negativeTraits?: { title: string; description: string }[];
  soundUrl?: string;
  // New: Pre-written deficit data from DB
  deficitTitle?: string;
  deficitWeakDescription?: string;
  deficitWeakSymptoms?: { title: string; description: string }[];
  deficitCompensationTitle?: string;
  deficitCompensationDescription?: string;
  deficitCompensationBenefits?: { title: string; description: string }[];
  deficitRecommendedStones?: { name: string; description: string }[];
}

export const consultationApi = {
  getGoals: async (): Promise<ConsultationGoal[]> => {
    // We use the public purposes endpoint
    const response = await apiClient.get('/admin/purposes?isActive=true');
    return response as unknown as ConsultationGoal[];
  },

  analyze: async (request: ConsultationRequest): Promise<ConsultationResult> => {
    // Use longApiClient for consultation analysis (2 minute timeout)
    const response = await longApiClient.post('/consultation/analyze', request);
    return response as unknown as ConsultationResult;
  },
};
