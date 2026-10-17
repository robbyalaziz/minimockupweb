import React, { useState, useEffect, useCallback } from 'react';
import { CanvasShape, ToolType, Viewport, Project, ScreenPreset } from './types';
import { Toolbar } from './components/Toolbar';
import { LayersPanel } from './components/LayersPanel';
import { PropertiesPanel } from './components/PropertiesPanel';
import { Canvas } from './components/Canvas';
import { ScreenPresetsModal } from './components/ScreenPresetsModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { exportToSVG, exportToPNG, downloadFile } from './utils/export';
import { getDefaultProjects } from './utils/presets';

const STORAGE_KEY = 'mini_figma_projects_store_v3';

const loadStoredProjects = (): Project[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not load stored projects:', err);
  }
  return getDefaultProjects();
};

export const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>(loadStoredProjects);
  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    const initial = loadStoredProjects();
    return initial[0]?.id || 'proj-saas-dashboard';
  });

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  const [shapes, setShapes] = useState<CanvasShape[]>(() => activeProject?.shapes || []);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [viewport, setViewport] = useState<Viewport>(() => activeProject?.viewport || { x: 120, y: 50, zoom: 0.85 });

  // Screen Presets Modal
  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState(false);
  const [presetsModalMode, setPresetsModalMode] = useState<'new-project' | 'insert-frame'>('new-project');

  // Shortcuts Cheatsheet Modal
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Prototype Presentation Mode
  const [isPresenting, setIsPresenting] = useState(false);

  // History stack for Undo / Redo
  const [history, setHistory] = useState<CanvasShape[][]>([activeProject?.shapes || []]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Auto-save projects to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch (err) {
      console.warn('LocalStorage save error:', err);
    }
  }, [projects]);

  const pushHistory = useCallback(
    (newShapes: CanvasShape[]) => {
      const updatedHistory = history.slice(0, historyIndex + 1);
      updatedHistory.push(newShapes);
      setHistory(updatedHistory);
      setHistoryIndex(updatedHistory.length - 1);
    },
    [history, historyIndex]
  );

  // Apply updates to current canvas shapes AND active project
  const applyShapeUpdate = useCallback(
    (newShapes: CanvasShape[]) => {
      setShapes(newShapes);
      setProjects((prev) =>
        prev.map((p) =>
          p.id === activeProjectId
            ? { ...p, shapes: newShapes, updatedAt: Date.now() }
            : p
        )
      );
      pushHistory(newShapes);
    },
    [activeProjectId, pushHistory]
  );

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      const prevShapes = history[prevIndex];
      setShapes(prevShapes);
      setProjects((prev) =>
        prev.map((p) =>
          p.id === activeProjectId
            ? { ...p, shapes: prevShapes, updatedAt: Date.now() }
            : p
        )
      );
    }
  }, [history, historyIndex, activeProjectId]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      const nextShapes = history[nextIndex];
      setShapes(nextShapes);
      setProjects((prev) =>
        prev.map((p) =>
          p.id === activeProjectId
            ? { ...p, shapes: nextShapes, updatedAt: Date.now() }
            : p
        )
      );
    }
  }, [history, historyIndex, activeProjectId]);

  // Project Tab Switching
  const handleSelectProject = (id: string) => {
    if (id === activeProjectId) return;
    setProjects((prev) =>
      prev.map((p) =>
        p.id === activeProjectId ? { ...p, shapes, viewport, updatedAt: Date.now() } : p
      )
    );

    const target = projects.find((p) => p.id === id);
    if (target) {
      setActiveProjectId(id);
      setShapes(target.shapes);
      setViewport(target.viewport || { x: 120, y: 50, zoom: 0.85 });
      setSelectedIds([]);
      setHistory([target.shapes]);
      setHistoryIndex(0);
    }
  };

  // Close Project Tab
  const handleCloseProject = (id: string) => {
    if (projects.length <= 1) return;
    const remaining = projects.filter((p) => p.id !== id);
    setProjects(remaining);
    if (activeProjectId === id) {
      const next = remaining[0];
      setActiveProjectId(next.id);
      setShapes(next.shapes);
      setViewport(next.viewport || { x: 120, y: 50, zoom: 0.85 });
      setSelectedIds([]);
      setHistory([next.shapes]);
      setHistoryIndex(0);
    }
  };

  // Create Project via ScreenPresetsModal
  const handleCreateProject = (
    name: string,
    newShapes: CanvasShape[],
    category: 'mobile' | 'web' | 'dashboard' | 'custom'
  ) => {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name,
      shapes: newShapes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      category,
      viewport: { x: 120, y: 50, zoom: 0.85 },
    };

    const updated = [...projects, newProj];
    setProjects(updated);
    setActiveProjectId(newProj.id);
    setShapes(newShapes);
    setViewport(newProj.viewport);
    setSelectedIds([]);
    setHistory([newShapes]);
    setHistoryIndex(0);
  };

  // Insert Frame preset onto canvas
  const handleInsertFrame = (preset: ScreenPreset) => {
    const centerX = Math.round(-viewport.x / viewport.zoom + 120);
    const centerY = Math.round(-viewport.y / viewport.zoom + 80);
    const newFrame: CanvasShape = {
      id: `frame-${Date.now()}`,
      name: `${preset.name}`,
      type: 'frame',
      x: centerX,
      y: centerY,
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
    handleAddShape(newFrame);
  };

  const handleSelect = (id: string | null, isMulti = false) => {
    if (!id) {
      setSelectedIds([]);
      return;
    }
    if (isMulti) {
      if (selectedIds.includes(id)) {
        setSelectedIds(selectedIds.filter((item) => item !== id));
      } else {
        setSelectedIds([...selectedIds, id]);
      }
    } else {
      setSelectedIds([id]);
    }
  };

  const handleAddShape = (shape: CanvasShape) => {
    const updated = [...shapes, shape];
    applyShapeUpdate(updated);
    setSelectedIds([shape.id]);
  };

  const handleAddShapes = useCallback(
    (newShapes: CanvasShape[]) => {
      const updated = [...shapes, ...newShapes];
      applyShapeUpdate(updated);
      const grp = newShapes.find((s) => s.type === 'group');
      if (grp) {
        setSelectedIds([grp.id]);
      } else {
        setSelectedIds(newShapes.map((s) => s.id));
      }
    },
    [shapes, applyShapeUpdate]
  );

  const handleUpdateShape = (id: string, updates: Partial<CanvasShape>) => {
    const updated = shapes.map((s) => (s.id === id ? { ...s, ...updates } : s));
    applyShapeUpdate(updated);
  };

  const handleUpdateMultipleShapes = (updatesMap: Record<string, Partial<CanvasShape>>) => {
    const updated = shapes.map((s) => (updatesMap[s.id] ? { ...s, ...updatesMap[s.id] } : s));
    applyShapeUpdate(updated);
  };

  const handleUpdateSelectedShapes = (updates: Partial<CanvasShape>) => {
    const updated = shapes.map((s) => (selectedIds.includes(s.id) ? { ...s, ...updates } : s));
    applyShapeUpdate(updated);
  };

  const handleDeleteShapes = (ids: string[]) => {
    const allIdsToDelete = new Set<string>(ids);
    const addChildren = (groupId: string) => {
      shapes
        .filter((s) => s.parentId === groupId)
        .forEach((child) => {
          allIdsToDelete.add(child.id);
          if (child.type === 'group') addChildren(child.id);
        });
    };
    ids.forEach((id) => {
      const sh = shapes.find((s) => s.id === id);
      if (sh && sh.type === 'group') {
        addChildren(sh.id);
      }
    });

    const updated = shapes.filter((s) => !allIdsToDelete.has(s.id));
    applyShapeUpdate(updated);
    setSelectedIds([]);
  };

  const handleDuplicateShapes = (ids: string[]) => {
    const newItems: CanvasShape[] = [];
    const newIds: string[] = [];
    const idMap: Record<string, string> = {};

    const allTargets = shapes.filter((s) => ids.includes(s.id));
    allTargets.forEach((target) => {
      const newId = `shape-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      idMap[target.id] = newId;
      newIds.push(newId);
      newItems.push({
        ...target,
        id: newId,
        name: `${target.name} copy`,
        x: target.x + 24,
        y: target.y + 24,
      });
    });

    // Also duplicate any children of duplicated groups
    allTargets.forEach((target) => {
      if (target.type === 'group') {
        const children = shapes.filter((s) => s.parentId === target.id);
        children.forEach((child) => {
          const newChildId = `shape-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
          newItems.push({
            ...child,
            id: newChildId,
            parentId: idMap[target.id],
            x: child.x + 24,
            y: child.y + 24,
          });
        });
      }
    });

    const updated = [...shapes, ...newItems];
    applyShapeUpdate(updated);
    setSelectedIds(newIds);
  };

  const handleReorder = (id: string, direction: 'up' | 'down') => {
    const idx = shapes.findIndex((s) => s.id === id);
    if (idx === -1) return;
    const updated = [...shapes];
    if (direction === 'up' && idx < shapes.length - 1) {
      const temp = updated[idx];
      updated[idx] = updated[idx + 1];
      updated[idx + 1] = temp;
    } else if (direction === 'down' && idx > 0) {
      const temp = updated[idx];
      updated[idx] = updated[idx - 1];
      updated[idx - 1] = temp;
    }
    applyShapeUpdate(updated);
  };

  // Alignment & Spacing Distribution Engine
  const handleAlign = (
    alignment:
      | 'left'
      | 'center'
      | 'right'
      | 'top'
      | 'middle'
      | 'bottom'
      | 'distribute-h'
      | 'distribute-v'
  ) => {
    if (selectedIds.length === 0) return;
    const targets = shapes.filter((s) => selectedIds.includes(s.id));

    // Distribute Horizontally
    if (alignment === 'distribute-h') {
      if (targets.length < 3) return;
      const sorted = [...targets].sort((a, b) => a.x - b.x);
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      const totalWidth = sorted.slice(1, -1).reduce((acc, s) => acc + s.width, 0);
      const span = last.x - (first.x + first.width);
      const gap = (span - totalWidth) / (sorted.length - 1);

      let currentX = first.x + first.width + gap;
      const posMap: Record<string, number> = {};
      for (let i = 1; i < sorted.length - 1; i++) {
        posMap[sorted[i].id] = Math.round(currentX);
        currentX += sorted[i].width + gap;
      }
      const updated = shapes.map((s) =>
        posMap[s.id] !== undefined ? { ...s, x: posMap[s.id] } : s
      );
      applyShapeUpdate(updated);
      return;
    }

    // Distribute Vertically
    if (alignment === 'distribute-v') {
      if (targets.length < 3) return;
      const sorted = [...targets].sort((a, b) => a.y - b.y);
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      const totalHeight = sorted.slice(1, -1).reduce((acc, s) => acc + s.height, 0);
      const span = last.y - (first.y + first.height);
      const gap = (span - totalHeight) / (sorted.length - 1);

      let currentY = first.y + first.height + gap;
      const posMap: Record<string, number> = {};
      for (let i = 1; i < sorted.length - 1; i++) {
        posMap[sorted[i].id] = Math.round(currentY);
        currentY += sorted[i].height + gap;
      }
      const updated = shapes.map((s) =>
        posMap[s.id] !== undefined ? { ...s, y: posMap[s.id] } : s
      );
      applyShapeUpdate(updated);
      return;
    }

    // Single Shape Alignment (Container / Frame / Canvas Aware)
    if (targets.length === 1) {
      const target = targets[0];
      const targetCenterX = target.x + target.width / 2;
      const targetCenterY = target.y + target.height / 2;

      // Find enclosing container (smallest rect or frame containing center)
      const candidateContainers = shapes.filter(
        (s) =>
          s.id !== target.id &&
          s.visible &&
          (s.type === 'frame' || s.type === 'rect') &&
          s.x <= targetCenterX &&
          s.x + s.width >= targetCenterX &&
          s.y <= targetCenterY &&
          s.y + s.height >= targetCenterY
      );

      let container: CanvasShape | null = null;
      if (candidateContainers.length > 0) {
        candidateContainers.sort((a, b) => a.width * a.height - b.width * b.height);
        container = candidateContainers[0];
      } else {
        container = shapes.find((s) => s.type === 'frame') || null;
      }

      let boxX: number;
      let boxY: number;
      let boxW: number;
      let boxH: number;

      if (container) {
        boxX = container.x;
        boxY = container.y;
        boxW = container.width;
        boxH = container.height;
      } else {
        // Fallback to Canvas Center
        const viewW = typeof window !== 'undefined' ? window.innerWidth : 1200;
        const viewH = typeof window !== 'undefined' ? window.innerHeight : 800;
        const cx = Math.round(-viewport.x / viewport.zoom + viewW / (2 * viewport.zoom));
        const cy = Math.round(-viewport.y / viewport.zoom + viewH / (2 * viewport.zoom));
        boxX = cx - 400;
        boxY = cy - 300;
        boxW = 800;
        boxH = 600;
      }

      let newX = target.x;
      let newY = target.y;
      let newTextAlign = target.textAlign;

      switch (alignment) {
        case 'left':
          newX = boxX;
          if (target.type === 'text') newTextAlign = 'left';
          break;
        case 'center':
          newX = Math.round(boxX + (boxW - target.width) / 2);
          if (target.type === 'text') newTextAlign = 'center';
          break;
        case 'right':
          newX = boxX + boxW - target.width;
          if (target.type === 'text') newTextAlign = 'right';
          break;
        case 'top':
          newY = boxY;
          break;
        case 'middle':
          newY = Math.round(boxY + (boxH - target.height) / 2);
          break;
        case 'bottom':
          newY = boxY + boxH - target.height;
          break;
      }

      const updated = shapes.map((s) =>
        s.id === target.id
          ? {
              ...s,
              x: newX,
              y: newY,
              ...(target.type === 'text' && newTextAlign ? { textAlign: newTextAlign } : {}),
            }
          : s
      );
      applyShapeUpdate(updated);
      return;
    }

    // Multiple Shapes Alignment (Relative to Selection Bounding Box)
    let minX = Math.min(...targets.map((s) => s.x));
    let maxX = Math.max(...targets.map((s) => s.x + s.width));
    let minY = Math.min(...targets.map((s) => s.y));
    let maxY = Math.max(...targets.map((s) => s.y + s.height));

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const updated = shapes.map((s) => {
      if (!selectedIds.includes(s.id)) return s;
      switch (alignment) {
        case 'left':
          return {
            ...s,
            x: minX,
            ...(s.type === 'text' ? { textAlign: 'left' as const } : {}),
          };
        case 'center':
          return {
            ...s,
            x: Math.round(centerX - s.width / 2),
            ...(s.type === 'text' ? { textAlign: 'center' as const } : {}),
          };
        case 'right':
          return {
            ...s,
            x: maxX - s.width,
            ...(s.type === 'text' ? { textAlign: 'right' as const } : {}),
          };
        case 'top':
          return { ...s, y: minY };
        case 'middle':
          return { ...s, y: Math.round(centerY - s.height / 2) };
        case 'bottom':
          return { ...s, y: maxY - s.height };
        default:
          return s;
      }
    });

    applyShapeUpdate(updated);
  };

  // Zoom to Fit (Figma Shift+1)
  const handleZoomToFit = useCallback(() => {
    if (shapes.length === 0) return;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    shapes.forEach((s) => {
      minX = Math.min(minX, s.x);
      minY = Math.min(minY, s.y);
      maxX = Math.max(maxX, s.x + s.width);
      maxY = Math.max(maxY, s.y + s.height);
    });

    const padding = 80;
    const width = maxX - minX + padding * 2;
    const height = maxY - minY + padding * 2;

    const availableWidth = window.innerWidth - (isPresenting ? 0 : 520);
    const availableHeight = window.innerHeight - (isPresenting ? 0 : 60);

    const zoom = Math.min(
      Math.max(0.1, Math.min(availableWidth / width, availableHeight / height)),
      1.5
    );

    const x = (availableWidth - width * zoom) / 2 - minX * zoom + padding * zoom;
    const y = (availableHeight - height * zoom) / 2 - minY * zoom + padding * zoom;

    const newViewport = { x: Math.round(x), y: Math.round(y), zoom };
    setViewport(newViewport);
    setProjects((prev) =>
      prev.map((p) => (p.id === activeProjectId ? { ...p, viewport: newViewport } : p))
    );
  }, [shapes, isPresenting, activeProjectId]);

  // Center-anchored Zoom in / Zoom out
  const handleZoom = useCallback((factor: number) => {
    setViewport((prev) => {
      const newZoom = Math.min(10, Math.max(0.05, prev.zoom * factor));
      const cx = (window.innerWidth - (isPresenting ? 0 : 520)) / 2 + (isPresenting ? 0 : 260);
      const cy = (window.innerHeight - (isPresenting ? 0 : 50)) / 2 + (isPresenting ? 0 : 50);
      const worldX = (cx - prev.x) / prev.zoom;
      const worldY = (cy - prev.y) / prev.zoom;
      const newX = cx - worldX * newZoom;
      const newY = cy - worldY * newZoom;
      return { x: Math.round(newX), y: Math.round(newY), zoom: newZoom };
    });
  }, [isPresenting]);

  const handleResetZoom = useCallback(() => {
    setViewport((prev) => {
      const cx = (window.innerWidth - (isPresenting ? 0 : 520)) / 2 + (isPresenting ? 0 : 260);
      const cy = (window.innerHeight - (isPresenting ? 0 : 50)) / 2 + (isPresenting ? 0 : 50);
      const worldX = (cx - prev.x) / prev.zoom;
      const worldY = (cy - prev.y) / prev.zoom;
      const newX = cx - worldX * 1;
      const newY = cy - worldY * 1;
      return { x: Math.round(newX), y: Math.round(newY), zoom: 1 };
    });
  }, [isPresenting]);

  // Group selection (⌘G)
  const handleGroup = useCallback(() => {
    if (selectedIds.length === 0) return;
    const targets = shapes.filter((s) => selectedIds.includes(s.id));
    if (targets.length === 0) return;
    if (targets.length === 1 && targets[0].type === 'group') return;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    targets.forEach((s) => {
      minX = Math.min(minX, s.x);
      minY = Math.min(minY, s.y);
      maxX = Math.max(maxX, s.x + s.width);
      maxY = Math.max(maxY, s.y + s.height);
    });

    const groupId = `group-${Date.now()}`;
    const groupCount = shapes.filter((s) => s.type === 'group').length + 1;
    const groupShape: CanvasShape = {
      id: groupId,
      name: `Group ${groupCount}`,
      type: 'group',
      x: minX,
      y: minY,
      width: Math.max(10, maxX - minX),
      height: Math.max(10, maxY - minY),
      rotation: 0,
      fill: 'transparent',
      stroke: 'none',
      strokeWidth: 0,
      cornerRadius: 0,
      opacity: 1,
      visible: true,
      locked: false,
    };

    const targetIdsSet = new Set(targets.map((t) => t.id));
    const updated = shapes.map((s) => {
      if (targetIdsSet.has(s.id)) {
        return { ...s, parentId: groupId };
      }
      return s;
    });

    updated.push(groupShape);
    applyShapeUpdate(updated);
    setSelectedIds([groupId]);
  }, [selectedIds, shapes, applyShapeUpdate]);

  // Ungroup (⇧⌘G)
  const handleUngroup = useCallback((targetGroupId?: string) => {
    let groupId = targetGroupId;
    if (!groupId) {
      const directGroup = selectedIds.find(
        (id) => shapes.find((s) => s.id === id)?.type === 'group'
      );
      if (directGroup) {
        groupId = directGroup;
      } else {
        const inGroup = shapes.find((s) => selectedIds.includes(s.id) && s.parentId);
        if (inGroup && inGroup.parentId) groupId = inGroup.parentId;
      }
    }
    if (!groupId) return;

    const childIds: string[] = [];
    const updated = shapes
      .filter((s) => s.id !== groupId)
      .map((s) => {
        if (s.parentId === groupId) {
          childIds.push(s.id);
          const { parentId, ...rest } = s;
          return rest as CanvasShape;
        }
        return s;
      });

    applyShapeUpdate(updated);
    setSelectedIds(childIds.length > 0 ? childIds : []);
  }, [selectedIds, shapes, applyShapeUpdate]);

  // Insert Image from file or drop
  const handleInsertImage = useCallback((file: File, atPos?: { x: number; y: number }) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        let w = img.naturalWidth || 360;
        let h = img.naturalHeight || 240;
        const maxDim = 640;
        if (w > maxDim || h > maxDim) {
          const ratio = Math.min(maxDim / w, maxDim / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }

        const x = atPos ? atPos.x : Math.round((-viewport.x + 200) / viewport.zoom);
        const y = atPos ? atPos.y : Math.round((-viewport.y + 150) / viewport.zoom);

        const newShape: CanvasShape = {
          id: `image-${Date.now()}`,
          name: file.name.replace(/\.[^/.]+$/, '') || 'Image',
          type: 'image',
          imageUrl: dataUrl,
          imageFit: 'cover',
          x,
          y,
          width: w,
          height: h,
          rotation: 0,
          fill: '#ffffff',
          stroke: 'none',
          strokeWidth: 0,
          cornerRadius: 8,
          opacity: 1,
          visible: true,
          locked: false,
          hasShadow: true,
          shadowColor: 'rgba(0,0,0,0.3)',
          shadowBlur: 16,
          shadowY: 6,
        };

        handleAddShape(newShape);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }, [viewport, handleAddShape]);

  // Save to JSON
  const handleSaveJSON = () => {
    const data = JSON.stringify(activeProject, null, 2);
    downloadFile(data, `${activeProject.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`, 'application/json');
  };

  // Load from JSON
  const handleLoadJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const loaded = JSON.parse(event.target?.result as string);
        if (Array.isArray(loaded)) {
          applyShapeUpdate(loaded);
          setSelectedIds([]);
        } else if (loaded && typeof loaded === 'object' && loaded.shapes) {
          const newProj: Project = {
            id: `proj-${Date.now()}`,
            name: loaded.name || file.name.replace('.json', ''),
            shapes: loaded.shapes,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            category: loaded.category || 'custom',
            viewport: loaded.viewport || { x: 120, y: 50, zoom: 0.85 },
          };
          const updated = [...projects, newProj];
          setProjects(updated);
          setActiveProjectId(newProj.id);
          setShapes(newProj.shapes);
          setViewport(newProj.viewport);
          setSelectedIds([]);
          setHistory([newProj.shapes]);
          setHistoryIndex(0);
        }
      } catch (err) {
        console.error('Failed to parse JSON file:', err);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Global Keyboard Shortcuts & Clipboard Paste
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const isInput =
        (e.target as HTMLElement).tagName === 'INPUT' ||
        (e.target as HTMLElement).tagName === 'TEXTAREA';
      if (isInput) return;

      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            handleInsertImage(file);
            break;
          }
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput =
        (e.target as HTMLElement).tagName === 'INPUT' ||
        (e.target as HTMLElement).tagName === 'TEXTAREA';
      if (isInput) return;

      // Alt / Option shortcuts for Alignment (⌥A, ⌥H, ⌥D, ⌥W, ⌥V, ⌥S)
      if (e.altKey && !e.metaKey && !e.ctrlKey && selectedIds.length > 0) {
        if (e.code === 'KeyA') {
          e.preventDefault();
          handleAlign('left');
          return;
        }
        if (e.code === 'KeyH') {
          e.preventDefault();
          handleAlign('center');
          return;
        }
        if (e.code === 'KeyD') {
          e.preventDefault();
          handleAlign('right');
          return;
        }
        if (e.code === 'KeyW') {
          e.preventDefault();
          handleAlign('top');
          return;
        }
        if (e.code === 'KeyV') {
          e.preventDefault();
          handleAlign('middle');
          return;
        }
        if (e.code === 'KeyS') {
          e.preventDefault();
          handleAlign('bottom');
          return;
        }
      }

      // Zoom shortcuts: Cmd +, Cmd -, Cmd 0, Shift 1
      if ((e.metaKey || e.ctrlKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        handleZoom(1.2);
        return;
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === '-' || e.key === '_')) {
        e.preventDefault();
        handleZoom(1 / 1.2);
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '0') {
        e.preventDefault();
        handleResetZoom();
        return;
      }
      if (e.shiftKey && e.key === '1') {
        e.preventDefault();
        handleZoomToFit();
        return;
      }

      // Group / Ungroup shortcuts
      if ((e.metaKey || e.ctrlKey) && (e.key === 'g' || e.key === 'G')) {
        e.preventDefault();
        if (e.shiftKey) {
          handleUngroup();
        } else {
          handleGroup();
        }
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault();
        if (selectedIds.length > 0) handleDuplicateShapes(selectedIds);
      } else if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSaveJSON();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        setPresetsModalMode('new-project');
        setIsPresetsModalOpen(true);
      } else if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        if (selectedIds.length > 0) handleDeleteShapes(selectedIds);
      } else if (e.key === 'Escape') {
        if (isPresenting) {
          setIsPresenting(false);
        } else {
          setSelectedIds([]);
          setActiveTool('select');
        }
      } else if (e.key === 'v' || e.key === 'V') {
        setActiveTool('select');
      } else if (e.key === 'h' || e.key === 'H') {
        setActiveTool('hand');
      } else if (e.key === 'r' || e.key === 'R') {
        setActiveTool('rect');
      } else if (e.key === 'o' || e.key === 'O') {
        setActiveTool('ellipse');
      } else if (e.key === 't' || e.key === 'T') {
        setActiveTool('text');
      } else if (e.key === 'f' || e.key === 'F') {
        setActiveTool('frame');
      } else if (e.key === 'l' || e.key === 'L') {
        setActiveTool('line');
      } else if (e.key === 'a' || e.key === 'A') {
        setActiveTool('arrow');
      } else if (e.key === 's' || e.key === 'S') {
        setActiveTool('star');
      } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        if (selectedIds.length > 0) {
          e.preventDefault();
          const step = e.shiftKey ? 10 : 1;
          const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
          const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
          const updated = shapes.map((s) =>
            selectedIds.includes(s.id) ? { ...s, x: s.x + dx, y: s.y + dy } : s
          );
          applyShapeUpdate(updated);
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('paste', handlePaste);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    selectedIds,
    shapes,
    handleUndo,
    handleRedo,
    activeTool,
    isPresenting,
    handleZoom,
    handleResetZoom,
    handleZoomToFit,
    handleGroup,
    handleUngroup,
    handleInsertImage,
  ]);

  const handleExportAllSVG = () => {
    const svg = exportToSVG(shapes);
    const fname = `${activeProject?.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'figma-export'}.svg`;
    downloadFile(svg, fname, 'image/svg+xml');
  };

  const handleExportAllPNG = () => {
    const fname = `${activeProject?.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'figma-export'}.png`;
    exportToPNG(shapes, fname);
  };

  const selectedShapesList = shapes.filter((s) => selectedIds.includes(s.id));

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#18181b] relative">
      {/* Presentation Mode Floating Bar */}
      {isPresenting && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center space-x-3 bg-[#18181b]/95 backdrop-blur-md px-4 py-2 rounded-full border border-[#2e2e33] shadow-2xl animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-center space-x-2 text-xs font-semibold text-white">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse" />
            <span>Presenting: {activeProject?.name}</span>
          </div>
          <div className="w-[1px] h-3.5 bg-[#333338]" />
          <button
            onClick={handleZoomToFit}
            className="text-xs text-[#a1a1aa] hover:text-white transition px-2 py-0.5 rounded hover:bg-[#28282d]"
          >
            Fit Screen (⇧1)
          </button>
          <div className="w-[1px] h-3.5 bg-[#333338]" />
          <button
            onClick={() => setIsPresenting(false)}
            className="flex items-center space-x-1 text-xs font-semibold text-[#f43f5e] hover:text-white px-2.5 py-0.5 rounded-full hover:bg-[#f43f5e20] transition border border-[#f43f5e30]"
          >
            <span>Exit (Esc)</span>
          </button>
        </div>
      )}

      {/* Top Header / Toolbar with Multi-Project Tabs (Hidden in presentation mode) */}
      {!isPresenting && (
        <Toolbar
          projects={projects}
          activeProjectId={activeProjectId}
          onSelectProject={handleSelectProject}
          onCloseProject={handleCloseProject}
          onOpenPresetsModal={() => {
            setPresetsModalMode('new-project');
            setIsPresetsModalOpen(true);
          }}
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          onUndo={handleUndo}
          onRedo={handleRedo}
          zoom={viewport.zoom}
          onZoomIn={() => handleZoom(1.2)}
          onZoomOut={() => handleZoom(1 / 1.2)}
          onResetZoom={handleResetZoom}
          onZoomToFit={handleZoomToFit}
          onInsertImage={handleInsertImage}
          onExportSVG={handleExportAllSVG}
          onExportPNG={handleExportAllPNG}
          onSaveJSON={handleSaveJSON}
          onLoadJSON={handleLoadJSON}
          onPresent={() => {
            setIsPresenting(true);
            setTimeout(handleZoomToFit, 50);
          }}
          onOpenShortcutsModal={() => setIsShortcutsOpen(true)}
        />
      )}

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden relative">
        {!isPresenting && (
          <LayersPanel
            shapes={shapes}
            selectedIds={selectedIds}
            onSelect={handleSelect}
            onUpdateShape={handleUpdateShape}
            onDeleteShapes={handleDeleteShapes}
            onDuplicateShapes={handleDuplicateShapes}
            onReorder={handleReorder}
            onGroup={handleGroup}
            onUngroup={handleUngroup}
            onAddShapes={handleAddShapes}
            viewport={viewport}
          />
        )}

        <Canvas
          shapes={shapes}
          selectedIds={selectedIds}
          onSelect={handleSelect}
          onSetSelectedIds={setSelectedIds}
          onAddShape={handleAddShape}
          onUpdateShape={handleUpdateShape}
          onUpdateShapes={handleUpdateMultipleShapes}
          onDuplicateShapes={handleDuplicateShapes}
          onDeleteShapes={handleDeleteShapes}
          onReorder={handleReorder}
          onGroup={handleGroup}
          onUngroup={handleUngroup}
          onInsertImage={handleInsertImage}
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          viewport={viewport}
          setViewport={setViewport}
        />

        {!isPresenting && (
          <PropertiesPanel
            selectedShapes={selectedShapesList}
            onUpdateShapes={handleUpdateSelectedShapes}
            onAlign={handleAlign}
            onGroup={handleGroup}
            onUngroup={handleUngroup}
          />
        )}
      </div>

      {/* Screen Presets & Templates Modal */}
      <ScreenPresetsModal
        isOpen={isPresetsModalOpen}
        onClose={() => setIsPresetsModalOpen(false)}
        onCreateProject={handleCreateProject}
        onInsertFrameToCanvas={handleInsertFrame}
        mode={presetsModalMode}
      />

      {/* Shortcuts Cheatsheet Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
};
