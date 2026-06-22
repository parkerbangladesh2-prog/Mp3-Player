import React, { useState, useEffect, useRef } from "react";
import { Sliders, Activity, Disc, Sparkles } from "lucide-react";
import { EQ_PRESETS } from "../data/songs";
import { EqualizerPreset } from "../types";

interface EqualizerProps {
  isPlaying: boolean;
  activePreset: string;
  setActivePreset: (name: string) => void;
  bandValues: number[];
  setBandValues: (bands: number[]) => void;
}

const BANDS_LABEL = ["31", "62", "125", "250", "500", "1k", "2k", "4k", "8k", "16k"];

export default function Equalizer({
  isPlaying,
  activePreset,
  setActivePreset,
  bandValues,
  setBandValues,
}: EqualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const [customPresetSaved, setCustomPresetSaved] = useState<EqualizerPreset[]>([]);
  const [newPresetName, setNewPresetName] = useState("");

  // Preset changing
  const handlePresetSelect = (presetName: string) => {
    setActivePreset(presetName);
    const found = [...EQ_PRESETS, ...customPresetSaved].find((p) => p.name === presetName);
    if (found) {
      setBandValues([...found.bands]);
    }
  };

  // Slider change details
  const handleBandChange = (index: number, val: number) => {
    const updated = [...bandValues];
    updated[index] = val;
    setBandValues(updated);
    setActivePreset("Custom");
  };

  // Saved presets local handler
  const saveCustomPreset = () => {
    if (!newPresetName.trim()) return;
    const newPreset: EqualizerPreset = {
      name: newPresetName.trim(),
      bands: [...bandValues],
    };
    const updated = [...customPresetSaved, newPreset];
    setCustomPresetSaved(updated);
    setActivePreset(newPreset.name);
    setNewPresetName("");
  };

  // Canvas visual frequency analyzer loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let waves = Array(15).fill(0).map(() => Math.random() * 20);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = canvas.width / waves.length;
      const height = canvas.height;

      // Draw analytical grid lines in background
      ctx.strokeStyle = "rgba(118, 75, 162, 0.15)";
      ctx.lineWidth = 1;
      for (let i = 1; i < 4; i++) {
        const y = (height / 4) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Update and draw bars with primary neon gradient purple-pink-blue
      const gradient = ctx.createLinearGradient(0, height, 0, 0);
      gradient.addColorStop(0, "#0072ff");
      gradient.addColorStop(0.5, "#764ba2");
      gradient.addColorStop(1, "#f5576c");

      for (let i = 0; i < waves.length; i++) {
        // Frequency simulation factor
        let target = 5;
        if (isPlaying) {
          const multiplier = bandValues[Math.min(i, bandValues.length - 1)] + 12; // 0 to 24
          const noise = Math.random() * 15 * (multiplier / 12);
          target = 10 + noise + Math.sin(Date.now() * 0.005 + i) * 15;
          if (i % 2 === 0) target += Math.cos(Date.now() * 0.003 + i) * 10;
        } else {
          // Idle floating waves
          target = 8 + Math.sin(Date.now() * 0.0015 + i) * 4;
        }

        // Dampen with spring easing
        waves[i] = waves[i] * 0.8 + target * 0.2;
        const barHeight = Math.min(waves[i] * 1.5, height - 5);

        // Rounded bar logic
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(
          i * barWidth + 3,
          height - barHeight,
          barWidth - 6,
          barHeight,
          4
        );
        ctx.fill();

        // Neon reflection node top
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "#f5576c";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(i * barWidth + barWidth / 2, height - barHeight - 2, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, bandValues]);

  return (
    <div id="equalizer-setup" className="bg-[#12121F] rounded-2xl p-5 border border-white/5 space-y-5 shadow-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="h-5 w-5 text-purple-400" />
          <h3 className="font-sans font-semibold text-white text-base">Graphic Equalizer</h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-500/10 px-2 py-1 rounded-full">
          <Activity className="h-3 w-3 animate-pulse" />
          <span className="font-mono font-medium">10-Band EQ Engine</span>
        </div>
      </div>

      {/* Frequency Visualizer Canvas */}
      <div className="relative rounded-xl overflow-hidden bg-black/40 border border-white/5 p-2 h-28 flex items-center justify-center">
        <canvas ref={canvasRef} width={340} height={100} className="w-full h-full" />
        <div className="absolute top-2 left-3 text-[10px] font-mono text-white/30 pointer-events-none">
          60Hz ANALYZER
        </div>
        <div className="absolute bottom-2 right-3 text-[10px] font-mono text-purple-400/40 pointer-events-none">
          Hz RESPOND
        </div>
      </div>

      {/* Preset Pickers Grid */}
      <div className="space-y-2">
        <label className="text-xs text-gray-400 font-medium font-sans">Active Curated Presets</label>
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
          {[...EQ_PRESETS, ...customPresetSaved].map((p) => {
            const active = activePreset === p.name;
            return (
              <button
                key={p.name}
                id={`preset-${p.name}`}
                onClick={() => handlePresetSelect(p.name)}
                className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all duration-200 cursor-pointer ${
                  active
                    ? "bg-purple-600/30 text-white border-purple-500 shadow-md shadow-purple-500/20 font-medium"
                    : "bg-white/[0.02] text-gray-400 border-white/5 hover:border-white/10 hover:text-white"
                }`}
              >
                {p.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Real Slider Controls (Frequency matrix) */}
      <div className="space-y-4">
        <div className="grid grid-cols-10 gap-1.5 h-44 bg-black/20 p-2.5 rounded-xl border border-white/5">
          {bandValues.map((bandVal, idx) => (
            <div key={idx} className="flex flex-col items-center justify-between h-full">
              {/* dB indicator */}
              <span className="text-[10px] font-mono text-gray-500 font-semibold">
                {bandVal > 0 ? `+${bandVal}` : bandVal}
              </span>

              {/* Vertical slider wrapper */}
              <div className="relative flex-1 w-full flex justify-center py-2">
                <input
                  type="range"
                  min="-12"
                  max="12"
                  step="1"
                  value={bandVal}
                  onChange={(e) => handleBandChange(idx, parseInt(e.target.value))}
                  style={{ writingMode: "vertical-lr", direction: "rtl" }}
                  className="w-1.5 accent-pink-500 rounded-full h-full cursor-ns-resize opacity-80 hover:opacity-100 transition-opacity bg-white/5 cursor-pointer"
                />
              </div>

              {/* Band Label */}
              <span className="text-[10px] font-mono font-medium text-white/50">{BANDS_LABEL[idx]}</span>
            </div>
          ))}
        </div>

        {/* Custom Preset Save input form */}
        <div className="flex items-center gap-2 bg-white/[0.03] p-1.5 rounded-xl border border-white/5">
          <input
            type="text"
            placeholder="Save custom preset name..."
            value={newPresetName}
            onChange={(e) => setNewPresetName(e.target.value)}
            className="flex-1 bg-transparent text-xs text-white border-0 outline-none px-2 py-1 placeholder-gray-500 font-sans"
          />
          <button
            onClick={saveCustomPreset}
            disabled={!newPresetName.trim()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="h-3 w-3" />
            Save Preset
          </button>
        </div>
      </div>
    </div>
  );
}
