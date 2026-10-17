import React, { useRef, useState, useEffect, useCallback } from 'react';
import { CanvasShape, ToolType, Viewport, ResizeHandle, Point, MarqueeSelection, SnapGuide } from '../types';
import { getStarPoints, exportToSVG } from '../utils/export';

interface CanvasProps {
  shapes: CanvasShape[];
  selectedIds: string[];
  onSelect: (id: string | null, isMulti?: boolean) => void;
  onSetSelectedIds: (ids: string[]) => void;
  onAddShape: (shape: CanvasShape) => void;
  onUpdateShape: (id: string, updates: Partial<CanvasShape>) => void;
  onUpdateShapes: (updatesMap: Record<string, Partial<CanvasShape>>) => void;
  onDuplicateShapes: (ids: string[]) => void;
  onDeleteShapes: (ids: string[]) => void;
  onReorder: (id: string, direction: 'up' | 'down') => void;
  onGroup?: () => void;
  onUngroup?: (groupId: string) => void;
  onInsertImage?: (file: File, atPos?: Point) => void;
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  viewport: Viewport;
  setViewport: React.Dispatch<React.SetStateAction<Viewport>>;
}

export const Canvas: React.FC<CanvasProps> = ({
  shapes,
  selectedIds,
  onSelect,
  onSetSelectedIds,
  onAddShape,
  onUpdateShape,
  onUpdateShapes,
  onDuplicateShapes,
  onDeleteShapes,
  onReorder,
  onGroup,
  onUngroup,
  onInsertImage,
  activeTool,
  setActiveTool,
  viewport,
  setViewport,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Interaction modes
  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [dragStart, setDragStart] = useState<Point | null>(null);

  // Marquee selection
  const [marquee, setMarquee] = useState<MarqueeSelection | null>(null);

  // In-place text editing
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  // Drawing state
  const [drawingShape, setDrawingShape] = useState<CanvasShape | null>(null);

  // Moving shape(s) state
  const [isMovingShape, setIsMovingShape] = useState(false);
  const [initialShapePositions, setInitialShapePositions] = useState<Record<string, Point>>({});

  // Smart Alignment Guides
  const [activeGuides, setActiveGuides] = useState<SnapGuide[]>([]);

  // Resizing state
  const [resizingHandle, setResizingHandle] = useState<ResizeHandle | null>(null);
  const [initialShapeRect, setInitialShapeRect] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  // Context Menu state
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; shapeId?: string } | null>(null);

  // Screen to World converter
  const screenToWorld = useCallback(
    (screenX: number, screenY: number): Point => {
      if (!containerRef.current) return { x: 0, y: 0 };
      const rect = containerRef.current.getBoundingClientRect();
      const relX = screenX - rect.left;
      const relY = screenY - rect.top;
      return {
        x: (relX - viewport.x) / viewport.zoom,
        y: (relY - viewport.y) / viewport.zoom,
      };
    },
    [viewport]
  );

  // Spacebar toggle for quick panning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === 'Space' &&
        !e.repeat &&
        (e.target as HTMLElement).tagName !== 'INPUT' &&
        (e.target as HTMLElement).tagName !== 'TEXTAREA'
      ) {
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') setIsSpacePressed(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Close context menu on outside click
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  // Wheel zoom / trackpad pan
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      setViewport((prev) => {
        const zoomFactor = e.deltaY > 0 ? 0.92 : 1.08;
        const newZoom = Math.min(Math.max(0.05, prev.zoom * zoomFactor), 12);
        if (!containerRef.current) return { ...prev, zoom: newZoom };
        const rect = containerRef.current.getBoundingClientRect();
        const mouseRelX = e.clientX - rect.left;
        const mouseRelY = e.clientY - rect.top;
        const worldX = (mouseRelX - prev.x) / prev.zoom;
        const worldY = (mouseRelY - prev.y) / prev.zoom;
        return {
          zoom: newZoom,
          x: Math.round(mouseRelX - worldX * newZoom),
          y: Math.round(mouseRelY - worldY * newZoom),
        };
      });
    } else {
      setViewport((prev) => ({
        ...prev,
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }));
    }
  };

  // Mouse Down
  const handleMouseDown = (e: React.MouseEvent) => {
    if (contextMenu) setContextMenu(null);

    const isHandMode = activeTool === 'hand' || isSpacePressed || e.button === 1;

    if (isHandMode) {
      setIsPanning(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      return;
    }

    if (e.button !== 0) return;
    const worldPoint = screenToWorld(e.clientX, e.clientY);

    // Drawing tool active
    if (activeTool !== 'select') {
      const newId = `shape-${Date.now()}`;
      const defaultFill =
        activeTool === 'frame'
          ? '#1e1e24'
          : activeTool === 'star'
          ? '#fbbf24'
          : activeTool === 'text'
          ? '#ffffff'
          : activeTool === 'line' || activeTool === 'arrow'
          ? '#0d99ff'
          : '#0d99ff';

      const newShape: CanvasShape = {
        id: newId,
        name: `${activeTool.charAt(0).toUpperCase() + activeTool.slice(1)} ${shapes.length + 1}`,
        type: activeTool,
        x: worldPoint.x,
        y: worldPoint.y,
        width: 1,
        height: 1,
        rotation: 0,
        fill: defaultFill,
        stroke:
          activeTool === 'frame'
            ? '#2e2e33'
            : activeTool === 'line' || activeTool === 'arrow'
            ? '#0d99ff'
            : '#ffffff',
        strokeWidth:
          activeTool === 'frame' ? 2 : activeTool === 'line' || activeTool === 'arrow' ? 2 : 0,
        cornerRadius: activeTool === 'frame' ? 24 : 8,
        opacity: 1,
        visible: true,
        locked: false,
        text: activeTool === 'text' ? 'Heading text' : undefined,
        fontSize: activeTool === 'text' ? 18 : undefined,
        hasShadow: activeTool === 'frame',
        shadowColor: 'rgba(0,0,0,0.4)',
        shadowBlur: 24,
        shadowY: 8,
      };

      setDrawingShape(newShape);
      setDragStart(worldPoint);
      return;
    }

    // Clicked empty background: initiate Marquee selection
    if ((e.target as HTMLElement).getAttribute('data-canvas-bg') === 'true') {
      if (!e.shiftKey && !e.metaKey) {
        onSetSelectedIds([]);
      }
      setMarquee({
        startX: worldPoint.x,
        startY: worldPoint.y,
        currentX: worldPoint.x,
        currentY: worldPoint.y,
      });
      setDragStart(worldPoint);
      setEditingTextId(null);
    }
  };

  // Mouse Move
  const handleMouseMove = (e: React.MouseEvent) => {
    // 1. Panning canvas
    if (isPanning && dragStart) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setViewport((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
      setDragStart({ x: e.clientX, y: e.clientY });
      return;
    }

    const worldPoint = screenToWorld(e.clientX, e.clientY);

    // 2. Marquee selection
    if (marquee && dragStart) {
      setMarquee({
        startX: dragStart.x,
        startY: dragStart.y,
        currentX: worldPoint.x,
        currentY: worldPoint.y,
      });
      return;
    }

    // 3. Drawing new shape
    if (drawingShape && dragStart) {
      const isLineOrArrow = drawingShape.type === 'line' || drawingShape.type === 'arrow';

      if (isLineOrArrow) {
        setDrawingShape({
          ...drawingShape,
          x: dragStart.x,
          y: dragStart.y,
          width: worldPoint.x - dragStart.x,
          height: worldPoint.y - dragStart.y,
        });
      } else {
        const width = Math.abs(worldPoint.x - dragStart.x);
        const height = Math.abs(worldPoint.y - dragStart.y);
        const x = Math.min(worldPoint.x, dragStart.x);
        const y = Math.min(worldPoint.y, dragStart.y);

        setDrawingShape({
          ...drawingShape,
          x,
          y,
          width: Math.max(4, width),
          height: Math.max(4, height),
        });
      }
      return;
    }

    // 4. Resizing selected shape
    if (resizingHandle && selectedIds.length === 1 && initialShapeRect && dragStart) {
      const dx = worldPoint.x - dragStart.x;
      const dy = worldPoint.y - dragStart.y;
      let { x, y, width, height } = initialShapeRect;

      if (resizingHandle.includes('e')) width = Math.max(10, width + dx);
      if (resizingHandle.includes('s')) height = Math.max(10, height + dy);
      if (resizingHandle.includes('w')) {
        const newWidth = Math.max(10, width - dx);
        x = x + (width - newWidth);
        width = newWidth;
      }
      if (resizingHandle.includes('n')) {
        const newHeight = Math.max(10, height - dy);
        y = y + (height - newHeight);
        height = newHeight;
      }

      onUpdateShape(selectedIds[0], { x, y, width, height });
      return;
    }

    // 5. Moving selected shapes with Smart Snapping
    if (isMovingShape && dragStart) {
      const dx = worldPoint.x - dragStart.x;
      const dy = worldPoint.y - dragStart.y;

      const guides: SnapGuide[] = [];
      const threshold = 6;

      // Primary moved shape for snapping reference
      const primaryId = selectedIds[0];
      const primaryInit = initialShapePositions[primaryId];

      let snapDx = dx;
      let snapDy = dy;

      if (primaryInit) {
        const primaryShape = shapes.find((s) => s.id === primaryId);
        if (primaryShape) {
          const currentX = primaryInit.x + dx;
          const currentY = primaryInit.y + dy;
          const currentCenterX = currentX + primaryShape.width / 2;
          const currentCenterY = currentY + primaryShape.height / 2;

          // Check against unselected shapes
          const otherShapes = shapes.filter((s) => !selectedIds.includes(s.id) && s.visible);
          for (const other of otherShapes) {
            const otherCenterX = other.x + other.width / 2;
            const otherCenterY = other.y + other.height / 2;

            // X center snap
            if (Math.abs(currentCenterX - otherCenterX) < threshold) {
              snapDx = otherCenterX - primaryShape.width / 2 - primaryInit.x;
              guides.push({ orientation: 'v', coord: otherCenterX });
            }
            // Y center snap
            if (Math.abs(currentCenterY - otherCenterY) < threshold) {
              snapDy = otherCenterY - primaryShape.height / 2 - primaryInit.y;
              guides.push({ orientation: 'h', coord: otherCenterY });
            }
          }
        }
      }

      setActiveGuides(guides);

      const updates: Record<string, Partial<CanvasShape>> = {};
      Object.keys(initialShapePositions).forEach((id) => {
        const init = initialShapePositions[id];
        if (init) {
          updates[id] = {
            x: Math.round(init.x + snapDx),
            y: Math.round(init.y + snapDy),
          };
        }
      });
      onUpdateShapes(updates);
      return;
    }
  };

  // Mouse Up
  const handleMouseUp = () => {
    setActiveGuides([]);

    if (isPanning) {
      setIsPanning(false);
      setDragStart(null);
    }

    // Finalize Marquee selection
    if (marquee) {
      const minX = Math.min(marquee.startX, marquee.currentX);
      const maxX = Math.max(marquee.startX, marquee.currentX);
      const minY = Math.min(marquee.startY, marquee.currentY);
      const maxY = Math.max(marquee.startY, marquee.currentY);

      if (maxX - minX > 3 || maxY - minY > 3) {
        const enclosedIds = shapes
          .filter((s) => s.visible && !s.locked)
          .filter(
            (s) =>
              s.x + s.width >= minX &&
              s.x <= maxX &&
              s.y + s.height >= minY &&
              s.y <= maxY
          )
          .map((s) => s.id);

        onSetSelectedIds(enclosedIds);
      }
      setMarquee(null);
      setDragStart(null);
    }

    // Finalize Drawing
    if (drawingShape) {
      const isLineOrArrow = drawingShape.type === 'line' || drawingShape.type === 'arrow';
      let finalShape = { ...drawingShape };

      if (!isLineOrArrow) {
        const finalWidth =
          drawingShape.width <= 8
            ? drawingShape.type === 'text'
              ? 180
              : 120
            : drawingShape.width;
        const finalHeight =
          drawingShape.height <= 8
            ? drawingShape.type === 'text'
              ? 30
              : 100
            : drawingShape.height;

        finalShape.width = finalWidth;
        finalShape.height = finalHeight;
      }

      onAddShape(finalShape);
      onSetSelectedIds([finalShape.id]);
      setDrawingShape(null);
      setDragStart(null);
      setActiveTool('select');
    }

    if (isMovingShape) {
      setIsMovingShape(false);
      setDragStart(null);
    }

    if (resizingHandle) {
      setResizingHandle(null);
      setInitialShapeRect(null);
      setDragStart(null);
    }
  };

  // Start Shape Drag
  const startShapeDrag = (shape: CanvasShape, e: React.MouseEvent) => {
    if (activeTool !== 'select' || isSpacePressed || shape.locked || !shape.visible) return;
    e.stopPropagation();

    // Select group parent if clicked, unless Cmd/Ctrl is pressed for direct deep-select
    const effectiveId =
      !e.metaKey && !e.ctrlKey && shape.parentId ? shape.parentId : shape.id;

    let targetSelectedIds = selectedIds;
    if (!selectedIds.includes(effectiveId)) {
      if (e.shiftKey) {
        targetSelectedIds = [...selectedIds, effectiveId];
      } else {
        targetSelectedIds = [effectiveId];
      }
      onSetSelectedIds(targetSelectedIds);
    }

    const world = screenToWorld(e.clientX, e.clientY);
    const initialPos: Record<string, Point> = {};
    const allIdsToMove = new Set<string>(targetSelectedIds);
    const addChildren = (groupId: string) => {
      shapes
        .filter((s) => s.parentId === groupId)
        .forEach((child) => {
          allIdsToMove.add(child.id);
          if (child.type === 'group') addChildren(child.id);
        });
    };
    targetSelectedIds.forEach((id) => {
      const sh = shapes.find((s) => s.id === id);
      if (sh && sh.type === 'group') {
        addChildren(sh.id);
      }
    });

    shapes
      .filter((s) => allIdsToMove.has(s.id))
      .forEach((s) => {
        initialPos[s.id] = { x: s.x, y: s.y };
      });

    setInitialShapePositions(initialPos);
    setDragStart(world);
    setIsMovingShape(true);
  };

  // Start Resizing
  const startResize = (handle: ResizeHandle, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIds.length !== 1) return;
    const selectedShape = shapes.find((s) => s.id === selectedIds[0]);
    if (!selectedShape) return;

    setResizingHandle(handle);
    setInitialShapeRect({
      x: selectedShape.x,
      y: selectedShape.y,
      width: selectedShape.width,
      height: selectedShape.height,
    });
    setDragStart(screenToWorld(e.clientX, e.clientY));
  };

  // Right-click context menu
  const handleContextMenu = (e: React.MouseEvent, shapeId?: string) => {
    e.preventDefault();
    if (shapeId) {
      const clickedShape = shapes.find((s) => s.id === shapeId);
      const effectiveId =
        !e.metaKey && !e.ctrlKey && clickedShape?.parentId
          ? clickedShape.parentId
          : shapeId;
      if (!selectedIds.includes(effectiveId)) {
        onSetSelectedIds([effectiveId]);
      }
      setContextMenu({ x: e.clientX, y: e.clientY, shapeId: effectiveId });
    } else {
      setContextMenu({ x: e.clientX, y: e.clientY });
    }
  };

  // Calculate composite bounding box
  const allShapesInSelection = new Set<string>(selectedIds);
  selectedIds.forEach((id) => {
    shapes
      .filter((s) => s.parentId === id)
      .forEach((child) => allShapesInSelection.add(child.id));
  });
  const selectedShapesList = shapes.filter((s) => allShapesInSelection.has(s.id));
  let compositeBounds: { minX: number; minY: number; maxX: number; maxY: number } | null = null;
  if (selectedShapesList.length > 0) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    selectedShapesList.forEach((s) => {
      minX = Math.min(minX, s.x);
      minY = Math.min(minY, s.y);
      maxX = Math.max(maxX, s.x + s.width);
      maxY = Math.max(maxY, s.y + s.height);
    });
    compositeBounds = { minX, minY, maxX, maxY };
  }

  // Render individual shape
  const renderShapeElement = (shape: CanvasShape) => {
    if (!shape.visible) return null;
    const isEditingThisText = editingTextId === shape.id;
    const isFrame = shape.type === 'frame';

    return (
      <div
        key={shape.id}
        onMouseDown={(e) => startShapeDrag(shape, e)}
        onContextMenu={(e) => handleContextMenu(e, shape.id)}
        onDoubleClick={(e) => {
          if (shape.type === 'text') {
            e.stopPropagation();
            setEditingTextId(shape.id);
          }
        }}
        style={{
          position: 'absolute',
          left: `${shape.x}px`,
          top: `${shape.y}px`,
          width: `${Math.max(1, Math.abs(shape.width))}px`,
          height: `${Math.max(1, Math.abs(shape.height))}px`,
          opacity: shape.opacity,
          transform: `rotate(${shape.rotation}deg)`,
          cursor: isSpacePressed || activeTool === 'hand' ? 'grab' : shape.locked ? 'default' : 'move',
          filter: shape.hasShadow
            ? `drop-shadow(${shape.shadowX || 0}px ${shape.shadowY || 6}px ${shape.shadowBlur || 24}px ${shape.shadowColor || 'rgba(0,0,0,0.5)'})`
            : undefined,
        }}
        className="group transition-opacity"
      >
        {/* Frame Name Label */}
        {isFrame && (
          <div className="absolute -top-5 left-0 text-[11px] font-semibold text-[#8e8e93] select-none truncate max-w-[280px] pointer-events-none">
            {shape.name}
          </div>
        )}

        {/* SVG Shape Render (Only for vector shapes) */}
        {shape.type !== 'text' && shape.type !== 'image' && shape.type !== 'group' && (
          <svg
            width="100%"
            height="100%"
            style={{ overflow: 'visible', position: 'absolute', top: 0, left: 0 }}
            className="pointer-events-none"
          >
            <defs>
              <marker
                id={`arrow-${shape.id}`}
                markerWidth="8"
                markerHeight="6"
                refX="8"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill={shape.stroke || shape.fill} />
              </marker>
            </defs>

            {shape.type === 'rect' || shape.type === 'frame' ? (
              <rect
                x={0}
                y={0}
                width={shape.width}
                height={shape.height}
                rx={shape.cornerRadius}
                ry={shape.cornerRadius}
                fill={shape.fill}
                stroke={shape.strokeWidth > 0 ? shape.stroke : 'none'}
                strokeWidth={shape.strokeWidth}
              />
            ) : shape.type === 'ellipse' ? (
              <ellipse
                cx={shape.width / 2}
                cy={shape.height / 2}
                rx={shape.width / 2}
                ry={shape.height / 2}
                fill={shape.fill}
                stroke={shape.strokeWidth > 0 ? shape.stroke : 'none'}
                strokeWidth={shape.strokeWidth}
              />
            ) : shape.type === 'line' ? (
              <line
                x1={0}
                y1={0}
                x2={shape.width}
                y2={shape.height}
                stroke={shape.stroke || shape.fill}
                strokeWidth={Math.max(1, shape.strokeWidth)}
                strokeLinecap="round"
              />
            ) : shape.type === 'arrow' ? (
              <line
                x1={0}
                y1={0}
                x2={shape.width}
                y2={shape.height}
                stroke={shape.stroke || shape.fill}
                strokeWidth={Math.max(1, shape.strokeWidth)}
                strokeLinecap="round"
                markerEnd={`url(#arrow-${shape.id})`}
              />
            ) : shape.type === 'star' ? (
              <polygon
                points={getStarPoints(0, 0, shape.width, shape.height, 5)}
                fill={shape.fill}
                stroke={shape.strokeWidth > 0 ? shape.stroke : 'none'}
                strokeWidth={shape.strokeWidth}
              />
            ) : null}
          </svg>
        )}

        {/* Image Shape */}
        {shape.type === 'image' && (
          <div
            className="w-full h-full overflow-hidden pointer-events-none select-none"
            style={{ borderRadius: `${shape.cornerRadius || 0}px` }}
          >
            {shape.imageUrl ? (
              <img
                src={shape.imageUrl}
                alt={shape.name || 'Image'}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: shape.imageFit || 'cover',
                  display: 'block',
                  pointerEvents: 'none',
                }}
                draggable={false}
              />
            ) : (
              <div className="w-full h-full bg-[#27272a] border border-dashed border-[#52525b] flex flex-col items-center justify-center text-[#71717a] gap-1 p-2">
                <span className="text-xs">No image source</span>
              </div>
            )}
          </div>
        )}

        {/* Group Outline Container */}
        {shape.type === 'group' && (
          <div className="w-full h-full pointer-events-none border border-dashed border-[#0d99ff]/50 rounded-sm">
            <div className="absolute -top-5 left-0 text-[10px] font-medium text-[#0d99ff] bg-[#0d99ff]/15 px-1.5 py-0.5 rounded pointer-events-none select-none flex items-center gap-1">
              <span>📁</span>
              <span>{shape.name}</span>
            </div>
          </div>
        )}

        {/* Text shape / In-place Editor */}
        {shape.type === 'text' &&
          (isEditingThisText ? (
            <textarea
              autoFocus
              value={shape.text || ''}
              onChange={(e) => onUpdateShape(shape.id, { text: e.target.value })}
              onBlur={() => setEditingTextId(null)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setEditingTextId(null);
              }}
              style={{
                color: shape.fill,
                fontSize: `${shape.fontSize || 16}px`,
                fontWeight: shape.fontWeight || 'normal',
                fontFamily: shape.fontFamily || 'Inter, sans-serif',
                textAlign: shape.textAlign || 'left',
              }}
              className="absolute inset-0 bg-transparent border border-[#0d99ff] p-0 outline-none resize-none overflow-hidden"
            />
          ) : (
            <div
              style={{
                color: shape.fill,
                fontSize: `${shape.fontSize || 16}px`,
                fontWeight: shape.fontWeight || 'normal',
                fontFamily: shape.fontFamily || 'Inter, sans-serif',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent:
                  shape.textAlign === 'center'
                    ? 'center'
                    : shape.textAlign === 'right'
                    ? 'flex-end'
                    : 'flex-start',
                lineHeight: 1.2,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
              className="absolute inset-0 pointer-events-none select-none overflow-hidden"
            >
              {shape.text}
            </div>
          ))}
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      data-canvas-bg="true"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onContextMenu={(e) => handleContextMenu(e)}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
      }}
      onDrop={(e) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          const file = e.dataTransfer.files[0];
          if (file.type.startsWith('image/')) {
            const worldPos = screenToWorld(e.clientX, e.clientY);
            onInsertImage?.(file, worldPos);
          }
        }
      }}
      style={{
        cursor:
          isSpacePressed || activeTool === 'hand'
            ? isPanning
              ? 'grabbing'
              : 'grab'
            : activeTool !== 'select'
            ? 'crosshair'
            : 'default',
        backgroundColor: '#18181b',
        backgroundImage: `radial-gradient(#27272a 1.2px, transparent 1.2px)`,
        backgroundSize: `${20 * viewport.zoom}px ${20 * viewport.zoom}px`,
        backgroundPosition: `${viewport.x}px ${viewport.y}px`,
      }}
      className="flex-1 relative overflow-hidden select-none outline-none"
    >
      {/* World Space Container */}
      <div
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
          transformOrigin: '0 0',
        }}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
      >
        {/* Render shapes */}
        <div className="pointer-events-auto">
          {shapes.map((s) => renderShapeElement(s))}
          {drawingShape && renderShapeElement(drawingShape)}
        </div>

        {/* Smart Snapping Guide Lines (Magenta) */}
        {activeGuides.map((guide, idx) => (
          <div
            key={idx}
            style={{
              position: 'absolute',
              left: guide.orientation === 'v' ? `${guide.coord}px` : '-10000px',
              top: guide.orientation === 'h' ? `${guide.coord}px` : '-10000px',
              width: guide.orientation === 'v' ? '1px' : '20000px',
              height: guide.orientation === 'h' ? '1px' : '20000px',
              borderStyle: 'dashed',
              borderColor: '#f43f5e',
              borderWidth: guide.orientation === 'v' ? '0 0 0 1px' : '1px 0 0 0',
              pointerEvents: 'none',
              zIndex: 9999,
            }}
          />
        ))}

        {/* Marquee Selection Box */}
        {marquee && (
          <div
            style={{
              position: 'absolute',
              left: `${Math.min(marquee.startX, marquee.currentX)}px`,
              top: `${Math.min(marquee.startY, marquee.currentY)}px`,
              width: `${Math.abs(marquee.currentX - marquee.startX)}px`,
              height: `${Math.abs(marquee.currentY - marquee.startY)}px`,
              backgroundColor: 'rgba(13, 153, 255, 0.1)',
              border: '1px solid #0d99ff',
            }}
            className="pointer-events-none"
          />
        )}

        {/* Selected Shape Bounding Box & 8 Resize Handles */}
        {compositeBounds && (
          <div
            style={{
              position: 'absolute',
              left: `${compositeBounds.minX}px`,
              top: `${compositeBounds.minY}px`,
              width: `${compositeBounds.maxX - compositeBounds.minX}px`,
              height: `${compositeBounds.maxY - compositeBounds.minY}px`,
              border: '1.5px solid #0d99ff',
            }}
            className="pointer-events-none"
          >
            {/* Dimensions Badge (Figma style) */}
            <div
              style={{
                position: 'absolute',
                bottom: '-24px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#0d99ff',
                color: '#ffffff',
                padding: '1px 6px',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: 600,
                fontFamily: 'monospace',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                pointerEvents: 'none',
              }}
            >
              {Math.round(compositeBounds.maxX - compositeBounds.minX)} × {Math.round(compositeBounds.maxY - compositeBounds.minY)}
            </div>

            {/* Show 8 handles only for single selection */}
            {selectedIds.length === 1 &&
              (['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'] as ResizeHandle[]).map((handle) => {
                const handleCursor =
                  handle === 'nw' || handle === 'se'
                    ? 'nwse-resize'
                    : handle === 'ne' || handle === 'sw'
                    ? 'nesw-resize'
                    : handle === 'n' || handle === 's'
                    ? 'ns-resize'
                    : 'ew-resize';

                const posStyle: React.CSSProperties = {
                  position: 'absolute',
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#ffffff',
                  border: '1.5px solid #0d99ff',
                  borderRadius: '1.5px',
                  cursor: handleCursor,
                  pointerEvents: 'auto',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                };

                if (handle.includes('n')) posStyle.top = '-4px';
                if (handle.includes('s')) posStyle.bottom = '-4px';
                if (handle.includes('w')) posStyle.left = '-4px';
                if (handle.includes('e')) posStyle.right = '-4px';
                if (handle === 'n' || handle === 's') {
                  posStyle.left = '50%';
                  posStyle.transform = 'translateX(-50%)';
                }
                if (handle === 'w' || handle === 'e') {
                  posStyle.top = '50%';
                  posStyle.transform = 'translateY(-50%)';
                }

                return (
                  <div
                    key={handle}
                    onMouseDown={(e) => startResize(handle, e)}
                    style={posStyle}
                  />
                );
              })}
          </div>
        )}
      </div>

      {/* Right-Click Context Menu */}
      {contextMenu && (
        <div
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          className="fixed w-48 bg-[#252528] border border-[#38383e] rounded-xl shadow-2xl py-1 text-xs text-[#d1d1d6] z-50 animate-in fade-in zoom-in-95 duration-75"
          onClick={(e) => e.stopPropagation()}
        >
          {selectedIds.length > 0 ? (
            <>
              {onGroup && (
                <button
                  onClick={() => {
                    onGroup();
                    setContextMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white flex items-center justify-between"
                >
                  <span>Group Selection</span>
                  <span className="text-[10px] text-[#71717a]">⌘G</span>
                </button>
              )}
              {onUngroup &&
                selectedIds.some((id) => {
                  const s = shapes.find((sh) => sh.id === id);
                  return s?.type === 'group' || !!s?.parentId;
                }) && (
                  <button
                    onClick={() => {
                      const grp = shapes.find((s) => selectedIds.includes(s.id) && s.type === 'group');
                      const child = shapes.find((s) => selectedIds.includes(s.id) && s.parentId);
                      onUngroup(grp?.id || child?.parentId || '');
                      setContextMenu(null);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white flex items-center justify-between"
                  >
                    <span>Ungroup</span>
                    <span className="text-[10px] text-[#71717a]">⇧⌘G</span>
                  </button>
                )}
              <div className="h-[1px] bg-[#333338] my-1" />
              <button
                onClick={() => {
                  onDuplicateShapes(selectedIds);
                  setContextMenu(null);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white flex items-center justify-between"
              >
                <span>Duplicate</span>
                <span className="text-[10px] text-[#71717a]">⌘D</span>
              </button>
              <button
                onClick={() => {
                  if (contextMenu.shapeId) onReorder(contextMenu.shapeId, 'up');
                  setContextMenu(null);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white flex items-center justify-between"
              >
                <span>Bring Forward</span>
                <span className="text-[10px] text-[#71717a]">⌘]</span>
              </button>
              <button
                onClick={() => {
                  if (contextMenu.shapeId) onReorder(contextMenu.shapeId, 'down');
                  setContextMenu(null);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#0d99ff] hover:text-white flex items-center justify-between"
              >
                <span>Send Backward</span>
                <span className="text-[10px] text-[#71717a]">⌘[</span>
              </button>
              <div className="h-[1px] bg-[#333338] my-1" />
              <button
                onClick={() => {
                  onDeleteShapes(selectedIds);
                  setContextMenu(null);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#f43f5e] hover:text-white text-[#f43f5e] flex items-center justify-between"
              >
                <span>Delete</span>
                <span className="text-[10px] text-[#71717a]">⌫</span>
              </button>
            </>
          ) : (
            <div className="px-3 py-1 text-[11px] text-[#71717a]">
              Right-click a shape for actions
            </div>
          )}
        </div>
      )}
    </div>
  );
};
