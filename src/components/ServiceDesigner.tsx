import { useState, useMemo } from 'react';
import {
  type Servicio, type ComponenteServicio, type VehiculoServicio, type PersonalServicio,
  formatMXN, calcularCostoServicio,
  type Zona, type Modalidad, type Nivel,
} from '../data/mockData';
import { useAppData } from '../store/AppDataContext';
import StatusBadge from './StatusBadge';
import VisualDesigner from './VisualDesigner';

const ZONAS: Zona[] = ['Zona Metropolitana', 'Altos', 'Chapala', 'Zacoalco'];
const MODALIDADES: Modalidad[] = ['Capilla', 'Domicilio', 'Cremación directa', 'Traslado'];
const NIVELES: Nivel[] = ['Básico', 'Estándar', 'Superior', 'Premium', 'Personalizado'];
const GRUPOS = ['Ataúd', 'Urna', 'Preparación', 'Cafetería', 'Flores', 'Papelería', 'Limpieza', 'Mobiliario', 'Equipo de velación', 'Trámites', 'Proveedor externo', 'Otro'];

const TODAY = new Date().toISOString().split('T')[0];

function emptyServicio(): Servicio {
  return {
    id: `SRV-${Date.now()}`,
    nombre: '',
    modalidad: 'Capilla',
    zona: 'Zona Metropolitana',
    nivel: 'Básico',
    estatus: 'Borrador',
    version: 1,
    fechaCreacion: TODAY,
    fechaModificacion: TODAY,
    componentes: [],
    vehiculos: [],
    personal: [],
    costosIndirectos: 500,
    margenSugerido: 35,
    observaciones: '',
  };
}

// ─── Cost panel ───────────────────────────────────────────────────────────────
function CostPanel({ srv, prevCosts }: { srv: Servicio; prevCosts?: ReturnType<typeof calcularCostoServicio> }) {
  const costs = useMemo(() => calcularCostoServicio(srv), [srv]);
  const hasDrift = prevCosts && Math.abs((costs.total - prevCosts.total) / prevCosts.total) > 0.10;

  const rows: [string, number, string?][] = [
    ['Ataúd / Urna', costs.ataud, 'ataud'],
    ['Insumos directos', costs.insumos],
    ['Vehículos y traslado', costs.vehiculos],
    ['Personal operativo', costs.personal],
    ['Trámites', costs.tramites],
    ['Proveedores externos', costs.proveedoresExternos],
    ['Costos indirectos', costs.costosIndirectos],
    ['Merma estimada', costs.merma],
  ];

  return (
    <aside
      className="flex-shrink-0 flex flex-col overflow-hidden"
      style={{
        width: 264,
        borderLeft: '1px solid var(--color-border)',
        background: '#FEFCF7',
      }}
    >
      {/* Panel header */}
      <div className="px-5 pt-5 pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-primary)' }}>
          Costo del servicio
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted-foreground)' }}>Actualizado en tiempo real</p>
      </div>

      {/* Drift alert */}
      {hasDrift && (
        <div className="mx-4 mt-3 rounded px-3 py-2 text-xs" style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B' }}>
          <p className="font-semibold">⚠ Variación &gt;10%</p>
          <p>vs versión anterior</p>
        </div>
      )}

      {/* Line items */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2.5">
        {rows.map(([label, val]) => (
          <div key={label} className="flex items-center justify-between gap-2">
            <span className="text-xs leading-tight" style={{ color: 'var(--color-muted-foreground)' }}>{label}</span>
            <span
              className="text-xs tabular-nums font-medium flex-shrink-0"
              style={{ fontFamily: 'var(--font-mono)', color: val > 0 ? 'var(--color-foreground)' : 'var(--color-border)' }}
            >
              {formatMXN(val)}
            </span>
          </div>
        ))}
      </div>

      {/* Totals block */}
      <div className="border-t px-5 pb-5 pt-4 space-y-3" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-foreground)' }}>
            Costo total
          </span>
          <span className="text-base font-bold tabular-nums" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>
            {formatMXN(costs.total)}
          </span>
        </div>

        <div className="rounded-lg p-3 space-y-2.5" style={{ background: 'var(--color-secondary)' }}>
          <div className="flex items-center justify-between text-xs gap-2">
            <span style={{ color: 'var(--color-muted-foreground)' }}>Margen</span>
            <span className="tabular-nums font-medium" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-foreground)' }}>
              {srv.margenSugerido}%
            </span>
          </div>
          <div className="flex items-center justify-between border-t pt-2.5" style={{ borderColor: 'var(--color-border)' }}>
            <span className="text-xs font-semibold" style={{ color: '#166534' }}>Precio sugerido</span>
            <span className="text-sm font-bold tabular-nums" style={{ color: '#166534', fontFamily: 'var(--font-mono)' }}>
              {formatMXN(costs.precioSugerido)}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─── Alert bar ────────────────────────────────────────────────────────────────
function AlertBar({ srv }: { srv: Servicio }) {
  const { insumos: insumoCatalog } = useAppData();
  const alerts: { msg: string; level: 'error' | 'warn' }[] = [];

  if (!srv.nombre) alerts.push({ msg: 'El servicio no tiene nombre.', level: 'error' });
  if (srv.componentes.some(c => c.costoUnitario === 0)) alerts.push({ msg: 'Hay insumos sin precio asignado.', level: 'error' });
  if (srv.componentes.some(c => !c.proveedor)) alerts.push({ msg: 'Algunos componentes no tienen proveedor asignado.', level: 'warn' });

  const vencidos = srv.componentes.filter(c => {
    const ins = insumoCatalog.find(i => i.id === c.insumoId);
    return ins?.vigenciaPrecio && ins.vigenciaPrecio < TODAY;
  });
  if (vencidos.length) alerts.push({ msg: `Precio vencido en: ${vencidos.map(v => v.nombre).join(', ')}.`, level: 'warn' });

  if (srv.componentes.length === 0 && srv.vehiculos.length === 0 && srv.personal.length === 0)
    alerts.push({ msg: 'Servicio incompleto: sin componentes, vehículos ni personal.', level: 'error' });

  if (!alerts.length) return null;

  return (
    <div className="mx-6 mt-4 rounded-lg overflow-hidden border" style={{ borderColor: '#FCD34D' }}>
      {alerts.map((a, i) => (
        <div key={i} className="flex items-start gap-2.5 px-4 py-2.5 text-xs border-b last:border-b-0"
          style={{ background: a.level === 'error' ? '#FEF2F2' : '#FFFBEB', color: a.level === 'error' ? '#991B1B' : '#92400E', borderColor: '#FCD34D' }}>
          <span className="mt-0.5 flex-shrink-0">{a.level === 'error' ? '✕' : '⚠'}</span>
          <span>{a.msg}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Step 0: General data ─────────────────────────────────────────────────────
function StepGeneral({ srv, setSrv }: { srv: Servicio; setSrv: React.Dispatch<React.SetStateAction<Servicio>> }) {
  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-5 max-w-2xl">
      <div className="col-span-2">
        <label className="field-label">Nombre del servicio</label>
        <input
          className="field-input"
          value={srv.nombre}
          onChange={e => setSrv(p => ({ ...p, nombre: e.target.value }))}
          placeholder="Ej. Servicio Básico Capilla ZMG"
        />
      </div>
      {([
        ['Modalidad', 'modalidad', MODALIDADES],
        ['Zona', 'zona', ZONAS],
        ['Nivel', 'nivel', NIVELES],
        ['Estatus', 'estatus', ['Borrador', 'En revisión', 'Activo', 'Obsoleto']],
      ] as [string, string, string[]][]).map(([label, field, opts]) => (
        <div key={field}>
          <label className="field-label">{label}</label>
          <select className="field-input" value={(srv as any)[field]}
            onChange={e => setSrv(p => ({ ...p, [field]: e.target.value }))}>
            {opts.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      ))}
      <div className="col-span-2">
        <label className="field-label">Margen sugerido (%)</label>
        <input type="number" className="field-input w-32" value={srv.margenSugerido}
          onChange={e => setSrv(p => ({ ...p, margenSugerido: +e.target.value }))} />
      </div>
      <div className="col-span-2">
        <label className="field-label">Costos indirectos (MXN)</label>
        <input type="number" className="field-input w-40" value={srv.costosIndirectos}
          onChange={e => setSrv(p => ({ ...p, costosIndirectos: +e.target.value }))} />
      </div>
      <div className="col-span-2">
        <label className="field-label">Observaciones operativas</label>
        <textarea rows={3} className="field-input resize-none" value={srv.observaciones}
          onChange={e => setSrv(p => ({ ...p, observaciones: e.target.value }))} />
      </div>
    </div>
  );
}

// ─── Component row (editable inline) ─────────────────────────────────────────
function ComponenteRow({
  comp, onUpdate, onRemove,
}: {
  comp: ComponenteServicio;
  onUpdate: (changes: Partial<ComponenteServicio>) => void;
  onRemove: () => void;
}) {
  const { insumos: insumoCatalog } = useAppData();
  const ins = insumoCatalog.find(i => i.id === comp.insumoId);
  const priceless = comp.costoUnitario === 0;
  const noProvider = !comp.proveedor;
  const expired = ins?.vigenciaPrecio && ins.vigenciaPrecio < TODAY;
  const hasIssue = priceless || noProvider || expired;

  return (
    <div
      className="rounded-lg border"
      style={{
        background: hasIssue ? '#FFFDF5' : 'var(--color-card)',
        borderColor: hasIssue ? '#FCD34D' : 'var(--color-border)',
      }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="px-2 py-0.5 rounded text-xs flex-shrink-0" style={{ background: 'var(--color-secondary)', color: 'var(--color-secondary-foreground)' }}>
            {comp.categoria}
          </span>
          <span className="font-semibold text-sm truncate" style={{ color: 'var(--color-foreground)' }}>{comp.nombre}</span>
          {comp.obligatorio && <span className="text-xs flex-shrink-0" style={{ color: 'var(--color-primary)' }}>Obligatorio</span>}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-3">
          <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>
            {formatMXN(comp.costoTotal)}
          </span>
          <button onClick={onRemove} className="w-5 h-5 rounded flex items-center justify-center text-xs transition-colors hover:bg-red-50" style={{ color: '#9CA3AF' }}>✕</button>
        </div>
      </div>

      {/* Inline alerts */}
      {hasIssue && (
        <div className="px-4 pt-2 flex gap-3 flex-wrap">
          {priceless && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#FEE2E2', color: '#991B1B' }}>Sin precio</span>}
          {noProvider && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#FEF9EC', color: '#92400E' }}>Sin proveedor</span>}
          {expired && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#FEF9EC', color: '#92400E' }}>Precio vencido {ins?.vigenciaPrecio}</span>}
        </div>
      )}

      {/* Editable fields */}
      <div className="grid grid-cols-4 gap-3 px-4 pt-2 pb-3">
        <div>
          <label className="field-label-sm">Cantidad</label>
          <input type="number" min={1} className="field-input-sm"
            value={comp.cantidad}
            onChange={e => onUpdate({ cantidad: +e.target.value })} />
        </div>
        <div>
          <label className="field-label-sm">Costo unitario (MXN)</label>
          <input type="number" className="field-input-sm"
            value={comp.costoUnitario}
            onChange={e => onUpdate({ costoUnitario: +e.target.value })} />
        </div>
        <div>
          <label className="field-label-sm">Proveedor</label>
          <input className="field-input-sm" placeholder="Nombre proveedor"
            value={comp.proveedor}
            onChange={e => onUpdate({ proveedor: e.target.value })} />
        </div>
        <div>
          <label className="field-label-sm">Merma (%)</label>
          <input type="number" min={0} max={100} className="field-input-sm"
            value={comp.merma}
            onChange={e => onUpdate({ merma: +e.target.value })} />
        </div>
        <div className="col-span-4">
          <label className="field-label-sm">Notas</label>
          <input className="field-input-sm w-full" placeholder="Observaciones del componente…"
            value={comp.notas}
            onChange={e => onUpdate({ notas: e.target.value })} />
        </div>
      </div>
    </div>
  );
}

// ─── Step 1: Components ───────────────────────────────────────────────────────
function StepComponentes({ srv, setSrv }: { srv: Servicio; setSrv: React.Dispatch<React.SetStateAction<Servicio>> }) {
  const { insumos: insumoCatalog } = useAppData();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('Todos');

  function addComp(ins: typeof insumoCatalog[0]) {
    if (srv.componentes.find(c => c.insumoId === ins.id)) return;
    const c: ComponenteServicio = {
      insumoId: ins.id, nombre: ins.nombre, categoria: ins.categoria, cantidad: ins.rendimientoPorServicio,
      unidad: ins.unidadCompra, proveedor: ins.proveedor, costoUnitario: ins.costoUnitario,
      merma: ins.merma, costoTotal: ins.costoUnitario * ins.rendimientoPorServicio * (1 + ins.merma / 100),
      obligatorio: ins.obligatorio, notas: '',
    };
    setSrv(p => ({ ...p, componentes: [...p.componentes, c] }));
  }

  function updateComp(id: string, changes: Partial<ComponenteServicio>) {
    setSrv(p => ({
      ...p, componentes: p.componentes.map(c => {
        if (c.insumoId !== id) return c;
        const u = { ...c, ...changes };
        u.costoTotal = u.costoUnitario * u.cantidad * (1 + u.merma / 100);
        return u;
      }),
    }));
  }

  function removeComp(id: string) {
    setSrv(p => ({ ...p, componentes: p.componentes.filter(c => c.insumoId !== id) }));
  }

  const cats = ['Todos', ...GRUPOS];
  const available = insumoCatalog.filter(i =>
    (catFilter === 'Todos' || i.categoria === catFilter) &&
    (i.nombre.toLowerCase().includes(search.toLowerCase()) || i.categoria.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex gap-5 h-full" style={{ minHeight: 0 }}>
      {/* Left: catalog picker */}
      <div className="w-72 flex-shrink-0 flex flex-col gap-3">
        <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--color-muted-foreground)' }}>Catálogo de insumos</p>
        <input
          className="field-input text-xs"
          placeholder="Buscar insumo…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex flex-wrap gap-1">
          {cats.map(c => (
            <button key={c} onClick={() => setCatFilter(c)}
              className="px-2 py-0.5 rounded-full text-xs transition-colors"
              style={{
                background: catFilter === c ? 'var(--color-primary)' : 'var(--color-secondary)',
                color: catFilter === c ? 'white' : 'var(--color-secondary-foreground)',
              }}>{c === 'Todos' ? c : c.slice(0, 10)}</button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto rounded-lg border divide-y" style={{ borderColor: 'var(--color-border)' }}>
          {available.map(ins => {
            const added = srv.componentes.some(c => c.insumoId === ins.id);
            const priceless = ins.precioSinIva === 0 && ins.categoria !== 'Equipo de velación';
            return (
              <div key={ins.id}
                className="px-3 py-2.5 flex items-start justify-between gap-2 transition-colors"
                style={{ background: 'var(--color-card)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-muted)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-card)')}>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    {priceless && <span title="Sin precio" className="text-amber-500 text-xs">⚠</span>}
                    <p className="text-xs font-medium truncate" style={{ color: 'var(--color-foreground)' }}>{ins.nombre}</p>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted-foreground)' }}>
                    {ins.categoria} · {priceless ? <span className="text-red-500">sin precio</span> : formatMXN(ins.costoUnitario)}
                  </p>
                </div>
                <button
                  onClick={() => added ? removeComp(ins.id) : addComp(ins)}
                  className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-sm font-bold transition-colors"
                  style={{ background: added ? '#FEE2E2' : 'var(--color-secondary)', color: added ? '#DC2626' : 'var(--color-primary)' }}>
                  {added ? '−' : '+'}
                </button>
              </div>
            );
          })}
          {available.length === 0 && <div className="px-4 py-6 text-xs text-center" style={{ color: 'var(--color-muted-foreground)' }}>Sin resultados</div>}
        </div>
      </div>

      {/* Right: selected components */}
      <div className="flex-1 overflow-y-auto space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--color-muted-foreground)' }}>
            Componentes seleccionados
          </p>
          <span className="text-xs tabular-nums px-2 py-0.5 rounded-full" style={{ background: 'var(--color-secondary)', color: 'var(--color-secondary-foreground)', fontFamily: 'var(--font-mono)' }}>
            {srv.componentes.length} elemento{srv.componentes.length !== 1 ? 's' : ''}
          </span>
        </div>
        {srv.componentes.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed p-10 text-center" style={{ borderColor: 'var(--color-border)' }}>
            <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>Selecciona insumos del catálogo para agregar</p>
          </div>
        ) : (
          srv.componentes.map(c => (
            <ComponenteRow
              key={c.insumoId}
              comp={c}
              onUpdate={changes => updateComp(c.insumoId, changes)}
              onRemove={() => removeComp(c.insumoId)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Step 2: Vehicles ─────────────────────────────────────────────────────────
function StepVehiculos({ srv, setSrv }: { srv: Servicio; setSrv: React.Dispatch<React.SetStateAction<Servicio>> }) {
  const { vehiculos: vehiculoCatalog } = useAppData();
  function addVeh(veh: typeof vehiculoCatalog[0]) {
    if (srv.vehiculos.find(v => v.vehiculoId === veh.id)) return;
    const km = 30;
    const kmExtra = Math.max(0, km - veh.kmIncluidos);
    const cost = veh.costoFijo + kmExtra * veh.costoPorKm + veh.costoChoferPorHora * veh.horasEstandar + veh.casetas + veh.viaticos + (veh.mantenimientoPorKm + veh.depreciacionPorKm) * km;
    const v: VehiculoServicio = { vehiculoId: veh.id, nombre: veh.nombre, kmEstimados: km, casetas: veh.casetas, viaticos: veh.viaticos, horasChofer: veh.horasEstandar, observaciones: '', costoTotal: cost };
    setSrv(p => ({ ...p, vehiculos: [...p.vehiculos, v] }));
  }

  function updateVeh(id: string, changes: Partial<VehiculoServicio>) {
    setSrv(p => ({
      ...p, vehiculos: p.vehiculos.map(v => {
        if (v.vehiculoId !== id) return v;
        const veh = vehiculoCatalog.find(x => x.id === id)!;
        const u = { ...v, ...changes };
        const km = u.kmEstimados;
        const kmExtra = Math.max(0, km - veh.kmIncluidos);
        u.costoTotal = veh.costoFijo + kmExtra * veh.costoPorKm + u.horasChofer * veh.costoChoferPorHora + u.casetas + u.viaticos + (veh.mantenimientoPorKm + veh.depreciacionPorKm) * km;
        return u;
      }),
    }));
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--color-muted-foreground)' }}>Flota disponible</p>
      {vehiculoCatalog.map(veh => {
        const added = srv.vehiculos.find(v => v.vehiculoId === veh.id);
        return (
          <div key={veh.id} className="rounded-lg border" style={{ background: 'var(--color-card)', borderColor: added ? 'var(--color-primary)' : 'var(--color-border)' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--color-foreground)' }}>{veh.nombre}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted-foreground)' }}>{veh.tipo} — Base: {veh.zonaBase}</p>
              </div>
              <div className="flex items-center gap-3">
                {added && <span className="tabular-nums text-sm font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>{formatMXN(added.costoTotal)}</span>}
                <button
                  onClick={() => added ? setSrv(p => ({ ...p, vehiculos: p.vehiculos.filter(v => v.vehiculoId !== veh.id) })) : addVeh(veh)}
                  className="px-3 py-1.5 rounded text-xs font-semibold transition-colors"
                  style={{ background: added ? '#FEE2E2' : 'var(--color-secondary)', color: added ? '#DC2626' : 'var(--color-primary)' }}>
                  {added ? '− Quitar' : '+ Agregar'}
                </button>
              </div>
            </div>
            {added && (
              <div className="grid grid-cols-4 gap-3 px-4 py-3">
                {[
                  ['Km estimados', 'kmEstimados'],
                  ['Casetas (MXN)', 'casetas'],
                  ['Viáticos (MXN)', 'viaticos'],
                  ['Horas chofer', 'horasChofer'],
                ].map(([label, field]) => (
                  <div key={field}>
                    <label className="field-label-sm">{label}</label>
                    <input type="number" className="field-input-sm"
                      value={(added as any)[field]}
                      onChange={e => updateVeh(veh.id, { [field]: +e.target.value } as any)} />
                  </div>
                ))}
                <div className="col-span-4">
                  <label className="field-label-sm">Observaciones de ruta</label>
                  <input className="field-input-sm w-full" placeholder="Ej. Ruta GDL–Chapala por Periferico…"
                    value={added.observaciones}
                    onChange={e => updateVeh(veh.id, { observaciones: e.target.value })} />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Step 3: Personnel ────────────────────────────────────────────────────────
function StepPersonal({ srv, setSrv }: { srv: Servicio; setSrv: React.Dispatch<React.SetStateAction<Servicio>> }) {
  const { personal: personalCatalog } = useAppData();
  function addPer(rol: typeof personalCatalog[0]) {
    if (srv.personal.find(p => p.rol === rol.rol)) return;
    const p: PersonalServicio = { rol: rol.rol, cantidad: rol.cantidadEstandar, horas: rol.horasEstandar, costoPorHora: rol.costoPorHora, costoTotal: rol.costoPorHora * rol.horasEstandar * rol.cantidadEstandar };
    setSrv(prev => ({ ...prev, personal: [...prev.personal, p] }));
  }

  function updatePer(rol: string, changes: Partial<PersonalServicio>) {
    setSrv(p => ({
      ...p, personal: p.personal.map(x => {
        if (x.rol !== rol) return x;
        const u = { ...x, ...changes };
        u.costoTotal = u.costoPorHora * u.horas * u.cantidad;
        return u;
      }),
    }));
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--color-muted-foreground)' }}>Roles de personal</p>
      {personalCatalog.map(rol => {
        const added = srv.personal.find(p => p.rol === rol.rol);
        return (
          <div key={rol.id} className="rounded-lg border" style={{ background: 'var(--color-card)', borderColor: added ? 'var(--color-primary)' : 'var(--color-border)' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--color-foreground)' }}>{rol.rol}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted-foreground)' }}>
                  {formatMXN(rol.costoPorHora)}/hr · std {rol.horasEstandar} hrs · {rol.cantidadEstandar} persona{rol.cantidadEstandar !== 1 ? 's' : ''} · {rol.obligatorio ? 'Obligatorio' : 'Opcional'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {added && <span className="tabular-nums text-sm font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>{formatMXN(added.costoTotal)}</span>}
                <button
                  onClick={() => added ? setSrv(p => ({ ...p, personal: p.personal.filter(x => x.rol !== rol.rol) })) : addPer(rol)}
                  className="px-3 py-1.5 rounded text-xs font-semibold"
                  style={{ background: added ? '#FEE2E2' : 'var(--color-secondary)', color: added ? '#DC2626' : 'var(--color-primary)' }}>
                  {added ? '− Quitar' : '+ Agregar'}
                </button>
              </div>
            </div>
            {added && (
              <div className="grid grid-cols-3 gap-3 px-4 py-3">
                {[['Cantidad', 'cantidad'], ['Horas', 'horas'], ['$/hora', 'costoPorHora']].map(([label, field]) => (
                  <div key={field}>
                    <label className="field-label-sm">{label}</label>
                    <input type="number" className="field-input-sm"
                      value={(added as any)[field]}
                      onChange={e => updatePer(rol.rol, { [field]: +e.target.value } as any)} />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
interface Props { initialServicio?: Servicio; onSave?: (s: Servicio) => void; imageMap?: Record<string, string>; }

export default function ServiceDesigner({ initialServicio, onSave, imageMap = {} }: Props) {
  const { servicios: serviciosCatalog, setServicios } = useAppData();
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<'form' | 'visual'>('form');
  const [srv, setSrv] = useState<Servicio>(initialServicio ?? emptyServicio());
  const [saved, setSaved] = useState(false);

  // Previous version costs for drift alert
  const prevVersion = serviciosCatalog.find(s => s.id === srv.id);
  const prevCosts = prevVersion ? calcularCostoServicio(prevVersion) : undefined;

  const STEPS = ['Datos generales', 'Insumos y componentes', 'Vehículos y ruta', 'Personal', 'Resumen'];

  function handleSave() {
    onSave?.(srv);
    // Upsert to servicios catalog in context (persists to Supabase)
    setServicios(prev => {
      const exists = prev.find(s => s.id === srv.id);
      return exists ? prev.map(s => s.id === srv.id ? srv : s) : [...prev, srv];
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const currentCosts = calcularCostoServicio(srv);

  const ModeToggle = () => (
    <div className="flex rounded overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
      <button onClick={() => setMode('form')}
        className="px-3 py-1.5 text-xs font-semibold transition-colors"
        style={{ background: mode === 'form' ? 'var(--color-primary)' : 'var(--color-card)', color: mode === 'form' ? 'white' : 'var(--color-muted-foreground)' }}>
        ≡ Formulario
      </button>
      <button onClick={() => setMode('visual')}
        className="px-3 py-1.5 text-xs font-semibold transition-colors"
        style={{ background: mode === 'visual' ? 'var(--color-primary)' : 'var(--color-card)', color: mode === 'visual' ? 'white' : 'var(--color-muted-foreground)', borderLeft: '1px solid var(--color-border)' }}>
        ◈ Modo visual
      </button>
    </div>
  );

  if (mode === 'visual') {
    return (
      <>
        <style>{`
          .field-label { display: block; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-muted-foreground); margin-bottom: 5px; }
        `}</style>
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex-shrink-0 flex items-center justify-between px-6 py-3 border-b"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-card)' }}>
            <div className="min-w-0">
              <h1 className="text-base font-semibold truncate" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-foreground)' }}>
                {srv.nombre || <span style={{ color: 'var(--color-muted-foreground)', fontStyle: 'italic' }}>Sin nombre</span>}
              </h1>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <StatusBadge status={srv.estatus} />
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--color-muted)', color: 'var(--color-muted-foreground)' }}>{srv.zona}</span>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--color-muted)', color: 'var(--color-muted-foreground)' }}>{srv.modalidad}</span>
                <span className="text-xs" style={{ color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-mono)' }}>v{srv.version}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ModeToggle />
              <button onClick={handleSave} className="px-4 py-2 rounded text-sm font-semibold transition-all"
                style={{ background: saved ? '#16A34A' : 'var(--color-primary)', color: 'white' }}>
                {saved ? '✓ Guardado' : 'Guardar borrador'}
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <VisualDesigner srv={srv} setSrv={setSrv} imageMap={imageMap} />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Scoped utility classes injected via style tag */}
      <style>{`
        .field-label { display: block; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-muted-foreground); margin-bottom: 5px; }
        .field-label-sm { display: block; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--color-muted-foreground); margin-bottom: 3px; }
        .field-input { width: 100%; border: 1px solid var(--color-border); border-radius: var(--radius); padding: 7px 10px; font-size: 13px; background: var(--color-card); color: var(--color-foreground); outline: none; transition: border-color 0.15s; font-family: var(--font-sans); }
        .field-input:focus { border-color: var(--color-primary); }
        .field-input-sm { width: 100%; border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: 5px 8px; font-size: 12px; background: var(--color-background); color: var(--color-foreground); outline: none; transition: border-color 0.15s; font-family: var(--font-sans); }
        .field-input-sm:focus { border-color: var(--color-primary); }
      `}</style>

      <div className="flex h-full overflow-hidden">
        {/* ── Main content area ── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* Top bar */}
          <div className="flex-shrink-0 px-6 pt-5 pb-0 border-b" style={{ borderColor: 'var(--color-border)', background: 'var(--color-card)' }}>
            <div className="flex items-start justify-between mb-4 gap-4">
              <div className="min-w-0">
                <h1 className="text-xl font-semibold truncate" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-foreground)' }}>
                  {srv.nombre || <span style={{ color: 'var(--color-muted-foreground)', fontStyle: 'italic' }}>Sin nombre</span>}
                </h1>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <StatusBadge status={srv.estatus} />
                  {srv.zona && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--color-muted)', color: 'var(--color-muted-foreground)' }}>{srv.zona}</span>}
                  {srv.modalidad && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--color-muted)', color: 'var(--color-muted-foreground)' }}>{srv.modalidad}</span>}
                  {srv.nivel && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--color-muted)', color: 'var(--color-muted-foreground)' }}>{srv.nivel}</span>}
                  <span className="text-xs" style={{ color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-mono)' }}>v{srv.version}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ModeToggle />
                <button
                  onClick={handleSave}
                  className="flex-shrink-0 px-4 py-2 rounded text-sm font-semibold transition-all"
                  style={{ background: saved ? '#16A34A' : 'var(--color-primary)', color: 'white' }}>
                  {saved ? '✓ Guardado' : 'Guardar borrador'}
                </button>
              </div>
            </div>

            {/* Step tabs */}
            <div className="flex">
              {STEPS.map((s, idx) => (
                <button key={s} onClick={() => setStep(idx)}
                  className="px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap"
                  style={{
                    borderBottomColor: step === idx ? 'var(--color-primary)' : 'transparent',
                    color: step === idx ? 'var(--color-primary)' : 'var(--color-muted-foreground)',
                    marginBottom: -1,
                  }}>
                  <span className="mr-1 opacity-50">{idx + 1}.</span>{s}
                </button>
              ))}
            </div>
          </div>

          {/* Alert bar */}
          <AlertBar srv={srv} />

          {/* Step content */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {step === 0 && <StepGeneral srv={srv} setSrv={setSrv} />}
            {step === 1 && <StepComponentes srv={srv} setSrv={setSrv} />}
            {step === 2 && <StepVehiculos srv={srv} setSrv={setSrv} />}
            {step === 3 && <StepPersonal srv={srv} setSrv={setSrv} />}
            {step === 4 && (
              <div className="max-w-md space-y-4">
                <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--color-muted-foreground)' }}>Resumen de costo de otorgamiento</p>
                <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
                  {[
                    ['Ataúd / Urna', currentCosts.ataud],
                    ['Insumos directos', currentCosts.insumos],
                    ['Vehículos y traslado', currentCosts.vehiculos],
                    ['Personal operativo', currentCosts.personal],
                    ['Trámites', currentCosts.tramites],
                    ['Proveedores externos', currentCosts.proveedoresExternos],
                    ['Costos indirectos', currentCosts.costosIndirectos],
                    ['Merma estimada', currentCosts.merma],
                  ].map(([label, val]) => (
                    <div key={label as string} className="flex items-center justify-between px-5 py-2.5 text-sm border-b" style={{ borderColor: 'var(--color-border)' }}>
                      <span style={{ color: 'var(--color-secondary-foreground)' }}>{label as string}</span>
                      <span className="tabular-nums font-medium" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-foreground)' }}>{formatMXN(val as number)}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between px-5 py-3.5 font-bold text-base" style={{ background: 'var(--color-secondary)' }}>
                    <span style={{ color: 'var(--color-foreground)' }}>Costo total</span>
                    <span className="tabular-nums" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>{formatMXN(currentCosts.total)}</span>
                  </div>
                </div>

                <div className="rounded-lg border p-4 space-y-4" style={{ borderColor: 'var(--color-border)', background: 'var(--color-card)' }}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="field-label">Margen sugerido (%)</label>
                      <input type="number" className="field-input"
                        value={srv.margenSugerido} onChange={e => setSrv(p => ({ ...p, margenSugerido: +e.target.value }))} />
                    </div>
                    <div>
                      <label className="field-label">Costos indirectos (MXN)</label>
                      <input type="number" className="field-input"
                        value={srv.costosIndirectos} onChange={e => setSrv(p => ({ ...p, costosIndirectos: +e.target.value }))} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
                    <span className="text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>Precio sugerido (+{srv.margenSugerido}%)</span>
                    <span className="text-lg font-bold tabular-nums" style={{ color: '#16A34A', fontFamily: 'var(--font-mono)' }}>{formatMXN(currentCosts.precioSugerido)}</span>
                  </div>
                </div>

                <button onClick={handleSave} className="w-full py-2.5 rounded text-sm font-semibold"
                  style={{ background: saved ? '#16A34A' : 'var(--color-primary)', color: 'white' }}>
                  {saved ? '✓ Servicio guardado' : 'Confirmar y guardar'}
                </button>
              </div>
            )}
          </div>

          {/* Navigation footer */}
          <div className="flex-shrink-0 flex items-center justify-between px-6 py-3 border-t" style={{ borderColor: 'var(--color-border)', background: 'var(--color-card)' }}>
            <button
              onClick={() => setStep(s => Math.max(0, s - 1))}
              disabled={step === 0}
              className="px-4 py-2 rounded text-sm font-medium transition-opacity"
              style={{ background: 'var(--color-secondary)', color: 'var(--color-secondary-foreground)', opacity: step === 0 ? 0.4 : 1 }}>
              ← Anterior
            </button>
            <div className="flex gap-1.5">
              {STEPS.map((_, idx) => (
                <button key={idx} onClick={() => setStep(idx)}
                  className="w-2 h-2 rounded-full transition-all"
                  style={{ background: step === idx ? 'var(--color-primary)' : 'var(--color-border)' }} />
              ))}
            </div>
            <button
              onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))}
              disabled={step === STEPS.length - 1}
              className="px-4 py-2 rounded text-sm font-medium transition-opacity"
              style={{ background: 'var(--color-primary)', color: 'white', opacity: step === STEPS.length - 1 ? 0.4 : 1 }}>
              Siguiente →
            </button>
          </div>
        </div>

        {/* ── Fixed cost panel ── */}
        <CostPanel srv={srv} prevCosts={prevCosts} />
      </div>
    </>
  );
}
