import React, { useState } from 'react';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyEnd,
  AlignHorizontalDistributeCenter,
  AlignVerticalDistributeCenter,
  Sliders,
  PaintBucket,
  Square,
  Sparkles,
  Code2,
  Copy,
  Check,
  Download,
  Plus,
  Rows,
  Columns,
  Layers,
  Upload,
  Folder,
  Ungroup,
  FileImage,
} from 'lucide-react';
import { CanvasShape } from '../types';
import { exportToSVG, downloadFile, generateTailwindCode } from '../utils/export';

const SWATCHES = [
  '#ffffff',
  '#18181b',
  '#0d99ff',
  '#8b5cf6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#06b6d4',
];

interface PropertiesPanelProps {
  selectedShapes: CanvasShape[];
  onUpdateShapes: (updates: Partial<CanvasShape>) => void;
  onAlign: (
    alignment:
      | 'left'
      | 'center'
      | 'right'
      | 'top'
      | 'middle'
      | 'bottom'
      | 'distribute-h'
      | 'distribute-v'
  ) => void;
  onGroup?: () => void;
  onUngroup?: (groupId: string) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedShapes,
  onUpdateShapes,
  onAlign,
  onGroup,
  onUngroup,
}) => {
  const [activeTab, setActiveTab] = useState<'design' | 'code'>('design');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedSVG, setCopiedSVG] = useState(false);


  if (selectedShapes.length === 0) {
    return (
      <aside className="w-68 bg-[#202023] border-l border-[#2e2e33] p-6 flex flex-col items-center justify-center text-center text-xs text-[#71717a] select-none z-20">
        <Sliders size={26} className="mb-2 text-[#52525b]" />
        <span className="font-semibold text-[#d4d4d8]">No Selection</span>
        <span className="text-[11px] text-[#71717a] mt-1.5 leading-relaxed">
          Select any element or frame to configure its geometry, auto-layout, styles, and generated code.
        </span>
      </aside>
    );
  }

  const primaryShape = selectedShapes[0];
  const isSingle = selectedShapes.length === 1;

  const copyCode = () => {
    const code = generateTailwindCode(primaryShape);
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const exportSelectionSVG = () => {
    const svg = exportToSVG(selectedShapes);
    downloadFile(
      svg,
      `${primaryShape.name.toLowerCase().replace(/\s+/g, '-')}.svg`,
      'image/svg+xml'
    );
  };

  return (
    <aside className="w-68 bg-[#202023] border-l border-[#2e2e33] flex flex-col text-xs text-[#e4e4e7] select-none z-20 overflow-y-auto shadow-sm">
      {/* Top Tab Bar: Design vs Code */}
      <div className="h-10 border-b border-[#2e2e33] px-3 flex items-center justify-between bg-[#1c1c1f]">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('design')}
            className={`px-3 py-1 rounded-md text-[11px] font-semibold transition ${
              activeTab === 'design'
                ? 'bg-[#2a2a2e] text-white shadow-sm'
                : 'text-[#71717a] hover:text-white'
            }`}
          >
            Design
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center space-x-1 px-3 py-1 rounded-md text-[11px] font-semibold transition ${
              activeTab === 'code'
                ? 'bg-[#2a2a2e] text-[#0d99ff] shadow-sm'
                : 'text-[#71717a] hover:text-white'
            }`}
          >
            <Code2 size={12} />
            <span>Code</span>
          </button>
        </div>

        <span className="text-[10px] font-mono uppercase bg-[#2a2a2e] px-1.5 py-0.5 rounded text-[#71717a]">
          {isSingle ? primaryShape.type : `${selectedShapes.length} selected`}
        </span>
      </div>

      {activeTab === 'code' ? (
        /* React + Tailwind Code Tab */
        <div className="p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-[#71717a] uppercase tracking-wider">
              React + Tailwind Code
            </span>
            <button
              onClick={copyCode}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-[#2a2a2e] hover:bg-[#34343a] text-white text-[11px] transition border border-[#333338]"
            >
              {copiedCode ? <Check size={11} className="text-[#10b981]" /> : <Copy size={11} />}
              <span>{copiedCode ? 'Copied' : 'Copy JSX'}</span>
            </button>
          </div>
          <pre className="bg-[#17171a] p-3 rounded-xl border border-[#2e2e33] text-[#d4d4d8] font-mono text-[11px] overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner">
            {generateTailwindCode(primaryShape)}
          </pre>
        </div>
      ) : (
        /* Design Tab */
        <div className="p-3 space-y-3.5">
          {/* Alignment Tools Bar */}
          <section className="space-y-1">
            <div className="flex items-center justify-between bg-[#17171a] p-1 rounded-xl border border-[#2e2e33]">
              <button
                onClick={() => onAlign('left')}
                title="Align Left (⌥A)"
                className={`p-1.5 rounded-lg transition ${
                  primaryShape.type === 'text' &&
                  (!primaryShape.textAlign || primaryShape.textAlign === 'left')
                    ? 'bg-[#26262a] text-[#0d99ff]'
                    : 'text-[#71717a] hover:bg-[#26262a] hover:text-white'
                }`}
              >
                <AlignLeft size={13} />
              </button>
              <button
                onClick={() => onAlign('center')}
                title="Align Horizontal Center (⌥H)"
                className={`p-1.5 rounded-lg transition ${
                  primaryShape.type === 'text' && primaryShape.textAlign === 'center'
                    ? 'bg-[#26262a] text-[#0d99ff]'
                    : 'text-[#71717a] hover:bg-[#26262a] hover:text-white'
                }`}
              >
                <AlignCenter size={13} />
              </button>
              <button
                onClick={() => onAlign('right')}
                title="Align Right (⌥D)"
                className={`p-1.5 rounded-lg transition ${
                  primaryShape.type === 'text' && primaryShape.textAlign === 'right'
                    ? 'bg-[#26262a] text-[#0d99ff]'
                    : 'text-[#71717a] hover:bg-[#26262a] hover:text-white'
                }`}
              >
                <AlignRight size={13} />
              </button>
              <div className="w-[1px] h-3 bg-[#2e2e33]" />
              <button
                onClick={() => onAlign('top')}
                title="Align Top (⌥W)"
                className="p-1.5 hover:bg-[#26262a] text-[#71717a] hover:text-white rounded-lg transition"
              >
                <AlignVerticalJustifyStart size={13} />
              </button>
              <button
                onClick={() => onAlign('middle')}
                title="Align Vertical Center (⌥V)"
                className="p-1.5 hover:bg-[#26262a] text-[#71717a] hover:text-white rounded-lg transition"
              >
                <AlignVerticalJustifyCenter size={13} />
              </button>
              <button
                onClick={() => onAlign('bottom')}
                title="Align Bottom (⌥S)"
                className="p-1.5 hover:bg-[#26262a] text-[#71717a] hover:text-white rounded-lg transition"
              >
                <AlignVerticalJustifyEnd size={13} />
              </button>
              <div className="w-[1px] h-3 bg-[#2e2e33]" />
              <button
                disabled={selectedShapes.length < 3}
                onClick={() => onAlign('distribute-h')}
                title={
                  selectedShapes.length < 3
                    ? 'Distribute Horizontal (Select 3+ layers)'
                    : 'Distribute Horizontal Spacing'
                }
                className={`p-1.5 rounded-lg transition ${
                  selectedShapes.length < 3
                    ? 'opacity-30 cursor-not-allowed text-[#52525b]'
                    : 'text-[#71717a] hover:bg-[#26262a] hover:text-white'
                }`}
              >
                <AlignHorizontalDistributeCenter size={13} />
              </button>
              <button
                disabled={selectedShapes.length < 3}
                onClick={() => onAlign('distribute-v')}
                title={
                  selectedShapes.length < 3
                    ? 'Distribute Vertical (Select 3+ layers)'
                    : 'Distribute Vertical Spacing'
                }
                className={`p-1.5 rounded-lg transition ${
                  selectedShapes.length < 3
                    ? 'opacity-30 cursor-not-allowed text-[#52525b]'
                    : 'text-[#71717a] hover:bg-[#26262a] hover:text-white'
                }`}
              >
                <AlignVerticalDistributeCenter size={13} />
              </button>
            </div>
          </section>

          {/* Geometry (X, Y, W, H, Rotation, Radius) */}
          <section className="space-y-1.5">
            <div className="text-[10px] font-semibold text-[#71717a] uppercase tracking-wider">
              Position & Dimensions
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <div className="flex items-center space-x-1.5 bg-[#17171a] px-2 py-1 rounded-lg border border-[#2e2e33]">
                <span className="text-[#52525b] font-mono text-[10px]">X</span>
                <input
                  type="number"
                  value={Math.round(primaryShape.x)}
                  onChange={(e) => onUpdateShapes({ x: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-transparent text-white outline-none font-mono text-xs text-right"
                />
              </div>
              <div className="flex items-center space-x-1.5 bg-[#17171a] px-2 py-1 rounded-lg border border-[#2e2e33]">
                <span className="text-[#52525b] font-mono text-[10px]">Y</span>
                <input
                  type="number"
                  value={Math.round(primaryShape.y)}
                  onChange={(e) => onUpdateShapes({ y: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-transparent text-white outline-none font-mono text-xs text-right"
                />
              </div>
              <div className="flex items-center space-x-1.5 bg-[#17171a] px-2 py-1 rounded-lg border border-[#2e2e33]">
                <span className="text-[#52525b] font-mono text-[10px]">W</span>
                <input
                  type="number"
                  min="1"
                  value={Math.round(primaryShape.width)}
                  onChange={(e) =>
                    onUpdateShapes({ width: Math.max(1, parseFloat(e.target.value) || 1) })
                  }
                  className="w-full bg-transparent text-white outline-none font-mono text-xs text-right"
                />
              </div>
              <div className="flex items-center space-x-1.5 bg-[#17171a] px-2 py-1 rounded-lg border border-[#2e2e33]">
                <span className="text-[#52525b] font-mono text-[10px]">H</span>
                <input
                  type="number"
                  min="1"
                  value={Math.round(primaryShape.height)}
                  onChange={(e) =>
                    onUpdateShapes({ height: Math.max(1, parseFloat(e.target.value) || 1) })
                  }
                  className="w-full bg-transparent text-white outline-none font-mono text-xs text-right"
                />
              </div>
            </div>

            {/* Corner Radius & Opacity */}
            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
              <div className="flex items-center space-x-1.5 bg-[#17171a] px-2 py-1 rounded-lg border border-[#2e2e33]">
                <span className="text-[#52525b] text-[10px]">Radius</span>
                <input
                  type="number"
                  min="0"
                  value={primaryShape.cornerRadius}
                  onChange={(e) =>
                    onUpdateShapes({ cornerRadius: Math.max(0, parseInt(e.target.value) || 0) })
                  }
                  className="w-full bg-transparent text-white outline-none font-mono text-xs text-right"
                />
              </div>
              <div className="flex items-center space-x-1.5 bg-[#17171a] px-2 py-1 rounded-lg border border-[#2e2e33]">
                <span className="text-[#52525b] text-[10px]">Opacity</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={Math.round(primaryShape.opacity * 100)}
                  onChange={(e) =>
                    onUpdateShapes({
                      opacity: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)) / 100,
                    })
                  }
                  className="w-full bg-transparent text-white outline-none font-mono text-xs text-right"
                />
                <span className="text-[#52525b] text-[10px]">%</span>
              </div>
            </div>
          </section>

          {/* Typography options if text */}
          {primaryShape.type === 'text' && (
            <section className="space-y-1.5 border-t border-[#2e2e33] pt-3">
              <div className="text-[10px] font-semibold text-[#71717a] uppercase tracking-wider">
                Typography
              </div>
              <textarea
                rows={2}
                value={primaryShape.text || ''}
                onChange={(e) => onUpdateShapes({ text: e.target.value })}
                className="w-full bg-[#17171a] border border-[#2e2e33] rounded-lg p-2 text-white outline-none text-xs resize-none"
                placeholder="Enter text..."
              />
              <div className="grid grid-cols-2 gap-1.5">
                <div className="flex items-center space-x-1.5 bg-[#17171a] px-2 py-1 rounded-lg border border-[#2e2e33]">
                  <span className="text-[#52525b] text-[10px]">Size</span>
                  <input
                    type="number"
                    min="8"
                    max="144"
                    value={primaryShape.fontSize || 16}
                    onChange={(e) =>
                      onUpdateShapes({ fontSize: Math.max(8, parseInt(e.target.value) || 16) })
                    }
                    className="w-full bg-transparent text-white outline-none font-mono text-xs text-right"
                  />
                </div>
                <select
                  value={primaryShape.fontWeight || 'normal'}
                  onChange={(e) => onUpdateShapes({ fontWeight: e.target.value })}
                  className="bg-[#17171a] border border-[#2e2e33] text-white px-2 py-1 rounded-lg text-xs outline-none"
                >
                  <option value="normal">Regular</option>
                  <option value="500">Medium</option>
                  <option value="600">SemiBold</option>
                  <option value="bold">Bold</option>
                </select>
              </div>

              {/* Font Family Selector */}
              <div className="space-y-1 pt-0.5">
                <div className="text-[10px] text-[#52525b] font-medium">Font Family</div>
                <select
                  value={primaryShape.fontFamily || "'Inter', sans-serif"}
                  onChange={(e) => onUpdateShapes({ fontFamily: e.target.value })}
                  className="w-full bg-[#17171a] border border-[#2e2e33] text-white px-2 py-1.5 rounded-lg text-xs outline-none"
                >
                  <optgroup label="Modern Sans-Serif">
                    <option value="'Inter', sans-serif">Inter (Figma Standard)</option>
                    <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans</option>
                    <option value="'Poppins', sans-serif">Poppins</option>
                    <option value="'Outfit', sans-serif">Outfit</option>
                    <option value="'Roboto', sans-serif">Roboto</option>
                    <option value="'Montserrat', sans-serif">Montserrat</option>
                    <option value="'Space Grotesk', sans-serif">Space Grotesk</option>
                  </optgroup>
                  <optgroup label="Serif">
                    <option value="'Playfair Display', serif">Playfair Display</option>
                  </optgroup>
                  <optgroup label="Monospace / Code">
                    <option value="'JetBrains Mono', monospace">JetBrains Mono</option>
                    <option value="'Fira Code', monospace">Fira Code</option>
                  </optgroup>
                  <optgroup label="System">
                    <option value="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">System UI / SF Pro</option>
                  </optgroup>
                </select>
              </div>

              {/* Explicit Text Align Buttons */}
              <div className="space-y-1 pt-1">
                <div className="text-[10px] text-[#52525b] font-medium">Text Alignment</div>
                <div className="grid grid-cols-3 gap-1 bg-[#17171a] p-1 rounded-lg border border-[#2e2e33]">
                  <button
                    type="button"
                    onClick={() => onUpdateShapes({ textAlign: 'left' })}
                    title="Align Text Left"
                    className={`flex items-center justify-center py-1 rounded transition text-xs ${
                      !primaryShape.textAlign || primaryShape.textAlign === 'left'
                        ? 'bg-[#26262a] text-[#0d99ff] font-semibold'
                        : 'text-[#71717a] hover:text-white'
                    }`}
                  >
                    <AlignLeft size={13} className="mr-1" /> Left
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateShapes({ textAlign: 'center' })}
                    title="Align Text Center"
                    className={`flex items-center justify-center py-1 rounded transition text-xs ${
                      primaryShape.textAlign === 'center'
                        ? 'bg-[#26262a] text-[#0d99ff] font-semibold'
                        : 'text-[#71717a] hover:text-white'
                    }`}
                  >
                    <AlignCenter size={13} className="mr-1" /> Center
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateShapes({ textAlign: 'right' })}
                    title="Align Text Right"
                    className={`flex items-center justify-center py-1 rounded transition text-xs ${
                      primaryShape.textAlign === 'right'
                        ? 'bg-[#26262a] text-[#0d99ff] font-semibold'
                        : 'text-[#71717a] hover:text-white'
                    }`}
                  >
                    <AlignRight size={13} className="mr-1" /> Right
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Image Settings */}
          {primaryShape.type === 'image' && (
            <section className="space-y-2 border-t border-[#2e2e33] pt-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-[#71717a] uppercase tracking-wider">
                  Image Properties
                </span>
                <FileImage size={13} className="text-[#0d99ff]" />
              </div>
              {primaryShape.imageUrl && (
                <div className="relative rounded-lg overflow-hidden border border-[#2e2e33] h-24 bg-[#141416] flex items-center justify-center p-1">
                  <img
                    src={primaryShape.imageUrl}
                    alt="Preview"
                    className="max-h-full max-w-full object-contain rounded"
                  />
                </div>
              )}
              <div className="space-y-1">
                <span className="text-[10px] text-[#52525b]">Object Fit</span>
                <select
                  value={primaryShape.imageFit || 'cover'}
                  onChange={(e) => onUpdateShapes({ imageFit: e.target.value as any })}
                  className="w-full bg-[#17171a] border border-[#2e2e33] text-white px-2 py-1 rounded-lg text-xs outline-none"
                >
                  <option value="cover">Cover (Fill & Crop)</option>
                  <option value="contain">Contain (Fit Whole Image)</option>
                  <option value="fill">Fill (Stretch)</option>
                </select>
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  id={`replace-img-${primaryShape.id}`}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        onUpdateShapes({ imageUrl: ev.target?.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <label
                  htmlFor={`replace-img-${primaryShape.id}`}
                  className="w-full flex items-center justify-center space-x-1.5 py-1.5 bg-[#17171a] hover:bg-[#252528] border border-[#2e2e33] rounded-lg text-xs text-[#0d99ff] cursor-pointer transition"
                >
                  <Upload size={12} />
                  <span>Replace Image</span>
                </label>
              </div>
            </section>
          )}

          {/* Group Settings / Ungroup */}
          {(primaryShape.type === 'group' || !!primaryShape.parentId) && onUngroup && (
            <section className="space-y-2 border-t border-[#2e2e33] pt-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-[#71717a] uppercase tracking-wider">
                  Group Layer
                </span>
                <Folder size={13} className="text-[#0d99ff]" />
              </div>
              <p className="text-[11px] text-[#8e8e93]">
                {primaryShape.type === 'group'
                  ? 'Grouped layers can be transformed and moved together as a single composite unit.'
                  : 'This layer belongs to a group. You can ungroup to release it as an independent layer.'}
              </p>
              <button
                type="button"
                onClick={() => onUngroup(primaryShape.parentId || primaryShape.id)}
                className="w-full flex items-center justify-center space-x-1.5 py-1.5 bg-[#252528] hover:bg-[#323238] border border-[#38383e] rounded-lg text-xs text-white transition shadow-sm"
              >
                <Ungroup size={13} />
                <span>Ungroup Selection (⇧⌘G)</span>
              </button>
            </section>
          )}

          {/* Group Selection button */}
          {selectedShapes.length >= 1 && onGroup && primaryShape.type !== 'group' && (
            <section className="border-t border-[#2e2e33] pt-3">
              <button
                type="button"
                onClick={onGroup}
                className="w-full flex items-center justify-center space-x-1.5 py-1.5 bg-[#0d99ff15] hover:bg-[#0d99ff25] border border-[#0d99ff40] rounded-lg text-xs text-[#0d99ff] font-semibold transition shadow-sm"
              >
                <Folder size={13} />
                <span>
                  Group {selectedShapes.length > 1 ? `${selectedShapes.length} Selected Layers` : 'Selection'} (⌘G)
                </span>
              </button>
            </section>
          )}

          {/* Fill Section */}
          <section className="space-y-1.5 border-t border-[#2e2e33] pt-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-[#71717a] uppercase tracking-wider">
                Fill
              </span>
              <PaintBucket size={13} className="text-[#71717a]" />
            </div>
            <div className="flex items-center space-x-2 bg-[#17171a] p-1.5 rounded-lg border border-[#2e2e33]">
              <input
                type="color"
                value={primaryShape.fill.startsWith('#') ? primaryShape.fill : '#0d99ff'}
                onChange={(e) => onUpdateShapes({ fill: e.target.value })}
              />
              <input
                type="text"
                value={primaryShape.fill}
                onChange={(e) => onUpdateShapes({ fill: e.target.value })}
                className="flex-1 bg-transparent text-white font-mono text-xs uppercase outline-none"
              />
            </div>
            {/* Quick Palette Swatches */}
            <div className="flex items-center space-x-1.5 pt-0.5">
              {SWATCHES.map((hex) => (
                <button
                  key={`fill-${hex}`}
                  onClick={() => onUpdateShapes({ fill: hex })}
                  title={`Fill: ${hex}`}
                  style={{ backgroundColor: hex }}
                  className="w-4 h-4 rounded-full border border-white/20 hover:scale-125 transition-transform"
                />
              ))}
            </div>
          </section>

          {/* Stroke Section */}
          <section className="space-y-1.5 border-t border-[#2e2e33] pt-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-[#71717a] uppercase tracking-wider">
                Stroke
              </span>
              <Square size={13} className="text-[#71717a]" />
            </div>
            <div className="flex items-center space-x-2 bg-[#17171a] p-1.5 rounded-lg border border-[#2e2e33]">
              <input
                type="color"
                value={primaryShape.stroke.startsWith('#') ? primaryShape.stroke : '#ffffff'}
                onChange={(e) => onUpdateShapes({ stroke: e.target.value })}
              />
              <input
                type="text"
                value={primaryShape.stroke}
                onChange={(e) => onUpdateShapes({ stroke: e.target.value })}
                className="flex-1 bg-transparent text-white font-mono text-xs uppercase outline-none"
              />
              <div className="flex items-center space-x-1 border-l border-[#2e2e33] pl-2">
                <span className="text-[#52525b] text-[10px]">W</span>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={primaryShape.strokeWidth}
                  onChange={(e) =>
                    onUpdateShapes({ strokeWidth: Math.max(0, parseInt(e.target.value) || 0) })
                  }
                  className="w-8 bg-transparent text-white outline-none font-mono text-xs text-right"
                />
              </div>
            </div>
            {/* Quick Stroke Palette Swatches */}
            <div className="flex items-center space-x-1.5 pt-0.5">
              {SWATCHES.map((hex) => (
                <button
                  key={`stroke-${hex}`}
                  onClick={() =>
                    onUpdateShapes({ stroke: hex, strokeWidth: Math.max(1, primaryShape.strokeWidth) })
                  }
                  title={`Stroke: ${hex}`}
                  style={{ backgroundColor: hex }}
                  className="w-4 h-4 rounded-full border border-white/20 hover:scale-125 transition-transform"
                />
              ))}
            </div>
          </section>

          {/* Effects (Drop Shadow) */}
          <section className="space-y-1.5 border-t border-[#2e2e33] pt-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-[#71717a] uppercase tracking-wider">
                Drop Shadow
              </span>
              <input
                type="checkbox"
                checked={primaryShape.hasShadow || false}
                onChange={(e) => onUpdateShapes({ hasShadow: e.target.checked })}
                className="rounded accent-[#0d99ff] cursor-pointer"
              />
            </div>
            {primaryShape.hasShadow && (
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                <div className="flex items-center space-x-1 bg-[#17171a] px-2 py-1 rounded-lg border border-[#2e2e33]">
                  <span className="text-[#52525b] text-[10px]">Y</span>
                  <input
                    type="number"
                    value={primaryShape.shadowY || 8}
                    onChange={(e) =>
                      onUpdateShapes({ shadowY: parseInt(e.target.value) || 0 })
                    }
                    className="w-full bg-transparent text-white outline-none font-mono text-xs text-right"
                  />
                </div>
                <div className="flex items-center space-x-1 bg-[#17171a] px-2 py-1 rounded-lg border border-[#2e2e33]">
                  <span className="text-[#52525b] text-[10px]">Blur</span>
                  <input
                    type="number"
                    min="0"
                    value={primaryShape.shadowBlur || 16}
                    onChange={(e) =>
                      onUpdateShapes({ shadowBlur: Math.max(0, parseInt(e.target.value) || 0) })
                    }
                    className="w-full bg-transparent text-white outline-none font-mono text-xs text-right"
                  />
                </div>
                <div className="flex items-center space-x-1 bg-[#17171a] p-1 rounded-lg border border-[#2e2e33]">
                  <input
                    type="color"
                    value={
                      primaryShape.shadowColor?.startsWith('#')
                        ? primaryShape.shadowColor
                        : '#000000'
                    }
                    onChange={(e) => onUpdateShapes({ shadowColor: e.target.value })}
                  />
                </div>
              </div>
            )}
          </section>

          {/* Export Quick Buttons */}
          <section className="border-t border-[#2e2e33] pt-3 space-y-1.5">
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={exportSelectionSVG}
                className="flex items-center justify-center space-x-1 py-1.5 rounded-lg bg-[#252528] hover:bg-[#2e2e33] text-white text-[11px] font-medium transition shadow-sm border border-[#333338]"
              >
                <Download size={12} />
                <span>Save SVG</span>
              </button>
              <button
                onClick={() => {
                  const svg = exportToSVG(selectedShapes);
                  navigator.clipboard.writeText(svg);
                  setCopiedSVG(true);
                  setTimeout(() => setCopiedSVG(false), 2000);
                }}
                className="flex items-center justify-center space-x-1 py-1.5 rounded-lg bg-[#252528] hover:bg-[#2e2e33] text-[#0d99ff] text-[11px] font-medium transition shadow-sm border border-[#333338]"
              >
                {copiedSVG ? <Check size={12} className="text-[#10b981]" /> : <Copy size={12} />}
                <span>{copiedSVG ? 'Copied' : 'Copy SVG'}</span>
              </button>
            </div>
          </section>
        </div>
      )}
    </aside>
  );
};

