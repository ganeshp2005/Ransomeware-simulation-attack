import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [defenseLogs, setDefenseLogs] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState({});
  const [suspiciousProcesses, setSuspiciousProcesses] = useState([]);
  const [backups, setBackups] = useState([]);

  useEffect(() => {
    // Start monitoring when component mounts
    fetch('http://localhost:5000/api/start-monitoring', {
      method: 'POST'
    });
  }, []);

  const simulateAttack = async () => {
    const response = await fetch('http://localhost:5000/api/simulate-attack', {
      method: 'POST'
    });
    const data = await response.json();
    alert(data.message);
  };

  const createBackup = async () => {
    const response = await fetch('http://localhost:5000/api/create-backup', {
      method: 'POST'
    });
    const data = await response.json();
    alert(data.status === 'success' ? 'Backup created successfully' : 'Backup failed');
    fetchData(); // Replace fetchBackups with fetchData since it already includes fetching backups
  };

  const fetchData = async () => {
    const [logsRes, alertsRes, processesRes, backupsRes] = await Promise.all([
      fetch('http://localhost:5000/api/defense-logs'),
      fetch('http://localhost:5000/api/system-alerts'),
      fetch('http://localhost:5000/api/suspicious-processes'),
      fetch('http://localhost:5000/api/backups')
    ]);

    setDefenseLogs(await logsRes.json());
    setSystemAlerts(await alertsRes.json());
    setSuspiciousProcesses(await processesRes.json());
    setBackups(await backupsRes.json());
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <h1>Ransomware Defense and Detection System</h1>
      
      <div className="controls">
        <button onClick={simulateAttack}>Simulate Attack</button>
        <button onClick={createBackup}>Create Backup</button>
      </div>

      <div className="monitoring-section">
        <h2>Defense Logs</h2>
        <div className="logs">
          {defenseLogs.map((log, index) => (
            <div key={index} className="log-entry">
              <p>Time: {log.timestamp}</p>
              <p>File: {log.file}</p>
              <p>Activity: {log.activity}</p>
            </div>
          ))}
        </div>

        <h2>Suspicious Processes</h2>
        <div className="processes">
          {suspiciousProcesses.map((proc, index) => (
            <div key={index} className="process-entry">
              <p>Process: {proc.name}</p>
              <p>PID: {proc.pid}</p>
              <p>CPU Usage: {proc.cpu_usage}%</p>
              <p>Detected at: {proc.timestamp}</p>
            </div>
          ))}
        </div>

        <h2>Available Backups</h2>
        <div className="backups">
          {backups.map((backup, index) => (
            <div key={index} className="backup-entry">
              <p>{backup}</p>
              <button onClick={() => {
                fetch(`http://localhost:5000/api/restore-backup/${backup}`, {
                  method: 'POST'
                });
              }}>Restore</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
