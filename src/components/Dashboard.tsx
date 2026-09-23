import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatMXN, calcularCostoServicio } from '../data/mockData';
import { useAppData } from '../store/AppDataContext';
import StatusBadge from './StatusBadge';

const GOLD = '#A87D2A';

export default function Dashboard() {
  const { servicios, insumos } = useAppData();

  const zonaCosts = ['Zona Metropolitana', 'Altos', 'Chapala', 'Zacoalco'].map(zona => {
    const srvs = servicios.filter(s => s.zona === zona);
    if (!srvs.length) return { zona: zona.replace('Zona Metropolitana', 'ZMG'), avg: 0 };
    const avg = srvs.reduce((sum, s) => sum + calcularCostoServicio(s).total, 0) / srvs.length;
    return { zona: zona.replace('Zona Metropolitana', 'ZMG'), avg: Math.round(avg) };
  });

  const totalServicios = servicios.length;
  const costoPromedio = totalServicios > 0 ? servicios.reduce((sum, s) => sum + calcularCostoServicio(s).total, 0) / totalServicios : 0;
  const incompletos = servicios.filter(s => s.estatus === 'Borrador' || s.estatus === 'Incompleto').length;
  const insumosSinPrecio = insumos.filter(i => i.precioSinIva === 0 && i.categoria !== 'Equipo de velación').length;
  const recientes = [...servicios].sort((a, b) => b.fechaModificacion.localeCompare(a.fechaModificacion)).slice(0, 5);

  const byZona = ['Zona Metropolitana', 'Altos', 'Chapala', 'Zacoalco'].map(z => ({
    zona: z.replace('Zona Metropolitana', 'ZMG'),
    count: servicios.filter(s => s.zona === z).length,
  }));
  const byModalidad = ['Capilla', 'Domicilio', 'Cremación directa', 'Traslado'].map(m => ({
    modalidad: m,
    count: servicios.filter(s => s.modalidad === m).length,
  }));

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold mb-1" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-foreground)' }}>
          Panel de control
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
          Resumen general del diseñador técnico de servicios — <span className="font-medium text-amber-700">Datos de ejemplo</span>
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Servicios diseñados', value: totalServicios, sub: 'Total en catálogo' },
          { label: 'Costo promedio', value: formatMXN(costoPromedio), sub: 'Por servicio' },
          { label: 'Incompletos / Borrador', value: incompletos, sub: 'Requieren atención', alert: incompletos > 0 },
          { label: 'Insumos sin precio', value: insumosSinPrecio, sub: 'Pendientes de actualizar', alert: insumosSinPrecio > 0 },
        ].map(card => (
          <div key={card.label} className="rounded-lg p-5 border" style={{ background: 'var(--color-card)', borderColor: card.alert ? '#FCD34D' : 'var(--color-border)' }}>
            <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: 'var(--color-muted-foreground)' }}>{card.label}</p>
            <p className="text-3xl font-semibold tabular-nums" style={{ color: card.alert ? '#92400E' : 'var(--color-foreground)', fontFamily: 'var(--font-mono)' }}>{card.value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-muted-foreground)' }}>{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Cost chart */}
        <div className="lg:col-span-2 rounded-lg border p-6" style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
          <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-foreground)' }}>Costo promedio por zona (MXN)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={zonaCosts} barSize={40} margin={{ left: 10, right: 10, bottom: 0, top: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="zona" tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => [formatMXN(v), 'Costo promedio']} contentStyle={{ borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-card)', fontSize: 12 }} />
              <Bar dataKey="avg" radius={[4, 4, 0, 0]}>
                {zonaCosts.map((_, i) => <Cell key={i} fill={i === 0 ? GOLD : '#D4B483'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Zona / modalidad breakdown */}
        <div className="space-y-4">
          <div className="rounded-lg border p-5" style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
            <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-foreground)' }}>Servicios por zona</h2>
            <ul className="space-y-2">
              {byZona.map(z => (
                <li key={z.zona} className="flex items-center justify-between text-sm">
                  <span style={{ color: 'var(--color-secondary-foreground)' }}>{z.zona}</span>
                  <span className="font-semibold tabular-nums" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>{z.count}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border p-5" style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
            <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-foreground)' }}>Servicios por modalidad</h2>
            <ul className="space-y-2">
              {byModalidad.map(m => (
                <li key={m.modalidad} className="flex items-center justify-between text-sm">
                  <span style={{ color: 'var(--color-secondary-foreground)' }}>{m.modalidad}</span>
                  <span className="font-semibold tabular-nums" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>{m.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Recent services */}
      <div className="rounded-lg border" style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
        <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>Últimos servicios modificados</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              {['Nombre', 'Modalidad', 'Zona', 'Nivel', 'Costo total', 'Estatus', 'Modificado'].map(h => (
                <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-muted-foreground)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recientes.map((s, i) => {
              const costs = calcularCostoServicio(s);
              return (
                <tr key={s.id} className="transition-colors" style={{ borderBottom: i < recientes.length - 1 ? '1px solid var(--color-border)' : 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-muted)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td className="px-6 py-3 font-medium" style={{ color: 'var(--color-foreground)' }}>{s.nombre}</td>
                  <td className="px-6 py-3" style={{ color: 'var(--color-secondary-foreground)' }}>{s.modalidad}</td>
                  <td className="px-6 py-3" style={{ color: 'var(--color-secondary-foreground)' }}>{s.zona}</td>
                  <td className="px-6 py-3" style={{ color: 'var(--color-secondary-foreground)' }}>{s.nivel}</td>
                  <td className="px-6 py-3 tabular-nums font-medium" style={{ color: 'var(--color-primary)' }}>{formatMXN(costs.total)}</td>
                  <td className="px-6 py-3"><StatusBadge status={s.estatus} /></td>
                  <td className="px-6 py-3 tabular-nums text-xs" style={{ color: 'var(--color-muted-foreground)' }}>{s.fechaModificacion}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
