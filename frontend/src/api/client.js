const API_PREFIX = (import.meta.env.VITE_API_PREFIX || '/api').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status) { super(message); this.name = 'ApiError'; this.status = status; }
}

export async function request(path, { method = 'GET', body, signal, headers = {}, ...options } = {}) {
  const url = path.startsWith('/') ? path : `${API_PREFIX}/${path}`;
  const response = await fetch(url, {
    method, credentials: 'same-origin', signal,
    headers: { Accept: 'application/json', ...headers },
    ...(body === undefined ? {} : { body }), ...options,
  });
  if (!response.ok) throw new ApiError(`Ошибка сервера (${response.status})`, response.status);
  if (response.status === 204) return null;
  const type = response.headers.get('content-type') || '';
  if (!type.includes('application/json')) throw new ApiError('Сервер вернул не JSON', response.status);
  return response.json();
}

export async function ensureCsrfToken() {
  const response = await fetch('/user/csrf/', { credentials: 'same-origin' });
  if (!response.ok) throw new ApiError('Не удалось получить CSRF-токен', response.status);
  const data = await response.json();
  if (!data.csrfToken) throw new ApiError('CSRF-токен отсутствует', response.status);
  return data.csrfToken;
}

export async function postDjangoForm(path, fields) {
  const csrf = await ensureCsrfToken();
  const response = await fetch(path, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'X-CSRFToken': csrf,
    },
    body: new URLSearchParams(fields),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.ok) {
    const messages = Object.values(data?.errors || {})
      .flatMap(items => items.map(item => item.message || String(item)));
    throw new ApiError(messages.join(' ') || `Ошибка авторизации (${response.status})`, response.status);
  }
  return data;
}

export async function logoutUser() {
  const csrf = await ensureCsrfToken();
  return request('/user/logout/', { method: 'POST', headers: { 'X-CSRFToken': csrf } });
}
