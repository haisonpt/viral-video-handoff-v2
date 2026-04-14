import { useEffect, useMemo, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import {
  AnalyticsSummary,
  AppUser,
  AssetCard,
  BillingInfo,
  BrandProfile,
  RetentionSettings,
  CreativeBrief,
  GeneratedContent,
  PlanOption,
  ProductionJob,
  ProviderInfo,
  SubscriptionInfo,
  TemplatePack,
} from './types';

const TOKEN_KEY = 'viral-video-token';
const API = '';
const APP_VERSION = '1.0.1';
const RELEASE_CHANNEL = 'android-commercial-foundation';

type ScreenTab = 'create' | 'pipeline' | 'library' | 'settings';
type AuthMode = 'login' | 'register';

interface BootstrapResponse {
  profile: BrandProfile;
  brief: CreativeBrief;
  jobs: ProductionJob[];
  assets: AssetCard[];
  providers: ProviderInfo[];
  user: AppUser | null;
  subscription: SubscriptionInfo;
  plans: PlanOption[];
  analytics: AnalyticsSummary;
  templates: TemplatePack[];
  billing: BillingInfo;
  retention: RetentionSettings;
}

interface PipelineScan {
  id: string;
  country: string;
  language: string;
  platforms: string[];
  window: string;
  format: string;
  status: string;
}

interface PipelineMainTopic {
  id: string;
  scanId: string;
  name: string;
  description: string;
  hashtags: string[];
  seoKeywords: string[];
  rankingScore: number;
  competitionScore?: number;
  sourceDiversityScore?: number;
  sourceBalanceScore?: number;
  momentumScore?: number;
  sourceBreakdown?: Record<string, number>;
  monetizationTier?: string;
  estimatedRPM?: string;
  estimatedCPM?: string;
  bestPlatform: string;
}

interface MultiCriteriaFilterState {
  viralStrong: boolean;
  monetizationHigh: boolean;
  easyToMake: boolean;
  lowCompetition: boolean;
  shortVideoFit: boolean;
  longVideoFit: boolean;
}

interface PipelineTrendItem {
  id: string;
  source: string;
  platform: string;
  title: string;
  channelName: string;
  views: number;
  viralScore: number;
  url: string;
}

interface PipelineSubtopic {
  id: string;
  mainTopicId: string;
  title: string;
  angle: string;
  goal: string;
  formatType: string;
  score: number;
}

interface PipelineContentPackage {
  id: string;
  subtopicId: string;
  mainTopicId: string;
  titleVi: string;
  titleEn: string;
  descriptionVi: string;
  descriptionEn: string;
  hashtags: string[];
  seoVi: string[];
  seoEn: string[];
  stylePreset: string;
  aspectRatio: string;
  durationTargetSec: number;
  characterProfileId?: string | null;
  voiceProfileId?: string | null;
  voiceSettings?: {
    enabled: boolean;
    mode: string;
    subtitleEnabled: boolean;
    lipSyncMode: string;
    pacing: string;
  };
  status: string;
}

interface PipelineScene {
  id: string;
  contentPackageId: string;
  sceneNumber: number;
  durationSec: number;
  goal: string;
  visualPrompt: string;
  voiceoverVi: string;
  onscreenTextVi: string;
  status: string;
  version: number;
}

interface PlatformRankingMap {
  youtube: PipelineMainTopic[];
  facebook: PipelineMainTopic[];
  tiktok: PipelineMainTopic[];
}

interface CharacterProfile {
  id: string;
  name: string;
  visualPrompt: string;
  referenceImageUrl: string;
  defaultVoiceProfileId?: string;
}

interface VoiceProfile {
  id: string;
  name: string;
  gender: string;
  ageGroup: string;
  style: string;
  language: string;
  speed: number;
  pitch: number;
  description: string;
  runwayPresetId?: string;
}

interface VoiceJob {
  id: string;
  scenePromptId: string;
  providerJobId?: string;
  status: string;
  outputAudioUrl?: string | null;
  errorMessage?: string | null;
}

interface PipelineRenderJob {
  id: string;
  scenePromptId: string;
  providerJobId?: string;
  status: string;
  outputVideoUrl: string | null;
  errorMessage?: string | null;
}

interface VideoProviderOption {
  id: string;
  name: string;
  ready: boolean;
  mode: string;
  note: string;
  strategy?: string;
}

interface PipelineFinalVideo {
  id: string;
  contentPackageId: string;
  status: string;
  outputUrl: string;
  burnedSubtitleVideoUrl?: string | null;
  subtitleUrl?: string | null;
  transcriptUrl?: string | null;
  thumbnailUrl?: string | null;
  manifestUrl?: string | null;
  reportUrl?: string | null;
  bundleUrl?: string | null;
  archiveUrl?: string | null;
}

const categoryLabels: Record<BrandProfile['category'], string> = {
  'shop-online': 'Shop online',
  spa: 'Spa',
  nail: 'Nail',
  fashion: 'Thời trang',
  food: 'Đồ ăn',
  'real-estate': 'Bất động sản',
};

const toneLabels: Record<BrandProfile['tone'], string> = {
  'ban-hang-manh': 'Bán hàng mạnh',
  'gan-gui': 'Gần gũi',
  'sang-trong': 'Sang trọng',
  'chuyen-gia': 'Chuyên gia',
  'vui-ve': 'Vui vẻ',
};

function buildFallbackContent(profile: BrandProfile, brief: CreativeBrief): GeneratedContent {
  return {
    headline: `${brief.productName} | ${profile.offer}`,
    captionShort: `${brief.productName} dành cho ${brief.targetAudience}. ${brief.callToAction}`,
    captionLong: `${profile.shopName} mang đến ${brief.productName}. Điểm nổi bật: ${brief.productDetails}. Khách hàng phù hợp: ${brief.targetAudience}. Nỗi đau cần giải quyết: ${brief.painPoint}. Ưu đãi hiện tại: ${brief.promo}. ${brief.callToAction}`,
    hashtags: ['#viralvideo', '#contentAI', '#videostudio', '#shortvideo'],
    callouts: ['Hook 1 câu thật mạnh', 'Nêu pain point rõ ràng', 'Nhắc ưu đãi và CTA'],
    imagePrompt: `Thiết kế bài đăng ${brief.platform} cho ${brief.productName}, phong cách ${toneLabels[brief.tone]}, ngành ${categoryLabels[profile.category]}, nổi bật ưu đãi ${brief.promo}`,
  };
}

function buildRetentionMessages(profile: BrandProfile, brief: CreativeBrief, retention: RetentionSettings) {
  const categoryHint = {
    spa: 'giữ lịch chăm da đều',
    fashion: 'đăng outfit mới đúng nhịp',
    food: 'đẩy đơn giờ cao điểm',
    nail: 'lấp slot khách trong ngày',
    'shop-online': 'ra bài đều để chốt đơn',
    'real-estate': 'nuôi lead và chốt lịch xem nhà',
  }[profile.category];

  return {
    morning: `Buổi sáng rồi, hôm nay mình lên 1 bài ${brief.platform} để ${categoryHint} nhé.`,
    evening: `Tối nay là lúc tốt để chuẩn bị content cho ${brief.productName} và ưu đãi ${brief.promo}.`,
    winback: `Đã ${retention.winbackDays} ngày, quay lại tạo content mới cho ${brief.productName} để không hụt nhịp bán hàng nhé.`,
  };
}

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(payload.error || 'Request failed');
  }
  return response.json() as Promise<T>;
}

function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [name, setName] = useState('Boss Edgar Son');
  const [email, setEmail] = useState('boss@viralvideo.local');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<ScreenTab>('create');

  const [profile, setProfile] = useState<BrandProfile | null>(null);
  const [brief, setBrief] = useState<CreativeBrief | null>(null);
  const [jobs, setJobs] = useState<ProductionJob[]>([]);
  const [assets, setAssets] = useState<AssetCard[]>([]);
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [activeAssetId, setActiveAssetId] = useState<string | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [templates, setTemplates] = useState<TemplatePack[]>([]);
  const [billing, setBilling] = useState<BillingInfo | null>(null);
  const [billingNote, setBillingNote] = useState('');
  const [retention, setRetention] = useState<RetentionSettings | null>(null);
  const [notificationNote, setNotificationNote] = useState('');
  const [backupNote, setBackupNote] = useState('');
  const [shareNote, setShareNote] = useState('');
  const [supportNote, setSupportNote] = useState('');
  const [pipelineNote, setPipelineNote] = useState('');
  const [pipelinePresets, setPipelinePresets] = useState<string[]>([]);
  const [pipelineScan, setPipelineScan] = useState<PipelineScan | null>(null);
  const [pipelineTrendItems, setPipelineTrendItems] = useState<PipelineTrendItem[]>([]);
  const [pipelineTopics, setPipelineTopics] = useState<PipelineMainTopic[]>([]);
  const [platformRankings, setPlatformRankings] = useState<PlatformRankingMap>({ youtube: [], facebook: [], tiktok: [] });
  const [hybridPicks, setHybridPicks] = useState<PipelineMainTopic[]>([]);
  const [monetizationFilter, setMonetizationFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [multiFilters, setMultiFilters] = useState<MultiCriteriaFilterState>({
    viralStrong: false,
    monetizationHigh: false,
    easyToMake: false,
    lowCompetition: false,
    shortVideoFit: false,
    longVideoFit: false,
  });
  const [pipelineSubtopics, setPipelineSubtopics] = useState<PipelineSubtopic[]>([]);
  const [pipelinePackage, setPipelinePackage] = useState<PipelineContentPackage | null>(null);
  const [pipelineScenes, setPipelineScenes] = useState<PipelineScene[]>([]);
  const [pipelineRenders, setPipelineRenders] = useState<PipelineRenderJob[]>([]);
  const [pipelineFinals, setPipelineFinals] = useState<PipelineFinalVideo[]>([]);
  const [videoProviders, setVideoProviders] = useState<VideoProviderOption[]>([]);
  const [selectedVideoProvider, setSelectedVideoProvider] = useState('runway');
  const [autoChainRunway, setAutoChainRunway] = useState(false);
  const [characterProfiles, setCharacterProfiles] = useState<CharacterProfile[]>([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState('char-default-01');
  const [characterName, setCharacterName] = useState('');
  const [characterPrompt, setCharacterPrompt] = useState('');
  const [characterImageUrl, setCharacterImageUrl] = useState('');
  const [voiceProfiles, setVoiceProfiles] = useState<VoiceProfile[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState('voice-male-warm-deep');
  const [selectedCharacterVoiceId, setSelectedCharacterVoiceId] = useState('voice-male-warm-deep');
  const [voiceJobs, setVoiceJobs] = useState<VoiceJob[]>([]);
  const [selectedMainTopicId, setSelectedMainTopicId] = useState<string | null>(null);
  const [selectedSubtopicId, setSelectedSubtopicId] = useState<string | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const activeAsset = useMemo(() => assets.find((item) => item.id === activeAssetId) || assets[0] || null, [assets, activeAssetId]);
  const categoryTemplates = useMemo(() => templates.filter((item) => item.category === profile?.category), [templates, profile?.category]);
  const pipelineRenderMap = useMemo(() => new Map(pipelineRenders.map((job) => [job.scenePromptId, job])), [pipelineRenders]);
  const diagnosticsSnapshot = useMemo(() => ({
    app: 'Viral Video Studio',
    version: APP_VERSION,
    releaseChannel: RELEASE_CHANNEL,
    platform: Capacitor.getPlatform(),
    loggedIn: Boolean(token),
    subscription: subscription?.planId ?? 'free',
    businessCategory: profile?.category ?? null,
    hasBrief: Boolean(brief),
    generatedCount: assets.length,
    retentionEnabled: Boolean(retention?.morningReminder || retention?.eveningReminder || retention?.promoBroadcast),
    morningReminder: retention?.morningReminder ?? false,
    eveningReminder: retention?.eveningReminder ?? false,
    winbackReminder: retention?.winbackDays ?? 7,
    exportedAt: new Date().toISOString(),
  }), [token, subscription?.planId, profile?.category, brief, assets.length, retention]);

  const retentionMessages = useMemo(() => {
    if (!profile || !brief || !retention) return null;
    return buildRetentionMessages(profile, brief, retention);
  }, [profile, brief, retention]);

  const matchesMultiFilters = (topic: PipelineMainTopic) => {
    if (multiFilters.viralStrong && (topic.momentumScore || topic.rankingScore || 0) < 75) return false;
    if (multiFilters.monetizationHigh && topic.monetizationTier !== 'high') return false;
    if (multiFilters.easyToMake && ((topic.momentumScore || 0) < 65 || (topic.sourceDiversityScore || 0) < 40)) return false;
    if (multiFilters.lowCompetition && (topic.competitionScore || 100) > 55) return false;
    if (multiFilters.shortVideoFit && !['TikTok', 'YouTube'].includes(topic.bestPlatform)) return false;
    if (multiFilters.longVideoFit && topic.bestPlatform !== 'YouTube') return false;
    return true;
  };

  const onboardingSteps = useMemo(() => {
    if (!profile || !brief || !subscription) return [];
    return [
      { label: 'Điền tên shop', done: Boolean(profile.shopName.trim()) },
      { label: 'Chọn ngành hàng', done: Boolean(profile.category) },
      { label: 'Mô tả sản phẩm', done: Boolean(brief.productDetails.trim()) },
      { label: 'Thêm CTA', done: Boolean(brief.callToAction.trim()) },
      { label: 'Tạo bài đầu tiên', done: assets.length > 0 },
      { label: 'Chọn gói phù hợp', done: subscription.planId !== 'free' },
    ];
  }, [profile, brief, subscription, assets.length]);

  const onboardingDone = onboardingSteps.filter((item) => item.done).length;
  const onboardingPercent = onboardingSteps.length ? Math.round((onboardingDone / onboardingSteps.length) * 100) : 0;

  const stats = useMemo(() => {
    if (!brief || !subscription) return [];
    return [
      { label: 'Bài đã tạo', value: `${assets.length}`.padStart(2, '0') },
      { label: 'Đã dùng', value: `${subscription.usedThisMonth}/${subscription.generationLimit}` },
      { label: 'Gói hiện tại', value: subscription.planId.toUpperCase() },
      { label: 'Kênh chính', value: brief.platform },
    ];
  }, [assets.length, brief, subscription]);

  const getSceneRenderForScene = (sceneId: string) => pipelineRenders.find((item) => item.scenePromptId === sceneId && item.status === 'done');
  const getVoiceJobForScene = (sceneId: string) => voiceJobs.find((item) => item.scenePromptId === sceneId && item.status === 'done');
  const getSceneReadyState = (scene: PipelineScene) => {
    const hasVideo = Boolean(getSceneRenderForScene(scene.id)?.outputVideoUrl);
    const hasVoice = !pipelinePackage?.voiceSettings?.enabled || Boolean(getVoiceJobForScene(scene.id)?.outputAudioUrl);
    return {
      hasVideo,
      hasVoice,
      approved: scene.status === 'approved',
      ready: hasVideo && hasVoice && scene.status === 'approved',
    };
  };

  const loadBootstrap = async (currentToken: string) => {
    const data = await request<BootstrapResponse>('/api/bootstrap', {}, currentToken);
    setProfile(data.profile);
    setBrief(data.brief);
    setJobs(data.jobs);
    setAssets(data.assets);
    setProviders(data.providers);
    setUser(data.user);
    setSubscription(data.subscription);
    setPlans(data.plans);
    setAnalytics(data.analytics);
    setTemplates(data.templates);
    setBilling(data.billing);
    setRetention(data.retention);
    setActiveAssetId((current) => current || data.assets[0]?.id || null);

    const pipeline = await request<{
      presets: string[];
      latestScan: PipelineScan | null;
      trendItems: PipelineTrendItem[];
      mainTopics: PipelineMainTopic[];
      platformRankings: PlatformRankingMap;
      hybridPicks: PipelineMainTopic[];
      characterProfiles: CharacterProfile[];
      voiceProfiles: VoiceProfile[];
      voiceJobs: VoiceJob[];
      videoProviders?: VideoProviderOption[];
      contentPackages: PipelineContentPackage[];
      sceneRenders: PipelineRenderJob[];
      finalVideos: PipelineFinalVideo[];
    }>('/api/viral-pipeline/bootstrap', {}, currentToken);
    setPipelinePresets(pipeline.presets);
    setPipelineScan(pipeline.latestScan);
    setPipelineTrendItems(pipeline.trendItems);
    setPipelineTopics(pipeline.mainTopics);
    setPlatformRankings(pipeline.platformRankings || { youtube: [], facebook: [], tiktok: [] });
    setHybridPicks(pipeline.hybridPicks || []);
    setCharacterProfiles(pipeline.characterProfiles || []);
    if (pipeline.characterProfiles?.[0]?.id) setSelectedCharacterId(pipeline.characterProfiles[0].id);
    setVoiceProfiles(pipeline.voiceProfiles || []);
    if (pipeline.voiceProfiles?.[0]?.id) setSelectedVoiceId(pipeline.voiceProfiles[0].id);
    if (pipeline.voiceProfiles?.[0]?.id) setSelectedCharacterVoiceId(pipeline.voiceProfiles[0].id);
    setVoiceJobs(pipeline.voiceJobs || []);
    if (pipeline.videoProviders?.length) setVideoProviders(pipeline.videoProviders);
    setPipelinePackage(pipeline.contentPackages[0] || null);
    setPipelineRenders(pipeline.sceneRenders);
    setPipelineFinals(pipeline.finalVideos);
  };

  useEffect(() => {
    if (!token) return;
    loadBootstrap(token).catch((err: Error) => {
      setError(err.message);
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
    });
  }, [token]);

  useEffect(() => {
    if (!token || !pipelinePackage) return;
    const hasActiveJobs = pipelineRenders.some((job) => ['queued', 'rendering'].includes(job.status));
    if (!hasActiveJobs) return;

    const timer = window.setInterval(() => {
      request<{ jobs: PipelineRenderJob[] }>('/api/render-jobs/poll-active', {
        method: 'POST',
        body: JSON.stringify({ contentPackageId: pipelinePackage.id }),
      }, token)
        .then((data) => {
          setPipelineRenders((current) => current.map((job) => {
            const next = data.jobs.find((item) => item.id === job.id);
            return next ? { ...job, ...next } : job;
          }));
          setPipelineScenes((current) => current.map((scene) => {
            const next = data.jobs.find((job) => job.scenePromptId === scene.id);
            return next ? { ...scene, status: next.status } : scene;
          }));
        })
        .catch(() => undefined);
    }, 10000);

    return () => window.clearInterval(timer);
  }, [token, pipelinePackage, pipelineRenders]);

  useEffect(() => {
    if (!autoChainRunway || !token || !pipelinePackage || selectedVideoProvider !== 'runway') return;
    const hasActiveJobs = pipelineRenders.some((job) => ['queued', 'rendering'].includes(job.status));
    const hasFailedJobs = pipelineRenders.some((job) => job.status === 'failed');
    const hasPendingScenes = pipelineScenes.some((scene) => ['draft', 'failed'].includes(scene.status));
    if (hasActiveJobs || hasFailedJobs || !hasPendingScenes) return;

    const timer = window.setTimeout(() => {
      request<{ ok: boolean; done?: boolean; message?: string; scene?: PipelineScene; job?: PipelineRenderJob; provider?: VideoProviderOption }>(`/api/content-packages/${pipelinePackage.id}/render-next`, {
        method: 'POST',
        body: JSON.stringify({ provider: selectedVideoProvider }),
      }, token)
        .then((data) => {
          if (data.job) {
            setPipelineRenders((current) => [data.job as PipelineRenderJob, ...current.filter((job) => job.scenePromptId !== data.job?.scenePromptId)]);
            setPipelineScenes((current) => current.map((scene) => scene.id === data.scene?.id ? { ...scene, status: data.scene?.status || scene.status } : scene));
            setPipelineNote(`Auto-chain đã đẩy scene kế tiếp lên ${data.provider?.name || 'provider'}.`);
          } else if (data.done) {
            setPipelineNote(data.message || 'Auto-chain đã chạy hết các scene khả dụng.');
          }
        })
        .catch(() => undefined);
    }, 1500);

    return () => window.clearTimeout(timer);
  }, [autoChainRunway, token, pipelinePackage, pipelineRenders, pipelineScenes, selectedVideoProvider]);

  useEffect(() => {
    if (!token || !pipelinePackage) return;
    const hasActiveVoiceJobs = voiceJobs.some((job) => ['queued', 'rendering'].includes(job.status));
    if (!hasActiveVoiceJobs) return;

    const timer = window.setInterval(() => {
      request<{ jobs: VoiceJob[] }>('/api/voice-jobs/poll-active', {
        method: 'POST',
        body: JSON.stringify({ contentPackageId: pipelinePackage.id }),
      }, token)
        .then((data) => {
          setVoiceJobs((current) => current.map((job) => {
            const next = data.jobs.find((item) => item.id === job.id);
            return next ? { ...job, ...next } : job;
          }));
        })
        .catch(() => undefined);
    }, 10000);

    return () => window.clearInterval(timer);
  }, [token, pipelinePackage, voiceJobs]);

  const completeAuth = async (path: '/api/auth/login' | '/api/auth/register') => {
    setLoading(true);
    setError('');
    try {
      const payload = path === '/api/auth/register' ? { name, email, password } : { email, password };
      const data = await request<{ token: string }>(path, { method: 'POST', body: JSON.stringify(payload) });
      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async (next: BrandProfile) => {
    if (!token) return;
    setProfile(next);
    await request('/api/profile', { method: 'PUT', body: JSON.stringify(next) }, token);
  };

  const saveBrief = async (next: CreativeBrief) => {
    if (!token) return;
    setBrief(next);
    await request('/api/brief', { method: 'PUT', body: JSON.stringify(next) }, token);
  };

  const trackEvent = async (type: string, platform?: string) => {
    if (!token) return;
    const data = await request<{ ok: boolean; analytics: AnalyticsSummary }>('/api/analytics/event', { method: 'POST', body: JSON.stringify({ type, platform }) }, token);
    setAnalytics(data.analytics);
  };

  const applyGenerationResponse = (data: { providers: ProviderInfo[]; subscription: SubscriptionInfo; analytics: AnalyticsSummary }, nextJobs?: ProductionJob[], nextAssets?: AssetCard[]) => {
    if (nextJobs) setJobs((current) => [...nextJobs, ...current].slice(0, 90));
    if (nextAssets) {
      setAssets((current) => [...nextAssets, ...current].slice(0, 200));
      setActiveAssetId(nextAssets[0]?.id || null);
    }
    setProviders(data.providers);
    setSubscription(data.subscription);
    setAnalytics(data.analytics);
    setTab('library');
  };

  const generateSingle = async () => {
    if (!token || !brief || !profile) return;
    const data = await request<{ job: ProductionJob; asset: AssetCard; providers: ProviderInfo[]; subscription: SubscriptionInfo; analytics: AnalyticsSummary }>('/api/generate', { method: 'POST', body: JSON.stringify({ profile, brief }) }, token);
    applyGenerationResponse(data, [data.job], [data.asset]);
  };

  const generateWeek = async () => {
    if (!token || !brief || !profile) return;
    const data = await request<{ jobs: ProductionJob[]; assets: AssetCard[]; providers: ProviderInfo[]; subscription: SubscriptionInfo; analytics: AnalyticsSummary }>('/api/generate-week', { method: 'POST', body: JSON.stringify({ profile, brief }) }, token);
    applyGenerationResponse(data, data.jobs, data.assets);
  };

  const generateMonth = async () => {
    if (!token || !brief || !profile) return;
    const data = await request<{ jobs: ProductionJob[]; assets: AssetCard[]; providers: ProviderInfo[]; subscription: SubscriptionInfo; analytics: AnalyticsSummary }>('/api/generate-month', { method: 'POST', body: JSON.stringify({ profile, brief }) }, token);
    applyGenerationResponse(data, data.jobs, data.assets);
  };

  const copyText = async (value: string) => {
    await navigator.clipboard.writeText(value);
    await trackEvent('copy', activeAsset?.platform);
  };

  const shareActiveAsset = async () => {
    if (!activeAsset) return;
    const text = [
      activeAsset.content.headline,
      activeAsset.content.captionShort,
      activeAsset.content.hashtags.join(' '),
    ].join('\n\n');

    try {
      if (Capacitor.getPlatform() === 'web' && navigator.share) {
        await navigator.share({ title: activeAsset.title, text });
      } else {
        const { Share } = await import('@capacitor/share');
        await Share.share({ title: activeAsset.title, text, dialogTitle: 'Chia sẻ nội dung Viral Video Studio' });
      }
      setShareNote('Đã mở chia sẻ nội dung.');
    } catch (err) {
      setShareNote(`Không thể chia sẻ nội dung: ${(err as Error).message}`);
    }
  };

  const choosePlan = async (planId: PlanOption['id']) => {
    if (!token) return;
    const data = await request<{ subscription: SubscriptionInfo; plans: PlanOption[] }>('/api/subscription/select', { method: 'POST', body: JSON.stringify({ planId }) }, token);
    setSubscription(data.subscription);
    setPlans(data.plans);
  };

  const openCheckout = async (planId: PlanOption['id']) => {
    if (!token) return;
    const data = await request<{ mode: string; checkoutUrl: string; note: string }>('/api/billing/checkout', { method: 'POST', body: JSON.stringify({ planId }) }, token);
    setBillingNote(data.note);
    window.open(data.checkoutUrl, '_blank', 'noopener,noreferrer');
  };

  const openBillingPortal = async () => {
    if (!token) return;
    const data = await request<{ portalUrl: string; provider: string }>('/api/billing/portal', {}, token);
    setBillingNote(`Portal billing đang dùng provider: ${data.provider}`);
    window.open(data.portalUrl, '_blank', 'noopener,noreferrer');
  };

  const applyTemplate = async (template: TemplatePack) => {
    if (!profile || !brief) return;
    const nextProfile = { ...profile, category: template.category, tone: template.tone, offer: template.promo };
    const nextBrief = { ...brief, productName: template.productName, productDetails: template.productDetails, targetAudience: template.targetAudience, painPoint: template.painPoint, objective: template.objective, platform: template.platform, tone: template.tone, callToAction: template.callToAction, promo: template.promo };
    await saveProfile(nextProfile);
    await saveBrief(nextBrief);
  };

  const saveRetention = async (next: RetentionSettings) => {
    if (!token) return;
    setRetention(next);
    const data = await request<{ retention: RetentionSettings }>('/api/retention', { method: 'PUT', body: JSON.stringify(next) }, token);
    setRetention(data.retention);
  };

  const sendTestNotification = async () => {
    try {
      if (Capacitor.getPlatform() === 'web') {
        setNotificationNote('Web không push native. Hãy test trong Android build.');
        return;
      }
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      const permission = await LocalNotifications.requestPermissions();
      if (permission.display !== 'granted') {
        setNotificationNote('Chưa được cấp quyền thông báo.');
        return;
      }
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Date.now(),
            title: 'Viral Video Studio',
            body: 'Nhắc nhẹ Boss tạo content mới hôm nay nhé.',
            schedule: { at: new Date(Date.now() + 5000) },
          },
        ],
      });
      setNotificationNote('Đã lên lịch test notification sau 5 giây.');
    } catch (err) {
      setNotificationNote(`Không thể gửi test notification: ${(err as Error).message}`);
    }
  };

  const syncRetentionNotifications = async () => {
    try {
      if (Capacitor.getPlatform() === 'web') {
        setNotificationNote('Cần chạy trong Android app để sync notification thật.');
        return;
      }
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      const permission = await LocalNotifications.requestPermissions();
      if (permission.display !== 'granted') {
        setNotificationNote('Chưa có quyền thông báo để sync lịch nhắc.');
        return;
      }

      await LocalNotifications.cancel({ notifications: [{ id: 1001 }, { id: 1002 }, { id: 1003 }] });

      const notifications = [] as Array<{ id: number; title: string; body: string; schedule: { at: Date } }>;
      const now = new Date();
      const nextAt = (hour: number, minute: number) => {
        const next = new Date();
        next.setHours(hour, minute, 0, 0);
        if (next <= now) next.setDate(next.getDate() + 1);
        return next;
      };

      if (retention?.morningReminder) {
        notifications.push({ id: 1001, title: 'Viral Video Studio', body: retentionMessages?.morning || 'Chào buổi sáng, đến giờ tạo content mới rồi nhé.', schedule: { at: nextAt(9, 0) } });
      }
      if (retention?.eveningReminder) {
        notifications.push({ id: 1002, title: 'Viral Video Studio', body: retentionMessages?.evening || 'Buổi tối là lúc tốt để chuẩn bị nội dung cho ngày mai.', schedule: { at: nextAt(20, 0) } });
      }
      notifications.push({ id: 1003, title: 'Viral Video Studio', body: retentionMessages?.winback || `Đã ${retention?.winbackDays || 7} ngày, quay lại tạo bài mới để giữ đà sáng tạo nhé.`, schedule: { at: new Date(Date.now() + (retention?.winbackDays || 7) * 24 * 60 * 60 * 1000) } });

      await LocalNotifications.schedule({ notifications });
      setNotificationNote(`Đã sync ${notifications.length} notification theo retention settings.`);
    } catch (err) {
      setNotificationNote(`Không thể sync retention notification: ${(err as Error).message}`);
    }
  };

  const exportBackup = async () => {
    if (!token) return;
    const data = await request('/api/backup/export', {}, token);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `viral-video-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setBackupNote('Đã export backup JSON.');
  };

  const copyDiagnostics = async () => {
    await navigator.clipboard.writeText(JSON.stringify(diagnosticsSnapshot, null, 2));
    setSupportNote('Đã copy diagnostics cho support/internal testing.');
  };

  const exportDiagnostics = async () => {
    const blob = new Blob([JSON.stringify(diagnosticsSnapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `viral-video-diagnostics-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setSupportNote('Đã export diagnostics JSON.');
  };

  const importBackup = async (file: File | null) => {
    if (!token || !file) return;
    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      const data = await request<{ ok: boolean; profile: BrandProfile; brief: CreativeBrief; retention: RetentionSettings }>('/api/backup/import', {
        method: 'POST',
        body: JSON.stringify(payload),
      }, token);
      setProfile(data.profile);
      setBrief(data.brief);
      setRetention(data.retention);
      setBackupNote('Đã import backup thành công.');
    } catch (err) {
      setBackupNote(`Import backup thất bại: ${(err as Error).message}`);
    }
  };

  const runPipeline = async () => {
    if (!token) return;
    setPipelineNote('Đang quét trend và dựng pipeline mẫu...');
    const data = await request<{
      scan: PipelineScan;
      trendItems: PipelineTrendItem[];
      recommendedTopics: PipelineMainTopic[];
      platformRankings: PlatformRankingMap;
      hybridPicks: PipelineMainTopic[];
      characterProfiles: CharacterProfile[];
      voiceProfiles: VoiceProfile[];
      voiceJobs: VoiceJob[];
      selectedTopic: PipelineMainTopic;
      subtopics: PipelineSubtopic[];
      selectedSubtopic: PipelineSubtopic;
      contentPackage: PipelineContentPackage;
      scenes: PipelineScene[];
    }>('/api/viral-pipeline/run', {
      method: 'POST',
      body: JSON.stringify({ durationTargetSec: 60, aspectRatio: '9:16', stylePreset: 'realistic-cgi' }),
    }, token);
    setPipelineScan(data.scan);
    setPipelineTrendItems(data.trendItems);
    setPipelineTopics(data.recommendedTopics);
    setPlatformRankings(data.platformRankings || { youtube: [], facebook: [], tiktok: [] });
    setHybridPicks(data.hybridPicks || []);
    setCharacterProfiles(data.characterProfiles || []);
    if (data.characterProfiles?.[0]?.id) setSelectedCharacterId(data.characterProfiles[0].id);
    setVoiceProfiles(data.voiceProfiles || []);
    if (data.voiceProfiles?.[0]?.id) setSelectedVoiceId(data.voiceProfiles[0].id);
    if (data.voiceProfiles?.[0]?.id) setSelectedCharacterVoiceId(data.voiceProfiles[0].id);
    setVoiceJobs(data.voiceJobs || []);
    setSelectedMainTopicId(data.selectedTopic.id);
    setPipelineSubtopics(data.subtopics);
    setSelectedSubtopicId(data.selectedSubtopic.id);
    setPipelinePackage(data.contentPackage);
    setPipelineScenes(data.scenes);
    setPipelineNote('Đã chạy xong pipeline mẫu từ trend đến scene prompts.');
    setTab('pipeline');
  };

  const generateSubtopics = async (mainTopicId: string) => {
    if (!token) return;
    const data = await request<{ items: PipelineSubtopic[] }>(`/api/topics/main/${mainTopicId}/subtopics/generate`, {
      method: 'POST',
      body: JSON.stringify({ limit: 20 }),
    }, token);
    setSelectedMainTopicId(mainTopicId);
    setPipelineSubtopics(data.items);
    setSelectedSubtopicId(null);
    setPipelinePackage(null);
    setPipelineScenes([]);
    setPipelineNote('Đã tạo 20 chủ đề nhỏ cho chủ đề chính đã chọn.');
  };

  const createPipelinePackage = async (subtopicId: string) => {
    if (!token) return;
    const data = await request<PipelineContentPackage>(`/api/subtopics/${subtopicId}/content-package`, {
      method: 'POST',
      body: JSON.stringify({
        durationTargetSec: 60,
        aspectRatio: '9:16',
        stylePreset: 'realistic-cgi',
        characterProfileId: selectedCharacterId || pipelinePackage?.characterProfileId || null,
        voiceProfileId: selectedVoiceId || pipelinePackage?.voiceProfileId || null,
      }),
    }, token);
    setSelectedSubtopicId(subtopicId);
    setPipelinePackage(data);
    setPipelineScenes([]);
    setPipelineNote('Đã tạo content package song ngữ và giữ continuity cho serial nếu đã chọn nhân vật/giọng.');
  };

  const generatePipelineScenes = async () => {
    if (!token || !pipelinePackage) return;
    const data = await request<{ items: PipelineScene[] }>(`/api/content-packages/${pipelinePackage.id}/scene-prompts`, {
      method: 'POST',
      body: JSON.stringify({ sceneDurationSec: 8 }),
    }, token);
    setPipelineScenes(data.items);
    setPipelineNote(`Đã tạo ${data.items.length} phân cảnh.`);
  };

  const renderPipelineScenes = async () => {
    if (!token || !pipelinePackage) return;
    const data = await request<{ jobs: PipelineRenderJob[]; provider: VideoProviderOption }>(`/api/content-packages/${pipelinePackage.id}/render`, {
      method: 'POST',
      body: JSON.stringify({ provider: selectedVideoProvider }),
    }, token);
    setPipelineRenders(data.jobs);
    setPipelineScenes((current) => current.map((scene) => ({ ...scene, status: 'done' })));
    setPipelineNote(`Đã render bằng provider: ${data.provider.name}.`);
  };

  const approveScene = async (sceneId: string) => {
    if (!token) return;
    await request(`/api/scenes/${sceneId}/approve`, { method: 'POST' }, token);
    setPipelineScenes((current) => current.map((scene) => scene.id === sceneId ? { ...scene, status: 'approved' } : scene));
    setPipelineNote(`Đã duyệt scene ${sceneId.slice(0, 6)}.`);
  };

  const approveReadyScenes = async () => {
    if (!token || !pipelinePackage) return;
    const data = await request<{ approvedSceneIds: string[]; totalScenes: number }>(`/api/content-packages/${pipelinePackage.id}/approve-ready-scenes`, {
      method: 'POST',
    }, token);
    setPipelineScenes((current) => current.map((scene) => data.approvedSceneIds.includes(scene.id) ? { ...scene, status: 'approved' } : scene));
    setPipelinePackage((current) => current ? { ...current, status: data.approvedSceneIds.length === data.totalScenes ? 'waiting-review' : current.status } : current);
    setPipelineNote(`Đã approve ${data.approvedSceneIds.length}/${data.totalScenes} scene đủ điều kiện.`);
  };

  const renderSingleScene = async (sceneId: string) => {
    if (!token || !pipelinePackage) return;
    const data = await request<{ jobs: PipelineRenderJob[]; provider: VideoProviderOption }>(`/api/content-packages/${pipelinePackage.id}/render`, {
      method: 'POST',
      body: JSON.stringify({ provider: selectedVideoProvider, sceneIds: [sceneId] }),
    }, token);
    setPipelineRenders((current) => [...data.jobs, ...current.filter((job) => !data.jobs.some((next) => next.scenePromptId === job.scenePromptId))]);
    setPipelineScenes((current) => current.map((scene) => scene.id === sceneId ? { ...scene, status: data.jobs[0]?.status || scene.status } : scene));
    setPipelinePackage((current) => current ? { ...current, status: 'rendering' } : current);
    setPipelineNote(`Đã render riêng scene bằng ${data.provider.name}.`);
  };

  const pollRenderJob = async (jobId: string) => {
    if (!token) return;
    const data = await request<{ job: PipelineRenderJob }>(`/api/render-jobs/${jobId}`, {}, token);
    setPipelineRenders((current) => current.map((job) => job.id === jobId || job.scenePromptId === data.job.scenePromptId ? { ...job, ...data.job } : job));
    setPipelineScenes((current) => current.map((scene) => scene.id === data.job.scenePromptId ? { ...scene, status: data.job.status } : scene));
    setPipelineNote(`Đã cập nhật trạng thái render: ${data.job.status}.`);
  };

  const pollActiveRenderJobs = async () => {
    if (!token || !pipelinePackage) return;
    const data = await request<{ jobs: PipelineRenderJob[] }>('/api/render-jobs/poll-active', {
      method: 'POST',
      body: JSON.stringify({ contentPackageId: pipelinePackage.id }),
    }, token);
    setPipelineRenders((current) => current.map((job) => {
      const next = data.jobs.find((item) => item.id === job.id);
      return next ? { ...job, ...next } : job;
    }));
    setPipelineScenes((current) => current.map((scene) => {
      const next = data.jobs.find((job) => job.scenePromptId === scene.id);
      return next ? { ...scene, status: next.status } : scene;
    }));
    setPipelinePackage((current) => {
      if (!current) return current;
      const nextJobs = pipelineRenders.map((job) => {
        const next = data.jobs.find((item) => item.id === job.id);
        return next ? { ...job, ...next } : job;
      });
      if (nextJobs.some((job) => job.status === 'failed')) return { ...current, status: 'render-error' };
      if (nextJobs.some((job) => ['queued', 'rendering'].includes(job.status))) return { ...current, status: 'rendering' };
      if (nextJobs.length && nextJobs.every((job) => job.status === 'done')) return { ...current, status: 'waiting-review' };
      return current;
    });
    setPipelineNote(`Đã poll ${data.jobs.length} render job đang chạy.`);
  };

  const renderNextScene = async () => {
    if (!token || !pipelinePackage) return;
    const data = await request<{ ok: boolean; done?: boolean; message?: string; scene?: PipelineScene; job?: PipelineRenderJob; provider?: VideoProviderOption }>(`/api/content-packages/${pipelinePackage.id}/render-next`, {
      method: 'POST',
      body: JSON.stringify({ provider: selectedVideoProvider }),
    }, token);
    if (data.done) {
      setPipelineNote(data.message || 'Không còn scene nào để render tiếp.');
      return;
    }
    if (data.job) {
      setPipelineRenders((current) => [data.job as PipelineRenderJob, ...current.filter((job) => job.scenePromptId !== data.job?.scenePromptId)]);
      setPipelineScenes((current) => current.map((scene) => scene.id === data.scene?.id ? { ...scene, status: data.scene?.status || scene.status } : scene));
      setPipelinePackage((current) => current ? { ...current, status: 'rendering' } : current);
      setPipelineNote(`Đã đẩy scene kế tiếp lên ${data.provider?.name || 'provider'}.`);
    }
  };

  const processNextScene = async () => {
    if (!token || !pipelinePackage) return;
    const data = await request<{ ok: boolean; done?: boolean; message?: string; scene?: PipelineScene; renderJob?: PipelineRenderJob; voiceJob?: VoiceJob; provider?: VideoProviderOption }>(`/api/content-packages/${pipelinePackage.id}/process-next`, {
      method: 'POST',
      body: JSON.stringify({ provider: selectedVideoProvider }),
    }, token);
    if (data.done) {
      setPipelineNote(data.message || 'Không còn scene nào để xử lý tiếp.');
      return;
    }
    if (data.renderJob) {
      setPipelineRenders((current) => [data.renderJob as PipelineRenderJob, ...current.filter((job) => job.scenePromptId !== data.renderJob?.scenePromptId)]);
    }
    if (data.voiceJob) {
      setVoiceJobs((current) => [data.voiceJob as VoiceJob, ...current.filter((job) => job.scenePromptId !== data.voiceJob?.scenePromptId)]);
    }
    if (data.scene) {
      setPipelineScenes((current) => current.map((scene) => scene.id === data.scene?.id ? { ...scene, status: data.scene?.status || scene.status } : scene));
    }
    setPipelinePackage((current) => current ? { ...current, status: 'rendering' } : current);
    setPipelineNote(`Đã xử lý scene kế tiếp bằng ${data.provider?.name || 'provider'}: video + voice.`);
  };

  const renderMissingScenes = async (provider = 'mock') => {
    if (!token || !pipelinePackage) return;
    const data = await request<{ createdJobs: PipelineRenderJob[]; message?: string }>(`/api/content-packages/${pipelinePackage.id}/render-missing`, {
      method: 'POST',
      body: JSON.stringify({ provider }),
    }, token);
    if (data.createdJobs?.length) {
      setPipelineRenders((current) => [...data.createdJobs, ...current.filter((item) => !data.createdJobs.some((job) => job.scenePromptId === item.scenePromptId))]);
      setPipelineScenes((current) => current.map((scene) => {
        const next = data.createdJobs.find((job) => job.scenePromptId === scene.id);
        return next ? { ...scene, status: next.status === 'done' ? 'done' : next.status } : scene;
      }));
    }
    setPipelineNote(data.message || `Đã render ${data.createdJobs?.length || 0} scene còn thiếu bằng ${provider}.`);
  };

  const createCharacterProfile = async () => {
    if (!token || !characterName.trim() || !characterPrompt.trim()) return;
    const data = await request<{ item: CharacterProfile; items: CharacterProfile[] }>('/api/characters', {
      method: 'POST',
      body: JSON.stringify({ name: characterName, visualPrompt: characterPrompt, referenceImageUrl: characterImageUrl, defaultVoiceProfileId: selectedCharacterVoiceId }),
    }, token);
    setCharacterProfiles(data.items);
    setSelectedCharacterId(data.item.id);
    setCharacterName('');
    setCharacterPrompt('');
    setCharacterImageUrl('');
    setPipelineNote(`Đã tạo hồ sơ nhân vật: ${data.item.name}.`);
  };

  const attachVoiceToCharacter = async (characterId: string) => {
    if (!token || !selectedCharacterVoiceId) return;
    const data = await request<{ items: CharacterProfile[] }>(`/api/characters/${characterId}/voice-profile`, {
      method: 'POST',
      body: JSON.stringify({ voiceProfileId: selectedCharacterVoiceId }),
    }, token);
    setCharacterProfiles(data.items);
    setPipelineNote('Đã gắn giọng nói mặc định cho nhân vật.');
  };

  const attachCharacterToPackage = async () => {
    if (!token || !pipelinePackage || !selectedCharacterId) return;
    const data = await request<{ contentPackage: PipelineContentPackage }> (`/api/content-packages/${pipelinePackage.id}/character`, {
      method: 'POST',
      body: JSON.stringify({ characterProfileId: selectedCharacterId }),
    }, token);
    setPipelinePackage(data.contentPackage);
    if (data.contentPackage.voiceProfileId) setSelectedVoiceId(data.contentPackage.voiceProfileId);
    setPipelineNote('Đã gắn nhân vật vào package hiện tại để giữ đồng nhất serial video.');
  };

  const attachVoiceToPackage = async () => {
    if (!token || !pipelinePackage || !selectedVoiceId) return;
    const data = await request<{ contentPackage: PipelineContentPackage }>(`/api/content-packages/${pipelinePackage.id}/voice-profile`, {
      method: 'POST',
      body: JSON.stringify({ voiceProfileId: selectedVoiceId }),
    }, token);
    setPipelinePackage(data.contentPackage);
    setPipelineNote('Đã gắn voice profile vào package hiện tại.');
  };

  const updateVoiceSettings = async (patch: Partial<NonNullable<PipelineContentPackage['voiceSettings']>>) => {
    if (!token || !pipelinePackage) return;
    const data = await request<{ contentPackage: PipelineContentPackage }>(`/api/content-packages/${pipelinePackage.id}/voice-settings`, {
      method: 'POST',
      body: JSON.stringify(patch),
    }, token);
    setPipelinePackage(data.contentPackage);
    setPipelineNote('Đã cập nhật voice settings.');
  };

  const generateSceneVoice = async (sceneId: string, provider = 'runway-tts') => {
    if (!token) return;
    const data = await request<{ job: VoiceJob }> (`/api/scenes/${sceneId}/voice-generate`, {
      method: 'POST',
      body: JSON.stringify({ provider }),
    }, token);
    setVoiceJobs((current) => [data.job, ...current.filter((item) => item.scenePromptId !== data.job.scenePromptId)]);
    setPipelineNote(`Đã tạo voice job cho scene bằng ${provider}.`);
  };

  const pollVoiceJob = async (jobId: string) => {
    if (!token) return;
    const data = await request<{ job: VoiceJob }>(`/api/voice-jobs/${jobId}`, {}, token);
    setVoiceJobs((current) => current.map((item) => item.id === jobId ? { ...item, ...data.job } : item));
    setPipelineNote(`Đã cập nhật voice job: ${data.job.status}.`);
  };

  const pollActiveVoiceJobs = async () => {
    if (!token || !pipelinePackage) return;
    const data = await request<{ jobs: VoiceJob[] }>('/api/voice-jobs/poll-active', {
      method: 'POST',
      body: JSON.stringify({ contentPackageId: pipelinePackage.id }),
    }, token);
    setVoiceJobs((current) => current.map((job) => {
      const next = data.jobs.find((item) => item.id === job.id);
      return next ? { ...job, ...next } : job;
    }));
    setPipelineNote(`Đã poll ${data.jobs.length} voice job đang chạy.`);
  };

  const generateMissingVoices = async (provider = 'runway-tts') => {
    if (!token || !pipelinePackage) return;
    const data = await request<{ createdJobs: VoiceJob[] }> (`/api/content-packages/${pipelinePackage.id}/voice-generate-missing`, {
      method: 'POST',
      body: JSON.stringify({ provider }),
    }, token);
    if (data.createdJobs?.length) {
      setVoiceJobs((current) => [...data.createdJobs, ...current]);
    }
    setPipelineNote(`Đã tạo ${data.createdJobs?.length || 0} voice job còn thiếu bằng ${provider}.`);
  };

  const stitchPipelineVideo = async () => {
    if (!token || !pipelinePackage) return;
    const data = await request<{ finalVideo: PipelineFinalVideo }>(`/api/content-packages/${pipelinePackage.id}/stitch`, {
      method: 'POST',
      body: JSON.stringify({ addVoiceover: true, addSubtitles: true, addMusic: true, burnSubtitles: true }),
    }, token);
    setPipelineFinals((current) => [data.finalVideo, ...current]);
    setPipelineNote('Đã ghép final video mock.');
  };

  const finalizeReadyPackage = async () => {
    if (!token || !pipelinePackage) return;
    const approveData = await request<{ approvedSceneIds: string[]; totalScenes: number }>(`/api/content-packages/${pipelinePackage.id}/approve-ready-scenes`, {
      method: 'POST',
    }, token);
    setPipelineScenes((current) => current.map((scene) => approveData.approvedSceneIds.includes(scene.id) ? { ...scene, status: 'approved' } : scene));
    const stitchData = await request<{ finalVideo: PipelineFinalVideo }>(`/api/content-packages/${pipelinePackage.id}/stitch`, {
      method: 'POST',
      body: JSON.stringify({ addVoiceover: true, addSubtitles: true, addMusic: true, burnSubtitles: true }),
    }, token);
    setPipelineFinals((current) => [stitchData.finalVideo, ...current.filter((item) => item.id !== stitchData.finalVideo.id)]);
    setPipelinePackage((current) => current ? { ...current, status: 'stitched' } : current);
    setPipelineNote(`Đã approve ${approveData.approvedSceneIds.length}/${approveData.totalScenes} scene và ghép final.`);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setProfile(null);
    setBrief(null);
    setUser(null);
  };

  if (!token) {
    return (
      <div className="shell auth-shell">
        <section className="card auth-card phone-frame">
          <span className="eyebrow">Android-first thương mại</span>
          <h1>{authMode === 'login' ? 'Đăng nhập Viral Video Studio' : 'Tạo tài khoản Viral Video Studio'}</h1>
          <p>Tạo caption bán hàng, lịch 7 ngày, lịch 30 ngày và chuẩn bị lên Android trước.</p>
          {authMode === 'register' ? <Field label="Tên hiển thị" value={name} onChange={setName} /> : null}
          <Field label="Email" value={email} onChange={setEmail} />
          <label className="field"><span>Mật khẩu</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          {error ? <p className="error-text">{error}</p> : null}
          <button className="primary-btn wide" onClick={() => completeAuth(authMode === 'login' ? '/api/auth/login' : '/api/auth/register')} disabled={loading}>{loading ? 'Đang xử lý...' : authMode === 'login' ? 'Vào app' : 'Tạo tài khoản'}</button>
          <button className="ghost-btn wide" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>{authMode === 'login' ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}</button>
          <p className="helper">Demo account: boss@viralvideo.local / 123456</p>
        </section>
      </div>
    );
  }

  if (!profile || !brief || !subscription || !analytics || !retention) {
    return <div className="shell auth-shell"><section className="card auth-card phone-frame"><h1>Đang tải dữ liệu...</h1>{error ? <p className="error-text">{error}</p> : null}</section></div>;
  }

  return (
    <div className="shell app-shell">
      <section className="hero card hero-mobile">
        <div>
          <span className="eyebrow">Viral Video Studio · Android-first</span>
          <h1>App mobile cho shop Việt Nam, có onboarding rõ hơn và paywall gần bản thương mại.</h1>
          <p>Giờ trải nghiệm đầu vào tốt hơn, người dùng mới sẽ biết phải làm gì trước khi tạo content và khi nào nên nâng cấp gói.</p>
        </div>
        <div className="hero-grid">{stats.map((item) => <div className="metric" key={item.label}><strong>{item.value}</strong><span>{item.label}</span></div>)}</div>
      </section>

      <div className="mobile-tabs">
        <button className={tab === 'create' ? 'tab-btn active' : 'tab-btn'} onClick={() => setTab('create')}>Tạo</button>
        <button className={tab === 'pipeline' ? 'tab-btn active' : 'tab-btn'} onClick={() => setTab('pipeline')}>Pipeline</button>
        <button className={tab === 'library' ? 'tab-btn active' : 'tab-btn'} onClick={() => setTab('library')}>Thư viện</button>
        <button className={tab === 'settings' ? 'tab-btn active' : 'tab-btn'} onClick={() => setTab('settings')}>Cài đặt</button>
      </div>

      {tab === 'create' ? (
        <section className="section-grid two-up">
          <div className="card phone-frame">
            <div className="onboarding-card">
              <div className="section-head no-margin"><div><span className="eyebrow">Onboarding</span><h2>Bắt đầu nhanh</h2></div><span className="progress-label">{onboardingPercent}%</span></div>
              <div className="progress-bar"><span style={{ width: `${onboardingPercent}%` }} /></div>
              <div className="checklist-grid">{onboardingSteps.map((step) => <div className={step.done ? 'check-item done' : 'check-item'} key={step.label}><span>{step.done ? '✓' : '•'}</span><p>{step.label}</p></div>)}</div>
            </div>

            <div className="section-head top-gap"><div><span className="eyebrow">1. Hồ sơ shop</span><h2>Thiết lập thương hiệu</h2></div></div>
            <div className="form-grid">
              <Field label="Tên shop" value={profile.shopName} onChange={(value) => saveProfile({ ...profile, shopName: value })} />
              <SelectField label="Ngành hàng" value={profile.category} onChange={(value) => saveProfile({ ...profile, category: value as BrandProfile['category'] })} options={Object.entries(categoryLabels).map(([value, label]) => ({ value, label }))} />
              <Field label="Khách hàng mục tiêu" value={profile.audience} onChange={(value) => saveProfile({ ...profile, audience: value })} />
              <Field label="Điểm bán hàng mạnh nhất" value={profile.sellingPoint} onChange={(value) => saveProfile({ ...profile, sellingPoint: value })} />
              <SelectField label="Tone mặc định" value={profile.tone} onChange={(value) => saveProfile({ ...profile, tone: value as BrandProfile['tone'] })} options={Object.entries(toneLabels).map(([value, label]) => ({ value, label }))} />
              <Field label="Offer chính" value={profile.offer} onChange={(value) => saveProfile({ ...profile, offer: value })} />
            </div>

            <div className="section-head top-gap"><div><span className="eyebrow">Template theo ngành</span><h2>Áp mẫu nhanh</h2></div></div>
            <div className="templates-grid">{(categoryTemplates.length ? categoryTemplates : templates).map((template) => <article className="template-card" key={template.id}><span className="badge">{template.category}</span><h3>{template.title}</h3><p>{template.description}</p><button className="ghost-btn wide" onClick={() => applyTemplate(template)}>Dùng mẫu này</button></article>)}</div>
          </div>

          <div className="card phone-frame">
            <div className="section-head"><div><span className="eyebrow">2. Tạo nội dung</span><h2>Brief bài đăng</h2></div></div>
            <div className="form-grid">
              <Field label="Tên sản phẩm / dịch vụ" value={brief.productName} onChange={(value) => saveBrief({ ...brief, productName: value })} />
              <Field label="Mô tả nổi bật" value={brief.productDetails} onChange={(value) => saveBrief({ ...brief, productDetails: value })} />
              <Field label="Khách hàng mục tiêu" value={brief.targetAudience} onChange={(value) => saveBrief({ ...brief, targetAudience: value })} />
              <Field label="Nỗi đau khách hàng" value={brief.painPoint} onChange={(value) => saveBrief({ ...brief, painPoint: value })} />
              <SelectField label="Mục tiêu" value={brief.objective} onChange={(value) => saveBrief({ ...brief, objective: value as CreativeBrief['objective'] })} options={[{ value: 'ban-hang', label: 'Bán hàng' }, { value: 'keo-inbox', label: 'Kéo inbox' }, { value: 'ra-mat', label: 'Ra mắt' }, { value: 'livestream', label: 'Livestream' }]} />
              <SelectField label="Nền tảng" value={brief.platform} onChange={(value) => saveBrief({ ...brief, platform: value as CreativeBrief['platform'] })} options={[{ value: 'Facebook', label: 'Facebook' }, { value: 'Zalo', label: 'Zalo' }, { value: 'TikTok', label: 'TikTok' }, { value: 'Instagram', label: 'Instagram' }]} />
              <SelectField label="Tone bài viết" value={brief.tone} onChange={(value) => saveBrief({ ...brief, tone: value as CreativeBrief['tone'] })} options={Object.entries(toneLabels).map(([value, label]) => ({ value, label }))} />
              <Field label="Ưu đãi / khuyến mãi" value={brief.promo} onChange={(value) => saveBrief({ ...brief, promo: value })} />
              <Field label="Call to action" value={brief.callToAction} onChange={(value) => saveBrief({ ...brief, callToAction: value })} />
              <SelectField label="Provider" value={brief.provider} onChange={(value) => saveBrief({ ...brief, provider: value })} options={providers.map((provider) => ({ value: provider.id, label: provider.name }))} />
            </div>
            <div className="action-row triple">
              <button className="primary-btn wide" onClick={generateSingle}>Tạo 1 bài</button>
              <button className="ghost-btn wide" onClick={generateWeek}>Lịch 7 ngày</button>
              <button className="ghost-btn wide" onClick={generateMonth}>Lịch 30 ngày</button>
            </div>
            <div className="provider-grid compact-grid">{providers.map((provider) => <article className={provider.ready ? 'provider-card ready' : 'provider-card'} key={provider.id}><div><strong>{provider.name}</strong><span>{provider.kind}</span></div><p>{provider.note}</p></article>)}</div>
          </div>
        </section>
      ) : null}

      {tab === 'pipeline' ? (
        <section className="section-grid single-pane">
          <div className="card phone-frame">
            <div className="section-head">
              <div>
                <span className="eyebrow">Viral Video Pipeline</span>
                <h2>Từ trend tới video hoàn chỉnh</h2>
              </div>
              <button className="primary-btn" onClick={runPipeline}>Chạy pipeline mẫu</button>
            </div>

            {pipelineNote ? <p className="billing-note">{pipelineNote}</p> : null}

            <div className="pipeline-grid top-gap">
              <div className="result-block">
                <div className="result-head"><span>1. Trend scan</span></div>
                <p>{pipelineScan ? `${pipelineScan.country} • ${pipelineScan.platforms.join(', ')} • ${pipelineScan.window} • ${pipelineScan.status}` : 'Chưa có dữ liệu scan.'}</p>
              </div>

              <div className="result-block">
                <div className="result-head"><span>2. Style presets</span></div>
                <div className="tag-list">{pipelinePresets.slice(0, 8).map((item) => <span className="tag" key={item}>{item}</span>)}</div>
              </div>
            </div>

            <div className="section-head top-gap"><div><span className="eyebrow">Trend thật</span><h2>Tín hiệu đang nóng</h2></div></div>
            <div className="stack">
              {pipelineTrendItems.length ? pipelineTrendItems.slice(0, 8).map((item) => (
                <article className="job-card" key={item.id}>
                  <div><span className="badge">{item.source}</span><h3>{item.title}</h3></div>
                  <div className="job-meta"><span>{item.channelName}</span><span>{item.platform}</span><span>Views {item.views || 0}</span><span>Viral {item.viralScore}</span></div>
                </article>
              )) : <div className="empty-state"><p>Chưa có trend thật. Bấm chạy pipeline mẫu để fetch dữ liệu sống.</p></div>}
            </div>

            <div className="section-head top-gap"><div><span className="eyebrow">Top 5</span><h2>Chủ đề chính</h2></div></div>
            <div className="retention-grid multi-filter-grid">
              <ToggleCard label="Viral mạnh" value={multiFilters.viralStrong} onClick={() => setMultiFilters((current) => ({ ...current, viralStrong: !current.viralStrong }))} />
              <ToggleCard label="Kiếm tiền cao" value={multiFilters.monetizationHigh} onClick={() => setMultiFilters((current) => ({ ...current, monetizationHigh: !current.monetizationHigh }))} />
              <ToggleCard label="Dễ làm" value={multiFilters.easyToMake} onClick={() => setMultiFilters((current) => ({ ...current, easyToMake: !current.easyToMake }))} />
              <ToggleCard label="Cạnh tranh thấp" value={multiFilters.lowCompetition} onClick={() => setMultiFilters((current) => ({ ...current, lowCompetition: !current.lowCompetition }))} />
              <ToggleCard label="Hợp video ngắn" value={multiFilters.shortVideoFit} onClick={() => setMultiFilters((current) => ({ ...current, shortVideoFit: !current.shortVideoFit }))} />
              <ToggleCard label="Hợp video dài" value={multiFilters.longVideoFit} onClick={() => setMultiFilters((current) => ({ ...current, longVideoFit: !current.longVideoFit }))} />
            </div>
            <div className="templates-grid">
              {pipelineTopics.filter(matchesMultiFilters).length ? pipelineTopics.filter(matchesMultiFilters).map((topic) => (
                <article className={topic.id === selectedMainTopicId ? 'template-card selected-card' : 'template-card'} key={topic.id}>
                  <span className="badge">{topic.bestPlatform}</span>
                  <h3>{topic.name}</h3>
                  <p>{topic.description}</p>
                  <div className="job-meta">
                    <span>Rank {topic.rankingScore}</span>
                    <span>Diversity {topic.sourceDiversityScore || 0}</span>
                    <span>Momentum {topic.momentumScore || 0}</span>
                  </div>
                  <div className="tag-list">
                    <span className="tag">Tier {topic.monetizationTier || 'N/A'}</span>
                    <span className="tag">RPM {topic.estimatedRPM || 'N/A'}</span>
                    <span className="tag">CPM {topic.estimatedCPM || 'N/A'}</span>
                  </div>
                  {topic.sourceBreakdown ? <div className="tag-list">{Object.entries(topic.sourceBreakdown).map(([source, count]) => <span className="tag" key={source}>{source}: {count}</span>)}</div> : null}
                  <button className="ghost-btn wide" onClick={() => generateSubtopics(topic.id)}>Tạo 20 chủ đề nhỏ</button>
                </article>
              )) : <div className="empty-state"><p>Chưa có chủ đề phù hợp với bộ tick hiện tại.</p></div>}
            </div>

            <div className="section-head top-gap"><div><span className="eyebrow">Hiện thêm option</span><h2>Viral mạnh + kiếm tiền cao</h2></div></div>
            <div className="templates-grid">
              {hybridPicks.filter(matchesMultiFilters).length ? hybridPicks.filter(matchesMultiFilters).map((topic) => (
                <article className="template-card selected-card" key={`hybrid-${topic.id}`}>
                  <span className="badge">{topic.bestPlatform}</span>
                  <h3>{topic.name}</h3>
                  <p>{topic.description}</p>
                  <div className="tag-list">
                    <span className="tag">Rank {topic.rankingScore}</span>
                    <span className="tag">Tier {topic.monetizationTier || 'N/A'}</span>
                    <span className="tag">RPM {topic.estimatedRPM || 'N/A'}</span>
                    <span className="tag">CPM {topic.estimatedCPM || 'N/A'}</span>
                  </div>
                  <button className="ghost-btn wide" onClick={() => generateSubtopics(topic.id)}>Tạo 20 chủ đề nhỏ</button>
                </article>
              )) : <div className="empty-state"><p>Chưa có nhóm đề xuất kép phù hợp với bộ tick hiện tại.</p></div>}
            </div>

            <div className="section-head top-gap"><div><span className="eyebrow">Xếp hạng riêng</span><h2>Theo từng nền tảng</h2></div></div>
            <div className="action-row monetization-filters">
              {(['all', 'high', 'medium', 'low'] as const).map((filter) => (
                <button key={filter} className={monetizationFilter === filter ? 'tab-btn active' : 'tab-btn'} onClick={() => setMonetizationFilter(filter)}>
                  {filter === 'all' ? 'Tất cả' : filter === 'high' ? 'Kiếm tiền cao' : filter === 'medium' ? 'Kiếm tiền vừa' : 'Kiếm tiền thấp'}
                </button>
              ))}
            </div>
            <div className="pipeline-grid">
              {(['youtube', 'facebook', 'tiktok'] as const).map((platform) => (
                <div className="result-block" key={platform}>
                  <div className="result-head"><span>{platform.toUpperCase()}</span></div>
                  <div className="stack compact-stack">
                    {(platformRankings[platform] || []).filter((topic) => monetizationFilter === 'all' ? true : topic.monetizationTier === monetizationFilter).filter(matchesMultiFilters).slice(0, 5).map((topic) => (
                      <div className="job-card" key={`${platform}-${topic.id}`}>
                        <div><span className="badge">Rank {topic.rankingScore}</span><h3>{topic.name}</h3></div>
                        <div className="job-meta"><span>{topic.description}</span><span>Tier {topic.monetizationTier}</span></div>
                        <div className="tag-list">
                          <span className="tag">RPM {topic.estimatedRPM || 'N/A'}</span>
                          <span className="tag">CPM {topic.estimatedCPM || 'N/A'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="section-head top-gap"><div><span className="eyebrow">20 subtopics</span><h2>Chủ đề nhỏ</h2></div></div>
            <div className="stack">
              {pipelineSubtopics.length ? pipelineSubtopics.map((item) => (
                <button className={item.id === selectedSubtopicId ? 'history-card active' : 'history-card'} key={item.id} onClick={() => createPipelinePackage(item.id)}>
                  <div><span className="badge">{item.goal}</span><h3>{item.title}</h3></div>
                  <div className="job-meta"><span>{item.angle}</span><span>{item.formatType}</span><span>Score {item.score}</span></div>
                </button>
              )) : <div className="empty-state"><p>Chọn 1 chủ đề chính để tạo 20 chủ đề nhỏ.</p></div>}
            </div>

            <div className="section-head top-gap"><div><span className="eyebrow">Content package</span><h2>Song ngữ + prompt config</h2></div></div>
            {pipelinePackage ? <div className="result-stack compact-preview">
              <ResultBlock title="Title VI" content={pipelinePackage.titleVi} onCopy={() => copyText(pipelinePackage.titleVi)} />
              <ResultBlock title="Title EN" content={pipelinePackage.titleEn} onCopy={() => copyText(pipelinePackage.titleEn)} />
              <ResultBlock title="Description VI" content={pipelinePackage.descriptionVi} onCopy={() => copyText(pipelinePackage.descriptionVi)} />
              <ResultBlock title="Description EN" content={pipelinePackage.descriptionEn} onCopy={() => copyText(pipelinePackage.descriptionEn)} />
              <ResultBlock title="Package status" content={pipelinePackage.status} onCopy={() => copyText(pipelinePackage.status)} />
              <ResultBlock title="Prompt / Voiceover chuẩn" content={`Prompt: English • Lời thoại: Vietnamese`} onCopy={() => copyText('Prompt: English | Voiceover: Vietnamese')} />
              <TagBlock title="Hashtag" items={pipelinePackage.hashtags} onCopy={() => copyText(pipelinePackage.hashtags.join(' '))} />
              <TagBlock title="SEO VI" items={pipelinePackage.seoVi} onCopy={() => copyText(pipelinePackage.seoVi.join(', '))} />
              <TagBlock title="SEO EN" items={pipelinePackage.seoEn} onCopy={() => copyText(pipelinePackage.seoEn.join(', '))} />
              <div className="result-block">
                <div className="result-head"><span>Character module</span></div>
                <div className="form-grid">
                  <Field label="Tên nhân vật" value={characterName} onChange={setCharacterName} />
                  <Field label="Reference image URL" value={characterImageUrl} onChange={setCharacterImageUrl} />
                  <Field label="Visual prompt nhân vật" value={characterPrompt} onChange={setCharacterPrompt} />
                  <SelectField label="Chọn nhân vật có sẵn" value={selectedCharacterId} onChange={setSelectedCharacterId} options={characterProfiles.map((item) => ({ value: item.id, label: item.name }))} />
                  <SelectField label="Giọng mặc định cho nhân vật" value={selectedCharacterVoiceId} onChange={setSelectedCharacterVoiceId} options={voiceProfiles.map((item) => ({ value: item.id, label: item.name }))} />
                </div>
                <div className="action-row">
                  <button className="ghost-btn wide" onClick={createCharacterProfile}>Tạo hồ sơ nhân vật</button>
                  <button className="primary-btn wide" onClick={attachCharacterToPackage}>Gắn nhân vật vào package</button>
                </div>
                <div className="stack compact-stack">{characterProfiles.map((item) => <article className="job-card" key={item.id}><div><span className="badge">Character</span><h3>{item.name}</h3></div><div className="job-meta"><span>{item.visualPrompt}</span>{item.referenceImageUrl ? <span>{item.referenceImageUrl}</span> : null}<span>voice: {voiceProfiles.find((voice) => voice.id === item.defaultVoiceProfileId)?.name || item.defaultVoiceProfileId || 'chưa gắn'}</span></div><div className="action-row"><button className="ghost-btn wide" onClick={() => attachVoiceToCharacter(item.id)}>Gắn giọng cho nhân vật này</button></div></article>)}</div>
              </div>
              <div className="result-block">
                <div className="result-head"><span>Voiceover VI module</span></div>
                <SelectField label="Chọn giọng nói" value={selectedVoiceId} onChange={setSelectedVoiceId} options={voiceProfiles.map((item) => ({ value: item.id, label: `${item.name} • ${item.gender} • ${item.ageGroup} • ${item.style}` }))} />
                <div className="action-row">
                  <button className="primary-btn wide" onClick={attachVoiceToPackage}>Gắn voice vào package</button>
                  <button className="ghost-btn wide" onClick={pollActiveVoiceJobs}>Poll voice jobs</button>
                </div>
                <div className="action-row">
                  <button className="ghost-btn wide" onClick={() => generateMissingVoices('runway-tts')}>Tạo voice thiếu</button>
                  <button className="ghost-btn wide" onClick={() => generateMissingVoices('mock-voice')}>Tạo voice thiếu mock</button>
                </div>
                <div className="retention-grid">
                  <ToggleCard label="Bật voiceover" value={pipelinePackage.voiceSettings?.enabled ?? true} onClick={() => updateVoiceSettings({ enabled: !(pipelinePackage.voiceSettings?.enabled ?? true) })} />
                  <ToggleCard label="Bật subtitle" value={pipelinePackage.voiceSettings?.subtitleEnabled ?? true} onClick={() => updateVoiceSettings({ subtitleEnabled: !(pipelinePackage.voiceSettings?.subtitleEnabled ?? true) })} />
                </div>
                <div className="form-grid">
                  <SelectField label="Kiểu đưa giọng vào" value={pipelinePackage.voiceSettings?.mode || 'voiceover'} onChange={(value) => updateVoiceSettings({ mode: value })} options={[{ value: 'voiceover', label: 'Voiceover rời' }, { value: 'narration', label: 'Narration' }, { value: 'dialogue', label: 'Hội thoại' }]} />
                  <SelectField label="Lip sync" value={pipelinePackage.voiceSettings?.lipSyncMode || 'off'} onChange={(value) => updateVoiceSettings({ lipSyncMode: value })} options={[{ value: 'off', label: 'Tắt' }, { value: 'light', label: 'Nhẹ' }, { value: 'strict', label: 'Chặt' }]} />
                  <SelectField label="Nhịp đọc" value={pipelinePackage.voiceSettings?.pacing || 'balanced'} onChange={(value) => updateVoiceSettings({ pacing: value })} options={[{ value: 'slow', label: 'Chậm' }, { value: 'balanced', label: 'Cân bằng' }, { value: 'fast', label: 'Nhanh' }]} />
                </div>
                <div className="stack compact-stack">{voiceProfiles.map((item) => <article className="job-card" key={item.id}><div><span className="badge">Voice</span><h3>{item.name}</h3></div><div className="job-meta"><span>{item.description}</span><span>{item.language}</span><span>speed {item.speed}</span><span>pitch {item.pitch}</span></div></article>)}</div>
                <div className="stack compact-stack">{voiceJobs.map((item) => <article className="job-card" key={item.id}><div><span className="badge">Voice job</span><h3>{item.scenePromptId.slice(0, 10)}</h3></div><div className="job-meta"><span>{item.status}</span><span>{item.outputAudioUrl || item.errorMessage || 'Đang chờ output audio'}</span></div><div className="action-row"><button className="ghost-btn wide" onClick={() => pollVoiceJob(item.id)}>Poll voice</button>{item.outputAudioUrl ? <a className="ghost-btn wide" href={item.outputAudioUrl} target="_blank" rel="noreferrer">Mở audio</a> : null}</div></article>)}</div>
              </div>
              <SelectField label="Video provider" value={selectedVideoProvider} onChange={setSelectedVideoProvider} options={videoProviders.map((provider) => ({ value: provider.id, label: `${provider.name} ${provider.strategy ? `• ${provider.strategy}` : ''} ${provider.ready ? '• ready' : '• needs key'}` }))} />
              <div className="provider-grid compact-grid">{videoProviders.map((provider) => <article className={provider.ready ? 'provider-card ready' : 'provider-card'} key={provider.id}><div><strong>{provider.name}</strong><span>{provider.mode}{provider.strategy ? ` • ${provider.strategy}` : ''}</span></div><p>{provider.note}</p></article>)}</div>
              <div className="action-row triple">
                <button className="primary-btn wide" onClick={generatePipelineScenes}>Tạo scene prompts</button>
                <button className="ghost-btn wide" onClick={renderPipelineScenes}>Render scenes</button>
                <button className="ghost-btn wide" onClick={stitchPipelineVideo}>Ghép final</button>
              </div>
              <div className="action-row">
                <button className="primary-btn wide" onClick={finalizeReadyPackage}>Finalize package</button>
              </div>
              <div className="action-row">
                <button className="primary-btn wide" onClick={renderNextScene}>Render scene kế tiếp</button>
                <button className="primary-btn wide" onClick={processNextScene}>Xử lý scene kế tiếp</button>
                <button className="ghost-btn wide" onClick={pollActiveRenderJobs}>Poll tất cả</button>
              </div>
              <div className="action-row">
                <button className="ghost-btn wide" onClick={() => renderMissingScenes(selectedVideoProvider === 'runway' ? 'runway' : selectedVideoProvider)}>Render scene thiếu</button>
                <button className="ghost-btn wide" onClick={approveReadyScenes}>Approve scene đủ điều kiện</button>
              </div>
              <div className="retention-grid">
                <ToggleCard label="Auto-chain Runway" value={autoChainRunway} onClick={() => setAutoChainRunway((current) => !current)} />
              </div>
            </div> : <div className="empty-state"><p>Chọn 1 chủ đề nhỏ để tạo content package.</p></div>}

            <div className="section-head top-gap"><div><span className="eyebrow">Scenes</span><h2>Phân cảnh</h2></div></div>
            {pipelineScenes.length ? <div className="provider-grid compact-grid">
              <article className="provider-card ready"><div><strong>{pipelineScenes.filter((scene) => getSceneReadyState(scene).hasVideo).length}/{pipelineScenes.length}</strong><span>scene có video</span></div></article>
              <article className="provider-card ready"><div><strong>{pipelineScenes.filter((scene) => getSceneReadyState(scene).hasVoice).length}/{pipelineScenes.length}</strong><span>scene có voice</span></div></article>
              <article className="provider-card ready"><div><strong>{pipelineScenes.filter((scene) => getSceneReadyState(scene).approved).length}/{pipelineScenes.length}</strong><span>scene đã approve</span></div></article>
              <article className="provider-card ready"><div><strong>{pipelineScenes.filter((scene) => getSceneReadyState(scene).ready).length}/{pipelineScenes.length}</strong><span>scene ready stitch</span></div></article>
            </div> : null}
            <div className="stack">
              {pipelineScenes.length ? pipelineScenes.map((scene) => {
                const sceneRender = pipelineRenderMap.get(scene.id);
                const voiceJob = voiceJobs.find((item) => item.scenePromptId === scene.id);
                const readyState = getSceneReadyState(scene);
                return <article className="job-card" key={scene.id}>
                  <div><span className="badge">Scene {scene.sceneNumber}</span><h3>{scene.onscreenTextVi}</h3></div>
                  <p>{scene.visualPrompt}</p>
                  <div className="job-meta"><span>{scene.goal}</span><span>{scene.durationSec}s</span><span>{scene.status}</span><span>v{scene.version}</span></div>
                  <div className="tag-list">
                    <span className={readyState.hasVideo ? 'tag' : 'tag muted'}>{readyState.hasVideo ? 'Video OK' : 'Thiếu video'}</span>
                    <span className={readyState.hasVoice ? 'tag' : 'tag muted'}>{readyState.hasVoice ? 'Voice OK' : 'Thiếu voice'}</span>
                    <span className={readyState.approved ? 'tag' : 'tag muted'}>{readyState.approved ? 'Approved' : 'Chưa approve'}</span>
                    <span className={readyState.ready ? 'tag' : 'tag muted'}>{readyState.ready ? 'Ready stitch' : 'Chưa ready'}</span>
                  </div>
                  {sceneRender?.outputVideoUrl ? <div className="result-stack compact-preview"><video className="scene-video" src={sceneRender.outputVideoUrl} controls playsInline preload="metadata" /></div> : null}
                  {voiceJob?.outputAudioUrl ? <div className="action-row"><a className="ghost-btn wide" href={voiceJob.outputAudioUrl} target="_blank" rel="noreferrer">Mở audio scene</a></div> : null}
                  <div className="action-row">
                    <button className="ghost-btn wide" onClick={() => copyText(scene.visualPrompt)}>Copy prompt</button>
                    <button className="ghost-btn wide" onClick={() => renderSingleScene(scene.id)}>Render scene</button>
                  </div>
                  <div className="action-row">
                    <button className="ghost-btn wide" onClick={() => generateSceneVoice(scene.id, 'runway-tts')}>Voice thật</button>
                    <button className="ghost-btn wide" onClick={() => generateSceneVoice(scene.id, 'mock-voice')}>Voice mock</button>
                    <button className="primary-btn wide" onClick={() => approveScene(scene.id)}>Approve</button>
                  </div>
                </article>;
              }) : <div className="empty-state"><p>Chưa có scene prompts.</p></div>}
            </div>

            <div className="pipeline-grid top-gap">
              <div className="card phone-frame inner-card">
                <div className="section-head"><div><span className="eyebrow">Render jobs</span><h2>Cảnh đã render</h2></div><button className="ghost-btn" onClick={pollActiveRenderJobs}>Poll tất cả</button></div>
                <div className="stack">
                  {pipelineRenders.length ? pipelineRenders.map((job) => <article className="job-card" key={job.id}><div><span className="badge">{job.status}</span><h3>{job.scenePromptId.slice(0, 10)}</h3></div><div className="job-meta"><span>{job.outputVideoUrl || job.errorMessage || 'Đang chờ output'}</span></div>{job.outputVideoUrl ? <div className="result-stack compact-preview"><video className="scene-video" src={job.outputVideoUrl} controls playsInline preload="metadata" /><a className="ghost-btn wide" href={job.outputVideoUrl} target="_blank" rel="noreferrer">Mở video</a></div> : null}<div className="action-row"><button className="ghost-btn wide" onClick={() => pollRenderJob(job.id)}>Poll trạng thái</button></div></article>) : <div className="empty-state"><p>Chưa có render job.</p></div>}
                </div>
              </div>

              <div className="card phone-frame inner-card">
                <div className="section-head"><div><span className="eyebrow">Final videos</span><h2>Video hoàn chỉnh</h2></div></div>
                <div className="stack">
                  {pipelineFinals.length ? pipelineFinals.map((video) => <article className="job-card" key={video.id}><div><span className="badge">{video.status}</span><h3>{video.id.slice(0, 10)}</h3></div><div className="job-meta"><span>{video.outputUrl}</span>{video.burnedSubtitleVideoUrl ? <span>{video.burnedSubtitleVideoUrl}</span> : null}{video.subtitleUrl ? <span>{video.subtitleUrl}</span> : null}{video.transcriptUrl ? <span>{video.transcriptUrl}</span> : null}{video.thumbnailUrl ? <span>{video.thumbnailUrl}</span> : null}{video.manifestUrl ? <span>{video.manifestUrl}</span> : null}{video.reportUrl ? <span>{video.reportUrl}</span> : null}{video.bundleUrl ? <span>{video.bundleUrl}</span> : null}{video.archiveUrl ? <span>{video.archiveUrl}</span> : null}</div>{video.thumbnailUrl ? <div className="result-stack compact-preview"><img className="scene-video" src={video.thumbnailUrl} alt="Final thumbnail" /></div> : null}<div className="action-row">{video.outputUrl ? <a className="ghost-btn wide" href={video.outputUrl} target="_blank" rel="noreferrer">Mở final</a> : null}{video.burnedSubtitleVideoUrl ? <a className="ghost-btn wide" href={video.burnedSubtitleVideoUrl} target="_blank" rel="noreferrer">Final burned</a> : null}{video.subtitleUrl ? <a className="ghost-btn wide" href={video.subtitleUrl} target="_blank" rel="noreferrer">Subtitle</a> : null}{video.transcriptUrl ? <a className="ghost-btn wide" href={video.transcriptUrl} target="_blank" rel="noreferrer">Transcript</a> : null}{video.thumbnailUrl ? <a className="ghost-btn wide" href={video.thumbnailUrl} target="_blank" rel="noreferrer">Thumbnail</a> : null}{video.manifestUrl ? <a className="ghost-btn wide" href={video.manifestUrl} target="_blank" rel="noreferrer">Manifest</a> : null}{video.reportUrl ? <a className="ghost-btn wide" href={video.reportUrl} target="_blank" rel="noreferrer">Report</a> : null}{video.bundleUrl ? <a className="ghost-btn wide" href={video.bundleUrl} target="_blank" rel="noreferrer">Bundle</a> : null}{video.archiveUrl ? <a className="ghost-btn wide" href={video.archiveUrl} target="_blank" rel="noreferrer">Archive</a> : null}</div></article>) : <div className="empty-state"><p>Chưa có final video.</p></div>}
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {tab === 'library' ? (
        <section className="section-grid main-stage">
          <div className="card phone-frame">
            <div className="section-head"><div><span className="eyebrow">3. Kết quả</span><h2>Nội dung sẵn dùng</h2></div></div>
            {activeAsset ? <div className="result-stack">
              <div className="share-bar">
                <button className="primary-btn" onClick={shareActiveAsset}>Chia sẻ nội dung</button>
                {shareNote ? <p className="billing-note">{shareNote}</p> : null}
              </div>
              <ResultBlock title="Headline" content={activeAsset.content.headline} onCopy={() => copyText(activeAsset.content.headline)} />
              <ResultBlock title="Caption ngắn" content={activeAsset.content.captionShort} onCopy={() => copyText(activeAsset.content.captionShort)} />
              <ResultBlock title="Caption dài" content={activeAsset.content.captionLong} onCopy={() => copyText(activeAsset.content.captionLong)} />
              <TagBlock title="Hashtag" items={activeAsset.content.hashtags} onCopy={() => copyText(activeAsset.content.hashtags.join(' '))} />
              <TagBlock title="Ý chính cần nhấn" items={activeAsset.content.callouts} onCopy={() => copyText(activeAsset.content.callouts.join('\n'))} />
              <ResultBlock title="Prompt ảnh bài đăng" content={activeAsset.content.imagePrompt} onCopy={() => copyText(activeAsset.content.imagePrompt)} />
            </div> : <div className="empty-state"><p>Chưa có nội dung nào. Boss quay lại tab Tạo để sinh bản đầu tiên.</p></div>}
          </div>
          <div className="sidebar-stack">
            <div className="card phone-frame"><div className="section-head"><div><span className="eyebrow">4. Thư viện</span><h2>Bài đã tạo</h2></div></div><div className="stack">{assets.map((asset) => <button className={asset.id === activeAsset?.id ? 'history-card active' : 'history-card'} key={asset.id} onClick={() => setActiveAssetId(asset.id)}><div><span className="badge">{asset.platform}</span><h3>{asset.title}</h3></div><div className="job-meta"><span>{asset.objective}</span><span>{asset.updatedAt}</span><span>{asset.source}</span></div></button>)}</div></div>
            <div className="card phone-frame"><div className="section-head"><div><span className="eyebrow">5. Jobs</span><h2>Hàng chờ gần đây</h2></div></div><div className="stack">{jobs.map((job) => <article className="job-card" key={job.id}><div><span className="badge">{job.platform}</span><h3>{job.title}</h3></div><div className="job-meta"><span>{job.status}</span><span>{job.createdAt}</span><span>{job.provider}</span></div></article>)}</div></div>
          </div>
        </section>
      ) : null}

      {tab === 'settings' ? (
        <section className="section-grid single-pane">
          <div className="card phone-frame">
            <div className="section-head"><div><span className="eyebrow">6. Tài khoản và doanh thu</span><h2>Thiết lập thương mại</h2></div><button className="ghost-btn" onClick={logout}>Đăng xuất</button></div>
            <div className="paywall-hero">
              <div>
                <span className="eyebrow">Recommended</span>
                <h2>Nâng lên Pro để mở lịch 30 ngày và quy trình thương mại đầy đủ</h2>
                <p>Pro phù hợp nếu Boss muốn dùng app thật để bán đều mỗi ngày, không phải tạo từng bài lẻ.</p>
                <p className="micro-copy">Billing mode: {billing?.provider || 'mock'} {billing?.canUseRealPayments ? '• ready for real payments' : '• mock checkout'}</p>
              </div>
              <div className="paywall-actions">
                <button className="primary-btn" onClick={() => openCheckout('pro')}>Checkout Pro</button>
                <button className="ghost-btn" onClick={openBillingPortal}>Billing Portal</button>
              </div>
            </div>
            <div className="result-stack">
              <ResultBlock title="Tài khoản" content={`${user?.name || 'Unknown'} • ${user?.email || ''}`} onCopy={() => copyText(`${user?.name || ''} ${user?.email || ''}`)} />
              <ResultBlock title="Gói hiện tại" content={`${subscription.planId.toUpperCase()} • ${subscription.status} • gia hạn ${new Date(subscription.renewsAt).toLocaleDateString('vi-VN')}`} onCopy={() => copyText(subscription.planId)} />
            </div>
            {billingNote ? <p className="billing-note">{billingNote}</p> : null}
            <div className="plans-grid">{plans.map((plan) => <article className={plan.id === subscription.planId ? 'plan-card active' : 'plan-card'} key={plan.id}><div><span className="badge">{plan.name}</span><h3>{plan.priceLabel}</h3></div><ul>{plan.features.map((feature) => <li key={feature}>{feature}</li>)}</ul><div className="plan-actions"><button className={plan.id === subscription.planId ? 'ghost-btn wide' : 'primary-btn wide'} onClick={() => choosePlan(plan.id)}>{plan.id === subscription.planId ? 'Đang dùng' : 'Chọn gói này'}</button>{plan.id !== 'free' ? <button className="ghost-btn wide" onClick={() => openCheckout(plan.id)}>Thanh toán</button> : null}</div></article>)}</div>
            <div className="analytics-grid">
              <div className="metric"><strong>{analytics.totalGenerations}</strong><span>Tổng lượt tạo</span></div>
              <div className="metric"><strong>{analytics.weeklyGenerations}</strong><span>Lượt tạo 7 ngày</span></div>
              <div className="metric"><strong>{analytics.totalCopies}</strong><span>Lượt copy</span></div>
              <div className="metric"><strong>{analytics.topPlatform || 'N/A'}</strong><span>Kênh mạnh nhất</span></div>
            </div>
            <div className="retention-panel">
              <div className="section-head"><div><span className="eyebrow">Retention Center</span><h2>Giữ người dùng quay lại</h2></div></div>
              <div className="retention-grid">
                <ToggleCard label="Nhắc buổi sáng" value={retention.morningReminder} onClick={() => saveRetention({ ...retention, morningReminder: !retention.morningReminder })} />
                <ToggleCard label="Nhắc buổi tối" value={retention.eveningReminder} onClick={() => saveRetention({ ...retention, eveningReminder: !retention.eveningReminder })} />
                <ToggleCard label="Broadcast ưu đãi" value={retention.promoBroadcast} onClick={() => saveRetention({ ...retention, promoBroadcast: !retention.promoBroadcast })} />
                <div className="result-block">
                  <div className="result-head"><span>Win-back sau</span></div>
                  <select value={retention.winbackDays} onChange={(event) => saveRetention({ ...retention, winbackDays: Number(event.target.value) as 3 | 7 | 14 })}>
                    <option value={3}>3 ngày</option>
                    <option value={7}>7 ngày</option>
                    <option value={14}>14 ngày</option>
                  </select>
                </div>
              </div>
              <TagBlock title="Luồng gợi ý" items={[
                'Nhắc tạo bài mới vào buổi sáng',
                'Gửi ưu đãi khi user im lặng vài ngày',
                'Nhắc dùng template ngành vào buổi tối',
                'Upsell Pro khi cần lịch 30 ngày',
              ]} onCopy={() => copyText('Nhắc tạo bài mới vào buổi sáng\nGửi ưu đãi khi user im lặng vài ngày\nNhắc dùng template ngành vào buổi tối\nUpsell Pro khi cần lịch 30 ngày')} />
              {retentionMessages ? <div className="result-stack compact-preview">
                <ResultBlock title="Preview nhắc sáng" content={retentionMessages.morning} onCopy={() => copyText(retentionMessages.morning)} />
                <ResultBlock title="Preview nhắc tối" content={retentionMessages.evening} onCopy={() => copyText(retentionMessages.evening)} />
                <ResultBlock title="Preview win-back" content={retentionMessages.winback} onCopy={() => copyText(retentionMessages.winback)} />
              </div> : null}
              <div className="notification-box multi-actions">
                <button className="primary-btn" onClick={sendTestNotification}>Gửi test notification</button>
                <button className="ghost-btn" onClick={syncRetentionNotifications}>Sync retention notifications</button>
                {notificationNote ? <p className="billing-note">{notificationNote}</p> : null}
              </div>
            </div>

            <div className="result-stack">
              <ResultBlock title="Bước kế tiếp cho Android" content="Dùng npm run android:sync rồi mở Android Studio để build APK/AAB. Sau đó thêm thanh toán thật và crash reporting." onCopy={() => copyText('npm run android:sync && npm run android:open')} />
              <TagBlock title="Checklist thương mại còn tiếp tục" items={['Thanh toán thật', 'Push notification native', 'Retention automation', 'Template theo ngành sâu hơn', 'Bộ 30 ngày nội dung', 'Bản iPhone sau Android']} onCopy={() => copyText('Thanh toán thật\nPush notification native\nRetention automation\nTemplate theo ngành sâu hơn\nBộ 30 ngày nội dung\nBản iPhone sau Android')} />
              <ResultBlock title="Support" content="support@viralvideo.local" onCopy={() => copyText('support@viralvideo.local')} />
              <ResultBlock title="Privacy Policy" content="Xem file PRIVACY_POLICY.md trong workspace để đưa lên hosting hoặc landing page trước khi publish Android." onCopy={() => copyText('PRIVACY_POLICY.md')} />
              <ResultBlock title="Terms of Service" content="Xem file TERMS.md trong workspace để dùng cho billing, support và Play Store review." onCopy={() => copyText('TERMS.md')} />
              <ResultBlock title="Android release checklist" content="Đã tạo file ANDROID_RELEASE_CHECKLIST.md để chốt các bước trước khi build AAB và submit Play Store." onCopy={() => copyText('ANDROID_RELEASE_CHECKLIST.md')} />
              <div className="backup-panel">
                <div className="section-head"><div><span className="eyebrow">Backup</span><h2>Sao lưu Android</h2></div></div>
                <div className="backup-actions">
                  <button className="primary-btn" onClick={exportBackup}>Export backup</button>
                  <button className="ghost-btn" onClick={() => importInputRef.current?.click()}>Import backup</button>
                  <input ref={importInputRef} type="file" accept="application/json" className="hidden-input" onChange={(event) => importBackup(event.target.files?.[0] || null)} />
                </div>
                {backupNote ? <p className="billing-note">{backupNote}</p> : null}
              </div>
              <div className="backup-panel">
                <div className="section-head"><div><span className="eyebrow">Support</span><h2>Diagnostics & hỗ trợ</h2></div></div>
                <div className="support-meta">
                  <span>Version: {APP_VERSION}</span>
                  <span>Channel: {RELEASE_CHANNEL}</span>
                  <span>Platform: {diagnosticsSnapshot.platform}</span>
                </div>
                <div className="backup-actions">
                  <button className="primary-btn" onClick={copyDiagnostics}>Copy diagnostics</button>
                  <button className="ghost-btn" onClick={exportDiagnostics}>Export diagnostics</button>
                </div>
                <p className="helper-text">Dùng khi test trên máy Android thật hoặc gửi log nhanh cho support nội bộ.</p>
                {supportNote ? <p className="billing-note">{supportNote}</p> : null}
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

interface FieldProps { label: string; value: string; onChange: (value: string) => void; }
function Field({ label, value, onChange }: FieldProps) { return <label className="field"><span>{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} /></label>; }
interface SelectFieldProps { label: string; value: string; onChange: (value: string) => void; options: Array<{ value: string; label: string }>; }
function SelectField({ label, value, onChange, options }: SelectFieldProps) { return <label className="field"><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>; }
function ResultBlock({ title, content, onCopy }: { title: string; content: string; onCopy: () => void }) { return <div className="result-block"><div className="result-head"><span>{title}</span><button className="ghost-btn" onClick={onCopy}>Copy</button></div><p>{content}</p></div>; }
function TagBlock({ title, items, onCopy }: { title: string; items: string[]; onCopy: () => void }) { return <div className="result-block"><div className="result-head"><span>{title}</span><button className="ghost-btn" onClick={onCopy}>Copy</button></div><div className="tag-list">{items.map((item) => <span className="tag" key={item}>{item}</span>)}</div></div>; }
function ToggleCard({ label, value, onClick }: { label: string; value: boolean; onClick: () => void }) { return <button className={value ? 'toggle-card active' : 'toggle-card'} onClick={onClick}><strong>{label}</strong><span>{value ? 'Bật' : 'Tắt'}</span></button>; }

export default App;
