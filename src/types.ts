export type BusinessCategory = 'shop-online' | 'spa' | 'nail' | 'fashion' | 'food' | 'real-estate';
export type ContentTone = 'ban-hang-manh' | 'gan-gui' | 'sang-trong' | 'chuyen-gia' | 'vui-ve';
export type ContentGoal = 'ban-hang' | 'keo-inbox' | 'ra-mat' | 'livestream';
export type Platform = 'Facebook' | 'Zalo' | 'TikTok' | 'Instagram';
export type PlanId = 'free' | 'starter' | 'pro';

export interface BrandProfile {
  shopName: string;
  category: BusinessCategory;
  audience: string;
  sellingPoint: string;
  tone: ContentTone;
  offer: string;
}

export interface ProviderInfo {
  id: string;
  name: string;
  kind: string;
  ready: boolean;
  note: string;
}

export interface CreativeBrief {
  productName: string;
  productDetails: string;
  targetAudience: string;
  painPoint: string;
  objective: ContentGoal;
  platform: Platform;
  tone: ContentTone;
  callToAction: string;
  promo: string;
  provider: string;
}

export interface GeneratedContent {
  headline: string;
  captionShort: string;
  captionLong: string;
  hashtags: string[];
  callouts: string[];
  imagePrompt: string;
}

export interface ProductionJob {
  id: string;
  title: string;
  status: 'Drafting' | 'Ready' | 'Saved';
  platform: Platform;
  createdAt: string;
  provider: string;
}

export interface AssetCard {
  id: string;
  title: string;
  platform: Platform;
  objective: ContentGoal;
  updatedAt: string;
  performance: string;
  source: string;
  content: GeneratedContent;
}

export interface SubscriptionInfo {
  planId: PlanId;
  status: 'trial' | 'active' | 'inactive';
  monthlyPrice: number;
  generationLimit: number;
  usedThisMonth: number;
  renewsAt: string;
}

export interface PlanOption {
  id: PlanId;
  name: string;
  priceLabel: string;
  monthlyPrice: number;
  generationLimit: number;
  features: string[];
}

export interface AnalyticsSummary {
  totalGenerations: number;
  weeklyGenerations: number;
  totalCopies: number;
  lastEventAt: string | null;
  topPlatform: Platform | null;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
}

export interface TemplatePack {
  id: string;
  category: BusinessCategory;
  title: string;
  description: string;
  productName: string;
  productDetails: string;
  targetAudience: string;
  painPoint: string;
  objective: ContentGoal;
  platform: Platform;
  tone: ContentTone;
  callToAction: string;
  promo: string;
}

export interface BillingInfo {
  provider: 'mock' | 'stripe-ready';
  portalUrl: string;
  checkoutBaseUrl: string;
  canUseRealPayments: boolean;
}

export interface RetentionSettings {
  morningReminder: boolean;
  eveningReminder: boolean;
  winbackDays: 3 | 7 | 14;
  promoBroadcast: boolean;
}
