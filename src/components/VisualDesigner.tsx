import { useState, useRef, useCallback, useEffect } from 'react';
import {
  insumos as insumoCatalog,
  vehiculos as vehiculoCatalog,
  personal as personalCatalog,
  type Servicio, type ComponenteServicio, type VehiculoServicio, type PersonalServicio,
  formatMXN, calcularCostoServicio,
  type Zona, type Modalidad, type Nivel,
} from '../data/mockData';
import { getStickerIcon } from './StickerIcons';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CanvasItem {
  id: string;
  type: 'comp' | 'veh' | 'per';
  refId: string;
  label: string;
  category: string;
  x: number;
  y: number;
  w: number;
}

interface DragState  { id: string; ox: number; oy: number; }
interface ResizeState { id: string; mx0: number; my0: number; w0: number; }

interface PaletteDrag { type: 'comp' | 'veh' | 'per'; id: string; }

interface Props {
  srv: Servicio;
  setSrv: React.Dispatch<React.SetStateAction<Servicio>>;
  imageMap: Record<string, string>;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const ZONAS: Zona[] = ['Zona Metropolitana', 'Altos', 'Chapala', 'Zacoalco'];
const MODALIDADES: Modalidad[] = ['Capilla', 'Domicilio', 'Cremación directa', 'Traslado'];
const NIVELES: Nivel[] = ['Básico', 'Estándar', 'Superior', 'Premium', 'Personalizado'];
const MIN_W = 44; const MAX_W = 300; const DEFAULT_W = 88;

const BG_GRADIENTS: Record<Modalidad, string> = {
  'Capilla':          'linear-gradient(160deg, #F7F0E0 0%, #EDE0C4 55%, #DFCFAB 100%)',
  'Domicilio':        'linear-gradient(160deg, #EEE9DF 0%, #E2DAD0 55%, #D5CCBE 100%)',
  'Cremación directa':'linear-gradient(160deg, #F0EBE4 0%, #E5DDD4 55%, #D9D0C7 100%)',
  'Traslado':         'linear-gradient(160deg, #EDEAE3 0%, #E1DCD4 55%, #D5D0C8 100%)',
};

// ─── Default starter kit ─────────────────────────────────────────────────────

function buildDefaultKit(): Pick<Servicio, 'componentes' | 'vehiculos' | 'personal'> {
  const ins = (id: string): ComponenteServicio | null => {
    const i = insumoCatalog.find(x => x.id === id);
    if (!i) return null;
    return {
      insumoId: i.id, nombre: i.nombre, categoria: i.categoria,
      cantidad: 1, unidad: i.unidadCompra, proveedor: i.proveedor,
      costoUnitario: i.costoUnitario, merma: i.merma,
      costoTotal: i.costoUnitario * (1 + i.merma / 100),
      obligatorio: i.obligatorio, notas: i.notas,
    };
  };

  const veh = (id: string): VehiculoServicio | null => {
    const v = vehiculoCatalog.find(x => x.id === id);
    if (!v) return null;
    const km = 40;
    const cost = v.costoFijo + km * v.costoPorKm + v.costoChoferPorHora * v.horasEstandar;
    return { vehiculoId: v.id, nombre: v.nombre, kmEstimados: km, casetas: v.casetas, viaticos: v.viaticos, horasChofer: v.horasEstandar, observaciones: '', costoTotal: cost };
  };

  const per = (rol: string): PersonalServicio | null => {
    const p = personalCatalog.find(x => x.rol === rol);
    if (!p) return null;
    return { rol: p.rol, cantidad: p.cantidadEstandar, horas: p.horasEstandar, costoPorHora: p.costoPorHora, costoTotal: p.cantidadEstandar * p.horasEstandar * p.costoPorHora };
  };

  return {
    componentes: [ins('INS-003'), ins('INS-010'), ins('INS-011')].filter(Boolean) as ComponenteServicio[],
    vehiculos:   [veh('VEH-002')].filter(Boolean) as VehiculoServicio[],
    personal:    [per('Director de servicio'), per('Chofer')].filter(Boolean) as PersonalServicio[],
  };
}

// ─── Initial canvas positions for the starter kit ────────────────────────────

function buildInitialCanvas(srv: Servicio): CanvasItem[] {
  const items: CanvasItem[] = [];
  const presets: Record<string, { x: number; y: number; w: number }> = {
    'comp-INS-003': { x: 360, y: 80,  w: 100 },
    'comp-INS-010': { x: 200, y: 200, w: 88  },
    'comp-INS-011': { x: 380, y: 220, w: 120 },
    'veh-VEH-002':  { x: 80,  y: 80,  w: 110 },
    'per-Director de servicio': { x: 80, y: 230, w: 88 },
    'per-Chofer':               { x: 560, y: 100, w: 88 },
  };
  let col = 0;
  function fallback(key: string) {
    const r = { x: 30 + (col % 6) * 110, y: 30 + Math.floor(col / 6) * 140, w: DEFAULT_W };
    col++;
    return presets[key] ?? r;
  }

  srv.componentes.forEach(c => {
    const key = `comp-${c.insumoId}`;
    const pos = fallback(key);
    items.push({ id: key, type: 'comp', refId: c.insumoId, label: c.nombre, category: c.categoria, ...pos });
  });
  srv.vehiculos.forEach(v => {
    const key = `veh-${v.vehiculoId}`;
    const pos = fallback(key);
    items.push({ id: key, type: 'veh', refId: v.vehiculoId, label: v.nombre, category: 'Vehículo', ...pos });
  });
  srv.personal.forEach(p => {
    const key = `per-${p.rol}`;
    const pos = fallback(key);
    items.push({ id: key, type: 'per', refId: p.rol, label: p.rol, category: 'Personal', ...pos });
  });
  return items;
}

// ─── Cost panel (inline) ─────────────────────────────────────────────────────

function CostPanel({ srv }: { srv: Servicio }) {
  const c = calcularCostoServicio(srv);
  const rows: [string, number][] = [
    ['Ataúd / Urna', c.ataud],
    ['Insumos directos', c.insumos],
    ['Vehículos', c.vehiculos],
    ['Personal', c.personal],
    ['Trámites', c.tramites],
    ['Proveedores ext.', c.proveedoresExternos],
    ['Costos indirectos', c.costosIndirectos],
    ['Merma', c.merma],
  ];
  return (
    <aside className="flex-shrink-0 flex flex-col overflow-hidden"
      style={{ width: 240, borderLeft: '1px solid var(--color-border)', background: '#FEFCF7' }}>
      <div className="px-4 pt-4 pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-primary)' }}>Costo del servicio</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted-foreground)' }}>Tiempo real</p>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {rows.map(([label, val]) => (
          <div key={label} className="flex items-center justify-between gap-2">
            <span className="text-xs leading-tight" style={{ color: 'var(--color-muted-foreground)' }}>{label}</span>
            <span className="text-xs tabular-nums font-medium flex-shrink-0"
              style={{ fontFamily: 'var(--font-mono)', color: val > 0 ? 'var(--color-foreground)' : 'var(--color-border)' }}>
              {formatMXN(val)}
            </span>
          </div>
        ))}
      </div>
      <div className="border-t px-4 pb-4 pt-3 space-y-2.5" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-foreground)' }}>Total</span>
          <span className="text-base font-bold tabular-nums" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>
            {formatMXN(c.total)}
          </span>
        </div>
        <div className="rounded-lg p-3 space-y-2" style={{ background: 'var(--color-secondary)' }}>
          <div className="flex items-center justify-between text-xs gap-2">
            <span style={{ color: 'var(--color-muted-foreground)' }}>Margen {srv.margenSugerido}%</span>
          </div>
          <div className="flex items-center justify-between border-t pt-2" style={{ borderColor: 'var(--color-border)' }}>
            <span className="text-xs font-semibold" style={{ color: '#166534' }}>Precio sugerido</span>
            <span className="text-sm font-bold tabular-nums" style={{ color: '#166534', fontFamily: 'var(--font-mono)' }}>
              {formatMXN(c.precioSugerido)}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─── Palette item ─────────────────────────────────────────────────────────────

function PaletteItem({ label, category, isOnCanvas, onDragStart, imgSrc }: {
  label: string; category: string; isOnCanvas: boolean;
  onDragStart: (e: React.DragEvent) => void;
  imgSrc?: string;
}) {
  const Icon = getStickerIcon(category);
  return (
    <div
      draggable={!isOnCanvas}
      onDragStart={onDragStart}
      className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-grab select-none transition-all"
      style={{
        background: isOnCanvas ? 'var(--color-secondary)' : 'var(--color-card)',
        border: `1px solid ${isOnCanvas ? 'var(--color-primary)' : 'var(--color-border)'}`,
        opacity: isOnCanvas ? 0.55 : 1,
        cursor: isOnCanvas ? 'default' : 'grab',
      }}
      title={isOnCanvas ? 'Ya está en el lienzo' : 'Arrastra al lienzo'}
    >
      <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded overflow-hidden"
        style={{ background: 'transparent' }}>
        {imgSrc
          ? <img src={imgSrc} alt={label} style={{ width: 36, height: 36, objectFit: 'contain' }} />
          : <Icon size={32} />}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold leading-tight truncate" style={{ color: 'var(--color-foreground)' }}>{label}</p>
        <p className="text-xs leading-tight" style={{ color: 'var(--color-muted-foreground)' }}>{category}</p>
      </div>
      {isOnCanvas && <span className="ml-auto text-xs" style={{ color: 'var(--color-primary)' }}>✓</span>}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function VisualDesigner({ srv, setSrv, imageMap }: Props) {
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([]);
  const [drag, setDrag]     = useState<DragState | null>(null);
  const [resize, setResize] = useState<ResizeState | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [bgImages, setBgImages] = useState<Partial<Record<Modalidad, string>>>({});
  const [isDragOver, setIsDragOver] = useState(false);
  const [palTab, setPalTab] = useState<'config' | 'insumos' | 'vehiculos' | 'personal'>('insumos');
  const [search, setSearch] = useState('');
  const [showLabels, setShowLabels]  = useState(true);
  const [showCosts, setShowCosts]   = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const kitApplied = useRef(false);

  // Apply default kit once when first entering with empty service
  useEffect(() => {
    if (kitApplied.current) return;
    kitApplied.current = true;
    const isEmpty = srv.componentes.length === 0 && srv.vehiculos.length === 0 && srv.personal.length === 0;
    if (isEmpty) {
      const kit = buildDefaultKit();
      const filled: Servicio = {
        ...srv,
        modalidad: 'Cremación directa',
        nombre: srv.nombre || 'Cremación directa básica',
        ...kit,
      };
      setSrv(filled);
      setCanvasItems(buildInitialCanvas(filled));
    } else {
      setCanvasItems(buildInitialCanvas(srv));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Drag within canvas ────────────────────────────────────────────────────

  const startDrag = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault(); e.stopPropagation();
    const rect = canvasRef.current!.getBoundingClientRect();
    const it = canvasItems.find(x => x.id === id)!;
    setDrag({ id, ox: e.clientX - rect.left - it.x, oy: e.clientY - rect.top - it.y });
    setSelected(id);
  }, [canvasItems]);

  const startResize = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault(); e.stopPropagation();
    const it = canvasItems.find(x => x.id === id)!;
    setResize({ id, mx0: e.clientX, my0: e.clientY, w0: it.w });
    setSelected(id);
  }, [canvasItems]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (drag) {
      const rect = canvasRef.current!.getBoundingClientRect();
      setCanvasItems(prev => prev.map(it => {
        if (it.id !== drag.id) return it;
        return {
          ...it,
          x: Math.max(0, Math.min(rect.width - it.w, e.clientX - rect.left - drag.ox)),
          y: Math.max(0, Math.min(rect.height - it.w - 36, e.clientY - rect.top - drag.oy)),
        };
      }));
    } else if (resize) {
      const delta = e.clientX - resize.mx0;
      const newW = Math.max(MIN_W, Math.min(MAX_W, resize.w0 + delta));
      setCanvasItems(prev => prev.map(it => it.id === resize.id ? { ...it, w: newW } : it));
    }
  }, [drag, resize]);

  const onMouseUp = useCallback(() => { setDrag(null); setResize(null); }, []);

  // ── Drop from palette ─────────────────────────────────────────────────────

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const raw = e.dataTransfer.getData('text/plain');
    if (!raw) return;
    const pd: PaletteDrag = JSON.parse(raw);
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = Math.max(0, e.clientX - rect.left - DEFAULT_W / 2);
    const y = Math.max(0, e.clientY - rect.top - DEFAULT_W / 2);
    addToCanvas(pd, x, y);
  }

  function addToCanvas(pd: PaletteDrag, x: number, y: number) {
    if (pd.type === 'comp') {
      const ins = insumoCatalog.find(i => i.id === pd.id);
      if (!ins) return;
      const alreadyOn = srv.componentes.some(c => c.insumoId === pd.id);
      if (alreadyOn) return;
      const comp: ComponenteServicio = {
        insumoId: ins.id, nombre: ins.nombre, categoria: ins.categoria,
        cantidad: 1, unidad: ins.unidadCompra, proveedor: ins.proveedor,
        costoUnitario: ins.costoUnitario, merma: ins.merma,
        costoTotal: ins.costoUnitario * (1 + ins.merma / 100),
        obligatorio: ins.obligatorio, notas: ins.notas,
      };
      setSrv(p => ({ ...p, componentes: [...p.componentes, comp] }));
      setCanvasItems(prev => [...prev, { id: `comp-${ins.id}`, type: 'comp', refId: ins.id, label: ins.nombre, category: ins.categoria, x, y, w: DEFAULT_W }]);
    } else if (pd.type === 'veh') {
      const v = vehiculoCatalog.find(x => x.id === pd.id);
      if (!v) return;
      if (srv.vehiculos.some(vv => vv.vehiculoId === pd.id)) return;
      const km = 40;
      const vs: VehiculoServicio = { vehiculoId: v.id, nombre: v.nombre, kmEstimados: km, casetas: v.casetas, viaticos: v.viaticos, horasChofer: v.horasEstandar, observaciones: '', costoTotal: v.costoFijo + km * v.costoPorKm + v.costoChoferPorHora * v.horasEstandar };
      setSrv(p => ({ ...p, vehiculos: [...p.vehiculos, vs] }));
      setCanvasItems(prev => [...prev, { id: `veh-${v.id}`, type: 'veh', refId: v.id, label: v.nombre, category: 'Vehículo', x, y, w: DEFAULT_W }]);
    } else {
      const p = personalCatalog.find(pp => pp.id === pd.id);
      if (!p) return;
      if (srv.personal.some(pp => pp.rol === p.rol)) return;
      const ps: PersonalServicio = { rol: p.rol, cantidad: p.cantidadEstandar, horas: p.horasEstandar, costoPorHora: p.costoPorHora, costoTotal: p.cantidadEstandar * p.horasEstandar * p.costoPorHora };
      setSrv(prev => ({ ...prev, personal: [...prev.personal, ps] }));
      setCanvasItems(prev => [...prev, { id: `per-${p.id}`, type: 'per', refId: p.rol, label: p.rol, category: 'Personal', x, y, w: DEFAULT_W }]);
    }
  }

  function removeItem(canvasId: string) {
    const it = canvasItems.find(x => x.id === canvasId);
    if (!it) return;
    setCanvasItems(prev => prev.filter(x => x.id !== canvasId));
    setSelected(null);
    if (it.type === 'comp')
      setSrv(p => ({ ...p, componentes: p.componentes.filter(c => c.insumoId !== it.refId) }));
    else if (it.type === 'veh')
      setSrv(p => ({ ...p, vehiculos: p.vehiculos.filter(v => v.vehiculoId !== it.refId) }));
    else
      setSrv(p => ({ ...p, personal: p.personal.filter(pp => pp.rol !== it.refId) }));
  }

  // ── Background upload ─────────────────────────────────────────────────────

  function handleBgUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setBgImages(prev => ({ ...prev, [srv.modalidad]: ev.target!.result as string }));
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  // ── Computed helpers ──────────────────────────────────────────────────────

  const onCanvasIds = new Set(canvasItems.map(it => `${it.type}:${it.refId}`));
  const bg = bgImages[srv.modalidad];
  const selItem = canvasItems.find(it => it.id === selected);

  // ── Filter palette items ──────────────────────────────────────────────────
  const filteredInsumos  = insumoCatalog.filter(i => i.nombre.toLowerCase().includes(search.toLowerCase()) || i.categoria.toLowerCase().includes(search.toLowerCase()));
  const filteredVehiculos = vehiculoCatalog.filter(v => v.nombre.toLowerCase().includes(search.toLowerCase()));
  const filteredPersonal  = personalCatalog.filter(p => p.rol.toLowerCase().includes(search.toLowerCase()));

  const activeOp = !!(drag || resize);

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── Left panel ── */}
      <aside className="flex-shrink-0 flex flex-col overflow-hidden border-r" style={{ width: 256, borderColor: 'var(--color-border)', background: 'var(--color-card)' }}>

        {/* Tab bar */}
        <div className="flex border-b flex-shrink-0" style={{ borderColor: 'var(--color-border)' }}>
          {([['config', 'Configurar'], ['insumos', 'Insumos'], ['vehiculos', 'Vehículos'], ['personal', 'Personal']] as const).map(([tab, label]) => (
            <button key={tab} onClick={() => setPalTab(tab)}
              className="flex-1 py-2.5 text-xs font-semibold transition-colors truncate"
              style={{
                borderBottom: `2px solid ${palTab === tab ? 'var(--color-primary)' : 'transparent'}`,
                color: palTab === tab ? 'var(--color-primary)' : 'var(--color-muted-foreground)',
                marginBottom: -1,
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* Config tab */}
        {palTab === 'config' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <label className="vd-label">Zona</label>
              <select className="vd-input" value={srv.zona} onChange={e => setSrv(p => ({ ...p, zona: e.target.value as Zona }))}>
                {ZONAS.map(z => <option key={z}>{z}</option>)}
              </select>
            </div>
            <div>
              <label className="vd-label">Modalidad</label>
              <select className="vd-input" value={srv.modalidad} onChange={e => setSrv(p => ({ ...p, modalidad: e.target.value as Modalidad }))}>
                {MODALIDADES.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="vd-label">Nivel</label>
              <select className="vd-input" value={srv.nivel} onChange={e => setSrv(p => ({ ...p, nivel: e.target.value as Nivel }))}>
                {NIVELES.map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="vd-label">Nombre del servicio</label>
              <input className="vd-input" value={srv.nombre} placeholder="Sin nombre"
                onChange={e => setSrv(p => ({ ...p, nombre: e.target.value }))} />
            </div>
            <div>
              <label className="vd-label">Margen sugerido (%)</label>
              <input type="number" className="vd-input" value={srv.margenSugerido}
                onChange={e => setSrv(p => ({ ...p, margenSugerido: +e.target.value }))} />
            </div>
            <div>
              <label className="vd-label">Costos indirectos (MXN)</label>
              <input type="number" className="vd-input" value={srv.costosIndirectos}
                onChange={e => setSrv(p => ({ ...p, costosIndirectos: +e.target.value }))} />
            </div>

            {/* Background image per modality */}
            <div className="pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <p className="vd-label mb-2">Fondo — {srv.modalidad}</p>
              <div className="rounded-lg overflow-hidden border" style={{ borderColor: 'var(--color-border)', aspectRatio: '16/9', background: BG_GRADIENTS[srv.modalidad] }}>
                {bg && <img src={bg} alt="bg" className="w-full h-full object-cover" />}
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => bgInputRef.current?.click()}
                  className="flex-1 py-1.5 rounded text-xs font-semibold border transition-colors hover:bg-amber-50"
                  style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}>
                  {bg ? 'Cambiar imagen' : '+ Subir imagen'}
                </button>
                {bg && (
                  <button
                    onClick={() => setBgImages(prev => { const n = { ...prev }; delete n[srv.modalidad]; return n; })}
                    className="px-2 py-1.5 rounded text-xs border transition-colors hover:bg-red-50"
                    style={{ borderColor: '#FCA5A5', color: '#DC2626' }}>
                    Quitar
                  </button>
                )}
              </div>
              <input ref={bgInputRef} type="file" accept="image/*" className="hidden" onChange={handleBgUpload} />
              <p className="text-xs mt-1.5" style={{ color: 'var(--color-muted-foreground)' }}>
                Sube una foto de capilla, sala o domicilio para ambientar el lienzo.
              </p>
            </div>
          </div>
        )}

        {/* Palette tabs (insumos / vehiculos / personal) */}
        {palTab !== 'config' && (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="px-3 pt-3 pb-2 flex-shrink-0">
              <input
                className="w-full text-xs rounded border px-2.5 py-1.5 outline-none"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)', color: 'var(--color-foreground)' }}
                placeholder="Buscar…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1.5">
              {palTab === 'insumos' && filteredInsumos.map(ins => (
                <PaletteItem key={ins.id}
                  label={ins.nombre} category={ins.categoria}
                  isOnCanvas={onCanvasIds.has(`comp:${ins.id}`)}
                  imgSrc={imageMap[ins.id]}
                  onDragStart={e => e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'comp', id: ins.id } satisfies PaletteDrag))}
                />
              ))}
              {palTab === 'vehiculos' && filteredVehiculos.map(v => (
                <PaletteItem key={v.id}
                  label={v.nombre} category={v.tipo}
                  isOnCanvas={onCanvasIds.has(`veh:${v.id}`)}
                  onDragStart={e => e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'veh', id: v.id } satisfies PaletteDrag))}
                />
              ))}
              {palTab === 'personal' && filteredPersonal.map(p => (
                <PaletteItem key={p.id}
                  label={p.rol} category={`${formatMXN(p.costoPorHora)}/hr`}
                  isOnCanvas={onCanvasIds.has(`per:${p.rol}`)}
                  onDragStart={e => e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'per', id: p.id } satisfies PaletteDrag))}
                />
              ))}
              {(palTab === 'insumos' ? filteredInsumos : palTab === 'vehiculos' ? filteredVehiculos : filteredPersonal).length === 0 && (
                <p className="text-center text-xs py-6" style={{ color: 'var(--color-muted-foreground)' }}>Sin resultados</p>
              )}
            </div>
            <div className="border-t px-3 py-2 flex-shrink-0" style={{ borderColor: 'var(--color-border)' }}>
              <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                Arrastra elementos al lienzo para agregarlos al servicio.
              </p>
            </div>
          </div>
        )}
      </aside>

      {/* ── Canvas ── */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ background: '#F5F0E8' }}>

        {/* Canvas toolbar */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b gap-3"
          style={{ background: 'rgba(255,255,255,0.7)', borderColor: 'var(--color-border)', backdropFilter: 'blur(4px)' }}>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full mr-1" style={{ background: BG_GRADIENTS[srv.modalidad].split(',')[1]?.trim().split(' ')[0] ?? '#C4973A' }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--color-foreground)' }}>{srv.modalidad}</span>
            <span className="text-xs px-1.5 py-0.5 rounded ml-1" style={{ background: 'var(--color-secondary)', color: 'var(--color-muted-foreground)' }}>{srv.zona}</span>
          </div>
          <div className="flex items-center gap-4">
            {(['Etiquetas', 'Costos'] as const).map((label, i) => {
              const checked = [showLabels, showCosts][i];
              const setter  = [setShowLabels, setShowCosts][i];
              return (
                <label key={label} className="flex items-center gap-1.5 text-xs cursor-pointer select-none"
                  style={{ color: 'var(--color-secondary-foreground)' }}>
                  <input type="checkbox" checked={checked} onChange={e => setter(e.target.checked)} />
                  {label}
                </label>
              );
            })}
          </div>
          {selItem && (
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 rounded" style={{ background: 'var(--color-secondary)', color: 'var(--color-foreground)' }}>
                <strong>{selItem.label}</strong>
              </span>
              <button onClick={() => removeItem(selItem.id)}
                className="text-xs px-2 py-1 rounded border"
                style={{ borderColor: '#FCA5A5', color: '#DC2626' }}>
                Quitar del servicio
              </button>
            </div>
          )}
          <span className="text-xs ml-auto" style={{ color: 'var(--color-muted-foreground)' }}>
            {canvasItems.length} elemento{canvasItems.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Drop canvas */}
        <div
          ref={canvasRef}
          className="flex-1 relative overflow-hidden select-none"
          style={{
            backgroundImage: bg ? undefined : 'radial-gradient(circle, rgba(180,160,120,0.3) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
            background: bg ? undefined : BG_GRADIENTS[srv.modalidad],
            cursor: activeOp ? (drag ? 'grabbing' : 'ew-resize') : 'default',
            outline: isDragOver ? '3px dashed var(--color-primary)' : 'none',
            outlineOffset: -3,
          }}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onClick={e => { if (e.target === canvasRef.current) setSelected(null); }}
          onDragOver={onDragOver}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={onDrop}
        >
          {/* Background image layer */}
          {bg && (
            <img
              src={bg}
              alt="background"
              draggable={false}
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ objectFit: 'cover', opacity: 0.85 }}
            />
          )}

          {/* Dot grid overlay when bg image is present */}
          {bg && (
            <div className="absolute inset-0 pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.25) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
          )}

          {/* Empty state */}
          {canvasItems.length === 0 && !isDragOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-3">
              <div className="text-4xl opacity-30">⬡</div>
              <p className="text-sm font-medium" style={{ color: 'rgba(120,100,60,0.6)' }}>
                Arrastra elementos desde la paleta izquierda
              </p>
            </div>
          )}

          {isDragOver && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ background: 'rgba(168,125,42,0.08)' }}>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>Suelta aquí para agregar</p>
            </div>
          )}

          {/* Stickers */}
          {canvasItems.map(it => {
            const isSelected  = selected === it.id;
            const isDragging  = drag?.id   === it.id;
            const isResizing  = resize?.id === it.id;
            const interacting = isDragging || isResizing;
            const imgSrc = it.type === 'comp' ? imageMap[it.refId] : undefined;
            const Icon   = getStickerIcon(it.category);

            return (
              <div
                key={it.id}
                style={{ position: 'absolute', left: it.x, top: it.y, width: it.w, zIndex: interacting ? 200 : isSelected ? 100 : 1 }}
              >
                <div
                  onMouseDown={e => startDrag(e, it.id)}
                  style={{
                    width: it.w, height: it.w, position: 'relative',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: isDragging ? 'grabbing' : 'grab',
                    outline: isSelected ? '2px dashed var(--color-primary)' : '2px dashed transparent',
                    outlineOffset: 2, borderRadius: 6,
                    filter: isDragging ? 'drop-shadow(0 8px 20px rgba(0,0,0,0.3))' : isSelected ? 'drop-shadow(0 2px 8px rgba(168,125,42,0.35))' : 'none',
                    transition: interacting ? 'none' : 'outline 0.1s, filter 0.15s',
                  }}
                >
                  {imgSrc
                    ? <img src={imgSrc} alt={it.label} draggable={false} style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }} />
                    : <Icon size={Math.round(it.w * 0.78)} />
                  }

                  {isSelected && (
                    <div
                      onMouseDown={e => startResize(e, it.id)}
                      style={{
                        position: 'absolute', right: -5, bottom: -5,
                        width: 13, height: 13, borderRadius: 3,
                        background: 'var(--color-primary)', border: '2px solid white',
                        cursor: 'se-resize', boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
                      }}
                    />
                  )}
                </div>

                {showLabels && (
                  <div onMouseDown={e => startDrag(e, it.id)}
                    style={{ marginTop: 4, width: it.w, textAlign: 'center', cursor: isDragging ? 'grabbing' : 'grab' }}>
                    <p style={{
                      fontSize: Math.max(8, Math.min(12, it.w / 8)),
                      fontFamily: 'var(--font-sans)', fontWeight: 600,
                      color: 'var(--color-foreground)', lineHeight: 1.25, wordBreak: 'break-word',
                      textShadow: '0 1px 3px rgba(255,255,255,0.95), 0 -1px 3px rgba(255,255,255,0.95)',
                    }}>{it.label}</p>
                    {showCosts && (() => {
                      let cost = 0;
                      if (it.type === 'comp') cost = srv.componentes.find(c => c.insumoId === it.refId)?.costoTotal ?? 0;
                      else if (it.type === 'veh') cost = srv.vehiculos.find(v => v.vehiculoId === it.refId)?.costoTotal ?? 0;
                      else cost = srv.personal.find(p => p.rol === it.refId)?.costoTotal ?? 0;
                      return cost > 0 ? (
                        <p style={{
                          fontSize: Math.max(7, Math.min(10, it.w / 9)),
                          fontFamily: 'var(--font-mono)', fontWeight: 700,
                          color: 'var(--color-primary)', marginTop: 1,
                          textShadow: '0 1px 3px rgba(255,255,255,0.95)',
                        }}>{formatMXN(cost)}</p>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Canvas footer hint */}
        <div className="flex-shrink-0 px-4 py-1.5 border-t flex items-center justify-between"
          style={{ borderColor: 'var(--color-border)', background: 'rgba(255,255,255,0.6)' }}>
          <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
            Arrastra para mover · Esquina dorada para redimensionar · Haz clic en el fondo para deseleccionar
          </p>
        </div>
      </div>

      {/* ── Cost panel ── */}
      <CostPanel srv={srv} />

      {/* Scoped styles */}
      <style>{`
        .vd-label { display:block; font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color:var(--color-muted-foreground); margin-bottom:4px; }
        .vd-input { width:100%; border:1px solid var(--color-border); border-radius:var(--radius); padding:6px 9px; font-size:12px; background:var(--color-background); color:var(--color-foreground); outline:none; }
        .vd-input:focus { border-color:var(--color-primary); }
      `}</style>
    </div>
  );
}
