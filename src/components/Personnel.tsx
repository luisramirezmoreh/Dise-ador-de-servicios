import { useState } from 'react';
import { type Personal, formatMXN } from '../data/mockData';
import { useAppData } from '../store/AppDataContext';

export default function Personnel() {
  const { personal, setPersonal } = useAppData();
  const [data, setDataLocal] = useState<Personal[]>(personal);
  function setData(v: Personal[] | ((prev: Personal[]) => Personal[])) {
    const next = typeof v === 'function' ? v(data) : v;
    setDataLocal(next);
    setPersonal(next);
  }
  const [editId, setEditId] = useState<string | null>(null);
  const [editRow, setEditRow] = useState<Partial<Personal>>({});

  function startEdit(row: Personal) { setEditId(row.id); setEditRow({ ...row }); }
  function saveEdit() {
    setData(prev => prev.map(p => p.id === editId ? { ...p, ...editRow } as Personal : p));
    setEditId(null);
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>Personal</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-muted-foreground)' }}>Catálogo de roles y costos — <span className="text-amber-700 font-medium">Datos de ejemplo</span></p>
        </div>
        <button onClick={() => {
          const n: Personal = { id: `PER-${Date.now()}`, rol: 'Nuevo rol', costoPorHora: 0, horasEstandar: 0, cantidadEstandar: 1, zona: 'Todas', modalidad: 'Todas', obligatorio: false, notas: '' };
          setData(prev => [n, ...prev]);
          startEdit(n);
        }} className="px-4 py-2 rounded text-sm font-medium hover:opacity-90 transition-opacity"
          style={{ background: 'var(--color-primary)', color: 'white' }}>
          + Agregar rol
        </button>
      </div>

      <div className="rounded-lg border overflow-x-auto" style={{ borderColor: 'var(--color-border)', background: 'var(--color-card)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              {['Rol', 'Costo/hora', 'Horas std.', 'Cantidad', 'Zona', 'Modalidad', 'Obligatorio', 'Costo std. total', 'Notas', 'Acciones'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: 'var(--color-muted-foreground)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              const editing = editId === row.id;
              const costoStd = row.costoPorHora * row.horasEstandar * row.cantidadEstandar;
              return (
                <tr key={row.id} className="transition-colors"
                  style={{ borderBottom: i < data.length - 1 ? '1px solid var(--color-border)' : 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-muted)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td className="px-5 py-3 font-medium" style={{ color: 'var(--color-foreground)' }}>
                    {editing ? <input className="border rounded px-2 py-1 text-sm w-full" style={{ borderColor: 'var(--color-border)' }} value={editRow.rol ?? ''} onChange={e => setEditRow(p => ({ ...p, rol: e.target.value }))} /> : row.rol}
                  </td>
                  <td className="px-5 py-3 tabular-nums" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-foreground)' }}>
                    {editing ? <input type="number" className="border rounded px-2 py-1 text-sm w-24" style={{ borderColor: 'var(--color-border)' }} value={editRow.costoPorHora ?? 0} onChange={e => setEditRow(p => ({ ...p, costoPorHora: +e.target.value }))} /> : formatMXN(row.costoPorHora)}
                  </td>
                  <td className="px-5 py-3 tabular-nums" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-secondary-foreground)' }}>
                    {editing ? <input type="number" className="border rounded px-2 py-1 text-sm w-16" style={{ borderColor: 'var(--color-border)' }} value={editRow.horasEstandar ?? 0} onChange={e => setEditRow(p => ({ ...p, horasEstandar: +e.target.value }))} /> : row.horasEstandar}
                  </td>
                  <td className="px-5 py-3 tabular-nums" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-secondary-foreground)' }}>
                    {editing ? <input type="number" className="border rounded px-2 py-1 text-sm w-16" style={{ borderColor: 'var(--color-border)' }} value={editRow.cantidadEstandar ?? 1} onChange={e => setEditRow(p => ({ ...p, cantidadEstandar: +e.target.value }))} /> : row.cantidadEstandar}
                  </td>
                  <td className="px-5 py-3 text-xs" style={{ color: 'var(--color-secondary-foreground)' }}>{row.zona}</td>
                  <td className="px-5 py-3 text-xs" style={{ color: 'var(--color-secondary-foreground)' }}>{row.modalidad}</td>
                  <td className="px-5 py-3 text-center" style={{ color: row.obligatorio ? 'var(--color-primary)' : 'var(--color-muted-foreground)' }}>
                    {editing
                      ? <input type="checkbox" checked={!!editRow.obligatorio} onChange={e => setEditRow(p => ({ ...p, obligatorio: e.target.checked }))} />
                      : row.obligatorio ? '●' : '○'}
                  </td>
                  <td className="px-5 py-3 tabular-nums font-medium" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                    {formatMXN(costoStd)}
                  </td>
                  <td className="px-5 py-3 text-xs max-w-[160px] truncate" style={{ color: 'var(--color-muted-foreground)' }}>
                    {editing ? <input className="border rounded px-2 py-1 text-sm w-full" style={{ borderColor: 'var(--color-border)' }} value={editRow.notas ?? ''} onChange={e => setEditRow(p => ({ ...p, notas: e.target.value }))} /> : row.notas || '—'}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      {editing ? (
                        <>
                          <button onClick={saveEdit} className="text-xs px-2 py-1 rounded font-medium" style={{ background: 'var(--color-primary)', color: 'white' }}>Guardar</button>
                          <button onClick={() => setEditId(null)} className="text-xs px-2 py-1 rounded" style={{ background: 'var(--color-secondary)', color: 'var(--color-secondary-foreground)' }}>Cancelar</button>
                        </>
                      ) : (
                        <button onClick={() => startEdit(row)} className="text-xs px-2 py-1 rounded" style={{ color: 'var(--color-primary)' }}>Editar</button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
