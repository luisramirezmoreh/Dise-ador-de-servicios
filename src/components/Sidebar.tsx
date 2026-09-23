import type { Screen } from '../App';
import logoImg from '../assets/logo.png';

const navItems: { id: Screen; label: string; icon: string }[] = [
  { id: 'dashboard',  label: 'Dashboard',                icon: '⊞' },
  { id: 'designer',   label: 'Diseñador de servicios',   icon: '✦' },
  { id: 'catalog',    label: 'Catálogo de insumos',      icon: '◈' },
  { id: 'vehicles',   label: 'Vehículos',                icon: '◉' },
  { id: 'personnel',  label: 'Personal',                 icon: '◎' },
  { id: 'suppliers',  label: 'Proveedores',              icon: '◇' },
  { id: 'zones',      label: 'Zonas y reglas',           icon: '◌' },
  { id: 'sheets',     label: 'Fichas técnicas',          icon: '▦' },
  { id: 'comparator', label: 'Comparador',               icon: '⟺' },
  { id: 'settings',   label: 'Configuración',            icon: '⚙' },
];

interface SidebarProps {
  current: Screen;
  onNavigate: (screen: Screen) => void;
}

export default function Sidebar({ current, onNavigate }: SidebarProps) {
  return (
    <aside
      className="w-60 flex-shrink-0 flex flex-col h-full"
      style={{ background: '#1A0E16', borderRight: '1px solid #2D1422' }}
    >
      {/* Logo */}
      <div className="px-5 pt-6 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <img
          src={logoImg}
          alt="Capillas Moreh"
          draggable={false}
          style={{ width: '100%', maxWidth: 168, height: 'auto', objectFit: 'contain' }}
        />
        <p className="text-xs mt-3 leading-tight"
          style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
          Diseñador Técnico de Servicios
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto">
        <ul className="space-y-0.5 px-3">
          {navItems.map(item => {
            const active = current === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-all"
                  style={{
                    background: active ? 'rgba(139,26,74,0.85)' : 'transparent',
                    color: active ? '#FFFFFF' : 'rgba(255,255,255,0.55)',
                    fontWeight: active ? '600' : '400',
                    boxShadow: active ? '0 1px 6px rgba(139,26,74,0.4)' : 'none',
                  }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'; }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                >
                  <span className="text-base leading-none w-4 text-center"
                    style={{ opacity: active ? 1 : 0.5 }}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 text-xs" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' }}>
        <p className="font-medium">v1.0 — Uso interno</p>
        <p>© 2026 Capillas Moreh</p>
      </div>
    </aside>
  );
}
