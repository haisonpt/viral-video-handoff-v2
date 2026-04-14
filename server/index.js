import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import RunwayML, { TaskFailedError } from '@runwayml/sdk';
import ffmpegPath from 'ffmpeg-static';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const dataDir = path.join(rootDir, 'server', 'data');
const dbPath = path.join(dataDir, 'db.json');
const runtimeDir = path.join(rootDir, 'server', 'runtime');

function loadLocalEnv() {
  const envPath = path.join(rootDir, '.env.local');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separatorIndex = line.indexOf('=');
    if (separatorIndex <= 0) continue;
    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    if (key && !(key in process.env)) process.env[key] = value;
  }
}

loadLocalEnv();

fs.mkdirSync(dataDir, { recursive: true });
fs.mkdirSync(runtimeDir, { recursive: true });

const app = express();
const port = 8787;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/runtime', express.static(runtimeDir));

function createDefaultDb() {
  return {
    users: [{ id: 'owner-01', email: 'boss@viralvideo.local', password: '123456', name: 'Boss Edgar Son' }],
    sessions: [],
    profile: {
      shopName: 'Luna Beauty',
      category: 'spa',
      audience: 'Nữ 23-35 tuổi, thích làm đẹp và chăm da định kỳ',
      sellingPoint: 'Liệu trình nhanh, phòng riêng sạch, tư vấn rõ ràng',
      tone: 'gan-gui',
      offer: 'Giảm 30% cho khách mới trong tuần này',
    },
    brief: {
      productName: 'Combo chăm da sáng khỏe 60 phút',
      productDetails: 'Làm sạch sâu, cấp ẩm, massage thư giãn và phục hồi da xỉn màu',
      targetAudience: 'Nhân viên văn phòng bận rộn, da mệt và thiếu sức sống',
      painPoint: 'Da xỉn màu, makeup không ăn, thiếu thời gian chăm sóc bài bản',
      objective: 'ban-hang',
      platform: 'Facebook',
      tone: 'gan-gui',
      callToAction: 'Comment INBOX để nhận lịch trống hôm nay',
      promo: 'Tặng soi da miễn phí và giảm 30% cho khách mới',
      provider: 'smart-copy',
    },
    jobs: [],
    assets: [],
    subscriptions: {
      'owner-01': {
        planId: 'starter',
        status: 'trial',
        monthlyPrice: 99000,
        generationLimit: 120,
        usedThisMonth: 8,
        renewsAt: '2026-05-12T00:00:00.000Z',
      },
    },
    analytics: [
      { id: 'evt-01', userId: 'owner-01', type: 'generate', platform: 'Facebook', createdAt: '2026-04-12T10:00:00.000Z' },
      { id: 'evt-02', userId: 'owner-01', type: 'copy', platform: 'Facebook', createdAt: '2026-04-12T10:10:00.000Z' },
      { id: 'evt-03', userId: 'owner-01', type: 'generate-week', platform: 'TikTok', createdAt: '2026-04-12T11:00:00.000Z' },
    ],
    retention: {
      'owner-01': {
        morningReminder: true,
        eveningReminder: false,
        winbackDays: 7,
        promoBroadcast: true
      }
    },
    viralPipeline: {
      scans: [],
      trendItems: [],
      mainTopics: [],
      platformRankings: { youtube: [], facebook: [], tiktok: [] },
      hybridPicks: [],
      characterProfiles: [
        {
          id: 'char-default-01',
          name: 'Narrator Base',
          visualPrompt: 'consistent cinematic narrator, expressive face, natural proportions, clean wardrobe, detailed eyes, same identity across all scenes',
          referenceImageUrl: '',
          defaultVoiceProfileId: 'voice-male-warm-deep',
          createdAt: new Date().toISOString(),
        },
      ],
      voiceProfiles: [
        {
          id: 'voice-male-warm-deep',
          name: 'Nam ấm trầm',
          gender: 'male',
          ageGroup: 'adult',
          style: 'warm-deep',
          language: 'vi',
          speed: 0.96,
          pitch: -1,
          description: 'Giọng nam trưởng thành, ấm, chậm vừa, hợp video triết lý và chuyên gia.',
          runwayPresetId: 'Benjamin',
        },
        {
          id: 'voice-female-soft-young',
          name: 'Nữ trẻ nhẹ',
          gender: 'female',
          ageGroup: 'young-adult',
          style: 'soft-bright',
          language: 'vi',
          speed: 1.02,
          pitch: 1,
          description: 'Giọng nữ trẻ, nhẹ, sáng, hợp lifestyle và healing.',
          runwayPresetId: 'Rachel',
        },
        {
          id: 'voice-male-story-senior',
          name: 'Nam trung niên kể chuyện',
          gender: 'male',
          ageGroup: 'senior',
          style: 'storyteller',
          language: 'vi',
          speed: 0.92,
          pitch: -2,
          description: 'Giọng kể chuyện chậm, dày, hợp documentary và bài học cuộc sống.',
          runwayPresetId: 'Tom',
        },
        {
          id: 'voice-female-emotional',
          name: 'Nữ cảm xúc',
          gender: 'female',
          ageGroup: 'adult',
          style: 'emotional',
          language: 'vi',
          speed: 0.98,
          pitch: 0,
          description: 'Giọng nữ giàu cảm xúc, hợp chữa lành và nội dung tâm lý.',
          runwayPresetId: 'Maya',
        },
        {
          id: 'voice-child-bright',
          name: 'Trẻ em sáng',
          gender: 'neutral',
          ageGroup: 'child',
          style: 'bright-childlike',
          language: 'vi',
          speed: 1.05,
          pitch: 2,
          description: 'Giọng trẻ em sáng, chỉ nên dùng cho nội dung phù hợp và an toàn.',
          runwayPresetId: 'Pip',
        },
      ],
      voiceJobs: [],
      subtopics: [],
      contentPackages: [],
      scenePrompts: [],
      sceneRenders: [],
      finalVideos: [],
    },
  };
}

function normalizeDbShape(db) {
  const fresh = createDefaultDb();
  if (!db?.profile?.shopName || !db?.brief?.productName) return fresh;
  return {
    ...fresh,
    ...db,
    subscriptions: { ...fresh.subscriptions, ...(db.subscriptions || {}) },
    analytics: Array.isArray(db.analytics) ? db.analytics : fresh.analytics,
    retention: { ...fresh.retention, ...(db.retention || {}) },
    viralPipeline: {
      ...fresh.viralPipeline,
      ...(db.viralPipeline || {}),
      scans: Array.isArray(db.viralPipeline?.scans) ? db.viralPipeline.scans : fresh.viralPipeline.scans,
      trendItems: Array.isArray(db.viralPipeline?.trendItems) ? db.viralPipeline.trendItems : fresh.viralPipeline.trendItems,
      mainTopics: Array.isArray(db.viralPipeline?.mainTopics) ? db.viralPipeline.mainTopics : fresh.viralPipeline.mainTopics,
      platformRankings: db.viralPipeline?.platformRankings || fresh.viralPipeline.platformRankings,
      hybridPicks: Array.isArray(db.viralPipeline?.hybridPicks) ? db.viralPipeline.hybridPicks : fresh.viralPipeline.hybridPicks,
      characterProfiles: Array.isArray(db.viralPipeline?.characterProfiles) ? db.viralPipeline.characterProfiles : fresh.viralPipeline.characterProfiles,
      voiceProfiles: Array.isArray(db.viralPipeline?.voiceProfiles) ? db.viralPipeline.voiceProfiles : fresh.viralPipeline.voiceProfiles,
      voiceJobs: Array.isArray(db.viralPipeline?.voiceJobs) ? db.viralPipeline.voiceJobs : fresh.viralPipeline.voiceJobs,
      subtopics: Array.isArray(db.viralPipeline?.subtopics) ? db.viralPipeline.subtopics : fresh.viralPipeline.subtopics,
      contentPackages: Array.isArray(db.viralPipeline?.contentPackages) ? db.viralPipeline.contentPackages : fresh.viralPipeline.contentPackages,
      scenePrompts: Array.isArray(db.viralPipeline?.scenePrompts) ? db.viralPipeline.scenePrompts : fresh.viralPipeline.scenePrompts,
      sceneRenders: Array.isArray(db.viralPipeline?.sceneRenders) ? db.viralPipeline.sceneRenders : fresh.viralPipeline.sceneRenders,
      finalVideos: Array.isArray(db.viralPipeline?.finalVideos) ? db.viralPipeline.finalVideos : fresh.viralPipeline.finalVideos,
    },
  };
}

function readDb() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify(createDefaultDb(), null, 2));
  }
  const parsed = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const normalized = normalizeDbShape(parsed);
  if (JSON.stringify(parsed) !== JSON.stringify(normalized)) {
    fs.writeFileSync(dbPath, JSON.stringify(normalized, null, 2));
  }
  return normalized;
}

function writeDb(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

function token() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function getProviders() {
  return [
    { id: 'smart-copy', name: 'Smart Copy Engine', kind: 'copywriting', ready: true, note: 'Prompt engine nội bộ cho caption bán hàng và hook.' },
    {
      id: 'openai',
      name: 'OpenAI content pipeline',
      kind: 'ai-text',
      ready: Boolean(process.env.OPENAI_API_KEY),
      note: process.env.OPENAI_API_KEY ? 'Sẵn sàng nâng cấp sang model thật.' : 'Chưa có OPENAI_API_KEY, đang dùng engine nội bộ.',
    },
  ];
}

function getVideoProviders() {
  return [
    {
      id: 'kling',
      name: 'Kling',
      ready: Boolean(process.env.KLING_API_KEY),
      mode: process.env.KLING_API_KEY ? 'api-ready' : 'needs-key',
      note: process.env.KLING_API_KEY ? 'Kling API key đã sẵn, có thể nối render thật.' : 'Thiếu KLING_API_KEY.',
      strategy: 'secondary',
    },
    {
      id: 'runway',
      name: 'Runway',
      ready: Boolean(process.env.RUNWAY_API_KEY),
      mode: process.env.RUNWAY_API_KEY ? 'api-ready' : 'needs-key',
      note: process.env.RUNWAY_API_KEY ? 'Runway API key đã sẵn, đây là provider chạy chính.' : 'Thiếu RUNWAY_API_KEY. Đây là provider chạy chính được ưu tiên.',
      strategy: 'primary',
    },
    {
      id: 'pika',
      name: 'Pika',
      ready: Boolean(process.env.PIKA_API_KEY),
      mode: process.env.PIKA_API_KEY ? 'api-ready' : 'needs-key',
      note: process.env.PIKA_API_KEY ? 'Pika API key đã sẵn, có thể nối render thật.' : 'Thiếu PIKA_API_KEY.',
      strategy: 'secondary',
    },
    {
      id: 'veo',
      name: 'VEO3',
      ready: Boolean(process.env.VEO_API_KEY),
      mode: process.env.VEO_API_KEY ? 'api-ready' : 'needs-key',
      note: process.env.VEO_API_KEY ? 'VEO3 API key đã sẵn, đây là provider premium.' : 'Thiếu VEO_API_KEY. Đây là provider premium dự phòng / chất lượng cao.',
      strategy: 'premium',
    },
    {
      id: 'mock-video',
      name: 'Mock video provider',
      ready: true,
      mode: 'mock',
      note: 'Provider giả lập để test flow hiện tại.',
      strategy: 'fallback',
    },
  ];
}

function getVideoProviderById(providerId) {
  return getVideoProviders().find((item) => item.id === providerId) || getVideoProviders().find((item) => item.id === 'mock-video');
}

function mapAspectRatioToRunway(aspectRatio) {
  return aspectRatio === '9:16' ? '720:1280' : '1280:720';
}

async function renderSceneWithRunway(scene, contentPackage) {
  const client = new RunwayML({ apiKey: process.env.RUNWAY_API_KEY });
  const ratio = mapAspectRatioToRunway(contentPackage?.aspectRatio);
  const duration = 5;

  try {
    const task = await client.textToVideo.create({
      model: 'gen4.5',
      promptText: scene.visualPrompt,
      ratio,
      duration,
    });

    return {
      id: token(),
      scenePromptId: scene.id,
      provider: 'runway',
      providerJobId: task.id || `runway_${scene.id}`,
      status: 'queued',
      errorMessage: null,
      outputVideoUrl: null,
      thumbnailUrl: null,
      durationSec: duration,
      version: scene.version,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      taskDetails: task,
    };
  } catch (error) {
    if (error instanceof TaskFailedError) {
      return {
        id: token(),
        scenePromptId: scene.id,
        provider: 'runway',
        providerJobId: `runway_failed_${scene.id}`,
        status: 'failed',
        errorMessage: JSON.stringify(error.taskDetails || { message: 'Runway task failed' }),
        outputVideoUrl: null,
        thumbnailUrl: null,
        durationSec: duration,
        version: scene.version,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    return {
      id: token(),
      scenePromptId: scene.id,
      provider: 'runway',
      providerJobId: `runway_error_${scene.id}`,
      status: 'failed',
      errorMessage: error instanceof Error ? error.message : 'Unknown Runway error',
      outputVideoUrl: null,
      thumbnailUrl: null,
      durationSec: duration,
      version: scene.version,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}

async function pollRunwayTask(providerJobId) {
  const client = new RunwayML({ apiKey: process.env.RUNWAY_API_KEY });
  const task = await client.tasks.retrieve(providerJobId);
  return task;
}

async function createRunwayVoiceJob(scene, voiceProfile) {
  const client = new RunwayML({ apiKey: process.env.RUNWAY_API_KEY });
  const task = await client.textToSpeech.create({
    model: 'eleven_multilingual_v2',
    promptText: scene.voiceoverVi,
    voice: {
      type: 'runway-preset',
      presetId: voiceProfile?.runwayPresetId || 'Benjamin',
    },
  });

  return {
    id: token(),
    scenePromptId: scene.id,
    provider: 'runway-tts',
    providerJobId: task.id,
    status: 'queued',
    errorMessage: null,
    outputAudioUrl: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    taskDetails: task,
  };
}

async function createMockVoiceJob(scene) {
  const dir = path.join(runtimeDir, 'mock-voices');
  fs.mkdirSync(dir, { recursive: true });
  const fileName = `${scene.id}.m4a`;
  const outPath = path.join(dir, fileName);
  await createPlaceholderAudio(outPath, scene.durationSec || 5);
  return {
    id: token(),
    scenePromptId: scene.id,
    provider: 'mock-voice',
    providerJobId: `mock_voice_${scene.id}`,
    status: 'done',
    errorMessage: null,
    outputAudioUrl: `/runtime/mock-voices/${fileName}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

async function refreshRenderJobStatus(db, renderJob) {
  const pipeline = getPipelineDb(db);
  if (!(renderJob.provider === 'runway' && renderJob.providerJobId && ['queued', 'rendering'].includes(renderJob.status))) {
    return renderJob;
  }

  try {
    const task = await pollRunwayTask(renderJob.providerJobId);
    renderJob.updatedAt = new Date().toISOString();

    if (task.status === 'SUCCEEDED') {
      renderJob.status = 'done';
      renderJob.outputVideoUrl = task.output?.[0] || null;
      renderJob.taskDetails = task;
    } else if (task.status === 'FAILED') {
      renderJob.status = 'failed';
      renderJob.errorMessage = task.failure || 'Runway task failed';
      renderJob.taskDetails = task;
    } else if (task.status === 'RUNNING') {
      renderJob.status = 'rendering';
      renderJob.taskDetails = task;
    } else {
      renderJob.status = 'queued';
      renderJob.taskDetails = task;
    }

    const scene = pipeline.scenePrompts.find((item) => item.id === renderJob.scenePromptId);
    if (scene) {
      scene.status = renderJob.status === 'done' ? 'done' : renderJob.status === 'failed' ? 'failed' : renderJob.status;
      scene.updatedAt = new Date().toISOString();

      const contentPackage = pipeline.contentPackages.find((item) => item.id === scene.contentPackageId);
      if (contentPackage) {
        const packageScenes = pipeline.scenePrompts.filter((item) => item.contentPackageId === contentPackage.id);
        if (packageScenes.length && packageScenes.every((item) => item.status === 'done' || item.status === 'approved')) {
          contentPackage.status = 'waiting-review';
        } else if (packageScenes.some((item) => item.status === 'failed')) {
          contentPackage.status = 'render-error';
        } else if (packageScenes.some((item) => ['queued', 'rendering'].includes(item.status))) {
          contentPackage.status = 'rendering';
        } else {
          contentPackage.status = 'draft';
        }
        contentPackage.updatedAt = new Date().toISOString();
      }
    }
  } catch (error) {
    renderJob.status = 'failed';
    renderJob.errorMessage = error instanceof Error ? error.message : 'Unknown polling error';
    renderJob.updatedAt = new Date().toISOString();
  }

  return renderJob;
}

function syncContentPackageStatus(db, contentPackageId) {
  const pipeline = getPipelineDb(db);
  const contentPackage = pipeline.contentPackages.find((item) => item.id === contentPackageId);
  if (!contentPackage || contentPackage.status === 'stitched') return contentPackage;

  const packageScenes = pipeline.scenePrompts.filter((item) => item.contentPackageId === contentPackage.id);
  const renderJobs = pipeline.sceneRenders.filter((job) => packageScenes.some((scene) => scene.id === job.scenePromptId));
  const voiceJobs = (pipeline.voiceJobs || []).filter((job) => packageScenes.some((scene) => scene.id === job.scenePromptId));

  const hasFailedRender = renderJobs.some((job) => job.status === 'failed');
  const hasActiveRender = renderJobs.some((job) => ['queued', 'rendering'].includes(job.status));
  const allHaveVideo = packageScenes.length > 0 && packageScenes.every((scene) => renderJobs.some((job) => job.scenePromptId === scene.id && job.outputVideoUrl));
  const voiceEnabled = Boolean(contentPackage.voiceSettings?.enabled);
  const hasFailedVoice = voiceEnabled && voiceJobs.some((job) => job.status === 'failed');
  const hasActiveVoice = voiceEnabled && voiceJobs.some((job) => ['queued', 'rendering'].includes(job.status));
  const allHaveVoice = !voiceEnabled || (packageScenes.length > 0 && packageScenes.every((scene) => voiceJobs.some((job) => job.scenePromptId === scene.id && job.outputAudioUrl)));
  const allApproved = packageScenes.length > 0 && packageScenes.every((scene) => scene.status === 'approved');

  if (hasFailedRender || hasFailedVoice) contentPackage.status = 'render-error';
  else if (hasActiveRender || hasActiveVoice) contentPackage.status = 'rendering';
  else if (allHaveVideo && allHaveVoice && allApproved) contentPackage.status = 'waiting-review';
  else if (allHaveVideo && allHaveVoice) contentPackage.status = 'rendered';
  else contentPackage.status = 'draft';

  contentPackage.updatedAt = new Date().toISOString();
  return contentPackage;
}

async function downloadFile(url, outPath) {
  if (url.startsWith('/runtime/')) {
    const sourcePath = path.join(runtimeDir, url.replace('/runtime/', ''));
    fs.copyFileSync(sourcePath, outPath);
    return;
  }
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Không tải được file từ ${url}`);
  const arrayBuffer = await response.arrayBuffer();
  fs.writeFileSync(outPath, Buffer.from(arrayBuffer));
}

function runFfmpegConcat(listFilePath, outPath) {
  return new Promise((resolve, reject) => {
    const child = spawn(ffmpegPath, ['-y', '-f', 'concat', '-safe', '0', '-i', listFilePath, '-c', 'copy', outPath], { stdio: ['ignore', 'pipe', 'pipe'] });
    let stderr = '';
    child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
    child.on('exit', (code) => {
      if (code === 0) resolve(outPath);
      else reject(new Error(stderr || `ffmpeg exited with code ${code}`));
    });
    child.on('error', reject);
  });
}

function runFfmpegAudioConcat(listFilePath, outPath) {
  return new Promise((resolve, reject) => {
    const child = spawn(ffmpegPath, ['-y', '-f', 'concat', '-safe', '0', '-i', listFilePath, '-c:a', 'aac', outPath], { stdio: ['ignore', 'pipe', 'pipe'] });
    let stderr = '';
    child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
    child.on('exit', (code) => {
      if (code === 0) resolve(outPath);
      else reject(new Error(stderr || `ffmpeg audio concat exited with code ${code}`));
    });
    child.on('error', reject);
  });
}

function runFfmpegMuxVideoAudio(videoPath, audioPath, outPath) {
  return new Promise((resolve, reject) => {
    const child = spawn(ffmpegPath, ['-y', '-i', videoPath, '-i', audioPath, '-c:v', 'copy', '-c:a', 'aac', '-shortest', outPath], { stdio: ['ignore', 'pipe', 'pipe'] });
    let stderr = '';
    child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
    child.on('exit', (code) => {
      if (code === 0) resolve(outPath);
      else reject(new Error(stderr || `ffmpeg mux exited with code ${code}`));
    });
    child.on('error', reject);
  });
}

function runFfmpegThumbnail(videoPath, outPath) {
  return new Promise((resolve, reject) => {
    const child = spawn(ffmpegPath, ['-y', '-i', videoPath, '-ss', '00:00:00.500', '-vframes', '1', outPath], { stdio: ['ignore', 'pipe', 'pipe'] });
    let stderr = '';
    child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
    child.on('exit', (code) => {
      if (code === 0) resolve(outPath);
      else reject(new Error(stderr || `ffmpeg thumbnail exited with code ${code}`));
    });
    child.on('error', reject);
  });
}

function runFfmpegBurnSubtitles(videoPath, subtitlePath, outPath) {
  return new Promise((resolve, reject) => {
    const subtitleFilter = `subtitles=${subtitlePath.replace(/\\/g, '/').replace(/:/g, '\\:')}`;
    const child = spawn(ffmpegPath, ['-y', '-i', videoPath, '-vf', subtitleFilter, '-c:a', 'copy', outPath], { stdio: ['ignore', 'pipe', 'pipe'] });
    let stderr = '';
    child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
    child.on('exit', (code) => {
      if (code === 0) resolve(outPath);
      else reject(new Error(stderr || `ffmpeg burn subtitles exited with code ${code}`));
    });
    child.on('error', reject);
  });
}

function runTarGzBundle(sourceDir, outPath) {
  return new Promise((resolve, reject) => {
    const child = spawn('tar', ['-czf', outPath, '-C', sourceDir, '.'], { stdio: ['ignore', 'pipe', 'pipe'] });
    let stderr = '';
    child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
    child.on('exit', (code) => {
      if (code === 0) resolve(outPath);
      else reject(new Error(stderr || `tar exited with code ${code}`));
    });
    child.on('error', reject);
  });
}

function formatSrtTime(totalSeconds) {
  const ms = Math.max(0, Math.floor(totalSeconds * 1000));
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const millis = ms % 1000;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')},${String(millis).padStart(3, '0')}`;
}

function buildTranscriptFromScenes(scenes) {
  return scenes.map((scene, index) => `${index + 1}. ${scene.voiceoverVi || scene.onscreenTextVi || ''}`).join('\n');
}

function buildSrtFromScenes(scenes) {
  let cursor = 0;
  return scenes.map((scene, index) => {
    const start = formatSrtTime(cursor);
    cursor += Number(scene.durationSec) || 0;
    const end = formatSrtTime(cursor);
    const text = scene.voiceoverVi || scene.onscreenTextVi || '';
    return `${index + 1}\n${start} --> ${end}\n${text}`;
  }).join('\n\n');
}

function buildFinalReport(contentPackage, orderedScenes, finalVideoId, finalOutputUrl) {
  return [
    `# Final Bundle ${finalVideoId}`,
    '',
    `- Title VI: ${contentPackage.titleVi || ''}`,
    `- Title EN: ${contentPackage.titleEn || ''}`,
    `- Character Profile: ${contentPackage.characterProfileId || 'N/A'}`,
    `- Voice Profile: ${contentPackage.voiceProfileId || 'N/A'}`,
    `- Output Video: ${finalOutputUrl}`,
    `- Subtitle: /runtime/${finalVideoId}/subtitles.srt`,
    `- Transcript: /runtime/${finalVideoId}/transcript.txt`,
    `- Thumbnail: /runtime/${finalVideoId}/thumbnail.jpg`,
    `- Manifest: /runtime/${finalVideoId}/manifest.json`,
    '',
    '## Scenes',
    '',
    ...orderedScenes.map((scene) => `- Scene ${scene.sceneNumber}: ${scene.onscreenTextVi || ''} (${scene.durationSec || 0}s)`),
    '',
  ].join('\n');
}

function buildFinalBundleHtml(contentPackage, orderedScenes, finalVideoId, finalOutputUrl) {
  const sceneItems = orderedScenes.map((scene) => `<li>Scene ${scene.sceneNumber}: ${scene.onscreenTextVi || ''} (${scene.durationSec || 0}s)</li>`).join('');
  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Final Bundle ${finalVideoId}</title>
  <style>
    body { font-family: Arial, sans-serif; background: #0f172a; color: #e2e8f0; padding: 24px; }
    a { color: #93c5fd; }
    .card { background: #111827; border: 1px solid #334155; border-radius: 16px; padding: 20px; margin-bottom: 16px; }
    video, img { max-width: 320px; border-radius: 12px; display: block; margin-top: 12px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${contentPackage.titleVi || ''}</h1>
    <p>${contentPackage.titleEn || ''}</p>
    <p>Character: ${contentPackage.characterProfileId || 'N/A'} | Voice: ${contentPackage.voiceProfileId || 'N/A'}</p>
  </div>
  <div class="card">
    <h2>Outputs</h2>
    <ul>
      <li><a href="${finalOutputUrl}">Final video</a></li>
      <li><a href="/runtime/${finalVideoId}/subtitles.srt">Subtitle</a></li>
      <li><a href="/runtime/${finalVideoId}/transcript.txt">Transcript</a></li>
      <li><a href="/runtime/${finalVideoId}/thumbnail.jpg">Thumbnail</a></li>
      <li><a href="/runtime/${finalVideoId}/manifest.json">Manifest</a></li>
      <li><a href="/runtime/${finalVideoId}/report.md">Report</a></li>
    </ul>
    <video controls src="${finalOutputUrl}"></video>
    <img src="/runtime/${finalVideoId}/thumbnail.jpg" alt="thumbnail" />
  </div>
  <div class="card">
    <h2>Scenes</h2>
    <ul>${sceneItems}</ul>
  </div>
</body>
</html>`;
}

function createPlaceholderVideo(outPath, durationSec = 5, aspectRatio = '9:16') {
  const size = aspectRatio === '9:16' ? '720x1280' : '1280x720';
  return new Promise((resolve, reject) => {
    const child = spawn(ffmpegPath, ['-y', '-f', 'lavfi', '-i', `color=c=black:s=${size}:d=${durationSec}`, '-pix_fmt', 'yuv420p', outPath], { stdio: ['ignore', 'pipe', 'pipe'] });
    let stderr = '';
    child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
    child.on('exit', (code) => {
      if (code === 0) resolve(outPath);
      else reject(new Error(stderr || `ffmpeg placeholder exited with code ${code}`));
    });
    child.on('error', reject);
  });
}

function createPlaceholderAudio(outPath, durationSec = 5) {
  return new Promise((resolve, reject) => {
    const child = spawn(ffmpegPath, ['-y', '-f', 'lavfi', '-i', `anullsrc=r=44100:cl=stereo`, '-t', String(durationSec), '-c:a', 'aac', outPath], { stdio: ['ignore', 'pipe', 'pipe'] });
    let stderr = '';
    child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
    child.on('exit', (code) => {
      if (code === 0) resolve(outPath);
      else reject(new Error(stderr || `ffmpeg placeholder audio exited with code ${code}`));
    });
    child.on('error', reject);
  });
}

function getPlans() {
  return [
    { id: 'free', name: 'Free', priceLabel: '0đ/tháng', monthlyPrice: 0, generationLimit: 15, features: ['15 lượt/tháng', '1 bài/lần', 'Lịch sử cơ bản'] },
    { id: 'starter', name: 'Starter', priceLabel: '99.000đ/tháng', monthlyPrice: 99000, generationLimit: 120, features: ['120 lượt/tháng', 'Lịch 7 ngày', 'Template ngành'] },
    { id: 'pro', name: 'Pro', priceLabel: '199.000đ/tháng', monthlyPrice: 199000, generationLimit: 500, features: ['500 lượt/tháng', 'Lịch 30 ngày', 'Ưu tiên AI thật', 'Analytics chi tiết'] },
  ];
}

function getTemplatePacks() {
  return [
    {
      id: 'tpl-spa-01',
      category: 'spa',
      title: 'Spa kéo inbox khách mới',
      description: 'Mẫu dành cho spa cần chốt lịch nhanh trên Facebook.',
      productName: 'Liệu trình chăm da chuyên sâu 60 phút',
      productDetails: 'Làm sạch, cấp ẩm, phục hồi da xỉn màu và thư giãn nhẹ',
      targetAudience: 'Nữ văn phòng 24-35 tuổi muốn da sáng nhanh',
      painPoint: 'Da xỉn màu, bí tắc, không có thời gian chăm kỹ',
      objective: 'keo-inbox',
      platform: 'Facebook',
      tone: 'gan-gui',
      callToAction: 'Comment INBOX để nhận khung giờ đẹp hôm nay',
      promo: 'Giảm 30% cho khách mới trong tuần',
    },
    {
      id: 'tpl-fashion-01',
      category: 'fashion',
      title: 'Ra mắt bộ sưu tập thời trang',
      description: 'Mẫu ra mắt sản phẩm mới cho TikTok hoặc Instagram.',
      productName: 'Bộ sưu tập váy hè mới',
      productDetails: 'Form tôn dáng, màu dễ mặc, ảnh lên hình nổi bật',
      targetAudience: 'Nữ trẻ thích outfit đi chơi và chụp ảnh',
      painPoint: 'Khó chọn outfit vừa xinh vừa dễ phối',
      objective: 'ra-mat',
      platform: 'TikTok',
      tone: 'vui-ve',
      callToAction: 'Inbox để nhận bảng size và giá ưu đãi',
      promo: 'Freeship toàn quốc 48h đầu',
    },
    {
      id: 'tpl-food-01',
      category: 'food',
      title: 'Đồ ăn chốt đơn buổi tối',
      description: 'Mẫu thúc đẩy đơn hàng nhanh cho quán ăn.',
      productName: 'Combo gà sốt cay giao tối',
      productDetails: 'Gà nóng giòn, sốt đậm vị, giao nhanh trong 30 phút',
      targetAudience: 'Nhân viên văn phòng và nhóm bạn đặt đồ ăn tối',
      painPoint: 'Tan làm mệt, không muốn nấu, cần món ngon giao nhanh',
      objective: 'ban-hang',
      platform: 'Zalo',
      tone: 'ban-hang-manh',
      callToAction: 'Nhắn ngay để chốt đơn giao tối nay',
      promo: 'Mua 2 combo tặng 1 nước',
    },
  ];
}

function getBillingConfig() {
  return {
    provider: process.env.STRIPE_SECRET_KEY ? 'stripe-ready' : 'mock',
    portalUrl: process.env.BILLING_PORTAL_URL || 'https://billing.viralvideo.local/portal',
    checkoutBaseUrl: process.env.BILLING_CHECKOUT_BASE_URL || 'https://billing.viralvideo.local/checkout',
    canUseRealPayments: Boolean(process.env.STRIPE_SECRET_KEY),
  };
}

function getViralStylePresets() {
  return [
    'aggressive-expert',
    'emotional-trauma',
    'healing-duo',
    'edu-root-3d-cartoon',
    'edu-root-3d-cgi-realistic',
    'edu-root-3d-pixar',
    'edu-root-realistic',
    'edu-root-realistic-cgi',
    'cartoon-3d',
    'cgi-3d-realistic',
    'pixar-3d',
    'anime-japan',
    'cctv-found-footage',
    'documentary',
    'epic-survival',
    'experimental-art-film',
    'live-action',
    'music-video-aesthetic',
    'noir',
    'pixel-art-8bit',
    'pov',
    'realistic',
    'realistic-cgi',
    'theatrical',
    'vintage-retro',
  ];
}

function getPipelineDb(db) {
  db.viralPipeline ||= { scans: [], trendItems: [], mainTopics: [], platformRankings: { youtube: [], facebook: [], tiktok: [] }, hybridPicks: [], characterProfiles: [], voiceProfiles: [], voiceJobs: [], subtopics: [], contentPackages: [], scenePrompts: [], sceneRenders: [], finalVideos: [] };
  return db.viralPipeline;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getSceneCount(durationTargetSec, sceneDurationSec = 8) {
  return clamp(Math.ceil(durationTargetSec / sceneDurationSec), 1, 75);
}

function mockTopicCatalog() {
  return [
    {
      name: 'Triết lý giáo dục tận gốc',
      description: 'Nội dung đi vào nguyên nhân gốc rễ của hành vi, giáo dục con cái và hậu quả dài hạn.',
      hashtags: ['#giaoduc', '#daycon', '#tamlytreem'],
      seoKeywords: ['triết lý giáo dục', 'dạy con đúng cách', 'gốc rễ hành vi trẻ'],
      bestPlatform: 'YouTube',
    },
    {
      name: 'Nỗi đau bị ngược đãi và chữa lành',
      description: 'Storytelling cảm xúc về tổn thương tâm lý, tự chữa lành và vượt qua quá khứ.',
      hashtags: ['#healing', '#trauma', '#selfworth'],
      seoKeywords: ['chữa lành cảm xúc', 'vượt qua tổn thương', 'emotional healing'],
      bestPlatform: 'TikTok',
    },
    {
      name: 'Sức khỏe cặp bài trùng',
      description: 'Format 2 nhân vật hoặc 2 góc nhìn để giải thích sức khỏe, ăn uống và hồi phục.',
      hashtags: ['#suckhoe', '#healingduo', '#wellness'],
      seoKeywords: ['mẹo sức khỏe', 'thói quen hồi phục', 'healing duo'],
      bestPlatform: 'Facebook',
    },
    {
      name: 'Drama quan hệ, hôn nhân và gia đình',
      description: 'Góc nhìn sắc bén về hành vi, xung đột và bài học trong tình yêu và gia đình.',
      hashtags: ['#honnhan', '#giadinh', '#relationship'],
      seoKeywords: ['bài học hôn nhân', 'tâm lý quan hệ', 'relationship lessons'],
      bestPlatform: 'TikTok',
    },
    {
      name: 'Survival facts và kỹ năng sinh tồn',
      description: 'Kiến thức thực tế, gây tò mò cao, dễ làm video ngắn triệu view.',
      hashtags: ['#survival', '#facts', '#kysinhton'],
      seoKeywords: ['kỹ năng sinh tồn', 'survival facts', 'mẹo sống còn'],
      bestPlatform: 'YouTube',
    },
  ];
}

function buildMainTopics(scanId) {
  return mockTopicCatalog().map((item, index) => ({
    id: token(),
    scanId,
    name: item.name,
    description: item.description,
    hashtags: item.hashtags,
    seoKeywords: item.seoKeywords,
    viralScore: 95 - index * 6,
    monetizationScore: 86 - index * 5,
    competitionScore: 46 + index * 6,
    rankingScore: 90 - index * 4,
    bestPlatform: item.bestPlatform,
    rationale: `Chủ đề này đang có lực kéo mạnh nhờ tỷ lệ giữ người xem cao và dễ phát triển thành series dài hơi.` ,
    createdAt: new Date().toISOString(),
  }));
}

function decodeHtmlEntities(input = '') {
  return input
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripHtml(input = '') {
  return decodeHtmlEntities(input.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
}

function parseGoogleTrendsRss(xml, scanId, country = 'VN') {
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((match) => match[1]);
  return items.map((raw, index) => {
    const title = decodeHtmlEntities(raw.match(/<title>([\s\S]*?)<\/title>/)?.[1] || `Google trend ${index + 1}`);
    const link = raw.match(/<link>([\s\S]*?)<\/link>/)?.[1] || '';
    const pubDate = raw.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || new Date().toUTCString();
    const approxTraffic = raw.match(/<ht:approx_traffic>([\s\S]*?)<\/ht:approx_traffic>/)?.[1] || '0';
    const picture = raw.match(/<ht:picture>([\s\S]*?)<\/ht:picture>/)?.[1] || '';
    const newsItems = [...raw.matchAll(/<ht:news_item_snippet>([\s\S]*?)<\/ht:news_item_snippet>/g)].map((snippet) => stripHtml(snippet[1]));
    const numericTraffic = Number(String(approxTraffic).replace(/[^\d]/g, '')) || 0;
    return {
      id: token(),
      scanId,
      source: 'google-trends',
      platform: 'google-trends',
      url: link,
      title,
      channelName: 'Google Trends',
      thumbnailUrl: picture,
      views: numericTraffic,
      likes: 0,
      comments: 0,
      shares: 0,
      publishedAt: new Date(pubDate).toISOString(),
      durationSec: 0,
      language: 'vi',
      region: country,
      transcript: newsItems.join(' '),
      topicCandidates: [],
      viralScore: clamp(60 + Math.round(Math.log10(Math.max(numericTraffic, 1)) * 10), 60, 98),
      monetizationScore: 65,
      competitionScore: 55,
      createdAt: new Date().toISOString(),
    };
  });
}

function parseRedditHot(payload, scanId) {
  const children = payload?.data?.children || [];
  return children.map((entry, index) => {
    const item = entry.data || {};
    return {
      id: token(),
      scanId,
      source: 'reddit-hot',
      platform: 'reddit',
      url: `https://www.reddit.com${item.permalink || ''}`,
      title: item.title || `Reddit hot ${index + 1}`,
      channelName: item.subreddit_name_prefixed || 'Reddit',
      thumbnailUrl: typeof item.thumbnail === 'string' && item.thumbnail.startsWith('http') ? item.thumbnail : '',
      views: Number(item.ups) || 0,
      likes: Number(item.score) || 0,
      comments: Number(item.num_comments) || 0,
      shares: 0,
      publishedAt: new Date((item.created_utc || Date.now() / 1000) * 1000).toISOString(),
      durationSec: 0,
      language: 'en',
      region: 'global',
      transcript: item.selftext || '',
      topicCandidates: [],
      viralScore: clamp(58 + Math.round(Math.log10(Math.max(Number(item.ups) || 1, 1)) * 11), 58, 95),
      monetizationScore: 55,
      competitionScore: 62,
      createdAt: new Date().toISOString(),
    };
  });
}

function extractYouTubeText(node) {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (typeof node.simpleText === 'string') return node.simpleText;
  if (Array.isArray(node.runs)) return node.runs.map((item) => item.text || '').join(' ').trim();
  return '';
}

function findVideoRenderers(node, bucket = []) {
  if (!node || typeof node !== 'object') return bucket;
  if (Array.isArray(node)) {
    node.forEach((item) => findVideoRenderers(item, bucket));
    return bucket;
  }
  if (node.videoRenderer) bucket.push(node.videoRenderer);
  for (const value of Object.values(node)) {
    findVideoRenderers(value, bucket);
  }
  return bucket;
}

function parseCompactNumber(text = '') {
  const normalized = text.toLowerCase().replace(/,/g, '').trim();
  const match = normalized.match(/([\d.]+)\s*([kmb])?/i);
  if (!match) return Number(normalized.replace(/[^\d]/g, '')) || 0;
  const value = Number(match[1]);
  const unit = match[2]?.toLowerCase();
  const factor = unit === 'k' ? 1_000 : unit === 'm' ? 1_000_000 : unit === 'b' ? 1_000_000_000 : 1;
  return Math.round(value * factor);
}

function parseYouTubeTrendingHtml(html, scanId) {
  const initialDataMatch = html.match(/var ytInitialData = (\{.*?\});<\/script>/s) || html.match(/window\["ytInitialData"\] = (\{.*?\});<\/script>/s);
  if (!initialDataMatch) return [];

  let payload;
  try {
    payload = JSON.parse(initialDataMatch[1]);
  } catch (_error) {
    return [];
  }

  const seen = new Set();
  const renderers = findVideoRenderers(payload, []);
  return renderers
    .map((video) => {
      const videoId = video.videoId;
      if (!videoId || seen.has(videoId)) return null;
      seen.add(videoId);
      const title = extractYouTubeText(video.title);
      const channelName = extractYouTubeText(video.ownerText) || extractYouTubeText(video.shortBylineText) || 'YouTube';
      const viewsText = extractYouTubeText(video.viewCountText) || extractYouTubeText(video.shortViewCountText);
      const publishedText = extractYouTubeText(video.publishedTimeText);
      const viewCount = parseCompactNumber(viewsText);
      return {
        id: token(),
        scanId,
        source: 'youtube-trending',
        platform: 'youtube',
        url: `https://www.youtube.com/watch?v=${videoId}`,
        title,
        channelName,
        thumbnailUrl: video.thumbnail?.thumbnails?.slice(-1)[0]?.url || '',
        views: viewCount,
        likes: 0,
        comments: 0,
        shares: 0,
        publishedAt: new Date().toISOString(),
        durationSec: 0,
        language: 'mixed',
        region: 'global',
        transcript: publishedText,
        topicCandidates: [],
        viralScore: clamp(68 + Math.round(Math.log10(Math.max(viewCount, 1)) * 10), 68, 99),
        monetizationScore: 72,
        competitionScore: 60,
        createdAt: new Date().toISOString(),
      };
    })
    .filter(Boolean)
    .slice(0, 30);
}

function parseYouTubeSearchHtml(html, scanId, seedQuery) {
  const initialDataMatch = html.match(/var ytInitialData = (\{.*?\});<\/script>/s) || html.match(/window\["ytInitialData"\] = (\{.*?\});<\/script>/s);
  if (!initialDataMatch) return [];

  let payload;
  try {
    payload = JSON.parse(initialDataMatch[1]);
  } catch (_error) {
    return [];
  }

  const seen = new Set();
  const renderers = findVideoRenderers(payload, []);
  return renderers
    .map((video) => {
      const videoId = video.videoId;
      if (!videoId || seen.has(videoId)) return null;
      seen.add(videoId);
      const title = extractYouTubeText(video.title);
      if (!title) return null;
      const channelName = extractYouTubeText(video.ownerText) || extractYouTubeText(video.longBylineText) || extractYouTubeText(video.shortBylineText) || 'YouTube';
      const viewsText = extractYouTubeText(video.viewCountText) || extractYouTubeText(video.shortViewCountText);
      const publishedText = extractYouTubeText(video.publishedTimeText);
      const viewCount = parseCompactNumber(viewsText);
      return {
        id: token(),
        scanId,
        source: 'youtube-search-trends',
        platform: 'youtube',
        url: `https://www.youtube.com/watch?v=${videoId}`,
        title,
        channelName,
        thumbnailUrl: video.thumbnail?.thumbnails?.slice(-1)[0]?.url || '',
        views: viewCount,
        likes: 0,
        comments: 0,
        shares: 0,
        publishedAt: new Date().toISOString(),
        durationSec: 0,
        language: 'mixed',
        region: 'global',
        transcript: `${publishedText} | seed: ${seedQuery}`,
        topicCandidates: [],
        viralScore: clamp(66 + Math.round(Math.log10(Math.max(viewCount, 1)) * 10), 66, 98),
        monetizationScore: 72,
        competitionScore: 58,
        createdAt: new Date().toISOString(),
      };
    })
    .filter(Boolean);
}

function parseDuckDuckGoTikTokResults(html, scanId, seedQuery) {
  const results = [...html.matchAll(/<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)];
  return results
    .map((match) => {
      const rawHref = decodeHtmlEntities(match[1]);
      const title = stripHtml(match[2]);
      const resolved = rawHref.startsWith('//') ? `https:${rawHref}` : rawHref;
      const decodedUrl = resolved.includes('uddg=') ? decodeURIComponent(resolved.split('uddg=')[1].split('&')[0]) : resolved;
      if (!decodedUrl.includes('tiktok.com') || decodedUrl === 'https://www.tiktok.com/') return null;
      const kind = decodedUrl.includes('/video/') ? 'video' : decodedUrl.includes('/tag/') ? 'tag' : decodedUrl.includes('/@') ? 'creator' : 'web';
      return {
        id: token(),
        scanId,
        source: 'tiktok-web-search',
        platform: 'tiktok',
        url: decodedUrl,
        title: title || `${seedQuery} TikTok ${kind}`,
        channelName: 'TikTok',
        thumbnailUrl: '',
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        publishedAt: new Date().toISOString(),
        durationSec: 0,
        language: 'mixed',
        region: 'global',
        transcript: `seed: ${seedQuery} | kind: ${kind}`,
        topicCandidates: [],
        viralScore: 70,
        monetizationScore: 68,
        competitionScore: 64,
        createdAt: new Date().toISOString(),
      };
    })
    .filter(Boolean)
    .slice(0, 5);
}

async function fetchTikTokTrendSeedResults(scanId, seedQueries = []) {
  const collected = [];
  for (const seed of seedQueries.slice(0, 5)) {
    try {
      const response = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(`${seed} tiktok`)}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 OpenClaw Viral Pipeline' },
      });
      if (!response.ok) continue;
      const html = await response.text();
      collected.push(...parseDuckDuckGoTikTokResults(html, scanId, seed));
    } catch (_error) {
      // Continue with other seeds.
    }
  }
  const seen = new Set();
  return collected.filter((item) => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });
}

function parseTikTokCreativeCenterHashtags(html, scanId, country = 'VN') {
  const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
  if (!nextDataMatch) return [];

  let payload;
  try {
    payload = JSON.parse(nextDataMatch[1]);
  } catch (_error) {
    return [];
  }

  const queries = payload?.props?.pageProps?.dehydratedState?.queries || [];
  const listQuery = queries.find((query) => Array.isArray(query?.queryKey) && query.queryKey[0] === 'trend' && query.queryKey[1] === 'hashtag' && query.queryKey[2] === 'list');
  const list = listQuery?.state?.data?.pages?.[0]?.list || [];
  return list.slice(0, 20).map((item) => ({
    id: token(),
    scanId,
    source: 'tiktok-creative-center',
    platform: 'tiktok',
    url: `https://www.tiktok.com/tag/${encodeURIComponent(item.hashtagName || '')}`,
    title: `#${item.hashtagName}`,
    channelName: 'TikTok Creative Center',
    thumbnailUrl: item.creators?.[0]?.avatarUrl || '',
    views: Number(item.videoViews) || 0,
    likes: 0,
    comments: 0,
    shares: 0,
    publishedAt: new Date().toISOString(),
    durationSec: 0,
    language: country === 'VN' ? 'vi' : 'mixed',
    region: country,
    transcript: `publish_count: ${item.publishCnt || 0} | rank: ${item.rank || 0}`,
    topicCandidates: [],
    viralScore: clamp(72 + Math.round(Math.log10(Math.max(Number(item.videoViews) || 1, 1)) * 8), 72, 99),
    monetizationScore: 67,
    competitionScore: 63,
    createdAt: new Date().toISOString(),
  }));
}

async function fetchYouTubeTrendSeedVideos(scanId, seedQueries = []) {
  const collected = [];
  for (const seed of seedQueries.slice(0, 5)) {
    try {
      const response = await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(seed)}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 OpenClaw Viral Pipeline', 'Accept-Language': 'en-US,en;q=0.9' },
      });
      if (!response.ok) continue;
      const html = await response.text();
      const items = parseYouTubeSearchHtml(html, scanId, seed).slice(0, 3);
      collected.push(...items);
    } catch (_error) {
      // Continue with other seeds.
    }
  }
  return collected;
}

const TOPIC_KEYWORDS = [
  { name: 'Triết lý giáo dục tận gốc', keywords: ['child', 'children', 'kid', 'kids', 'school', 'parent', 'parenting', 'giáo dục', 'dạy con', 'trẻ', 'cha mẹ'], hashtags: ['#giaoduc', '#daycon', '#parenting'], seoKeywords: ['triết lý giáo dục', 'dạy con đúng cách', 'parenting lessons'], bestPlatform: 'YouTube' },
  { name: 'Nỗi đau bị ngược đãi và chữa lành', keywords: ['trauma', 'healing', 'abuse', 'toxic', 'hurt', 'therapy', 'chữa lành', 'tổn thương'], hashtags: ['#healing', '#trauma', '#selfworth'], seoKeywords: ['chữa lành cảm xúc', 'emotional healing', 'healing journey'], bestPlatform: 'TikTok' },
  { name: 'Sức khỏe cặp bài trùng', keywords: ['health', 'healthy', 'fitness', 'doctor', 'body', 'sleep', 'food', 'sức khỏe', 'dinh dưỡng'], hashtags: ['#suckhoe', '#wellness', '#healingduo'], seoKeywords: ['mẹo sức khỏe', 'healing duo', 'wellness habits'], bestPlatform: 'Facebook' },
  { name: 'Drama quan hệ, hôn nhân và gia đình', keywords: ['relationship', 'wife', 'husband', 'family', 'marriage', 'love', 'chia tay', 'hôn nhân', 'gia đình'], hashtags: ['#relationship', '#honnhan', '#giadinh'], seoKeywords: ['relationship lessons', 'bài học hôn nhân', 'tâm lý quan hệ'], bestPlatform: 'TikTok' },
  { name: 'Survival facts và kỹ năng sinh tồn', keywords: ['survival', 'danger', 'forest', 'war', 'disaster', 'facts', 'sinh tồn', 'mẹo sống còn'], hashtags: ['#survival', '#facts', '#kysinhton'], seoKeywords: ['survival facts', 'kỹ năng sinh tồn', 'mẹo sống còn'], bestPlatform: 'YouTube' },
  { name: 'AI, công nghệ và tương lai', keywords: ['ai', 'robot', 'technology', 'tech', 'openai', 'chatgpt', 'công nghệ'], hashtags: ['#ai', '#technology', '#future'], seoKeywords: ['AI trends', 'công nghệ mới', 'future tech'], bestPlatform: 'YouTube' },
];

const SOURCE_WEIGHTS = {
  'google-trends': 1.0,
  'youtube-search-trends': 1.2,
  'youtube-trending': 1.25,
  'tiktok-creative-center': 1.25,
  'tiktok-web-search': 0.8,
  'reddit-hot': 0.7,
};

const PLATFORM_MONETIZATION_MAP = {
  youtube: {
    high: { rpm: '4-12 USD', cpm: '8-22 USD' },
    medium: { rpm: '1.5-4 USD', cpm: '3-8 USD' },
    low: { rpm: '0.2-1.5 USD', cpm: '0.5-3 USD' },
  },
  facebook: {
    high: { rpm: '2-8 USD', cpm: '5-16 USD' },
    medium: { rpm: '0.8-2 USD', cpm: '2-5 USD' },
    low: { rpm: '0.1-0.8 USD', cpm: '0.3-2 USD' },
  },
  tiktok: {
    high: { rpm: '0.8-3 USD', cpm: '2-8 USD' },
    medium: { rpm: '0.2-0.8 USD', cpm: '0.8-2 USD' },
    low: { rpm: '0.02-0.2 USD', cpm: '0.1-0.8 USD' },
  },
};

function estimateMonetizationProfile(topicName, platform) {
  const normalized = String(topicName || '').toLowerCase();
  let tier = 'medium';

  if (['ai', 'công nghệ', 'sức khỏe', 'tài chính', 'giáo dục', 'kinh doanh'].some((keyword) => normalized.includes(keyword))) {
    tier = 'high';
  } else if (['drama', 'healing', 'quan hệ', 'gia đình', 'survival'].some((keyword) => normalized.includes(keyword))) {
    tier = platform === 'youtube' ? 'medium' : 'low';
  }

  const pricing = PLATFORM_MONETIZATION_MAP[platform]?.[tier] || PLATFORM_MONETIZATION_MAP[platform]?.medium || { rpm: 'unknown', cpm: 'unknown' };
  return {
    monetizationTier: tier,
    estimatedRPM: pricing.rpm,
    estimatedCPM: pricing.cpm,
  };
}

function buildTopicsFromTrendItems(scanId, trendItems) {
  const buckets = new Map();

  for (const trendItem of trendItems) {
    const haystack = `${trendItem.title} ${trendItem.transcript}`.toLowerCase();
    const matched = TOPIC_KEYWORDS.find((topic) => topic.keywords.some((keyword) => haystack.includes(keyword)));
    const topic = matched || TOPIC_KEYWORDS[trendItems.indexOf(trendItem) % TOPIC_KEYWORDS.length];
    const current = buckets.get(topic.name) || {
      id: token(),
      scanId,
      name: topic.name,
      description: `Tổng hợp tự động từ dữ liệu trend thật, phù hợp để xây kênh theo series có khả năng viral.`,
      hashtags: topic.hashtags,
      seoKeywords: topic.seoKeywords,
      bestPlatform: topic.bestPlatform,
      totalViews: 0,
      totalItems: 0,
      totalViralScore: 0,
      totalMonetizationScore: 0,
      totalCompetitionScore: 0,
      weightedViralScore: 0,
      weightedMonetizationScore: 0,
      weightedCompetitionScore: 0,
      totalWeight: 0,
      sourceCounts: {},
    };

    const weight = SOURCE_WEIGHTS[trendItem.source] || 1;

    current.totalViews += trendItem.views || 0;
    current.totalItems += 1;
    current.totalViralScore += trendItem.viralScore || 0;
    current.totalMonetizationScore += trendItem.monetizationScore || 0;
    current.totalCompetitionScore += trendItem.competitionScore || 0;
    current.weightedViralScore += (trendItem.viralScore || 0) * weight;
    current.weightedMonetizationScore += (trendItem.monetizationScore || 0) * weight;
    current.weightedCompetitionScore += (trendItem.competitionScore || 0) * weight;
    current.totalWeight += weight;
    current.sourceCounts[trendItem.source] = (current.sourceCounts[trendItem.source] || 0) + 1;
    buckets.set(topic.name, current);
  }

  return [...buckets.values()]
    .map((item) => {
      const viralScore = Math.round(item.weightedViralScore / item.totalWeight);
      const monetizationScore = Math.round(item.weightedMonetizationScore / item.totalWeight);
      const competitionScore = Math.round(item.weightedCompetitionScore / item.totalWeight);
      const sourceDiversityScore = clamp(Object.keys(item.sourceCounts).length * 20, 20, 100);
      const sourceBalanceScore = clamp(Math.round(Object.values(item.sourceCounts).reduce((sum, count) => sum + Math.min(count, 3) * 8, 0)), 20, 100);
      const momentumScore = clamp(Math.round((viralScore * 0.55) + (sourceDiversityScore * 0.25) + (sourceBalanceScore * 0.2)), 30, 100);
      const rankingScore = Math.round((viralScore * 0.35) + (monetizationScore * 0.25) + ((100 - competitionScore) * 0.15) + (sourceDiversityScore * 0.15) + (momentumScore * 0.1));

      return {
        id: item.id,
        scanId: item.scanId,
        name: item.name,
        description: item.description,
        hashtags: item.hashtags,
        seoKeywords: item.seoKeywords,
        viralScore,
        monetizationScore,
        competitionScore,
        sourceDiversityScore,
        sourceBalanceScore,
        momentumScore,
        rankingScore,
        sourceBreakdown: item.sourceCounts,
        ...estimateMonetizationProfile(item.name, String(item.bestPlatform || 'youtube').toLowerCase()),
        bestPlatform: item.bestPlatform,
        rationale: `Dựa trên ${item.totalItems} tín hiệu trend thật từ ${Object.keys(item.sourceCounts).length} nguồn, chủ đề này có độ phủ và độ bền tốt hơn so với xếp hạng một nguồn đơn.` ,
        createdAt: new Date().toISOString(),
      };
    })
    .sort((a, b) => b.rankingScore - a.rankingScore);
}

function getPlatformSourceWeights(platform) {
  if (platform === 'youtube') {
    return {
      'youtube-search-trends': 1.5,
      'youtube-trending': 1.6,
      'google-trends': 0.8,
      'reddit-hot': 0.5,
      'tiktok-creative-center': 0.2,
      'tiktok-web-search': 0.1,
    };
  }
  if (platform === 'tiktok') {
    return {
      'tiktok-creative-center': 1.6,
      'tiktok-web-search': 1.1,
      'google-trends': 0.8,
      'youtube-search-trends': 0.35,
      'youtube-trending': 0.35,
      'reddit-hot': 0.25,
    };
  }
  return {
    'google-trends': 1.1,
    'reddit-hot': 0.9,
    'youtube-search-trends': 0.45,
    'youtube-trending': 0.45,
    'tiktok-creative-center': 0.3,
    'tiktok-web-search': 0.2,
  };
}

function buildPlatformRankings(scanId, trendItems) {
  const platforms = ['youtube', 'facebook', 'tiktok'];
  const rankings = {};

  for (const platform of platforms) {
    const sourceWeights = getPlatformSourceWeights(platform);
    const buckets = new Map();

    for (const trendItem of trendItems) {
      const haystack = `${trendItem.title} ${trendItem.transcript}`.toLowerCase();
      const matched = TOPIC_KEYWORDS.find((topic) => topic.keywords.some((keyword) => haystack.includes(keyword)));
      const topic = matched || TOPIC_KEYWORDS[trendItems.indexOf(trendItem) % TOPIC_KEYWORDS.length];
      const weight = sourceWeights[trendItem.source] || 0;
      if (weight <= 0) continue;

      const current = buckets.get(topic.name) || {
        id: token(),
        scanId,
        name: topic.name,
        description: topic.name,
        hashtags: topic.hashtags,
        seoKeywords: topic.seoKeywords,
        scoreSum: 0,
        weightSum: 0,
        sources: {},
      };

      current.scoreSum += ((trendItem.viralScore || 0) * 0.55 + (trendItem.monetizationScore || 0) * 0.25 + ((100 - (trendItem.competitionScore || 0)) * 0.2)) * weight;
      current.weightSum += weight;
      current.sources[trendItem.source] = (current.sources[trendItem.source] || 0) + 1;
      buckets.set(topic.name, current);
    }

    rankings[platform] = [...buckets.values()]
      .map((item) => ({
        id: item.id,
        scanId: item.scanId,
        name: item.name,
        description: `Xếp hạng dành riêng cho ${platform}.`,
        hashtags: item.hashtags,
        seoKeywords: item.seoKeywords,
        rankingScore: Math.round(item.scoreSum / Math.max(item.weightSum, 1)),
        sourceBreakdown: item.sources,
        platform,
        ...estimateMonetizationProfile(item.name, platform),
      }))
      .sort((a, b) => b.rankingScore - a.rankingScore)
      .slice(0, 10);
  }

  return rankings;
}

function buildHighViralHighMonetizationTopics(mainTopics = []) {
  return mainTopics
    .filter((topic) => (topic.rankingScore || 0) >= 75 && topic.monetizationTier === 'high')
    .sort((a, b) => ((b.momentumScore || 0) + (b.rankingScore || 0)) - ((a.momentumScore || 0) + (a.rankingScore || 0)))
    .slice(0, 8);
}

function buildSeedQueriesFromTrendItems(trendItems = []) {
  const seeds = new Set();
  for (const item of trendItems.slice(0, 10)) {
    const title = String(item.title || '').trim();
    if (!title) continue;
    seeds.add(title);
    const compact = title.split(/[|:,-]/)[0].trim();
    if (compact && compact !== title) seeds.add(compact);
    const firstWords = title.split(/\s+/).slice(0, 2).join(' ').trim();
    if (firstWords) seeds.add(firstWords);
  }
  return [...seeds].slice(0, 10);
}

async function fetchRealTrendItems(scanId, country = 'VN') {
  const results = [];
  let googleTrendItems = [];

  try {
    const locale = country === 'VN' ? 'vi' : 'en';
    const tiktokResponse = await fetch(`https://ads.tiktok.com/business/creativecenter/inspiration/popular/hashtag/pc/${locale}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 OpenClaw Viral Pipeline', 'Accept-Language': locale === 'vi' ? 'vi-VN,vi;q=0.9,en;q=0.8' : 'en-US,en;q=0.9' },
    });
    if (tiktokResponse.ok) {
      const html = await tiktokResponse.text();
      results.push(...parseTikTokCreativeCenterHashtags(html, scanId, country));
    }
  } catch (_error) {
    // Ignore source-level failure so the scan can continue with other sources.
  }

  try {
    const trendsResponse = await fetch(`https://trends.google.com/trending/rss?geo=${encodeURIComponent(country)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 OpenClaw Viral Pipeline' },
    });
    if (trendsResponse.ok) {
      const xml = await trendsResponse.text();
      googleTrendItems = parseGoogleTrendsRss(xml, scanId, country);
      results.push(...googleTrendItems);
    }
  } catch (_error) {
    // Ignore source-level failure so the scan can continue with other sources.
  }

  const youtubeSeedQueries = buildSeedQueriesFromTrendItems(googleTrendItems);
  if (youtubeSeedQueries.length) {
    const youtubeItems = await fetchYouTubeTrendSeedVideos(scanId, youtubeSeedQueries);
    results.push(...youtubeItems);
  }

  const tiktokSeedItems = await fetchTikTokTrendSeedResults(scanId, youtubeSeedQueries);
  results.push(...tiktokSeedItems);

  try {
    const redditResponse = await fetch('https://www.reddit.com/r/popular/hot.json?limit=20', {
      headers: { 'User-Agent': 'Mozilla/5.0 OpenClaw Viral Pipeline' },
    });
    if (redditResponse.ok) {
      const payload = await redditResponse.json();
      results.push(...parseRedditHot(payload, scanId));
    }
  } catch (_error) {
    // Ignore source-level failure so the scan can continue with other sources.
  }

  return results;
}

function buildSubtopics(mainTopicId, mainTopicName, limit = 20) {
  const templates = [
    'Vì sao người tử tế lại thường bị xem nhẹ?',
    'Dấu hiệu một đứa trẻ đang phản kháng trong im lặng',
    '3 sai lầm khiến cha mẹ càng dạy càng xa con',
    'Điều người từng bị tổn thương không nói ra',
    'Tại sao càng cố giải thích, đối phương càng chống đối?',
    'Một thói quen nhỏ nhưng cứu cả cuộc đời sau này',
    'Sự thật đằng sau một hành vi ai cũng hiểu sai',
    'Cách nhận ra gốc rễ vấn đề chỉ trong 1 phút',
    'Vì sao nhiều người lặp lại nỗi đau từ gia đình cũ?',
    'Điều người thông minh cảm xúc luôn làm trước khi phản ứng',
    'Một câu nói có thể làm thay đổi quỹ đạo cuộc đời',
    'Lý do người càng bị ép càng lì hơn',
    'Phản ứng tưởng là hỗn nhưng thật ra là cầu cứu',
    'Khi im lặng không phải ngoan mà là bỏ cuộc',
    'Sai lầm phổ biến khiến người lớn nuôi dưỡng nỗi sợ',
    'Tại sao vết thương cũ lại điều khiển hiện tại?',
    'Một góc nhìn lật ngược hoàn toàn cách bạn đang nghĩ',
    'Bài học mà càng biết sớm càng đỡ trả giá',
    'Vì sao cùng một việc nhưng hai kết quả trái ngược?',
    'Cách biến một chủ đề đau thành video khiến ai cũng dừng lại',
  ];

  return templates.slice(0, limit).map((title, index) => ({
    id: token(),
    mainTopicId,
    title: `${title}`,
    angle: `${mainTopicName}, góc nhìn số ${index + 1}`,
    goal: index % 4 === 0 ? 'pull_views' : index % 4 === 1 ? 'pull_followers' : index % 4 === 2 ? 'pull_comments' : 'pull_conversion',
    formatType: index % 3 === 0 ? 'short' : 'both',
    score: 90 - index,
    createdAt: new Date().toISOString(),
  }));
}

function buildContentPackage(mainTopic, subtopic, config = {}) {
  const durationTargetSec = Number(config.durationTargetSec) || 60;
  const stylePreset = config.stylePreset || 'realistic-cgi';
  const aspectRatio = config.aspectRatio || '9:16';
  return {
    id: token(),
    subtopicId: subtopic.id,
    mainTopicId: mainTopic.id,
    titleVi: subtopic.title,
    titleEn: `Why this matters: ${subtopic.title}`,
    descriptionVi: `Video phân tích chủ đề "${subtopic.title}" theo hướng ${mainTopic.name}, tập trung vào hook mạnh, cảm xúc rõ và thông điệp dễ lan truyền.`,
    descriptionEn: `A viral-ready video package exploring "${subtopic.title}" through the lens of ${mainTopic.name}, with strong hooks, clear emotion and shareable insight.`,
    hashtags: [...mainTopic.hashtags, '#viralvideo', '#millionviews'],
    seoVi: [...mainTopic.seoKeywords, subtopic.title.toLowerCase()],
    seoEn: ['viral video idea', 'youtube shorts idea', 'tiktok story angle'],
    stylePreset,
    aspectRatio,
    durationTargetSec,
    languageMode: config.languageMode || 'bilingual',
    promptLanguage: 'en',
    voiceoverLanguage: 'vi',
    characterProfileId: config.characterProfileId || null,
    voiceProfileId: config.voiceProfileId || 'voice-male-warm-deep',
    voiceSettings: {
      enabled: true,
      mode: 'voiceover',
      subtitleEnabled: true,
      lipSyncMode: 'off',
      pacing: 'balanced',
    },
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function buildScenePrompts(contentPackage, subtopic, sceneDurationSec = 8, characterProfile = null, voiceProfile = null) {
  const sceneCount = getSceneCount(contentPackage.durationTargetSec, sceneDurationSec);
  return Array.from({ length: sceneCount }, (_, index) => ({
    id: token(),
    contentPackageId: contentPackage.id,
    sceneNumber: index + 1,
    durationSec: sceneDurationSec,
    goal: index === 0 ? 'hook' : index === sceneCount - 1 ? 'cta' : 'development',
    visualPrompt: `Create scene ${index + 1} for topic "${subtopic.title}" in style ${contentPackage.stylePreset}, aspect ratio ${contentPackage.aspectRatio}, emotionally engaging, cinematic details, high retention framing, no watermark.${characterProfile ? ` Maintain exact same character identity across the whole series: ${characterProfile.visualPrompt}.${characterProfile.referenceImageUrl ? ` Reference image: ${characterProfile.referenceImageUrl}.` : ''}` : ''}`,
    cameraPrompt: index === 0 ? 'fast push-in, immediate tension' : 'medium cinematic motion, subject-focused framing',
    motionPrompt: 'subtle subject movement, natural camera drift, social-video pacing',
    lightingPrompt: 'dramatic but clean contrast, premium lighting',
    characterPrompt: 'expressive human subject matching the emotional core of the scene',
    environmentPrompt: 'realistic environment supporting the emotional narrative',
    negativePrompt: 'blurry, watermark, low quality, text artifacts, deformed hands',
    voiceoverVi: index === 0 ? `Bạn có bao giờ tự hỏi: ${subtopic.title}` : `Phân cảnh ${index + 1} đào sâu thêm vào thông điệp chính của video.`,
    voiceoverEn: index === 0 ? `Have you ever wondered: ${subtopic.title}?` : `Scene ${index + 1} deepens the main message of the video.`,
    voiceDirection: voiceProfile ? `${voiceProfile.name}, ${voiceProfile.description}, speed ${voiceProfile.speed}, pitch ${voiceProfile.pitch}` : 'Vietnamese voiceover, neutral delivery',
    onscreenTextVi: index === 0 ? subtopic.title : `Ý chính ${index + 1}`,
    onscreenTextEn: index === 0 ? 'Stop scrolling' : `Key point ${index + 1}`,
    sfx: index === 0 ? 'dramatic hit' : 'soft transition whoosh',
    music: 'cinematic tension underscore',
    status: 'draft',
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
}

async function buildMockSceneRenders(scenePrompts, provider = 'mock-video', aspectRatio = '9:16') {
  const renders = [];
  for (const scene of scenePrompts) {
    const dir = path.join(runtimeDir, 'mock-scenes');
    fs.mkdirSync(dir, { recursive: true });
    const fileName = `${scene.id}.mp4`;
    const outPath = path.join(dir, fileName);
    await createPlaceholderVideo(outPath, scene.durationSec || 5, aspectRatio);
    renders.push({
      id: token(),
      scenePromptId: scene.id,
      provider,
      providerJobId: `mock_${scene.id}`,
      status: 'done',
      errorMessage: null,
      outputVideoUrl: `/runtime/mock-scenes/${fileName}`,
      thumbnailUrl: null,
      durationSec: scene.durationSec,
      version: scene.version,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  return renders;
}

function buildMockFinalVideo(contentPackage, approvedSceneIds) {
  return {
    id: token(),
    contentPackageId: contentPackage.id,
    status: 'done',
    outputUrl: `/mock/finals/${contentPackage.id}.mp4`,
    subtitleUrl: `/mock/finals/${contentPackage.id}.srt`,
    transcriptUrl: `/mock/finals/${contentPackage.id}.txt`,
    thumbnailUrl: `/mock/finals/${contentPackage.id}.jpg`,
    durationSec: approvedSceneIds.length * 8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function auth(req, res, next) {
  const bearer = req.headers.authorization?.replace('Bearer ', '');
  const db = readDb();
  const session = db.sessions.find((item) => item.token === bearer);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  req.user = session;
  next();
}

function getSubscriptionForUser(db, userId) {
  return db.subscriptions[userId] || getPlans()[0];
}

function getRetentionForUser(db, userId) {
  return db.retention[userId] || { morningReminder: true, eveningReminder: false, winbackDays: 7, promoBroadcast: true };
}

function logEvent(db, userId, type, platform) {
  db.analytics.unshift({ id: token(), userId, type, platform, createdAt: new Date().toISOString() });
  db.analytics = db.analytics.slice(0, 400);
}

function summarizeAnalytics(db, userId) {
  const events = db.analytics.filter((item) => item.userId === userId);
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weeklyEvents = events.filter((item) => new Date(item.createdAt).getTime() >= sevenDaysAgo);
  const platformMap = new Map();
  for (const event of events) {
    if (!event.platform) continue;
    platformMap.set(event.platform, (platformMap.get(event.platform) || 0) + 1);
  }
  const topPlatform = [...platformMap.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  return {
    totalGenerations: events.filter((item) => ['generate', 'generate-week', 'generate-month'].includes(item.type)).length,
    weeklyGenerations: weeklyEvents.filter((item) => ['generate', 'generate-week', 'generate-month'].includes(item.type)).length,
    totalCopies: events.filter((item) => item.type === 'copy').length,
    lastEventAt: events[0]?.createdAt || null,
    topPlatform,
  };
}

function buildGeneratedContent(profile, brief, dayLabel) {
  const headline = `${brief.productName} - ${brief.promo}${dayLabel ? ` (${dayLabel})` : ''}`;
  const captionShort = `${brief.productName} cho ${brief.targetAudience}. ${profile.sellingPoint}. ${brief.callToAction}`;
  const captionLong = [
    `Bạn đang gặp vấn đề: ${brief.painPoint}?`,
    `${profile.shopName} có ${brief.productName} giúp ${brief.productDetails}.`,
    `Phù hợp với ${brief.targetAudience}.`,
    `Ưu điểm nổi bật: ${profile.sellingPoint}.`,
    `Ưu đãi hôm nay: ${brief.promo}.`,
    `${brief.callToAction}.`,
  ].join(' ');
  const hashtags = ['#viralvideo', '#contentstudio', `#${String(profile.category).replace(/-/g, '')}`, `#${String(brief.platform).toLowerCase()}`];
  const callouts = [
    `Mở đầu bằng pain point: ${brief.painPoint}`,
    `Chốt lợi ích chính: ${profile.sellingPoint}`,
    `Nhắc ưu đãi: ${brief.promo}`,
    `CTA rõ ràng: ${brief.callToAction}`,
  ];
  const imagePrompt = `Thiết kế social post cho ${brief.platform}, sản phẩm ${brief.productName}, ngành ${profile.category}, tone ${brief.tone}, nhấn mạnh ưu đãi ${brief.promo}, tiêu đề lớn dễ đọc, phong cách hiện đại dành cho thị trường Việt Nam.`;
  return { headline, captionShort, captionLong, hashtags, callouts, imagePrompt };
}

function createJobAndAsset(profile, brief, provider, titleSuffix = '') {
  const createdAt = new Date().toISOString();
  const cleanSuffix = titleSuffix ? ` ${titleSuffix}` : '';
  return {
    job: { id: token(), title: `${brief.productName}${cleanSuffix} / ${brief.platform}`, status: 'Ready', platform: brief.platform, createdAt, provider: provider.id },
    asset: {
      id: token(),
      title: `${brief.productName}${cleanSuffix}`,
      platform: brief.platform,
      objective: brief.objective,
      updatedAt: 'Vừa xong',
      performance: 'Sẵn sàng copy',
      source: provider.name,
      content: buildGeneratedContent(profile, brief, titleSuffix.trim()),
    },
  };
}

function ensureQuota(subscription, needed) {
  return subscription.usedThisMonth + needed <= subscription.generationLimit;
}

function applyGenerationMutation(db, userId, count, eventType, platform) {
  db.subscriptions[userId].usedThisMonth += count;
  logEvent(db, userId, eventType, platform);
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, port, providers: getProviders(), videoProviders: getVideoProviders() });
});

app.get('/api/video/providers', auth, (_req, res) => {
  res.json({ providers: getVideoProviders() });
});

app.get('/api/characters', auth, (_req, res) => {
  const db = readDb();
  const pipeline = getPipelineDb(db);
  res.json({ items: pipeline.characterProfiles || [] });
});

app.post('/api/characters', auth, (req, res) => {
  const db = readDb();
  const pipeline = getPipelineDb(db);
  const payload = req.body || {};
  if (!payload.name || !payload.visualPrompt) return res.status(400).json({ error: 'Thiếu tên hoặc mô tả nhân vật' });
  const item = {
    id: token(),
    name: payload.name,
    visualPrompt: payload.visualPrompt,
    referenceImageUrl: payload.referenceImageUrl || '',
    defaultVoiceProfileId: payload.defaultVoiceProfileId || 'voice-male-warm-deep',
    createdAt: new Date().toISOString(),
  };
  pipeline.characterProfiles.unshift(item);
  writeDb(db);
  res.json({ item, items: pipeline.characterProfiles });
});

app.post('/api/characters/:id/voice-profile', auth, (req, res) => {
  const db = readDb();
  const pipeline = getPipelineDb(db);
  const characterProfile = (pipeline.characterProfiles || []).find((item) => item.id === req.params.id);
  if (!characterProfile) return res.status(404).json({ error: 'Không tìm thấy nhân vật' });
  const voiceProfile = (pipeline.voiceProfiles || []).find((item) => item.id === req.body?.voiceProfileId);
  if (!voiceProfile) return res.status(404).json({ error: 'Không tìm thấy voice profile' });
  characterProfile.defaultVoiceProfileId = voiceProfile.id;
  writeDb(db);
  res.json({ characterProfile, voiceProfile, items: pipeline.characterProfiles });
});

app.get('/api/voices', auth, (_req, res) => {
  const db = readDb();
  const pipeline = getPipelineDb(db);
  res.json({ items: pipeline.voiceProfiles || [] });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const db = readDb();
  const user = db.users.find((item) => item.email === email && item.password === password);
  if (!user) return res.status(401).json({ error: 'Sai email hoặc mật khẩu' });
  const session = { token: token(), userId: user.id, createdAt: new Date().toISOString() };
  db.sessions = [session];
  writeDb(db);
  res.json({ token: session.token, user: { id: user.id, name: user.name, email: user.email } });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body || {};
  const db = readDb();
  if (!name || !email || !password) return res.status(400).json({ error: 'Thiếu thông tin đăng ký' });
  if (db.users.some((item) => item.email === email)) return res.status(409).json({ error: 'Email đã tồn tại' });
  const user = { id: token(), name, email, password };
  db.users.push(user);
  db.subscriptions[user.id] = { planId: 'free', status: 'trial', monthlyPrice: 0, generationLimit: 15, usedThisMonth: 0, renewsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() };
  const session = { token: token(), userId: user.id, createdAt: new Date().toISOString() };
  db.sessions = [session];
  writeDb(db);
  res.json({ token: session.token, user: { id: user.id, name: user.name, email: user.email } });
});

app.get('/api/bootstrap', auth, (req, res) => {
  const db = readDb();
  const user = db.users.find((item) => item.id === req.user.userId);
  res.json({
    profile: db.profile,
    brief: db.brief,
    jobs: db.jobs,
    assets: db.assets,
    providers: getProviders(),
    user: user ? { id: user.id, name: user.name, email: user.email } : null,
    subscription: getSubscriptionForUser(db, req.user.userId),
    plans: getPlans(),
    analytics: summarizeAnalytics(db, req.user.userId),
    templates: getTemplatePacks(),
    billing: getBillingConfig(),
    retention: getRetentionForUser(db, req.user.userId),
  });
});

app.put('/api/profile', auth, (req, res) => {
  const db = readDb();
  db.profile = { ...db.profile, ...req.body };
  writeDb(db);
  res.json(db.profile);
});

app.put('/api/brief', auth, (req, res) => {
  const db = readDb();
  db.brief = { ...db.brief, ...req.body };
  writeDb(db);
  res.json(db.brief);
});

app.put('/api/retention', auth, (req, res) => {
  const db = readDb();
  db.retention[req.user.userId] = { ...getRetentionForUser(db, req.user.userId), ...req.body };
  writeDb(db);
  res.json({ retention: db.retention[req.user.userId] });
});

app.get('/api/plans', auth, (req, res) => {
  const db = readDb();
  res.json({ plans: getPlans(), subscription: getSubscriptionForUser(db, req.user.userId) });
});

app.get('/api/templates', auth, (_req, res) => {
  res.json({ templates: getTemplatePacks() });
});

app.get('/api/backup/export', auth, (req, res) => {
  const db = readDb();
  res.json({
    exportedAt: new Date().toISOString(),
    profile: db.profile,
    brief: db.brief,
    retention: getRetentionForUser(db, req.user.userId),
    subscription: getSubscriptionForUser(db, req.user.userId),
  });
});

app.post('/api/backup/import', auth, (req, res) => {
  const db = readDb();
  const payload = req.body || {};
  if (!payload.profile || !payload.brief) return res.status(400).json({ error: 'Backup không hợp lệ' });
  db.profile = { ...db.profile, ...payload.profile };
  db.brief = { ...db.brief, ...payload.brief };
  if (payload.retention) {
    db.retention[req.user.userId] = { ...getRetentionForUser(db, req.user.userId), ...payload.retention };
  }
  writeDb(db);
  res.json({ ok: true, profile: db.profile, brief: db.brief, retention: getRetentionForUser(db, req.user.userId) });
});

app.post('/api/subscription/select', auth, (req, res) => {
  const { planId } = req.body || {};
  const db = readDb();
  const plan = getPlans().find((item) => item.id === planId);
  if (!plan) return res.status(400).json({ error: 'Gói không hợp lệ' });
  db.subscriptions[req.user.userId] = {
    planId: plan.id,
    status: plan.id === 'free' ? 'trial' : 'active',
    monthlyPrice: plan.monthlyPrice,
    generationLimit: plan.generationLimit,
    usedThisMonth: db.subscriptions[req.user.userId]?.usedThisMonth || 0,
    renewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };
  writeDb(db);
  res.json({ subscription: db.subscriptions[req.user.userId], plans: getPlans() });
});

app.post('/api/billing/checkout', auth, async (req, res) => {
  const { planId } = req.body || {};
  const plan = getPlans().find((item) => item.id === planId);
  if (!plan) return res.status(400).json({ error: 'Gói không hợp lệ' });
  if (plan.id === 'free') return res.status(400).json({ error: 'Gói Free không cần checkout' });

  const billing = getBillingConfig();
  const db = readDb();
  const user = db.users.find((item) => item.id === req.user.userId);
  if (!user) return res.status(404).json({ error: 'Không tìm thấy user' });

  if (!billing.canUseRealPayments) {
    return res.json({
      mode: 'mock',
      checkoutUrl: `${billing.checkoutBaseUrl}?plan=${plan.id}&email=${encodeURIComponent(user.email)}`,
      note: 'Mock checkout đang bật. Gắn STRIPE_SECRET_KEY để dùng thanh toán thật.',
    });
  }

  return res.json({
    mode: 'stripe-ready',
    checkoutUrl: `${billing.checkoutBaseUrl}?plan=${plan.id}&email=${encodeURIComponent(user.email)}`,
    note: 'Billing flow đã sẵn sàng để nối Stripe Checkout hoặc payment provider thật.',
  });
});

app.get('/api/billing/portal', auth, (_req, res) => {
  const billing = getBillingConfig();
  res.json({ portalUrl: billing.portalUrl, provider: billing.provider });
});

app.get('/api/analytics/summary', auth, (req, res) => {
  const db = readDb();
  res.json({ analytics: summarizeAnalytics(db, req.user.userId) });
});

app.post('/api/analytics/event', auth, (req, res) => {
  const { type, platform } = req.body || {};
  const db = readDb();
  logEvent(db, req.user.userId, type, platform);
  writeDb(db);
  res.json({ ok: true, analytics: summarizeAnalytics(db, req.user.userId) });
});

app.post('/api/generate', auth, (req, res) => {
  const db = readDb();
  const profile = req.body?.profile || db.profile;
  const brief = req.body?.brief || db.brief;
  const provider = getProviders().find((item) => item.id === brief.provider) || getProviders()[0];
  const subscription = getSubscriptionForUser(db, req.user.userId);
  if (!ensureQuota(subscription, 1)) return res.status(403).json({ error: 'Đã hết lượt tạo trong tháng, hãy nâng cấp gói.' });

  const { job, asset } = createJobAndAsset(profile, brief, provider);
  db.profile = profile;
  db.brief = brief;
  db.jobs = [job, ...db.jobs].slice(0, 40);
  db.assets = [asset, ...db.assets].slice(0, 80);
  applyGenerationMutation(db, req.user.userId, 1, 'generate', brief.platform);
  writeDb(db);

  res.json({ job, asset, providers: getProviders(), subscription: db.subscriptions[req.user.userId], analytics: summarizeAnalytics(db, req.user.userId) });
});

app.post('/api/generate-week', auth, (req, res) => {
  const db = readDb();
  const profile = req.body?.profile || db.profile;
  const brief = req.body?.brief || db.brief;
  const provider = getProviders().find((item) => item.id === brief.provider) || getProviders()[0];
  const subscription = getSubscriptionForUser(db, req.user.userId);
  if (!ensureQuota(subscription, 7)) return res.status(403).json({ error: 'Không đủ lượt để tạo lịch 7 ngày, hãy nâng cấp gói.' });

  const dayThemes = ['Ngày 1 Hook mạnh', 'Ngày 2 Pain point', 'Ngày 3 Lợi ích', 'Ngày 4 Feedback', 'Ngày 5 Ưu đãi', 'Ngày 6 FAQ', 'Ngày 7 Chốt đơn'];
  const pack = dayThemes.map((theme, index) => {
    const briefForDay = {
      ...brief,
      promo: index === 4 ? `${brief.promo} hôm nay` : brief.promo,
      callToAction: index === 6 ? 'Inbox ngay để giữ ưu đãi trước khi hết slot' : brief.callToAction,
      painPoint: index === 1 ? `${brief.painPoint} và chưa biết nên bắt đầu từ đâu` : brief.painPoint,
    };
    return createJobAndAsset(profile, briefForDay, provider, theme);
  });

  const jobs = pack.map((item) => item.job);
  const assets = pack.map((item) => item.asset);
  db.profile = profile;
  db.brief = brief;
  db.jobs = [...jobs, ...db.jobs].slice(0, 50);
  db.assets = [...assets, ...db.assets].slice(0, 120);
  applyGenerationMutation(db, req.user.userId, 7, 'generate-week', brief.platform);
  writeDb(db);

  res.json({ jobs, assets, providers: getProviders(), subscription: db.subscriptions[req.user.userId], analytics: summarizeAnalytics(db, req.user.userId) });
});

app.post('/api/generate-month', auth, (req, res) => {
  const db = readDb();
  const profile = req.body?.profile || db.profile;
  const brief = req.body?.brief || db.brief;
  const provider = getProviders().find((item) => item.id === brief.provider) || getProviders()[0];
  const subscription = getSubscriptionForUser(db, req.user.userId);
  if (subscription.planId !== 'pro') return res.status(403).json({ error: 'Tính năng 30 ngày chỉ dành cho gói Pro.' });
  if (!ensureQuota(subscription, 30)) return res.status(403).json({ error: 'Không đủ lượt để tạo lịch 30 ngày.' });

  const themes = Array.from({ length: 30 }, (_, index) => `Ngày ${index + 1}`);
  const pack = themes.map((theme, index) => {
    const mode = index % 5;
    const briefForDay = {
      ...brief,
      objective: mode === 0 ? 'ban-hang' : mode === 1 ? 'keo-inbox' : mode === 2 ? 'ra-mat' : mode === 3 ? 'livestream' : 'ban-hang',
      promo: mode === 4 ? `${brief.promo} hôm nay` : brief.promo,
      callToAction: mode === 1 ? 'Inbox ngay để nhận tư vấn cá nhân' : brief.callToAction,
      painPoint: mode === 2 ? `${brief.painPoint} và cần giải pháp dễ áp dụng` : brief.painPoint,
    };
    return createJobAndAsset(profile, briefForDay, provider, `${theme} Content Plan`);
  });

  const jobs = pack.map((item) => item.job);
  const assets = pack.map((item) => item.asset);
  db.profile = profile;
  db.brief = brief;
  db.jobs = [...jobs, ...db.jobs].slice(0, 80);
  db.assets = [...assets, ...db.assets].slice(0, 180);
  applyGenerationMutation(db, req.user.userId, 30, 'generate-month', brief.platform);
  writeDb(db);

  res.json({ jobs, assets, providers: getProviders(), subscription: db.subscriptions[req.user.userId], analytics: summarizeAnalytics(db, req.user.userId) });
});

app.get('/api/viral-pipeline/bootstrap', auth, (_req, res) => {
  const db = readDb();
  const pipeline = getPipelineDb(db);
  res.json({
    presets: getViralStylePresets(),
    latestScan: pipeline.scans[0] || null,
    trendItems: pipeline.trendItems.slice(0, 20),
    mainTopics: pipeline.mainTopics.slice(0, 5),
    platformRankings: pipeline.platformRankings || { youtube: [], facebook: [], tiktok: [] },
    hybridPicks: pipeline.hybridPicks || [],
    characterProfiles: pipeline.characterProfiles || [],
    voiceProfiles: pipeline.voiceProfiles || [],
    voiceJobs: pipeline.voiceJobs || [],
    videoProviders: getVideoProviders(),
    contentPackages: pipeline.contentPackages.slice(0, 10),
    sceneRenders: pipeline.sceneRenders.slice(0, 20),
    finalVideos: pipeline.finalVideos.slice(0, 10),
  });
});

app.post('/api/viral/scan', auth, async (req, res) => {
  const db = readDb();
  const pipeline = getPipelineDb(db);
  const scan = {
    id: token(),
    country: req.body?.country || 'VN',
    language: req.body?.language || 'vi',
    platforms: req.body?.platforms || ['youtube', 'tiktok', 'facebook'],
    window: req.body?.window || '7d',
    format: req.body?.format || 'mixed',
    status: 'completed',
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  };
  const trendItems = await fetchRealTrendItems(scan.id, scan.country);
  const mainTopics = trendItems.length ? buildTopicsFromTrendItems(scan.id, trendItems) : buildMainTopics(scan.id);
  const platformRankings = trendItems.length ? buildPlatformRankings(scan.id, trendItems) : { youtube: [], facebook: [], tiktok: [] };
  const hybridPicks = buildHighViralHighMonetizationTopics(mainTopics);
  pipeline.scans.unshift(scan);
  pipeline.trendItems = [...trendItems, ...pipeline.trendItems.filter((item) => item.scanId !== scan.id)].slice(0, 500);
  pipeline.mainTopics = [...mainTopics, ...pipeline.mainTopics.filter((item) => item.scanId !== scan.id)].slice(0, 100);
  pipeline.platformRankings = platformRankings;
  pipeline.hybridPicks = hybridPicks;
  writeDb(db);
  res.json({ scanId: scan.id, status: scan.status, summary: { items: trendItems.length, topics: mainTopics.length }, trendItems: trendItems.slice(0, 20), mainTopics: mainTopics.slice(0, 5), platformRankings, hybridPicks });
});

app.get('/api/topics/main/ranked', auth, (req, res) => {
  const db = readDb();
  const pipeline = getPipelineDb(db);
  const scanId = req.query.scanId;
  const limit = Number(req.query.limit) || 20;
  const items = pipeline.mainTopics
    .filter((item) => (scanId ? item.scanId === scanId : true))
    .sort((a, b) => b.rankingScore - a.rankingScore)
    .slice(0, limit);
  res.json({ items });
});

app.post('/api/topics/main/recommendations', auth, (req, res) => {
  const db = readDb();
  const pipeline = getPipelineDb(db);
  const limit = Number(req.body?.limit) || 5;
  const scanId = req.body?.scanId;
  const items = pipeline.mainTopics
    .filter((item) => (scanId ? item.scanId === scanId : true))
    .sort((a, b) => b.rankingScore - a.rankingScore)
    .slice(0, limit)
    .map((item) => ({
      ...item,
      reason: `${item.name} đang cân bằng tốt giữa viral, kiếm tiền và khả năng xây series dài.`
    }));
  res.json({ items });
});

app.post('/api/topics/main/:mainTopicId/subtopics/generate', auth, (req, res) => {
  const db = readDb();
  const pipeline = getPipelineDb(db);
  const mainTopic = pipeline.mainTopics.find((item) => item.id === req.params.mainTopicId);
  if (!mainTopic) return res.status(404).json({ error: 'Không tìm thấy chủ đề chính' });
  const limit = Number(req.body?.limit) || 20;
  const items = buildSubtopics(mainTopic.id, mainTopic.name, limit);
  pipeline.subtopics = [...items, ...pipeline.subtopics.filter((item) => item.mainTopicId !== mainTopic.id)].slice(0, 500);
  writeDb(db);
  res.json({ mainTopicId: mainTopic.id, items });
});

app.post('/api/subtopics/:subtopicId/content-package', auth, (req, res) => {
  const db = readDb();
  const pipeline = getPipelineDb(db);
  const subtopic = pipeline.subtopics.find((item) => item.id === req.params.subtopicId);
  if (!subtopic) return res.status(404).json({ error: 'Không tìm thấy chủ đề nhỏ' });
  const mainTopic = pipeline.mainTopics.find((item) => item.id === subtopic.mainTopicId);
  if (!mainTopic) return res.status(404).json({ error: 'Không tìm thấy chủ đề chính' });
  const contentPackage = buildContentPackage(mainTopic, subtopic, req.body || {});
  pipeline.contentPackages.unshift(contentPackage);
  writeDb(db);
  res.json(contentPackage);
});

app.post('/api/content-packages/:id/character', auth, (req, res) => {
  const db = readDb();
  const pipeline = getPipelineDb(db);
  const contentPackage = pipeline.contentPackages.find((item) => item.id === req.params.id);
  if (!contentPackage) return res.status(404).json({ error: 'Không tìm thấy package' });
  const characterProfile = (pipeline.characterProfiles || []).find((item) => item.id === req.body?.characterProfileId);
  if (!characterProfile) return res.status(404).json({ error: 'Không tìm thấy nhân vật' });
  contentPackage.characterProfileId = characterProfile.id;
  if (characterProfile.defaultVoiceProfileId) contentPackage.voiceProfileId = characterProfile.defaultVoiceProfileId;
  contentPackage.updatedAt = new Date().toISOString();
  writeDb(db);
  res.json({ contentPackage, characterProfile });
});

app.post('/api/content-packages/:id/voice-profile', auth, (req, res) => {
  const db = readDb();
  const pipeline = getPipelineDb(db);
  const contentPackage = pipeline.contentPackages.find((item) => item.id === req.params.id);
  if (!contentPackage) return res.status(404).json({ error: 'Không tìm thấy package' });
  const voiceProfile = (pipeline.voiceProfiles || []).find((item) => item.id === req.body?.voiceProfileId);
  if (!voiceProfile) return res.status(404).json({ error: 'Không tìm thấy voice profile' });
  contentPackage.voiceProfileId = voiceProfile.id;
  contentPackage.updatedAt = new Date().toISOString();
  writeDb(db);
  res.json({ contentPackage, voiceProfile });
});

app.post('/api/content-packages/:id/voice-settings', auth, (req, res) => {
  const db = readDb();
  const pipeline = getPipelineDb(db);
  const contentPackage = pipeline.contentPackages.find((item) => item.id === req.params.id);
  if (!contentPackage) return res.status(404).json({ error: 'Không tìm thấy package' });
  contentPackage.voiceSettings = {
    enabled: true,
    mode: 'voiceover',
    subtitleEnabled: true,
    lipSyncMode: 'off',
    pacing: 'balanced',
    ...(contentPackage.voiceSettings || {}),
    ...(req.body || {}),
  };
  contentPackage.updatedAt = new Date().toISOString();
  writeDb(db);
  res.json({ contentPackage });
});

app.post('/api/scenes/:id/voice-generate', auth, async (req, res) => {
  const db = readDb();
  const pipeline = getPipelineDb(db);
  const scene = pipeline.scenePrompts.find((item) => item.id === req.params.id);
  if (!scene) return res.status(404).json({ error: 'Không tìm thấy scene' });
  const contentPackage = pipeline.contentPackages.find((item) => item.id === scene.contentPackageId);
  const voiceProfile = (pipeline.voiceProfiles || []).find((item) => item.id === (contentPackage?.voiceProfileId || 'voice-male-warm-deep'));
  const provider = req.body?.provider || 'runway-tts';
  const job = provider === 'mock-voice'
    ? await createMockVoiceJob(scene)
    : await createRunwayVoiceJob(scene, voiceProfile);
  pipeline.voiceJobs.unshift(job);
  writeDb(db);
  res.json({ job, voiceProfile, provider });
});

app.post('/api/content-packages/:id/voice-generate-missing', auth, async (req, res) => {
  const db = readDb();
  const pipeline = getPipelineDb(db);
  const contentPackage = pipeline.contentPackages.find((item) => item.id === req.params.id);
  if (!contentPackage) return res.status(404).json({ error: 'Không tìm thấy package' });

  const provider = req.body?.provider || 'runway-tts';
  const scenes = pipeline.scenePrompts.filter((item) => item.contentPackageId === contentPackage.id);
  const createdJobs = [];
  const voiceProfile = (pipeline.voiceProfiles || []).find((item) => item.id === (contentPackage.voiceProfileId || 'voice-male-warm-deep'));

  for (const scene of scenes) {
    const existingDoneJob = (pipeline.voiceJobs || []).find((job) => job.scenePromptId === scene.id && job.outputAudioUrl);
    if (existingDoneJob) continue;
    const job = provider === 'mock-voice'
      ? await createMockVoiceJob(scene)
      : await createRunwayVoiceJob(scene, voiceProfile);
    pipeline.voiceJobs.unshift(job);
    createdJobs.push(job);
  }

  writeDb(db);
  res.json({ createdJobs, provider });
});

app.get('/api/voice-jobs/:id', auth, async (req, res) => {
  const db = readDb();
  const pipeline = getPipelineDb(db);
  const job = pipeline.voiceJobs.find((item) => item.id === req.params.id || item.providerJobId === req.params.id);
  if (!job) return res.status(404).json({ error: 'Không tìm thấy voice job' });
  if (job.provider === 'runway-tts' && ['queued', 'rendering'].includes(job.status)) {
    const task = await pollRunwayTask(job.providerJobId);
    job.updatedAt = new Date().toISOString();
    if (task.status === 'SUCCEEDED') {
      job.status = 'done';
      job.outputAudioUrl = task.output?.[0] || null;
      job.taskDetails = task;
    } else if (task.status === 'FAILED') {
      job.status = 'failed';
      job.errorMessage = task.failure || 'Runway voice task failed';
      job.taskDetails = task;
    } else if (task.status === 'RUNNING') {
      job.status = 'rendering';
      job.taskDetails = task;
    }
    const scene = pipeline.scenePrompts.find((item) => item.id === job.scenePromptId);
    if (scene) syncContentPackageStatus(db, scene.contentPackageId);
    writeDb(db);
  }
  res.json({ job });
});

app.post('/api/voice-jobs/poll-active', auth, async (req, res) => {
  const db = readDb();
  const pipeline = getPipelineDb(db);
  const contentPackageId = req.body?.contentPackageId;
  const targetSceneIds = new Set(
    pipeline.scenePrompts
      .filter((item) => (contentPackageId ? item.contentPackageId === contentPackageId : true))
      .map((item) => item.id)
  );

  const activeJobs = (pipeline.voiceJobs || []).filter((job) => ['queued', 'rendering'].includes(job.status) && (!contentPackageId || targetSceneIds.has(job.scenePromptId)));
  for (const job of activeJobs) {
    const task = await pollRunwayTask(job.providerJobId);
    job.updatedAt = new Date().toISOString();
    if (task.status === 'SUCCEEDED') {
      job.status = 'done';
      job.outputAudioUrl = task.output?.[0] || null;
      job.taskDetails = task;
    } else if (task.status === 'FAILED') {
      job.status = 'failed';
      job.errorMessage = task.failure || 'Runway voice task failed';
      job.taskDetails = task;
    } else if (task.status === 'RUNNING') {
      job.status = 'rendering';
      job.taskDetails = task;
    }
  }
  if (contentPackageId) syncContentPackageStatus(db, contentPackageId);
  writeDb(db);
  res.json({ jobs: activeJobs });
});

app.get('/api/content-packages/:id', auth, (req, res) => {
  const db = readDb();
  const pipeline = getPipelineDb(db);
  const item = pipeline.contentPackages.find((contentPackage) => contentPackage.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Không tìm thấy package' });
  res.json(item);
});

app.post('/api/content-packages/:id/scene-prompts', auth, (req, res) => {
  const db = readDb();
  const pipeline = getPipelineDb(db);
  const contentPackage = pipeline.contentPackages.find((item) => item.id === req.params.id);
  if (!contentPackage) return res.status(404).json({ error: 'Không tìm thấy package' });
  const subtopic = pipeline.subtopics.find((item) => item.id === contentPackage.subtopicId);
  if (!subtopic) return res.status(404).json({ error: 'Không tìm thấy chủ đề nhỏ' });
  const characterProfile = (pipeline.characterProfiles || []).find((item) => item.id === contentPackage.characterProfileId) || null;
  const voiceProfile = (pipeline.voiceProfiles || []).find((item) => item.id === contentPackage.voiceProfileId) || null;
  const sceneDurationSec = Number(req.body?.sceneDurationSec) || 8;
  const items = buildScenePrompts(contentPackage, subtopic, sceneDurationSec, characterProfile, voiceProfile);
  pipeline.scenePrompts = [...items, ...pipeline.scenePrompts.filter((item) => item.contentPackageId !== contentPackage.id)].slice(0, 2000);
  contentPackage.updatedAt = new Date().toISOString();
  writeDb(db);
  res.json({ contentPackageId: contentPackage.id, sceneCount: items.length, items });
});

app.get('/api/content-packages/:id/scenes', auth, (req, res) => {
  const db = readDb();
  const pipeline = getPipelineDb(db);
  const items = pipeline.scenePrompts.filter((item) => item.contentPackageId === req.params.id).sort((a, b) => a.sceneNumber - b.sceneNumber);
  res.json({ items });
});

app.put('/api/scenes/:sceneId', auth, (req, res) => {
  const db = readDb();
  const pipeline = getPipelineDb(db);
  const scene = pipeline.scenePrompts.find((item) => item.id === req.params.sceneId);
  if (!scene) return res.status(404).json({ error: 'Không tìm thấy scene' });
  Object.assign(scene, req.body || {});
  scene.version += 1;
  scene.status = 'draft';
  scene.updatedAt = new Date().toISOString();
  writeDb(db);
  res.json(scene);
});

app.post('/api/content-packages/:id/render', auth, async (req, res) => {
  const db = readDb();
  const pipeline = getPipelineDb(db);
  const contentPackage = pipeline.contentPackages.find((item) => item.id === req.params.id);
  if (!contentPackage) return res.status(404).json({ error: 'Không tìm thấy package' });
  const sceneIds = req.body?.sceneIds;
  const scenes = pipeline.scenePrompts.filter((item) => item.contentPackageId === contentPackage.id && (!sceneIds || sceneIds.includes(item.id)));
  const provider = getVideoProviderById(req.body?.provider || 'mock-video');
  if (!provider?.ready) {
    return res.status(400).json({ error: `${provider?.name || 'Provider'} chưa sẵn sàng. ${provider?.note || ''}`, provider });
  }

  let jobs;
  if (provider.id === 'runway') {
    if (scenes.length !== 1) {
      return res.status(400).json({ error: 'Runway real render phase 1 đang chạy an toàn theo từng scene. Hãy chọn đúng 1 scene để render thật.', provider });
    }
    jobs = [await renderSceneWithRunway(scenes[0], contentPackage)];
  } else {
    jobs = await buildMockSceneRenders(scenes, provider.id, contentPackage.aspectRatio);
  }

  pipeline.sceneRenders = [...jobs, ...pipeline.sceneRenders.filter((item) => !scenes.some((scene) => scene.id === item.scenePromptId))].slice(0, 2000);
  scenes.forEach((scene) => {
    const renderJob = jobs.find((job) => job.scenePromptId === scene.id);
    scene.status = renderJob?.status === 'done' ? 'done' : renderJob?.status === 'queued' ? 'queued' : 'failed';
    scene.updatedAt = new Date().toISOString();
  });
  contentPackage.status = jobs.every((job) => job.status === 'done') ? 'rendered' : jobs.some((job) => job.status === 'queued') ? 'rendering' : 'render-error';
  contentPackage.updatedAt = new Date().toISOString();
  writeDb(db);
  res.json({ contentPackageId: contentPackage.id, provider, jobs });
});

app.get('/api/render-jobs/:id', auth, async (req, res) => {
  const db = readDb();
  const pipeline = getPipelineDb(db);
  const renderJob = pipeline.sceneRenders.find((item) => item.id === req.params.id || item.providerJobId === req.params.id);
  if (!renderJob) return res.status(404).json({ error: 'Không tìm thấy render job' });

  await refreshRenderJobStatus(db, renderJob);
  const scene = pipeline.scenePrompts.find((item) => item.id === renderJob.scenePromptId);
  if (scene) syncContentPackageStatus(db, scene.contentPackageId);
  writeDb(db);

  res.json({ job: renderJob });
});

app.post('/api/render-jobs/poll-active', auth, async (req, res) => {
  const db = readDb();
  const pipeline = getPipelineDb(db);
  const contentPackageId = req.body?.contentPackageId;
  const targetSceneIds = new Set(
    pipeline.scenePrompts
      .filter((item) => (contentPackageId ? item.contentPackageId === contentPackageId : true))
      .map((item) => item.id)
  );

  const activeJobs = pipeline.sceneRenders.filter((job) => ['queued', 'rendering'].includes(job.status) && (!contentPackageId || targetSceneIds.has(job.scenePromptId)));
  for (const job of activeJobs) {
    await refreshRenderJobStatus(db, job);
  }
  if (contentPackageId) syncContentPackageStatus(db, contentPackageId);
  writeDb(db);

  res.json({ jobs: activeJobs });
});

app.post('/api/content-packages/:id/render-next', auth, async (req, res) => {
  const db = readDb();
  const pipeline = getPipelineDb(db);
  const contentPackage = pipeline.contentPackages.find((item) => item.id === req.params.id);
  if (!contentPackage) return res.status(404).json({ error: 'Không tìm thấy package' });

  const provider = getVideoProviderById(req.body?.provider || 'runway');
  if (!provider?.ready) return res.status(400).json({ error: `${provider?.name || 'Provider'} chưa sẵn sàng. ${provider?.note || ''}`, provider });
  if (provider.id !== 'runway') return res.status(400).json({ error: 'Render-next phase 1 đang áp dụng cho Runway trước.', provider });

  const hasActiveRunwayJob = pipeline.sceneRenders.some((job) => ['queued', 'rendering'].includes(job.status) && job.provider === 'runway' && pipeline.scenePrompts.find((scene) => scene.id === job.scenePromptId)?.contentPackageId === contentPackage.id);
  if (hasActiveRunwayJob) {
    return res.status(400).json({ error: 'Đang có scene Runway chạy trong package này. Hãy đợi scene hiện tại xong rồi mới chạy tiếp.' });
  }

  const nextScene = pipeline.scenePrompts
    .filter((scene) => scene.contentPackageId === contentPackage.id)
    .sort((a, b) => a.sceneNumber - b.sceneNumber)
    .find((scene) => ['draft', 'failed'].includes(scene.status));

  if (!nextScene) {
    return res.json({ ok: true, done: true, message: 'Không còn scene nào chờ render tiếp.' });
  }

  const job = await renderSceneWithRunway(nextScene, contentPackage);
  pipeline.sceneRenders = [job, ...pipeline.sceneRenders.filter((item) => item.scenePromptId !== nextScene.id)].slice(0, 2000);
  nextScene.status = job.status;
  nextScene.updatedAt = new Date().toISOString();
  contentPackage.status = 'rendering';
  contentPackage.updatedAt = new Date().toISOString();
  writeDb(db);

  res.json({ ok: true, scene: nextScene, job, provider });
});

app.post('/api/content-packages/:id/process-next', auth, async (req, res) => {
  const db = readDb();
  const pipeline = getPipelineDb(db);
  const contentPackage = pipeline.contentPackages.find((item) => item.id === req.params.id);
  if (!contentPackage) return res.status(404).json({ error: 'Không tìm thấy package' });

  const provider = getVideoProviderById(req.body?.provider || 'runway');
  if (!provider?.ready) return res.status(400).json({ error: `${provider?.name || 'Provider'} chưa sẵn sàng. ${provider?.note || ''}`, provider });
  if (provider.id !== 'runway') return res.status(400).json({ error: 'Process-next hiện đang tối ưu cho flow Runway trước.', provider });

  const hasActiveRunwayJob = pipeline.sceneRenders.some((job) => ['queued', 'rendering'].includes(job.status) && job.provider === 'runway' && pipeline.scenePrompts.find((scene) => scene.id === job.scenePromptId)?.contentPackageId === contentPackage.id);
  if (hasActiveRunwayJob) {
    return res.status(400).json({ error: 'Đang có scene Runway chạy trong package này. Hãy đợi scene hiện tại xong rồi mới chạy tiếp.' });
  }

  const nextScene = pipeline.scenePrompts
    .filter((scene) => scene.contentPackageId === contentPackage.id)
    .sort((a, b) => a.sceneNumber - b.sceneNumber)
    .find((scene) => !pipeline.sceneRenders.find((job) => job.scenePromptId === scene.id && job.outputVideoUrl));

  if (!nextScene) {
    return res.json({ ok: true, done: true, message: 'Không còn scene nào thiếu video để xử lý tiếp.' });
  }

  const renderJob = await renderSceneWithRunway(nextScene, contentPackage);
  pipeline.sceneRenders = [renderJob, ...pipeline.sceneRenders.filter((item) => item.scenePromptId !== nextScene.id)].slice(0, 2000);

  const hasDoneVoice = (pipeline.voiceJobs || []).find((job) => job.scenePromptId === nextScene.id && job.outputAudioUrl);
  let voiceJob = null;
  if (!hasDoneVoice) {
    const voiceProfile = (pipeline.voiceProfiles || []).find((item) => item.id === (contentPackage.voiceProfileId || 'voice-male-warm-deep'));
    voiceJob = await createRunwayVoiceJob(nextScene, voiceProfile);
    pipeline.voiceJobs.unshift(voiceJob);
  }

  nextScene.status = renderJob.status;
  nextScene.updatedAt = new Date().toISOString();
  contentPackage.status = 'rendering';
  contentPackage.updatedAt = new Date().toISOString();
  writeDb(db);

  res.json({ ok: true, scene: nextScene, renderJob, voiceJob, provider });
});

app.post('/api/content-packages/:id/render-missing', auth, async (req, res) => {
  const db = readDb();
  const pipeline = getPipelineDb(db);
  const contentPackage = pipeline.contentPackages.find((item) => item.id === req.params.id);
  if (!contentPackage) return res.status(404).json({ error: 'Không tìm thấy package' });

  const provider = getVideoProviderById(req.body?.provider || 'mock');
  if (!provider?.ready) {
    return res.status(400).json({ error: `${provider?.name || 'Provider'} chưa sẵn sàng. ${provider?.note || ''}`, provider });
  }

  const scenes = pipeline.scenePrompts
    .filter((scene) => scene.contentPackageId === contentPackage.id)
    .filter((scene) => !pipeline.sceneRenders.find((job) => job.scenePromptId === scene.id && job.outputVideoUrl));

  if (!scenes.length) {
    return res.json({ ok: true, createdJobs: [], message: 'Không còn scene nào thiếu video.' });
  }

  let jobs = [];
  if (provider.id === 'runway') {
    const hasActiveRunwayJob = pipeline.sceneRenders.some((job) => ['queued', 'rendering'].includes(job.status) && job.provider === 'runway' && pipeline.scenePrompts.find((scene) => scene.id === job.scenePromptId)?.contentPackageId === contentPackage.id);
    if (hasActiveRunwayJob) {
      return res.status(400).json({ error: 'Đang có scene Runway chạy trong package này. Hãy đợi scene hiện tại xong rồi mới render thiếu tiếp.' });
    }
    jobs = [await renderSceneWithRunway(scenes.sort((a, b) => a.sceneNumber - b.sceneNumber)[0], contentPackage)];
  } else {
    jobs = await buildMockSceneRenders(scenes, provider.id, contentPackage.aspectRatio);
  }

  pipeline.sceneRenders = [...jobs, ...pipeline.sceneRenders.filter((item) => !jobs.some((job) => job.scenePromptId === item.scenePromptId))].slice(0, 2000);
  scenes.forEach((scene) => {
    const renderJob = jobs.find((job) => job.scenePromptId === scene.id);
    if (!renderJob) return;
    scene.status = renderJob.status === 'done' ? 'done' : renderJob.status;
    scene.updatedAt = new Date().toISOString();
  });
  contentPackage.status = jobs.some((job) => job.status === 'queued') ? 'rendering' : 'rendered';
  contentPackage.updatedAt = new Date().toISOString();
  writeDb(db);
  res.json({ ok: true, provider, createdJobs: jobs });
});

app.post('/api/scenes/:sceneId/rerender', auth, async (req, res) => {
  const db = readDb();
  const pipeline = getPipelineDb(db);
  const scene = pipeline.scenePrompts.find((item) => item.id === req.params.sceneId);
  if (!scene) return res.status(404).json({ error: 'Không tìm thấy scene' });
  scene.version += 1;
  scene.status = 'done';
  scene.updatedAt = new Date().toISOString();
  const contentPackage = pipeline.contentPackages.find((item) => item.id === scene.contentPackageId);
  const render = (await buildMockSceneRenders([scene], req.body?.provider || 'mock-video', contentPackage?.aspectRatio || '9:16'))[0];
  pipeline.sceneRenders.unshift(render);
  writeDb(db);
  res.json({ jobId: render.id, status: render.status, render });
});

app.post('/api/scenes/:sceneId/approve', auth, (req, res) => {
  const db = readDb();
  const pipeline = getPipelineDb(db);
  const scene = pipeline.scenePrompts.find((item) => item.id === req.params.sceneId);
  if (!scene) return res.status(404).json({ error: 'Không tìm thấy scene' });
  scene.status = 'approved';
  scene.updatedAt = new Date().toISOString();
  writeDb(db);
  res.json({ id: scene.id, status: scene.status });
});

app.post('/api/content-packages/:id/approve-ready-scenes', auth, (req, res) => {
  const db = readDb();
  const pipeline = getPipelineDb(db);
  const contentPackage = pipeline.contentPackages.find((item) => item.id === req.params.id);
  if (!contentPackage) return res.status(404).json({ error: 'Không tìm thấy package' });

  const scenes = pipeline.scenePrompts.filter((item) => item.contentPackageId === contentPackage.id);
  const approvedSceneIds = [];
  for (const scene of scenes) {
    const hasVideo = Boolean(pipeline.sceneRenders.find((job) => job.scenePromptId === scene.id && job.outputVideoUrl));
    const hasVoice = !contentPackage.voiceSettings?.enabled || Boolean((pipeline.voiceJobs || []).find((job) => job.scenePromptId === scene.id && job.outputAudioUrl));
    if (hasVideo && hasVoice) {
      scene.status = 'approved';
      scene.updatedAt = new Date().toISOString();
      approvedSceneIds.push(scene.id);
    }
  }

  const readyScenes = scenes.filter((scene) => scene.status === 'approved');
  if (readyScenes.length === scenes.length && scenes.length > 0) contentPackage.status = 'waiting-review';
  syncContentPackageStatus(db, contentPackage.id);
  writeDb(db);
  res.json({ approvedSceneIds, totalScenes: scenes.length });
});

app.post('/api/content-packages/:id/stitch', auth, async (req, res) => {
  const db = readDb();
  const pipeline = getPipelineDb(db);
  const contentPackage = pipeline.contentPackages.find((item) => item.id === req.params.id);
  if (!contentPackage) return res.status(404).json({ error: 'Không tìm thấy package' });
  const approvedScenes = pipeline.scenePrompts.filter((item) => item.contentPackageId === contentPackage.id && item.status === 'approved');
  if (!approvedScenes.length) return res.status(400).json({ error: 'Cần approve ít nhất 1 scene trước khi stitch' });

  const orderedScenes = approvedScenes.sort((a, b) => a.sceneNumber - b.sceneNumber);
  const sceneRenderJobs = orderedScenes.map((scene) => pipeline.sceneRenders.find((job) => job.scenePromptId === scene.id && job.outputVideoUrl));
  if (sceneRenderJobs.some((job) => !job?.outputVideoUrl)) {
    return res.status(400).json({ error: 'Thiếu output video ở một hoặc nhiều scene đã approve, chưa thể stitch.' });
  }

  const finalVideoId = token();
  const finalDir = path.join(runtimeDir, finalVideoId);
  fs.mkdirSync(finalDir, { recursive: true });

  try {
    const localFiles = [];
    for (let index = 0; index < sceneRenderJobs.length; index += 1) {
      const job = sceneRenderJobs[index];
      const localPath = path.join(finalDir, `scene-${String(index + 1).padStart(2, '0')}.mp4`);
      await downloadFile(job.outputVideoUrl, localPath);
      localFiles.push(localPath);
    }

    const listFilePath = path.join(finalDir, 'concat.txt');
    fs.writeFileSync(listFilePath, localFiles.map((filePath) => `file '${filePath.replace(/'/g, "'\\''")}'`).join('\n'));

    const outPath = path.join(finalDir, 'final.mp4');
    await runFfmpegConcat(listFilePath, outPath);

    const transcriptPath = path.join(finalDir, 'transcript.txt');
    const subtitlePath = path.join(finalDir, 'subtitles.srt');
    fs.writeFileSync(transcriptPath, buildTranscriptFromScenes(orderedScenes), 'utf8');
    fs.writeFileSync(subtitlePath, buildSrtFromScenes(orderedScenes), 'utf8');

    let finalOutputUrl = `/runtime/${finalVideoId}/final.mp4`;
    const voiceJobs = orderedScenes.map((scene) => (pipeline.voiceJobs || []).find((job) => job.scenePromptId === scene.id && job.outputAudioUrl));
    const canMuxVoice = Boolean(contentPackage.voiceSettings?.enabled) && voiceJobs.every((job) => job?.outputAudioUrl);
    if (canMuxVoice && voiceJobs.length) {
      const localAudioFiles = [];
      for (let index = 0; index < voiceJobs.length; index += 1) {
        const job = voiceJobs[index];
        const localAudioPath = path.join(finalDir, `voice-${String(index + 1).padStart(2, '0')}.mp3`);
        await downloadFile(job.outputAudioUrl, localAudioPath);
        localAudioFiles.push(localAudioPath);
      }

      const audioListPath = path.join(finalDir, 'audio-concat.txt');
      fs.writeFileSync(audioListPath, localAudioFiles.map((filePath) => `file '${filePath.replace(/'/g, "'\\''")}'`).join('\n'));
      const mergedAudioPath = path.join(finalDir, 'voice-track.m4a');
      await runFfmpegAudioConcat(audioListPath, mergedAudioPath);
      const muxedOutPath = path.join(finalDir, 'final-with-voice.mp4');
      await runFfmpegMuxVideoAudio(outPath, mergedAudioPath, muxedOutPath);
      finalOutputUrl = `/runtime/${finalVideoId}/final-with-voice.mp4`;
    }

    const shouldBurnSubtitles = Boolean(req.body?.burnSubtitles);
    let burnedSubtitleUrl = null;
    if (shouldBurnSubtitles) {
      const burnedOutPath = path.join(finalDir, 'final-burned-subtitles.mp4');
      const subtitleInputPath = path.join(finalDir, 'subtitles.srt');
      const videoInputPath = finalOutputUrl.endsWith('final-with-voice.mp4') ? path.join(finalDir, 'final-with-voice.mp4') : outPath;
      try {
        await runFfmpegBurnSubtitles(videoInputPath, subtitleInputPath, burnedOutPath);
        burnedSubtitleUrl = `/runtime/${finalVideoId}/final-burned-subtitles.mp4`;
      } catch (error) {
        burnedSubtitleUrl = null;
      }
    }

    const thumbnailPath = path.join(finalDir, 'thumbnail.jpg');
    const thumbnailSourcePath = burnedSubtitleUrl ? path.join(finalDir, 'final-burned-subtitles.mp4') : finalOutputUrl.endsWith('final-with-voice.mp4') ? path.join(finalDir, 'final-with-voice.mp4') : outPath;
    await runFfmpegThumbnail(thumbnailSourcePath, thumbnailPath);

    const manifest = {
      id: finalVideoId,
      contentPackageId: contentPackage.id,
      titleVi: contentPackage.titleVi,
      titleEn: contentPackage.titleEn,
      voiceProfileId: contentPackage.voiceProfileId || null,
      characterProfileId: contentPackage.characterProfileId || null,
      outputUrl: finalOutputUrl,
      subtitleUrl: `/runtime/${finalVideoId}/subtitles.srt`,
      transcriptUrl: `/runtime/${finalVideoId}/transcript.txt`,
      thumbnailUrl: `/runtime/${finalVideoId}/thumbnail.jpg`,
      scenes: orderedScenes.map((scene) => ({
        id: scene.id,
        sceneNumber: scene.sceneNumber,
        durationSec: scene.durationSec,
        onscreenTextVi: scene.onscreenTextVi,
        voiceoverVi: scene.voiceoverVi,
      })),
      createdAt: new Date().toISOString(),
    };
    fs.writeFileSync(path.join(finalDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
    fs.writeFileSync(path.join(finalDir, 'report.md'), buildFinalReport(contentPackage, orderedScenes, finalVideoId, finalOutputUrl), 'utf8');
    fs.writeFileSync(path.join(finalDir, 'bundle.html'), buildFinalBundleHtml(contentPackage, orderedScenes, finalVideoId, finalOutputUrl), 'utf8');

    const finalVideo = {
      id: finalVideoId,
      contentPackageId: contentPackage.id,
      status: 'done',
      outputUrl: finalOutputUrl,
      burnedSubtitleVideoUrl: burnedSubtitleUrl,
      subtitleUrl: `/runtime/${finalVideoId}/subtitles.srt`,
      transcriptUrl: `/runtime/${finalVideoId}/transcript.txt`,
      thumbnailUrl: `/runtime/${finalVideoId}/thumbnail.jpg`,
      manifestUrl: `/runtime/${finalVideoId}/manifest.json`,
      reportUrl: `/runtime/${finalVideoId}/report.md`,
      bundleUrl: `/runtime/${finalVideoId}/bundle.html`,
      durationSec: orderedScenes.reduce((sum, scene) => sum + (scene.durationSec || 0), 0),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const archivePath = path.join(runtimeDir, `${finalVideoId}.tar.gz`);
      await runTarGzBundle(finalDir, archivePath);
      finalVideo.archiveUrl = `/runtime/${finalVideoId}/bundle.tar.gz`;
      fs.copyFileSync(archivePath, path.join(finalDir, 'bundle.tar.gz'));
    } catch (error) {
      finalVideo.archiveUrl = null;
    }

    pipeline.finalVideos.unshift(finalVideo);
    contentPackage.status = 'stitched';
    contentPackage.updatedAt = new Date().toISOString();
    writeDb(db);
    res.json({ finalVideoId: finalVideo.id, status: finalVideo.status, finalVideo });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Stitch failed' });
  }
});

app.post('/api/viral-pipeline/run', auth, async (req, res) => {
  const db = readDb();
  const pipeline = getPipelineDb(db);

  const scan = {
    id: token(),
    country: req.body?.country || 'VN',
    language: req.body?.language || 'vi',
    platforms: req.body?.platforms || ['youtube', 'tiktok', 'facebook'],
    window: req.body?.window || '7d',
    format: req.body?.format || 'mixed',
    status: 'completed',
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  };

  const trendItems = await fetchRealTrendItems(scan.id, scan.country);
  const mainTopics = trendItems.length ? buildTopicsFromTrendItems(scan.id, trendItems) : buildMainTopics(scan.id);
  const platformRankings = trendItems.length ? buildPlatformRankings(scan.id, trendItems) : { youtube: [], facebook: [], tiktok: [] };
  const hybridPicks = buildHighViralHighMonetizationTopics(mainTopics);
  const recommendedTopics = mainTopics.slice(0, Number(req.body?.mainTopicLimit) || 5);
  const selectedTopic = recommendedTopics[0];
  const subtopics = buildSubtopics(selectedTopic.id, selectedTopic.name, Number(req.body?.subtopicLimit) || 20);
  const selectedSubtopic = subtopics[0];
  const defaultCharacter = (pipeline.characterProfiles || [])[0] || null;
  const defaultVoice = (pipeline.voiceProfiles || [])[0] || null;
  const contentPackage = buildContentPackage(selectedTopic, selectedSubtopic, { ...(req.body || {}), characterProfileId: req.body?.characterProfileId || defaultCharacter?.id || null, voiceProfileId: req.body?.voiceProfileId || defaultVoice?.id || 'voice-male-warm-deep' });
  const scenes = buildScenePrompts(contentPackage, selectedSubtopic, Number(req.body?.sceneDurationSec) || 8, defaultCharacter, defaultVoice);

  pipeline.scans.unshift(scan);
  pipeline.trendItems = [...trendItems, ...pipeline.trendItems].slice(0, 500);
  pipeline.mainTopics = [...mainTopics, ...pipeline.mainTopics].slice(0, 100);
  pipeline.platformRankings = platformRankings;
  pipeline.hybridPicks = hybridPicks;
  pipeline.subtopics = [...subtopics, ...pipeline.subtopics].slice(0, 500);
  pipeline.contentPackages.unshift(contentPackage);
  pipeline.scenePrompts = [...scenes, ...pipeline.scenePrompts].slice(0, 2000);
  writeDb(db);

  res.json({
    scan,
    trendItems: trendItems.slice(0, 20),
    recommendedTopics,
    platformRankings,
    hybridPicks,
    characterProfiles: pipeline.characterProfiles || [],
    voiceProfiles: pipeline.voiceProfiles || [],
    voiceJobs: pipeline.voiceJobs || [],
    selectedTopic,
    subtopics,
    selectedSubtopic,
    contentPackage,
    scenes,
    nextActions: ['render-scenes', 'approve-scenes', 'stitch-final-video'],
  });
});

app.listen(port, () => {
  console.log(`Viral Video Studio API listening on http://localhost:${port}`);
});
