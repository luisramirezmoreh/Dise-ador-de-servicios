import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  insumos as mockInsumos,
  vehiculos as mockVehiculos,
  personal as mockPersonal,
  proveedores as mockProveedores,
  servicios as mockServicios,
  type Insumo, type Vehiculo, type Personal, type Proveedor, type Servicio,
} from '../data/mockData';
import { getData, setData } from '../api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AppDataContextValue {
  insumos: Insumo[];
  vehiculos: Vehiculo[];
  personal: Personal[];
  proveedores: Proveedor[];
  servicios: Servicio[];
  setInsumos: (v: Insumo[]) => void;
  setVehiculos: (v: Vehiculo[]) => void;
  setPersonal: (v: Personal[]) => void;
  setProveedores: (v: Proveedor[]) => void;
  setServicios: (v: Servicio[]) => void;
  loading: boolean;
  syncError: string | null;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used inside AppDataProvider');
  return ctx;
}

// ─── Debounced save hook ──────────────────────────────────────────────────────

function useDebouncedSave<T>(entity: string, data: T, delay = 1200) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; } // skip initial render
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setData(entity, data).catch(err => console.error(`Save ${entity} failed:`, err));
    }, delay);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);

  const [insumos,    setInsumosState]    = useState<Insumo[]>(mockInsumos);
  const [vehiculos,  setVehiculosState]  = useState<Vehiculo[]>(mockVehiculos);
  const [personal,   setPersonalState]   = useState<Personal[]>(mockPersonal);
  const [proveedores,setProveedoresState]= useState<Proveedor[]>(mockProveedores);
  const [servicios,  setServiciosState]  = useState<Servicio[]>(mockServicios);

  // Load all data from Supabase on mount; fall back to mock if no cloud data yet
  useEffect(() => {
    async function loadAll() {
      try {
        const [ins, veh, per, prov, srv] = await Promise.all([
          getData<Insumo[]>('insumos'),
          getData<Vehiculo[]>('vehiculos'),
          getData<Personal[]>('personal'),
          getData<Proveedor[]>('proveedores'),
          getData<Servicio[]>('servicios'),
        ]);
        if (ins?.length)   setInsumosState(ins);
        if (veh?.length)   setVehiculosState(veh);
        if (per?.length)   setPersonalState(per);
        if (prov?.length)  setProveedoresState(prov);
        if (srv?.length)   setServiciosState(srv);
      } catch (err) {
        console.error('Error loading from Supabase:', err);
        setSyncError('No se pudo conectar a Supabase. Usando datos locales.');
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  // Auto-save each collection with debounce when it changes
  useDebouncedSave('insumos',    insumos);
  useDebouncedSave('vehiculos',  vehiculos);
  useDebouncedSave('personal',   personal);
  useDebouncedSave('proveedores',proveedores);
  useDebouncedSave('servicios',  servicios);

  const setInsumos    = useCallback((v: Insumo[])    => setInsumosState(v),    []);
  const setVehiculos  = useCallback((v: Vehiculo[])  => setVehiculosState(v),  []);
  const setPersonal   = useCallback((v: Personal[])  => setPersonalState(v),   []);
  const setProveedores= useCallback((v: Proveedor[]) => setProveedoresState(v),[]);
  const setServicios  = useCallback((v: Servicio[])  => setServiciosState(v),  []);

  return (
    <AppDataContext.Provider value={{
      insumos, vehiculos, personal, proveedores, servicios,
      setInsumos, setVehiculos, setPersonal, setProveedores, setServicios,
      loading, syncError,
    }}>
      {children}
    </AppDataContext.Provider>
  );
}
