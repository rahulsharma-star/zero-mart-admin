import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

export const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('zero_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  const lang = localStorage.getItem('zero_admin_lang') || 'en';
  config.headers['x-lang'] = lang;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('zero_admin_token');
      if (!location.pathname.includes('/login')) location.href = '/login';
    }
    return Promise.reject(err);
  }
);

/** Unwraps the API success envelope: { success, message, data }. */
export function unwrap<T = any>(res: { data: { data: T } }): T {
  return res.data.data;
}

export function errMsg(err: any): string {
  return err?.response?.data?.message || err?.message || 'Error';
}
