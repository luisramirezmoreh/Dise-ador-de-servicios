export type Zona = 'Zona Metropolitana' | 'Altos' | 'Chapala' | 'Zacoalco';
export type Modalidad = 'Capilla' | 'Domicilio' | 'Cremación directa' | 'Traslado';
export type Nivel = 'Básico' | 'Estándar' | 'Superior' | 'Premium' | 'Personalizado';
export type Estatus = 'Activo' | 'Borrador' | 'En revisión' | 'Obsoleto' | 'Incompleto';

export interface Insumo {
  id: string;
  nombre: string;
  categoria: string;
  subcategoria: string;
  proveedor: string;
  unidadCompra: string;
  contenidoPorUnidad: number;
  precioSinIva: number;
  iva: number;
  precioConIva: number;
  costoUnitario: number;
  rendimientoPorServicio: number;
  merma: number;
  zonaAplicable: string;
  modalidadAplicable: string;
  obligatorio: boolean;
  vigenciaPrecio: string;
  estatus: 'Activo' | 'Inactivo';
  notas: string;
}

export interface Vehiculo {
  id: string;
  nombre: string;
  tipo: string;
  zonaBase: Zona;
  costoFijo: number;
  costoPorKm: number;
  kmIncluidos: number;
  costoChoferPorHora: number;
  horasEstandar: number;
  mantenimientoPorKm: number;
  depreciacionPorKm: number;
  casetas: number;
  viaticos: number;
  modalidades: string[];
  estatus: 'Activo' | 'Inactivo';
}

export interface Personal {
  id: string;
  rol: string;
  costoPorHora: number;
  horasEstandar: number;
  cantidadEstandar: number;
  zona: string;
  modalidad: string;
  obligatorio: boolean;
  notas: string;
}

export interface Proveedor {
  id: string;
  nombre: string;
  categoria: string;
  contacto: string;
  telefono: string;
  zona: string;
  productos: string;
  condiciones: string;
  tiempoEntrega: string;
  estatus: 'Activo' | 'Inactivo';
  notas: string;
}

export interface ZonaConfig {
  nombre: Zona;
  costoBaseOperativo: number;
  factorZona: number;
  costoPorKmAdicional: number;
  viatico: number;
  proveedorPreferente: string;
  vehiculosDisponibles: string[];
  tiempoPromedioServicio: number;
  observaciones: string;
}

export interface ComponenteServicio {
  insumoId: string;
  nombre: string;
  categoria: string;
  cantidad: number;
  unidad: string;
  proveedor: string;
  costoUnitario: number;
  merma: number;
  costoTotal: number;
  obligatorio: boolean;
  notas: string;
}

export interface VehiculoServicio {
  vehiculoId: string;
  nombre: string;
  kmEstimados: number;
  casetas: number;
  viaticos: number;
  horasChofer: number;
  observaciones: string;
  costoTotal: number;
}

export interface PersonalServicio {
  rol: string;
  cantidad: number;
  horas: number;
  costoPorHora: number;
  costoTotal: number;
}

export interface Servicio {
  id: string;
  nombre: string;
  modalidad: Modalidad;
  zona: Zona;
  nivel: Nivel;
  estatus: Estatus;
  version: number;
  fechaCreacion: string;
  fechaModificacion: string;
  componentes: ComponenteServicio[];
  vehiculos: VehiculoServicio[];
  personal: PersonalServicio[];
  costosIndirectos: number;
  margenSugerido: number;
  observaciones: string;
}

// --- MOCK DATA ---

export const insumos: Insumo[] = [
  {
    id: 'INS-001',
    nombre: 'Ataúd básico madera pino',
    categoria: 'Ataúd',
    subcategoria: 'Madera sólida',
    proveedor: 'Muebles Funerarios del Bajío',
    unidadCompra: 'Pieza',
    contenidoPorUnidad: 1,
    precioSinIva: 3200,
    iva: 16,
    precioConIva: 3712,
    costoUnitario: 3200,
    rendimientoPorServicio: 1,
    merma: 0,
    zonaAplicable: 'Todas',
    modalidadAplicable: 'Capilla, Domicilio',
    obligatorio: true,
    vigenciaPrecio: '2026-12-31',
    estatus: 'Activo',
    notas: 'Incluye herrajes básicos',
  },
  {
    id: 'INS-002',
    nombre: 'Ataúd estándar caoba',
    categoria: 'Ataúd',
    subcategoria: 'Madera fina',
    proveedor: 'Muebles Funerarios del Bajío',
    unidadCompra: 'Pieza',
    contenidoPorUnidad: 1,
    precioSinIva: 7500,
    iva: 16,
    precioConIva: 8700,
    costoUnitario: 7500,
    rendimientoPorServicio: 1,
    merma: 0,
    zonaAplicable: 'Todas',
    modalidadAplicable: 'Capilla, Domicilio',
    obligatorio: true,
    vigenciaPrecio: '2026-12-31',
    estatus: 'Activo',
    notas: 'Herrajes dorados incluidos',
  },
  {
    id: 'INS-003',
    nombre: 'Urna cerámica estándar',
    categoria: 'Urna',
    subcategoria: 'Cerámica',
    proveedor: 'Arte Funerario GDL',
    unidadCompra: 'Pieza',
    contenidoPorUnidad: 1,
    precioSinIva: 850,
    iva: 16,
    precioConIva: 986,
    costoUnitario: 850,
    rendimientoPorServicio: 1,
    merma: 0,
    zonaAplicable: 'Todas',
    modalidadAplicable: 'Cremación directa',
    obligatorio: true,
    vigenciaPrecio: '2026-12-31',
    estatus: 'Activo',
    notas: '',
  },
  {
    id: 'INS-004',
    nombre: 'Café soluble caja 200g',
    categoria: 'Cafetería',
    subcategoria: 'Bebidas calientes',
    proveedor: 'Distribuidora Central Jalisco',
    unidadCompra: 'Caja',
    contenidoPorUnidad: 200,
    precioSinIva: 120,
    iva: 0,
    precioConIva: 120,
    costoUnitario: 0.6,
    rendimientoPorServicio: 60,
    merma: 5,
    zonaAplicable: 'Todas',
    modalidadAplicable: 'Capilla, Domicilio',
    obligatorio: false,
    vigenciaPrecio: '2026-06-30',
    estatus: 'Activo',
    notas: 'Aproximado 60 tazas por caja',
  },
  {
    id: 'INS-005',
    nombre: 'Arreglo floral básico',
    categoria: 'Flores',
    subcategoria: 'Arreglos',
    proveedor: 'Flores del Lago',
    unidadCompra: 'Arreglo',
    contenidoPorUnidad: 1,
    precioSinIva: 380,
    iva: 0,
    precioConIva: 380,
    costoUnitario: 380,
    rendimientoPorServicio: 2,
    merma: 10,
    zonaAplicable: 'Todas',
    modalidadAplicable: 'Capilla, Domicilio',
    obligatorio: false,
    vigenciaPrecio: '2026-03-31',
    estatus: 'Activo',
    notas: 'Precios varían por temporada',
  },
  {
    id: 'INS-006',
    nombre: 'Kit papelería recordatorio 50 pzas',
    categoria: 'Papelería',
    subcategoria: 'Recordatorios',
    proveedor: 'Impresos Moreh',
    unidadCompra: 'Kit',
    contenidoPorUnidad: 50,
    precioSinIva: 280,
    iva: 16,
    precioConIva: 324.8,
    costoUnitario: 280,
    rendimientoPorServicio: 1,
    merma: 0,
    zonaAplicable: 'Todas',
    modalidadAplicable: 'Capilla, Domicilio',
    obligatorio: false,
    vigenciaPrecio: '2026-12-31',
    estatus: 'Activo',
    notas: 'Incluye diseño personalizado',
  },
  {
    id: 'INS-007',
    nombre: 'Kit limpieza capilla',
    categoria: 'Limpieza',
    subcategoria: 'Higiene',
    proveedor: 'Suministros Industriales JR',
    unidadCompra: 'Kit',
    contenidoPorUnidad: 1,
    precioSinIva: 190,
    iva: 16,
    precioConIva: 220.4,
    costoUnitario: 190,
    rendimientoPorServicio: 1,
    merma: 0,
    zonaAplicable: 'Todas',
    modalidadAplicable: 'Capilla',
    obligatorio: true,
    vigenciaPrecio: '2026-12-31',
    estatus: 'Activo',
    notas: '',
  },
  {
    id: 'INS-008',
    nombre: 'Sillas plegables (lote 50)',
    categoria: 'Mobiliario',
    subcategoria: 'Sillas',
    proveedor: 'Renta de Mobiliario GDL',
    unidadCompra: 'Lote',
    contenidoPorUnidad: 50,
    precioSinIva: 750,
    iva: 16,
    precioConIva: 870,
    costoUnitario: 750,
    rendimientoPorServicio: 1,
    merma: 0,
    zonaAplicable: 'Todas',
    modalidadAplicable: 'Capilla, Domicilio',
    obligatorio: false,
    vigenciaPrecio: '2026-12-31',
    estatus: 'Activo',
    notas: 'Precio de renta por evento',
  },
  {
    id: 'INS-009',
    nombre: 'Atril y catafalco',
    categoria: 'Equipo de velación',
    subcategoria: 'Soporte',
    proveedor: 'Equipo Funerario MX',
    unidadCompra: 'Set',
    contenidoPorUnidad: 1,
    precioSinIva: 0,
    iva: 0,
    precioConIva: 0,
    costoUnitario: 0,
    rendimientoPorServicio: 1,
    merma: 0,
    zonaAplicable: 'Todas',
    modalidadAplicable: 'Capilla, Domicilio',
    obligatorio: true,
    vigenciaPrecio: '',
    estatus: 'Activo',
    notas: 'Activo propio — sin costo por uso',
  },
  {
    id: 'INS-010',
    nombre: 'Trámite acta defunción',
    categoria: 'Trámites',
    subcategoria: 'Registro Civil',
    proveedor: 'Gestoría Legal Moreh',
    unidadCompra: 'Servicio',
    contenidoPorUnidad: 1,
    precioSinIva: 650,
    iva: 0,
    precioConIva: 650,
    costoUnitario: 650,
    rendimientoPorServicio: 1,
    merma: 0,
    zonaAplicable: 'Todas',
    modalidadAplicable: 'Todas',
    obligatorio: true,
    vigenciaPrecio: '2026-12-31',
    estatus: 'Activo',
    notas: 'Incluye derechos de registro',
  },
  {
    id: 'INS-011',
    nombre: 'Servicio de cremación',
    categoria: 'Proveedor externo',
    subcategoria: 'Crematorio',
    proveedor: 'Crematorio Los Laureles',
    unidadCompra: 'Servicio',
    contenidoPorUnidad: 1,
    precioSinIva: 4800,
    iva: 16,
    precioConIva: 5568,
    costoUnitario: 4800,
    rendimientoPorServicio: 1,
    merma: 0,
    zonaAplicable: 'Zona Metropolitana',
    modalidadAplicable: 'Cremación directa',
    obligatorio: true,
    vigenciaPrecio: '2026-09-30',
    estatus: 'Activo',
    notas: 'Solo disponible en ZMG',
  },
];

export const vehiculos: Vehiculo[] = [
  {
    id: 'VEH-001',
    nombre: 'Carroza Principal Moreh',
    tipo: 'Carroza',
    zonaBase: 'Zona Metropolitana',
    costoFijo: 1200,
    costoPorKm: 8,
    kmIncluidos: 30,
    costoChoferPorHora: 90,
    horasEstandar: 6,
    mantenimientoPorKm: 1.5,
    depreciacionPorKm: 2,
    casetas: 0,
    viaticos: 0,
    modalidades: ['Capilla', 'Domicilio'],
    estatus: 'Activo',
  },
  {
    id: 'VEH-002',
    nombre: 'Camioneta de Apoyo',
    tipo: 'Camioneta',
    zonaBase: 'Zona Metropolitana',
    costoFijo: 400,
    costoPorKm: 4.5,
    kmIncluidos: 50,
    costoChoferPorHora: 70,
    horasEstandar: 4,
    mantenimientoPorKm: 1,
    depreciacionPorKm: 1.2,
    casetas: 0,
    viaticos: 0,
    modalidades: ['Capilla', 'Domicilio', 'Cremación directa'],
    estatus: 'Activo',
  },
  {
    id: 'VEH-003',
    nombre: 'Vehículo de Traslado Foráneo',
    tipo: 'Vehículo de traslado',
    zonaBase: 'Zona Metropolitana',
    costoFijo: 800,
    costoPorKm: 6,
    kmIncluidos: 100,
    costoChoferPorHora: 85,
    horasEstandar: 8,
    mantenimientoPorKm: 1.8,
    depreciacionPorKm: 2.5,
    casetas: 180,
    viaticos: 250,
    modalidades: ['Traslado', 'Capilla', 'Domicilio'],
    estatus: 'Activo',
  },
];

export const personal: Personal[] = [
  { id: 'PER-001', rol: 'Director de servicio', costoPorHora: 180, horasEstandar: 8, cantidadEstandar: 1, zona: 'Todas', modalidad: 'Todas', obligatorio: true, notas: '' },
  { id: 'PER-002', rol: 'Chofer', costoPorHora: 90, horasEstandar: 6, cantidadEstandar: 1, zona: 'Todas', modalidad: 'Todas', obligatorio: true, notas: '' },
  { id: 'PER-003', rol: 'Cargador', costoPorHora: 65, horasEstandar: 4, cantidadEstandar: 4, zona: 'Todas', modalidad: 'Capilla, Domicilio', obligatorio: true, notas: '' },
  { id: 'PER-004', rol: 'Personal de montaje', costoPorHora: 70, horasEstandar: 3, cantidadEstandar: 2, zona: 'Todas', modalidad: 'Capilla, Domicilio', obligatorio: false, notas: '' },
  { id: 'PER-005', rol: 'Personal de cafetería', costoPorHora: 60, horasEstandar: 8, cantidadEstandar: 1, zona: 'Todas', modalidad: 'Capilla, Domicilio', obligatorio: false, notas: '' },
  { id: 'PER-006', rol: 'Gestor de trámites', costoPorHora: 120, horasEstandar: 4, cantidadEstandar: 1, zona: 'Todas', modalidad: 'Todas', obligatorio: true, notas: '' },
  { id: 'PER-007', rol: 'Preparador', costoPorHora: 150, horasEstandar: 3, cantidadEstandar: 1, zona: 'Todas', modalidad: 'Capilla, Domicilio, Traslado', obligatorio: true, notas: '' },
  { id: 'PER-008', rol: 'Limpieza', costoPorHora: 55, horasEstandar: 4, cantidadEstandar: 1, zona: 'Todas', modalidad: 'Capilla', obligatorio: false, notas: '' },
  { id: 'PER-009', rol: 'Coordinador de capilla', costoPorHora: 130, horasEstandar: 8, cantidadEstandar: 1, zona: 'Todas', modalidad: 'Capilla', obligatorio: false, notas: '' },
  { id: 'PER-010', rol: 'Apoyo nocturno', costoPorHora: 80, horasEstandar: 8, cantidadEstandar: 1, zona: 'Todas', modalidad: 'Capilla, Domicilio', obligatorio: false, notas: '' },
];

export const proveedores: Proveedor[] = [
  { id: 'PROV-001', nombre: 'Muebles Funerarios del Bajío', categoria: 'Ataúd', contacto: 'Lic. Roberto Sánchez', telefono: '33-1234-5678', zona: 'Todas', productos: 'Ataúdes madera, metálicos, pino, caoba', condiciones: '30 días neto', tiempoEntrega: '24 hrs', estatus: 'Activo', notas: '' },
  { id: 'PROV-002', nombre: 'Arte Funerario GDL', categoria: 'Urna', contacto: 'Ing. Lucía Vega', telefono: '33-8765-4321', zona: 'Zona Metropolitana', productos: 'Urnas cerámicas, madera, bronce', condiciones: 'Pago anticipado', tiempoEntrega: '48 hrs', estatus: 'Activo', notas: '' },
  { id: 'PROV-003', nombre: 'Crematorio Los Laureles', categoria: 'Proveedor externo', contacto: 'Dr. Armando Cruz', telefono: '33-2233-4455', zona: 'Zona Metropolitana', productos: 'Servicio de cremación', condiciones: '7 días neto', tiempoEntrega: 'Inmediato', estatus: 'Activo', notas: 'Solo ZMG' },
  { id: 'PROV-004', nombre: 'Flores del Lago', categoria: 'Flores', contacto: 'Sra. Carmen Ibarra', telefono: '376-765-1234', zona: 'Chapala', productos: 'Arreglos florales, coronas, ramos', condiciones: 'Pago inmediato', tiempoEntrega: '4 hrs', estatus: 'Activo', notas: '' },
  { id: 'PROV-005', nombre: 'Distribuidora Central Jalisco', categoria: 'Cafetería', contacto: 'Sr. Miguel Torres', telefono: '33-5566-7788', zona: 'Todas', productos: 'Café, azúcar, vasos desechables, pan', condiciones: '15 días neto', tiempoEntrega: '12 hrs', estatus: 'Activo', notas: '' },
  { id: 'PROV-006', nombre: 'Gestoría Legal Moreh', categoria: 'Trámites', contacto: 'Lic. Patricia Ramos', telefono: '33-9900-1122', zona: 'Todas', productos: 'Actas de defunción, permisos, trámites municipales', condiciones: '30 días neto', tiempoEntrega: '2 días hábiles', estatus: 'Activo', notas: '' },
];

export const zonasConfig: ZonaConfig[] = [
  {
    nombre: 'Zona Metropolitana',
    costoBaseOperativo: 1500,
    factorZona: 1.0,
    costoPorKmAdicional: 8,
    viatico: 0,
    proveedorPreferente: 'Muebles Funerarios del Bajío',
    vehiculosDisponibles: ['Carroza Principal Moreh', 'Camioneta de Apoyo', 'Vehículo de Traslado Foráneo'],
    tiempoPromedioServicio: 6,
    observaciones: 'Zona base. Sin viáticos. Todos los vehículos disponibles.',
  },
  {
    nombre: 'Altos',
    costoBaseOperativo: 1800,
    factorZona: 1.15,
    costoPorKmAdicional: 9,
    viatico: 300,
    proveedorPreferente: 'Muebles Funerarios del Bajío',
    vehiculosDisponibles: ['Carroza Principal Moreh', 'Vehículo de Traslado Foráneo'],
    tiempoPromedioServicio: 8,
    observaciones: 'Incluir viáticos de personal. Prever casetas en ruta Guadalajara-Tepatitlán.',
  },
  {
    nombre: 'Chapala',
    costoBaseOperativo: 1650,
    factorZona: 1.08,
    costoPorKmAdicional: 8.5,
    viatico: 150,
    proveedorPreferente: 'Flores del Lago',
    vehiculosDisponibles: ['Carroza Principal Moreh', 'Camioneta de Apoyo'],
    tiempoPromedioServicio: 7,
    observaciones: 'Zona turística. Posible demanda de servicios en inglés. Distancia ~45 km desde ZMG.',
  },
  {
    nombre: 'Zacoalco',
    costoBaseOperativo: 1750,
    factorZona: 1.12,
    costoPorKmAdicional: 9,
    viatico: 200,
    proveedorPreferente: 'Muebles Funerarios del Bajío',
    vehiculosDisponibles: ['Vehículo de Traslado Foráneo'],
    tiempoPromedioServicio: 8,
    observaciones: 'Zona rural. Considerar tiempo de traslado extra. ~70 km desde ZMG.',
  },
];

export const servicios: Servicio[] = [
  {
    id: 'SRV-001',
    nombre: 'Servicio Básico Capilla ZMG',
    modalidad: 'Capilla',
    zona: 'Zona Metropolitana',
    nivel: 'Básico',
    estatus: 'Activo',
    version: 3,
    fechaCreacion: '2026-01-15',
    fechaModificacion: '2026-08-20',
    componentes: [
      { insumoId: 'INS-001', nombre: 'Ataúd básico madera pino', categoria: 'Ataúd', cantidad: 1, unidad: 'Pieza', proveedor: 'Muebles Funerarios del Bajío', costoUnitario: 3200, merma: 0, costoTotal: 3200, obligatorio: true, notas: '' },
      { insumoId: 'INS-004', nombre: 'Café soluble caja 200g', categoria: 'Cafetería', cantidad: 1, unidad: 'Caja', proveedor: 'Distribuidora Central Jalisco', costoUnitario: 120, merma: 5, costoTotal: 126, obligatorio: false, notas: '' },
      { insumoId: 'INS-005', nombre: 'Arreglo floral básico', categoria: 'Flores', cantidad: 2, unidad: 'Arreglo', proveedor: 'Flores del Lago', costoUnitario: 380, merma: 10, costoTotal: 836, obligatorio: false, notas: '' },
      { insumoId: 'INS-006', nombre: 'Kit papelería recordatorio 50 pzas', categoria: 'Papelería', cantidad: 1, unidad: 'Kit', proveedor: 'Impresos Moreh', costoUnitario: 280, merma: 0, costoTotal: 280, obligatorio: false, notas: '' },
      { insumoId: 'INS-007', nombre: 'Kit limpieza capilla', categoria: 'Limpieza', cantidad: 1, unidad: 'Kit', proveedor: 'Suministros Industriales JR', costoUnitario: 190, merma: 0, costoTotal: 190, obligatorio: true, notas: '' },
      { insumoId: 'INS-008', nombre: 'Sillas plegables (lote 50)', categoria: 'Mobiliario', cantidad: 1, unidad: 'Lote', proveedor: 'Renta de Mobiliario GDL', costoUnitario: 750, merma: 0, costoTotal: 750, obligatorio: false, notas: '' },
      { insumoId: 'INS-010', nombre: 'Trámite acta defunción', categoria: 'Trámites', cantidad: 1, unidad: 'Servicio', proveedor: 'Gestoría Legal Moreh', costoUnitario: 650, merma: 0, costoTotal: 650, obligatorio: true, notas: '' },
    ],
    vehiculos: [
      { vehiculoId: 'VEH-001', nombre: 'Carroza Principal Moreh', kmEstimados: 25, casetas: 0, viaticos: 0, horasChofer: 6, observaciones: '', costoTotal: 2040 },
    ],
    personal: [
      { rol: 'Director de servicio', cantidad: 1, horas: 8, costoPorHora: 180, costoTotal: 1440 },
      { rol: 'Chofer', cantidad: 1, horas: 6, costoPorHora: 90, costoTotal: 540 },
      { rol: 'Cargador', cantidad: 4, horas: 4, costoPorHora: 65, costoTotal: 1040 },
      { rol: 'Gestor de trámites', cantidad: 1, horas: 4, costoPorHora: 120, costoTotal: 480 },
      { rol: 'Preparador', cantidad: 1, horas: 3, costoPorHora: 150, costoTotal: 450 },
    ],
    costosIndirectos: 450,
    margenSugerido: 35,
    observaciones: 'Servicio estándar para capilla en zona metropolitana. Velación de 6 a 12 horas.',
  },
  {
    id: 'SRV-002',
    nombre: 'Cremación Directa Básica ZMG',
    modalidad: 'Cremación directa',
    zona: 'Zona Metropolitana',
    nivel: 'Básico',
    estatus: 'Activo',
    version: 2,
    fechaCreacion: '2026-02-10',
    fechaModificacion: '2026-07-05',
    componentes: [
      { insumoId: 'INS-003', nombre: 'Urna cerámica estándar', categoria: 'Urna', cantidad: 1, unidad: 'Pieza', proveedor: 'Arte Funerario GDL', costoUnitario: 850, merma: 0, costoTotal: 850, obligatorio: true, notas: '' },
      { insumoId: 'INS-010', nombre: 'Trámite acta defunción', categoria: 'Trámites', cantidad: 1, unidad: 'Servicio', proveedor: 'Gestoría Legal Moreh', costoUnitario: 650, merma: 0, costoTotal: 650, obligatorio: true, notas: '' },
      { insumoId: 'INS-011', nombre: 'Servicio de cremación', categoria: 'Proveedor externo', cantidad: 1, unidad: 'Servicio', proveedor: 'Crematorio Los Laureles', costoUnitario: 4800, merma: 0, costoTotal: 4800, obligatorio: true, notas: '' },
    ],
    vehiculos: [
      { vehiculoId: 'VEH-002', nombre: 'Camioneta de Apoyo', kmEstimados: 20, casetas: 0, viaticos: 0, horasChofer: 4, observaciones: 'Traslado a crematorio Los Laureles', costoTotal: 750 },
    ],
    personal: [
      { rol: 'Director de servicio', cantidad: 1, horas: 4, costoPorHora: 180, costoTotal: 720 },
      { rol: 'Chofer', cantidad: 1, horas: 4, costoPorHora: 90, costoTotal: 360 },
      { rol: 'Gestor de trámites', cantidad: 1, horas: 4, costoPorHora: 120, costoTotal: 480 },
      { rol: 'Preparador', cantidad: 1, horas: 2, costoPorHora: 150, costoTotal: 300 },
    ],
    costosIndirectos: 300,
    margenSugerido: 40,
    observaciones: 'Incluye traslado al crematorio y entrega de urna en máximo 48 hrs.',
  },
  {
    id: 'SRV-003',
    nombre: 'Servicio Superior Capilla Chapala',
    modalidad: 'Capilla',
    zona: 'Chapala',
    nivel: 'Superior',
    estatus: 'En revisión',
    version: 1,
    fechaCreacion: '2026-06-01',
    fechaModificacion: '2026-09-10',
    componentes: [
      { insumoId: 'INS-002', nombre: 'Ataúd estándar caoba', categoria: 'Ataúd', cantidad: 1, unidad: 'Pieza', proveedor: 'Muebles Funerarios del Bajío', costoUnitario: 7500, merma: 0, costoTotal: 7500, obligatorio: true, notas: '' },
      { insumoId: 'INS-004', nombre: 'Café soluble caja 200g', categoria: 'Cafetería', cantidad: 2, unidad: 'Caja', proveedor: 'Distribuidora Central Jalisco', costoUnitario: 120, merma: 5, costoTotal: 252, obligatorio: false, notas: '' },
      { insumoId: 'INS-005', nombre: 'Arreglo floral básico', categoria: 'Flores', cantidad: 4, unidad: 'Arreglo', proveedor: 'Flores del Lago', costoUnitario: 380, merma: 10, costoTotal: 1672, obligatorio: false, notas: '' },
      { insumoId: 'INS-006', nombre: 'Kit papelería recordatorio 50 pzas', categoria: 'Papelería', cantidad: 1, unidad: 'Kit', proveedor: 'Impresos Moreh', costoUnitario: 280, merma: 0, costoTotal: 280, obligatorio: false, notas: '' },
      { insumoId: 'INS-007', nombre: 'Kit limpieza capilla', categoria: 'Limpieza', cantidad: 1, unidad: 'Kit', proveedor: 'Suministros Industriales JR', costoUnitario: 190, merma: 0, costoTotal: 190, obligatorio: true, notas: '' },
      { insumoId: 'INS-008', nombre: 'Sillas plegables (lote 50)', categoria: 'Mobiliario', cantidad: 1, unidad: 'Lote', proveedor: 'Renta de Mobiliario GDL', costoUnitario: 750, merma: 0, costoTotal: 750, obligatorio: false, notas: '' },
      { insumoId: 'INS-010', nombre: 'Trámite acta defunción', categoria: 'Trámites', cantidad: 1, unidad: 'Servicio', proveedor: 'Gestoría Legal Moreh', costoUnitario: 650, merma: 0, costoTotal: 650, obligatorio: true, notas: '' },
    ],
    vehiculos: [
      { vehiculoId: 'VEH-001', nombre: 'Carroza Principal Moreh', kmEstimados: 50, casetas: 0, viaticos: 150, horasChofer: 8, observaciones: 'Traslado Guadalajara - Chapala', costoTotal: 2870 },
    ],
    personal: [
      { rol: 'Director de servicio', cantidad: 1, horas: 10, costoPorHora: 180, costoTotal: 1800 },
      { rol: 'Chofer', cantidad: 1, horas: 8, costoPorHora: 90, costoTotal: 720 },
      { rol: 'Cargador', cantidad: 4, horas: 4, costoPorHora: 65, costoTotal: 1040 },
      { rol: 'Personal de montaje', cantidad: 2, horas: 3, costoPorHora: 70, costoTotal: 420 },
      { rol: 'Personal de cafetería', cantidad: 1, horas: 8, costoPorHora: 60, costoTotal: 480 },
      { rol: 'Gestor de trámites', cantidad: 1, horas: 4, costoPorHora: 120, costoTotal: 480 },
      { rol: 'Preparador', cantidad: 1, horas: 3, costoPorHora: 150, costoTotal: 450 },
    ],
    costosIndirectos: 650,
    margenSugerido: 38,
    observaciones: 'Servicio superior para zona Chapala. Considera viáticos por distancia.',
  },
  {
    id: 'SRV-004',
    nombre: 'Traslado Foráneo Altos',
    modalidad: 'Traslado',
    zona: 'Altos',
    nivel: 'Estándar',
    estatus: 'Borrador',
    version: 1,
    fechaCreacion: '2026-09-01',
    fechaModificacion: '2026-09-18',
    componentes: [
      { insumoId: 'INS-010', nombre: 'Trámite acta defunción', categoria: 'Trámites', cantidad: 1, unidad: 'Servicio', proveedor: 'Gestoría Legal Moreh', costoUnitario: 650, merma: 0, costoTotal: 650, obligatorio: true, notas: '' },
    ],
    vehiculos: [
      { vehiculoId: 'VEH-003', nombre: 'Vehículo de Traslado Foráneo', kmEstimados: 120, casetas: 180, viaticos: 300, horasChofer: 8, observaciones: 'Ruta GDL-Tepatitlán', costoTotal: 2600 },
    ],
    personal: [
      { rol: 'Director de servicio', cantidad: 1, horas: 6, costoPorHora: 180, costoTotal: 1080 },
      { rol: 'Chofer', cantidad: 1, horas: 8, costoPorHora: 90, costoTotal: 720 },
      { rol: 'Preparador', cantidad: 1, horas: 2, costoPorHora: 150, costoTotal: 300 },
    ],
    costosIndirectos: 400,
    margenSugerido: 32,
    observaciones: 'Servicio de traslado desde Guadalajara a la región de Altos.',
  },
];

// Helper functions
export function formatMXN(amount: number): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
}

export function calcularCostoServicio(servicio: Servicio): {
  insumos: number;
  ataud: number;
  vehiculos: number;
  personal: number;
  tramites: number;
  proveedoresExternos: number;
  costosIndirectos: number;
  merma: number;
  total: number;
  precioSugerido: number;
} {
  const ataud = servicio.componentes
    .filter(c => c.categoria === 'Ataúd' || c.categoria === 'Urna')
    .reduce((s, c) => s + c.costoTotal, 0);
  const tramites = servicio.componentes
    .filter(c => c.categoria === 'Trámites')
    .reduce((s, c) => s + c.costoTotal, 0);
  const provExterno = servicio.componentes
    .filter(c => c.categoria === 'Proveedor externo')
    .reduce((s, c) => s + c.costoTotal, 0);
  const otrosInsumos = servicio.componentes
    .filter(c => !['Ataúd', 'Urna', 'Trámites', 'Proveedor externo'].includes(c.categoria))
    .reduce((s, c) => s + c.costoTotal, 0);
  const vehiculosTotal = servicio.vehiculos.reduce((s, v) => s + v.costoTotal, 0);
  const personalTotal = servicio.personal.reduce((s, p) => s + p.costoTotal, 0);
  const merma = servicio.componentes.reduce((s, c) => s + (c.costoUnitario * c.cantidad * c.merma / 100), 0);
  const total = ataud + otrosInsumos + vehiculosTotal + personalTotal + tramites + provExterno + servicio.costosIndirectos + merma;
  const precioSugerido = total * (1 + servicio.margenSugerido / 100);
  return { insumos: otrosInsumos, ataud, vehiculos: vehiculosTotal, personal: personalTotal, tramites, proveedoresExternos: provExterno, costosIndirectos: servicio.costosIndirectos, merma, total, precioSugerido };
}
