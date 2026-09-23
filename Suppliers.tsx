import { useState } from 'react';
import { type Proveedor } from '../data/mockData';
import { useAppData } from '../store/AppDataContext';
import StatusBadge from './StatusBadge';

export default function Suppliers() {
  const { proveedores, setProveedores } = useAppData();
  const [data, setDataLocal] = useState<Proveedor[]>(proveedores);
  function setData(v: Proveedor[] | ((prev: Proveedor[]) => Proveedor[])) {
    const next = typeof v === 'function' ? v(data) : v;
    setDataLocal(next);
    setProveedores(next);
  }
  const [search, setSearch] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editRow, setEditRow] = useState<Partial<Proveedor>>({});

  const filtered = data.filter(p =>
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    p.categoria.toLowerCase().includes(search.toLowerCase())
  );

  function startEdit(row: Proveedor) { setEditId(row.id); setEditRow({ ...row }); }
  function saveEdit() {
    setData(prev => prev.map(p => p.id === editId ? { ...p, ...editRow } as Proveedor : p));
    setEditId(null);
  }

  function addNew() {
    const n: Proveedor = { id: `PROV-${Date.now()}`, nombre: 'Nuevo proveedor', categoria: '', contacto: '', telefono: '', zona: 'Todas', productos: '', condiciones: '', tiempoEntrega: '', estatus: 'Inactivo', notas: '' };
    setData(prev => [n, ...prev]);
    startEdit(n);
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>Proveedores</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-muted-foreground)' }}>{data.length} proveedores registrados — <span className="text-amber-700 font-medium">Datos de ejemplo</span></p>
        </div>
        <button onClick={addNew} className="px-4 py-2 rounded text-sm font-medium hover:opacity-90 transition-opacity"
          style={{ background: 'var(--color-primary)', color: 'white' }}>
          + Agregar proveedor
        </button>
      </div>

      <input
        type="text"
        placeholder="Buscar proveedor…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="px-3 py-2 rounded border text-sm w-full max-w-sm outline-none focus:ring-1"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-card)' }}
      />

      <div className="rounded-lg border overflow-x-auto" style={{ borderColor: 'var(--color-border)', background: 'var(--color-card)' }}>
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              {['Nombre', 'Categoría', 'Contacto', 'Teléfono', 'Zona', 'Productos / Servicios', 'Condiciones', 'Entrega', 'Estatus', 'Acciones'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: 'var(--color-muted-foreground)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => {
              const editing = editId === row.id;
              const cell = (field: keyof Proveedor, className?: string) => editing
                ? <input className={`border rounded px-2 py-1 text-sm w-full ${className ?? ''}`} style={{ borderColor: 'var(--color-border)' }} value={String(editRow[field] ?? '')} onChange={e => setEditRow(p => ({ ...p, [field]: e.target.value }))} />
                : <span>{String(row[field])}</span>;
              return (
                <tr key={row.id} className="transition-colors"
                  style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--color-border)' : 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-muted)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td className="px-5 py-3 font-medium min-w-[180px]" style={{ color: 'var(--color-foreground)' }}>{cell('nombre')}</td>
                  <td className="px-5 py-3">
                    {editing
                      ? <input className="border rounded px-2 py-1 text-sm w-32" style={{ borderColor: 'var(--color-border)' }} value={editRow.categoria ?? ''} onChange={e => setEditRow(p => ({ ...p, categoria: e.target.value }))} />
                      : <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'var(--color-secondary)', color: 'var(--color-secondary-foreground)' }}>{row.categoria}</span>}
                  </td>
                  <td className="px-5 py-3 text-xs" style={{ color: 'var(--color-secondary-foreground)' }}>{cell('contacto')}</td>
                  <td className="px-5 py-3 text-xs tabular-nums" style={{ color: 'var(--color-secondary-foreground)', fontFamily: 'var(--font-mono)' }}>{cell('telefono')}</td>
                  <td className="px-5 py-3 text-xs" style={{ color: 'var(--color-secondary-foreground)' }}>{cell('zona')}</td>
                  <td className="px-5 py-3 text-xs max-w-[200px]" style={{ color: 'var(--color-secondary-foreground)' }}>
                    {editing ? <input className="border rounded px-2 py-1 text-sm w-full" style={{ borderColor: 'var(--color-border)' }} value={editRow.productos ?? ''} onChange={e => setEditRow(p => ({ ...p, productos: e.target.value }))} /> : <span className="line-clamp-2">{row.productos}</span>}
                  </td>
                  <td className="px-5 py-3 text-xs" style={{ color: 'var(--color-secondary-foreground)' }}>{cell('condiciones')}</td>
                  <td className="px-5 py-3 text-xs" style={{ color: 'var(--color-secondary-foreground)' }}>{cell('tiempoEntrega')}</td>
                  <td className="px-5 py-3"><StatusBadge status={row.estatus} /></td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      {editing ? (
                        <>
                          <button onClick={saveEdit} className="text-xs px-2 py-1 rounded font-medium" style={{ background: 'var(--color-primary)', color: 'white' }}>Guardar</button>
                          <button onClick={() => setEditId(null)} className="text-xs px-2 py-1 rounded" style={{ background: 'var(--color-secondary)', color: 'var(--color-secondary-foreground)' }}>Cancelar</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(row)} className="text-xs px-2 py-1 rounded" style={{ color: 'var(--color-primary)' }}>Editar</button>
                          <button onClick={() => setData(prev => prev.map(x => x.id === row.id ? { ...x, estatus: x.estatus === 'Activo' ? 'Inactivo' : 'Activo' } : x))}
                            className="text-xs px-2 py-1 rounded" style={{ color: 'var(--color-muted-foreground)' }}>
                            {row.estatus === 'Activo' ? 'Desact.' : 'Activar'}
                          </button>
                        </>
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
