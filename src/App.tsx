import { useState } from 'react';
import { AppDataProvider, useAppData } from './store/AppDataContext';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ServiceDesigner from './components/ServiceDesigner';
import SupplyCatalog from './components/SupplyCatalog';
import Vehicles from './components/Vehicles';
import Personnel from './components/Personnel';
import Suppliers from './components/Suppliers';
import ZonesRules from './components/ZonesRules';
import TechnicalSheet from './components/TechnicalSheet';
import Comparator from './components/Comparator';
import Settings from './components/Settings';

export type Screen =
  | 'dashboard'
  | 'designer'
  | 'catalog'
  | 'vehicles'
  | 'personnel'
  | 'suppliers'
  | 'zones'
  | 'sheets'
  | 'comparator'
  | 'settings';

const TITLES: Record<Screen, string> = {
  dashboard: 'Panel de control',
  designer: 'Diseñador de servicios',
  catalog: 'Catálogo de insumos',
  vehicles: 'Vehículos',
  personnel: 'Personal',
  suppliers: 'Proveedores',
  zones: 'Zonas y reglas',
  sheets: 'Fichas técnicas',
  comparator: 'Comparador',
  settings: 'Configuración',
};

function AppShell() {
  const [screen, setScreen] = useState<Screen>('dashboard');
  const [imageMap, setImageMap] = useState<Record<string, string>>({});
  const { loading, syncError } = useAppData();

  function setImage(insumoId: string, dataUrl: string) {
    setImageMap(prev => ({ ...prev, [insumoId]: dataUrl }));
  }
  function removeImage(insumoId: string) {
    setImageMap(prev => { const n = { ...prev }; delete n[insumoId]; return n; });
  }

  const renderScreen = () => {
    switch (screen) {
      case 'dashboard': return <Dashboard />;
      case 'designer': return <ServiceDesigner imageMap={imageMap} />;
      case 'catalog': return <SupplyCatalog imageMap={imageMap} onSetImage={setImage} onRemoveImage={removeImage} />;
      case 'vehicles': return <Vehicles />;
      case 'personnel': return <Personnel />;
      case 'suppliers': return <Suppliers />;
      case 'zones': return <ZonesRules />;
      case 'sheets': return <TechnicalSheet imageMap={imageMap} />;
      case 'comparator': return <Comparator />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-background)' }}>
      <Sidebar current={screen} onNavigate={setScreen} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex-shrink-0 flex items-center justify-between px-8 py-4 border-b no-print"
          style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>{TITLES[screen]}</h2>
          <div className="flex items-center gap-3">
            {loading ? (
              <span className="text-xs px-2 py-1 rounded flex items-center gap-1.5"
                style={{ background: '#EFF6FF', color: '#1D4ED8', fontFamily: 'var(--font-mono)' }}>
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                Sincronizando…
              </span>
            ) : syncError ? (
              <span className="text-xs px-2 py-1 rounded" title={syncError}
                style={{ background: '#FEF2F2', color: '#991B1B', fontFamily: 'var(--font-mono)' }}>
                ⚠ Sin conexión — datos locales
              </span>
            ) : (
              <span className="text-xs px-2 py-1 rounded flex items-center gap-1.5"
                style={{ background: '#F0FDF4', color: '#166534', fontFamily: 'var(--font-mono)' }}>
                <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                Sincronizado
              </span>
            )}
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: 'var(--color-primary)', color: 'white' }}>AD</div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto">{renderScreen()}</div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppDataProvider>
      <AppShell />
    </AppDataProvider>
  );
}
