
import React, { useState } from 'react';
import { SACRED_GEOMETRY } from '../constants';

interface CalibrationGateProps {
  onCalibrate: () => void;
}

const CalibrationGate: React.FC<CalibrationGateProps> = ({ onCalibrate }) => {
  const [calibrated, setCalibrated] = useState(false);
  const [value, setValue] = useState(0);

  const handleCalibrate = () => {
    if (value > 90) {
      setCalibrated(true);
      setTimeout(onCalibrate, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#050505] flex flex-col items-center justify-center transition-opacity duration-1000">
      <div className={`w-64 h-64 md:w-96 md:h-96 text-white transition-all duration-500 ${calibrated ? 'opacity-0 scale-150 blur-xl' : 'opacity-100'}`}>
        <div className="relative w-full h-full flex items-center justify-center">
            <div className="absolute inset-0 animate-pulse-slow">
                {SACRED_GEOMETRY.flowerOfLife}
            </div>
            <div 
                className="absolute w-full h-full transition-transform duration-300"
                style={{ transform: `rotate(${value * 3.6}deg) scale(${0.5 + (value / 200)})`, opacity: value / 100 }}
            >
                {SACRED_GEOMETRY.metatron}
            </div>
        </div>
      </div>

      <div className={`mt-12 flex flex-col items-center gap-6 max-w-xs text-center transition-all ${calibrated ? 'opacity-0' : 'opacity-100'}`}>
        <p className="mono text-[10px] uppercase tracking-[0.4em] opacity-50">
          Adjust to your current resonance
        </p>
        
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={value}
          onChange={(e) => setValue(parseInt(e.target.value))}
          className="w-full h-1 bg-white/10 appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
        />

        <button 
          onClick={handleCalibrate}
          disabled={value < 90}
          className={`mono text-[11px] uppercase tracking-[0.5em] px-8 py-4 border transition-all duration-700 ${value >= 90 ? 'border-white opacity-100 hover:bg-white hover:text-black' : 'border-white/10 opacity-20 pointer-events-none'}`}
        >
          Enter the Nexus
        </button>
      </div>
      
      <div className="fixed bottom-12 text-[10px] mono opacity-20 tracking-widest uppercase">
        Tonic Thought Studios / 137 System
      </div>
    </div>
  );
};

export default CalibrationGate;
