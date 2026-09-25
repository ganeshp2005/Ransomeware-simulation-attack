# 🛡️ RWSA Enterprise - Ransomware Early Warning & Self-Healing Defense System

> **Enterprise-grade Cybersecurity Operations Center (SOC) web application designed to detect, isolate, and automatically self-heal from ransomware attacks in real time.**

---

## 🌟 Key Features

1. **🔒 Next-Gen Cybersecurity SOC Dashboard**
   - Sleek dark cyberpunk interface with glassmorphism panels, glowing alert pills, and live system meters.
   - Real-time telemetry graphs displaying CPU load, memory utilization, and encrypted file counts.

2. **🍯 Honeypot Decoy Tripwire Engine**
   - Deploys decoy files (`passwords_decoy.txt`, `financial_records.xlsx`) as early-warning tripwires.
   - Triggers high-priority alerts and autonomous self-healing within milliseconds of honeypot tampering.

3. **⚡ Autonomous Self-Healing (Auto-Remediation)**
   - Automatically kills malicious processes and restores target files from clean baseline snapshots upon threat detection.

4. **📁 Interactive File Integrity Explorer**
   - Live grid view of target files showing status (`HEALTHY`, `ENCRYPTED`, `HONEYPOT_TRIPPED`), file size, SHA-256 integrity hash, and preview snippets.

5. **🧪 Safe Ransomware Attack Simulator Lab**
   - Execute safe sandbox attacks (`Mass Ransomware Encryption`, `Honeypot Tripwire Attack`) or simulate direct decryption key unlock.

6. **📄 Forensic Security Audit Generator**
   - 1-Click exportable Incident Audit Report containing security event logs, threat severity classifications, and snapshot verification data.

---

## 🏗️ System Architecture

```
                               +----------------------------------+
                               |    RWSA Cybersecurity SOC UI     |
                               | (React + Recharts + Lucide Icons)|
                               +-----------------+----------------+
                                                 | (REST API / 1.5s Polling)
                                                 v
                               +-----------------+----------------+
                               |     Python Flask Backend API     |
                               |           (main.py)              |
                               +--------+----------------+-------+
                                        |                |
             +--------------------------+                +--------------------------+
             |                                                                      |
             v                                                                      v
+------------+------------+                                            +------------+------------+
|     DefenseMonitor      |                                            |      BackupSystem       |
|  (Watchdog File System  |                                            | (Automated Baseline     |
|   Integrity & Honeypot) |                                            |  Snapshot & Restoration)|
+------------+------------+                                            +------------+------------+
             |                                                                      |
             +----------------------------------+-----------------------------------+
                                                |
                                                v
                               +----------------+-----------------+
                               |    Target Environment Directory  |
                               |    (test_environment/ & Decoys)  |
                               +----------------------------------+
```

---

## ⚡ Quick Start Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+ & npm

### 1-Click Launch (Windows)
Double-click `start_all.bat` or run:
```cmd
start_all.bat
```
Open the dashboard at `https://localhost:3000` and accept the browser's local development certificate warning. The backend API uses `https://localhost:5000`.

### Manual Launch

#### 1. Backend Server
```bash
cd backend
pip install -r requirements.txt
python main.py
```
*Backend runs on `https://localhost:5000` with a temporary development certificate.

#### 2. Frontend SOC Dashboard
```bash
cd frontend
npm install
npm start
```
*Frontend runs on `https://localhost:3000`.

---

## 📡 REST API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/stats` | `GET` | System health index, encrypted file count, CPU load, and shield status |
| `/api/files` | `GET` | List of target environment files with status & preview |
| `/api/simulate-attack` | `POST` | Execute sandbox attack (`mass` or `honeypot` mode) |
| `/api/decrypt-attack` | `POST` | Simulate direct file decryption |
| `/api/start-monitoring` | `POST` | Start watchdog monitoring & honeypot tripwires |
| `/api/create-backup` | `POST` | Create timestamped baseline snapshot |
| `/api/backups` | `GET` | Retrieve list of snapshots with file count & size |
| `/api/restore-backup/<timestamp>` | `POST` | Restore target directory from snapshot |
| `/api/toggle-auto-remediation` | `POST` | Toggle autonomous self-healing mode |
| `/api/forensic-report` | `GET` | Generate forensic incident audit report |

---

## 🛡️ License
Released under the MIT License.
