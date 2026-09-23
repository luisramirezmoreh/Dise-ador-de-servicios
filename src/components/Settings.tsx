export default function Settings() {
  return (
    <div className="p-8 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>Configuración</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-muted-foreground)' }}>Parámetros del sistema — <span className="text-amber-700 font-medium">Datos de ejemplo</span></p>
      </div>

      {[
        {
          title: 'Empresa',
          fields: [
            { label: 'Razón social', value: 'Moreh Servicios Funerarios S.A. de C.V.' },
            { label: 'RFC', value: 'MSF200101ABC' },
            { label: 'Dirección', value: 'Av. Patria 1234, Zapopan, Jalisco' },
            { label: 'Teléfono', value: '33-1234-5678' },
          ],
        },
        {
          title: 'Parámetros de cálculo',
          fields: [
            { label: 'Margen sugerido por defecto (%)', value: '35' },
            { label: 'IVA por defecto (%)', value: '16' },
            { label: 'Moneda', value: 'MXN — Peso Mexicano' },
            { label: 'Formato de precio', value: '$#,###.##' },
          ],
        },
        {
          title: 'Alertas',
          fields: [
            { label: 'Días antes del vencimiento de precio para alertar', value: '30' },
            { label: 'Correo de notificaciones', value: 'administracion@moreh.mx' },
          ],
        },
        {
          title: 'Versión del sistema',
          fields: [
            { label: 'Versión', value: '1.0.0-MVP' },
            { label: 'Modo', value: 'Datos locales simulados' },
            { label: 'Última actualización', value: '2026-09-23' },
          ],
        },
      ].map(section => (
        <div key={section.title} className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
          <div className="px-6 py-3 border-b" style={{ background: 'var(--color-muted)', borderColor: 'var(--color-border)' }}>
            <h2 className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-muted-foreground)' }}>{section.title}</h2>
          </div>
          <div className="divide-y" style={{ background: 'var(--color-card)' }}>
            {section.fields.map(field => (
              <div key={field.label} className="px-6 py-4 flex items-center justify-between gap-4">
                <label className="text-sm font-medium w-64" style={{ color: 'var(--color-foreground)' }}>{field.label}</label>
                <input
                  className="flex-1 border rounded px-3 py-1.5 text-sm"
                  style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)', color: 'var(--color-foreground)', fontFamily: 'var(--font-mono)' }}
                  defaultValue={field.value}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <button className="px-5 py-2 rounded text-sm font-medium" style={{ background: 'var(--color-primary)', color: 'white' }}>
        Guardar configuración
      </button>
    </div>
  );
}
