import React, { useRef, useState, useEffect } from 'react';
import {
  MousePointer2,
  Hand,
  Square,
  Circle,
  Type,
  Frame,
  Star,
  Minus,
  MoveRight,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Download,
  FolderOpen,
  Save,
  Play,
  Check,
  ChevronDown,
  Plus,
  X,
  Smartphone,
  Monitor,
  LayoutGrid,
  FileImage,
  Image as ImageIcon,
} from 'lucide-react';
import { ToolType, Project } from '../types';

interface ToolbarProps {
  projects: Project[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  onCloseProject: (id: string) => void;
  onOpenPresetsModal: () => void;
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onZoomToFit: () => void;
  onExportSVG: () => void;
  onExportPNG: () => void;
  onSaveJSON: () => void;
  onLoadJSON: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onInsertImage?: (file: File) => void;
  onPresent?: () => void;
  onOpenShortcutsModal?: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  projects,
  activeProjectId,
  onSelectProject,
  onCloseProject,
  onOpenPresetsModal,
  activeTool,
  setActiveTool,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onZoomToFit,
  onExportSVG,
  onExportPNG,
  onSaveJSON,
  onLoadJSON,
  onInsertImage,
  onPresent,
  onOpenShortcutsModal,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isZoomMenuOpen, setIsZoomMenuOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
        setIsZoomMenuOpen(false);
        setIsExportMenuOpen(false);
      }
    };
    window.addEventListener('mousedown', handleOutside);
    return () => window.removeEventListener('mousedown', handleOutside);
  }, []);

  const tools: { id: ToolType; label: string; icon: React.ReactNode; shortcut: string }[] = [
    { id: 'select', label: 'Move', icon: <MousePointer2 size={15} />, shortcut: 'V' },
    { id: 'hand', label: 'Hand / Pan', icon: <Hand size={15} />, shortcut: 'H' },
    { id: 'frame', label: 'Frame', icon: <Frame size={15} />, shortcut: 'F' },
    { id: 'rect', label: 'Rectangle', icon: <Square size={15} />, shortcut: 'R' },
    { id: 'ellipse', label: 'Ellipse', icon: <Circle size={15} />, shortcut: 'O' },
    { id: 'line', label: 'Line', icon: <Minus size={15} />, shortcut: 'L' },
    { id: 'arrow', label: 'Arrow', icon: <MoveRight size={15} />, shortcut: 'A' },
    { id: 'text', label: 'Text', icon: <Type size={15} />, shortcut: 'T' },
    { id: 'star', label: 'Star', icon: <Star size={15} />, shortcut: 'S' },
    { id: 'image', label: 'Place Image', icon: <ImageIcon size={15} />, shortcut: '⇧⌘K' },
  ];

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  return (
    <div className="flex flex-col bg-[#1c1c1f] select-none z-30 relative shadow-sm border-b border-[#2e2e33]">
      {/* Top Project Tab Bar (Figma Multi-Project Workspace) */}
      <div className="h-9 px-3 flex items-center justify-between border-b border-[#2a2a2f] bg-[#17171a]">
        <div className="flex items-center space-x-1 overflow-x-auto flex-1 mr-4">
          {projects.map((proj) => {
            const isActive = proj.id === activeProjectId;
            return (
              <div
                key={proj.id}
                onClick={() => onSelectProject(proj.id)}
                className={`group flex items-center space-x-2 px-3 py-1.5 rounded-t-lg text-xs font-medium cursor-pointer transition border-t border-x ${
                  isActive
                    ? 'bg-[#202023] text-white border-[#2e2e33] shadow-sm'
                    : 'text-[#8e8e93] hover:text-[#d4d4d8] hover:bg-[#20202380] border-transparent'
                }`}
              >
                {proj.category === 'mobile' ? (
                  <Smartphone size={12} className={isActive ? 'text-[#0d99ff]' : 'text-[#71717a]'} />
                ) : proj.category === 'dashboard' ? (
                  <Monitor size={12} className={isActive ? 'text-[#10b981]' : 'text-[#71717a]'} />
                ) : (
                  <LayoutGrid size={12} className={isActive ? 'text-[#a259ff]' : 'text-[#71717a]'} />
                )}

                <span className="truncate max-w-[140px] text-[11px]">{proj.name}</span>

                {projects.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseProject(proj.id);
                    }}
                    className="p-0.5 rounded hover:bg-[#ffffff20] text-[#71717a] hover:text-white transition opacity-0 group-hover:opacity-100"
                  >
                    <X size={11} />
                  </button>
                )}
              </div>
            );
          })}

          {/* New Tab Button */}
          <button
            onClick={onOpenPresetsModal}
            title="New Project & Screen Size (+)"
            className="flex items-center space-x-1 px-2 py-1 rounded-md text-[#71717a] hover:text-white hover:bg-[#252528] transition text-[11px] ml-1"
          >
            <Plus size={13} />
            <span>New File</span>
          </button>
        </div>

        {/* Local Persistence Status */}
        <div className="flex items-center space-x-2 text-[10px] text-[#71717a]">
          <span className="flex items-center space-x-1 text-[#10b981] bg-[#10b98115] px-2 py-0.5 rounded-full border border-[#10b98125]">
            <Check size={10} />
            <span>Auto-Saved Locally</span>
          </span>
        </div>
      </div>

      {/* Main Toolbar Line */}
      <header className="h-11 px-3 flex items-center justify-between">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={onLoadJSON}
        />
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file && onInsertImage) {
              onInsertImage(file);
            }
            e.target.value = '';
          }}
        />

        {/* Left Section: Main Menu & File Name */}
        <div className="flex items-center space-x-2" ref={menuRef}>
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#2c2c30] hover:bg-[#36363b] text-white transition shadow-sm border border-[#38383e]"
              title="Main Menu"
            >
              <div className="w-3.5 h-3.5 grid grid-cols-2 gap-0.5 pointer-events-none">
                <div className="w-1.5 h-1.5 rounded-l-full bg-[#f24e1e]" />
                <div className="w-1.5 h-1.5 rounded-r-full bg-[#ff7262]" />
                <div className="w-1.5 h-1.5 rounded-l-full bg-[#a259ff]" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#1abcfe]" />
              </div>
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute top-9 left-0 w-52 bg-[#252528] border border-[#38383e] rounded-xl shadow-2xl py-1.5 text-xs text-[#d1d1d6] z-50">
                <div className="px-3 py-1 text-[10px] font-semibold text-[#71717a] uppercase tracking-wider">
                  File
                </div>
                <button
                  onClick={() => {
                    imageInputRef.current?.click();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white flex items-center justify-between transition"
                >
                  <span>Place Image...</span>
                  <span className="text-[10px] text-[#71717a]">⇧⌘K</span>
                </button>
                <button
                  onClick={() => {
                    onOpenPresetsModal();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white flex items-center justify-between transition"
                >
                  <span>New from Presets...</span>
                  <span className="text-[10px] text-[#71717a]">⌘N</span>
                </button>
                <button
                  onClick={() => {
                    onSaveJSON();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white flex items-center justify-between transition"
                >
                  <span>Save Project (.json)</span>
                  <span className="text-[10px] text-[#71717a]">⌘S</span>
                </button>
                <button
                  onClick={() => {
                    fileInputRef.current?.click();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white flex items-center justify-between transition"
                >
                  <span>Open Local File...</span>
                  <span className="text-[10px] text-[#71717a]">⌘O</span>
                </button>

                <div className="h-[1px] bg-[#333338] my-1" />

                <div className="px-3 py-1 text-[10px] font-semibold text-[#71717a] uppercase tracking-wider">
                  View
                </div>
                <button
                  onClick={() => {
                    onResetZoom();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white flex items-center justify-between transition"
                >
                  <span>Zoom to 100%</span>
                  <span className="text-[10px] text-[#71717a]">⌘0</span>
                </button>
                <button
                  onClick={() => {
                    onZoomToFit();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white flex items-center justify-between transition"
                >
                  <span>Zoom to Fit</span>
                  <span className="text-[10px] text-[#71717a]">⇧1</span>
                </button>
              </div>
            )}
          </div>

          <span className="text-xs text-[#d4d4d8] font-semibold truncate max-w-[160px]">
            {activeProject?.name}
          </span>
        </div>

        {/* Center Section: Floating UI3 Tool Island */}
        <div className="flex items-center bg-[#17171a] p-1 rounded-xl border border-[#2e2e33] space-x-0.5 shadow-lg">
          {tools.map((t) => {
            const isActive = activeTool === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  if (t.id === 'image') {
                    imageInputRef.current?.click();
                  } else {
                    setActiveTool(t.id);
                  }
                }}
                title={`${t.label} (${t.shortcut})`}
                className={`p-1.5 rounded-lg transition-all flex items-center justify-center relative ${
                  isActive
                    ? 'bg-[#0d99ff] text-white shadow-md'
                    : 'text-[#8e8e93] hover:text-white hover:bg-[#26262a]'
                }`}
              >
                {t.icon}
              </button>
            );
          })}
        </div>

        {/* Right Section: Undo/Redo, Zoom, Present & Export */}
        <div className="flex items-center space-x-2">
          {/* Undo / Redo */}
          <div className="flex items-center bg-[#17171a] rounded-lg border border-[#2e2e33] p-0.5">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              title="Undo (⌘Z)"
              className="p-1.5 text-[#8e8e93] hover:text-white hover:bg-[#26262a] disabled:opacity-25 rounded-md transition"
            >
              <Undo2 size={13} />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              title="Redo (⇧⌘Z)"
              className="p-1.5 text-[#8e8e93] hover:text-white hover:bg-[#26262a] disabled:opacity-25 rounded-md transition"
            >
              <Redo2 size={13} />
            </button>
          </div>

          {/* Zoom Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsZoomMenuOpen(!isZoomMenuOpen)}
              className="flex items-center space-x-1.5 bg-[#17171a] rounded-lg border border-[#2e2e33] px-2.5 py-1 text-xs font-mono text-[#d4d4d8] hover:text-white hover:bg-[#26262a] transition shadow-sm"
            >
              <span>{Math.round(zoom * 100)}%</span>
              <ChevronDown size={11} className="text-[#71717a]" />
            </button>

            {isZoomMenuOpen && (
              <div className="absolute top-9 right-0 w-36 bg-[#252528] border border-[#38383e] rounded-xl shadow-2xl py-1 text-xs text-[#d1d1d6] z-50">
                <button
                  onClick={() => {
                    onResetZoom();
                    setIsZoomMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white flex items-center justify-between"
                >
                  <span>Zoom 100%</span>
                  <span className="text-[10px] text-[#71717a]">⌘0</span>
                </button>
                <button
                  onClick={() => {
                    onZoomToFit();
                    setIsZoomMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white flex items-center justify-between"
                >
                  <span>Zoom to Fit</span>
                  <span className="text-[10px] text-[#71717a]">⇧1</span>
                </button>
                <button
                  onClick={() => {
                    onZoomIn();
                    setIsZoomMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white flex items-center justify-between"
                >
                  <span>Zoom In</span>
                  <span className="text-[10px] text-[#71717a]">⌘+</span>
                </button>
                <button
                  onClick={() => {
                    onZoomOut();
                    setIsZoomMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white flex items-center justify-between"
                >
                  <span>Zoom Out</span>
                  <span className="text-[10px] text-[#71717a]">⌘-</span>
                </button>
              </div>
            )}
          </div>

          {/* Prototype Present Button */}
          <button
            onClick={onPresent || onZoomToFit}
            title="Present Prototype (Fullscreen Mode)"
            className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#17171a] hover:bg-[#26262a] text-[#8e8e93] hover:text-[#10b981] border border-[#2e2e33] transition shadow-sm"
          >
            <Play size={12} className="fill-current ml-0.5 text-[#10b981]" />
          </button>

          {/* Shortcuts Help Button */}
          {onOpenShortcutsModal && (
            <button
              onClick={onOpenShortcutsModal}
              title="Keyboard Shortcuts (?)"
              className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#17171a] hover:bg-[#26262a] text-[#8e8e93] hover:text-white border border-[#2e2e33] transition shadow-sm text-xs font-semibold"
            >
              ?
            </button>
          )}

          {/* Export Split Dropdown (SVG & PNG) */}
          <div className="relative">
            <div className="flex items-center bg-[#0d99ff] rounded-lg shadow-md overflow-hidden">
              <button
                onClick={onExportPNG}
                title="Export as PNG Image"
                className="flex items-center space-x-1.5 bg-[#0d99ff] hover:bg-[#007be5] text-white px-2.5 py-1 text-xs font-semibold transition"
              >
                <FileImage size={12} />
                <span>Export PNG</span>
              </button>
              <button
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                className="bg-[#007be5] hover:bg-[#006cc7] text-white px-1.5 py-1 text-xs border-l border-white/20 transition"
              >
                <ChevronDown size={11} />
              </button>
            </div>

            {isExportMenuOpen && (
              <div className="absolute top-9 right-0 w-40 bg-[#252528] border border-[#38383e] rounded-xl shadow-2xl py-1 text-xs text-[#d1d1d6] z-50">
                <button
                  onClick={() => {
                    onExportPNG();
                    setIsExportMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white flex items-center space-x-2"
                >
                  <FileImage size={13} />
                  <span>Export PNG (Retina 2x)</span>
                </button>
                <button
                  onClick={() => {
                    onExportSVG();
                    setIsExportMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white flex items-center space-x-2"
                >
                  <Download size={13} />
                  <span>Export Vector SVG</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  );
};
