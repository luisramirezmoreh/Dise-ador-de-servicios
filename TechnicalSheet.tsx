import { useState } from 'react';
import { calcularCostoServicio, formatMXN, type Servicio } from '../data/mockData';
import { useAppData } from '../store/AppDataContext';
import StatusBadge from './StatusBadge';
import ServiceDiagram from './ServiceDiagram';
import logoImg from '../assets/logo.png';

interface TechnicalSheetProps { imageMap: Record<string, string>; }

// ─── Print styles ─────────────────────────────────────────────────────────────
// visibility:hidden + position:absolute allows multi-page flow (never use fixed).
// Tables allow row-level breaks: break-inside:auto so rows split naturally.
const PRINT_STYLES = `
@media print {
  body * { visibility: hidden !important; }
  #ficha-print-wrap,
  #ficha-print-wrap * { visibility: visible !important; }
  #ficha-print-wrap {
    display: block !important;
    position: absolute !important;
    top: 0 !important; left: 0 !important;
    width: 100% !important;
    padding: 0 !important; margin: 0 !important;
  }
  #ficha-print {
    box-shadow: none !important;
    border-radius: 0 !important;
    max-width: none !important;
    width: 100% !important;
    padding: 0 6mm !important;
  }
  /* Allow sections and tables to break across pages at row boundaries */
  .doc-section { break-inside: auto !important; }
  .doc-section-header { break-after: avoid; }
  table { break-inside: auto !important; }
  tr { break-inside: avoid; }
  /* Compact table typography so 8 columns fit A4 portrait */
  #ficha-print table { font-size: 8pt !important; width: 100% !important; table-layout: fixed !important; }
  #ficha-print th, #ficha-print td { padding: 2mm 2.5mm !important; white-space: normal !important; word-break: break-word !important; }
  #ficha-print th { font-size: 7pt !important; }
  /* Signatures block should never split */
  .no-break { break-inside: avoid; }
  .no-print { display: none !important; visibility: hidden !important; }
  /* Hide interactive diagram controls in print */
  .diagram-toolbar { display: none !important; }
  @page { margin: 10mm 12mm; size: A4 portrait; }
}
`;

// ─── Section ─────────────────────────────────────────────────────────────────
function Section({ title, children, noBreak = false }: {
  title: string; children: React.ReactNode; noBreak?: boolean;
}) {
  return (
    <div className={`doc-section${noBreak ? ' no-break' : ''}`}>
      <div className="doc-section-header flex items-center gap-3 mb-3">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-primary)' }}>{title}</span>
        <div className="flex-1 border-t" style={{ borderColor: 'var(--color-border)' }} />
      </div>
      {children}
    </div>
  );
}

// ─── DocTable — columns can be currency, plain number, or string ──────────────
type CellValue = string | number | React.ReactNode;

function DocTable({ headers, rows, footerRow, currencyCols = [] }: {
  headers: string[];
  rows: CellValue[][];
  footerRow?: CellValue[];
  currencyCols?: number[];  // column indices that use currency format
}) {
  function fmt(cell: CellValue, colIdx: number): React.ReactNode {
    if (typeof cell === 'number') {
      return currencyCols.includes(colIdx)
        ? formatMXN(cell)
        : cell.toString();
    }
    return cell;
  }

  return (
    <table className="w-full text-xs border-collapse">
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th key={i} className="text-left px-3 py-2 font-semibold uppercase tracking-wide"
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
                  textAlign: (typeof cell === 'number' && currencyCols.includes(j)) ? 'right' : 'left',
                }}>
                {fmt(cell, j)}
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
                  textAlign: (typeof cell === 'number' && currencyCols.includes(j)) ? 'right' : 'left',
                }}>
                {fmt(cell, j)}
              </td>
            ))}
          </tr>
        )}
      </tbody>
    </table>
  );
}

// ─── Zone-organized service card gallery ──────────────────────────────────────
const ZONAS = ['Zona Metropolitana', 'Altos', 'Chapala', 'Zacoalco'] as const;

function ServiceGallery({ servicios, onSelect }: { servicios: Servicio[]; onSelect: (id: string) => void }) {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold mb-1" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-foreground)' }}>
          Fichas Técnicas
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
          Selecciona un servicio para ver su ficha técnica e imprimirla.
        </p>
      </div>

      {ZONAS.map(zona => {
        const srvs = servicios.filter(s => s.zona === zona);
        if (!srvs.length) return null;
        return (
          <div key={zona}>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--color-primary)' }}>{zona}</h2>
              <div className="flex-1 border-t" style={{ borderColor: 'var(--color-border)' }} />
              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: 'var(--color-secondary)', color: 'var(--color-primary)' }}>
                {srvs.length} servicio{srvs.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {srvs.map(s => {
                const costs = calcularCostoServicio(s);
                return (
                  <button
                    key={s.id}
                    onClick={() => onSelect(s.id)}
                    className="text-left rounded-xl border p-5 transition-all hover:border-[var(--color-primary)] group"
                    style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <p className="font-semibold text-sm leading-snug group-hover:text-[var(--color-primary)] transition-colors"
                        style={{ color: 'var(--color-foreground)' }}>
                        {s.nombre}
                      </p>
                      <StatusBadge status={s.estatus} />
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {[s.modalidad, s.nivel].map(tag => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: 'var(--color-secondary)', color: 'var(--color-secondary-foreground)' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between border-t pt-3" style={{ borderColor: 'var(--color-border)' }}>
                      <div>
                        <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>Costo total</p>
                        <p className="font-bold tabular-nums text-sm" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>
                          {formatMXN(costs.total)}
                        </p>
                      </div>
                      <span className="text-xs font-semibold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: 'var(--color-primary)', color: 'white' }}>
                        Ver ficha →
                      </span>
                    </div>
                    <p className="text-xs mt-2" style={{ color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-mono)' }}>
                      {s.id} · v{s.version} · {s.fechaModificacion}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {servicios.length === 0 && (
        <div className="text-center py-20">
          <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
            No hay servicios disponibles. Crea uno en el Diseñador de servicios.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Full technical sheet document ───────────────────────────────────────────
function SheetDocument({ srv, imageMap }: { srv: Servicio; imageMap: Record<string, string> }) {
  const costs = calcularCostoServicio(srv);

  return (
    <div
      id="ficha-print"
      style={{
        background: 'white',
        maxWidth: 860,
        margin: '0 auto',
        boxShadow: '0 2px 24px rgba(0,0,0,0.10)',
        borderRadius: 4,
        overflow: 'hidden',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* ── Document header ── */}
      <div style={{ borderBottom: '3px solid var(--color-primary)', background: 'white' }}>
        <div style={{ height: 5, background: 'var(--color-primary)' }} />

        <div className="px-10 pt-7 pb-6 flex items-start justify-between gap-8">
          {/* Logo */}
          <div>
            <img
              src={logoImg}
              alt="Capillas Moreh"
              draggable={false}
              style={{ width: 180, height: 'auto', objectFit: 'contain', marginBottom: 14 }}
            />
            <h1 className="text-2xl font-bold leading-snug" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-foreground)' }}>
              {srv.nombre}
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
              Ficha Técnica de Diseño de Servicio
            </p>
          </div>

          {/* Meta */}
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
          {([['Modalidad', srv.modalidad], ['Zona de servicio', srv.zona], ['Nivel', srv.nivel], ['Versión', `v${srv.version}`]] as [string, string][]).map(([label, val]) => (
            <div key={label} className="px-4 py-3 border-r last:border-r-0 bg-white" style={{ borderColor: 'var(--color-border)' }}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: 'var(--color-muted-foreground)' }}>{label}</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>{val}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-10 py-7 space-y-8">

        {/* Observaciones */}
        {srv.observaciones && (
          <Section title="Resumen operativo">
            <p className="text-sm leading-relaxed px-4 py-3 rounded border-l-2"
              style={{ background: '#FAFAF7', borderColor: 'var(--color-primary)', color: 'var(--color-secondary-foreground)' }}>
              {srv.observaciones}
            </p>
          </Section>
        )}

        {/* Componentes — Cant. y Unidad son números planos, no currency */}
        <Section title="Componentes e insumos">
          <DocTable
            headers={['Nombre', 'Categoría', 'Cant.', 'Unidad', 'Proveedor', 'Costo unit.', 'Merma', 'Costo total']}
            currencyCols={[5, 7]}
            rows={srv.componentes.map(c => [
              c.nombre,
              c.categoria,
              c.cantidad,     // plain number — col 2, NOT in currencyCols
              c.unidad,
              c.proveedor || '—',
              c.costoUnitario,  // col 5 → currency
              `${c.merma}%`,
              c.costoTotal,     // col 7 → currency
            ])}
            footerRow={['', '', '', '', 'Subtotal componentes', '', '', costs.ataud + costs.insumos + costs.tramites + costs.proveedoresExternos]}
          />
        </Section>

        {/* Vehículos — Km, casetas, viáticos son currency; horasChofer es número plano */}
        {srv.vehiculos.length > 0 && (
          <Section title="Vehículos y traslado">
            <DocTable
              headers={['Vehículo', 'Km est.', 'Casetas', 'Viáticos', 'Hrs chofer', 'Observaciones', 'Costo total']}
              currencyCols={[2, 3, 6]}
              rows={srv.vehiculos.map(v => [
                v.nombre,
                v.kmEstimados,   // col 1 — plain number
                v.casetas,       // col 2 — currency
                v.viaticos,      // col 3 — currency
                v.horasChofer,   // col 4 — plain number
                v.observaciones || '—',
                v.costoTotal,    // col 6 — currency
              ])}
              footerRow={['', '', '', '', '', 'Subtotal vehículos', costs.vehiculos]}
            />
          </Section>
        )}

        {/* Personal — Cantidad y Horas son números planos */}
        {srv.personal.length > 0 && (
          <Section title="Personal operativo">
            <DocTable
              headers={['Rol', 'Cantidad', 'Horas', '$/hora', 'Costo total']}
              currencyCols={[3, 4]}
              rows={srv.personal.map(p => [
                p.rol,
                p.cantidad,      // col 1 — plain number
                p.horas,         // col 2 — plain number
                p.costoPorHora,  // col 3 — currency
                p.costoTotal,    // col 4 — currency
              ])}
              footerRow={['', '', '', 'Subtotal personal', costs.personal]}
            />
          </Section>
        )}

        {/* Resumen de costos */}
        <Section title="Resumen de costos de otorgamiento">
          <div className="rounded border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
            {[
              ['Ataúd / Urna', costs.ataud],
              ['Insumos y servicios directos', costs.insumos],
              ['Vehículos y traslado', costs.vehiculos],
              ['Personal operativo', costs.personal],
              ['Trámites', costs.tramites],
              ['Proveedores externos', costs.proveedoresExternos],
              ['Costos indirectos', costs.costosIndirectos],
              ['Merma estimada', costs.merma],
            ].map(([label, val], i) => (
              <div key={label as string} className="flex items-center justify-between px-5 py-2.5 text-sm border-b"
                style={{ borderColor: 'var(--color-border)', background: i % 2 === 0 ? 'white' : '#FAFAF7' }}>
                <span style={{ color: 'var(--color-secondary-foreground)' }}>{label as string}</span>
                <span className="tabular-nums font-medium" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-foreground)' }}>
                  {formatMXN(val as number)}
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
              <span className="tabular-nums font-bold text-base" style={{ color: '#166534', fontFamily: 'var(--font-mono)' }}>
                {formatMXN(costs.precioSugerido)}
              </span>
            </div>
          </div>

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
              currencyCols={[2]}
              rows={srv.componentes.filter(c => c.categoria === 'Proveedor externo').map(c => [c.nombre, c.proveedor || '—', c.costoTotal])}
              footerRow={['', 'Total externos', costs.proveedoresExternos]}
            />
          </Section>
        )}

        {/* Diagrama ilustrado — visible en pantalla Y en impresión */}
        <Section title="Diagrama ilustrado del servicio">
          <p className="text-xs mb-4" style={{ color: 'var(--color-muted-foreground)' }}>
            Representación visual de los componentes del servicio.
          </p>
          <ServiceDiagram servicio={srv} imageMap={imageMap} />
        </Section>

        {/* Control de versiones */}
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

          <div className="no-break grid grid-cols-3 gap-10 mt-10">
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

      {/* Document footer */}
      <div className="px-10 py-4 border-t flex items-center justify-between text-xs"
        style={{ borderColor: 'var(--color-border)', background: '#FAFAF7', color: 'var(--color-muted-foreground)' }}>
        <span>Capillas Moreh — Documento interno confidencial</span>
        <span style={{ fontFamily: 'var(--font-mono)' }}>{srv.id} · v{srv.version} · {srv.fechaModificacion}</span>
      </div>
      <div style={{ height: 5, background: 'var(--color-primary)' }} />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function TechnicalSheet({ imageMap }: TechnicalSheetProps) {
  const { servicios } = useAppData();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const srv = selectedId ? servicios.find(s => s.id === selectedId) ?? null : null;

  function handlePrint() { window.print(); }

  return (
    <>
      <style>{PRINT_STYLES}</style>

      {/* Print wrapper — hidden on screen, visible when printing */}
      {srv && (
        <div id="ficha-print-wrap" style={{ display: 'none' }}>
          <SheetDocument srv={srv} imageMap={imageMap} />
        </div>
      )}

      <div className="flex flex-col h-full">
        {srv ? (
          <>
            {/* Detail toolbar */}
            <div className="flex-shrink-0 flex items-center justify-between px-8 py-4 border-b no-print"
              style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedId(null)}
                  className="flex items-center gap-2 text-sm transition-colors hover:opacity-80"
                  style={{ color: 'var(--color-primary)' }}>
                  ← Volver a fichas
                </button>
                <span style={{ color: 'var(--color-border)' }}>|</span>
                <div className="flex items-center gap-2">
                  <StatusBadge status={srv.estatus} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>{srv.nombre}</span>
                  <span className="text-xs" style={{ color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-mono)' }}>
                    v{srv.version} · {srv.fechaModificacion}
                  </span>
                </div>
              </div>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ background: 'var(--color-primary)', color: 'white' }}>
                ⎙ Imprimir / PDF
              </button>
            </div>

            {/* Document preview */}
            <div className="flex-1 overflow-y-auto px-8 py-6 no-print" style={{ background: '#F0ECE5' }}>
              <SheetDocument srv={srv} imageMap={imageMap} />
            </div>
          </>
        ) : (
          /* Gallery view */
          <div className="flex-1 overflow-y-auto">
            <ServiceGallery servicios={servicios} onSelect={setSelectedId} />
          </div>
        )}
      </div>
    </>
  );
}
