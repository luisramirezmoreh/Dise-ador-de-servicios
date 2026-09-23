import { useState } from 'react';
import { zonasConfig as initial, type ZonaConfig, formatMXN } from '../data/mockData';

export default function ZonesRules() {
  const [zonas, setZonas] = useState<ZonaConfig[]>(initial);
  const [selected, setSelected] = useState<ZonaConfig>(zonas[0]);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<ZonaConfig>(zonas[0]);

  function selectZona(z: ZonaConfig) {
    setSelected(z);
    setEditData({ ...z });
    setEditing(false);
  }

  function saveEdit() {
    setZonas(prev => prev.map(z => z.nombre === editData.nombre ? editData : z));
    setSelected(editData);
    setEditing(false);
  }

  const displayData = editing ? editData : selected;

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>Zonas y reglas</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-muted-foreground)' }}>Configuración operativa por zona de servicio — <span className="text-amber-700 font-medium">Datos de ejemplo</span></p>
      </div>

      <div className="flex gap-6">
        {/* Zone selector */}
        <div className="w-52 flex-shrink-0 space-y-2">
          {zonas.map(z => (
            <button key={z.nombre} onClick={() => selectZona(z)}
              className="w-full text-left px-4 py-3 rounded-lg border text-sm font-medium transition-colors"
              style={{
                background: selected.nombre === z.nombre ? 'var(--color-secondary)' : 'var(--color-card)',
                borderColor: selected.nombre === z.nombre ? 'var(--color-primary)' : 'var(--color-border)',
                color: selected.nombre === z.nombre ? 'var(--color-primary)' : 'var(--color-foreground)',
              }}>
              {z.nombre}
              <div className="text-xs font-normal mt-0.5" style={{ color: 'var(--color-muted-foreground)' }}>
                Factor: ×{z.factorZona}
              </div>
            </button>
          ))}
        </div>

        {/* Zone config panel */}
        <div className="flex-1 rounded-lg border p-6 space-y-6" style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-foreground)' }}>
              {selected.nombre}
            </h2>
            {!editing
              ? <button onClick={() => { setEditing(true); setEditData({ ...selected }); }} className="px-3 py-1.5 rounded text-sm font-medium" style={{ background: 'var(--color-secondary)', color: 'var(--color-secondary-foreground)' }}>Editar</button>
              : <div className="flex gap-2">
                  <button onClick={saveEdit} className="px-3 py-1.5 rounded text-sm font-medium" style={{ background: 'var(--color-primary)', color: 'white' }}>Guardar</button>
                  <button onClick={() => setEditing(false)} className="px-3 py-1.5 rounded text-sm" style={{ background: 'var(--color-secondary)', color: 'var(--color-secondary-foreground)' }}>Cancelar</button>
                </div>}
          </div>

          <div className="grid grid-cols-2 gap-6">
            {[
              ['Costo base operativo', formatMXN(displayData.costoBaseOperativo), 'costoBaseOperativo', true],
              ['Factor de zona', `×${displayData.factorZona}`, 'factorZona', true],
              ['Costo km adicional', formatMXN(displayData.costoPorKmAdicional) + '/km', 'costoPorKmAdicional', true],
              ['Viático estándar', formatMXN(displayData.viatico), 'viatico', true],
              ['Proveedor preferente', displayData.proveedorPreferente, 'proveedorPreferente', false],
              ['Tiempo promedio servicio', `${displayData.tiempoPromedioServicio} hrs`, 'tiempoPromedioServicio', true],
            ].map(([label, display, field, isNumber]) => (
              <div key={field as string}>
                <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: 'var(--color-muted-foreground)' }}>{label as string}</p>
                {editing
                  ? <input
                      type={isNumber ? 'number' : 'text'}
                      className="w-full border rounded px-3 py-2 text-sm"
                      style={{ borderColor: 'var(--color-border)' }}
                      value={String((editData as any)[field as string] ?? '')}
                      onChange={e => setEditData(p => ({ ...p, [field as string]: isNumber ? +e.target.value : e.target.value }))}
                    />
                  : <p className="text-sm font-medium tabular-nums" style={{ color: 'var(--color-foreground)', fontFamily: isNumber ? 'var(--font-mono)' : 'inherit' }}>{display as string}</p>}
              </div>
            ))}
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: 'var(--color-muted-foreground)' }}>Vehículos disponibles</p>
            <div className="flex flex-wrap gap-2">
              {displayData.vehiculosDisponibles.map(v => (
                <span key={v} className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'var(--color-secondary)', color: 'var(--color-secondary-foreground)' }}>{v}</span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: 'var(--color-muted-foreground)' }}>Observaciones operativas</p>
            {editing
              ? <textarea rows={3} className="w-full border rounded px-3 py-2 text-sm resize-none" style={{ borderColor: 'var(--color-border)' }} value={editData.observaciones} onChange={e => setEditData(p => ({ ...p, observaciones: e.target.value }))} />
              : <p className="text-sm" style={{ color: 'var(--color-secondary-foreground)' }}>{displayData.observaciones}</p>}
          </div>

          {/* Summary card */}
          <div className="rounded-lg p-4" style={{ background: 'var(--color-secondary)' }}>
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-muted-foreground)' }}>Resumen económico</p>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>Costo base</p>
                <p className="font-semibold tabular-nums" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>{formatMXN(displayData.costoBaseOperativo)}</p>
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>Factor</p>
                <p className="font-semibold tabular-nums" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>×{displayData.factorZona}</p>
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>Costo base ajustado</p>
                <p className="font-semibold tabular-nums" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>{formatMXN(displayData.costoBaseOperativo * displayData.factorZona)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
