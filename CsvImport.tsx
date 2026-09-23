import { useState, useRef } from 'react';
import type { Insumo } from '../data/mockData';

const TODAY = new Date().toISOString().split('T')[0];

const KNOWN_CATS = ['Ataúd', 'Urna', 'Cafetería', 'Flores', 'Papelería', 'Limpieza', 'Mobiliario', 'Equipo de velación', 'Preparación', 'Trámites', 'Proveedor externo', 'Otro'];
const KNOWN_ZONES = ['Todas', 'Zona Metropolitana', 'Altos', 'Chapala', 'Zacoalco'];

export type ImportRow = Insumo & {
  _status: 'ok' | 'incomplete' | 'error';
  _issues: string[];
};

interface Props {
  onImport: (rows: ImportRow[]) => void;
  onClose: () => void;
  extraCategories: string[];
  onAddCategory: (cat: string) => void;
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
  return lines.slice(1).filter(l => l.trim()).map(line => {
    // Handle quoted fields
    const cols: string[] = [];
    let cur = '', inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQ = !inQ; continue; }
      if (ch === ',' && !inQ) { cols.push(cur.trim()); cur = ''; continue; }
      cur += ch;
    }
    cols.push(cur.trim());
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => { obj[h] = cols[idx] ?? ''; });
    return obj;
  });
}

function validateRow(raw: Record<string, string>, idx: number, knownCats: string[]): ImportRow {
  const issues: string[] = [];
  let status: ImportRow['_status'] = 'ok';

  const nombre = raw['nombre']?.trim() ?? '';
  if (!nombre) {
    issues.push('Falta el nombre del insumo');
    status = 'error';
  }

  const priceSinIva = parseFloat(raw['precio_compra_sin_iva'] ?? '') || 0;
  if (priceSinIva === 0) {
    issues.push('Sin precio asignado');
    if (status !== 'error') status = 'incomplete';
  }

  const proveedor = raw['proveedor']?.trim() ?? '';
  if (!proveedor) {
    issues.push('Proveedor pendiente');
    if (status !== 'error') status = 'incomplete';
  }

  const cat = raw['categoria']?.trim() ?? 'Otro';
  if (!knownCats.includes(cat) && cat) {
    issues.push(`Categoría nueva: "${cat}" (se creará)`);
    if (status !== 'error') status = 'incomplete';
  }

  const zona = raw['zona']?.trim() ?? 'Todas';
  if (!KNOWN_ZONES.includes(zona) && zona) {
    issues.push(`Zona desconocida: "${zona}"`);
    if (status !== 'error') status = 'incomplete';
  }

  const iva = parseFloat(raw['iva'] ?? '') || 0;
  const precioConIva = priceSinIva * (1 + iva / 100);
  const rendimiento = parseFloat(raw['rendimiento'] ?? '') || 1;
  const merma = parseFloat(raw['merma_pct'] ?? '') || 0;

  return {
    id: `CSV-${Date.now()}-${idx}`,
    nombre: nombre || `Fila ${idx + 2}`,
    categoria: cat || 'Otro',
    subcategoria: raw['subcategoria']?.trim() ?? '',
    proveedor: proveedor || '',
    unidadCompra: raw['unidad_compra']?.trim() || 'Pieza',
    contenidoPorUnidad: parseFloat(raw['contenido_unidad'] ?? '') || 1,
    precioSinIva: priceSinIva,
    iva,
    precioConIva,
    costoUnitario: priceSinIva / Math.max(parseFloat(raw['contenido_unidad'] ?? '1') || 1, 1),
    rendimientoPorServicio: rendimiento,
    merma,
    zonaAplicable: zona || 'Todas',
    modalidadAplicable: raw['modalidad']?.trim() || 'Todas',
    obligatorio: (raw['obligatorio'] ?? '').toLowerCase() === 'sí' || (raw['obligatorio'] ?? '').toLowerCase() === 'si' || raw['obligatorio'] === '1',
    vigenciaPrecio: raw['vigencia_precio']?.trim() ?? '',
    estatus: 'Activo',
    notas: raw['notas']?.trim() ?? '',
    _status: status,
    _issues: issues,
  };
}

const SAMPLE_CSV = `nombre,categoria,subcategoria,proveedor,unidad_compra,contenido_unidad,precio_compra_sin_iva,iva,rendimiento,merma_pct,zona,modalidad,obligatorio,vigencia_precio,notas
Ataúd Premium Nogal,Ataúd,Madera fina,Muebles Funerarios del Bajío,Pieza,1,12500,16,1,0,Todas,Capilla,si,2026-12-31,Herrajes plateados incluidos
Urna mármol blanco,Urna,Mármol,Arte Funerario GDL,Pieza,1,2800,16,1,0,Zona Metropolitana,Cremación directa,si,2026-12-31,
Pan dulce surtido,Cafetería,Panadería,,Charola,12,0,0,2,5,Todas,Capilla,no,2026-06-30,Proveedor local pendiente
Corona floral grande,Flores,Coronas,Flores del Lago,Pieza,1,950,0,1,10,Chapala,Capilla,no,2026-03-31,`;

export default function CsvImport({ onImport, onClose, extraCategories, onAddCategory }: Props) {
  const [step, setStep] = useState<'upload' | 'preview' | 'done'>('upload');
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [newCats, setNewCats] = useState<string[]>([]);
  const [fileName, setFileName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const allCats = [...KNOWN_CATS, ...extraCategories, ...newCats];

  function handleFile(file: File) {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target?.result as string;
      const raw = parseCSV(text);
      if (!raw.length) return;
      const parsed = raw.map((r, i) => validateRow(r, i, allCats));
      // Collect new categories
      const cats = parsed.map(r => r.categoria).filter(c => !allCats.includes(c));
      const unique = [...new Set(cats)];
      setNewCats(prev => [...new Set([...prev, ...unique])]);
      setRows(parsed);
      setSelectedRows(new Set(parsed.map((r, i) => r._status !== 'error' ? i : -1).filter(i => i >= 0)));
      setStep('preview');
    };
    reader.readAsText(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function loadSample() {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
    handleFile(new File([blob], 'ejemplo.csv'));
  }

  function toggleRow(idx: number) {
    setSelectedRows(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  }

  function confirmImport() {
    const toImport = rows.filter((_, i) => selectedRows.has(i));
    // Create any new categories
    newCats.forEach(c => onAddCategory(c));
    onImport(toImport);
    setStep('done');
  }

  const ok = rows.filter(r => r._status === 'ok').length;
  const incomplete = rows.filter(r => r._status === 'incomplete').length;
  const errors = rows.filter(r => r._status === 'error').length;
  const selected = selectedRows.size;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(44,40,37,0.55)' }}>
      <div className="flex flex-col rounded-xl shadow-2xl overflow-hidden"
        style={{ width: step === 'preview' ? 920 : 560, maxHeight: '90vh', background: 'white', border: '1px solid var(--color-border)' }}>

        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{ borderColor: 'var(--color-border)', background: '#FEFCF7' }}>
          <div>
            <p className="font-semibold text-sm" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-foreground)' }}>
              {step === 'done' ? 'Importación completada' : 'Importar insumos desde CSV'}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted-foreground)' }}>
              {step === 'upload' && 'Carga un archivo .csv con el formato requerido'}
              {step === 'preview' && `${rows.length} registros detectados — revisa y confirma`}
              {step === 'done' && `${selected} insumos importados al catálogo`}
            </p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded flex items-center justify-center text-sm transition-colors hover:bg-gray-100"
            style={{ color: 'var(--color-muted-foreground)' }}>✕</button>
        </div>

        {/* ── STEP: Upload ── */}
        {step === 'upload' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Drop zone */}
            <div
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
              className="rounded-xl border-2 border-dashed cursor-pointer transition-colors flex flex-col items-center justify-center py-12 text-center"
              style={{ borderColor: 'var(--color-border)' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}>
              <div className="w-12 h-12 rounded-full mb-3 flex items-center justify-center text-2xl" style={{ background: 'var(--color-secondary)' }}>
                ↑
              </div>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>Arrastra tu archivo CSV aquí</p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-muted-foreground)' }}>o haz clic para seleccionarlo</p>
              <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleChange} />
            </div>

            {/* Format reference */}
            <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
              <div className="px-4 py-2.5 border-b flex items-center justify-between" style={{ background: 'var(--color-muted)', borderColor: 'var(--color-border)' }}>
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-muted-foreground)' }}>Columnas requeridas</p>
                <button onClick={loadSample} className="text-xs px-3 py-1 rounded font-medium transition-opacity hover:opacity-80"
                  style={{ background: 'var(--color-primary)', color: 'white' }}>
                  Cargar ejemplo de prueba
                </button>
              </div>
              <div className="p-4 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr>
                      {['Columna CSV', 'Descripción', 'Requerido'].map(h => (
                        <th key={h} className="text-left px-2 py-1.5 font-semibold uppercase tracking-wide border-b"
                          style={{ color: 'var(--color-muted-foreground)', borderColor: 'var(--color-border)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['nombre', 'Nombre del insumo', 'Sí — error si falta'],
                      ['categoria', 'Categoría del insumo', 'Opcional — se crea si es nueva'],
                      ['subcategoria', 'Subcategoría', 'Opcional'],
                      ['proveedor', 'Nombre del proveedor', 'Opcional — advertencia si falta'],
                      ['unidad_compra', 'Unidad de compra (Pieza, Caja…)', 'Opcional'],
                      ['contenido_unidad', 'Contenido por unidad (número)', 'Opcional'],
                      ['precio_compra_sin_iva', 'Precio sin IVA en MXN', 'Opcional — advertencia si es 0'],
                      ['iva', 'Porcentaje de IVA (0 o 16)', 'Opcional'],
                      ['rendimiento', 'Rendimiento por servicio', 'Opcional'],
                      ['merma_pct', 'Porcentaje de merma', 'Opcional'],
                      ['zona', 'Zona aplicable', 'Opcional — advertencia si desconocida'],
                      ['modalidad', 'Modalidad aplicable', 'Opcional'],
                      ['obligatorio', 'si / no / 1 / 0', 'Opcional'],
                      ['vigencia_precio', 'Fecha YYYY-MM-DD', 'Opcional'],
                      ['notas', 'Notas adicionales', 'Opcional'],
                    ].map(([col, desc, req]) => (
                      <tr key={col} className="border-b" style={{ borderColor: 'var(--color-border)' }}>
                        <td className="px-2 py-1.5 font-mono" style={{ color: 'var(--color-primary)' }}>{col}</td>
                        <td className="px-2 py-1.5" style={{ color: 'var(--color-secondary-foreground)' }}>{desc}</td>
                        <td className="px-2 py-1.5" style={{ color: req.startsWith('Sí') ? '#991B1B' : req.startsWith('Opcional —') ? '#92400E' : 'var(--color-muted-foreground)' }}>{req}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP: Preview ── */}
        {step === 'preview' && (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Summary pills */}
            <div className="flex gap-3 px-6 py-3 border-b flex-shrink-0" style={{ borderColor: 'var(--color-border)', background: '#FAFAF7' }}>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: '#ECFDF5', color: '#166534' }}>
                <span className="w-2 h-2 rounded-full bg-green-500" /> {ok} listos
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: '#FFFBEB', color: '#92400E' }}>
                <span className="w-2 h-2 rounded-full bg-amber-400" /> {incomplete} incompletos
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: '#FEF2F2', color: '#991B1B' }}>
                <span className="w-2 h-2 rounded-full bg-red-500" /> {errors} con error
              </div>
              <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: 'var(--color-secondary)', color: 'var(--color-primary)' }}>
                {selected} seleccionados para importar
              </div>
            </div>

            {/* New categories notice */}
            {newCats.length > 0 && (
              <div className="mx-6 mt-3 rounded-lg px-4 py-3 text-xs border flex-shrink-0" style={{ background: '#EFF6FF', borderColor: '#BFDBFE', color: '#1E40AF' }}>
                <span className="font-semibold">Categorías nuevas detectadas:</span>{' '}
                {newCats.map(c => <span key={c} className="mx-1 px-1.5 py-0.5 rounded bg-blue-100">{c}</span>)}
                <span className="ml-1">— se crearán automáticamente al importar.</span>
              </div>
            )}

            {/* Table */}
            <div className="flex-1 overflow-auto mx-6 my-3">
              <table className="w-full text-xs border-collapse" style={{ borderColor: 'var(--color-border)' }}>
                <thead className="sticky top-0 z-10">
                  <tr style={{ background: 'var(--color-muted)' }}>
                    <th className="px-3 py-2 border w-8" style={{ borderColor: 'var(--color-border)' }}>
                      <input type="checkbox"
                        checked={selectedRows.size === rows.filter(r => r._status !== 'error').length}
                        onChange={e => {
                          if (e.target.checked) setSelectedRows(new Set(rows.map((r, i) => r._status !== 'error' ? i : -1).filter(i => i >= 0)));
                          else setSelectedRows(new Set());
                        }} />
                    </th>
                    {['Estado', 'Nombre', 'Categoría', 'Proveedor', 'Precio s/IVA', 'Zona', 'Observaciones'].map(h => (
                      <th key={h} className="px-3 py-2 text-left font-semibold uppercase tracking-wide border whitespace-nowrap"
                        style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted-foreground)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => {
                    const isSelected = selectedRows.has(i);
                    const rowBg = row._status === 'error' ? '#FEF2F2' : row._status === 'incomplete' ? '#FFFBEB' : isSelected ? '#FAFAF7' : 'white';
                    return (
                      <tr key={i} style={{ background: rowBg, borderBottom: '1px solid var(--color-border)' }}>
                        <td className="px-3 py-2 border text-center" style={{ borderColor: 'var(--color-border)' }}>
                          <input type="checkbox" disabled={row._status === 'error'}
                            checked={isSelected} onChange={() => toggleRow(i)} />
                        </td>
                        <td className="px-3 py-2 border" style={{ borderColor: 'var(--color-border)' }}>
                          {row._status === 'ok' && <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#ECFDF5', color: '#166534' }}>✓ Listo</span>}
                          {row._status === 'incomplete' && <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#FFFBEB', color: '#92400E' }}>⚠ Incompleto</span>}
                          {row._status === 'error' && <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#FEF2F2', color: '#991B1B' }}>✕ Error</span>}
                        </td>
                        <td className="px-3 py-2 border font-medium" style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}>{row.nombre}</td>
                        <td className="px-3 py-2 border" style={{ borderColor: 'var(--color-border)', color: 'var(--color-secondary-foreground)' }}>
                          {row.categoria}
                          {!KNOWN_CATS.includes(row.categoria) && <span className="ml-1 text-xs" style={{ color: '#1D4ED8' }}>(nueva)</span>}
                        </td>
                        <td className="px-3 py-2 border" style={{ borderColor: 'var(--color-border)', color: row.proveedor ? 'var(--color-secondary-foreground)' : '#DC2626' }}>
                          {row.proveedor || 'Sin proveedor'}
                        </td>
                        <td className="px-3 py-2 border tabular-nums" style={{ borderColor: 'var(--color-border)', fontFamily: 'var(--font-mono)', color: row.precioSinIva === 0 ? '#DC2626' : 'var(--color-foreground)' }}>
                          {row.precioSinIva === 0 ? 'Sin precio' : `$${row.precioSinIva.toLocaleString('es-MX')}`}
                        </td>
                        <td className="px-3 py-2 border" style={{ borderColor: 'var(--color-border)', color: !KNOWN_ZONES.includes(row.zonaAplicable) ? '#D97706' : 'var(--color-secondary-foreground)' }}>
                          {row.zonaAplicable}
                        </td>
                        <td className="px-3 py-2 border text-xs max-w-xs" style={{ borderColor: 'var(--color-border)', color: '#92400E' }}>
                          {row._issues.join(' · ')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t flex-shrink-0" style={{ borderColor: 'var(--color-border)', background: '#FAFAF7' }}>
              <button onClick={() => setStep('upload')} className="px-4 py-2 rounded text-sm" style={{ background: 'var(--color-secondary)', color: 'var(--color-secondary-foreground)' }}>
                ← Volver
              </button>
              <button
                onClick={confirmImport}
                disabled={selected === 0}
                className="px-5 py-2 rounded text-sm font-semibold transition-opacity"
                style={{ background: 'var(--color-primary)', color: 'white', opacity: selected === 0 ? 0.4 : 1 }}>
                Importar {selected} insumo{selected !== 1 ? 's' : ''} →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP: Done ── */}
        {step === 'done' && (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center space-y-5">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl" style={{ background: '#ECFDF5' }}>✓</div>
            <div>
              <p className="text-lg font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-foreground)' }}>
                Importación completada
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--color-muted-foreground)' }}>
                Los insumos han sido agregados al catálogo
              </p>
            </div>
            <div className="grid grid-cols-4 gap-4 w-full max-w-sm">
              {[
                { label: 'Importados', value: selected, color: '#166534', bg: '#ECFDF5' },
                { label: 'Listos', value: ok, color: '#166534', bg: '#ECFDF5' },
                { label: 'Incompletos', value: incomplete, color: '#92400E', bg: '#FFFBEB' },
                { label: 'Con error', value: errors, color: '#991B1B', bg: '#FEF2F2' },
              ].map(c => (
                <div key={c.label} className="rounded-lg p-3 text-center" style={{ background: c.bg }}>
                  <p className="text-xl font-bold tabular-nums" style={{ color: c.color, fontFamily: 'var(--font-mono)' }}>{c.value}</p>
                  <p className="text-xs mt-0.5" style={{ color: c.color }}>{c.label}</p>
                </div>
              ))}
            </div>
            <button onClick={onClose} className="px-6 py-2 rounded text-sm font-semibold" style={{ background: 'var(--color-primary)', color: 'white' }}>
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
