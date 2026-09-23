import { useState, useRef } from 'react';
import { type Insumo, formatMXN } from '../data/mockData';
import { useAppData } from '../store/AppDataContext';
import StatusBadge from './StatusBadge';
import CsvImport, { type ImportRow } from './CsvImport';

const BASE_CATEGORIAS = ['Ataúd', 'Urna', 'Cafetería', 'Flores', 'Papelería', 'Limpieza', 'Mobiliario', 'Equipo de velación', 'Preparación', 'Trámites', 'Proveedor externo', 'Otro'];

// Category → 3-letter prefix for auto-generated IDs
const CATEGORY_PREFIX: Record<string, string> = {
  'Ataúd':              'ATD',
  'Urna':               'URN',
  'Cafetería':          'CAF',
  'Bebidas calientes':  'BEB',
  'Flores':             'FLR',
  'Arreglos':           'ARR',
  'Papelería':          'PAP',
  'Recordatorios':      'REC',
  'Limpieza':           'LIM',
  'Higiene':            'HGN',
  'Mobiliario':         'MOB',
  'Sillas':             'SLL',
  'Equipo de velación': 'EQV',
  'Preparación':        'PRE',
  'Trámites':           'TRM',
  'Registro Civil':     'RCV',
  'Proveedor externo':  'PRV',
  'Crematorio':         'CRM',
  'Cerámica':           'CER',
  'Madera fina':        'MDF',
  'Madera sólida':      'MDS',
  'Soporte':            'SPT',
  'Otro':               'OTR',
};

function getPrefixFor(categoria: string): string {
  return CATEGORY_PREFIX[categoria] ?? categoria.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3).padEnd(3, 'X');
}

function generateId(categoria: string, existingIds: string[]): string {
  const prefix = getPrefixFor(categoria);
  const nums = existingIds
    .map(id => { const m = id.match(new RegExp(`^${prefix}-(\\d+)$`)); return m ? parseInt(m[1], 10) : 0; })
    .filter(n => n > 0);
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `${prefix}-${String(next).padStart(3, '0')}`;
}

interface Props {
  imageMap: Record<string, string>;
  onSetImage: (id: string, dataUrl: string) => void;
  onRemoveImage: (id: string) => void;
}

// Tiny image upload button — clicks a hidden file input
function ImageCell({ insumoId, imageMap, onSetImage, onRemoveImage }: {
  insumoId: string;
  imageMap: Record<string, string>;
  onSetImage: (id: string, dataUrl: string) => void;
  onRemoveImage: (id: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const src = imageMap[insumoId];

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string;
      onSetImage(insumoId, dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  return (
    <div className="flex items-center gap-2">
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {src ? (
        <div className="relative group">
          <img
            src={src}
            alt="insumo"
            className="rounded border object-contain"
            style={{ width: 40, height: 40, borderColor: 'var(--color-border)', background: 'var(--color-muted)', cursor: 'pointer' }}
            onClick={() => ref.current?.click()}
            title="Haz clic para cambiar la imagen"
          />
          <button
            onClick={e => { e.stopPropagation(); onRemoveImage(insumoId); }}
            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: '#EF4444', color: 'white', lineHeight: 1 }}
            title="Quitar imagen">
            ×
          </button>
        </div>
      ) : (
        <button
          onClick={() => ref.current?.click()}
          className="w-10 h-10 rounded border-2 border-dashed flex items-center justify-center text-xs transition-colors hover:border-amber-400"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted-foreground)' }}
          title="Subir imagen del producto">
          +
        </button>
      )}
    </div>
  );
}

export default function SupplyCatalog({ imageMap, onSetImage, onRemoveImage }: Props) {
  const { insumos, setInsumos } = useAppData();
  const [data, setDataLocal] = useState<Insumo[]>(insumos);
  function setData(v: Insumo[] | ((prev: Insumo[]) => Insumo[])) {
    const next = typeof v === 'function' ? v(data) : v;
    setDataLocal(next);
    setInsumos(next);
  }
  const [extraCats, setExtraCats] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('Todas');
  const [editId, setEditId] = useState<string | null>(null);
  const [editRow, setEditRow] = useState<Partial<Insumo>>({});
  const [idError, setIdError] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [importBanner, setImportBanner] = useState<{ count: number; incomplete: number } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const CATEGORIAS = ['Todas', ...BASE_CATEGORIAS, ...extraCats];
  const today = new Date().toISOString().split('T')[0];

  const filtered = data.filter(i => {
    const matchSearch = i.nombre.toLowerCase().includes(search.toLowerCase()) || i.proveedor.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'Todas' || i.categoria === catFilter;
    return matchSearch && matchCat;
  });

  // Re-derives precioConIva and costoUnitario whenever pricing inputs change
  function recalcPricing(patch: Partial<Insumo>, base: Partial<Insumo>): Partial<Insumo> {
    const merged = { ...base, ...patch };
    const sinIva = merged.precioSinIva ?? 0;
    const iva = merged.iva ?? 16;
    const rend = Math.max(merged.rendimientoPorServicio ?? 1, 0.0001);
    const precioConIva = sinIva * (1 + iva / 100);
    const costoUnitario = precioConIva / rend;
    return { ...merged, precioConIva, costoUnitario };
  }

  function startEdit(row: Insumo) { setEditId(row.id); setEditRow({ ...row }); setIdError(null); }

  function saveEdit() {
    const oldId = editId!;
    const newId = (editRow.id ?? oldId).trim();

    // Validate uniqueness
    if (newId !== oldId && data.some(i => i.id === newId)) {
      setIdError(`El ID "${newId}" ya existe`);
      return;
    }
    if (!newId) { setIdError('El ID no puede estar vacío'); return; }

    // Migrate image if the ID changed
    if (oldId !== newId && imageMap[oldId]) {
      onSetImage(newId, imageMap[oldId]);
      onRemoveImage(oldId);
    }

    setData(prev => prev.map(i => i.id === oldId ? { ...i, ...editRow, id: newId } as Insumo : i));
    setEditId(null);
    setIdError(null);
  }

  function toggleStatus(id: string) {
    setData(prev => prev.map(i => i.id === id ? { ...i, estatus: i.estatus === 'Activo' ? 'Inactivo' : 'Activo' } : i));
  }

  function duplicar(row: Insumo) {
    const newId = generateId(row.categoria, data.map(i => i.id));
    const nuevo: Insumo = { ...row, id: newId, nombre: `${row.nombre} (copia)`, estatus: 'Inactivo' };
    setData(prev => [...prev, nuevo]);
  }

  function deleteRow(id: string) {
    setData(prev => prev.filter(i => i.id !== id));
    onRemoveImage(id);
    setDeleteConfirm(null);
  }

  function addNew() {
    const categoria = 'Otro';
    const newId = generateId(categoria, data.map(i => i.id));
    const nuevo: Insumo = {
      id: newId, nombre: 'Nuevo insumo', categoria, subcategoria: '', proveedor: '',
      unidadCompra: 'Pieza', contenidoPorUnidad: 1, precioSinIva: 0, iva: 16, precioConIva: 0,
      costoUnitario: 0, rendimientoPorServicio: 1, merma: 0, zonaAplicable: 'Todas',
      modalidadAplicable: 'Todas', obligatorio: false, vigenciaPrecio: '', estatus: 'Inactivo', notas: '',
    };
    setData(prev => [nuevo, ...prev]);
    startEdit(nuevo);
  }

  const hasAlert = (i: Insumo) =>
    (i.precioSinIva === 0 && i.categoria !== 'Equipo de velación') ||
    !i.proveedor ||
    (i.vigenciaPrecio && i.vigenciaPrecio < today);

  function handleImport(rows: ImportRow[]) {
    const newInsumos: Insumo[] = rows.map(r => {
      const { _status, _issues, ...insumo } = r;
      return insumo as Insumo;
    });
    setData(prev => [...newInsumos, ...prev]);
    setImportBanner({ count: newInsumos.length, incomplete: rows.filter(r => r._status === 'incomplete').length });
    setTimeout(() => setImportBanner(null), 8000);
  }

  return (
    <>
      {showImport && (
        <CsvImport
          onImport={handleImport}
          onClose={() => setShowImport(false)}
          extraCategories={extraCats}
          onAddCategory={cat => setExtraCats(prev => prev.includes(cat) ? prev : [...prev, cat])}
        />
      )}

      {/* Delete confirm dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(44,40,37,0.5)' }}>
          <div className="rounded-xl shadow-2xl p-6 w-80 space-y-4" style={{ background: 'white', border: '1px solid var(--color-border)' }}>
            <p className="font-semibold text-sm" style={{ color: 'var(--color-foreground)' }}>¿Eliminar este insumo?</p>
            <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
              Esta acción no se puede deshacer. El insumo será eliminado del catálogo y del diagrama.
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 rounded text-sm" style={{ background: 'var(--color-secondary)', color: 'var(--color-secondary-foreground)' }}>Cancelar</button>
              <button onClick={() => deleteRow(deleteConfirm)} className="px-4 py-2 rounded text-sm font-semibold" style={{ background: '#EF4444', color: 'white' }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      <div className="p-8 space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>Catálogo de insumos</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--color-muted-foreground)' }}>
              {data.length} insumos · {Object.keys(imageMap).length} con imagen — <span className="text-amber-700 font-medium">Datos de ejemplo</span>
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowImport(true)} className="px-4 py-2 rounded text-sm font-medium border transition-colors hover:bg-amber-50"
              style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)', background: 'transparent' }}>
              ↑ Importar CSV
            </button>
            <button onClick={addNew} className="px-4 py-2 rounded text-sm font-medium hover:opacity-90 transition-opacity"
              style={{ background: 'var(--color-primary)', color: 'white' }}>
              + Agregar insumo
            </button>
          </div>
        </div>

        {importBanner && (
          <div className="rounded-lg border px-4 py-3 flex items-center justify-between text-sm"
            style={{ background: '#ECFDF5', borderColor: '#6EE7B7', color: '#166534' }}>
            <span>✓ <strong>{importBanner.count}</strong> insumos importados{importBanner.incomplete > 0 ? ` · ${importBanner.incomplete} incompletos (revisar precio o proveedor)` : ''}.</span>
            <button onClick={() => setImportBanner(null)} className="ml-4 text-green-600 hover:text-green-800">✕</button>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Buscar por nombre o proveedor…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-3 py-2 rounded border text-sm flex-1 min-w-48 outline-none"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-card)' }}
          />
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
            className="px-3 py-2 rounded border text-sm"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-card)' }}>
            {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="rounded-lg border overflow-x-auto" style={{ borderColor: 'var(--color-border)', background: 'var(--color-card)' }}>
          <table className="w-full text-sm min-w-[1200px]">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                {['', 'Img', 'ID', 'Nombre', 'Categoría', 'Proveedor', 'Precio s/IVA', 'IVA%', 'Rend.', 'Merma%', 'Precio c/IVA', 'Costo/uso', 'Vigencia', 'Oblig.', 'Estatus', 'Acciones'].map(h => (
                  <th key={h} className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: 'var(--color-muted-foreground)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => {
                const editing = editId === row.id;
                const alert = hasAlert(row);
                const hasImg = !!imageMap[row.id];
                return (
                  <tr key={row.id}
                    className="transition-colors"
                    style={{
                      borderBottom: i < filtered.length - 1 ? '1px solid var(--color-border)' : 'none',
                      background: alert && !editing ? '#FFFBEB' : 'transparent',
                    }}
                    onMouseEnter={e => !alert && (e.currentTarget.style.background = 'var(--color-muted)')}
                    onMouseLeave={e => !alert && (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Alert indicator */}
                    <td className="px-3 py-2 w-5">
                      {alert && <span title="Requiere atención" className="text-amber-500 text-sm">⚠</span>}
                    </td>

                    {/* Image upload cell */}
                    <td className="px-3 py-2">
                      <ImageCell
                        insumoId={row.id}
                        imageMap={imageMap}
                        onSetImage={onSetImage}
                        onRemoveImage={onRemoveImage}
                      />
                    </td>

                    {/* ID — editable in edit mode */}
                    <td className="px-3 py-2 font-mono text-xs" style={{ color: 'var(--color-muted-foreground)', minWidth: 110 }}>
                      {editing ? (
                        <div>
                          <input
                            className="w-full px-2 py-1 border rounded text-xs font-mono"
                            style={{ borderColor: idError ? '#EF4444' : 'var(--color-border)', background: 'white' }}
                            value={editRow.id ?? ''}
                            onChange={e => { setEditRow(p => ({ ...p, id: e.target.value.toUpperCase() })); setIdError(null); }}
                            placeholder="Ej: ATD-001"
                          />
                          {idError && <p className="text-xs mt-0.5" style={{ color: '#EF4444' }}>{idError}</p>}
                        </div>
                      ) : row.id}
                    </td>

                    <td className="px-3 py-2 font-medium min-w-[180px]" style={{ color: 'var(--color-foreground)' }}>
                      {editing
                        ? <input className="w-full px-2 py-1 border rounded text-sm" style={{ borderColor: 'var(--color-border)' }} value={editRow.nombre ?? ''} onChange={e => setEditRow(p => ({ ...p, nombre: e.target.value }))} />
                        : <span className="flex items-center gap-1.5">{hasImg && <span title="Tiene imagen" className="text-amber-500 text-xs">◆</span>}{row.nombre}</span>}
                    </td>

                    <td className="px-3 py-2">
                      {editing
                        ? <select
                            className="px-2 py-1 border rounded text-sm"
                            style={{ borderColor: 'var(--color-border)' }}
                            value={editRow.categoria ?? ''}
                            onChange={e => {
                              const cat = e.target.value;
                              // Auto-suggest a new ID when category changes, unless user already customized it
                              const currentPrefix = getPrefixFor(editRow.categoria ?? '');
                              const currentId = editRow.id ?? '';
                              const wasAutoId = currentId.startsWith(currentPrefix + '-');
                              const newId = wasAutoId ? generateId(cat, data.map(i => i.id).filter(id => id !== editId)) : currentId;
                              setEditRow(p => ({ ...p, categoria: cat, id: newId }));
                              setIdError(null);
                            }}>
                            {CATEGORIAS.filter(c => c !== 'Todas').map(c => <option key={c}>{c}</option>)}
                          </select>
                        : <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'var(--color-secondary)', color: 'var(--color-secondary-foreground)' }}>{row.categoria}</span>}
                    </td>

                    <td className="px-3 py-2" style={{ color: row.proveedor ? 'var(--color-secondary-foreground)' : '#EF4444' }}>
                      {editing
                        ? <input className="w-full px-2 py-1 border rounded text-sm" style={{ borderColor: 'var(--color-border)' }} value={editRow.proveedor ?? ''} onChange={e => setEditRow(p => ({ ...p, proveedor: e.target.value }))} />
                        : row.proveedor || <span className="text-xs">Sin proveedor</span>}
                    </td>

                    {/* Precio s/IVA */}
                    <td className="px-3 py-2 tabular-nums" style={{ color: row.precioSinIva === 0 ? '#EF4444' : 'var(--color-foreground)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                      {editing
                        ? <input type="number" min="0" step="0.01" className="w-24 px-2 py-1 border rounded text-sm" style={{ borderColor: 'var(--color-border)' }}
                            value={editRow.precioSinIva ?? 0}
                            onChange={e => setEditRow(p => recalcPricing({ precioSinIva: +e.target.value }, p))} />
                        : formatMXN(row.precioSinIva)}
                    </td>

                    {/* IVA% — editable */}
                    <td className="px-3 py-2 tabular-nums text-xs" style={{ fontFamily: 'var(--font-mono)' }}>
                      {editing
                        ? <div className="flex items-center gap-1">
                            <input type="number" min="0" max="100" step="1" className="w-14 px-2 py-1 border rounded text-sm" style={{ borderColor: 'var(--color-border)' }}
                              value={editRow.iva ?? 16}
                              onChange={e => setEditRow(p => recalcPricing({ iva: +e.target.value }, p))} />
                            <span className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>%</span>
                          </div>
                        : <span style={{ color: 'var(--color-muted-foreground)' }}>{row.iva}%</span>}
                    </td>

                    {/* Rendimiento — editable */}
                    <td className="px-3 py-2 tabular-nums text-xs" style={{ fontFamily: 'var(--font-mono)' }}>
                      {editing
                        ? <input type="number" min="0.001" step="1" className="w-20 px-2 py-1 border rounded text-sm" style={{ borderColor: 'var(--color-border)' }}
                            value={editRow.rendimientoPorServicio ?? 1}
                            onChange={e => setEditRow(p => recalcPricing({ rendimientoPorServicio: +e.target.value }, p))} />
                        : <span style={{ color: 'var(--color-muted-foreground)' }}>{row.rendimientoPorServicio}</span>}
                    </td>

                    {/* Merma% — editable */}
                    <td className="px-3 py-2 tabular-nums text-xs" style={{ fontFamily: 'var(--font-mono)' }}>
                      {editing
                        ? <div className="flex items-center gap-1">
                            <input type="number" min="0" max="100" step="0.5" className="w-14 px-2 py-1 border rounded text-sm" style={{ borderColor: 'var(--color-border)' }}
                              value={editRow.merma ?? 0}
                              onChange={e => setEditRow(p => ({ ...p, merma: +e.target.value }))} />
                            <span className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>%</span>
                          </div>
                        : <span style={{ color: 'var(--color-muted-foreground)' }}>{row.merma}%</span>}
                    </td>

                    {/* Precio c/IVA — derived, shown for reference */}
                    <td className="px-3 py-2 tabular-nums text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-secondary-foreground)' }}>
                      {editing
                        ? <span className="px-1" title="Calculado automáticamente">{formatMXN(editRow.precioConIva ?? 0)}</span>
                        : formatMXN(row.precioConIva)}
                    </td>

                    {/* Costo/uso — derived = precioConIva / rendimiento */}
                    <td className="px-3 py-2 tabular-nums text-xs font-semibold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>
                      {editing
                        ? <span className="px-1" title="Calculado automáticamente">{formatMXN(editRow.costoUnitario ?? 0)}</span>
                        : formatMXN(row.costoUnitario)}
                    </td>

                    {/* Vigencia */}
                    <td className="px-3 py-2 text-xs" style={{ color: row.vigenciaPrecio && row.vigenciaPrecio < today ? '#EF4444' : 'var(--color-secondary-foreground)', fontFamily: 'var(--font-mono)' }}>
                      {editing
                        ? <input type="date" className="px-2 py-1 border rounded text-sm" style={{ borderColor: 'var(--color-border)' }}
                            value={editRow.vigenciaPrecio ?? ''}
                            onChange={e => setEditRow(p => ({ ...p, vigenciaPrecio: e.target.value }))} />
                        : row.vigenciaPrecio || '—'}
                    </td>

                    {/* Obligatorio — toggle */}
                    <td className="px-3 py-2 text-xs text-center">
                      {editing
                        ? <button
                            onClick={() => setEditRow(p => ({ ...p, obligatorio: !p.obligatorio }))}
                            className="w-7 h-7 rounded border-2 flex items-center justify-center mx-auto transition-colors"
                            style={{
                              borderColor: editRow.obligatorio ? 'var(--color-primary)' : 'var(--color-border)',
                              background: editRow.obligatorio ? 'var(--color-primary)' : 'white',
                              color: 'white',
                              fontSize: 14,
                            }}
                            title={editRow.obligatorio ? 'Obligatorio — clic para desmarcar' : 'Opcional — clic para marcar obligatorio'}>
                            {editRow.obligatorio ? '✓' : ''}
                          </button>
                        : <span style={{ color: row.obligatorio ? 'var(--color-primary)' : 'var(--color-muted-foreground)' }}>
                            {row.obligatorio ? '●' : '○'}
                          </span>}
                    </td>

                    <td className="px-3 py-2"><StatusBadge status={row.estatus} /></td>

                    {/* Actions */}
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5 flex-nowrap">
                        {editing ? (
                          <>
                            <button onClick={saveEdit} className="text-xs px-2.5 py-1 rounded font-medium" style={{ background: 'var(--color-primary)', color: 'white' }}>Guardar</button>
                            <button onClick={() => setEditId(null)} className="text-xs px-2.5 py-1 rounded" style={{ background: 'var(--color-secondary)', color: 'var(--color-secondary-foreground)' }}>Cancelar</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(row)} className="text-xs px-2.5 py-1 rounded transition-colors hover:bg-amber-50" style={{ color: 'var(--color-primary)' }}>Editar</button>
                            <button onClick={() => duplicar(row)} className="text-xs px-2.5 py-1 rounded" style={{ color: 'var(--color-muted-foreground)' }}>Dupl.</button>
                            <button onClick={() => toggleStatus(row.id)} className="text-xs px-2.5 py-1 rounded" style={{ color: 'var(--color-muted-foreground)' }}>
                              {row.estatus === 'Activo' ? 'Desact.' : 'Activar'}
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(row.id)}
                              className="text-xs px-2.5 py-1 rounded transition-colors hover:bg-red-50"
                              style={{ color: '#EF4444' }}>
                              Eliminar
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
    </>
  );
}
