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

export function csrfToken() {
  const pair = document.cookie.split('; ').find(s => s.startsWith('csrftoken='));
  return pair ? decodeURIComponent(pair.split('=').slice(1).join('=')) : '';
}

export async function ensureCsrfToken() {
  if (csrfToken()) return csrfToken();
  // Existing Django login page renders {% csrf_token %} and sets csrftoken cookie.
  const response = await fetch('/user/auth/', { credentials: 'same-origin' });
  if (!response.ok) throw new ApiError('Не удалось получить CSRF cookie', response.status);
  return csrfToken();
}

export async function postDjangoForm(path, fields) {
  const csrf = await ensureCsrfToken();
  const response = await fetch(path, {
    method: 'POST', credentials: 'same-origin',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8', 'X-CSRFToken': csrf },
    body: new URLSearchParams(fields),
  });
  if (!response.ok) throw new ApiError(response.status === 400 ? 'Проверьте данные формы. Возможно, email уже используется или пароль неверен.' : `Ошибка сервера (${response.status})`, response.status);
  // Backend success redirects to /profile/; follow-up route is then served by Vite.
  if (!response.redirected) throw new ApiError('Сервер не подтвердил вход. Проверьте ответ Django.', response.status);
  return true;
}
