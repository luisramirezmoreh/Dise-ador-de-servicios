// Vector illustration stickers — one per insumo category + special types
// Each sticker renders as a self-contained SVG at any size

interface IconProps { size?: number; color?: string; }

const G = '#A87D2A'; // gold primary
const W = '#FFFFFF';
const D = '#2C2825'; // dark foreground
const M = '#C4973A'; // mid gold

export function AtaudIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="8" width="28" height="34" rx="6" fill={G} />
      <rect x="13" y="11" width="22" height="28" rx="4" fill={M} />
      {/* lid detail */}
      <rect x="16" y="14" width="16" height="4" rx="2" fill={W} opacity="0.3" />
      {/* cross */}
      <rect x="22" y="19" width="4" height="14" rx="1" fill={W} opacity="0.6" />
      <rect x="18" y="23" width="12" height="4" rx="1" fill={W} opacity="0.6" />
      {/* handles */}
      <rect x="7" y="17" width="4" height="8" rx="2" fill={D} opacity="0.3" />
      <rect x="37" y="17" width="4" height="8" rx="2" fill={D} opacity="0.3" />
    </svg>
  );
}

export function UrnaIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* base */}
      <rect x="15" y="40" width="18" height="4" rx="2" fill={D} opacity="0.25" />
      {/* body */}
      <ellipse cx="24" cy="30" rx="11" ry="13" fill={G} />
      <ellipse cx="24" cy="30" rx="8" ry="10" fill={M} />
      {/* neck */}
      <rect x="20" y="16" width="8" height="6" rx="2" fill={G} />
      {/* lid */}
      <ellipse cx="24" cy="16" rx="7" ry="3" fill={D} opacity="0.6" />
      <ellipse cx="24" cy="14" rx="3" ry="2" fill={G} />
      {/* decoration lines */}
      <ellipse cx="24" cy="30" rx="8" ry="2" fill={W} opacity="0.15" />
      <ellipse cx="24" cy="34" rx="7" ry="1.5" fill={W} opacity="0.10" />
    </svg>
  );
}

export function CafeteriaIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* saucer */}
      <ellipse cx="24" cy="38" rx="13" ry="3.5" fill={D} opacity="0.15" />
      {/* cup */}
      <path d="M14 22 L16 36 Q16 38 18 38 H30 Q32 38 32 36 L34 22 Z" fill={G} />
      <path d="M16 24 L17.5 35 Q17.5 36.5 18.5 36.5 H29.5 Q30.5 36.5 30.5 35 L32 24 Z" fill={M} />
      {/* handle */}
      <path d="M34 25 Q40 25 40 30 Q40 35 34 35" stroke={G} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* steam */}
      <path d="M19 19 Q20 16 19 13" stroke={W} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <path d="M24 18 Q25 15 24 12" stroke={W} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <path d="M29 19 Q30 16 29 13" stroke={W} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      {/* rim */}
      <rect x="13" y="21" width="22" height="3" rx="1.5" fill={G} />
    </svg>
  );
}

export function FloresIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* stem */}
      <path d="M24 44 Q24 32 24 26" stroke="#4A7C59" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M24 36 Q20 32 17 33" stroke="#4A7C59" strokeWidth="2" strokeLinecap="round" />
      {/* petals */}
      <ellipse cx="24" cy="18" rx="5" ry="8" fill={M} transform="rotate(0 24 18)" />
      <ellipse cx="24" cy="18" rx="5" ry="8" fill={M} transform="rotate(45 24 18)" opacity="0.85" />
      <ellipse cx="24" cy="18" rx="5" ry="8" fill={G} transform="rotate(90 24 18)" opacity="0.8" />
      <ellipse cx="24" cy="18" rx="5" ry="8" fill={G} transform="rotate(135 24 18)" opacity="0.85" />
      {/* center */}
      <circle cx="24" cy="18" r="5" fill={W} />
      <circle cx="24" cy="18" r="3" fill={M} />
      <circle cx="24" cy="18" r="1.5" fill={D} opacity="0.4" />
    </svg>
  );
}

export function PapeleriaIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* back sheet */}
      <rect x="16" y="8" width="22" height="28" rx="2" fill={D} opacity="0.15" transform="rotate(5 16 8)" />
      {/* main sheet */}
      <rect x="10" y="10" width="22" height="28" rx="2" fill={W} stroke={G} strokeWidth="1.5" />
      {/* fold corner */}
      <path d="M28 10 L32 10 L32 14 Z" fill={G} opacity="0.5" />
      <path d="M28 10 L32 14 L28 14 Z" fill={W} stroke={G} strokeWidth="1" />
      {/* lines */}
      <rect x="14" y="16" width="14" height="1.5" rx="0.75" fill={G} opacity="0.4" />
      <rect x="14" y="20" width="14" height="1.5" rx="0.75" fill={G} opacity="0.4" />
      <rect x="14" y="24" width="10" height="1.5" rx="0.75" fill={G} opacity="0.4" />
      <rect x="14" y="28" width="12" height="1.5" rx="0.75" fill={G} opacity="0.4" />
      {/* ribbon */}
      <path d="M10 34 Q21 38 32 34" stroke={M} strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function LimpiezaIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* bucket */}
      <path d="M14 22 L16 40 Q16 42 18 42 H30 Q32 42 32 40 L34 22 Z" fill={G} />
      <path d="M16 24 L17.5 39 Q17.5 40 18.5 40 H29.5 Q30.5 40 30.5 39 L32 24 Z" fill={M} />
      {/* rim */}
      <rect x="13" y="20" width="22" height="4" rx="2" fill={G} />
      {/* handle arc */}
      <path d="M18 20 Q24 10 30 20" stroke={D} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
      {/* bubbles */}
      <circle cx="22" cy="31" r="3" fill={W} opacity="0.3" />
      <circle cx="28" cy="35" r="2" fill={W} opacity="0.25" />
      <circle cx="25" cy="27" r="1.5" fill={W} opacity="0.3" />
    </svg>
  );
}

export function MobiliarioIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* seat */}
      <rect x="10" y="22" width="28" height="6" rx="3" fill={G} />
      {/* back */}
      <rect x="12" y="10" width="6" height="14" rx="2" fill={M} />
      <rect x="30" y="10" width="6" height="14" rx="2" fill={M} />
      <rect x="12" y="10" width="24" height="8" rx="2" fill={G} />
      {/* legs */}
      <rect x="13" y="28" width="4" height="14" rx="2" fill={D} opacity="0.4" />
      <rect x="31" y="28" width="4" height="14" rx="2" fill={D} opacity="0.4" />
      {/* stretcher */}
      <rect x="13" y="36" width="22" height="2" rx="1" fill={D} opacity="0.2" />
    </svg>
  );
}

export function EquipoVelacionIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* candle body */}
      <rect x="20" y="20" width="8" height="22" rx="2" fill={W} stroke={G} strokeWidth="1.5" />
      {/* wax drips */}
      <path d="M20 28 Q18 29 19 31 L20 31 Z" fill={W} stroke={G} strokeWidth="0.5" />
      <path d="M28 25 Q30 26 29 28 L28 28 Z" fill={W} stroke={G} strokeWidth="0.5" />
      {/* wick */}
      <rect x="23.5" y="16" width="1" height="5" rx="0.5" fill={D} opacity="0.5" />
      {/* flame */}
      <path d="M24 16 Q27 12 25 8 Q22 11 21 14 Q20 17 24 16 Z" fill="#F59E0B" />
      <path d="M24 15 Q26 12.5 24.5 10 Q22.5 12 22.5 14 Q22.5 15.5 24 15 Z" fill="#FBBF24" />
      <circle cx="24" cy="14" r="1.5" fill={W} opacity="0.6" />
      {/* base/stand */}
      <rect x="16" y="41" width="16" height="3" rx="1.5" fill={G} />
      <rect x="18" y="38" width="12" height="4" rx="1" fill={M} />
    </svg>
  );
}

export function PreparacionIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* table */}
      <rect x="6" y="22" width="36" height="4" rx="2" fill={G} />
      <rect x="10" y="26" width="3" height="16" rx="1.5" fill={D} opacity="0.3" />
      <rect x="35" y="26" width="3" height="16" rx="1.5" fill={D} opacity="0.3" />
      {/* person outline */}
      <ellipse cx="24" cy="14" rx="6" ry="6" fill={W} stroke={G} strokeWidth="1.5" />
      <path d="M15 22 Q14 16 24 15 Q34 16 33 22" fill={W} stroke={G} strokeWidth="1.5" />
    </svg>
  );
}

export function TramitesIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* document */}
      <rect x="10" y="6" width="28" height="36" rx="3" fill={W} stroke={G} strokeWidth="1.5" />
      <rect x="10" y="6" width="28" height="8" rx="3" fill={G} />
      {/* stamp circle */}
      <circle cx="24" cy="28" r="10" stroke={G} strokeWidth="2" fill="none" strokeDasharray="3 2" />
      <circle cx="24" cy="28" r="6" fill={G} opacity="0.15" />
      {/* checkmark */}
      <path d="M19 28 L22 32 L30 23" stroke={G} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* header text lines */}
      <rect x="16" y="9" width="16" height="1.5" rx="0.75" fill={W} opacity="0.7" />
    </svg>
  );
}

export function ProveedorExternoIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* building */}
      <rect x="8" y="18" width="32" height="24" rx="2" fill={G} />
      <rect x="10" y="20" width="28" height="20" rx="1" fill={M} />
      {/* roof triangle */}
      <path d="M6 18 L24 6 L42 18 Z" fill={D} opacity="0.5" />
      <path d="M8 18 L24 8 L40 18 Z" fill={G} />
      {/* door */}
      <rect x="20" y="32" width="8" height="10" rx="1" fill={D} opacity="0.4" />
      <circle cx="27" cy="37" r="0.8" fill={W} opacity="0.7" />
      {/* windows */}
      <rect x="12" y="24" width="6" height="5" rx="1" fill={W} opacity="0.4" />
      <rect x="30" y="24" width="6" height="5" rx="1" fill={W} opacity="0.4" />
    </svg>
  );
}

export function VehiculoIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* body */}
      <path d="M4 30 L4 24 L12 18 L36 18 L44 24 L44 30 L44 36 L4 36 Z" fill={G} />
      <path d="M6 30 L6 25 L13 20 L35 20 L42 25 L42 30 Z" fill={M} />
      {/* windows */}
      <path d="M14 20 L12 27 L36 27 L34 20 Z" fill={W} opacity="0.35" />
      {/* wheels */}
      <circle cx="13" cy="36" r="6" fill={D} opacity="0.7" />
      <circle cx="13" cy="36" r="3" fill={W} opacity="0.3" />
      <circle cx="35" cy="36" r="6" fill={D} opacity="0.7" />
      <circle cx="35" cy="36" r="3" fill={W} opacity="0.3" />
      {/* headlight */}
      <circle cx="42" cy="27" r="2" fill="#FBBF24" opacity="0.7" />
      {/* cross on hearse */}
      <rect x="22" y="21" width="4" height="8" rx="1" fill={W} opacity="0.5" />
      <rect x="19" y="24" width="10" height="3" rx="1" fill={W} opacity="0.5" />
    </svg>
  );
}

export function PersonalIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* body */}
      <rect x="15" y="26" width="18" height="18" rx="4" fill={G} />
      {/* tie/shirt detail */}
      <path d="M22 26 L24 32 L26 26 Z" fill={W} opacity="0.4" />
      <rect x="21" y="26" width="6" height="2" rx="1" fill={D} opacity="0.2" />
      {/* head */}
      <circle cx="24" cy="18" r="8" fill={M} />
      <circle cx="24" cy="18" r="6" fill={W} opacity="0.2" />
      {/* face */}
      <ellipse cx="21" cy="17" rx="1.2" ry="1.5" fill={D} opacity="0.5" />
      <ellipse cx="27" cy="17" rx="1.2" ry="1.5" fill={D} opacity="0.5" />
      <path d="M21 21 Q24 23 27 21" stroke={D} strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.4" />
    </svg>
  );
}

export function OtroIcon({ size = 48 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="10" width="28" height="28" rx="6" fill={G} opacity="0.3" stroke={G} strokeWidth="2" />
      <circle cx="24" cy="20" r="3" fill={G} />
      <rect x="22" y="25" width="4" height="10" rx="2" fill={G} />
    </svg>
  );
}

// ─── Map category → sticker component ────────────────────────────────────────
export const CATEGORY_STICKERS: Record<string, (props: IconProps) => JSX.Element> = {
  'Ataúd': AtaudIcon,
  'Urna': UrnaIcon,
  'Cafetería': CafeteriaIcon,
  'Flores': FloresIcon,
  'Papelería': PapeleriaIcon,
  'Limpieza': LimpiezaIcon,
  'Mobiliario': MobiliarioIcon,
  'Equipo de velación': EquipoVelacionIcon,
  'Preparación': PreparacionIcon,
  'Trámites': TramitesIcon,
  'Proveedor externo': ProveedorExternoIcon,
  'Vehículo': VehiculoIcon,
  'Personal': PersonalIcon,
  'Otro': OtroIcon,
};

export function getStickerIcon(category: string): (props: IconProps) => JSX.Element {
  return CATEGORY_STICKERS[category] ?? OtroIcon;
}
