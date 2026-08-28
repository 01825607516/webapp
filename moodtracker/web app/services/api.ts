 // src/services/api.ts
const API_BASE = 'https://webapp-el84.onrender.com/api';

/* =====================
   🔐 AUTH
===================== */

export const apiLogin = async (email: string, password: string) => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error('Login failed');
  }

  return res.json();
};

export const apiRegister = async (
  name: string,
  email: string,
  password: string
) => {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });

  if (!res.ok) {
    throw new Error('Register failed');
  }

  return res.json();
};

/* =====================
   🔑 TOKEN
===================== */

export const getToken = () => localStorage.getItem('token');

/* =====================
   🔁 JSON API
===================== */

export const api = async (
  url: string,
  method: string = 'GET',
  body?: any
) => {
  const res = await fetch(`${API_BASE}${url}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'API Error');
  }

  return res.json(); // ✅ ONLY JSON
};

/* =====================
   📄 PDF API
===================== */

export const apiDownloadPDF = async (url: string) => {
  const res = await fetch(`${API_BASE}${url}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!res.ok) {
    throw new Error('PDF download failed');
  }

  return res.blob(); // 🔥 IMPORTANT
};
