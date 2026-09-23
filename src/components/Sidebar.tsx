import type { Screen } from '../App';

const navItems: { id: Screen; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
  { id: 'designer', label: 'Diseñador de servicios', icon: '✦' },
  { id: 'catalog', label: 'Catálogo de insumos', icon: '◈' },
  { id: 'vehicles', label: 'Vehículos', icon: '◉' },
  { id: 'personnel', label: 'Personal', icon: '◎' },
  { id: 'suppliers', label: 'Proveedores', icon: '◇' },
  { id: 'zones', label: 'Zonas y reglas', icon: '◌' },
  { id: 'sheets', label: 'Fichas técnicas', icon: '▦' },
  { id: 'comparator', label: 'Comparador', icon: '⟺' },
  { id: 'settings', label: 'Configuración', icon: '◈' },
];

interface SidebarProps {
  current: Screen;
  onNavigate: (screen: Screen) => void;
}

export default function Sidebar({ current, onNavigate }: SidebarProps) {
  return (
    <aside className="w-64 flex-shrink-0 flex flex-col border-r h-full" style={{ borderColor: 'var(--color-border)', background: 'var(--color-card)' }}>
      {/* Logo area */}
      <div className="px-6 pt-6 pb-5 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded flex items-center justify-center text-sm font-bold"
            style={{ background: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}>
            M
          </div>
          <span className="font-semibold text-sm tracking-wide" style={{ color: 'var(--color-foreground)' }}>
            Moreh
          </span>
        </div>
        <p className="text-xs leading-tight" style={{ color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
          Diseñador Técnico de Servicios Funerarios
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-0.5 px-3">
          {navItems.map(item => {
            const active = current === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded text-left text-sm transition-colors"
                  style={{
                    background: active ? 'var(--color-secondary)' : 'transparent',
                    color: active ? 'var(--color-primary)' : 'var(--color-secondary-foreground)',
                    fontWeight: active ? '600' : '400',
                  }}
                >
                  <span className="text-base leading-none w-4 text-center" style={{ opacity: active ? 1 : 0.5 }}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t text-xs" style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted-foreground)' }}>
        <p className="font-medium">v1.0 — Datos de ejemplo</p>
        <p>© 2026 Moreh Servicios</p>
      </div>
    </aside>
  );
}
