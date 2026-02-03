import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ThemeColor } from '../types';
import VoidItemCard from './VoidItemCard';

type ForgeMode = 'style' | 'remix' | 'inpaint' | 'mashup';

interface VoidProps {
  themeColor: ThemeColor;
  onNavigate?: (section: string, data?: any) => void;
}

interface VoidItem {
  id: string;
  type: 'image' | 'text' | 'video';
  content: string;
  size: 'small' | 'medium' | 'large';
  caption?: string;
}

// Local void images
const VOID_IMAGES = [
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

const CAPTIONS = [
  '137 // SIGNAL RECEIVED',
  'VOID TRANSMISSION',
  'MERKABA ONLINE',
  'FREQUENCY LOCKED',
  'AETHER DRIFT',
  'QUANTUM ENTANGLED',
  'SOLAR PEAK',
  'DENSITY PACKET',
  'NEURAL BRIDGE',
  'SIGNAL // NOISE',
  'KABBALAH = 137',
  'INFINITE RECEIVER',
];

// Shuffle array using Fisher-Yates
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const generateVoidContent = (): VoidItem[] => {
  const shuffledImages = shuffleArray(VOID_IMAGES);
  const sizes: ('small' | 'medium' | 'large')[] = ['small', 'small', 'medium', 'medium', 'large'];

  return shuffledImages.map((img, i) => ({
    id: `void-${i}`,
    type: 'image' as const,
    content: `/void/${img}`,
    size: sizes[Math.floor(Math.random() * sizes.length)],
    caption: Math.random() > 0.5 ? CAPTIONS[i % CAPTIONS.length] : undefined,
  }));
};

const Void: React.FC<VoidProps> = ({ themeColor, onNavigate }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const autoScrollRef = useRef<number | null>(null);
  const [lightboxImage, setLightboxImage] = useState<VoidItem | null>(null);

  const items = useMemo(() => generateVoidContent(), []);

  // Close lightbox on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxImage(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openLightbox = (item: VoidItem) => {
    setIsAutoScrolling(false);
    setLightboxImage(item);
  };

  const closeLightbox = () => {
    setLightboxImage(null);
    setTimeout(() => setIsAutoScrolling(true), 500);
  };

  // Handle Forge navigation with pre-selected image and mode
  const handleForge = (imageSrc: string, mode: ForgeMode) => {
    if (onNavigate) {
      onNavigate('forge', { 
        preselectedImage: imageSrc,
        preselectedMode: mode 
      });
    }
  };

  // Duplicate items for seamless infinite scroll
  const infiniteItems = useMemo(() => [...items, ...items, ...items], [items]);

  // Auto-scroll effect
  useEffect(() => {
    if (!isAutoScrolling) return;

    const scroll = () => {
      setScrollY(prev => {
        const newY = prev + 0.5;
        // Reset when we've scrolled through one set
        if (newY > items.length * 300) {
          return 0;
        }
        return newY;
      });
      autoScrollRef.current = requestAnimationFrame(scroll);
    };

    autoScrollRef.current = requestAnimationFrame(scroll);

    return () => {
      if (autoScrollRef.current) {
        cancelAnimationFrame(autoScrollRef.current);
      }
    };
  }, [isAutoScrolling, items.length]);

  // Pause auto-scroll on user interaction
  const handleMouseEnter = () => setIsAutoScrolling(false);
  const handleMouseLeave = () => setIsAutoScrolling(true);
  const handleWheel = (e: React.WheelEvent) => {
    setIsAutoScrolling(false);
    setScrollY(prev => Math.max(0, prev + e.deltaY * 0.5));
    // Resume auto-scroll after 3 seconds of no interaction
    setTimeout(() => setIsAutoScrolling(true), 3000);
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'large': return 'col-span-2 row-span-2';
      case 'medium': return 'col-span-1 row-span-2';
      default: return 'col-span-1 row-span-1';
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen w-full bg-black overflow-hidden pt-20 md:pt-28 pb-12"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onWheel={handleWheel}
    >
      {/* Header */}
      <div className="fixed top-16 md:top-24 left-0 right-0 z-30 px-4 md:px-12 py-3 md:py-4 bg-gradient-to-b from-black via-black/80 to-transparent">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="serif text-2xl md:text-4xl text-white italic">The Void</h2>
            <p
              className="mono text-[9px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] mt-1 md:mt-2"
              style={{ color: 'rgba(var(--theme-rgb), 1)' }}
            >
              Infinite Signal Stream
            </p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div
              className={`w-2 h-2 rounded-full ${isAutoScrolling ? 'animate-pulse' : ''}`}
              style={{ backgroundColor: 'rgba(var(--theme-rgb), 1)' }}
            />
            <span className="mono text-[9px] uppercase tracking-widest text-white/40">
              {isAutoScrolling ? 'AUTO_DRIFT' : 'MANUAL_CONTROL'}
            </span>
          </div>
        </div>
      </div>

      {/* Infinite Grid */}
      <div
        className="relative pt-16 md:pt-24 px-2 md:px-8"
        style={{ transform: `translateY(-${scrollY}px)` }}
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-4 auto-rows-[120px] md:auto-rows-[200px]">
          {infiniteItems.map((item, index) => (
            <VoidItemCard
              key={`${item.id}-${index}`}
              id={item.id}
              content={item.content}
              size={item.size}
              caption={item.caption}
              onView={() => openLightbox(item)}
              onForge={(mode) => handleForge(item.content, mode)}
            />
          ))}
        </div>
      </div>

      {/* Scanline Effect */}
      <div
        className="fixed inset-0 pointer-events-none z-20 opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)',
        }}
      />

      {/* Vignette */}
      <div className="fixed inset-0 pointer-events-none z-20 bg-[radial-gradient(circle_at_50%_50%,transparent_30%,rgba(0,0,0,0.8)_100%)]" />

      {/* Social Links Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-30 px-4 md:px-12 py-4 md:py-6 bg-gradient-to-t from-black via-black/80 to-transparent">
        <div className="flex justify-center gap-6 md:gap-8">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="void-link mono text-[9px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] text-white/40 transition-colors py-2"
          >
            Instagram
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="void-link mono text-[9px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] text-white/40 transition-colors py-2"
          >
            Twitter
          </a>
          <a
            href="https://tiktok.com"
            target="_blank"
            rel="noopener noreferrer"
            className="void-link mono text-[9px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] text-white/40 transition-colors py-2"
          >
            TikTok
          </a>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm cursor-zoom-out"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 md:top-6 md:right-6 mono text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors z-10 p-2 -m-2"
          >
            [ CLOSE ]
          </button>

          {/* Image container */}
          <div
            className="relative max-w-[90vw] max-h-[85vh] animate-lightbox-in"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxImage.content}
              alt=""
              className="max-w-full max-h-[85vh] object-contain"
              style={{ boxShadow: '0 0 60px rgba(var(--theme-rgb), 0.3)' }}
            />

            {/* Caption */}
            {lightboxImage.caption && (
              <div className="absolute -bottom-12 left-0 right-0 text-center">
                <span
                  className="mono text-[10px] uppercase tracking-widest"
                  style={{ color: 'rgba(var(--theme-rgb), 1)' }}
                >
                  {lightboxImage.caption}
                </span>
              </div>
            )}

            {/* Corner decorations */}
            <div
              className="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2"
              style={{ borderColor: 'rgba(var(--theme-rgb), 0.6)' }}
            />
            <div
              className="absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2"
              style={{ borderColor: 'rgba(var(--theme-rgb), 0.6)' }}
            />
          </div>

          {/* Scanlines on lightbox */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.02]"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)',
            }}
          />
        </div>
      )}

      {/* Theme-aware hover styles */}
      <style>{`
        .void-link:hover {
          color: rgba(var(--theme-rgb), 1);
        }
        @keyframes lightbox-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-lightbox-in {
          animation: lightbox-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Void;
