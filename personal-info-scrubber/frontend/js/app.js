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
  if (page === 'dashboard') loadDashboard();
  if (page === 'profile') loadProfile();
  if (page === 'brokers') loadBrokers();
  if (page === 'documents') loadDocuments();
  if (page === 'templates') loadTemplates();
  if (page === 'settings') loadSettings();
}

// ---- Dashboard ----
async function loadDashboard() {
  try {
    const [brokerData, jobs, reminders] = await Promise.all([
      api.getBrokers(), api.listJobs(), api.getReminders()
    ]);
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
    renderRemindersCard(reminders);
  } catch (e) {
    toast('Failed to load dashboard: ' + e.message, 'error');
  }
}

function renderRemindersCard(reminders) {
  const card = document.getElementById('reminders-card');
  const content = document.getElementById('reminders-content');
  const total = (reminders.due || []).length + (reminders.recheck || []).length;
  if (!total) { card.classList.add('hidden'); return; }
  card.classList.remove('hidden');
  let html = '';
  if (reminders.due && reminders.due.length) {
    html += `<div class="section-title" style="margin-top:0">Follow-up Needed</div>`;
    html += reminders.due.map(b => `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">
        <div><span style="font-weight:600">${b.name}</span> <span class="text-muted" style="font-size:12px">— submitted ${b.days_ago} days ago, no confirmation yet</span></div>
        <span class="badge badge-submitted">Follow Up</span>
      </div>`).join('');
  }
  if (reminders.recheck && reminders.recheck.length) {
    html += `<div class="section-title">Time to Recheck</div>`;
    html += reminders.recheck.map(b => `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">
        <div><span style="font-weight:600">${b.name}</span> <span class="text-muted" style="font-size:12px">— confirmed ${b.days_ago} days ago</span></div>
        <span class="badge badge-monitoring">Recheck</span>
      </div>`).join('');
  }
  content.innerHTML = html;
}

function renderRecentActivity(brokers) {
  const recent = brokers.filter(b => b.status !== 'not_started')
    .sort((a, b) => (b.submitted_at || '').localeCompare(a.submitted_at || '')).slice(0, 6);
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
    </div>`).join('');
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
  } catch (_) {}
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
    if (search && !b.name.toLowerCase().includes(search)) return false;
    return true;
  });

  const tbody = document.getElementById('broker-tbody');
  if (!filtered.length) {
    tbody.innerHTML = '<tr><td colspan="5"><div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-text">No brokers match your filters</div></div></td></tr>';
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
        <div style="display:flex;gap:5px;flex-wrap:wrap">
          <a href="${b.optout_url}" target="_blank" class="btn btn-sm btn-secondary">Opt-out ↗</a>
          ${b.automated ? `<button class="btn btn-sm btn-accent" onclick="openAutoModal('${b.id}', '${b.name}')">🤖 Automate</button>` : ''}
          <button class="btn btn-sm btn-secondary" onclick="openStatusModal('${b.id}', '${b.name}', '${b.status}', \`${(b.notes || '').replace(/`/g, "'")}\`)">Status</button>
          <button class="btn btn-sm btn-secondary" onclick="openTemplateForBroker('${b.id}')">✉ Template</button>
        </div>
      </td>
    </tr>`).join('');
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

// ---- Automation ----
let _autoTaskId = null;
let _autoPollInterval = null;
let _autoBrokerId = null;

function openAutoModal(brokerId, brokerName) {
  _autoBrokerId = brokerId;
  _autoTaskId = null;
  document.getElementById('auto-modal-broker').textContent = brokerName;
  document.getElementById('auto-task-status').classList.add('hidden');
  document.getElementById('auto-log').innerHTML = '';
  document.getElementById('auto-status-badge').innerHTML = '';
  document.getElementById('auto-modal-info').classList.remove('hidden');
  document.getElementById('auto-start-btn').disabled = false;
  document.getElementById('auto-start-btn').textContent = '▶ Start Automation';
  document.getElementById('automation-modal').classList.remove('hidden');
}

function closeAutoModal() {
  document.getElementById('automation-modal').classList.add('hidden');
  if (_autoPollInterval) { clearInterval(_autoPollInterval); _autoPollInterval = null; }
}

async function startAutomation() {
  const btn = document.getElementById('auto-start-btn');
  btn.disabled = true;
  btn.textContent = 'Starting...';
  document.getElementById('auto-modal-info').classList.add('hidden');
  document.getElementById('auto-task-status').classList.remove('hidden');

  try {
    const result = await api.startAutomation(_autoBrokerId);
    _autoTaskId = result.task_id;
    appendLog('Browser launching — watch for a new window on your screen...');
    _autoPollInterval = setInterval(pollAutomationStatus, 2000);
  } catch (e) {
    toast('Automation failed to start: ' + e.message, 'error');
    btn.disabled = false;
    btn.textContent = '▶ Start Automation';
  }
}

async function pollAutomationStatus() {
  if (!_autoTaskId) return;
  try {
    const task = await api.getTaskStatus(_autoTaskId);
    const log = document.getElementById('auto-log');
    log.innerHTML = task.messages.map(m => `<div><span style="color:var(--muted)">${m.time.slice(11, 19)}</span> ${escHtml(m.msg)}</div>`).join('');
    log.scrollTop = log.scrollHeight;

    const badge_el = document.getElementById('auto-status-badge');
    const statusLabels = {
      pending: '⏳ Starting...',
      running: '🔄 Running',
      waiting: '⌛ Waiting for you to complete CAPTCHA...',
      submitted: '✅ Submitted successfully!',
      error: '❌ Error occurred',
      cancelled: '🚫 Cancelled',
    };
    badge_el.innerHTML = `<span class="badge badge-${task.status === 'submitted' ? 'confirmed' : task.status === 'waiting' ? 'monitoring' : 'submitted'}">${statusLabels[task.status] || task.status}</span>`;

    if (['submitted', 'error', 'cancelled'].includes(task.status)) {
      clearInterval(_autoPollInterval);
      _autoPollInterval = null;
      if (task.status === 'submitted') {
        // Auto-update broker status in DB
        try {
          await api.updateBrokerStatus(_autoBrokerId, 'submitted', 'Submitted via automation');
          toast('Opt-out submitted! Status updated.', 'success');
          await loadBrokers();
        } catch (_) {}
        setTimeout(() => closeAutoModal(), 3000);
      }
    }
  } catch (e) {
    clearInterval(_autoPollInterval);
    _autoPollInterval = null;
  }
}

function appendLog(msg) {
  const log = document.getElementById('auto-log');
  const time = new Date().toISOString().slice(11, 19);
  log.innerHTML += `<div><span style="color:var(--muted)">${time}</span> ${escHtml(msg)}</div>`;
  log.scrollTop = log.scrollHeight;
}

// ---- Documents ----
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
      <div style="display:flex;gap:6px;flex-shrink:0">
        <a href="${api.downloadUrl(j.id)}" class="btn btn-sm btn-success" download>⬇ TXT</a>
        ${j.has_pdf ? `<a href="${api.downloadPdfUrl(j.id)}" class="btn btn-sm btn-success" download>⬇ PDF</a>` : ''}
        <button class="btn btn-sm btn-danger" onclick="deleteJob(${j.id})">Delete</button>
      </div>
    </div>`).join('');
}

function renderSummaryPills(summary) {
  if (!summary || !Object.keys(summary).length) return '';
  return Object.entries(summary).sort((a, b) => b[1] - a[1])
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

function setupDropzone() {
  const zone = document.getElementById('dropzone');
  const input = document.getElementById('file-input');
  zone.addEventListener('click', () => input.click());
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragover'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop', e => {
    e.preventDefault(); zone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  });
  input.addEventListener('change', () => { if (input.files[0]) handleUpload(input.files[0]); });
}

async function handleUpload(file) {
  const result = document.getElementById('upload-result');
  result.innerHTML = '<div class="alert alert-info"><div class="spinner" style="display:inline-block;margin-right:8px"></div> Processing document...</div>';
  try {
    const data = await api.uploadDocument(file);
    if (data.error) { result.innerHTML = `<div class="alert alert-error">⚠ ${data.error}</div>`; return; }
    result.innerHTML = `
      <div class="alert alert-success">✓ Scanned <strong>${file.name}</strong> — found <strong>${data.pii_count}</strong> PII items</div>
      <div class="summary-pills mt-8">${renderSummaryPills(data.summary) || '<span class="text-muted">No PII detected</span>'}</div>
      <div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap">
        <a href="${api.downloadUrl(data.job_id)}" class="btn btn-success" download>⬇ Download Redacted TXT</a>
        ${data.has_pdf ? `<a href="${api.downloadPdfUrl(data.job_id)}" class="btn btn-success" download>⬇ Download Redacted PDF</a>` : ''}
        <button class="btn btn-secondary" onclick="loadDocuments()">Refresh History</button>
      </div>`;
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
  if (!data.segments) { el.textContent = 'No preview available'; return; }
  el.innerHTML = data.segments.map(seg => {
    if (seg.pii) return `<span class="pii-mark" data-label="${seg.label}" title="${seg.label}: ${seg.replacement}">${escHtml(seg.text)}</span>`;
    return escHtml(seg.text);
  }).join('');
}

async function scanText() {
  const input = document.getElementById('scan-input').value;
  if (!input.trim()) { toast('Enter some text to scan', 'error'); return; }
  const btn = document.getElementById('scan-btn');
  btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Scanning...';
  try {
    const data = await api.scanText(input);
    document.getElementById('scan-output').value = data.redacted;
    const sum = document.getElementById('scan-summary');
    if (data.pii_count === 0) {
      sum.innerHTML = '<div class="alert alert-success">✓ No PII detected in this text</div>';
    } else {
      sum.innerHTML = `<div class="alert alert-warning">⚠ Found <strong>${data.pii_count}</strong> PII items — replaced in output</div><div class="summary-pills mt-8">${renderSummaryPills(data.summary)}</div>`;
    }
  } catch (e) {
    toast('Scan failed: ' + e.message, 'error');
  } finally {
    btn.disabled = false; btn.innerHTML = '🔍 Scan &amp; Redact';
  }
}

// ---- Templates ----
let _templates = [];
let _templateBrokers = [];

async function loadTemplates() {
  try {
    const [templates, brokersData] = await Promise.all([api.getTemplates(), api.getBrokers()]);
    _templates = templates;
    _templateBrokers = brokersData.brokers;

    const sel = document.getElementById('tmpl-select');
    sel.innerHTML = templates.map(t => `<option value="${t.id}">${t.icon} ${t.name} — ${t.law}</option>`).join('');

    const bsel = document.getElementById('tmpl-broker-select');
    bsel.innerHTML = '<option value="">— Select broker —</option>' +
      _templateBrokers.map(b => `<option value="${b.id}">${b.name}</option>`).join('');
  } catch (e) {
    toast('Failed to load templates: ' + e.message, 'error');
  }
}

async function generateTemplate() {
  const templateId = document.getElementById('tmpl-select').value;
  const brokerId = document.getElementById('tmpl-broker-select').value;
  const btn = document.getElementById('tmpl-generate-btn');
  btn.disabled = true; btn.textContent = 'Generating...';
  try {
    const result = await api.renderTemplate(templateId, brokerId || null);
    document.getElementById('tmpl-to').value = result.to || '';
    document.getElementById('tmpl-subject').value = result.subject || '';
    document.getElementById('tmpl-body').value = result.body || '';
    document.getElementById('tmpl-result').classList.remove('hidden');
    document.getElementById('tmpl-send-status').textContent = '';
  } catch (e) {
    toast('Error: ' + e.message, 'error');
  } finally {
    btn.disabled = false; btn.textContent = 'Generate ↓';
  }
}

function openTemplateForBroker(brokerId) {
  navigate('templates');
  setTimeout(async () => {
    const bsel = document.getElementById('tmpl-broker-select');
    if (bsel) bsel.value = brokerId;
    await generateTemplate();
  }, 300);
}

async function sendTemplate() {
  const to = document.getElementById('tmpl-to').value;
  const subject = document.getElementById('tmpl-subject').value;
  const body = document.getElementById('tmpl-body').value;
  const status = document.getElementById('tmpl-send-status');

  if (!to) { toast('Enter a "To" email address', 'error'); return; }

  const btn = document.getElementById('tmpl-send-btn');
  btn.disabled = true; btn.textContent = 'Sending...';
  status.textContent = '';

  try {
    await api.sendTemplate(to, subject, body);
    status.textContent = `✓ Sent to ${to}`;
    status.style.color = 'var(--success)';
    toast(`Email sent to ${to}`, 'success');
  } catch (e) {
    status.textContent = `✗ ${e.message}`;
    status.style.color = 'var(--danger)';
    toast('Send failed: ' + e.message, 'error');
  } finally {
    btn.disabled = false; btn.textContent = '⚡ Send via SMTP';
  }
}

function openMailto() {
  const to = document.getElementById('tmpl-to').value;
  const subject = encodeURIComponent(document.getElementById('tmpl-subject').value);
  const body = encodeURIComponent(document.getElementById('tmpl-body').value);
  window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
}

// ---- Settings ----
async function loadSettings() {
  try {
    const [s, reminders] = await Promise.all([api.getSettings(), api.getReminders()]);
    document.getElementById('set-smtp-host').value = s.smtp_host || '';
    document.getElementById('set-smtp-port').value = s.smtp_port || '587';
    document.getElementById('set-smtp-user').value = s.smtp_user || '';
    document.getElementById('set-smtp-pass').value = s.smtp_pass || '';
    document.getElementById('set-reminder-email').value = s.reminder_email || '';
    document.getElementById('set-reminders-enabled').value = s.reminders_enabled || 'false';
    document.getElementById('set-recheck-days').value = s.recheck_interval_days || '90';
    renderRemindersPreview(reminders);
  } catch (e) {
    toast('Failed to load settings: ' + e.message, 'error');
  }
}

async function saveEmailSettings() {
  const btn = document.getElementById('set-save-btn');
  btn.disabled = true;
  try {
    await api.saveSettings({
      smtp_host: document.getElementById('set-smtp-host').value,
      smtp_port: document.getElementById('set-smtp-port').value,
      smtp_user: document.getElementById('set-smtp-user').value,
      smtp_pass: document.getElementById('set-smtp-pass').value,
      reminder_email: document.getElementById('set-reminder-email').value,
    });
    toast('Email settings saved', 'success');
  } catch (e) {
    toast('Error: ' + e.message, 'error');
  } finally {
    btn.disabled = false;
  }
}

async function saveReminderSettings() {
  const btn = document.getElementById('set-save-reminders-btn');
  btn.disabled = true;
  try {
    await api.saveSettings({
      reminders_enabled: document.getElementById('set-reminders-enabled').value,
      recheck_interval_days: document.getElementById('set-recheck-days').value,
    });
    toast('Reminder settings saved', 'success');
  } catch (e) {
    toast('Error: ' + e.message, 'error');
  } finally {
    btn.disabled = false;
  }
}

async function testEmail() {
  const btn = document.getElementById('set-test-btn');
  const status = document.getElementById('set-test-status');
  btn.disabled = true; btn.textContent = 'Sending...';
  status.textContent = '';
  try {
    const r = await api.testEmail();
    status.textContent = `✓ Sent to ${r.sent_to}`;
    status.style.color = 'var(--success)';
    toast('Test email sent!', 'success');
  } catch (e) {
    status.textContent = `✗ ${e.message}`;
    status.style.color = 'var(--danger)';
    toast('Test failed: ' + e.message, 'error');
  } finally {
    btn.disabled = false; btn.textContent = 'Send Test Email';
  }
}

function renderRemindersPreview(reminders) {
  const el = document.getElementById('reminders-preview');
  const total = (reminders.due || []).length + (reminders.recheck || []).length;
  if (!total) {
    el.innerHTML = '<div class="text-muted" style="font-size:13px">No pending reminders — all brokers are on track.</div>';
    return;
  }
  let html = '';
  if (reminders.due && reminders.due.length) {
    html += `<div style="margin-bottom:8px"><strong>Follow-up needed (${reminders.due.length}):</strong></div>`;
    html += reminders.due.map(b => `<div style="padding:5px 0;font-size:13px">• ${b.name} — submitted ${b.days_ago} days ago</div>`).join('');
  }
  if (reminders.recheck && reminders.recheck.length) {
    html += `<div style="margin:12px 0 8px"><strong>Time to recheck (${reminders.recheck.length}):</strong></div>`;
    html += reminders.recheck.map(b => `<div style="padding:5px 0;font-size:13px">• ${b.name} — confirmed ${b.days_ago} days ago</div>`).join('');
  }
  el.innerHTML = html;
}

// ---- Helpers ----
function badge(status) {
  const labels = { not_started: 'Not Started', submitted: 'Submitted', confirmed: 'Confirmed', failed: 'Failed', monitoring: 'Monitoring' };
  return `<span class="badge badge-${status}">${labels[status] || status}</span>`;
}

function capitalize(s) { return s ? s[0].toUpperCase() + s.slice(1) : ''; }

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function escHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  // Nav
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => navigate(item.dataset.page));
  });

  // Profile
  document.getElementById('profile-save-btn').addEventListener('click', saveProfile);

  // Broker filters
  document.getElementById('broker-search').addEventListener('input', renderBrokers);
  document.getElementById('broker-cat-filter').addEventListener('change', renderBrokers);
  document.getElementById('broker-status-filter').addEventListener('change', renderBrokers);

  // Broker status modal
  document.getElementById('modal-save-btn').addEventListener('click', saveBrokerStatus);
  document.getElementById('modal-cancel-btn').addEventListener('click', closeBrokerModal);
  document.getElementById('broker-modal').addEventListener('click', e => { if (e.target === e.currentTarget) closeBrokerModal(); });

  // Reset all
  document.getElementById('reset-all-btn').addEventListener('click', async () => {
    if (!confirm('Reset all broker statuses to "Not Started"?')) return;
    try { await api.resetAll(); toast('All statuses reset', 'info'); loadBrokers(); }
    catch (e) { toast('Error: ' + e.message, 'error'); }
  });

  // Automation modal
  document.getElementById('auto-start-btn').addEventListener('click', startAutomation);
  document.getElementById('auto-cancel-btn').addEventListener('click', closeAutoModal);
  document.getElementById('automation-modal').addEventListener('click', e => { if (e.target === e.currentTarget) closeAutoModal(); });

  // Documents
  document.getElementById('scan-btn').addEventListener('click', scanText);
  document.getElementById('copy-redacted-btn').addEventListener('click', () => {
    navigator.clipboard.writeText(document.getElementById('scan-output').value)
      .then(() => toast('Copied to clipboard', 'success'));
  });
  setupDropzone();

  // Templates
  document.getElementById('tmpl-generate-btn').addEventListener('click', generateTemplate);
  document.getElementById('tmpl-copy-btn').addEventListener('click', () => {
    navigator.clipboard.writeText(document.getElementById('tmpl-body').value)
      .then(() => toast('Body copied', 'success'));
  });
  document.getElementById('tmpl-mailto-btn').addEventListener('click', openMailto);
  document.getElementById('tmpl-send-btn').addEventListener('click', sendTemplate);

  // Settings
  document.getElementById('set-save-btn').addEventListener('click', saveEmailSettings);
  document.getElementById('set-test-btn').addEventListener('click', testEmail);
  document.getElementById('set-save-reminders-btn').addEventListener('click', saveReminderSettings);

  // Add accent button style via JS (btn-accent isn't in CSS yet)
  const style = document.createElement('style');
  style.textContent = `.btn-accent { background: rgba(99,102,241,0.15); color: var(--accent-hover); border: 1px solid rgba(99,102,241,0.3); }
    .btn-accent:hover { background: rgba(99,102,241,0.25); }`;
  document.head.appendChild(style);

  navigate('dashboard');
});
