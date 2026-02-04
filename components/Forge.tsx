import React, { useState, useRef, useEffect } from 'react';
import PurchaseModal from './PurchaseModal';

type ForgeMode = 'style' | 'remix' | 'inpaint' | 'mashup' | 'collage';

interface ForgePreselection {
  image?: string;
  mode?: 'style' | 'remix' | 'inpaint' | 'mashup';
}

interface ForgeProps {
  themeColor: string;
  preselection?: ForgePreselection | null;
  onClearPreselection?: () => void;
}

interface VoidImage {
  src: string;
  name: string;
}

// Full Void archive
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

const VOID_IMAGES: VoidImage[] = VOID_IMAGE_NAMES.map((name, i) => ({
  src: `/void/${name}`,
  name: `Transmission ${String(i + 1).padStart(3, '0')}`,
}));

const MODE_INFO: Record<ForgeMode, { name: string; description: string; icon: string }> = {
  style: {
    name: 'Style Alchemy',
    description: 'Use Void art as style reference + your prompt = new creation',
    icon: '⚗️',
  },
  remix: {
    name: 'Corruption',
    description: 'Mutate and transform a Void piece with AI guidance',
    icon: '🌀',
  },
  inpaint: {
    name: 'The Surgeon',
    description: 'Paint a mask, prompt what fills it',
    icon: '🔪',
  },
  mashup: {
    name: 'Fusion',
    description: 'Blend multiple Void pieces into one',
    icon: '⚡',
  },
  collage: {
    name: 'Manual Collage',
    description: 'Layer and compose without AI',
    icon: '🎨',
  },
};

const MODE_GUIDANCE: Record<ForgeMode, { steps: string[]; tip: string }> = {
  style: {
    steps: [
      'Select 1-3 Void pieces as style references',
      'Describe what you want to create',
      'Adjust creativity level (higher = more deviation)',
      'Hit Forge to generate your creation',
    ],
    tip: 'The AI extracts visual essence from your selections and applies it to your prompt. Try mixing contrasting styles!',
  },
  remix: {
    steps: [
      'Select a single Void piece to transform',
      'Describe how you want it changed',
      'Use creativity slider to control mutation intensity',
      'Forge it into something new',
    ],
    tip: 'Lower creativity keeps more of the original. Higher creativity allows wilder mutations.',
  },
  inpaint: {
    steps: [
      'Select an image to edit',
      'Paint over the area you want to change',
      'Describe what should fill that space',
      'Forge to seamlessly replace the masked area',
    ],
    tip: 'Use a larger brush for big areas, smaller for details. The AI blends edges automatically.',
  },
  mashup: {
    steps: [
      'Select 2-4 Void pieces to blend',
      'Optionally add a guiding prompt',
      'Adjust chaos level for blend intensity',
      'Forge to fuse them into one piece',
    ],
    tip: 'The chaos slider controls how wildly the images blend. Low = subtle merge, High = fever dream.',
  },
  collage: {
    steps: [
      'Select images to add to your canvas',
      'Drag, resize, and layer them',
      'No AI involved — pure manual composition',
      'Export when satisfied',
    ],
    tip: 'This mode is for hands-on creators who want full control without AI intervention.',
  },
};

const Forge: React.FC<ForgeProps> = ({ themeColor, preselection, onClearPreselection }) => {
  const [mode, setMode] = useState<ForgeMode>('style');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [prompt, setPrompt] = useState('');
  const [creativity, setCreativity] = useState(50);
  const [chaos, setChaos] = useState(30);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [transmissionNumber, setTransmissionNumber] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showVoidPicker, setShowVoidPicker] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showPreselectionToast, setShowPreselectionToast] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<{ remaining: number; limit: number } | null>(null);
  const [showRateLimitWarning, setShowRateLimitWarning] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(30);

  // Handle preselection from Void
  useEffect(() => {
    if (preselection?.image) {
      setSelectedImages([preselection.image]);
      if (preselection.mode) {
        setMode(preselection.mode);
      }
      setShowPreselectionToast(true);
      // Clear the preselection after applying
      onClearPreselection?.();
      // Auto-hide toast after 3 seconds
      setTimeout(() => setShowPreselectionToast(false), 3000);
    }
  }, [preselection, onClearPreselection]);

  // Handle image selection
  const toggleImageSelection = (src: string) => {
    const maxSelections = mode === 'mashup' ? 4 : mode === 'style' ? 3 : 1;

    if (selectedImages.includes(src)) {
      setSelectedImages(prev => prev.filter(s => s !== src));
    } else if (selectedImages.length < maxSelections) {
      setSelectedImages(prev => [...prev, src]);
    }
  };

  // Canvas drawing for inpaint mode - supports both mouse and touch
  const getCanvasCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (mode !== 'inpaint') return;
    e.preventDefault();
    setIsDrawing(true);
    drawAt(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const drawAt = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing || mode !== 'inpaint') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCanvasCoordinates(e);
    if (!coords) return;

    ctx.fillStyle = 'rgba(var(--theme-rgb), 0.5)';
    ctx.beginPath();
    ctx.arc(coords.x, coords.y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;
    e.preventDefault();
    drawAt(e);
  };

  // Get mask data from canvas for inpaint mode
  const getMaskData = (): string | undefined => {
    if (mode !== 'inpaint' || !canvasRef.current) return undefined;
    return canvasRef.current.toDataURL('image/png');
  };

  // Convert image URL to base64 data URI
  const imageToBase64 = async (src: string): Promise<string> => {
    const response = await fetch(src);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Generate image via Forge API
  const handleGenerate = async () => {
    if (selectedImages.length === 0) return;
    if (mode === 'collage') return; // Collage mode doesn't use AI

    setIsGenerating(true);
    setError(null);

    try {
      // Convert images to base64 so Replicate doesn't need to fetch from our server
      const base64Images = await Promise.all(
        selectedImages.map(src => imageToBase64(src))
      );

      const response = await fetch('/api/forge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode,
          sourceImages: base64Images,
          prompt,
          creativity,
          chaos,
          mask: getMaskData(),
        }),
      });

      // Safely parse JSON with error handling
      let data;
      const responseText = await response.text();
      try {
        data = responseText ? JSON.parse(responseText) : {};
        console.log('Forge API response:', data);
      } catch (parseError) {
        console.error('JSON parse error:', parseError, 'Raw response:', responseText.substring(0, 500));
        throw new Error('Server returned invalid response. Please try again.');
      }

      if (!response.ok) {
        // Handle rate limit specifically
        if (response.status === 429) {
          setShowRateLimitWarning(true);
          throw new Error(data.message || 'Daily limit reached');
        }
        throw new Error(data.message || data.error || 'Generation failed');
      }

      setGeneratedImage(data.resultUrl);
      setTransmissionNumber(data.transmissionNumber);
      
      // Update rate limit info
      if (data.remaining !== undefined) {
        setRateLimitInfo({ remaining: data.remaining, limit: data.limit });
        if (data.remaining <= 2) {
          setShowRateLimitWarning(true);
          setTimeout(() => setShowRateLimitWarning(false), 5000);
        }
      }
    } catch (err: any) {
      console.error('Forge generation error:', err);
      setError(err.message || 'Transmission failed. Check your connection.');
      // Fallback to showing source image in dev mode
      if (import.meta.env.DEV) {
        setGeneratedImage(selectedImages[0]);
        setTransmissionNumber(Math.floor(Math.random() * 100000));
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const clearSelection = () => {
    setSelectedImages([]);
    setGeneratedImage(null);
    setTransmissionNumber(null);
    setError(null);
    setPrompt('');
  };

  return (
    <div className="min-h-screen bg-black pt-20 md:pt-28 pb-20 px-4 md:px-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6 md:mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="serif text-3xl md:text-5xl text-white italic mb-1 md:mb-2">The Forge</h1>
            <p
              className="mono text-[9px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em]"
              style={{ color: 'rgba(var(--theme-rgb), 1)' }}
            >
              Transmute Void artifacts into new creations
            </p>
          </div>
          <div className="flex items-center gap-3">
            {rateLimitInfo && (
              <div className="hidden md:flex items-center gap-2 px-3 py-2 border border-white/10 bg-black/30">
                <span className="mono text-[9px] uppercase tracking-wider text-white/40">
                  Transmissions:
                </span>
                <span 
                  className="mono text-[10px] font-bold"
                  style={{ color: rateLimitInfo.remaining <= 2 ? '#ff6b6b' : 'rgba(var(--theme-rgb), 1)' }}
                >
                  {rateLimitInfo.remaining}/{rateLimitInfo.limit}
                </span>
              </div>
            )}
            <button
              onClick={() => setShowHelpModal(true)}
              className="mono text-[10px] uppercase tracking-wider px-3 py-2 border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all flex items-center gap-2"
            >
              <span>?</span>
              <span className="hidden md:inline">How It Works</span>
            </button>
          </div>
        </div>

        {/* Quick Process Overview */}
        <div className="mt-4 md:mt-6 p-4 border border-white/10 bg-black/30">
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center mono text-xs">1</div>
              <div>
                <p className="mono text-[10px] uppercase tracking-wider text-white/80">Choose Mode</p>
                <p className="mono text-[8px] text-white/40">Select your transmutation type</p>
              </div>
            </div>
            <div className="hidden md:block text-white/20">→</div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center mono text-xs">2</div>
              <div>
                <p className="mono text-[10px] uppercase tracking-wider text-white/80">Select Source</p>
                <p className="mono text-[8px] text-white/40">Pick Void pieces to work with</p>
              </div>
            </div>
            <div className="hidden md:block text-white/20">→</div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center mono text-xs">3</div>
              <div>
                <p className="mono text-[10px] uppercase tracking-wider text-white/80">Forge</p>
                <p className="mono text-[8px] text-white/40">Transmute into new creation</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Mode Selection & Controls */}
        <div className="lg:col-span-1 space-y-6">
          {/* Mode Selector */}
          <div className="border border-white/10 p-3 md:p-4 bg-black/50">
            <h3 className="mono text-[10px] uppercase tracking-widest text-white/40 mb-3 md:mb-4">
              Transmutation Mode
            </h3>
            {/* Horizontal scroll on mobile, stacked on desktop */}
            <div className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 -mx-3 px-3 lg:mx-0 lg:px-0 snap-x snap-mandatory lg:snap-none">
              {(Object.keys(MODE_INFO) as ForgeMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setMode(m);
                    clearSelection();
                  }}
                  className={`flex-shrink-0 w-[140px] lg:w-full text-left p-3 md:p-4 border transition-all snap-start active:scale-95 ${
                    mode === m
                      ? 'border-white/40 bg-white/5'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{MODE_INFO[m].icon}</span>
                    <span
                      className="mono text-[11px] md:text-xs uppercase tracking-wider"
                      style={{ color: mode === m ? 'rgba(var(--theme-rgb), 1)' : 'white' }}
                    >
                      {MODE_INFO[m].name}
                    </span>
                  </div>
                  <p className="text-white/40 text-[9px] md:text-[10px] mt-1 line-clamp-2 pl-6">
                    {MODE_INFO[m].description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Contextual Mode Guidance */}
          <div 
            className="border p-4 bg-black/30 transition-all duration-300"
            style={{ borderColor: 'rgba(var(--theme-rgb), 0.3)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{MODE_INFO[mode].icon}</span>
              <h3 
                className="mono text-[11px] uppercase tracking-wider"
                style={{ color: 'rgba(var(--theme-rgb), 1)' }}
              >
                {MODE_INFO[mode].name}
              </h3>
            </div>
            
            <div className="space-y-2 mb-4">
              {MODE_GUIDANCE[mode].steps.map((step, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span 
                    className="mono text-[9px] w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ 
                      borderColor: 'rgba(var(--theme-rgb), 0.5)',
                      color: 'rgba(var(--theme-rgb), 1)'
                    }}
                  >
                    {i + 1}
                  </span>
                  <span className="mono text-[10px] text-white/70">{step}</span>
                </div>
              ))}
            </div>

            <div 
              className="p-3 border-l-2 bg-white/5"
              style={{ borderColor: 'rgba(var(--theme-rgb), 0.5)' }}
            >
              <p className="mono text-[9px] text-white/50 leading-relaxed">
                <span style={{ color: 'rgba(var(--theme-rgb), 1)' }}>💡 TIP:</span> {MODE_GUIDANCE[mode].tip}
              </p>
            </div>
          </div>

          {/* Source Selection */}
          <div className="border border-white/10 p-4 bg-black/50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="mono text-[10px] uppercase tracking-widest text-white/40">
                Source Material ({selectedImages.length}/{mode === 'mashup' ? 4 : mode === 'style' ? 3 : 1})
              </h3>
              <button
                onClick={() => setShowVoidPicker(true)}
                className="mono text-[9px] uppercase tracking-wider px-3 py-1 border border-white/20 hover:border-white/40 transition-colors"
                style={{ color: 'rgba(var(--theme-rgb), 1)' }}
              >
                Browse Void
              </button>
            </div>

            {selectedImages.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {selectedImages.map((src, i) => (
                  <div
                    key={i}
                    className="relative aspect-square border border-white/20 overflow-hidden group cursor-pointer"
                    onClick={() => toggleImageSelection(src)}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="mono text-[9px] text-white">REMOVE</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="aspect-video border border-dashed border-white/20 flex items-center justify-center">
                <span className="mono text-[10px] text-white/30 uppercase">
                  Select source images
                </span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="border border-white/10 p-4 bg-black/50 space-y-4">
            <h3 className="mono text-[10px] uppercase tracking-widest text-white/40 mb-4">
              Parameters
            </h3>

            {/* Prompt */}
            {mode !== 'collage' && (
              <div>
                <label className="mono text-[9px] uppercase tracking-wider text-white/60 block mb-2">
                  Prompt
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your vision..."
                  className="w-full bg-black border border-white/20 p-3 mono text-sm text-white resize-none focus:border-white/40 focus:outline-none"
                  rows={3}
                />
              </div>
            )}

            {/* Creativity Slider */}
            {(mode === 'remix' || mode === 'style') && (
              <div>
                <div className="flex justify-between mb-2">
                  <label className="mono text-[9px] uppercase tracking-wider text-white/60">
                    Creativity
                  </label>
                  <span className="mono text-[9px]" style={{ color: 'rgba(var(--theme-rgb), 1)' }}>
                    {creativity}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={creativity}
                  onChange={(e) => setCreativity(Number(e.target.value))}
                  className="w-full accent-current"
                  style={{ accentColor: 'rgba(var(--theme-rgb), 1)' }}
                />
              </div>
            )}

            {/* Chaos Slider */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="mono text-[9px] uppercase tracking-wider text-white/60">
                  Chaos Level
                </label>
                <span className="mono text-[9px]" style={{ color: 'rgba(var(--theme-rgb), 1)' }}>
                  {chaos}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={chaos}
                onChange={(e) => setChaos(Number(e.target.value))}
                className="w-full"
                style={{ accentColor: 'rgba(var(--theme-rgb), 1)' }}
              />
            </div>

            {/* Brush Size (Inpaint mode) */}
            {mode === 'inpaint' && (
              <div>
                <div className="flex justify-between mb-2">
                  <label className="mono text-[9px] uppercase tracking-wider text-white/60">
                    Brush Size
                  </label>
                  <span className="mono text-[9px]" style={{ color: 'rgba(var(--theme-rgb), 1)' }}>
                    {brushSize}px
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-full"
                  style={{ accentColor: 'rgba(var(--theme-rgb), 1)' }}
                />
              </div>
            )}
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={selectedImages.length === 0 || isGenerating}
            className="w-full py-4 border border-white/20 mono text-sm uppercase tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:border-white/40"
            style={{
              backgroundColor: isGenerating ? 'transparent' : 'rgba(var(--theme-rgb), 0.1)',
              borderColor: isGenerating ? 'rgba(var(--theme-rgb), 0.5)' : undefined,
            }}
          >
            {isGenerating ? (
              <span className="animate-pulse" style={{ color: 'rgba(var(--theme-rgb), 1)' }}>
                Transmuting...
              </span>
            ) : (
              <span style={{ color: 'rgba(var(--theme-rgb), 1)' }}>
                Forge Transmission
              </span>
            )}
          </button>
        </div>

        {/* Right Panel - Canvas / Preview */}
        <div className="lg:col-span-2 order-first lg:order-last">
          <div className="border border-white/10 bg-black/50 p-3 md:p-4 h-full min-h-[300px] md:min-h-[500px] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="mono text-[10px] uppercase tracking-widest text-white/40">
                {generatedImage ? 'Transmission Result' : 'Preview'}
              </h3>
              {transmissionNumber && (
                <span
                  className="mono text-[10px] uppercase tracking-wider"
                  style={{ color: 'rgba(var(--theme-rgb), 1)' }}
                >
                  Transmission #{transmissionNumber}
                </span>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-4 p-3 border border-red-500/30 bg-red-500/10">
                <span className="mono text-[10px] uppercase tracking-wider text-red-400">
                  {error}
                </span>
              </div>
            )}

            <div className="flex-1 relative border border-white/10 overflow-hidden flex items-center justify-center bg-black/30">
              {mode === 'inpaint' && selectedImages.length > 0 ? (
                <div className="relative w-full h-full">
                  <img
                    src={selectedImages[0]}
                    alt=""
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                  <canvas
                    ref={canvasRef}
                    width={800}
                    height={600}
                    className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
                    onMouseDown={startDrawing}
                    onMouseUp={stopDrawing}
                    onMouseMove={draw}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchEnd={stopDrawing}
                    onTouchMove={draw}
                  />
                </div>
              ) : generatedImage ? (
                <img
                  src={generatedImage}
                  alt="Generated"
                  className="max-w-full max-h-full object-contain"
                />
              ) : selectedImages.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 p-8 w-full max-w-lg">
                  {selectedImages.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt=""
                      className="w-full aspect-square object-cover border border-white/20"
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center">
                  <div
                    className="w-16 h-16 mx-auto mb-4 border border-white/20 rounded-full flex items-center justify-center"
                    style={{ borderColor: 'rgba(var(--theme-rgb), 0.3)' }}
                  >
                    <span className="text-2xl opacity-30">⬡</span>
                  </div>
                  <p className="mono text-[10px] uppercase tracking-widest text-white/30">
                    Select source material to begin
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {generatedImage && (
              <div className="flex gap-4 mt-4">
                <button
                  onClick={handleGenerate}
                  className="flex-1 py-3 border border-white/20 mono text-[10px] uppercase tracking-widest hover:border-white/40 transition-colors"
                >
                  Regenerate
                </button>
                <button
                  onClick={() => setShowPurchaseModal(true)}
                  className="flex-1 py-3 mono text-[10px] uppercase tracking-widest transition-colors"
                  style={{
                    backgroundColor: 'rgba(245, 158, 11, 0.2)',
                    border: '1px solid rgba(245, 158, 11, 0.5)',
                    color: 'rgb(251, 191, 36)',
                  }}
                >
                  🖼️ Order Print
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Void Image Picker Modal */}
      {showVoidPicker && (
        <div
          className="fixed inset-0 z-50 bg-black/95 md:bg-black/90 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-8"
          onClick={() => setShowVoidPicker(false)}
        >
          <div
            className="w-full md:max-w-4xl h-[85vh] md:h-auto md:max-h-[80vh] overflow-auto border-t md:border border-white/20 bg-black p-4 md:p-6 rounded-t-2xl md:rounded-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile drag handle */}
            <div className="md:hidden w-12 h-1 bg-white/20 rounded-full mx-auto mb-4" />

            <div className="flex justify-between items-center mb-4 md:mb-6">
              <h3 className="mono text-xs md:text-sm uppercase tracking-widest" style={{ color: 'rgba(var(--theme-rgb), 1)' }}>
                The Void Archive
              </h3>
              <button
                onClick={() => setShowVoidPicker(false)}
                className="mono text-[10px] uppercase tracking-widest text-white/40 hover:text-white p-2 -mr-2"
              >
                [ Close ]
              </button>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3">
              {VOID_IMAGES.map((img, i) => (
                <div
                  key={i}
                  onClick={() => toggleImageSelection(img.src)}
                  className={`relative aspect-square cursor-pointer border-2 overflow-hidden transition-all active:scale-95 ${
                    selectedImages.includes(img.src)
                      ? 'border-white scale-95'
                      : 'border-transparent'
                  }`}
                  style={{
                    borderColor: selectedImages.includes(img.src)
                      ? 'rgba(var(--theme-rgb), 1)'
                      : undefined,
                  }}
                >
                  <img
                    src={img.src}
                    alt={img.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {selectedImages.includes(img.src) && (
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(var(--theme-rgb), 0.3)' }}
                    >
                      <span className="mono text-xs md:text-sm font-bold">
                        {selectedImages.indexOf(img.src) + 1}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Sticky footer for mobile */}
            <div className="sticky bottom-0 left-0 right-0 mt-4 md:mt-6 pt-4 bg-black border-t border-white/10 md:border-0 md:pt-0 flex justify-center md:justify-end">
              <button
                onClick={() => setShowVoidPicker(false)}
                className="w-full md:w-auto px-6 py-3 md:py-2 mono text-xs md:text-[10px] uppercase tracking-widest"
                style={{
                  backgroundColor: 'rgba(var(--theme-rgb), 0.2)',
                  border: '1px solid rgba(var(--theme-rgb), 0.5)',
                  color: 'rgba(var(--theme-rgb), 1)',
                }}
              >
                Confirm Selection ({selectedImages.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hover styles */}
      <style>{`
        input[type="range"] {
          -webkit-appearance: none;
          background: rgba(255, 255, 255, 0.1);
          height: 6px;
          border-radius: 3px;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 24px;
          height: 24px;
          background: rgba(var(--theme-rgb), 1);
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(var(--theme-rgb), 0.5);
        }
        @media (min-width: 768px) {
          input[type="range"] {
            height: 4px;
          }
          input[type="range"]::-webkit-slider-thumb {
            width: 16px;
            height: 16px;
          }
        }
        /* Hide scrollbar for mode selector on mobile */
        .overflow-x-auto::-webkit-scrollbar {
          display: none;
        }
        .overflow-x-auto {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Purchase Modal */}
      {generatedImage && transmissionNumber && (
        <PurchaseModal
          isOpen={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
          imageUrl={generatedImage}
          transmissionNumber={transmissionNumber}
        />
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          onClick={() => setShowHelpModal(false)}
        >
          <div 
            className="relative max-w-2xl w-full max-h-[85vh] overflow-y-auto bg-black border border-white/20 p-6 md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowHelpModal(false)}
              className="absolute top-4 right-4 mono text-[10px] uppercase tracking-wider text-white/40 hover:text-white transition-colors"
            >
              [ CLOSE ]
            </button>

            {/* Header */}
            <div className="mb-8">
              <h2 className="serif text-3xl text-white italic mb-2">How The Forge Works</h2>
              <p className="mono text-[10px] uppercase tracking-wider text-white/50">
                Transform Void artifacts into new creations using AI
              </p>
            </div>

            {/* Overview */}
            <div className="mb-8 p-4 border border-white/10 bg-white/5">
              <h3 className="mono text-xs uppercase tracking-wider mb-3" style={{ color: 'rgba(var(--theme-rgb), 1)' }}>
                The Concept
              </h3>
              <p className="text-white/70 text-sm leading-relaxed">
                The Forge is your portal to transmutation. Take any piece from The Void — paintings, 
                photographs, digital experiments — and transform it into something new. Use AI to 
                extract styles, mutate imagery, blend multiple pieces, or surgically edit specific areas.
              </p>
            </div>

            {/* Modes Detailed */}
            <div className="space-y-6">
              <h3 className="mono text-xs uppercase tracking-wider text-white/40 mb-4">
                Transmutation Modes
              </h3>

              {(Object.keys(MODE_INFO) as ForgeMode[]).map((m) => (
                <div key={m} className="border border-white/10 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xl">{MODE_INFO[m].icon}</span>
                    <div>
                      <h4 className="mono text-sm uppercase tracking-wider text-white">{MODE_INFO[m].name}</h4>
                      <p className="mono text-[10px] text-white/50">{MODE_INFO[m].description}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {MODE_GUIDANCE[m].steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="mono text-[8px] text-white/30">{i + 1}.</span>
                        <span className="mono text-[10px] text-white/60">{step}</span>
                      </div>
                    ))}
                  </div>

                  <p className="mono text-[9px] text-white/40 italic">
                    💡 {MODE_GUIDANCE[m].tip}
                  </p>
                </div>
              ))}
            </div>

            {/* Tips Section */}
            <div className="mt-8 p-4 border-l-2" style={{ borderColor: 'rgba(var(--theme-rgb), 0.5)' }}>
              <h3 className="mono text-xs uppercase tracking-wider mb-3" style={{ color: 'rgba(var(--theme-rgb), 1)' }}>
                Pro Tips
              </h3>
              <ul className="space-y-2 mono text-[10px] text-white/60">
                <li>• Start from The Void — hover any image and click "Forge This" to jump here with it pre-loaded</li>
                <li>• Experiment with the chaos slider — sometimes the wildest results are the most interesting</li>
                <li>• Be specific in your prompts — "a robot in a neon-lit alley" beats "something cool"</li>
                <li>• Try Style Alchemy with contrasting pieces — mix organic with geometric, dark with bright</li>
                <li>• Your creations can be purchased as prints once generated</li>
              </ul>
            </div>

            {/* Close CTA */}
            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full mt-8 py-3 border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all mono text-[11px] uppercase tracking-wider"
            >
              Got It — Let's Forge
            </button>
          </div>
        </div>
      )}

      {/* Preselection Toast */}
      {showPreselectionToast && (
        <div 
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-black/90 border animate-fade-in-up"
          style={{ borderColor: 'rgba(var(--theme-rgb), 0.6)' }}
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">⚡</span>
            <div>
              <p className="mono text-[10px] uppercase tracking-wider" style={{ color: 'rgba(var(--theme-rgb), 1)' }}>
                Image Loaded from Void
              </p>
              <p className="mono text-[8px] uppercase tracking-wider text-white/50 mt-0.5">
                Ready to transmute
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Rate Limit Warning */}
      {showRateLimitWarning && (
        <div 
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-6 py-4 bg-black/95 border border-red-500/50 animate-fade-in-up max-w-md"
        >
          <div className="flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="mono text-[11px] uppercase tracking-wider text-red-400 mb-1">
                {rateLimitInfo?.remaining === 0 ? 'Daily Limit Reached' : 'Running Low on Transmissions'}
              </p>
              <p className="mono text-[9px] text-white/60 leading-relaxed">
                {rateLimitInfo?.remaining === 0 
                  ? "You've used all your free transmissions for today. Come back tomorrow or grab some credits to keep forging!"
                  : `Only ${rateLimitInfo?.remaining} transmissions left today. Make them count!`
                }
              </p>
              {rateLimitInfo?.remaining === 0 && (
                <button
                  onClick={() => {
                    // Navigate to credits purchase - implement based on your routing
                    window.location.href = '/apothecary?credits=true';
                  }}
                  className="mt-3 px-4 py-2 mono text-[9px] uppercase tracking-wider bg-red-500/20 border border-red-500/50 hover:bg-red-500/30 transition-colors"
                  style={{ color: '#ff6b6b' }}
                >
                  Get More Transmissions
                </button>
              )}
            </div>
            <button
              onClick={() => setShowRateLimitWarning(false)}
              className="mono text-[9px] text-white/40 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Toast Animation */}
      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translate(-50%, 20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Forge;
