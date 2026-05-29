// ---- Toast ----
function toast(msg, type = 'info') {
  const c = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

// ---- Navigation ----
function navigate(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const el = document.getElementById('page-' + page);
  if (el) el.classList.remove('hidden');
  const nav = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (nav) nav.classList.add('active');
  window._currentPage = page;
  if (page === 'dashboard') loadDashboard();
  if (page === 'profile') loadProfile();
  if (page === 'brokers') loadBrokers();
  if (page === 'documents') loadDocuments();
}

// ---- Dashboard ----
async function loadDashboard() {
  try {
    const [brokerData, jobs] = await Promise.all([api.getBrokers(), api.listJobs()]);
    const s = brokerData.stats;
    document.getElementById('dash-total').textContent = s.total;
    document.getElementById('dash-confirmed').textContent = s.confirmed;
    document.getElementById('dash-submitted').textContent = s.submitted;
    document.getElementById('dash-pending').textContent = s.not_started;
    document.getElementById('dash-docs').textContent = jobs.length;
    const pct = s.total > 0 ? Math.round(((s.confirmed + s.submitted) / s.total) * 100) : 0;
    document.getElementById('dash-progress-fill').style.width = pct + '%';
    document.getElementById('dash-progress-pct').textContent = pct + '%';
    renderRecentActivity(brokerData.brokers);
  } catch (e) {
    toast('Failed to load dashboard: ' + e.message, 'error');
  }
}

function renderRecentActivity(brokers) {
  const recent = brokers
    .filter(b => b.status !== 'not_started')
    .sort((a, b) => (b.submitted_at || '').localeCompare(a.submitted_at || ''))
    .slice(0, 6);
  const el = document.getElementById('recent-activity');
  if (!recent.length) {
    el.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📋</div><div class="empty-state-text">No activity yet</div><div class="empty-state-hint">Start submitting opt-out requests in the Data Brokers tab</div></div>';
    return;
  }
  el.innerHTML = recent.map(b => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)">
      <div>
        <div style="font-weight:600;font-size:13px">${b.name}</div>
        <div style="font-size:11px;color:var(--muted)">${b.submitted_at ? 'Submitted ' + formatDate(b.submitted_at) : ''}</div>
      </div>
      ${badge(b.status)}
    </div>
  `).join('');
}

// ---- Profile ----
async function loadProfile() {
  try {
    const p = await api.getProfile();
    if (p) {
      document.getElementById('profile-name').value = p.full_name || '';
      document.getElementById('profile-aliases').value = p.aliases || '';
      document.getElementById('profile-addresses').value = p.addresses || '';
      document.getElementById('profile-phones').value = p.phones || '';
      document.getElementById('profile-emails').value = p.emails || '';
      document.getElementById('profile-dob').value = p.dob || '';
      document.getElementById('profile-ssn').value = p.ssn_last4 || '';
      document.getElementById('profile-saved-note').classList.remove('hidden');
    }
  } catch (e) { /* no profile yet */ }
}

async function saveProfile() {
  const btn = document.getElementById('profile-save-btn');
  btn.disabled = true;
  try {
    await api.saveProfile({
      full_name: document.getElementById('profile-name').value,
      aliases: document.getElementById('profile-aliases').value,
      addresses: document.getElementById('profile-addresses').value,
      phones: document.getElementById('profile-phones').value,
      emails: document.getElementById('profile-emails').value,
      dob: document.getElementById('profile-dob').value,
      ssn_last4: document.getElementById('profile-ssn').value,
    });
    document.getElementById('profile-saved-note').classList.remove('hidden');
    toast('Profile saved', 'success');
  } catch (e) {
    toast('Error saving profile: ' + e.message, 'error');
  } finally {
    btn.disabled = false;
  }
}

// ---- Brokers ----
let _allBrokers = [];
let _brokerCategories = {};

async function loadBrokers() {
  try {
    const data = await api.getBrokers();
    _allBrokers = data.brokers;
    _brokerCategories = data.categories;
    renderBrokers();
    updateBrokerStats(data.stats);
  } catch (e) {
    toast('Failed to load brokers: ' + e.message, 'error');
  }
}

function renderBrokers() {
  const search = document.getElementById('broker-search').value.toLowerCase();
  const cat = document.getElementById('broker-cat-filter').value;
  const status = document.getElementById('broker-status-filter').value;

  const filtered = _allBrokers.filter(b => {
    if (cat && b.category !== cat) return false;
    if (status && b.status !== status) return false;
    if (search && !b.name.toLowerCase().includes(search) && !b.category.includes(search)) return false;
    return true;
  });

  const tbody = document.getElementById('broker-tbody');
  if (!filtered.length) {
    tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-text">No brokers match your filters</div></div></td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(b => `
    <tr>
      <td>
        <div class="broker-name">${b.name}</div>
        <div class="broker-category">${_brokerCategories[b.category] || b.category}</div>
      </td>
      <td><span class="difficulty-${b.difficulty}" style="font-size:12px;font-weight:600">${capitalize(b.difficulty)}</span></td>
      <td>${badge(b.status)}</td>
      <td style="font-size:12px;color:var(--muted)">${b.turnaround_days}d typical</td>
      <td>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <a href="${b.optout_url}" target="_blank" class="btn btn-sm btn-secondary">Opt-out Page ↗</a>
          <button class="btn btn-sm btn-secondary" onclick="openStatusModal('${b.id}', '${b.name}', '${b.status}', \`${(b.notes || '').replace(/`/g, "'")}\`)">Update Status</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function updateBrokerStats(s) {
  document.getElementById('bs-total').textContent = s.total;
  document.getElementById('bs-not_started').textContent = s.not_started;
  document.getElementById('bs-submitted').textContent = s.submitted;
  document.getElementById('bs-confirmed').textContent = s.confirmed;
  document.getElementById('bs-failed').textContent = s.failed;
}

function openStatusModal(id, name, currentStatus, currentNotes) {
  document.getElementById('modal-broker-name').textContent = name;
  document.getElementById('modal-broker-id').value = id;
  document.getElementById('modal-status-select').value = currentStatus;
  document.getElementById('modal-notes').value = currentNotes || '';
  document.getElementById('broker-modal').classList.remove('hidden');
}

function closeBrokerModal() {
  document.getElementById('broker-modal').classList.add('hidden');
}

async function saveBrokerStatus() {
  const id = document.getElementById('modal-broker-id').value;
  const status = document.getElementById('modal-status-select').value;
  const notes = document.getElementById('modal-notes').value;
  try {
    await api.updateBrokerStatus(id, status, notes);
    closeBrokerModal();
    toast('Status updated', 'success');
    await loadBrokers();
  } catch (e) {
    toast('Error: ' + e.message, 'error');
  }
}

// ---- Documents ----
let _highlightData = null;

async function loadDocuments() {
  try {
    const jobs = await api.listJobs();
    renderJobHistory(jobs);
  } catch (e) {
    toast('Failed to load documents: ' + e.message, 'error');
  }
}

function renderJobHistory(jobs) {
  const el = document.getElementById('job-history');
  if (!jobs.length) {
    el.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📄</div><div class="empty-state-text">No documents scanned yet</div></div>';
    return;
  }
  el.innerHTML = jobs.map(j => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)">
      <div>
        <div style="font-weight:600;font-size:13px">${j.filename}</div>
        <div style="font-size:11px;color:var(--muted)">${formatDate(j.created_at)} · ${j.pii_count} PII items found</div>
        <div style="margin-top:4px">${renderSummaryPills(j.summary)}</div>
      </div>
      <div style="display:flex;gap:6px">
        <a href="${api.downloadUrl(j.id)}" class="btn btn-sm btn-success" download>⬇ Download</a>
        <button class="btn btn-sm btn-danger" onclick="deleteJob(${j.id})">Delete</button>
      </div>
    </div>
  `).join('');
}

function renderSummaryPills(summary) {
  if (!summary || !Object.keys(summary).length) return '';
  return Object.entries(summary)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `<span class="summary-pill"><span>${k}</span><span class="summary-pill-count">${v}</span></span>`)
    .join('');
}

async function deleteJob(id) {
  if (!confirm('Delete this document record?')) return;
  try {
    await api.deleteJob(id);
    toast('Deleted', 'success');
    loadDocuments();
  } catch (e) {
    toast('Error: ' + e.message, 'error');
  }
}

// File upload
function setupDropzone() {
  const zone = document.getElementById('dropzone');
  const input = document.getElementById('file-input');

  zone.addEventListener('click', () => input.click());
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragover'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  });
  input.addEventListener('change', () => {
    if (input.files[0]) handleUpload(input.files[0]);
  });
}

async function handleUpload(file) {
  const result = document.getElementById('upload-result');
  result.innerHTML = '<div class="alert alert-info"><div class="spinner"></div> Processing document...</div>';
  try {
    const data = await api.uploadDocument(file);
    if (data.error) {
      result.innerHTML = `<div class="alert alert-error">⚠ ${data.error}</div>`;
      return;
    }
    let summaryHtml = renderSummaryPills(data.summary);
    result.innerHTML = `
      <div class="alert alert-success">
        ✓ Scanned <strong>${file.name}</strong> — found <strong>${data.pii_count}</strong> PII items
      </div>
      <div class="summary-pills mt-8">${summaryHtml || '<span class="text-muted">No PII detected</span>'}</div>
      <div style="margin-top:14px;display:flex;gap:8px">
        <a href="${api.downloadUrl(data.job_id)}" class="btn btn-success" download>⬇ Download Redacted File</a>
        <button class="btn btn-secondary" onclick="loadDocuments()">Refresh History</button>
      </div>
    `;
    if (data.pii_count > 0) {
      try {
        const highlights = await api.getHighlights(data.job_id);
        renderHighlights(highlights);
      } catch (_) {}
    }
  } catch (e) {
    result.innerHTML = `<div class="alert alert-error">⚠ ${e.message}</div>`;
  }
}

function renderHighlights(data) {
  const el = document.getElementById('highlight-viewer');
  el.classList.remove('hidden');
  document.getElementById('highlight-title').classList.remove('hidden');
  if (!data.segments) {
    el.textContent = 'No preview available';
    return;
  }
  el.innerHTML = data.segments.map(seg => {
    if (seg.pii) {
      return `<span class="pii-mark" data-label="${seg.label}" title="${seg.label}: ${seg.replacement}">${escHtml(seg.text)}</span>`;
    }
    return escHtml(seg.text);
  }).join('');
}

// Text scanner
async function scanText() {
  const input = document.getElementById('scan-input').value;
  if (!input.trim()) { toast('Enter some text to scan', 'error'); return; }
  const btn = document.getElementById('scan-btn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Scanning...';
  try {
    const data = await api.scanText(input);
    document.getElementById('scan-output').value = data.redacted;
    const sum = document.getElementById('scan-summary');
    if (data.pii_count === 0) {
      sum.innerHTML = '<div class="alert alert-success">✓ No PII detected in this text</div>';
    } else {
      sum.innerHTML = `
        <div class="alert alert-warning">⚠ Found <strong>${data.pii_count}</strong> PII items — replaced in output</div>
        <div class="summary-pills mt-8">${renderSummaryPills(data.summary)}</div>
      `;
    }
  } catch (e) {
    toast('Scan failed: ' + e.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '🔍 Scan & Redact';
  }
}

// ---- Helpers ----
function badge(status) {
  const labels = {
    not_started: 'Not Started',
    submitted: 'Submitted',
    confirmed: 'Confirmed',
    failed: 'Failed',
    monitoring: 'Monitoring',
  };
  return `<span class="badge badge-${status}">${labels[status] || status}</span>`;
}

function capitalize(s) { return s ? s[0].toUpperCase() + s.slice(1) : ''; }

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function escHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  // Nav
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => navigate(item.dataset.page));
  });

  // Profile save
  document.getElementById('profile-save-btn').addEventListener('click', saveProfile);

  // Broker filters
  document.getElementById('broker-search').addEventListener('input', renderBrokers);
  document.getElementById('broker-cat-filter').addEventListener('change', renderBrokers);
  document.getElementById('broker-status-filter').addEventListener('change', renderBrokers);

  // Broker modal
  document.getElementById('modal-save-btn').addEventListener('click', saveBrokerStatus);
  document.getElementById('modal-cancel-btn').addEventListener('click', closeBrokerModal);
  document.getElementById('broker-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeBrokerModal();
  });

  // Reset all
  document.getElementById('reset-all-btn').addEventListener('click', async () => {
    if (!confirm('Reset all broker statuses to "Not Started"? This cannot be undone.')) return;
    try {
      await api.resetAll();
      toast('All statuses reset', 'info');
      loadBrokers();
    } catch (e) {
      toast('Error: ' + e.message, 'error');
    }
  });

  // Text scan
  document.getElementById('scan-btn').addEventListener('click', scanText);

  // Copy redacted
  document.getElementById('copy-redacted-btn').addEventListener('click', () => {
    const val = document.getElementById('scan-output').value;
    navigator.clipboard.writeText(val).then(() => toast('Copied to clipboard', 'success'));
  });

  // Dropzone
  setupDropzone();

  // Start on dashboard
  navigate('dashboard');
});
