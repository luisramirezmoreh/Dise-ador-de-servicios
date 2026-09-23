import { useState, useRef } from 'react';
import { servicios, calcularCostoServicio, formatMXN } from '../data/mockData';
import StatusBadge from './StatusBadge';
import ServiceDiagram from './ServiceDiagram';

interface TechnicalSheetProps { imageMap: Record<string, string>; }

// ─── Print styles injected once ───────────────────────────────────────────────
const PRINT_STYLES = `
@media print {
  body * { visibility: hidden !important; }
  #ficha-print, #ficha-print * { visibility: visible !important; }
  #ficha-print { position: fixed !important; inset: 0 !important; overflow: visible !important; background: white !important; padding: 0 !important; }
  .no-print { display: none !important; }
}
`;

// ─── Document section wrapper ─────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="break-inside-avoid">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-primary)' }}>{title}</span>
        <div className="flex-1 border-t" style={{ borderColor: 'var(--color-border)' }} />
      </div>
      {children}
    </div>
  );
}

// ─── Formal table ─────────────────────────────────────────────────────────────
function DocTable({ headers, rows, footerRow }: {
  headers: string[];
  rows: (string | number | React.ReactNode)[][];
  footerRow?: (string | number)[];
}) {
  return (
    <table className="w-full text-xs border-collapse" style={{ fontFamily: 'var(--font-sans)' }}>
      <thead>
        <tr>
          {headers.map(h => (
            <th key={h} className="text-left px-3 py-2 font-semibold uppercase tracking-wide"
              style={{ background: '#F0EBE0', color: 'var(--color-muted-foreground)', border: '1px solid #D4C9B4', whiteSpace: 'nowrap' }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} style={{ background: i % 2 === 0 ? 'white' : '#FAFAF7' }}>
            {row.map((cell, j) => (
              <td key={j} className="px-3 py-2"
                style={{
                  border: '1px solid #E0D9CE',
                  color: 'var(--color-foreground)',
                  fontFamily: typeof cell === 'number' ? 'var(--font-mono)' : 'inherit',
                  textAlign: typeof cell === 'number' ? 'right' : 'left',
                }}>
                {typeof cell === 'number' ? formatMXN(cell) : cell}
              </td>
            ))}
          </tr>
        ))}
        {footerRow && (
          <tr style={{ background: '#F0EBE0' }}>
            {footerRow.map((cell, j) => (
              <td key={j} className="px-3 py-2 font-bold"
                style={{
                  border: '1px solid #D4C9B4',
                  color: j === footerRow.length - 1 ? 'var(--color-primary)' : 'var(--color-foreground)',
                  fontFamily: typeof cell === 'number' ? 'var(--font-mono)' : 'inherit',
                  textAlign: typeof cell === 'number' ? 'right' : 'left',
                }}>
                {typeof cell === 'number' ? formatMXN(cell) : cell}
              </td>
            ))}
          </tr>
        )}
      </tbody>
    </table>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function TechnicalSheet({ imageMap }: TechnicalSheetProps) {
  const [selectedId, setSelectedId] = useState(servicios[0].id);
  const printRef = useRef<HTMLDivElement>(null);

  const srv = servicios.find(s => s.id === selectedId) ?? servicios[0];
  const costs = calcularCostoServicio(srv);

  const handlePrint = () => window.print();

  return (
    <>
      <style>{PRINT_STYLES}</style>

      <div className="flex flex-col h-full">
        {/* Toolbar */}
        <div className="flex-shrink-0 flex items-center justify-between px-8 py-4 border-b no-print"
          style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--color-muted-foreground)' }}>Servicio</p>
              <select value={selectedId} onChange={e => setSelectedId(e.target.value)}
                className="border rounded px-3 py-1.5 text-sm" style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)' }}>
                {servicios.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 pt-4">
              <StatusBadge status={srv.estatus} />
              <span className="text-xs" style={{ color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-mono)' }}>v{srv.version} · {srv.fechaModificacion}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ background: 'var(--color-primary)', color: 'white' }}>
              <span>⎙</span> Imprimir / PDF
            </button>
          </div>
        </div>

        {/* Document */}
        <div className="flex-1 overflow-y-auto px-8 py-6" style={{ background: '#F0ECE5' }}>
          <div
            id="ficha-print"
            ref={printRef}
            style={{
              background: 'white',
              maxWidth: 860,
              margin: '0 auto',
              boxShadow: '0 2px 24px rgba(0,0,0,0.10)',
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            {/* ── Document header ── */}
            <div style={{ borderBottom: '3px solid var(--color-primary)', background: 'white' }}>
              {/* Gold top stripe */}
              <div style={{ height: 4, background: 'var(--color-primary)' }} />

              <div className="px-10 pt-8 pb-6 flex items-start justify-between gap-8">
                {/* Left: branding */}
                <div>
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 rounded flex items-center justify-center text-sm font-bold"
                      style={{ background: 'var(--color-primary)', color: 'white' }}>M</div>
                    <div>
                      <p className="font-bold text-sm leading-tight" style={{ color: 'var(--color-foreground)' }}>Moreh</p>
                      <p className="text-xs leading-tight" style={{ color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>Servicios Funerarios</p>
                    </div>
                  </div>
                  <h1 className="text-2xl font-bold leading-snug" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-foreground)' }}>
                    {srv.nombre}
                  </h1>
                  <p className="text-sm mt-1" style={{ color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
                    Ficha Técnica de Diseño de Servicio
                  </p>
                </div>

                {/* Right: meta */}
                <div className="text-right flex-shrink-0">
                  <StatusBadge status={srv.estatus} />
                  <div className="mt-3 space-y-0.5 text-xs" style={{ color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-mono)' }}>
                    <p>ID: <span style={{ color: 'var(--color-foreground)' }}>{srv.id}</span></p>
                    <p>Versión: <span style={{ color: 'var(--color-foreground)' }}>v{srv.version}</span></p>
                    <p>Elaborado: <span style={{ color: 'var(--color-foreground)' }}>{srv.fechaCreacion}</span></p>
                    <p>Modificado: <span style={{ color: 'var(--color-foreground)' }}>{srv.fechaModificacion}</span></p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Metadata grid ── */}
            <div className="px-10 py-5 border-b" style={{ borderColor: 'var(--color-border)', background: '#FAFAF7' }}>
              <div className="grid grid-cols-4 gap-0 border rounded" style={{ borderColor: 'var(--color-border)', overflow: 'hidden' }}>
                {[
                  ['Modalidad', srv.modalidad],
                  ['Zona de servicio', srv.zona],
                  ['Nivel', srv.nivel],
                  ['Versión', `v${srv.version}`],
                ].map(([label, val]) => (
                  <div key={label} className="px-4 py-3 border-r last:border-r-0 bg-white" style={{ borderColor: 'var(--color-border)' }}>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: 'var(--color-muted-foreground)' }}>{label}</p>
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>{val}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-10 py-7 space-y-8">

              {/* Resumen operativo */}
              {srv.observaciones && (
                <Section title="Resumen operativo">
                  <p className="text-sm leading-relaxed px-4 py-3 rounded border-l-2"
                    style={{ background: '#FAFAF7', borderColor: 'var(--color-primary)', color: 'var(--color-secondary-foreground)' }}>
                    {srv.observaciones}
                  </p>
                </Section>
              )}

              {/* Componentes */}
              <Section title="Componentes e insumos">
                <DocTable
                  headers={['Nombre', 'Categoría', 'Cant.', 'Unidad', 'Proveedor', 'Costo unit.', 'Merma', 'Costo total']}
                  rows={srv.componentes.map(c => [
                    c.nombre,
                    c.categoria,
                    c.cantidad,
                    c.unidad,
                    c.proveedor || '—',
                    c.costoUnitario,
                    `${c.merma}%`,
                    c.costoTotal,
                  ])}
                  footerRow={['', '', '', '', 'Subtotal componentes', '', '', costs.ataud + costs.insumos + costs.tramites + costs.proveedoresExternos]}
                />
              </Section>

              {/* Vehículos */}
              <Section title="Vehículos y traslado">
                <DocTable
                  headers={['Vehículo', 'Km est.', 'Casetas', 'Viáticos', 'Hrs chofer', 'Observaciones', 'Costo total']}
                  rows={srv.vehiculos.map(v => [v.nombre, v.kmEstimados, v.casetas, v.viaticos, v.horasChofer, v.observaciones || '—', v.costoTotal])}
                  footerRow={['', '', '', '', '', 'Subtotal vehículos', costs.vehiculos]}
                />
              </Section>

              {/* Personal */}
              <Section title="Personal operativo">
                <DocTable
                  headers={['Rol', 'Cantidad', 'Horas', '$/hora', 'Costo total']}
                  rows={srv.personal.map(p => [p.rol, p.cantidad, p.horas, p.costoPorHora, p.costoTotal])}
                  footerRow={['', '', '', 'Subtotal personal', costs.personal]}
                />
              </Section>

              {/* Cost summary */}
              <Section title="Resumen de costos de otorgamiento">
                <div className="rounded border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
                  {[
                    { label: 'Ataúd / Urna', val: costs.ataud, indent: false },
                    { label: 'Insumos y servicios directos', val: costs.insumos, indent: false },
                    { label: 'Vehículos y traslado', val: costs.vehiculos, indent: false },
                    { label: 'Personal operativo', val: costs.personal, indent: false },
                    { label: 'Trámites', val: costs.tramites, indent: false },
                    { label: 'Proveedores externos', val: costs.proveedoresExternos, indent: false },
                    { label: 'Costos indirectos', val: costs.costosIndirectos, indent: false },
                    { label: 'Merma estimada', val: costs.merma, indent: false },
                  ].map((row, i) => (
                    <div key={row.label} className="flex items-center justify-between px-5 py-2.5 text-sm border-b"
                      style={{ borderColor: 'var(--color-border)', background: i % 2 === 0 ? 'white' : '#FAFAF7' }}>
                      <span style={{ color: 'var(--color-secondary-foreground)' }}>{row.label}</span>
                      <span className="tabular-nums font-medium" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-foreground)' }}>
                        {formatMXN(row.val)}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between px-5 py-3.5 font-bold text-sm"
                    style={{ background: '#F0EBE0', borderBottom: '2px solid var(--color-primary)' }}>
                    <span style={{ color: 'var(--color-foreground)' }}>Costo total de otorgamiento</span>
                    <span className="tabular-nums text-base" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>{formatMXN(costs.total)}</span>
                  </div>
                  <div className="flex items-center justify-between px-5 py-3.5" style={{ background: '#F0FDF4' }}>
                    <span className="text-sm font-semibold" style={{ color: '#166534' }}>
                      Precio de venta sugerido (margen {srv.margenSugerido}%)
                    </span>
                    <span className="tabular-nums font-bold text-base" style={{ color: '#166534', fontFamily: 'var(--font-mono)' }}>{formatMXN(costs.precioSugerido)}</span>
                  </div>
                </div>

                {/* Mini KPIs */}
                <div className="grid grid-cols-4 gap-3 mt-4">
                  {[
                    ['Costo insumos', formatMXN(costs.ataud + costs.insumos)],
                    ['Costo operación', formatMXN(costs.vehiculos + costs.personal)],
                    ['Costos fijos', formatMXN(costs.tramites + costs.costosIndirectos)],
                    ['Margen bruto', `${srv.margenSugerido}%`],
                  ].map(([label, val]) => (
                    <div key={label} className="rounded border px-3 py-2.5 text-center" style={{ background: '#FAFAF7', borderColor: 'var(--color-border)' }}>
                      <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>{label}</p>
                      <p className="font-bold tabular-nums mt-0.5 text-sm" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>{val}</p>
                    </div>
                  ))}
                </div>
              </Section>

              {/* Proveedores externos */}
              {srv.componentes.filter(c => c.categoria === 'Proveedor externo').length > 0 && (
                <Section title="Proveedores externos">
                  <DocTable
                    headers={['Nombre del servicio', 'Proveedor', 'Costo']}
                    rows={srv.componentes.filter(c => c.categoria === 'Proveedor externo').map(c => [c.nombre, c.proveedor || '—', c.costoTotal])}
                    footerRow={['', 'Total externos', costs.proveedoresExternos]}
                  />
                </Section>
              )}

              {/* Notes */}
              {srv.observaciones && (
                <Section title="Observaciones adicionales">
                  <p className="text-sm" style={{ color: 'var(--color-secondary-foreground)' }}>{srv.observaciones}</p>
                </Section>
              )}

              {/* ── Diagram ── */}
              <Section title="Diagrama ilustrado del servicio">
                <p className="text-xs mb-4" style={{ color: 'var(--color-muted-foreground)' }}>
                  Representación visual de los componentes del servicio. Arrastra los stickers para organizar el esquema.
                  <span className="ml-2 px-2 py-0.5 rounded text-xs font-medium no-print" style={{ background: '#FEF9EC', color: '#92400E' }}>Solo visible en pantalla — no se imprime</span>
                </p>
                <div className="no-print">
                  <ServiceDiagram servicio={srv} imageMap={imageMap} />
                </div>
                {/* Static print version */}
                <div className="print-only hidden">
                  <div className="flex flex-wrap gap-4 py-2">
                    {srv.componentes.map(c => (
                      <div key={c.insumoId} className="flex flex-col items-center gap-1 border rounded-lg p-2" style={{ width: 72, borderColor: 'var(--color-border)' }}>
                        <div className="text-2xl">◆</div>
                        <p className="text-center leading-tight" style={{ fontSize: 8, color: 'var(--color-foreground)' }}>{c.nombre.slice(0, 16)}</p>
                      </div>
                    ))}
                    {srv.vehiculos.map(v => (
                      <div key={v.vehiculoId} className="flex flex-col items-center gap-1 border rounded-lg p-2" style={{ width: 72, borderColor: 'var(--color-border)' }}>
                        <div className="text-2xl">🚗</div>
                        <p className="text-center leading-tight" style={{ fontSize: 8, color: 'var(--color-foreground)' }}>{v.nombre.slice(0, 16)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Section>

              {/* Authorization block */}
              <Section title="Control de versiones y autorización">
                <div className="rounded border overflow-hidden mb-5" style={{ borderColor: 'var(--color-border)' }}>
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ background: '#F0EBE0' }}>
                        {['Versión', 'Fecha', 'Descripción del cambio', 'Responsable'].map(h => (
                          <th key={h} className="px-3 py-2 text-left font-semibold uppercase tracking-wide"
                            style={{ color: 'var(--color-muted-foreground)', border: '1px solid #D4C9B4' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...Array(srv.version)].map((_, i) => (
                        <tr key={i} style={{ background: i % 2 === 0 ? 'white' : '#FAFAF7' }}>
                          <td className="px-3 py-2 tabular-nums" style={{ border: '1px solid #E0D9CE', fontFamily: 'var(--font-mono)' }}>v{i + 1}</td>
                          <td className="px-3 py-2" style={{ border: '1px solid #E0D9CE', color: 'var(--color-secondary-foreground)' }}>
                            {i === srv.version - 1 ? srv.fechaModificacion : srv.fechaCreacion}
                          </td>
                          <td className="px-3 py-2" style={{ border: '1px solid #E0D9CE', color: 'var(--color-secondary-foreground)' }}>
                            {i === 0 ? 'Creación inicial del servicio' : i === srv.version - 1 ? 'Actualización de costos y componentes' : 'Revisión y ajuste de precios'}
                          </td>
                          <td className="px-3 py-2" style={{ border: '1px solid #E0D9CE', color: 'var(--color-secondary-foreground)' }}>—</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-3 gap-10 mt-8">
                  {[
                    { role: 'Elaboró', title: 'Diseñador de servicios' },
                    { role: 'Revisó', title: 'Gerente de operaciones' },
                    { role: 'Autorizó', title: 'Director general' },
                  ].map(({ role, title }) => (
                    <div key={role} className="text-center">
                      <div className="border-b mb-2 h-12" style={{ borderColor: 'var(--color-foreground)' }} />
                      <p className="text-xs font-bold" style={{ color: 'var(--color-foreground)' }}>{role}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted-foreground)' }}>{title}</p>
                    </div>
                  ))}
                </div>
              </Section>
            </div>

            {/* ── Document footer ── */}
            <div className="px-10 py-4 border-t flex items-center justify-between text-xs"
              style={{ borderColor: 'var(--color-border)', background: '#FAFAF7', color: 'var(--color-muted-foreground)' }}>
              <span>Moreh Servicios Funerarios — Documento interno confidencial</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{srv.id} · v{srv.version} · {srv.fechaModificacion}</span>
            </div>
            <div style={{ height: 4, background: 'var(--color-primary)' }} />
          </div>
        </div>
      </div>
    </>
  );
}
