// Public Supabase project credentials (anon key — safe to include in client code)
const PROJECT_ID = 'aanrqjahclwekpspmwgr';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhbnJxamFoY2x3ZWtwc3Btd2dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxNzc4OTEsImV4cCI6MjEwNTc1Mzg5MX0.H0PrgF9PkyEkLryFHLHMdWVjNIgcZlE6mplCXhBrP7o';

const BASE = `https://${PROJECT_ID}.supabase.co/functions/v1/make-server-3d41960e`;

const HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${ANON_KEY}`,
};

export async function getData<T>(entity: string): Promise<T | null> {
  const res = await fetch(`${BASE}/data/${entity}`, { headers: HEADERS });
  if (!res.ok) throw new Error(`GET ${entity} failed: ${res.status}`);
  const json = await res.json();
  return json.data as T | null;
}

export async function setData<T>(entity: string, data: T): Promise<void> {
  const res = await fetch(`${BASE}/data/${entity}`, {
    method: 'PUT',
    headers: HEADERS,
    body: JSON.stringify({ data }),
  });
  if (!res.ok) throw new Error(`PUT ${entity} failed: ${res.status}`);
}
