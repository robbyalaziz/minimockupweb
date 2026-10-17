import { CanvasShape } from '../types';

export const exportToSVG = (shapes: CanvasShape[]): string => {
  const visibleShapes = shapes.filter((s) => s.visible);
  if (visibleShapes.length === 0) return '';

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  visibleShapes.forEach((s) => {
    minX = Math.min(minX, s.x);
    minY = Math.min(minY, s.y);
    maxX = Math.max(maxX, s.x + s.width);
    maxY = Math.max(maxY, s.y + s.height);
  });

  const padding = 24;
  const width = Math.max(100, Math.round(maxX - minX + padding * 2));
  const height = Math.max(100, Math.round(maxY - minY + padding * 2));
  const viewBoxX = Math.round(minX - padding);
  const viewBoxY = Math.round(minY - padding);

  let svgElements = '';

  visibleShapes.forEach((s) => {
    const opacityAttr = s.opacity < 1 ? `opacity="${s.opacity}"` : '';
    const strokeAttr =
      s.strokeWidth > 0
        ? `stroke="${s.stroke}" stroke-width="${s.strokeWidth}" stroke-linecap="round"`
        : '';
    const shadowFilter = s.hasShadow
      ? `filter="drop-shadow(${s.shadowX || 0}px ${s.shadowY || 4}px ${s.shadowBlur || 12}px ${s.shadowColor || 'rgba(0,0,0,0.4)'})"`
      : '';

    if (s.type === 'rect' || s.type === 'frame') {
      svgElements += `  <rect x="${s.x}" y="${s.y}" width="${s.width}" height="${s.height}" rx="${s.cornerRadius}" ry="${s.cornerRadius}" fill="${s.fill}" ${strokeAttr} ${opacityAttr} ${shadowFilter} />\n`;
    } else if (s.type === 'ellipse') {
      const cx = s.x + s.width / 2;
      const cy = s.y + s.height / 2;
      svgElements += `  <ellipse cx="${cx}" cy="${cy}" rx="${s.width / 2}" ry="${s.height / 2}" fill="${s.fill}" ${strokeAttr} ${opacityAttr} ${shadowFilter} />\n`;
    } else if (s.type === 'line') {
      svgElements += `  <line x1="${s.x}" y1="${s.y}" x2="${s.x + s.width}" y2="${s.y + s.height}" stroke="${s.stroke || s.fill}" stroke-width="${Math.max(1, s.strokeWidth)}" stroke-linecap="round" ${opacityAttr} />\n`;
    } else if (s.type === 'arrow') {
      svgElements += `  <line x1="${s.x}" y1="${s.y}" x2="${s.x + s.width}" y2="${s.y + s.height}" stroke="${s.stroke || s.fill}" stroke-width="${Math.max(1, s.strokeWidth)}" stroke-linecap="round" marker-end="url(#arrowhead)" ${opacityAttr} />\n`;
    } else if (s.type === 'text') {
      svgElements += `  <text x="${s.x}" y="${s.y + (s.fontSize || 16)}" font-family="${s.fontFamily || 'Inter, sans-serif'}" font-size="${s.fontSize || 16}px" font-weight="${s.fontWeight || 'normal'}" fill="${s.fill}" ${opacityAttr}>${escapeHtml(s.text || '')}</text>\n`;
    } else if (s.type === 'star') {
      const points = getStarPoints(s.x, s.y, s.width, s.height, 5);
      svgElements += `  <polygon points="${points}" fill="${s.fill}" ${strokeAttr} ${opacityAttr} ${shadowFilter} />\n`;
    } else if (s.type === 'image' && s.imageUrl) {
      const preserveAspect =
        s.imageFit === 'contain' ? 'xMidYMid meet' : s.imageFit === 'fill' ? 'none' : 'xMidYMid slice';
      svgElements += `  <image href="${escapeHtml(s.imageUrl)}" x="${s.x}" y="${s.y}" width="${s.width}" height="${s.height}" preserveAspectRatio="${preserveAspect}" ${opacityAttr} ${shadowFilter} />\n`;
    }
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${viewBoxX} ${viewBoxY} ${width} ${height}">
  <defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#0d99ff" />
    </marker>
  </defs>
${svgElements}</svg>`;
};

// Export directly to raster PNG image (Retina 2x resolution)
export const exportToPNG = (shapes: CanvasShape[], filename = 'design.png') => {
  const svg = exportToSVG(shapes);
  if (!svg) return;

  const parser = new DOMParser();
  const doc = parser.parseFromString(svg, 'image/svg+xml');
  const svgEl = doc.documentElement;
  const width = parseInt(svgEl.getAttribute('width') || '800', 10);
  const height = parseInt(svgEl.getAttribute('height') || '600', 10);

  const canvas = document.createElement('canvas');
  const scale = 2; // 2x Retina
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const img = new Image();
  const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  img.onload = () => {
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);
    const pngUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = pngUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  img.src = url;
};

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function getStarPoints(x: number, y: number, w: number, h: number, spikes = 5): string {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const outerRadius = Math.min(w, h) / 2;
  const innerRadius = outerRadius * 0.42;
  const points: string[] = [];
  let rot = (Math.PI / 2) * 3;
  const step = Math.PI / spikes;

  for (let i = 0; i < spikes; i++) {
    points.push(`${cx + Math.cos(rot) * outerRadius},${cy + Math.sin(rot) * outerRadius}`);
    rot += step;
    points.push(`${cx + Math.cos(rot) * innerRadius},${cy + Math.sin(rot) * innerRadius}`);
    rot += step;
  }
  return points.join(' ');
}

export const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Generate React + Tailwind JSX Code for a selected shape or frame
export const generateTailwindCode = (shape: CanvasShape): string => {
  const roundedClass =
    shape.cornerRadius > 24
      ? 'rounded-3xl'
      : shape.cornerRadius > 12
      ? 'rounded-2xl'
      : shape.cornerRadius > 6
      ? 'rounded-lg'
      : shape.cornerRadius > 0
      ? 'rounded'
      : '';

  if (shape.type === 'frame' || shape.type === 'rect') {
    return `<div className="w-[${Math.round(shape.width)}px] h-[${Math.round(shape.height)}px] bg-[${shape.fill}] ${roundedClass} ${
      shape.hasShadow ? 'shadow-2xl' : ''
    } relative overflow-hidden">
  {/* Content */}
</div>`;
  }

  if (shape.type === 'text') {
    return `<p className="text-[${shape.fontSize || 16}px] font-${
      shape.fontWeight || 'normal'
    } text-[${shape.fill}]">
  ${shape.text || 'Text'}
</p>`;
  }

  if (shape.type === 'ellipse') {
    return `<div className="w-[${Math.round(shape.width)}px] h-[${Math.round(shape.height)}px] rounded-full bg-[${shape.fill}]" />`;
  }

  return `<!-- ${shape.name} -->`;
};
