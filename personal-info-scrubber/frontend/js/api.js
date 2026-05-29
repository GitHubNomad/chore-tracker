const BASE = '';

async function apiFetch(path, opts = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json', ...opts.headers },
    ...opts,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Request failed');
  }
  return res.json();
}

const api = {
  // Profile
  getProfile: () => apiFetch('/api/profile'),
  saveProfile: (data) => apiFetch('/api/profile', { method: 'PUT', body: JSON.stringify(data) }),
  deleteProfile: () => apiFetch('/api/profile', { method: 'DELETE' }),

  // Brokers
  getBrokers: () => apiFetch('/api/brokers'),
  updateBrokerStatus: (id, status, notes) =>
    apiFetch(`/api/brokers/${id}/status`, { method: 'PUT', body: JSON.stringify({ status, notes }) }),
  resetAll: () => apiFetch('/api/brokers/reset-all', { method: 'POST' }),

  // Documents
  listJobs: () => apiFetch('/api/documents'),
  scanText: (text) => apiFetch('/api/documents/scan-text', { method: 'POST', body: JSON.stringify({ text }) }),
  uploadDocument: async (file) => {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch('/api/documents/upload', { method: 'POST', body: form });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || 'Upload failed');
    }
    return res.json();
  },
  getHighlights: (jobId) => apiFetch(`/api/documents/${jobId}/highlights`),
  deleteJob: (jobId) => apiFetch(`/api/documents/${jobId}`, { method: 'DELETE' }),
  downloadUrl: (jobId) => `/api/documents/${jobId}/download`,
};

window.api = api;
