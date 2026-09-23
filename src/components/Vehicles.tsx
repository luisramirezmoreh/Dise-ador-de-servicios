import { useState } from 'react';
import { type Vehiculo, formatMXN } from '../data/mockData';
import { useAppData } from '../store/AppDataContext';
import StatusBadge from './StatusBadge';

const TIPOS = ['Carroza', 'Camioneta', 'Vehículo de apoyo', 'Vehículo de traslado', 'Otro'];
const ZONAS = ['Zona Metropolitana', 'Altos', 'Chapala', 'Zacoalco'];

function calcCostoVehiculo(v: Vehiculo, kmEstimados = 30): number {
  const kmExtra = Math.max(0, kmEstimados - v.kmIncluidos);
  return v.costoFijo +
    kmExtra * v.costoPorKm +
    v.costoChoferPorHora * v.horasEstandar +
    v.casetas +
    v.viaticos +
    (v.mantenimientoPorKm + v.depreciacionPorKm) * kmEstimados;
}

export default function Vehicles() {
  const { vehiculos, setVehiculos } = useAppData();
  const [data, setDataLocal] = useState<Vehiculo[]>(vehiculos);
  function setData(v: Vehiculo[] | ((prev: Vehiculo[]) => Vehiculo[])) {
    const next = typeof v === 'function' ? v(data) : v;
    setDataLocal(next);
    setVehiculos(next);
  }
  const [editId, setEditId] = useState<string | null>(null);
  const [editRow, setEditRow] = useState<Partial<Vehiculo>>({});

  function startEdit(row: Vehiculo) { setEditId(row.id); setEditRow({ ...row }); }
  function saveEdit() {
    setData(prev => prev.map(v => v.id === editId ? { ...v, ...editRow } as Vehiculo : v));
    setEditId(null);
  }

  function addNew() {
    const nuevo: Vehiculo = {
      id: `VEH-${Date.now()}`, nombre: 'Nuevo vehículo', tipo: 'Otro', zonaBase: 'Zona Metropolitana',
      costoFijo: 0, costoPorKm: 0, kmIncluidos: 30, costoChoferPorHora: 0, horasEstandar: 0,
      mantenimientoPorKm: 0, depreciacionPorKm: 0, casetas: 0, viaticos: 0,
      modalidades: [], estatus: 'Inactivo',
    };
    setData(prev => [nuevo, ...prev]);
    startEdit(nuevo);
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>Vehículos</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-muted-foreground)' }}>Flota disponible para servicios — <span className="text-amber-700 font-medium">Datos de ejemplo</span></p>
        </div>
        <button onClick={addNew} className="px-4 py-2 rounded text-sm font-medium hover:opacity-90 transition-opacity"
          style={{ background: 'var(--color-primary)', color: 'white' }}>
          + Agregar vehículo
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {data.map(v => {
          const editing = editId === v.id;
          const costoEstimado = calcCostoVehiculo(v);
          return (
            <div key={v.id} className="rounded-lg border p-5 space-y-3" style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
              <div className="flex items-start justify-between">
                <div>
                  {editing
                    ? <input className="font-semibold text-base w-full border rounded px-2 py-1" style={{ borderColor: 'var(--color-border)' }} value={editRow.nombre ?? ''} onChange={e => setEditRow(p => ({ ...p, nombre: e.target.value }))} />
                    : <h3 className="font-semibold text-base" style={{ color: 'var(--color-foreground)' }}>{v.nombre}</h3>}
                  <div className="flex gap-2 mt-1 items-center">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--color-secondary)', color: 'var(--color-secondary-foreground)' }}>{v.tipo}</span>
                    <StatusBadge status={v.estatus} />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>Costo estimado</p>
                  <p className="font-semibold tabular-nums text-sm" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>{formatMXN(costoEstimado)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                {[
                  ['Zona base', editing ? <select className="border rounded px-1 py-0.5 text-xs w-full" style={{ borderColor: 'var(--color-border)' }} value={editRow.zonaBase ?? v.zonaBase} onChange={e => setEditRow(p => ({ ...p, zonaBase: e.target.value as any }))}>{ZONAS.map(z => <option key={z}>{z}</option>)}</select> : v.zonaBase],
                  ['Costo fijo', editing ? <input type="number" className="border rounded px-1 py-0.5 text-xs w-full" style={{ borderColor: 'var(--color-border)' }} value={editRow.costoFijo ?? 0} onChange={e => setEditRow(p => ({ ...p, costoFijo: +e.target.value }))} /> : formatMXN(v.costoFijo)],
                  ['$/km', editing ? <input type="number" className="border rounded px-1 py-0.5 text-xs w-full" style={{ borderColor: 'var(--color-border)' }} value={editRow.costoPorKm ?? 0} onChange={e => setEditRow(p => ({ ...p, costoPorKm: +e.target.value }))} /> : `${formatMXN(v.costoPorKm)}/km`],
                  ['km incluidos', editing ? <input type="number" className="border rounded px-1 py-0.5 text-xs w-full" style={{ borderColor: 'var(--color-border)' }} value={editRow.kmIncluidos ?? 0} onChange={e => setEditRow(p => ({ ...p, kmIncluidos: +e.target.value }))} /> : `${v.kmIncluidos} km`],
                  ['Chofer/hr', editing ? <input type="number" className="border rounded px-1 py-0.5 text-xs w-full" style={{ borderColor: 'var(--color-border)' }} value={editRow.costoChoferPorHora ?? 0} onChange={e => setEditRow(p => ({ ...p, costoChoferPorHora: +e.target.value }))} /> : formatMXN(v.costoChoferPorHora)],
                  ['Horas std.', editing ? <input type="number" className="border rounded px-1 py-0.5 text-xs w-full" style={{ borderColor: 'var(--color-border)' }} value={editRow.horasEstandar ?? 0} onChange={e => setEditRow(p => ({ ...p, horasEstandar: +e.target.value }))} /> : `${v.horasEstandar} hrs`],
                  ['Casetas', editing ? <input type="number" className="border rounded px-1 py-0.5 text-xs w-full" style={{ borderColor: 'var(--color-border)' }} value={editRow.casetas ?? 0} onChange={e => setEditRow(p => ({ ...p, casetas: +e.target.value }))} /> : formatMXN(v.casetas)],
                  ['Viáticos', editing ? <input type="number" className="border rounded px-1 py-0.5 text-xs w-full" style={{ borderColor: 'var(--color-border)' }} value={editRow.viaticos ?? 0} onChange={e => setEditRow(p => ({ ...p, viaticos: +e.target.value }))} /> : formatMXN(v.viaticos)],
                ].map(([label, val]) => (
                  <div key={label as string}>
                    <p className="font-medium" style={{ color: 'var(--color-muted-foreground)' }}>{label as string}</p>
                    <div className="font-medium tabular-nums mt-0.5" style={{ color: 'var(--color-foreground)', fontFamily: 'var(--font-mono)' }}>{val}</div>
                  </div>
                ))}
              </div>

              <div className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                <span className="font-medium">Modalidades: </span>{v.modalidades.join(', ')}
              </div>

              <div className="flex gap-2 pt-1">
                {editing ? (
                  <>
                    <button onClick={saveEdit} className="flex-1 py-1.5 rounded text-xs font-medium" style={{ background: 'var(--color-primary)', color: 'white' }}>Guardar</button>
                    <button onClick={() => setEditId(null)} className="flex-1 py-1.5 rounded text-xs" style={{ background: 'var(--color-secondary)', color: 'var(--color-secondary-foreground)' }}>Cancelar</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(v)} className="flex-1 py-1.5 rounded text-xs font-medium hover:opacity-80 transition-opacity" style={{ background: 'var(--color-secondary)', color: 'var(--color-secondary-foreground)' }}>Editar</button>
                    <button onClick={() => setData(prev => prev.map(x => x.id === v.id ? { ...x, estatus: x.estatus === 'Activo' ? 'Inactivo' : 'Activo' } : x))}
                      className="px-3 py-1.5 rounded text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                      {v.estatus === 'Activo' ? 'Desactivar' : 'Activar'}
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
