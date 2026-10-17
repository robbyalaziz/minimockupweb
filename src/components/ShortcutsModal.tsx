import React from 'react';
import { X, Keyboard, Command } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    {
      category: 'Design Tools',
      items: [
        { label: 'Move / Select Tool', key: 'V' },
        { label: 'Hand / Pan Tool', key: 'H / Space' },
        { label: 'Frame (Artboard)', key: 'F' },
        { label: 'Rectangle', key: 'R' },
        { label: 'Ellipse / Circle', key: 'O' },
        { label: 'Text Block', key: 'T' },
        { label: 'Line Segment', key: 'L' },
        { label: 'Directional Arrow', key: 'A' },
        { label: 'Place Image...', key: '⇧⌘K' },
      ],
    },
    {
      category: 'Editing & Arrange',
      items: [
        { label: 'Group Selection', key: '⌘G' },
        { label: 'Ungroup', key: '⇧⌘G' },
        { label: 'Undo Action', key: '⌘Z' },
        { label: 'Redo Action', key: '⇧⌘Z' },
        { label: 'Duplicate Selection', key: '⌘D' },
        { label: 'Delete Selected', key: 'Delete' },
        { label: 'Save Project (.json)', key: '⌘S' },
        { label: 'New Project Presets', key: '⌘N' },
        { label: 'Nudge 1px', key: '↑ ↓ ← →' },
        { label: 'Nudge 10px', key: '⇧ + Arrow' },
      ],
    },
    {
      category: 'Canvas & View',
      items: [
        { label: 'Presentation Mode', key: 'Play' },
        { label: 'Zoom to Fit', key: '⇧1' },
        { label: 'Zoom to 100%', key: '⌘0' },
        { label: 'Zoom In / Out', key: '⌘+ / ⌘-' },
        { label: 'Marquee Multi-Select', key: 'Drag' },
        { label: 'Exit / Deselect', key: 'Esc' },
        { label: 'In-Place Text Edit', key: 'Double Click' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-150 select-none">
      <div className="w-[620px] bg-[#202023] border border-[#333338] rounded-2xl shadow-2xl overflow-hidden flex flex-col text-[#e4e4e7]">
        {/* Header */}
        <div className="h-14 px-6 border-b border-[#2e2e33] flex items-center justify-between bg-[#1c1c1f]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0d99ff15] border border-[#0d99ff30] flex items-center justify-center text-[#0d99ff]">
              <Keyboard size={16} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Figma Keyboard Shortcuts</h2>
              <p className="text-[11px] text-[#71717a]">
                Pro keyboard shortcuts for ultra-fast vector design
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

        {/* Content */}
        <div className="p-6 grid grid-cols-3 gap-5 max-h-[460px] overflow-y-auto">
          {shortcuts.map((group) => (
            <div key={group.category} className="space-y-2.5">
              <div className="text-[10px] font-semibold text-[#a1a1aa] uppercase tracking-wider">
                {group.category}
              </div>
              <div className="space-y-1.5">
                {group.items.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between p-1.5 rounded-lg bg-[#17171a] border border-[#2e2e33] text-[11px]"
                  >
                    <span className="text-[#d4d4d8] truncate max-w-[95px]">{item.label}</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-[#26262a] border border-[#38383e] font-mono text-[10px] text-[#0d99ff] font-semibold shadow-xs">
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#2e2e33] bg-[#1a1a1d] flex items-center justify-between text-[11px] text-[#71717a]">
          <span className="flex items-center space-x-1">
            <Command size={12} className="text-[#0d99ff]" />
            <span>Fully compatible with standard macOS and Windows accelerators</span>
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-[#28282d] hover:bg-[#34343a] text-white rounded-lg text-xs font-medium transition border border-[#38383e]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
