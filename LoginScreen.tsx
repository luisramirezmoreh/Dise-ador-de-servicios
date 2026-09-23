import { useState } from 'react';
import logoImg from '../assets/logo.png';

const VALID_USER = 'Capillas Moreh';
const VALID_PASS = 'M0r3hF0v35%2026';
const STORAGE_KEY = 'moreh_auth';

export function isAuthenticated(): boolean {
  return localStorage.getItem(STORAGE_KEY) === '1';
}

interface Props { onLogin: () => void; }

export default function LoginScreen({ onLogin }: Props) {
  const [user, setUser]   = useState('');
  const [pass, setPass]   = useState('');
  const [error, setError] = useState(false);
  const [showPass, setShowPass] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (user.trim() === VALID_USER && pass === VALID_PASS) {
      localStorage.setItem(STORAGE_KEY, '1');
      onLogin();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2500);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: 'linear-gradient(145deg, #1A0E16 0%, #2D1422 50%, #1A0E16 100%)',
        minHeight: '100vh',
      }}
    >
      {/* Card */}
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ background: '#FFFFFF', boxShadow: '0 24px 64px rgba(0,0,0,0.45)' }}
      >
        {/* Top burgundy stripe */}
        <div style={{ height: 6, background: '#8B1A4A' }} />

        <div className="px-10 py-10">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img
              src={logoImg}
              alt="Capillas Moreh"
              style={{ width: 200, height: 'auto', objectFit: 'contain' }}
              draggable={false}
            />
          </div>

          <p className="text-center text-sm mb-8" style={{ color: '#8A6070' }}>
            Sistema de diseño de servicios — acceso restringido
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5"
                style={{ color: '#4A2030' }}>
                Usuario
              </label>
              <input
                type="text"
                value={user}
                onChange={e => setUser(e.target.value)}
                placeholder="Nombre de usuario"
                autoComplete="username"
                className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-all"
                style={{
                  border: `1.5px solid ${error ? '#C0392B' : '#E0CDD6'}`,
                  background: '#FAF5F7',
                  color: '#1A0E16',
                  fontFamily: 'var(--font-sans)',
                }}
                onFocus={e => { e.target.style.borderColor = '#8B1A4A'; }}
                onBlur={e => { e.target.style.borderColor = error ? '#C0392B' : '#E0CDD6'; }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5"
                style={{ color: '#4A2030' }}>
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={pass}
                  onChange={e => setPass(e.target.value)}
                  placeholder="Contraseña"
                  autoComplete="current-password"
                  className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-all pr-12"
                  style={{
                    border: `1.5px solid ${error ? '#C0392B' : '#E0CDD6'}`,
                    background: '#FAF5F7',
                    color: '#1A0E16',
                    fontFamily: 'var(--font-sans)',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#8B1A4A'; }}
                  onBlur={e => { e.target.style.borderColor = error ? '#C0392B' : '#E0CDD6'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                  style={{ color: '#8A6070' }}
                  tabIndex={-1}
                >
                  {showPass ? 'Ocultar' : 'Ver'}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-center rounded-lg px-4 py-2"
                style={{ background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA' }}>
                Usuario o contraseña incorrectos
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-lg text-sm font-semibold mt-2 transition-all"
              style={{ background: '#8B1A4A', color: 'white' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#731539'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#8B1A4A'; }}
            >
              Ingresar
            </button>
          </form>
        </div>

        {/* Bottom stripe */}
        <div style={{ height: 4, background: 'linear-gradient(90deg, #8B1A4A, #A8245C)' }} />
      </div>
    </div>
  );
}
