type StatusType = 'Activo' | 'Borrador' | 'En revisión' | 'Obsoleto' | 'Incompleto' | 'Inactivo';

const config: Record<StatusType, { bg: string; color: string; dot: string }> = {
  'Activo':      { bg: '#ECFDF5', color: '#166534', dot: '#22C55E' },
  'Borrador':    { bg: '#FEF9EC', color: '#92400E', dot: '#F59E0B' },
  'En revisión': { bg: '#EFF6FF', color: '#1E40AF', dot: '#3B82F6' },
  'Obsoleto':    { bg: '#F3F4F6', color: '#6B7280', dot: '#9CA3AF' },
  'Incompleto':  { bg: '#FEF2F2', color: '#991B1B', dot: '#EF4444' },
  'Inactivo':    { bg: '#F3F4F6', color: '#6B7280', dot: '#9CA3AF' },
};

export default function StatusBadge({ status }: { status: string }) {
  const s = config[status as StatusType] ?? config['Borrador'];
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: s.bg, color: s.color }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.dot }} />
      {status}
    </span>
  );
}
