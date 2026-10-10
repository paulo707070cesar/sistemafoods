import type { Restaurant, UserRole } from '../types';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthSession {
  user: AuthenticatedUser;
  restaurants: Array<Restaurant & { role: UserRole }>;
}

interface AuthResponse extends Partial<AuthSession> {
  status: 'authenticated' | 'unauthenticated' | 'success' | 'error';
  message?: string;
}

async function requestAuth(payload?: Record<string, string>, action = ''): Promise<AuthResponse> {
  const response = await fetch(action ? `/api/auth.php?action=${encodeURIComponent(action)}` : '/api/auth.php', {
    method: payload ? 'POST' : 'GET',
    credentials: 'same-origin',
    headers: payload ? { 'Content-Type': 'application/json' } : undefined,
    body: payload ? JSON.stringify(payload) : undefined
  });
  const body = await response.json().catch(() => ({ status: 'error', message: 'Resposta inválida do servidor.' }));
  if (!response.ok) throw new Error(body.message || 'Não foi possível concluir a autenticação.');
  return body;
}

export async function getSession(): Promise<AuthSession | null> {
  const result = await requestAuth(undefined, 'session');
  return result.status === 'authenticated' && result.user && result.restaurants
    ? { user: result.user, restaurants: result.restaurants }
    : null;
}

export async function login(email: string, password: string): Promise<AuthSession> {
  const result = await requestAuth({ action: 'login', email, password });
  if (result.status !== 'authenticated' || !result.user || !result.restaurants) throw new Error('Sessão não foi criada.');
  return { user: result.user, restaurants: result.restaurants };
}

export async function register(name: string, email: string, password: string, restaurantName: string, restaurantCity: string): Promise<AuthSession> {
  const result = await requestAuth({ action: 'register', name, email, password, restaurant_name: restaurantName, restaurant_city: restaurantCity });
  if (result.status !== 'authenticated' || !result.user || !result.restaurants) throw new Error('Conta não foi criada.');
  return { user: result.user, restaurants: result.restaurants };
}

export async function logout(): Promise<void> {
  await requestAuth({ action: 'logout' });
}
