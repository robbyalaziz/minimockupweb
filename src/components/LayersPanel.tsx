import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Layers,
  Square,
  Circle,
  Type,
  Frame,
  Star,
  Minus,
  MoveRight,
  Search,
  Folder,
  FolderOpen,
  FileImage,
  Component,
  Boxes,
} from 'lucide-react';
import { CanvasShape } from '../types';

interface LayersPanelProps {
  shapes: CanvasShape[];
  selectedIds: string[];
  onSelect: (id: string, isMulti: boolean) => void;
  onUpdateShape: (id: string, updates: Partial<CanvasShape>) => void;
  onDeleteShapes: (ids: string[]) => void;
  onDuplicateShapes: (ids: string[]) => void;
  onReorder: (id: string, direction: 'up' | 'down') => void;
  onGroup?: () => void;
  onUngroup?: (groupId: string) => void;
}

export const LayersPanel: React.FC<LayersPanelProps> = ({
  shapes,
  selectedIds,
  onSelect,
  onUpdateShape,
  onDeleteShapes,
  onDuplicateShapes,
  onReorder,
  onGroup,
  onUngroup,
}) => {
  const [activeTab, setActiveTab] = useState<'layers' | 'assets'>('layers');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const getShapeIcon = (type: CanvasShape['type']) => {
    switch (type) {
      case 'group':
        return <Folder size={13} className="text-[#a855f7]" />;
      case 'image':
        return <FileImage size={13} className="text-[#06b6d4]" />;
      case 'rect':
        return <Square size={13} className="text-[#a1a1aa]" />;
      case 'ellipse':
        return <Circle size={13} className="text-[#a1a1aa]" />;
      case 'text':
        return <Type size={13} className="text-[#ffffff]" />;
      case 'frame':
        return <Frame size={13} className="text-[#0d99ff]" />;
      case 'star':
        return <Star size={13} className="text-[#f59e0b]" />;
      case 'line':
        return <Minus size={13} className="text-[#38bdf8]" />;
      case 'arrow':
        return <MoveRight size={13} className="text-[#38bdf8]" />;
    }
  };

  const startRename = (shape: CanvasShape) => {
    setEditingId(shape.id);
    setNameInput(shape.name);
  };

  const finishRename = (id: string) => {
    if (nameInput.trim()) {
      onUpdateShape(id, { name: nameInput.trim() });
    }
    setEditingId(null);
  };

  const filteredShapes = shapes.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Figma renders top = frontmost
  const reversedShapes = [...filteredShapes].reverse();

  return (
    <aside className="w-64 bg-[#202023] border-r border-[#2e2e33] flex flex-col z-20 select-none shadow-sm">
      {/* Top Tabs: Layers vs Assets */}
      <div className="h-10 border-b border-[#2e2e33] px-3 flex items-center justify-between bg-[#1c1c1f]">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('layers')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
              activeTab === 'layers'
                ? 'bg-[#2a2a2e] text-white shadow-sm'
                : 'text-[#71717a] hover:text-white'
            }`}
          >
            Layers
          </button>
          <button
            onClick={() => setActiveTab('assets')}
            className={`flex items-center space-x-1 px-3 py-1 rounded-md text-xs font-semibold transition ${
              activeTab === 'assets'
                ? 'bg-[#2a2a2e] text-white shadow-sm'
                : 'text-[#71717a] hover:text-white'
            }`}
          >
            <Boxes size={12} />
            <span>Assets</span>
          </button>
        </div>

        <span className="text-[10px] font-mono bg-[#2a2a2e] px-1.5 py-0.5 rounded text-[#71717a]">
          {shapes.length}
        </span>
      </div>

      {activeTab === 'assets' ? (
        /* Assets Tab */
        <div className="p-4 text-center text-xs text-[#71717a] space-y-2">
          <Component size={24} className="mx-auto text-[#52525b]" />
          <p className="font-medium text-[#d4d4d8]">Local Components</p>
          <p className="text-[11px] leading-relaxed">
            Create reusable design components by framing your buttons and cards.
          </p>
        </div>
      ) : (
        /* Layers Tab */
        <>
          {/* Search bar */}
          <div className="p-2 border-b border-[#2e2e33]">
            <div className="flex items-center bg-[#17171a] px-2 py-1 rounded-lg border border-[#2e2e33] space-x-1.5">
              <Search size={12} className="text-[#52525b]" />
              <input
                type="text"
                placeholder="Search layers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-white text-[11px] outline-none placeholder-[#52525b]"
              />
            </div>
          </div>

          {/* Layer List */}
          <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
            {reversedShapes.length === 0 ? (
              <div className="text-center py-12 text-xs text-[#52525b]">
                {searchQuery ? 'No matching layers' : 'Canvas is empty.\nDraw a frame or shape to begin!'}
              </div>
            ) : (
              reversedShapes.map((shape) => {
                const isSelected = selectedIds.includes(shape.id);
                const isEditing = editingId === shape.id;
                const isChild = shape.parentId != null;

                return (
                  <div
                    key={shape.id}
                    onClick={(e) => onSelect(shape.id, e.shiftKey || e.metaKey)}
                    className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                      isChild ? 'ml-3' : ''
                    } ${
                      isSelected
                        ? 'bg-[#0d99ff] text-white shadow-sm'
                        : 'text-[#d4d4d8] hover:bg-[#2a2a2e]'
                    }`}
                  >
                    <div className="flex items-center space-x-2 flex-1 min-w-0 mr-1">
                      {getShapeIcon(shape.type)}
                      {isEditing ? (
                        <input
                          type="text"
                          value={nameInput}
                          autoFocus
                          onChange={(e) => setNameInput(e.target.value)}
                          onBlur={() => finishRename(shape.id)}
                          onKeyDown={(e) => e.key === 'Enter' && finishRename(shape.id)}
                          className="bg-[#17171a] text-white px-1.5 py-0.5 rounded text-xs w-full outline-none"
                        />
                      ) : (
                        <span
                          onDoubleClick={() => startRename(shape)}
                          className="truncate font-medium text-[11px] tracking-tight"
                          title="Double-click to rename"
                        >
                          {shape.name}
                        </span>
                      )}
                    </div>

                    {/* Quick Layer Controls */}
                    <div
                      className={`flex items-center space-x-0.5 ${
                        isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onReorder(shape.id, 'up');
                        }}
                        title="Bring Forward"
                        className="p-1 hover:bg-[#ffffff20] rounded transition"
                      >
                        <ChevronUp size={11} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onReorder(shape.id, 'down');
                        }}
                        title="Send Backward"
                        className="p-1 hover:bg-[#ffffff20] rounded transition"
                      >
                        <ChevronDown size={11} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateShape(shape.id, { locked: !shape.locked });
                        }}
                        title={shape.locked ? 'Unlock' : 'Lock'}
                        className="p-1 hover:bg-[#ffffff20] rounded transition"
                      >
                        {shape.locked ? <Lock size={11} /> : <Unlock size={11} />}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateShape(shape.id, { visible: !shape.visible });
                        }}
                        title={shape.visible ? 'Hide' : 'Show'}
                        className="p-1 hover:bg-[#ffffff20] rounded transition"
                      >
                        {shape.visible ? <Eye size={11} /> : <EyeOff size={11} />}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Batch Actions */}
          {selectedIds.length > 0 && (
            <div className="p-2 border-t border-[#2e2e33] bg-[#1a1a1d] flex items-center justify-between gap-1 text-xs">
              {selectedIds.length >= 1 && onGroup && (
                <button
                  onClick={onGroup}
                  title="Group Selection (⌘G)"
                  className="flex items-center space-x-1 px-2 py-1 rounded-md bg-[#252528] hover:bg-[#303035] text-[#a855f7] hover:text-white transition shadow-sm border border-[#333338]"
                >
                  <Folder size={11} />
                  <span className="text-[11px]">Group</span>
                </button>
              )}
              {selectedIds.some((id) => {
                const s = shapes.find((sh) => sh.id === id);
                return s?.type === 'group' || !!s?.parentId;
              }) &&
                onUngroup && (
                  <button
                    onClick={() => {
                      const grp = shapes.find((s) => selectedIds.includes(s.id) && s.type === 'group');
                      const child = shapes.find((s) => selectedIds.includes(s.id) && s.parentId);
                      onUngroup(grp?.id || child?.parentId || '');
                    }}
                    title="Ungroup (⇧⌘G)"
                    className="flex items-center space-x-1 px-2 py-1 rounded-md bg-[#252528] hover:bg-[#303035] text-[#d4d4d8] hover:text-white transition shadow-sm border border-[#333338]"
                  >
                    <span className="text-[11px]">Ungroup</span>
                  </button>
                )}
              <button
                onClick={() => onDuplicateShapes(selectedIds)}
                className="flex items-center space-x-1 px-2 py-1 rounded-md bg-[#252528] hover:bg-[#303035] text-[#d4d4d8] hover:text-white transition shadow-sm border border-[#333338]"
              >
                <Copy size={11} />
                <span className="text-[11px]">Duplicate</span>
              </button>
              <button
                onClick={() => onDeleteShapes(selectedIds)}
                className="flex items-center space-x-1 px-2 py-1 rounded-md bg-[#252528] hover:bg-[#f43f5e20] text-[#f43f5e] transition shadow-sm border border-[#333338]"
              >
                <Trash2 size={11} />
                <span className="text-[11px]">Delete</span>
              </button>
            </div>
          )}
        </>
      )}
    </aside>
  );
};
