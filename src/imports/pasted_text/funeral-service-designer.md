Crea una aplicación web interna llamada “Diseñador Técnico de Servicios Funerarios Moreh”.

Objetivo:
La aplicación debe permitir diseñar, configurar y costear servicios funerarios por modalidad y zona. Cada servicio debe poder armarse seleccionando insumos, vehículos, personal, proveedores externos y reglas operativas. El sistema debe calcular en tiempo real el costo total de otorgar el servicio y generar una ficha técnica exportable o imprimible.

Estilo visual:
Diseño sobrio, profesional y gerencial. Usar una estética clara, limpia y elegante, con tonos beige, blanco, gris y dorado suave. Evitar colores oscuros excesivos, morado, café intenso o estilo lúgubre. Debe sentirse como un software interno moderno para dirección, administración y operación funeraria.

Formato:
Aplicación web tipo dashboard, desktop-first, responsive para tablet. Usar una barra lateral izquierda con navegación principal y un área central de trabajo. Usar tarjetas, tablas limpias, filtros, badges de estatus y paneles de resumen.

Navegación principal:
1. Dashboard
2. Diseñador de servicios
3. Catálogo de insumos
4. Vehículos
5. Personal
6. Proveedores
7. Zonas y reglas
8. Fichas técnicas
9. Comparador
10. Configuración

Pantalla 1: Dashboard
Mostrar tarjetas con:
- Total de servicios diseñados
- Costo promedio por servicio
- Servicios incompletos
- Insumos sin precio
- Servicios por zona
- Servicios por modalidad
- Últimos servicios modificados

Incluir una gráfica simple de costo promedio por zona:
- Zona Metropolitana
- Altos
- Chapala
- Zacoalco

Pantalla 2: Catálogo de insumos
Crear una tabla editable con estos campos:
- ID
- Nombre del insumo
- Categoría
- Subcategoría
- Proveedor
- Unidad de compra
- Contenido por unidad
- Precio de compra sin IVA
- IVA
- Precio con IVA
- Costo unitario calculado
- Rendimiento por servicio
- Merma %
- Zona aplicable
- Modalidad aplicable
- Obligatorio u opcional
- Vigencia de precio
- Estatus
- Notas

Categorías de insumos:
- Ataúd
- Urna
- Cafetería
- Flores
- Papelería
- Limpieza
- Mobiliario
- Equipo de velación
- Preparación
- Trámites
- Proveedor externo
- Otro

Funciones:
- Agregar insumo
- Editar insumo
- Duplicar insumo
- Desactivar insumo
- Buscar
- Filtrar por categoría, proveedor, zona y modalidad
- Mostrar alerta si falta precio, proveedor o vigencia

Pantalla 3: Vehículos
Crear una tabla editable con:
- Nombre del vehículo
- Tipo de vehículo
- Zona base
- Costo fijo por servicio
- Costo por kilómetro
- Kilómetros incluidos
- Costo chofer por hora
- Horas estándar
- Mantenimiento por km
- Depreciación por km
- Casetas
- Viáticos
- Disponible para modalidad
- Estatus

Tipos de vehículo:
- Carroza
- Camioneta
- Vehículo de apoyo
- Vehículo de traslado
- Otro

El sistema debe calcular:
Costo vehículo = costo fijo + kilómetros estimados × costo por km + chofer + casetas + viáticos + mantenimiento + depreciación.

Pantalla 4: Personal
Crear catálogo de roles:
- Director de servicio
- Chofer
- Cargador
- Personal de montaje
- Personal de cafetería
- Gestor de trámites
- Preparador
- Limpieza
- Coordinador de capilla
- Apoyo nocturno

Campos:
- Rol
- Costo por hora
- Horas estándar
- Cantidad estándar
- Zona
- Modalidad
- Obligatorio u opcional
- Notas

Pantalla 5: Proveedores
Crear tabla de proveedores con:
- Nombre
- Categoría
- Contacto
- Teléfono
- Zona
- Productos o servicios que ofrece
- Condiciones
- Tiempo de entrega
- Estatus
- Notas

Pantalla 6: Zonas y reglas
Crear configuración para zonas:
- Zona Metropolitana
- Altos
- Chapala
- Zacoalco

Cada zona debe tener:
- Costo base operativo
- Factor de zona
- Costo por km adicional
- Viático estándar
- Proveedor preferente
- Vehículos disponibles
- Tiempo promedio de servicio
- Observaciones operativas

Pantalla 7: Diseñador de servicios
Esta es la pantalla principal.

Debe tener un flujo por pasos:

Paso 1: Datos generales
- Nombre del servicio
- Modalidad: Capilla, Domicilio, Cremación directa, Traslado
- Zona: Zona Metropolitana, Altos, Chapala, Zacoalco
- Nivel: Básico, Estándar, Superior, Premium, Personalizado
- Estatus: Borrador, En revisión, Activo, Obsoleto

Paso 2: Selección de componentes
Mostrar componentes agrupados por categoría:
- Ataúd / urna
- Preparación
- Capilla o domicilio
- Vehículos
- Personal
- Cafetería
- Flores
- Papelería
- Limpieza
- Trámites
- Proveedores externos
- Extras

Cada componente seleccionado debe permitir:
- Cantidad
- Unidad
- Proveedor
- Costo unitario
- Merma %
- Costo total
- Obligatorio u opcional
- Notas

Paso 3: Vehículos y ruta
Permitir seleccionar vehículos, kilómetros estimados, casetas, viáticos, horas de chofer y observaciones.

Paso 4: Personal
Permitir agregar roles, cantidad de personas, horas y costo.

Paso 5: Resumen de costo
Mostrar un panel lateral fijo con cálculo en tiempo real:
- Insumos
- Ataúd / urna
- Vehículos
- Personal
- Trámites
- Proveedores externos
- Costos indirectos
- Merma
- Costo total de otorgamiento
- Margen sugerido
- Precio sugerido

Fórmula general:
Costo total = suma de insumos + vehículos + personal + trámites + proveedores externos + costos de zona + indirectos + merma.

Mostrar alertas:
- “Este servicio tiene insumos sin precio”
- “Falta proveedor en algunos componentes”
- “La vigencia de precio está vencida”
- “El costo cambió contra la versión anterior”

Pantalla 8: Ficha técnica
Crear vista tipo documento imprimible con:
- Nombre del servicio
- Modalidad
- Zona
- Versión
- Fecha
- Estatus
- Resumen operativo
- Tabla de componentes
- Tabla de vehículos
- Tabla de personal
- Tabla de proveedores externos
- Resumen de costos
- Observaciones
- Espacio para autorización

Agregar botón:
- Exportar / imprimir ficha técnica
- Guardar versión
- Duplicar servicio

Pantalla 9: Comparador
Permitir comparar el mismo servicio entre zonas:
Columnas:
- Zona Metropolitana
- Altos
- Chapala
- Zacoalco

Filas:
- Insumos
- Vehículos
- Personal
- Trámites
- Proveedores externos
- Costos de zona
- Costo total
- Diferencia contra ZMG
- Margen sugerido

Mostrar visualmente qué zona es más costosa y qué componente explica la diferencia.

Datos de prueba:
Crear datos demo realistas pero ficticios. Marcar claramente que son datos de ejemplo.
Incluir algunos insumos como ataúd básico, urna, café, flores, papelería, limpieza, sillas, equipo de velación y trámites.
Incluir vehículos demo como carroza principal, camioneta de apoyo y vehículo de traslado.
Incluir zonas demo: Zona Metropolitana, Altos, Chapala y Zacoalco.

Requisitos funcionales:
- Todos los costos deben mostrarse en MXN.
- Formato monetario: $#,###.##
- El sistema debe separar costo sin IVA y costo con IVA cuando aplique.
- El cálculo debe actualizarse automáticamente al cambiar cantidades, zona, modalidad o proveedor.
- Permitir guardar servicios como borrador.
- Permitir duplicar servicios para crear variaciones.
- Permitir desactivar insumos sin borrarlos.
- Usar estados visuales: Activo, Borrador, En revisión, Obsoleto, Incompleto.
- La interfaz debe sentirse administrativa, clara y fácil de usar.

Prioridad:
Primero construir un MVP funcional con datos locales simulados, formularios editables, cálculo en tiempo real y ficha técnica imprimible.