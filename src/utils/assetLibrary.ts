import { CanvasShape } from '../types';

export interface UIAsset {
  id: string;
  name: string;
  category: 'Buttons' | 'Cards' | 'Forms & Badges' | 'Avatars & Media';
  description: string;
  badge?: string;
  thumbnailUrl?: string;
  previewBg?: string;
  createShapes: (baseX: number, baseY: number) => CanvasShape[];
}

export const ASSET_LIBRARY: UIAsset[] = [
  // --- BUTTONS ---
  {
    id: 'asset-btn-primary',
    name: 'Primary Button',
    category: 'Buttons',
    description: 'Call-to-action button with arrow icon',
    badge: 'Component',
    previewBg: '#0d99ff',
    createShapes: (x, y) => {
      const ts = Date.now();
      const groupId = `group-btn-${ts}`;
      const rectId = `shape-btn-bg-${ts}`;
      const textId = `shape-btn-txt-${ts}`;

      const bg: CanvasShape = {
        id: rectId,
        name: 'Button Background',
        type: 'rect',
        x: x,
        y: y,
        width: 140,
        height: 40,
        rotation: 0,
        fill: '#0d99ff',
        stroke: 'none',
        strokeWidth: 0,
        cornerRadius: 8,
        opacity: 1,
        visible: true,
        locked: false,
        parentId: groupId,
        hasShadow: true,
        shadowColor: 'rgba(13, 153, 255, 0.4)',
        shadowBlur: 12,
        shadowY: 4,
      };

      const txt: CanvasShape = {
        id: textId,
        name: 'Button Label',
        type: 'text',
        x: x,
        y: y,
        width: 140,
        height: 40,
        rotation: 0,
        fill: '#ffffff',
        stroke: 'none',
        strokeWidth: 0,
        cornerRadius: 0,
        opacity: 1,
        visible: true,
        locked: false,
        parentId: groupId,
        text: 'Get Started  →',
        fontSize: 13,
        fontWeight: '600',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        textAlign: 'center',
      };

      const group: CanvasShape = {
        id: groupId,
        name: 'Primary Button',
        type: 'group',
        x: x,
        y: y,
        width: 140,
        height: 40,
        rotation: 0,
        fill: 'transparent',
        stroke: 'none',
        strokeWidth: 0,
        cornerRadius: 0,
        opacity: 1,
        visible: true,
        locked: false,
      };

      return [bg, txt, group];
    },
  },
  {
    id: 'asset-btn-gradient',
    name: 'Pro Gradient Button',
    category: 'Buttons',
    description: 'Vibrant purple pill button for premium features',
    badge: 'Component',
    previewBg: '#8b5cf6',
    createShapes: (x, y) => {
      const ts = Date.now();
      const groupId = `group-btn-grad-${ts}`;
      const rectId = `shape-btn-bg-${ts}`;
      const textId = `shape-btn-txt-${ts}`;

      const bg: CanvasShape = {
        id: rectId,
        name: 'Pro Button Background',
        type: 'rect',
        x: x,
        y: y,
        width: 160,
        height: 44,
        rotation: 0,
        fill: '#8b5cf6',
        stroke: '#a855f7',
        strokeWidth: 1,
        cornerRadius: 22,
        opacity: 1,
        visible: true,
        locked: false,
        parentId: groupId,
        hasShadow: true,
        shadowColor: 'rgba(139, 92, 246, 0.45)',
        shadowBlur: 16,
        shadowY: 6,
      };

      const txt: CanvasShape = {
        id: textId,
        name: 'Pro Button Label',
        type: 'text',
        x: x,
        y: y,
        width: 160,
        height: 44,
        rotation: 0,
        fill: '#ffffff',
        stroke: 'none',
        strokeWidth: 0,
        cornerRadius: 0,
        opacity: 1,
        visible: true,
        locked: false,
        parentId: groupId,
        text: 'Upgrade to Pro ✨',
        fontSize: 13,
        fontWeight: 'bold',
        fontFamily: "'Inter', sans-serif",
        textAlign: 'center',
      };

      const group: CanvasShape = {
        id: groupId,
        name: 'Pro Gradient Button',
        type: 'group',
        x: x,
        y: y,
        width: 160,
        height: 44,
        rotation: 0,
        fill: 'transparent',
        stroke: 'none',
        strokeWidth: 0,
        cornerRadius: 0,
        opacity: 1,
        visible: true,
        locked: false,
      };

      return [bg, txt, group];
    },
  },
  {
    id: 'asset-btn-secondary',
    name: 'Outline Button',
    category: 'Buttons',
    description: 'Dark minimalist outlined secondary button',
    badge: 'Component',
    previewBg: '#27272a',
    createShapes: (x, y) => {
      const ts = Date.now();
      const groupId = `group-btn-sec-${ts}`;
      const rectId = `shape-btn-bg-${ts}`;
      const textId = `shape-btn-txt-${ts}`;

      const bg: CanvasShape = {
        id: rectId,
        name: 'Outline Background',
        type: 'rect',
        x: x,
        y: y,
        width: 130,
        height: 38,
        rotation: 0,
        fill: '#18181b',
        stroke: '#3f3f46',
        strokeWidth: 1.5,
        cornerRadius: 8,
        opacity: 1,
        visible: true,
        locked: false,
        parentId: groupId,
      };

      const txt: CanvasShape = {
        id: textId,
        name: 'Outline Label',
        type: 'text',
        x: x,
        y: y,
        width: 130,
        height: 38,
        rotation: 0,
        fill: '#e4e4e7',
        stroke: 'none',
        strokeWidth: 0,
        cornerRadius: 0,
        opacity: 1,
        visible: true,
        locked: false,
        parentId: groupId,
        text: 'Documentation',
        fontSize: 12,
        fontWeight: '500',
        fontFamily: "'Inter', sans-serif",
        textAlign: 'center',
      };

      const group: CanvasShape = {
        id: groupId,
        name: 'Secondary Outline Button',
        type: 'group',
        x: x,
        y: y,
        width: 130,
        height: 38,
        rotation: 0,
        fill: 'transparent',
        stroke: 'none',
        strokeWidth: 0,
        cornerRadius: 0,
        opacity: 1,
        visible: true,
        locked: false,
      };

      return [bg, txt, group];
    },
  },

  // --- CARDS ---
  {
    id: 'asset-card-metric',
    name: 'KPI Metric Stat Card',
    category: 'Cards',
    description: 'Dashboard metric tile with growth badge',
    badge: 'Widget',
    previewBg: '#1f1f23',
    createShapes: (x, y) => {
      const ts = Date.now();
      const groupId = `group-metric-${ts}`;

      const cardBg: CanvasShape = {
        id: `card-bg-${ts}`,
        name: 'Card Background',
        type: 'rect',
        x: x,
        y: y,
        width: 240,
        height: 124,
        rotation: 0,
        fill: '#1c1c20',
        stroke: '#2e2e34',
        strokeWidth: 1.5,
        cornerRadius: 14,
        opacity: 1,
        visible: true,
        locked: false,
        parentId: groupId,
        hasShadow: true,
        shadowColor: 'rgba(0,0,0,0.5)',
        shadowBlur: 20,
        shadowY: 8,
      };

      const title: CanvasShape = {
        id: `card-title-${ts}`,
        name: 'Metric Title',
        type: 'text',
        x: x + 18,
        y: y + 16,
        width: 200,
        height: 16,
        rotation: 0,
        fill: '#8e8e93',
        stroke: 'none',
        strokeWidth: 0,
        cornerRadius: 0,
        opacity: 1,
        visible: true,
        locked: false,
        parentId: groupId,
        text: 'TOTAL REVENUE',
        fontSize: 11,
        fontWeight: '600',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        textAlign: 'left',
      };

      const value: CanvasShape = {
        id: `card-val-${ts}`,
        name: 'Metric Value',
        type: 'text',
        x: x + 18,
        y: y + 42,
        width: 200,
        height: 36,
        rotation: 0,
        fill: '#ffffff',
        stroke: 'none',
        strokeWidth: 0,
        cornerRadius: 0,
        opacity: 1,
        visible: true,
        locked: false,
        parentId: groupId,
        text: '$128,450.00',
        fontSize: 24,
        fontWeight: 'bold',
        fontFamily: "'Outfit', sans-serif",
        textAlign: 'left',
      };

      const badgeBg: CanvasShape = {
        id: `badge-bg-${ts}`,
        name: 'Growth Badge Bg',
        type: 'rect',
        x: x + 18,
        y: y + 84,
        width: 130,
        height: 22,
        rotation: 0,
        fill: '#10b98120',
        stroke: '#10b98140',
        strokeWidth: 1,
        cornerRadius: 6,
        opacity: 1,
        visible: true,
        locked: false,
        parentId: groupId,
      };

      const badgeTxt: CanvasShape = {
        id: `badge-txt-${ts}`,
        name: 'Growth Badge Label',
        type: 'text',
        x: x + 18,
        y: y + 84,
        width: 130,
        height: 22,
        rotation: 0,
        fill: '#10b981',
        stroke: 'none',
        strokeWidth: 0,
        cornerRadius: 0,
        opacity: 1,
        visible: true,
        locked: false,
        parentId: groupId,
        text: '+18.4% this month',
        fontSize: 10,
        fontWeight: '600',
        fontFamily: "'Inter', sans-serif",
        textAlign: 'center',
      };

      const group: CanvasShape = {
        id: groupId,
        name: 'Metric Stat Card',
        type: 'group',
        x: x,
        y: y,
        width: 240,
        height: 124,
        rotation: 0,
        fill: 'transparent',
        stroke: 'none',
        strokeWidth: 0,
        cornerRadius: 0,
        opacity: 1,
        visible: true,
        locked: false,
      };

      return [cardBg, title, value, badgeBg, badgeTxt, group];
    },
  },
  {
    id: 'asset-card-profile',
    name: 'User Profile Card',
    category: 'Cards',
    description: 'Designer profile card with avatar, role and action',
    badge: 'Widget',
    previewBg: '#1f1f23',
    createShapes: (x, y) => {
      const ts = Date.now();
      const groupId = `group-profile-${ts}`;

      const cardBg: CanvasShape = {
        id: `prof-bg-${ts}`,
        name: 'Profile Card Bg',
        type: 'rect',
        x: x,
        y: y,
        width: 260,
        height: 96,
        rotation: 0,
        fill: '#18181b',
        stroke: '#2e2e33',
        strokeWidth: 1.5,
        cornerRadius: 16,
        opacity: 1,
        visible: true,
        locked: false,
        parentId: groupId,
        hasShadow: true,
        shadowColor: 'rgba(0,0,0,0.5)',
        shadowBlur: 24,
        shadowY: 8,
      };

      const avatar: CanvasShape = {
        id: `prof-avatar-${ts}`,
        name: 'Profile Avatar',
        type: 'image',
        imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
        imageFit: 'cover',
        x: x + 16,
        y: y + 20,
        width: 56,
        height: 56,
        rotation: 0,
        fill: '#ffffff',
        stroke: '#0d99ff',
        strokeWidth: 2,
        cornerRadius: 28,
        opacity: 1,
        visible: true,
        locked: false,
        parentId: groupId,
      };

      const name: CanvasShape = {
        id: `prof-name-${ts}`,
        name: 'User Name',
        type: 'text',
        x: x + 84,
        y: y + 24,
        width: 160,
        height: 20,
        rotation: 0,
        fill: '#ffffff',
        stroke: 'none',
        strokeWidth: 0,
        cornerRadius: 0,
        opacity: 1,
        visible: true,
        locked: false,
        parentId: groupId,
        text: 'Sarah Jenkins',
        fontSize: 14,
        fontWeight: 'bold',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        textAlign: 'left',
      };

      const role: CanvasShape = {
        id: `prof-role-${ts}`,
        name: 'User Role',
        type: 'text',
        x: x + 84,
        y: y + 46,
        width: 160,
        height: 18,
        rotation: 0,
        fill: '#8e8e93',
        stroke: 'none',
        strokeWidth: 0,
        cornerRadius: 0,
        opacity: 1,
        visible: true,
        locked: false,
        parentId: groupId,
        text: 'Senior Product Designer',
        fontSize: 11,
        fontWeight: 'normal',
        fontFamily: "'Inter', sans-serif",
        textAlign: 'left',
      };

      const group: CanvasShape = {
        id: groupId,
        name: 'User Profile Card',
        type: 'group',
        x: x,
        y: y,
        width: 260,
        height: 96,
        rotation: 0,
        fill: 'transparent',
        stroke: 'none',
        strokeWidth: 0,
        cornerRadius: 0,
        opacity: 1,
        visible: true,
        locked: false,
      };

      return [cardBg, avatar, name, role, group];
    },
  },
  {
    id: 'asset-card-banner',
    name: 'Notification Banner',
    category: 'Cards',
    description: 'Gradient alert banner with icon and message',
    badge: 'Component',
    previewBg: '#18181b',
    createShapes: (x, y) => {
      const ts = Date.now();
      const groupId = `group-banner-${ts}`;

      const bannerBg: CanvasShape = {
        id: `banner-bg-${ts}`,
        name: 'Banner Background',
        type: 'rect',
        x: x,
        y: y,
        width: 320,
        height: 48,
        rotation: 0,
        fill: '#1c1c20',
        stroke: '#0d99ff50',
        strokeWidth: 1.5,
        cornerRadius: 12,
        opacity: 1,
        visible: true,
        locked: false,
        parentId: groupId,
        hasShadow: true,
        shadowColor: 'rgba(13, 153, 255, 0.25)',
        shadowBlur: 16,
        shadowY: 4,
      };

      const bannerText: CanvasShape = {
        id: `banner-txt-${ts}`,
        name: 'Banner Content',
        type: 'text',
        x: x + 16,
        y: y,
        width: 290,
        height: 48,
        rotation: 0,
        fill: '#ffffff',
        stroke: 'none',
        strokeWidth: 0,
        cornerRadius: 0,
        opacity: 1,
        visible: true,
        locked: false,
        parentId: groupId,
        text: '🚀 Version 2.0 released with live collaboration!',
        fontSize: 11,
        fontWeight: '500',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        textAlign: 'left',
      };

      const group: CanvasShape = {
        id: groupId,
        name: 'Notification Banner',
        type: 'group',
        x: x,
        y: y,
        width: 320,
        height: 48,
        rotation: 0,
        fill: 'transparent',
        stroke: 'none',
        strokeWidth: 0,
        cornerRadius: 0,
        opacity: 1,
        visible: true,
        locked: false,
      };

      return [bannerBg, bannerText, group];
    },
  },

  // --- FORMS & BADGES ---
  {
    id: 'asset-form-search',
    name: 'Modern Search Bar',
    category: 'Forms & Badges',
    description: 'Clean search input bar with shortcut hint',
    badge: 'Input',
    previewBg: '#1f1f23',
    createShapes: (x, y) => {
      const ts = Date.now();
      const groupId = `group-search-${ts}`;

      const bg: CanvasShape = {
        id: `search-bg-${ts}`,
        name: 'Search Bar Bg',
        type: 'rect',
        x: x,
        y: y,
        width: 280,
        height: 42,
        rotation: 0,
        fill: '#18181b',
        stroke: '#2e2e33',
        strokeWidth: 1.5,
        cornerRadius: 10,
        opacity: 1,
        visible: true,
        locked: false,
        parentId: groupId,
      };

      const text: CanvasShape = {
        id: `search-txt-${ts}`,
        name: 'Search Placeholder',
        type: 'text',
        x: x + 16,
        y: y,
        width: 200,
        height: 42,
        rotation: 0,
        fill: '#71717a',
        stroke: 'none',
        strokeWidth: 0,
        cornerRadius: 0,
        opacity: 1,
        visible: true,
        locked: false,
        parentId: groupId,
        text: '🔍  Search layers, components...',
        fontSize: 12,
        fontWeight: 'normal',
        fontFamily: "'Inter', sans-serif",
        textAlign: 'left',
      };

      const kbdBg: CanvasShape = {
        id: `search-kbd-bg-${ts}`,
        name: 'Kbd Hint Bg',
        type: 'rect',
        x: x + 236,
        y: y + 10,
        width: 32,
        height: 22,
        rotation: 0,
        fill: '#27272a',
        stroke: '#3f3f46',
        strokeWidth: 1,
        cornerRadius: 5,
        opacity: 1,
        visible: true,
        locked: false,
        parentId: groupId,
      };

      const kbdTxt: CanvasShape = {
        id: `search-kbd-txt-${ts}`,
        name: 'Kbd Hint Text',
        type: 'text',
        x: x + 236,
        y: y + 10,
        width: 32,
        height: 22,
        rotation: 0,
        fill: '#a1a1aa',
        stroke: 'none',
        strokeWidth: 0,
        cornerRadius: 0,
        opacity: 1,
        visible: true,
        locked: false,
        parentId: groupId,
        text: '⌘K',
        fontSize: 10,
        fontWeight: '600',
        fontFamily: 'monospace',
        textAlign: 'center',
      };

      const group: CanvasShape = {
        id: groupId,
        name: 'Modern Search Bar',
        type: 'group',
        x: x,
        y: y,
        width: 280,
        height: 42,
        rotation: 0,
        fill: 'transparent',
        stroke: 'none',
        strokeWidth: 0,
        cornerRadius: 0,
        opacity: 1,
        visible: true,
        locked: false,
      };

      return [bg, text, kbdBg, kbdTxt, group];
    },
  },
  {
    id: 'asset-badge-status-active',
    name: 'Active Status Pill',
    category: 'Forms & Badges',
    description: 'Emerald green status indicator badge',
    badge: 'Badge',
    previewBg: '#10b98125',
    createShapes: (x, y) => {
      const ts = Date.now();
      const groupId = `group-status-act-${ts}`;

      const bg: CanvasShape = {
        id: `badge-bg-${ts}`,
        name: 'Badge Background',
        type: 'rect',
        x: x,
        y: y,
        width: 90,
        height: 26,
        rotation: 0,
        fill: '#10b98120',
        stroke: '#10b98150',
        strokeWidth: 1,
        cornerRadius: 13,
        opacity: 1,
        visible: true,
        locked: false,
        parentId: groupId,
      };

      const dot: CanvasShape = {
        id: `badge-dot-${ts}`,
        name: 'Status Dot',
        type: 'ellipse',
        x: x + 10,
        y: y + 9,
        width: 8,
        height: 8,
        rotation: 0,
        fill: '#10b981',
        stroke: 'none',
        strokeWidth: 0,
        cornerRadius: 0,
        opacity: 1,
        visible: true,
        locked: false,
        parentId: groupId,
      };

      const txt: CanvasShape = {
        id: `badge-lbl-${ts}`,
        name: 'Badge Label',
        type: 'text',
        x: x + 24,
        y: y,
        width: 58,
        height: 26,
        rotation: 0,
        fill: '#10b981',
        stroke: 'none',
        strokeWidth: 0,
        cornerRadius: 0,
        opacity: 1,
        visible: true,
        locked: false,
        parentId: groupId,
        text: 'Active',
        fontSize: 11,
        fontWeight: '600',
        fontFamily: "'Inter', sans-serif",
        textAlign: 'left',
      };

      const group: CanvasShape = {
        id: groupId,
        name: 'Active Status Pill',
        type: 'group',
        x: x,
        y: y,
        width: 90,
        height: 26,
        rotation: 0,
        fill: 'transparent',
        stroke: 'none',
        strokeWidth: 0,
        cornerRadius: 0,
        opacity: 1,
        visible: true,
        locked: false,
      };

      return [bg, dot, txt, group];
    },
  },
  {
    id: 'asset-toggle-switch',
    name: 'Interactive Toggle Switch',
    category: 'Forms & Badges',
    description: 'Active toggle switch slider control',
    badge: 'Control',
    previewBg: '#10b981',
    createShapes: (x, y) => {
      const ts = Date.now();
      const groupId = `group-toggle-${ts}`;

      const track: CanvasShape = {
        id: `toggle-track-${ts}`,
        name: 'Toggle Track',
        type: 'rect',
        x: x,
        y: y,
        width: 50,
        height: 28,
        rotation: 0,
        fill: '#10b981',
        stroke: 'none',
        strokeWidth: 0,
        cornerRadius: 14,
        opacity: 1,
        visible: true,
        locked: false,
        parentId: groupId,
      };

      const knob: CanvasShape = {
        id: `toggle-knob-${ts}`,
        name: 'Toggle Knob',
        type: 'ellipse',
        x: x + 26,
        y: y + 3,
        width: 22,
        height: 22,
        rotation: 0,
        fill: '#ffffff',
        stroke: 'none',
        strokeWidth: 0,
        cornerRadius: 0,
        opacity: 1,
        visible: true,
        locked: false,
        parentId: groupId,
        hasShadow: true,
        shadowColor: 'rgba(0,0,0,0.3)',
        shadowBlur: 6,
        shadowY: 2,
      };

      const group: CanvasShape = {
        id: groupId,
        name: 'Toggle Switch',
        type: 'group',
        x: x,
        y: y,
        width: 50,
        height: 28,
        rotation: 0,
        fill: 'transparent',
        stroke: 'none',
        strokeWidth: 0,
        cornerRadius: 0,
        opacity: 1,
        visible: true,
        locked: false,
      };

      return [track, knob, group];
    },
  },

  // --- AVATARS & MEDIA ---
  {
    id: 'asset-avatar-male',
    name: 'Executive Avatar Photo',
    category: 'Avatars & Media',
    description: 'High quality portrait photo avatar',
    badge: 'Photo',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
    createShapes: (x, y) => {
      const ts = Date.now();
      return [
        {
          id: `avatar-m-${ts}`,
          name: 'Executive Avatar',
          type: 'image',
          imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80',
          imageFit: 'cover',
          x: x,
          y: y,
          width: 72,
          height: 72,
          rotation: 0,
          fill: '#ffffff',
          stroke: '#0d99ff',
          strokeWidth: 2,
          cornerRadius: 36,
          opacity: 1,
          visible: true,
          locked: false,
          hasShadow: true,
          shadowColor: 'rgba(0,0,0,0.3)',
          shadowBlur: 12,
          shadowY: 4,
        },
      ];
    },
  },
  {
    id: 'asset-avatar-female',
    name: 'Designer Avatar Photo',
    category: 'Avatars & Media',
    description: 'Modern creative team member avatar',
    badge: 'Photo',
    thumbnailUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
    createShapes: (x, y) => {
      const ts = Date.now();
      return [
        {
          id: `avatar-f-${ts}`,
          name: 'Designer Avatar',
          type: 'image',
          imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80',
          imageFit: 'cover',
          x: x,
          y: y,
          width: 72,
          height: 72,
          rotation: 0,
          fill: '#ffffff',
          stroke: '#8b5cf6',
          strokeWidth: 2,
          cornerRadius: 36,
          opacity: 1,
          visible: true,
          locked: false,
          hasShadow: true,
          shadowColor: 'rgba(0,0,0,0.3)',
          shadowBlur: 12,
          shadowY: 4,
        },
      ];
    },
  },
  {
    id: 'asset-media-hero',
    name: 'SaaS App Mockup Hero',
    category: 'Avatars & Media',
    description: 'Polished dashboard workspace visual banner',
    badge: 'Visual',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=320&q=80',
    createShapes: (x, y) => {
      const ts = Date.now();
      return [
        {
          id: `media-hero-${ts}`,
          name: 'Dashboard UI Mockup',
          type: 'image',
          imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
          imageFit: 'cover',
          x: x,
          y: y,
          width: 380,
          height: 220,
          rotation: 0,
          fill: '#ffffff',
          stroke: '#2e2e33',
          strokeWidth: 1.5,
          cornerRadius: 16,
          opacity: 1,
          visible: true,
          locked: false,
          hasShadow: true,
          shadowColor: 'rgba(0,0,0,0.6)',
          shadowBlur: 32,
          shadowY: 14,
        },
      ];
    },
  },
  {
    id: 'asset-media-gradient',
    name: 'Abstract 3D Wave Wallpaper',
    category: 'Avatars & Media',
    description: 'Modern dark mode colorful gradient card background',
    badge: 'Texture',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=320&q=80',
    createShapes: (x, y) => {
      const ts = Date.now();
      return [
        {
          id: `media-grad-${ts}`,
          name: 'Abstract 3D Gradient',
          type: 'image',
          imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
          imageFit: 'cover',
          x: x,
          y: y,
          width: 320,
          height: 180,
          rotation: 0,
          fill: '#ffffff',
          stroke: '#3f3f46',
          strokeWidth: 1,
          cornerRadius: 14,
          opacity: 1,
          visible: true,
          locked: false,
          hasShadow: true,
          shadowColor: 'rgba(0,0,0,0.4)',
          shadowBlur: 20,
          shadowY: 8,
        },
      ];
    },
  },
];
