import { useState, useRef, useCallback, useEffect } from 'react';
import { getStickerIcon } from './StickerIcons';
import type { Servicio } from '../data/mockData';
import { formatMXN } from '../data/mockData';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StickerItem {
  id: string;
  insumoId: string | null;   // null for vehicles / personnel
  label: string;
  sublabel: string;
  category: string;
  cost: number;
  x: number;
  y: number;
  w: number;   // image/icon area size (square)
}

interface DragState  { id: string; ox: number; oy: number; }
interface ResizeState { id: string; mx0: number; my0: number; w0: number; }

interface Props {
  servicio: Servicio;
  imageMap: Record<string, string>;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CANVAS_H = 560;
const DEFAULT_W = 88;
const MIN_W = 40;
const MAX_W = 280;
const LABEL_H = 32;  // space reserved below image for name

// ─── Sticker builder ─────────────────────────────────────────────────────────

function buildStickers(servicio: Servicio): StickerItem[] {
  const items: StickerItem[] = [];
  let col = 0;
  const cols = 8;
  const gapX = DEFAULT_W + 24;
  const gapY = DEFAULT_W + LABEL_H + 20;

  servicio.componentes.forEach(c => {
    items.push({
      id: `comp-${c.insumoId}`,
      insumoId: c.insumoId,
      label: c.nombre,
      sublabel: c.categoria,
      category: c.categoria,
      cost: c.costoTotal,
      x: 20 + (col % cols) * gapX,
      y: 20 + Math.floor(col / cols) * gapY,
      w: DEFAULT_W,
    });
    col++;
  });

  servicio.vehiculos.forEach(v => {
    items.push({
      id: `veh-${v.vehiculoId}`,
      insumoId: null,
      label: v.nombre,
      sublabel: 'Vehículo',
      category: 'Vehículo',
      cost: v.costoTotal,
      x: 20 + (col % cols) * gapX,
      y: 20 + Math.floor(col / cols) * gapY,
      w: DEFAULT_W,
    });
    col++;
  });

  servicio.personal.forEach(p => {
    items.push({
      id: `per-${p.rol}`,
      insumoId: null,
      label: p.rol,
      sublabel: 'Personal',
      category: 'Personal',
      cost: p.costoTotal,
      x: 20 + (col % cols) * gapX,
      y: 20 + Math.floor(col / cols) * gapY,
      w: DEFAULT_W,
    });
    col++;
  });

  return items;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ServiceDiagram({ servicio, imageMap }: Props) {
  const [stickers, setStickers] = useState<StickerItem[]>(() => buildStickers(servicio));
  const [drag,   setDrag]   = useState<DragState | null>(null);
  const [resize, setResize] = useState<ResizeState | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [showGrid, setShowGrid]   = useState(true);
  const [showCosts, setShowCosts] = useState(true);
  const [showNames, setShowNames] = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setStickers(buildStickers(servicio));
    setSelected(null);
  }, [servicio.id]);

  // ── Drag ──────────────────────────────────────────────────────────────────

  const startDrag = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = canvasRef.current!.getBoundingClientRect();
    const s = stickers.find(x => x.id === id)!;
    setDrag({ id, ox: e.clientX - rect.left - s.x, oy: e.clientY - rect.top - s.y });
    setSelected(id);
  }, [stickers]);

  // ── Resize ────────────────────────────────────────────────────────────────

  const startResize = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const s = stickers.find(x => x.id === id)!;
    setResize({ id, mx0: e.clientX, my0: e.clientY, w0: s.w });
    setSelected(id);
  }, [stickers]);

  // ── Canvas mouse events ───────────────────────────────────────────────────

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (drag) {
      const rect = canvasRef.current!.getBoundingClientRect();
      setStickers(prev => prev.map(s => {
        if (s.id !== drag.id) return s;
        const x = Math.max(0, Math.min(rect.width  - s.w,        e.clientX - rect.left - drag.ox));
        const y = Math.max(0, Math.min(CANVAS_H - s.w - LABEL_H, e.clientY - rect.top  - drag.oy));
        return { ...s, x, y };
      }));
    } else if (resize) {
      const delta = e.clientX - resize.mx0;
      const newW = Math.max(MIN_W, Math.min(MAX_W, resize.w0 + delta));
      setStickers(prev => prev.map(s => s.id === resize.id ? { ...s, w: newW } : s));
    }
  }, [drag, resize]);

  const onMouseUp = useCallback(() => {
    setDrag(null);
    setResize(null);
  }, []);

  // ── Keyboard delete ───────────────────────────────────────────────────────

  function removeSelected() {
    if (!selected) return;
    setStickers(prev => prev.filter(s => s.id !== selected));
    setSelected(null);
  }

  function resetLayout() {
    setStickers(buildStickers(servicio));
    setSelected(null);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const selSticker = stickers.find(s => s.id === selected);
  const activeOp = !!(drag || resize);

  return (
    <div className="space-y-3">

      {/* Toolbar */}
      <div className="diagram-toolbar flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-4">
          {(['Grilla', 'Costos', 'Nombres'] as const).map((label, i) => {
            const checked = [showGrid, showCosts, showNames][i];
            const setter = [setShowGrid, setShowCosts, setShowNames][i];
            return (
              <label key={label} className="flex items-center gap-1.5 text-xs cursor-pointer select-none"
                style={{ color: 'var(--color-secondary-foreground)' }}>
                <input type="checkbox" checked={checked} onChange={e => setter(e.target.checked)} />
                {label}
              </label>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          {selSticker && (
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 rounded" style={{ background: 'var(--color-secondary)', color: 'var(--color-secondary-foreground)' }}>
                <strong>{selSticker.label}</strong> · {selSticker.w}px
                {selSticker.cost > 0 && ` · ${formatMXN(selSticker.cost)}`}
              </span>
              <button
                onClick={removeSelected}
                className="text-xs px-2 py-1 rounded transition-colors hover:bg-red-50"
                style={{ color: '#EF4444', border: '1px solid #FCA5A5' }}>
                Quitar del diagrama
              </button>
            </div>
          )}
          <button onClick={resetLayout} className="text-xs px-3 py-1.5 rounded border transition-colors hover:bg-amber-50"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted-foreground)' }}>
            ↺ Restablecer
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="relative rounded-xl select-none"
        style={{
          width: '100%',
          height: CANVAS_H,
          backgroundImage: showGrid
            ? 'radial-gradient(circle, #D4C9B4 1px, transparent 1px)'
            : 'none',
          backgroundSize: showGrid ? '28px 28px' : 'auto',
          backgroundColor: '#FAF8F5',
          border: '1px solid var(--color-border)',
          overflow: 'hidden',
          cursor: activeOp ? (drag ? 'grabbing' : 'ew-resize') : 'default',
        }}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onClick={e => { if (e.target === canvasRef.current) setSelected(null); }}
      >
        {stickers.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
              Agrega componentes en el diseñador para ver el diagrama
            </p>
          </div>
        )}

        {stickers.map(sticker => {
          const isSelected   = selected === sticker.id;
          const isDragging   = drag?.id   === sticker.id;
          const isResizing   = resize?.id === sticker.id;
          const interacting  = isDragging || isResizing;

          // Image: from catalog upload if available, else SVG icon
          const imgSrc = sticker.insumoId ? imageMap[sticker.insumoId] : undefined;
          const Icon   = getStickerIcon(sticker.category);

          return (
            <div
              key={sticker.id}
              style={{
                position: 'absolute',
                left: sticker.x,
                top:  sticker.y,
                width: sticker.w,
                zIndex: interacting ? 200 : isSelected ? 100 : 1,
                userSelect: 'none',
              }}
            >
              {/* Image / icon area — transparent background */}
              <div
                onMouseDown={e => startDrag(e, sticker.id)}
                style={{
                  width: sticker.w,
                  height: sticker.w,
                  position: 'relative',
                  cursor: isDragging ? 'grabbing' : 'grab',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  // Only show border when selected
                  outline: isSelected ? '2px dashed var(--color-primary)' : '2px dashed transparent',
                  outlineOffset: 2,
                  borderRadius: 6,
                  transition: interacting ? 'none' : 'outline 0.1s',
                  filter: isDragging ? 'drop-shadow(0 6px 16px rgba(0,0,0,0.22))' : 'none',
                }}
              >
                {imgSrc ? (
                  <img
                    src={imgSrc}
                    alt={sticker.label}
                    draggable={false}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      pointerEvents: 'none',
                    }}
                  />
                ) : (
                  <Icon size={Math.round(sticker.w * 0.78)} />
                )}

                {/* Resize handle — bottom-right corner, only when selected */}
                {isSelected && (
                  <div
                    onMouseDown={e => startResize(e, sticker.id)}
                    style={{
                      position: 'absolute',
                      right:  -5,
                      bottom: -5,
                      width:  12,
                      height: 12,
                      borderRadius: 3,
                      background: 'var(--color-primary)',
                      border: '2px solid white',
                      cursor: 'se-resize',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
                    }}
                    title="Arrastra para cambiar tamaño"
                  />
                )}
              </div>

              {/* Name label — below image, always readable */}
              {showNames && (
                <div
                  onMouseDown={e => startDrag(e, sticker.id)}
                  style={{
                    marginTop: 4,
                    width: sticker.w,
                    cursor: isDragging ? 'grabbing' : 'grab',
                    textAlign: 'center',
                    pointerEvents: 'auto',
                  }}
                >
                  <p
                    style={{
                      fontSize: Math.max(8, Math.min(12, sticker.w / 8)),
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 600,
                      color: 'var(--color-foreground)',
                      lineHeight: 1.25,
                      wordBreak: 'break-word',
                      hyphens: 'auto',
                      // text shadow for legibility over any background
                      textShadow: '0 1px 2px rgba(255,255,255,0.9), 0 -1px 2px rgba(255,255,255,0.9)',
                    }}
                  >
                    {sticker.label}
                  </p>
                  {showCosts && sticker.cost > 0 && (
                    <p
                      style={{
                        fontSize: Math.max(7, Math.min(10, sticker.w / 9)),
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        color: 'var(--color-primary)',
                        marginTop: 1,
                        textShadow: '0 1px 2px rgba(255,255,255,0.9)',
                      }}
                    >
                      {formatMXN(sticker.cost)}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
        <p>Arrastra para mover · Esquina dorada para cambiar tamaño · Haz clic en el lienzo para deseleccionar</p>
        <p>{stickers.length} elemento{stickers.length !== 1 ? 's' : ''} en el diagrama</p>
      </div>
    </div>
  );
}
