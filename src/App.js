import React, { useState, useEffect } from 'react';
import './App.css';
import {
  ShieldCheck,
  ShieldAlert,
  Activity,
  FileText,
  Zap,
  RotateCcw,
  Plus,
  Download,
  Lock,
  Unlock,
  HardDrive,
  Terminal,
  Volume2,
  VolumeX,
  RefreshCw,
  Play,
  Flame,
  Radio,
  Shield,
  Cpu,
  Trash2,
  Eye,
  Info,
  Search,
  Globe,
  AlertTriangle,
  Server,
  CheckCircle,
  XCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

function App() {
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [selectedFileModal, setSelectedFileModal] = useState(null);
  
  // Feedback Banner State
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  // Form & Filter States
  const [newFileName, setNewFileName] = useState('');
  const [newFileContent, setNewFileContent] = useState('');
  const [logFilter, setLogFilter] = useState('ALL');
  const [attackProgress, setAttackProgress] = useState(null);

  // URL Threat Scanner States
  const [searchUrl, setSearchUrl] = useState('');
  const [isScanningUrl, setIsScanningUrl] = useState(false);
  const [urlScanResult, setUrlScanResult] = useState(null);

  // Data States
  const [stats, setStats] = useState({
    status: 'SECURE',
    health_score: 100,
    total_files: 0,
    encrypted_files: 0,
    honeypot_files: 0,
    honeypots_breached: 0,
    auto_remediation_active: true,
    last_auto_heal_time: null,
    latest_backup: 'None',
    cpu_usage: 12.4,
    memory_usage: 42.1,
    active_shield: true
  });

  const [files, setFiles] = useState([]);
  const [defenseLogs, setDefenseLogs] = useState([]);
  const [suspiciousProcesses, setSuspiciousProcesses] = useState([]);
  const [backups, setBackups] = useState([]);
  const [forensicReport, setForensicReport] = useState(null);
  const [telemetryHistory, setTelemetryHistory] = useState([]);

  // Toast feedback helper
  const showToast = (message, type = 'info') => {
    setFeedbackMsg({ message, type });
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 4000);
  };

  // Initialize monitoring on mount
  useEffect(() => {
    fetch('http://localhost:5000/api/start-monitoring', { method: 'POST' })
      .catch((err) => console.log('Backend starting error:', err));
  }, []);

  // Main Data Fetcher Loop
  const fetchAllData = async () => {
    try {
      const [statsRes, filesRes, logsRes, procRes, backupsRes] = await Promise.all([
        fetch('http://localhost:5000/api/stats'),
        fetch('http://localhost:5000/api/files'),
        fetch('http://localhost:5000/api/defense-logs'),
        fetch('http://localhost:5000/api/suspicious-processes'),
        fetch('http://localhost:5000/api/backups')
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);

        // Update telemetry chart history
        const nowStr = new Date().toLocaleTimeString();
        setTelemetryHistory((prev) => {
          const updated = [
            ...prev,
            {
              time: nowStr,
              cpu: statsData.cpu_usage || 0,
              health: statsData.health_score || 100,
              encrypted: statsData.encrypted_files || 0
            }
          ];
          return updated.slice(-15);
        });
      }

      if (filesRes.ok) setFiles(await filesRes.json());
      if (logsRes.ok) setDefenseLogs(await logsRes.json());
      if (procRes.ok) setSuspiciousProcesses(await procRes.json());
      if (backupsRes.ok) setBackups(await backupsRes.json());
    } catch (err) {
      console.error('Error fetching security telemetry:', err);
    }
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 1500);
    return () => clearInterval(interval);
  }, []);

  // Play audio alert tone if attack in progress
  useEffect(() => {
    if (isSoundEnabled && (stats.status === 'ATTACK_IN_PROGRESS' || stats.status === 'HONEYPOT_TRIPPED')) {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } catch (e) {}
    }
  }, [stats.status, isSoundEnabled]);

  // Action Handlers
  const handleSimulateAttack = async (mode = 'mass') => {
    setAttackProgress({ percent: 20, step: 'Injecting Ransomware Payload...' });
    try {
      setTimeout(() => setAttackProgress({ percent: 60, step: 'Tampering File Integrity & Hashes...' }), 400);
      
      const res = await fetch('http://localhost:5000/api/simulate-attack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode })
      });
      const data = await res.json();

      setTimeout(() => setAttackProgress({ percent: 100, step: 'Attack Simulation Completed!' }), 800);
      setTimeout(() => setAttackProgress(null), 1800);

      showToast(`🔥 ${data.message}`, 'warning');
      fetchAllData();
    } catch (err) {
      setAttackProgress(null);
      showToast('Error triggering attack simulation: ' + err.message, 'danger');
    }
  };

  const handleDecryptAttack = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/decrypt-attack', { method: 'POST' });
      const data = await res.json();
      showToast(`🔓 ${data.message}`, 'success');
      fetchAllData();
    } catch (err) {
      showToast('Decryption error: ' + err.message, 'danger');
    }
  };

  const handleCreateBackup = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/create-backup', { method: 'POST' });
      const data = await res.json();
      if (data.status === 'success') {
        showToast('⚡ Instant Snapshot Created Successfully!', 'success');
        fetchAllData();
      }
    } catch (err) {
      showToast('Backup failed: ' + err.message, 'danger');
    }
  };

  const handleRestoreBackup = async (timestamp) => {
    try {
      const res = await fetch(`http://localhost:5000/api/restore-backup/${timestamp}`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.status === 'success') {
        showToast(`🔄 Environment Restored from Snapshot: ${timestamp}`, 'success');
        fetchAllData();
      }
    } catch (err) {
      showToast('Restore failed: ' + err.message, 'danger');
    }
  };

  const handleToggleAutoRemediation = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/toggle-auto-remediation', { method: 'POST' });
      const data = await res.json();
      showToast(data.message, data.auto_remediation_active ? 'success' : 'warning');
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetEnv = async () => {
    try {
      await fetch('http://localhost:5000/api/reset-environment', { method: 'POST' });
      showToast('✨ Test Environment & Honeypots Reset to Pristine Baseline', 'success');
      fetchAllData();
    } catch (err) {
      showToast('Reset failed: ' + err.message, 'danger');
    }
  };

  const handleCreateFile = async (e) => {
    e.preventDefault();
    if (!newFileName) return;
    try {
      const res = await fetch('http://localhost:5000/api/create-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: newFileName, content: newFileContent })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setShowCreateModal(false);
        setNewFileName('');
        setNewFileContent('');
        showToast(`➕ File ${newFileName} Created Successfully!`, 'success');
        fetchAllData();
      }
    } catch (err) {
      showToast('Error creating file: ' + err.message, 'danger');
    }
  };

  const handleEncryptSingleFile = async (filename) => {
    try {
      const res = await fetch(`http://localhost:5000/api/encrypt-file/${filename}`, { method: 'POST' });
      const data = await res.json();
      showToast(`🔒 ${data.message}`, 'warning');
      setSelectedFileModal(null);
      fetchAllData();
    } catch (err) {
      showToast('Error encrypting file: ' + err.message, 'danger');
    }
  };

  const handleDeleteSingleFile = async (filename) => {
    try {
      const res = await fetch(`http://localhost:5000/api/delete-file/${filename}`, { method: 'DELETE' });
      const data = await res.json();
      showToast(`🗑️ ${data.message}`, 'info');
      setSelectedFileModal(null);
      fetchAllData();
    } catch (err) {
      showToast('Error deleting file: ' + err.message, 'danger');
    }
  };

  const handleScanUrl = async (urlToScan) => {
    const targetUrl = urlToScan || searchUrl;
    if (!targetUrl.trim()) return;

    setIsScanningUrl(true);
    setUrlScanResult(null);

    try {
      const res = await fetch('http://localhost:5000/api/scan-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setUrlScanResult(data.analysis);
        showToast(`🔍 Security Analysis Complete for ${data.analysis.parsed_domain}`, data.analysis.risk_score > 50 ? 'warning' : 'success');
      }
    } catch (err) {
      showToast('URL Scan error: ' + err.message, 'danger');
    } finally {
      setIsScanningUrl(false);
    }
  };

  const handleFetchForensicReport = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/forensic-report');
      const data = await res.json();
      setForensicReport(data);
      setShowAuditModal(true);
    } catch (err) {
      showToast('Failed to generate report: ' + err.message, 'danger');
    }
  };

  const handleDownloadJSONReport = () => {
    if (!forensicReport) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(forensicReport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${forensicReport.report_id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Helper formatting status badge
  const getStatusBadge = () => {
    if (stats.status === 'ATTACK_IN_PROGRESS') {
      return (
        <div className="status-pill attack">
          <span className="pulse-dot"></span>
          <ShieldAlert size={18} /> CRITICAL RANSOMWARE ATTACK
        </div>
      );
    }
    if (stats.status === 'HONEYPOT_TRIPPED') {
      return (
        <div className="status-pill honeypot">
          <span className="pulse-dot"></span>
          <Flame size={18} /> HONEYPOT TRIPWIRE BREACHED
        </div>
      );
    }
    if (stats.status === 'SELF_HEALED') {
      return (
        <div className="status-pill healed">
          <span className="pulse-dot"></span>
          <Zap size={18} /> AUTO-HEALED FROM SNAPSHOT
        </div>
      );
    }
    return (
      <div className="status-pill secure">
        <span className="pulse-dot"></span>
        <ShieldCheck size={18} /> SHIELD ARMED & SECURE
      </div>
    );
  };

  const filteredLogs = defenseLogs.filter((log) => {
    if (logFilter === 'CRITICAL') return log.severity === 'CRITICAL';
    if (logFilter === 'HONEYPOT') return log.is_honeypot;
    return true;
  });

  return (
    <div className="rwsa-app">
      {/* Toast Feedback Banner */}
      {feedbackMsg && (
        <div className={`toast-banner ${feedbackMsg.type}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Info size={18} />
            <span>{feedbackMsg.message}</span>
          </div>
        </div>
      )}

      {/* Top Header Command Bar */}
      <header className="soc-header">
        <div className="brand-section">
          <div className="brand-icon-wrapper">
            <Shield size={26} />
          </div>
          <div>
            <div className="brand-title">RWSA ENTERPRISE SHIELD</div>
            <div className="brand-subtitle">
              <span>Ransomware Early Warning & Self-Healing Platform</span>
              <span className="brand-badge">v2.0 SOC</span>
            </div>
          </div>
        </div>

        <div className="status-pill-container">
          {getStatusBadge()}
          <button
            className="btn-cyber secondary"
            onClick={() => setIsSoundEnabled(!isSoundEnabled)}
            title={isSoundEnabled ? 'Mute Alert Tones' : 'Unmute Alert Tones'}
          >
            {isSoundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>
      </header>

      {/* Main Navigation Tabs */}
      <nav className="soc-nav">
        <button
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <Activity size={18} /> Threat Radar & Telemetry
        </button>
        <button
          className={`nav-item ${activeTab === 'urlscanner' ? 'active' : ''}`}
          onClick={() => setActiveTab('urlscanner')}
        >
          <Globe size={18} /> URL Security Threat Scanner
        </button>
        <button
          className={`nav-item ${activeTab === 'files' ? 'active' : ''}`}
          onClick={() => setActiveTab('files')}
        >
          <HardDrive size={18} /> File Integrity & Honeypots ({files.length})
        </button>
        <button
          className={`nav-item ${activeTab === 'simulator' ? 'active' : ''}`}
          onClick={() => setActiveTab('simulator')}
        >
          <Flame size={18} /> Ransomware Attack Lab
        </button>
        <button
          className={`nav-item ${activeTab === 'backups' ? 'active' : ''}`}
          onClick={() => setActiveTab('backups')}
        >
          <RotateCcw size={18} /> Snapshots & Auto-Healing ({backups.length})
        </button>
      </nav>

      {/* Quick Action Control Bar */}
      <section className="action-controls-panel">
        <div className="control-buttons-group">
          <button
            className="btn-cyber honeypot"
            onClick={() => handleSimulateAttack('honeypot')}
          >
            <Radio size={16} /> Trip Honeypot Decoy
          </button>
          <button
            className="btn-cyber danger"
            onClick={() => handleSimulateAttack('mass')}
          >
            <Play size={16} /> Launch Mass Ransomware
          </button>
          <button
            className="btn-cyber cyan"
            onClick={handleDecryptAttack}
          >
            <Unlock size={16} /> Direct Decrypt Files
          </button>
          <button
            className="btn-cyber success"
            onClick={handleCreateBackup}
          >
            <Zap size={16} /> Instant Snapshot
          </button>
          <button
            className="btn-cyber secondary"
            onClick={handleResetEnv}
          >
            <RefreshCw size={16} /> Reset Lab
          </button>
        </div>

        <div className="toggle-switch-container">
          <span className="toggle-label">Autonomous Self-Healing</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={stats.auto_remediation_active}
              onChange={handleToggleAutoRemediation}
            />
            <span className="slider"></span>
          </label>
        </div>
      </section>

      {/* Attack Execution Progress Banner */}
      {attackProgress && (
        <div style={{ background: 'rgba(255,42,109,0.1)', border: '1px solid var(--red-alarm)', borderRadius: '12px', padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: '700', fontSize: '0.85rem', color: 'var(--red-alarm)' }}>
            <span>⚡ Attack Payload Progress: {attackProgress.step}</span>
            <span>{attackProgress.percent}%</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${attackProgress.percent}%`, height: '100%', background: 'linear-gradient(90deg, #ff2a6d, #b5179e)', transition: 'width 0.4s' }}></div>
          </div>
        </div>
      )}

      {/* Top 4 Metrics Widgets Grid */}
      <section className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-box green">
            <ShieldCheck size={26} />
          </div>
          <div className="metric-content">
            <div className="metric-label">System Health Index</div>
            <div className="metric-value">{stats.health_score}%</div>
            <div className="metric-subtext">
              {stats.health_score === 100 ? 'All SHA-256 hashes intact' : `${stats.encrypted_files} compromised files`}
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box purple">
            <Radio size={26} />
          </div>
          <div className="metric-content">
            <div className="metric-label">Honeypot Decoy Status</div>
            <div className="metric-value">
              {stats.honeypots_breached > 0 ? `${stats.honeypots_breached} TRIPPED` : `${stats.honeypot_files} Armed`}
            </div>
            <div className="metric-subtext">Early tripwires monitoring target directory</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box cyan">
            <RotateCcw size={26} />
          </div>
          <div className="metric-content">
            <div className="metric-label">Active Snapshots</div>
            <div className="metric-value">{backups.length}</div>
            <div className="metric-subtext">Latest: {stats.latest_backup}</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box red">
            <Activity size={26} />
          </div>
          <div className="metric-content">
            <div className="metric-label">System Load / CPU</div>
            <div className="metric-value">{stats.cpu_usage}%</div>
            <div className="metric-subtext">RAM Usage: {stats.memory_usage}%</div>
          </div>
        </div>
      </section>

      {/* Tab 1: Dashboard & Telemetry */}
      {activeTab === 'dashboard' && (
        <div className="dashboard-grid">
          {/* Main Telemetry & Radar Graph */}
          <div className="panel-card">
            <div className="panel-header">
              <div className="panel-title-box">
                <Activity size={20} color="var(--cyan-accent)" />
                <div className="panel-title">Real-Time Threat & CPU Load Telemetry</div>
              </div>
              <span className="brand-badge">LIVE MONITOR</span>
            </div>

            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={telemetryHistory}>
                  <defs>
                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#00f0ff" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorEncrypted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff2a6d" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#ff2a6d" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#00f0ff',
                      borderRadius: '8px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="cpu"
                    name="CPU %"
                    stroke="#00f0ff"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCpu)"
                  />
                  <Area
                    type="monotone"
                    dataKey="encrypted"
                    name="Encrypted Files"
                    stroke="#ff2a6d"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorEncrypted)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Suspicious Process Monitor */}
            {suspiciousProcesses.length > 0 && (
              <div style={{ marginTop: '0.75rem', background: 'rgba(255,42,109,0.06)', border: '1px solid rgba(255,42,109,0.2)', padding: '0.75rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--red-alarm)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <Cpu size={16} /> Flagged Suspicious High-CPU Processes
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {suspiciousProcesses.slice(-4).map((proc, pIdx) => (
                    <span key={pIdx} className="file-badge encrypted" style={{ fontSize: '0.72rem' }}>
                      PID {proc.pid}: {proc.name} ({proc.cpu_usage}%)
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Audit Export trigger */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button className="btn-cyber cyan" onClick={handleFetchForensicReport}>
                <Download size={16} /> Export Incident Audit Report
              </button>
            </div>
          </div>

          {/* Real-time Defense Log Terminal Stream */}
          <div className="panel-card">
            <div className="panel-header">
              <div className="panel-title-box">
                <Terminal size={20} color="var(--cyan-accent)" />
                <div className="panel-title">Real-Time Threat Stream</div>
              </div>
              
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  className={`btn-cyber secondary ${logFilter === 'ALL' ? 'cyan' : ''}`}
                  style={{ padding: '2px 8px', fontSize: '0.7rem' }}
                  onClick={() => setLogFilter('ALL')}
                >
                  ALL
                </button>
                <button
                  className={`btn-cyber secondary ${logFilter === 'CRITICAL' ? 'danger' : ''}`}
                  style={{ padding: '2px 8px', fontSize: '0.7rem' }}
                  onClick={() => setLogFilter('CRITICAL')}
                >
                  CRITICAL
                </button>
                <button
                  className={`btn-cyber secondary ${logFilter === 'HONEYPOT' ? 'honeypot' : ''}`}
                  style={{ padding: '2px 8px', fontSize: '0.7rem' }}
                  onClick={() => setLogFilter('HONEYPOT')}
                >
                  HONEYPOT
                </button>
              </div>
            </div>

            <div className="log-terminal-container">
              {filteredLogs.length === 0 ? (
                <div className="empty-state">No matching security events found.</div>
              ) : (
                filteredLogs.map((evt, idx) => (
                  <div key={evt.id || idx} className="log-entry-row">
                    <span className="log-time">{evt.timestamp?.split(' ')[1] || ''}</span>
                    <span className={`log-severity ${evt.severity}`}>{evt.severity}</span>
                    <span className="log-message">
                      {evt.is_honeypot && '🚨 '}
                      {evt.details}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* NEW Tab: URL Security Threat Scanner */}
      {activeTab === 'urlscanner' && (
        <div className="panel-card">
          <div className="panel-header">
            <div className="panel-title-box">
              <Globe size={22} color="var(--cyan-accent)" />
              <div className="panel-title">URL Security & Phishing Threat Intelligence Scanner</div>
            </div>
            <span className="brand-badge">THREAT INTEL ENGINE</span>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Enter any domain name or website URL to run deep threat inspection including SSL certificate encryption audit, phishing keyword detection, raw IP hosting, and ransomware C2 dropper analysis.
          </p>

          {/* Search Bar Input Container */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <div style={{ position: 'relative', flexGrow: 1 }}>
              <Globe size={18} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--cyan-accent)' }} />
              <input
                type="text"
                className="input-field"
                style={{ paddingLeft: '2.6rem', fontSize: '0.95rem' }}
                placeholder="Paste or type URL to scan (e.g. http://secure-paypal-login-verify.xyz/login)..."
                value={searchUrl}
                onChange={(e) => setSearchUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleScanUrl()}
              />
            </div>
            <button className="btn-cyber cyan" onClick={() => handleScanUrl()} disabled={isScanningUrl}>
              <Search size={18} /> {isScanningUrl ? 'Scanning...' : 'ANALYZE URL THREAT'}
            </button>
          </div>

          {/* Sample URL Quick Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: '700' }}>1-CLICK SAMPLE TEST CASES:</span>
            <button
              className="btn-cyber success"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
              onClick={() => {
                setSearchUrl('https://github.com/security/enterprise-shield');
                handleScanUrl('https://github.com/security/enterprise-shield');
              }}
            >
              <CheckCircle size={14} /> Safe URL Example
            </button>
            <button
              className="btn-cyber honeypot"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
              onClick={() => {
                setSearchUrl('http://secure-paypal-login-verify.xyz/account/login.php');
                handleScanUrl('http://secure-paypal-login-verify.xyz/account/login.php');
              }}
            >
              <AlertTriangle size={14} /> Phishing Attack Example
            </button>
            <button
              className="btn-cyber danger"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
              onClick={() => {
                setSearchUrl('http://185.220.101.5/malware/lockbit_payload.exe');
                handleScanUrl('http://185.220.101.5/malware/lockbit_payload.exe');
              }}
            >
              <ShieldAlert size={14} /> Ransomware C2 Dropper Example
            </button>
          </div>

          {/* Scanner Analysis Results Output Screen */}
          {urlScanResult && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem', animation: 'fadeIn 0.3s' }}>
              {/* Verdict Header Banner */}
              <div
                style={{
                  background:
                    urlScanResult.risk_score >= 60
                      ? 'rgba(255, 42, 109, 0.12)'
                      : urlScanResult.risk_score >= 25
                      ? 'rgba(255, 183, 3, 0.12)'
                      : 'rgba(0, 255, 157, 0.12)',
                  border: `1px solid ${
                    urlScanResult.risk_score >= 60
                      ? 'var(--red-alarm)'
                      : urlScanResult.risk_score >= 25
                      ? 'var(--amber-warning)'
                      : 'var(--green-shield)'
                  }`,
                  borderRadius: '16px',
                  padding: '1.5rem',
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    {urlScanResult.risk_score >= 60 ? (
                      <XCircle size={28} color="var(--red-alarm)" />
                    ) : urlScanResult.risk_score >= 25 ? (
                      <AlertTriangle size={28} color="var(--amber-warning)" />
                    ) : (
                      <CheckCircle size={28} color="var(--green-shield)" />
                    )}
                    <h3 style={{ fontSize: '1.3rem', fontWeight: '800' }}>
                      {urlScanResult.verdict}
                    </h3>
                  </div>
                  <div style={{ marginTop: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Target URL: <strong style={{ color: 'var(--text-main)' }}>{urlScanResult.url}</strong>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
                    THREAT RISK SCORE
                  </div>
                  <div
                    style={{
                      fontSize: '2.2rem',
                      fontWeight: '800',
                      color:
                        urlScanResult.risk_score >= 60
                          ? 'var(--red-alarm)'
                          : urlScanResult.risk_score >= 25
                          ? 'var(--amber-warning)'
                          : 'var(--green-shield)'
                    }}
                  >
                    {urlScanResult.risk_score} / 100
                  </div>
                </div>
              </div>

              {/* Recommended Action Card */}
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <ShieldAlert size={26} color="var(--cyan-accent)" />
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700' }}>SOC FIREWALL RECOMMENDATION</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--cyan-accent)' }}>
                    {urlScanResult.action_recommendation}
                  </div>
                </div>
              </div>

              {/* Forensic Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
                {/* Panel 1: SSL & Infrastructure */}
                <div className="panel-card" style={{ background: 'rgba(15, 23, 42, 0.6)' }}>
                  <h4 style={{ color: 'var(--cyan-accent)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.92rem' }}>
                    <Server size={18} /> SSL & Protocol Telemetry
                  </h4>
                  <div style={{ fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', color: 'var(--text-muted)' }}>
                    <div><strong>Scheme:</strong> {urlScanResult.scheme}</div>
                    <div><strong>Target Domain:</strong> {urlScanResult.parsed_domain}</div>
                    <div><strong>Port:</strong> {urlScanResult.port}</div>
                    <div>
                      <strong>SSL Encryption:</strong>{' '}
                      <span className={`file-badge ${urlScanResult.is_https ? 'healthy' : 'encrypted'}`}>
                        {urlScanResult.is_https ? 'ENCRYPTED (HTTPS)' : 'UNENCRYPTED (CLEAR-TEXT)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Panel 2: Threat Vectors Identified */}
                <div className="panel-card" style={{ background: 'rgba(15, 23, 42, 0.6)' }}>
                  <h4 style={{ color: 'var(--red-alarm)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.92rem' }}>
                    <ShieldAlert size={18} /> Identified Threat Vectors ({urlScanResult.threat_vectors?.length || 0})
                  </h4>
                  {urlScanResult.threat_vectors?.length === 0 ? (
                    <div style={{ fontSize: '0.82rem', color: 'var(--green-shield)' }}>
                      No malicious threat vectors or phishing flags detected.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {urlScanResult.threat_vectors.map((vec, idx) => (
                        <div key={idx} style={{ background: 'rgba(255,42,109,0.08)', border: '1px solid rgba(255,42,109,0.2)', padding: '0.6rem', borderRadius: '8px' }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--red-alarm)' }}>
                            [{vec.category}] {vec.title}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                            {vec.detail}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Panel 3: Global Threat Feeds & Blocklists */}
                <div className="panel-card" style={{ background: 'rgba(15, 23, 42, 0.6)' }}>
                  <h4 style={{ color: '#e0aaff', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.92rem' }}>
                    <Radio size={18} /> Global Threat Intelligence Blocklists
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {urlScanResult.blocklists?.map((bl, bIdx) => (
                      <div key={bIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', padding: '0.35rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <span style={{ color: 'var(--text-main)' }}>{bl.name}</span>
                        <span className={`file-badge ${bl.status === 'CLEAN' ? 'healthy' : 'encrypted'}`}>
                          {bl.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: File Integrity Matrix & Honeypots */}
      {activeTab === 'files' && (
        <div className="panel-card">
          <div className="panel-header">
            <div className="panel-title-box">
              <HardDrive size={20} color="var(--cyan-accent)" />
              <div className="panel-title">Target Environment File Integrity Explorer</div>
            </div>
            <button className="btn-cyber cyan" onClick={() => setShowCreateModal(true)}>
              <Plus size={16} /> Add Test File
            </button>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            💡 Click on any file card to open the <strong>Interactive File Inspector</strong>, view full contents, inspect SHA-256 hashes, or test single-file encryption!
          </p>

          <div className="file-matrix-grid" style={{ marginTop: '0.5rem' }}>
            {files.map((file, i) => (
              <div
                key={i}
                className={`file-card ${file.is_encrypted ? 'encrypted' : file.is_honeypot ? 'honeypot' : ''}`}
                onClick={() => setSelectedFileModal(file)}
                style={{ cursor: 'pointer' }}
                title="Click to view file details & inspect SHA-256 hash"
              >
                <div className="file-card-header">
                  <div
                    className={`file-icon ${
                      file.is_encrypted ? 'encrypted' : file.is_honeypot ? 'honeypot' : 'healthy'
                    }`}
                  >
                    {file.is_encrypted ? <Lock size={20} /> : file.is_honeypot ? <Radio size={20} /> : <FileText size={20} />}
                  </div>
                  <div className="file-details">
                    <div className="file-name" title={file.name}>
                      {file.name}
                    </div>
                    <span
                      className={`file-badge ${
                        file.is_encrypted ? 'encrypted' : file.is_honeypot ? 'honeypot' : 'healthy'
                      }`}
                    >
                      {file.status}
                    </span>
                  </div>
                </div>

                <div className="file-preview-box">
                  {file.preview || '[Empty File]'}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--cyan-accent)', marginTop: '0.2rem' }}>
                  <span>Inspect Details</span>
                  <Eye size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Ransomware Simulator Lab */}
      {activeTab === 'simulator' && (
        <div className="panel-card">
          <div className="panel-header">
            <div className="panel-title-box">
              <Flame size={20} color="var(--red-alarm)" />
              <div className="panel-title">Safe Ransomware Attack Simulator Lab</div>
            </div>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Safely simulate real-world ransomware attack scenarios inside the controlled sandbox environment.
            Watch the Honeypot tripwires detect encrypted extensions and trigger instantaneous autonomous self-healing.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginTop: '1rem' }}>
            <div className="panel-card" style={{ background: 'rgba(181, 23, 158, 0.08)', borderColor: 'rgba(181, 23, 158, 0.3)' }}>
              <h4 style={{ color: '#e0aaff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Radio size={20} /> Honeypot Decoy Tripwire Attack
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                Simulate targeted tampering of honeypot decoy files (`passwords_decoy.txt`). Tests early warning tripwire detection before mission-critical files are touched.
              </p>
              <button className="btn-cyber honeypot" onClick={() => handleSimulateAttack('honeypot')}>
                <Play size={16} /> Execute Honeypot Attack
              </button>
            </div>

            <div className="panel-card" style={{ background: 'rgba(0, 240, 255, 0.08)', borderColor: 'rgba(0, 240, 255, 0.3)' }}>
              <h4 style={{ color: 'var(--cyan-accent)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Zap size={20} /> Stealth Targeted Attack
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                Simulate a targeted stealth attack against a single random file in the directory. Tests single-file hash tracking and alert response.
              </p>
              <button className="btn-cyber cyan" onClick={() => handleSimulateAttack('stealth')}>
                <Play size={16} /> Execute Stealth Attack
              </button>
            </div>

            <div className="panel-card" style={{ background: 'rgba(255, 42, 109, 0.08)', borderColor: 'rgba(255, 42, 109, 0.3)' }}>
              <h4 style={{ color: 'var(--red-alarm)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Lock size={20} /> Mass Ransomware Encryption
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                Simulate a full-blown ransomware attack that locks all target directory files. Verifies detection speed and automated backup snapshot recovery.
              </p>
              <button className="btn-cyber danger" onClick={() => handleSimulateAttack('mass')}>
                <Play size={16} /> Execute Mass Attack
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Snapshots & Backup Restore */}
      {activeTab === 'backups' && (
        <div className="panel-card">
          <div className="panel-header">
            <div className="panel-title-box">
              <RotateCcw size={20} color="var(--green-shield)" />
              <div className="panel-title">Automated Backup Snapshots & Restore Center</div>
            </div>
            <button className="btn-cyber success" onClick={handleCreateBackup}>
              <Zap size={16} /> Create New Snapshot
            </button>
          </div>

          <table className="backup-table">
            <thead>
              <tr>
                <th>Snapshot Name</th>
                <th>Timestamp</th>
                <th>Files Count</th>
                <th>Size (KB)</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {backups.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-state">No snapshots available. Click 'Create New Snapshot'.</td>
                </tr>
              ) : (
                backups.map((b, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: '700', color: 'var(--cyan-accent)' }}>{b.name}</td>
                    <td>{b.timestamp}</td>
                    <td>{b.file_count} files</td>
                    <td>{b.size_kb} KB</td>
                    <td>
                      <span className="file-badge healthy">HEALTHY</span>
                    </td>
                    <td>
                      <button
                        className="btn-cyber cyan"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                        onClick={() => handleRestoreBackup(b.name)}
                      >
                        <RotateCcw size={14} /> Restore Snapshot
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: File Details Inspector */}
      {selectedFileModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HardDrive size={20} /> File Integrity Inspector: {selectedFileModal.name}
              </div>
              <button className="close-btn" onClick={() => setSelectedFileModal(null)}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: 'rgba(15,23,42,0.8)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.82rem' }}>
                <div style={{ marginBottom: '0.3rem' }}><strong>File Name:</strong> {selectedFileModal.name}</div>
                <div style={{ marginBottom: '0.3rem' }}><strong>Status:</strong> <span className={`file-badge ${selectedFileModal.is_encrypted ? 'encrypted' : selectedFileModal.is_honeypot ? 'honeypot' : 'healthy'}`}>{selectedFileModal.status}</span></div>
                <div style={{ marginBottom: '0.3rem' }}><strong>File Size:</strong> {selectedFileModal.size_bytes} bytes</div>
                <div style={{ marginBottom: '0.3rem' }}><strong>Last Modified:</strong> {selectedFileModal.modified_at}</div>
                <div style={{ wordBreak: 'break-all', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--cyan-accent)', marginTop: '0.4rem' }}>
                  <strong>SHA-256 Hash:</strong><br />{selectedFileModal.hash}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' }}>
                  File Content Preview
                </label>
                <div className="log-terminal-container" style={{ maxHeight: '150px', fontSize: '0.78rem' }}>
                  {selectedFileModal.full_content || '[Empty File]'}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                <button
                  className="btn-cyber danger"
                  onClick={() => handleDeleteSingleFile(selectedFileModal.name)}
                >
                  <Trash2 size={16} /> Delete File
                </button>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {!selectedFileModal.is_encrypted && (
                    <button
                      className="btn-cyber honeypot"
                      onClick={() => handleEncryptSingleFile(selectedFileModal.name)}
                    >
                      <Lock size={16} /> Encrypt This File
                    </button>
                  )}
                  <button className="btn-cyber secondary" onClick={() => setSelectedFileModal(null)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create File */}
      {showCreateModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-title">Create Target Test File</div>
              <button className="close-btn" onClick={() => setShowCreateModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateFile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' }}>
                  File Name (e.g. database_backup.sql, financial.csv)
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="enter_filename.txt"
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' }}>
                  File Content
                </label>
                <textarea
                  className="input-field"
                  value={newFileContent}
                  onChange={(e) => setNewFileContent(e.target.value)}
                  placeholder="Enter sample text content..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn-cyber secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-cyber cyan">
                  Save File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Incident Audit Report */}
      {showAuditModal && forensicReport && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '750px' }}>
            <div className="modal-header">
              <div className="modal-title">Forensic Incident Audit Report</div>
              <button className="close-btn" onClick={() => setShowAuditModal(false)}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '450px', overflowY: 'auto' }}>
              <div style={{ background: 'rgba(0,240,255,0.06)', border: '1px solid rgba(0,240,255,0.2)', padding: '1rem', borderRadius: '10px' }}>
                <div><strong>Report ID:</strong> {forensicReport.report_id}</div>
                <div><strong>Generated At:</strong> {forensicReport.generated_at}</div>
                <div><strong>System:</strong> {forensicReport.system_name}</div>
                <div><strong>Auto-Remediation:</strong> {forensicReport.auto_remediation_status}</div>
                <div><strong>Decoy Honeypots:</strong> {forensicReport.honeypot_tripwire_status}</div>
              </div>

              <h4 style={{ color: 'var(--cyan-accent)' }}>Recent Security Events ({forensicReport.recent_incidents?.length || 0})</h4>
              <div className="log-terminal-container" style={{ maxHeight: '200px' }}>
                {forensicReport.recent_incidents?.map((inc, i) => (
                  <div key={i} className="log-entry-row">
                    <span className="log-time">{inc.timestamp}</span>
                    <span className={`log-severity ${inc.severity}`}>{inc.severity}</span>
                    <span className="log-message">{inc.details}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button className="btn-cyber cyan" onClick={handleDownloadJSONReport}>
                <Download size={16} /> Download JSON Audit Data
              </button>
              <button className="btn-cyber success" onClick={() => window.print()}>
                <Download size={16} /> Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
