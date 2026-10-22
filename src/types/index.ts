export type PlanTier = 'basic' | 'growth' | 'pro' | 'enterprise';

export interface PlanDetails {
  id: PlanTier;
  name: string;
  monthlyPrice: number; // in INR
  annualPrice: number; // in INR (2 months free)
  locationsLimit: number;
  repliesPerMonth: number | 'unlimited';
  qrCodesLimit: number | 'unlimited';
  aiDraftsPerMonth: number | 'unlimited';
  alerts: string[];
  features: string[];
  isPopular?: boolean;
}

export type AutopilotLevel = 'full' | 'negatives_held' | 'approve_all';
export type ReviewStatus = 'draft' | 'held' | 'approved' | 'posted' | 'failed';
export type SupportedLanguage = 'en' | 'hi' | 'hi-en' | 'ta' | 'te' | 'kn' | 'mr' | 'bn' | 'gu';

export interface LocationSettings {
  id: string;
  name: string;
  city: string;
  area: string;
  googlePlaceId: string;
  category: string;
  services: string[];
  brandTone: 'warm_friendly' | 'professional_clinical' | 'casual_modern' | 'traditional_polite';
  managerName: string;
  managerPhone: string;
  managerEmail: string;
  bannedWords: string[];
  autopilotLevel: AutopilotLevel;
  minStarAutoPost: number; // usually 4
  targetKeywords: string[];
  autoKeywordWeaving: boolean;
  smsAlertsEnabled: boolean;
  emailAlertsEnabled: boolean;
  pushAlertsEnabled: boolean;
}

export interface Review {
  id: string;
  locationId: string;
  googleReviewId: string;
  reviewerName: string;
  rating: number; // 1 to 5
  text: string;
  isStarOnly: boolean;
  detectedLanguage: SupportedLanguage;
  detectedTone: 'positive' | 'enthusiastic' | 'neutral' | 'frustrated' | 'angry';
  createdAt: string;
  reply?: ReviewReply;
}

export interface ReviewReply {
  id: string;
  reviewId: string;
  draftText: string;
  finalText?: string;
  status: ReviewStatus;
  model: string;
  validatorPassed: boolean;
  validatorNotes?: string[];
  approvalToken?: string;
  approvalExpiresAt?: string;
  approvedBy?: string;
  postedAt?: string;
  isAutoPosted: boolean;
  previousVersions?: string[];
}

export interface QRCodeItem {
  id: string;
  locationId: string;
  name: string;
  shortCode: string;
  staffName?: string;
  branchName?: string;
  templateType: 'table_tent' | 'counter_card' | 'bill_sticker' | 'standee';
  scansCount: number;
  draftsGeneratedCount: number;
  reviewsCompletedCount: number;
  createdAt: string;
}

export interface CustomerQRSubmission {
  rating: number;
  selectedServices: string[];
  qualityTags: string[];
  staffName?: string;
  ambienceTags: string[];
  recommend: 'yes' | 'maybe' | 'no';
  language: 'en' | 'hi' | 'hi-en';
  length: 'short' | 'detailed';
}

export interface CompetitorComparison {
  name: string;
  rating: number;
  totalReviews: number;
  unansweredReviews: number;
  responseRate: number; // percentage
  averageResponseTime: string;
}
