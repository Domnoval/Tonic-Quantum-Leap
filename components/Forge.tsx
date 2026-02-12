import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  type ForgeMode,
  type Intensity,
  type SourceImage,
  type GeneratedImage,
  checkConnection,
  generate,
} from '../services/comfyuiService';

// ---------------------------------------------------------------------------
// Void archive (180+ images)
// ---------------------------------------------------------------------------

const VOID_IMAGE_NAMES = [
  '20200622_080827.jpg', '20200627_172054.jpg', '20200828_171533.jpg', '20201219_160203.jpg',
  '20210409_104713.jpg', '20210526_002930~2.jpg', '20210526_013054~2.jpg', '20210527_213252~2.jpg',
  '20210614_125945.jpg', '20210614_125956.jpg', '20210614_130005.jpg', '20210614_131004.jpg',
  '20210614_131034.jpg', '20210614_131133.jpg', '20210716_211711~2.jpg', '20210717_121754~2.jpg',
  '20210725_003705~2.jpg', '20210725_004225~3.jpg', '20210726_022016~2.jpg', '20210808_040241~2.jpg',
  '20211220_135625.jpg', '20211224_234341~2.jpg', '20220114_133722.jpg', '20220115_164435~3.jpg',
  '20220115_164443~2.jpg', '20220115_232809~2.jpg', '20220120_210854~3.jpg', '20220204_210509~4.jpg',
  '20220217_020700~3.jpg', '20220323_005215.jpg', '20220329_104327~3.jpg', '20220329_214711~2.jpg',
  '20220329_214716~2.jpg', '20220329_214859~2.jpg', '20220329_215355~2.jpg', '20220329_220922~2.jpg',
  '20220401_112733~3.jpg', '20220401_112825~2.jpg', '20220416_162905.jpg', '20220419_170454~2.jpg',
  '20220419_183149~2.jpg', '20220611_184047.jpg', '20220620_170259.jpg', '20220620_170338~2.jpg',
  '20220624_114738.jpg', '20220831_201254~2.jpg', '20220908_083747.jpg', '20220909_004341~3.jpg',
  '20220917_182224~2.jpg', '20220917_182242~2.jpg', '20220917_184127~2.jpg', '20220918_155844.jpg',
  '20220922_200457~2.jpg', '20220922_200609~2.jpg', '20220922_200627~2.jpg', '20221005_044503.jpg',
  '20221005_190443~3.jpg', '20221102_125436~3.jpg', '20221108_170323.jpg', '20221113_082936.jpg',
  '20221122_045426.jpg', '20221123_130453.jpg', '20221126_163428.jpg', '20221127_084651~2.jpg',
  '20230103_064610~2.jpg', '20230110_025138~2.jpg', '20230110_025452~2.jpg', '20230110_025452~3.jpg',
  '20230110_025523.jpg', '20230110_025533.jpg', '20230211_062929~2.jpg', '20230219_075317.jpg',
  '20230311_131003.jpg', '20230311_131006.jpg', '20230316_063441.jpg', '20230430_132509~2.jpg',
  '20230501_152944~2.jpg', '20230515_214324.jpg', '20230709_015948~2.jpg', '20230713_102744.jpg',
  '20230720_232449.jpg', '20230720_232454.jpg', '20230720_232506.jpg', '20230820_113301~2.jpg',
  '20230820_113323~2.jpg', '20230820_113332~2.jpg', '20230824_125040~2.jpg', '20230824_125216~2.jpg',
  '20230826_004354~2.jpg', '20230826_005653~2.jpg', '20230910_140007~2.jpg', '20230915_132458.jpg',
  '20231003_083845~2.jpg', '20231018_111557~3.jpg', '20240905_131338.jpg', '20241015_143030~4.jpg',
  '20241024_160102~2.jpg', '20241119_140949.jpg', '20241119_141004.jpg', '20241119_141009.jpg',
  '20241119_141538.jpg', '20241120_120937.jpg', '20241120_120946.jpg', '20241120_121329.jpg',
  '20241120_121408.jpg', '20241120_121522.jpg', '20241120_121544.jpg', '20241120_121549.jpg',
  '20241130_113308.jpg', '20241201_090017.jpg', '20241205_194047~2.jpg', '20241208_113707.jpg',
  '20241208_130547.jpg', '20250114_211755.jpg', '20250310_100721.jpg', '20250310_100730.jpg',
  '20250310_100750.jpg', '20250316_012316~3.jpg', '20250322_173418.jpg', '20250324_223305.jpg',
  '20250402_151037~2.jpg', '20250407_135650~2.jpg', '20250423_154351.jpg', '20250423_154444.jpg',
  '20250423_154459.jpg', '20250425_231610.jpg', '20250425_231625.jpg', '20250425_231628.jpg',
  '20250502_115519.jpg', '20250520_121410~3.jpg', '20250621_141310.jpg', '20250621_141331.jpg',
  '20250621_141346.jpg', '20250621_141350.jpg', '20250711_000407~3.jpg', '20250808_145926~3.jpg',
  '20250820_221530.jpg', '20250820_225745.jpg', '20250820_225825.jpg', '20250914_103404~2.jpg',
  '20251013_170519~2.jpg', '20251119_203015.jpg', '20260102_153416.jpg',
  '4cbdea4d-2086-4daf-8037-4eead2a40742.jpg', '5fe56367-df91-4e59-b95a-b20a5f1e9d92.jpg',
  '666.jpg', '68a6ceba-2eb4-44b8-b58a-fa6b160fedb3_progress_image_63.jpg',
  '7a65adba-417f-4a86-b307-bc8435df1512~2.jpg', 'Big Boy 300 x.jpg', 'Big twin 102322 2.jpg',
  'cassetteboy_s.jpg', 'cheeze.jpg', 'dd9bf423-4591-4c3c-98e8-722de17e5954_progress_image_34.jpg',
  'Domnoval__3f9ff5b1-82f8-4282-a940-f16ad0925b0b.jpg', 'Domnoval__41ed0255-a072-41ef-a178-84de3acea361.jpg',
  'Domnoval__abs5ract_painting_of_a_bee_hive_bea0de25-302a-4a3b-ba6d-250154cff3d7.jpg',
  'Domnoval_A_scene_of_woman_wearing_a_pink_ski_mask_over_her_face_d1adf5a9-8ba5-4680-a47f-19a87ebe995a.jpg',
  'Domnoval_Collodion_printed_collage_style_poster__dadaism__moder_10806745-4460-48bd-8934-8af98123d42b~2.jpg',
  'Domnoval_None_9ebfcb0b-8a3f-4824-8afd-808841a7777f~3.jpg', 'Floral 3_s.jpg',
  'FRAMED painting maze copy.jpg', 'Graf Moon X.jpg', 'IMG_20210620_205945_123.jpg',
  'IMG_20210813_134736_052.jpg', 'IMG_20220115_010218_922.jpg', 'IMG_20220117_013211_045.jpg',
  'IMG_20220216_204219_530.jpg', 'IMG_20220327_102820_130.jpg', 'IMG_20220606_205822_219.jpg',
  'IMG_20220711_125207_811.jpg', 'IMG_20220729_202248_238.jpg', 'IMG_20220907_212327_846.jpg',
  'IMG_20220907_212327_860.jpg', 'IMG_20220907_212327_871.jpg', 'IMG_20220907_212327_881.jpg',
  'IMG_20230225_173629_101.jpg', 'IMG-20230106-WA0000.jpg', 'IMG-20241009-WA0005.jpg',
  'IMG-20241222-WA0003.jpg', 'inverted 3_s.jpg', 'Manyfaceddog_s.jpg', 'My Lucky day.jpg',
  'Neon Rabbit 102422 cropped copy.jpg', 'Neon Transendence.jpg', 'NH ROB FRI 28.jpeg',
  'Notes_230107_151831_eef.jpg', 'Painting_3_image.jpg', 'Painting_SadRobotv2_image.jpg',
  'PSX_20220203_142605.jpg', 'PSX_20220310_121650~3.jpg', 'PSX_20220406_054348.jpg',
  'PSX_20220426_145213~2.jpg', 'PSX_20220731_171128.jpg', 'PSX_20221230_162556.jpg',
  'Repent 300 2 x.jpg', 'Sadrobotv2_s copy.jpg', 'scary man copy.jpg',
  'Screenshot 2022-07-14 100503.jpg', 'Screenshot 2023-03-182337885205141708692~2.jpg',
  'Screenshot 2024-06-21 071753.jpg', 'Screenshot 2024-07-16 203539.jpg',
  'Screenshot 2024-10-13 092752.jpg', 'Screenshot 2024-11-29 082718.jpg',
  'Screenshot 2024-12-21 154808.jpg', 'Screenshot 2024-12-22 103235.jpg',
  'Screenshot 2024-12-22 120716.jpg', 'Screenshot 2025-01-14 044337.jpg',
  'Screenshot 2025-03-31 171659.jpg', 'Screenshot_20211130-171203_Photos.jpg',
  'Screenshot_20230417_092033.jpg', 'Screenshot_20230422_100730.jpg',
  'Screenshot_20230515_092921.jpg', 'Screenshot_20230515_093001.jpg',
  'Screenshot_20230821_093449.jpg', 'Screenshot_20230825_011052.jpg',
  'Screenshot_20231205_074452.jpg', 'Screenshot_20240217_081021_Creative Cloud.jpg',
  'Screenshot_20240528_060716.jpg', 'shop poster 1 lil.jpg',
  'SmartSelect_20200111-142651_Photos.jpg', 'THE MADNESS AND ARCITEXY (1).jpeg',
  'THE MADNESS AND ARCITEXY.jpeg', 'Tophat 102422 cropped copy.jpg', 'Untitled-1.jpg', 'Untitled-3.jpg',
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MODE_LABELS: Record<ForgeMode, string> = {
  reimagine: 'Reimagine',
  style: 'Style Transfer',
  blend: 'Blend',
};

const MODE_DESCRIPTIONS: Record<ForgeMode, string> = {
  reimagine: 'Transform a Void piece with your prompt',
  style: 'Use art as style reference for a new creation',
  blend: 'Fuse multiple pieces into one',
};

const INTENSITY_LABELS: Record<Intensity, string> = {
  subtle: 'Subtle',
  medium: 'Medium',
  wild: 'Wild',
  chaos: 'Chaos',
};

const MAX_SOURCES: Record<ForgeMode, number> = {
  reimagine: 1,
  style: 1,
  blend: 4,
};

let _idCounter = 0;
function uid(): string {
  return `forge_${Date.now()}_${++_idCounter}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ForgeProps {
  themeColor?: string;
}

const Forge: React.FC<ForgeProps> = () => {
  // -- State --
  const [mode, setMode] = useState<ForgeMode>('reimagine');
  const [sourceImages, setSourceImages] = useState<SourceImage[]>([]);
  const [prompt, setPrompt] = useState('');
  const [intensity, setIntensity] = useState<Intensity>('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationTime, setGenerationTime] = useState(0);
  const [result, setResult] = useState<GeneratedImage | null>(null);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [comfyStatus, setComfyStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [showVoidPicker, setShowVoidPicker] = useState(false);
  const [voidSearch, setVoidSearch] = useState('');
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // -- Check ComfyUI on mount --
  useEffect(() => {
    let mounted = true;
    const check = async () => {
      setComfyStatus('checking');
      const ok = await checkConnection();
      if (mounted) setComfyStatus(ok ? 'connected' : 'disconnected');
    };
    check();
    const iv = setInterval(check, 30_000);
    return () => { mounted = false; clearInterval(iv); };
  }, []);

  // -- Timer for generation elapsed --
  useEffect(() => {
    if (isGenerating) {
      setGenerationTime(0);
      timerRef.current = setInterval(() => setGenerationTime(t => t + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isGenerating]);

  // -- Handlers --

  const addVoidImage = useCallback((name: string) => {
    const max = MAX_SOURCES[mode];
    setSourceImages(prev => {
      if (prev.length >= max) return prev;
      if (prev.some(s => s.src === `/void/${name}`)) return prev;
      return [...prev, { id: uid(), src: `/void/${name}`, name, type: 'void' as const }];
    });
  }, [mode]);

  const removeSource = useCallback((id: string) => {
    setSourceImages(prev => prev.filter(s => s.id !== id));
  }, []);

  const handleUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const max = MAX_SOURCES[mode];
    setSourceImages(prev => {
      if (prev.length >= max) return prev;
      const url = URL.createObjectURL(file);
      return [...prev, { id: uid(), src: url, name: file.name, type: 'upload' as const }];
    });
    e.target.value = '';
  }, [mode]);

  const handleGenerate = useCallback(async () => {
    if (comfyStatus !== 'connected') {
      setError('ComfyUI is not running. Start it at http://127.0.0.1:8188');
      return;
    }
    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const gen = await generate(
        { mode, sourceImages, prompt, intensity },
        (elapsed) => setGenerationTime(elapsed),
      );
      setResult(gen);
      setHistory(prev => [gen, ...prev].slice(0, 10));
    } catch (err: any) {
      console.error('Forge error:', err);
      setError(err.message || 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  }, [mode, sourceImages, prompt, intensity, comfyStatus]);

  const handleDownload = useCallback(async () => {
    if (!result) return;
    try {
      const res = await fetch(result.src);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `forge_${result.id}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { /* ignore */ }
  }, [result]);

  // Filtered void images for picker search
  const filteredVoid = voidSearch
    ? VOID_IMAGE_NAMES.filter(n => n.toLowerCase().includes(voidSearch.toLowerCase()))
    : VOID_IMAGE_NAMES;

  // What to show in the big preview
  const previewSrc = result?.src ?? (sourceImages.length > 0 ? sourceImages[0].src : null);

  // -- Status dot color --
  const statusColor = comfyStatus === 'connected' ? '#22c55e'
    : comfyStatus === 'disconnected' ? '#ef4444' : '#eab308';

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-black pt-20 md:pt-28 pb-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">

        {/* ── Header ── */}
        <div className="mb-6 md:mb-8">
          <h1 className="serif text-3xl md:text-5xl text-white italic mb-1">The Forge</h1>
          <p
            className="mono text-[9px] md:text-[10px] uppercase tracking-[0.25em]"
            style={{ color: 'rgba(var(--theme-rgb), 1)' }}
          >
            Transmute the void
          </p>
        </div>

        {/* ── Mode Tabs ── */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 -mx-1 px-1">
          {(Object.keys(MODE_LABELS) as ForgeMode[]).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setSourceImages([]); setResult(null); setError(null); }}
              className="flex-shrink-0 px-4 py-2.5 border transition-all text-left min-h-[48px]"
              style={{
                borderColor: mode === m ? 'rgba(var(--theme-rgb), 0.6)' : 'rgba(255,255,255,0.1)',
                backgroundColor: mode === m ? 'rgba(var(--theme-rgb), 0.1)' : 'transparent',
              }}
            >
              <span
                className="mono text-[11px] md:text-xs uppercase tracking-wider block"
                style={{ color: mode === m ? 'rgba(var(--theme-rgb), 1)' : 'rgba(255,255,255,0.7)' }}
              >
                {MODE_LABELS[m]}
              </span>
              <span className="text-white/30 text-[9px] block mt-0.5 hidden md:block">
                {MODE_DESCRIPTIONS[m]}
              </span>
            </button>
          ))}
        </div>

        {/* ── Preview Area ── */}
        <div
          className="border border-white/10 bg-black/50 mb-4 relative overflow-hidden"
          style={{ minHeight: 320 }}
        >
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center h-80">
              <div
                className="w-12 h-12 border-2 rounded-full animate-spin mb-4"
                style={{ borderColor: 'rgba(var(--theme-rgb), 0.3)', borderTopColor: 'rgba(var(--theme-rgb), 1)' }}
              />
              <span className="mono text-xs uppercase tracking-widest" style={{ color: 'rgba(var(--theme-rgb), 1)' }}>
                Forging… {generationTime}s
              </span>
            </div>
          ) : previewSrc ? (
            <img
              src={previewSrc}
              alt="Preview"
              className="w-full max-h-[500px] object-contain cursor-pointer"
              onClick={() => setLightboxSrc(previewSrc)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-80 text-center">
              <div
                className="w-16 h-16 border border-white/20 rounded-full flex items-center justify-center mb-4"
                style={{ borderColor: 'rgba(var(--theme-rgb), 0.3)' }}
              >
                <span className="text-2xl opacity-30">⬡</span>
              </div>
              <p className="mono text-[10px] uppercase tracking-widest text-white/30">
                Select source material to begin
              </p>
            </div>
          )}

          {/* Download / Share overlay on result */}
          {result && !isGenerating && (
            <div className="absolute top-3 right-3 flex gap-2">
              <button
                onClick={handleDownload}
                className="px-3 py-1.5 bg-black/70 border border-white/20 mono text-[9px] uppercase tracking-wider text-white/70 hover:text-white hover:border-white/40 transition-colors"
              >
                ↓ Download
              </button>
            </div>
          )}
        </div>

        {/* ── Source Thumbnails ── */}
        <div className="mb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {sourceImages.map(src => (
              <div
                key={src.id}
                className="relative flex-shrink-0 w-16 h-16 border border-white/20 overflow-hidden group cursor-pointer"
                onClick={() => removeSource(src.id)}
              >
                <img src={src.src} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="mono text-[8px] text-white">✕</span>
                </div>
              </div>
            ))}

            {sourceImages.length < MAX_SOURCES[mode] && (
              <>
                <button
                  onClick={() => setShowVoidPicker(true)}
                  className="flex-shrink-0 w-16 h-16 border border-dashed border-white/20 flex flex-col items-center justify-center gap-1 hover:border-white/40 transition-colors min-h-[48px]"
                >
                  <span className="text-white/40 text-lg">+</span>
                  <span className="mono text-[7px] uppercase text-white/30">Void</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-shrink-0 w-16 h-16 border border-dashed border-white/20 flex flex-col items-center justify-center gap-1 hover:border-white/40 transition-colors min-h-[48px]"
                >
                  <span className="text-white/40 text-lg">↑</span>
                  <span className="mono text-[7px] uppercase text-white/30">Upload</span>
                </button>
              </>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        </div>

        {/* ── Prompt ── */}
        <div className="mb-4">
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Describe your vision…"
            rows={1}
            className="w-full bg-black border border-white/20 px-4 py-3 mono text-sm text-white resize-none focus:border-white/40 focus:outline-none placeholder-white/20"
            onInput={(e) => {
              const el = e.target as HTMLTextAreaElement;
              el.style.height = 'auto';
              el.style.height = el.scrollHeight + 'px';
            }}
          />
        </div>

        {/* ── Intensity ── */}
        <div className="mb-5">
          <span className="mono text-[9px] uppercase tracking-widest text-white/40 block mb-2">
            Intensity
          </span>
          <div className="flex gap-2">
            {(Object.keys(INTENSITY_LABELS) as Intensity[]).map(i => (
              <button
                key={i}
                onClick={() => setIntensity(i)}
                className="flex-1 py-2.5 border mono text-[10px] uppercase tracking-wider transition-all min-h-[44px]"
                style={{
                  borderColor: intensity === i ? 'rgba(var(--theme-rgb), 0.6)' : 'rgba(255,255,255,0.1)',
                  backgroundColor: intensity === i ? 'rgba(var(--theme-rgb), 0.1)' : 'transparent',
                  color: intensity === i ? 'rgba(var(--theme-rgb), 1)' : 'rgba(255,255,255,0.5)',
                }}
              >
                {INTENSITY_LABELS[i]}
              </button>
            ))}
          </div>
        </div>

        {/* ── Generate Button ── */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || comfyStatus !== 'connected'}
          className="w-full py-4 border mono text-sm uppercase tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed mb-6 min-h-[52px]"
          style={{
            borderColor: isGenerating ? 'rgba(var(--theme-rgb), 0.5)' : 'rgba(var(--theme-rgb), 0.4)',
            backgroundColor: isGenerating ? 'transparent' : 'rgba(var(--theme-rgb), 0.1)',
            color: 'rgba(var(--theme-rgb), 1)',
          }}
        >
          {isGenerating ? `Forging… ${generationTime}s` : '✦ FORGE'}
        </button>

        {/* ── Error ── */}
        {error && (
          <div className="mb-4 p-3 border border-red-500/30 bg-red-500/10">
            <span className="mono text-[10px] uppercase tracking-wider text-red-400">{error}</span>
          </div>
        )}

        {/* ── History Strip ── */}
        {history.length > 0 && (
          <div className="mb-6">
            <span className="mono text-[9px] uppercase tracking-widest text-white/40 block mb-2">
              Recent Generations
            </span>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {history.slice(0, 6).map(h => (
                <div
                  key={h.id}
                  className="flex-shrink-0 w-20 h-20 border border-white/10 overflow-hidden cursor-pointer hover:border-white/30 transition-colors"
                  onClick={() => { setResult(h); setLightboxSrc(h.src); }}
                >
                  <img src={h.src} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Status Bar ── */}
        <div className="flex items-center gap-2 py-3 border-t border-white/10">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColor }} />
          <span className="mono text-[9px] uppercase tracking-wider text-white/40">
            {comfyStatus === 'connected' ? 'ComfyUI Connected'
              : comfyStatus === 'checking' ? 'Checking ComfyUI…'
              : 'ComfyUI Disconnected'}
          </span>
          {isGenerating && (
            <span className="mono text-[9px] uppercase tracking-wider ml-auto" style={{ color: 'rgba(var(--theme-rgb), 1)' }}>
              Generating ({generationTime}s)
            </span>
          )}
        </div>
      </div>

      {/* ── Void Picker (slide-up panel) ── */}
      {showVoidPicker && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center"
          onClick={() => setShowVoidPicker(false)}
        >
          <div
            className="w-full max-w-4xl h-[80vh] bg-black border-t border-white/20 rounded-t-xl overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div className="flex-shrink-0 pt-3 pb-2 px-4">
              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-3" />
              <div className="flex items-center justify-between mb-3">
                <h3 className="mono text-xs uppercase tracking-widest" style={{ color: 'rgba(var(--theme-rgb), 1)' }}>
                  Void Archive
                </h3>
                <button
                  onClick={() => setShowVoidPicker(false)}
                  className="mono text-[10px] uppercase tracking-widest text-white/40 hover:text-white p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
              <input
                type="text"
                value={voidSearch}
                onChange={e => setVoidSearch(e.target.value)}
                placeholder="Search…"
                className="w-full bg-white/5 border border-white/10 px-3 py-2 mono text-xs text-white focus:outline-none focus:border-white/30 placeholder-white/20"
              />
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-4 pt-2">
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                {filteredVoid.map(name => {
                  const selected = sourceImages.some(s => s.src === `/void/${name}`);
                  return (
                    <div
                      key={name}
                      onClick={() => {
                        if (selected) {
                          setSourceImages(prev => prev.filter(s => s.src !== `/void/${name}`));
                        } else {
                          addVoidImage(name);
                        }
                      }}
                      className="relative aspect-square cursor-pointer overflow-hidden border-2 transition-all active:scale-95"
                      style={{
                        borderColor: selected ? 'rgba(var(--theme-rgb), 1)' : 'transparent',
                      }}
                    >
                      <img src={`/void/${name}`} alt="" className="w-full h-full object-cover" loading="lazy" />
                      {selected && (
                        <div
                          className="absolute inset-0 flex items-center justify-center"
                          style={{ backgroundColor: 'rgba(var(--theme-rgb), 0.3)' }}
                        >
                          <span className="mono text-sm font-bold text-white">
                            {sourceImages.findIndex(s => s.src === `/void/${name}`) + 1}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 p-4 border-t border-white/10">
              <button
                onClick={() => setShowVoidPicker(false)}
                className="w-full py-3 mono text-xs uppercase tracking-widest min-h-[48px]"
                style={{
                  backgroundColor: 'rgba(var(--theme-rgb), 0.15)',
                  border: '1px solid rgba(var(--theme-rgb), 0.4)',
                  color: 'rgba(var(--theme-rgb), 1)',
                }}
              >
                Done ({sourceImages.length}/{MAX_SOURCES[mode]})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Lightbox ── */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightboxSrc(null)}
        >
          <img src={lightboxSrc} alt="" className="max-w-full max-h-full object-contain" />
          <button className="absolute top-4 right-4 mono text-white/50 hover:text-white text-lg min-h-[48px] min-w-[48px] flex items-center justify-center">
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default Forge;
