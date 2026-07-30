const API_BASE = '/api';

export function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('placement_ready_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const customHeaders = (options.headers as Record<string, string>) || {};

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...customHeaders,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'API Request failed');
  }

  return data as T;
}

export async function uploadFile<T = any>(endpoint: string, formData: FormData): Promise<T> {
  const headers: Record<string, string> = {
    ...getAuthHeader(),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Upload failed');
  }
  return data as T;
}
