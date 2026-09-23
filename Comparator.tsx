import { useState } from 'react';
import { zonasConfig, calcularCostoServicio, formatMXN, type Zona } from '../data/mockData';
import { useAppData } from '../store/AppDataContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const ZONAS: Zona[] = ['Zona Metropolitana', 'Altos', 'Chapala', 'Zacoalco'];
const KEYS = ['insumos', 'ataud', 'vehiculos', 'personal', 'tramites', 'proveedoresExternos', 'costosIndirectos', 'merma', 'total'] as const;
const LABELS: Record<string, string> = {
  insumos: 'Insumos y servicios',
  ataud: 'Ataúd / Urna',
  vehiculos: 'Vehículos',
  personal: 'Personal',
  tramites: 'Trámites',
  proveedoresExternos: 'Prov. externos',
  costosIndirectos: 'Costos de zona',
  merma: 'Merma',
  total: 'Costo total',
};

const COLORS: Record<Zona, string> = {
  'Zona Metropolitana': '#A87D2A',
  'Altos': '#C4A35A',
  'Chapala': '#7C9E85',
  'Zacoalco': '#8B7D6B',
};

export default function Comparator() {
  const { servicios } = useAppData();
  const [baseServicioId, setBaseServicioId] = useState(servicios[0]?.id ?? '');
  const baseSrv = servicios.find(s => s.id === baseServicioId) ?? servicios[0];

  // Build comparison: apply zone factors to base service costs
  const comparisons = ZONAS.map(zona => {
    const zonaConf = zonasConfig.find(z => z.nombre === zona)!;
    const sameSrv = servicios.find(s => s.modalidad === baseSrv.modalidad && s.zona === zona) ?? baseSrv;
    const costs = calcularCostoServicio({ ...sameSrv, zona });
    const factor = zonaConf.factorZona;
    const adjusted = {
      ataud: costs.ataud,
      insumos: costs.insumos,
      vehiculos: costs.vehiculos,
      personal: Math.round(costs.personal * factor),
      tramites: costs.tramites,
      proveedoresExternos: costs.proveedoresExternos,
      costosIndirectos: Math.round(zonaConf.costoBaseOperativo * factor),
      merma: costs.merma,
    };
    const total = Object.values(adjusted).reduce((a, b) => a + b, 0);
    return { zona, factor, ...adjusted, total, precioSugerido: total * 1.35 };
  });

  const zmgTotal = comparisons[0].total;

  const chartData = KEYS.slice(0, -1).map(key => {
    const obj: Record<string, string | number> = { name: LABELS[key] };
    ZONAS.forEach(z => {
      const comp = comparisons.find(c => c.zona === z)!;
      obj[z] = (comp as any)[key];
    });
    return obj;
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>Comparador de zonas</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-muted-foreground)' }}>Costo del mismo servicio por zona — <span className="text-amber-700 font-medium">Datos de ejemplo</span></p>
        </div>
        <select value={baseServicioId} onChange={e => setBaseServicioId(e.target.value)}
          className="px-3 py-2 rounded border text-sm" style={{ borderColor: 'var(--color-border)', background: 'var(--color-card)' }}>
          {servicios.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
        </select>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        {comparisons.map(comp => {
          const diff = comp.total - zmgTotal;
          const isBase = comp.zona === 'Zona Metropolitana';
          const isMax = comp.total === Math.max(...comparisons.map(c => c.total));
          return (
            <div key={comp.zona} className="rounded-lg border p-4" style={{ background: isMax ? '#FFFBEB' : 'var(--color-card)', borderColor: isMax ? '#FCD34D' : 'var(--color-border)' }}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-muted-foreground)' }}>
                {comp.zona.replace('Zona Metropolitana', 'ZMG')}
                {isMax && <span className="ml-1 text-amber-600">▲ Mayor costo</span>}
              </p>
              <p className="text-2xl font-bold tabular-nums" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>
                {formatMXN(comp.total)}
              </p>
              <p className="text-xs mt-1" style={{ color: isBase ? 'var(--color-muted-foreground)' : diff > 0 ? '#DC2626' : '#16A34A', fontFamily: 'var(--font-mono)' }}>
                {isBase ? 'Base de referencia' : diff > 0 ? `+${formatMXN(diff)}` : formatMXN(diff)}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted-foreground)' }}>Factor ×{comp.factor}</p>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div className="rounded-lg border p-6" style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
        <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-foreground)' }}>Desglose por componente y zona</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ left: 10, right: 10, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} angle={-30} textAnchor="end" axisLine={false} tickLine={false} interval={0} />
            <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v: number) => formatMXN(v)} contentStyle={{ borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-card)', fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            {ZONAS.map(z => (
              <Bar key={z} dataKey={z} name={z.replace('Zona Metropolitana', 'ZMG')} stackId="a" fill={COLORS[z]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Comparison table */}
      <div className="rounded-lg border overflow-x-auto" style={{ borderColor: 'var(--color-border)', background: 'var(--color-card)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-muted-foreground)' }}>Componente</th>
              {comparisons.map(c => (
                <th key={c.zona} className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-muted-foreground)' }}>
                  {c.zona.replace('Zona Metropolitana', 'ZMG')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {KEYS.map((key, i) => {
              const isTotal = key === 'total';
              const vals = comparisons.map(c => (c as any)[key] as number);
              const max = Math.max(...vals);
              return (
                <tr key={key} className="transition-colors"
                  style={{
                    borderBottom: '1px solid var(--color-border)',
                    background: isTotal ? 'var(--color-secondary)' : 'transparent',
                    fontWeight: isTotal ? '700' : '400',
                  }}
                  onMouseEnter={e => !isTotal && (e.currentTarget.style.background = 'var(--color-muted)')}
                  onMouseLeave={e => !isTotal && (e.currentTarget.style.background = 'transparent')}>
                  <td className="px-5 py-3" style={{ color: 'var(--color-foreground)' }}>{LABELS[key]}</td>
                  {comparisons.map((comp, ci) => {
                    const val = (comp as any)[key] as number;
                    const isHighest = val === max && !isTotal;
                    return (
                      <td key={comp.zona} className="px-5 py-3 text-right tabular-nums"
                        style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: isHighest ? '#DC2626' : isTotal ? 'var(--color-primary)' : 'var(--color-foreground)' }}>
                        {formatMXN(val)}
                        {isHighest && <span className="ml-1 text-xs">▲</span>}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            <tr style={{ borderBottom: '1px solid var(--color-border)', background: '#F0FDF4' }}>
              <td className="px-5 py-3 text-sm font-semibold" style={{ color: '#166534' }}>Precio sugerido (+35%)</td>
              {comparisons.map(comp => (
                <td key={comp.zona} className="px-5 py-3 text-right tabular-nums font-semibold"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#166534' }}>
                  {formatMXN(comp.precioSugerido)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-5 py-3 text-sm font-medium" style={{ color: 'var(--color-secondary-foreground)' }}>Diferencia vs ZMG</td>
              {comparisons.map((comp, i) => {
                const diff = comp.total - zmgTotal;
                return (
                  <td key={comp.zona} className="px-5 py-3 text-right tabular-nums text-sm font-medium"
                    style={{ fontFamily: 'var(--font-mono)', color: i === 0 ? 'var(--color-muted-foreground)' : diff > 0 ? '#DC2626' : '#16A34A' }}>
                    {i === 0 ? '—' : diff > 0 ? `+${formatMXN(diff)}` : formatMXN(diff)}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
