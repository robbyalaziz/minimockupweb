import React, { useState } from 'react';
import {
  Smartphone,
  Tablet,
  Monitor,
  Share2,
  X,
  Plus,
  Sparkles,
  LayoutTemplate,
  Check,
} from 'lucide-react';
import { SCREEN_PRESETS, createMobileTemplate, createWebDashboardTemplate, createLandingPageTemplate } from '../utils/presets';
import { CanvasShape, ScreenPreset } from '../types';

interface ScreenPresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (name: string, shapes: CanvasShape[], category: 'mobile' | 'web' | 'dashboard' | 'custom') => void;
  onInsertFrameToCanvas?: (preset: ScreenPreset) => void;
  mode?: 'new-project' | 'insert-frame';
}

export const ScreenPresetsModal: React.FC<ScreenPresetsModalProps> = ({
  isOpen,
  onClose,
  onCreateProject,
  onInsertFrameToCanvas,
  mode = 'new-project',
}) => {
  const [activeTab, setActiveTab] = useState<'Phone' | 'Desktop' | 'Tablet' | 'Social'>('Phone');

  if (!isOpen) return null;

  const filteredPresets = SCREEN_PRESETS.filter((p) => p.category === activeTab);

  const handleSelectPreset = (preset: ScreenPreset) => {
    if (mode === 'insert-frame' && onInsertFrameToCanvas) {
      onInsertFrameToCanvas(preset);
      onClose();
      return;
    }

    // Creating new project with this frame
    const baseFrame: CanvasShape = {
      id: `frame-${Date.now()}`,
      name: `${preset.name}`,
      type: 'frame',
      x: 80,
      y: 40,
      width: preset.width,
      height: preset.height,
      rotation: 0,
      fill: '#121214',
      stroke: '#2c2c2e',
      strokeWidth: 2,
      cornerRadius: preset.category === 'Phone' ? 44 : 20,
      opacity: 1,
      visible: true,
      locked: false,
      hasShadow: true,
      shadowColor: 'rgba(0,0,0,0.5)',
      shadowBlur: 32,
      shadowY: 12,
    };

    const category = preset.category === 'Phone' ? 'mobile' : 'web';
    onCreateProject(preset.name, [baseFrame], category);
    onClose();
  };

  const handleSelectTemplate = (templateType: 'mobile' | 'dashboard' | 'landing') => {
    if (templateType === 'mobile') {
      onCreateProject('Mobile App Design', createMobileTemplate(), 'mobile');
    } else if (templateType === 'dashboard') {
      onCreateProject('SaaS Analytics Dashboard', createWebDashboardTemplate(), 'dashboard');
    } else {
      onCreateProject('Landing Page Hero', createLandingPageTemplate(), 'web');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-150 select-none">
      <div className="w-[680px] bg-[#202023] border border-[#333338] rounded-2xl shadow-2xl overflow-hidden flex flex-col text-[#e4e4e7]">
        {/* Modal Header */}
        <div className="h-14 px-6 border-b border-[#2e2e33] flex items-center justify-between bg-[#1c1c1f]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0d99ff15] border border-[#0d99ff30] flex items-center justify-center text-[#0d99ff]">
              <LayoutTemplate size={16} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">
                {mode === 'new-project' ? 'New Project & Screen Size' : 'Choose Screen Frame Preset'}
              </h2>
              <p className="text-[11px] text-[#71717a]">
                Pick standard Apple, Android, or Desktop dimensions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#71717a] hover:text-white rounded-lg hover:bg-[#2a2a2e] transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Premade Starter Templates (Show only in new-project mode) */}
        {mode === 'new-project' && (
          <div className="p-5 border-b border-[#2e2e33] bg-[#17171a]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-[#a1a1aa] uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles size={12} className="text-[#f59e0b]" />
                <span>Instant Starter Templates</span>
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleSelectTemplate('mobile')}
                className="p-3 rounded-xl bg-[#202023] hover:bg-[#28282d] border border-[#2e2e33] hover:border-[#0d99ff] text-left transition group shadow-sm"
              >
                <div className="w-6 h-6 rounded-md bg-[#0d99ff20] text-[#0d99ff] flex items-center justify-center mb-2">
                  <Smartphone size={13} />
                </div>
                <div className="font-semibold text-white text-xs group-hover:text-[#0d99ff] transition">
                  Mobile App UI
                </div>
                <div className="text-[10px] text-[#71717a] mt-0.5">
                  iPhone 16 Pro + Card & Buttons
                </div>
              </button>

              <button
                onClick={() => handleSelectTemplate('dashboard')}
                className="p-3 rounded-xl bg-[#202023] hover:bg-[#28282d] border border-[#2e2e33] hover:border-[#0d99ff] text-left transition group shadow-sm"
              >
                <div className="w-6 h-6 rounded-md bg-[#10b98120] text-[#10b981] flex items-center justify-center mb-2">
                  <Monitor size={13} />
                </div>
                <div className="font-semibold text-white text-xs group-hover:text-[#10b981] transition">
                  Web Dashboard
                </div>
                <div className="text-[10px] text-[#71717a] mt-0.5">
                  1440px + Sidebar & Metrics
                </div>
              </button>

              <button
                onClick={() => handleSelectTemplate('landing')}
                className="p-3 rounded-xl bg-[#202023] hover:bg-[#28282d] border border-[#2e2e33] hover:border-[#0d99ff] text-left transition group shadow-sm"
              >
                <div className="w-6 h-6 rounded-md bg-[#a259ff20] text-[#a259ff] flex items-center justify-center mb-2">
                  <Share2 size={13} />
                </div>
                <div className="font-semibold text-white text-xs group-hover:text-[#a259ff] transition">
                  SaaS Landing Hero
                </div>
                <div className="text-[10px] text-[#71717a] mt-0.5">
                  Navbar + Hero Headline & CTA
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Category Tabs */}
        <div className="px-6 pt-4 flex space-x-2 border-b border-[#2e2e33]">
          {(['Phone', 'Desktop', 'Tablet', 'Social'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2.5 px-3 text-xs font-semibold flex items-center space-x-1.5 transition border-b-2 ${
                activeTab === tab
                  ? 'border-[#0d99ff] text-[#0d99ff]'
                  : 'border-transparent text-[#71717a] hover:text-white'
              }`}
            >
              {tab === 'Phone' && <Smartphone size={13} />}
              {tab === 'Desktop' && <Monitor size={13} />}
              {tab === 'Tablet' && <Tablet size={13} />}
              {tab === 'Social' && <Share2 size={13} />}
              <span>{tab}s</span>
            </button>
          ))}
        </div>

        {/* Presets Grid */}
        <div className="p-6 grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto">
          {filteredPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className="p-3.5 rounded-xl bg-[#17171a] hover:bg-[#25252a] border border-[#2e2e33] hover:border-[#0d99ff] flex items-center justify-between text-left transition group shadow-sm"
            >
              <div>
                <div className="font-semibold text-white text-xs group-hover:text-[#0d99ff] transition flex items-center space-x-2">
                  <span>{preset.name}</span>
                  {preset.badge && (
                    <span className="text-[9px] font-mono font-medium px-1.5 py-0.2 rounded bg-[#0d99ff20] text-[#0d99ff]">
                      {preset.badge}
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-mono text-[#71717a] mt-1">
                  {preset.width} × {preset.height} px
                </div>
              </div>
              <div className="w-7 h-7 rounded-lg bg-[#202023] group-hover:bg-[#0d99ff] text-[#71717a] group-hover:text-white flex items-center justify-center transition">
                <Plus size={13} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
