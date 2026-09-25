# Ransomware Early Warning & Self-Healing Defense System (RWSA) - Frontend

This is the **Cybersecurity Operations Center (SOC) Dashboard** for the RWSA Platform built with React, Lucide Icons, and Recharts.

## Features
- **Real-Time Threat Radar & Telemetry**: Live CPU, memory, and threat index charts.
- **Honeypot Decoy Tripwire Monitor**: Tracks honeypot decoy files and alerts on unauthorized access.
- **File Integrity Matrix**: SHA-256 hash monitoring of target files.
- **Automated Self-Healing & Snapshots**: 1-click snapshot creation and restore.
- **Ransomware Attack Lab**: Safe sandbox attack simulation.
- **Forensic Audit Incident Report Generator**: Exportable incident audit summaries.

## Getting Started
In the `frontend` directory:

```bash
set HTTPS=true
npm start
```
Runs the dashboard at [https://localhost:3000](https://localhost:3000). Accept the browser's local development certificate warning.
