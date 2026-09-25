import os
import time
import hashlib
import psutil
import threading
import re
from urllib.parse import urlparse
from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS
from mock_encryptor import MockEncryptor
from defense_monitor import DefenseMonitor
from backup_system import BackupSystem

app = Flask(__name__)
CORS(app)

class RansomwareDetector:
    def __init__(self):
        self.suspicious_processes = []
        self.file_hashes = {}
        self.file_metadata = {}
        self.monitoring = True
        self.monitor_threads = []

    def calculate_hash(self, file_path):
        try:
            sha = hashlib.sha256()
            with open(file_path, 'rb') as f:
                while True:
                    chunk = f.read(65536)
                    if not chunk:
                        break
                    sha.update(chunk)
            return sha.hexdigest()
        except:
            return None

    def monitor_file_changes(self, directory):
        while self.monitoring:
            try:
                if os.path.exists(directory):
                    current_files = set()
                    for root, _, files in os.walk(directory):
                        for file in files:
                            file_path = os.path.join(root, file)
                            current_files.add(file_path)
                            try:
                                stat = os.stat(file_path)
                                metadata = (stat.st_mtime, stat.st_size)
                            except OSError:
                                continue

                            old_metadata = self.file_met
                            adata.get(file_path)
                            if old_metadata != metadata:
                                self.file_metadata[file_path] = metadata
                                current_hash = self.calculate_hash(file_path)
                                stored_hash = self.file_hashes.get(file_path)
                                if stored_hash and current_hash != stored_hash:
                                    # File content changed since last check
                                    self.file_hashes[file_path] = current_hash
                                elif not stored_hash:
                                    self.file_hashes[file_path] = current_hash

                    # Remove deleted files from tracked metadata and hashes
                    removed_files = set(self.file_metadata) - current_files
                    for removed in removed_files:
                        self.file_metadata.pop(removed, None)
                        self.file_hashes.pop(removed, None)
            except Exception as e:
                print(f"File monitoring error: {str(e)}")
            time.sleep(3)

    def monitor_system_behavior(self):
        while self.monitoring:
            try:
                for proc in psutil.process_iter(['pid', 'name', 'cmdline', 'cpu_percent']):
                    try:
                        cpu = proc.cpu_percent()
                        if cpu and cpu > 60:
                            proc_name = proc.name()
                            pid = proc.pid
                            exists = any(p['pid'] == pid for p in self.suspicious_processes)
                            if not exists:
                                self.suspicious_processes.append({
                                    'pid': pid,
                                    'name': proc_name,
                                    'cpu_usage': cpu,
                                    'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                                })
                                if len(self.suspicious_processes) > 20:
                                    self.suspicious_processes.pop(0)
                    except:
                        continue
            except Exception as e:
                print(f"System monitoring error: {str(e)}")
            time.sleep(2)

    def start_monitoring(self, directory):
        self.stop_monitoring()
        self.monitoring = True
        
        file_monitor = threading.Thread(target=self.monitor_file_changes, args=(directory,))
        system_monitor = threading.Thread(target=self.monitor_system_behavior)
        
        file_monitor.daemon = True
        system_monitor.daemon = True
        
        try:
            file_monitor.start()
            system_monitor.start()
            self.monitor_threads = [file_monitor, system_monitor]
            return True
        except Exception as e:
            print(f"Failed to start monitoring: {str(e)}")
            self.monitoring = False
            return False

    def stop_monitoring(self):
        self.monitoring = False
        for thread in self.monitor_threads:
            if thread.is_alive():
                thread.join(timeout=1)
        self.monitor_threads = []

detector = RansomwareDetector()
simulator = None
defense = None
backup = None
defense_observer = None
auto_remediation_active = True
last_auto_heal_time = None

def auto_remediation_handler(event):
    """Callback function when DefenseMonitor detects honeypot or ransomware activity"""
    global backup, auto_remediation_active, last_auto_heal_time
    if not auto_remediation_active or not backup:
        return
    
    latest_snapshot = backup.get_latest_backup()
    if latest_snapshot:
        print(f"[AUTO-REMEDIATION] Ransomware breach detected ({event['file']})! Restoring latest backup snapshot: {latest_snapshot}")
        success = backup.restore_from_backup(latest_snapshot)
        if success:
            last_auto_heal_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

def analyze_url_threat(raw_url):
    """Deep Threat & Security Inspection for URLs"""
    url = raw_url.strip()
    if not url.startswith('http://') and not url.startswith('https://'):
        url = 'http://' + url

    parsed = urlparse(url)
    domain = parsed.netloc.split(':')[0].lower()
    path = parsed.path.lower()
    scheme = parsed.scheme.lower()
    port = parsed.port or (443 if scheme == 'https' else 80)

    risk_score = 0
    threat_vectors = []
    suspicious_flags = []

    # 1. SSL / Encryption Audit
    is_https = scheme == 'https'
    if not is_https:
        risk_score += 25
        suspicious_flags.append("UNENCRYPTED_HTTP")
        threat_vectors.append({
            "category": "SSL / Encryption",
            "severity": "HIGH",
            "title": "Unencrypted HTTP Connection",
            "detail": "Data is transmitted in cleartext without SSL/TLS encryption. Sensitive data can be intercepted."
        })

    # 2. Suspicious High-Risk TLDs
    high_risk_tlds = ['.xyz', '.top', '.ru', '.cn', '.click', '.link', '.work', '.zip', '.mov', '.cc', '.tk', '.gq', '.cf', '.ml']
    has_high_risk_tld = any(domain.endswith(tld) for tld in high_risk_tlds)
    if has_high_risk_tld:
        risk_score += 30
        suspicious_flags.append("SUSPICIOUS_TLD")
        threat_vectors.append({
            "category": "Domain Reputation",
            "severity": "HIGH",
            "title": "High-Risk Top-Level Domain (TLD)",
            "detail": f"Domain extension ({os.path.splitext(domain)[1]}) is frequently associated with phishing & ransomware malware C2 infrastructure."
        })

    # 3. Direct IP Address Hosting
    is_raw_ip = bool(re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', domain))
    if is_raw_ip:
        risk_score += 35
        suspicious_flags.append("DIRECT_IP_HOSTING")
        threat_vectors.append({
            "category": "Network Infrastructure",
            "severity": "CRITICAL",
            "title": "Direct IP Hosting (No Domain Name)",
            "detail": "URL uses a raw IP address instead of a registered domain name. Typical of ransomware C2 servers & botnet drop points."
        })

    # 4. Phishing Keywords Detection
    phishing_keywords = ['login', 'paypal', 'secure', 'bank', 'verify', 'account', 'update', 'apple', 'binance', 'wallet', 'claim', 'ransom', 'payment', 'support', 'signin']
    found_phish_words = [kw for kw in phishing_keywords if kw in domain or kw in path]
    if found_phish_words:
        risk_score += 30
        suspicious_flags.append("PHISHING_KEYWORDS_MATCHED")
        threat_vectors.append({
            "category": "Phishing & Brand Impersonation",
            "severity": "CRITICAL",
            "title": "Phishing & Brand Impersonation Keywords",
            "detail": f"Contains suspicious phishing keywords ({', '.join(found_phish_words)}) attempting to spoof legitimate services."
        })

    # 5. Executable Malware Dropper Link
    malware_exts = ['.exe', '.scr', '.vbs', '.ps1', '.dll', '.bin', '.sh', '.bat', '.cmd', '.jar']
    has_malware_payload = any(path.endswith(ext) for ext in malware_exts)
    if has_malware_payload:
        risk_score += 40
        suspicious_flags.append("EXECUTABLE_MALWARE_PAYLOAD")
        threat_vectors.append({
            "category": "Malware Dropper",
            "severity": "CRITICAL",
            "title": "Direct Executable Payload Dropper Link",
            "detail": f"URL points directly to an executable file payload ({os.path.splitext(path)[1]}). High probability of ransomware dropper."
        })

    # Cap risk score at 100
    risk_score = min(100, risk_score)

    # Determine Verdict
    if risk_score >= 60:
        verdict = "DANGEROUS MALICIOUS THREAT"
        verdict_color = "CRITICAL"
        action = "BLOCK DOMAIN & DROP PACKETS IMMEDIATELY"
    elif risk_score >= 25:
        verdict = "SUSPICIOUS / HIGH RISK"
        verdict_color = "WARNING"
        action = "ISOLATE IN SANDBOX & DO NOT ENTER CREDENTIALS"
    else:
        verdict = "SAFE & SECURE"
        verdict_color = "SAFE"
        action = "ALLOW CONNECTION — ENCRYPTED & VERIFIED"

    # Simulated Threat Intelligence Blocklist Lookups
    blocklists = [
        {"name": "VirusTotal Threat Engine", "status": "FLAGGED (24/70 Engines)" if risk_score >= 50 else "CLEAN"},
        {"name": "Spamhaus C2 Botnet Blocklist", "status": "LISTED AS C2 NODE" if is_raw_ip or has_malware_payload else "CLEAN"},
        {"name": "PhishTank Database", "status": "VERIFIED PHISHING" if found_phish_words and not is_https else "CLEAN"},
        {"name": "AbuseIPDB Reputation", "status": "HIGH ABUSE CONFIDENCE (98%)" if is_raw_ip else "CLEAN"}
    ]

    return {
        "url": raw_url,
        "parsed_domain": domain,
        "scheme": scheme.upper(),
        "port": port,
        "is_https": is_https,
        "risk_score": risk_score,
        "verdict": verdict,
        "verdict_color": verdict_color,
        "action_recommendation": action,
        "threat_vectors": threat_vectors,
        "suspicious_flags": suspicious_flags,
        "blocklists": blocklists,
        "scanned_at": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }

@app.route('/api/scan-url', methods=['POST'])
def scan_url_endpoint():
    data = request.get_json(silent=True) or {}
    url = data.get('url', '').strip()

    if not url:
        return jsonify({"status": "error", "message": "URL parameter is required"}), 400

    analysis = analyze_url_threat(url)
    return jsonify({"status": "success", "analysis": analysis})

@app.route('/api/start-monitoring', methods=['POST'])
def start_monitoring():
    global simulator, defense, backup, defense_observer, auto_remediation_active
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    test_dir = os.path.join(base_dir, "test_environment")
    backup_dir = os.path.join(base_dir, "backups")
    
    os.makedirs(test_dir, exist_ok=True)
    os.makedirs(backup_dir, exist_ok=True)
    
    if defense_observer:
        try:
            defense_observer.stop()
            defense_observer.join(timeout=1)
        except:
            pass
            
    simulator = MockEncryptor(test_dir)
    simulator.seed_honeypots_and_files()

    backup = BackupSystem(test_dir, backup_dir)
    
    if not backup.get_latest_backup():
        backup.create_backup(tag="Initial Baseline")

    defense = DefenseMonitor(test_dir, auto_remediation_callback=auto_remediation_handler)
    defense.auto_remediation_enabled = auto_remediation_active
    defense_observer = defense.start_monitoring()
    
    detector.start_monitoring(test_dir)
    return jsonify({"status": "success", "message": "RWSA Enterprise Security Monitoring Active"})

@app.route('/api/simulate-attack', methods=['POST'])
def simulate_attack():
    global simulator
    if not simulator:
        return jsonify({"status": "error", "message": "Simulator not initialized"}), 400

    data = request.get_json(silent=True) or {}
    mode = data.get('mode', 'mass')

    if mode == 'honeypot':
        success = simulator.encrypt_honeypots()
        msg = "Targeted Honeypot Tripwire Attack Executed"
    elif mode == 'stealth':
        success = simulator.encrypt_random_file()
        msg = "Stealth Single-File Ransomware Attack Executed"
    else:
        success = simulator.encrypt_directory()
        msg = "Mass Ransomware Encryption Attack Executed"

    return jsonify({
        "status": "success" if success else "warning",
        "message": msg,
        "mode": mode
    })

@app.route('/api/encrypt-file/<filename>', methods=['POST'])
def encrypt_single_file(filename):
    global simulator
    if not simulator:
        return jsonify({"status": "error", "message": "Simulator not initialized"}), 400

    base_dir = os.path.dirname(os.path.abspath(__file__))
    test_dir = os.path.join(base_dir, "test_environment")
    file_path = os.path.join(test_dir, filename)

    if os.path.exists(file_path):
        success = simulator.simulate_encryption(file_path)
        return jsonify({"status": "success" if success else "error", "message": f"Targeted encryption performed on {filename}"})
    return jsonify({"status": "error", "message": "File not found"}), 404

@app.route('/api/delete-file/<filename>', methods=['DELETE'])
def delete_single_file(filename):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    test_dir = os.path.join(base_dir, "test_environment")
    file_path = os.path.join(test_dir, filename)

    if os.path.exists(file_path):
        try:
            os.remove(file_path)
            return jsonify({"status": "success", "message": f"Deleted {filename}"})
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500
    return jsonify({"status": "error", "message": "File not found"}), 404

@app.route('/api/decrypt-attack', methods=['POST'])
def decrypt_attack():
    global simulator
    if simulator:
        success = simulator.decrypt_directory()
        return jsonify({"status": "success" if success else "info", "message": "Decryption operation finished"})
    return jsonify({"status": "error", "message": "Simulator not initialized"}), 400

@app.route('/api/stats', methods=['GET'])
def get_stats():
    global defense, backup, auto_remediation_active, last_auto_heal_time
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    test_dir = os.path.join(base_dir, "test_environment")
    
    total_files = 0
    encrypted_files = 0
    honeypot_files = 0
    honeypots_breached = 0

    if os.path.exists(test_dir):
        for root, _, files in os.walk(test_dir):
            for file in files:
                total_files += 1
                fname = file.lower()
                if file.endswith('.encrypted'):
                    encrypted_files += 1
                if 'decoy' in fname or 'password' in fname or 'financial' in fname or 'client' in fname:
                    honeypot_files += 1
                    if file.endswith('.encrypted'):
                        honeypots_breached += 1

    # Health score calculation
    if total_files == 0:
        health_score = 100
    else:
        healthy_files = max(0, total_files - encrypted_files)
        health_score = int((healthy_files / total_files) * 100)

    # Determine status
    if encrypted_files > 0:
        if honeypots_breached > 0:
            status = "HONEYPOT_TRIPPED"
        else:
            status = "ATTACK_IN_PROGRESS"
    elif last_auto_heal_time:
        status = "SELF_HEALED"
    else:
        status = "SECURE"

    latest_backup = backup.get_latest_backup() if backup else None
    
    cpu_percent = psutil.cpu_percent(interval=None)
    memory_percent = psutil.virtual_memory().percent

    return jsonify({
        "status": status,
        "health_score": health_score,
        "total_files": total_files,
        "encrypted_files": encrypted_files,
        "honeypot_files": honeypot_files,
        "honeypots_breached": honeypots_breached,
        "auto_remediation_active": auto_remediation_active,
        "last_auto_heal_time": last_auto_heal_time,
        "latest_backup": latest_backup.replace('backup_', '') if latest_backup else "None",
        "cpu_usage": round(cpu_percent, 1),
        "memory_usage": round(memory_percent, 1),
        "active_shield": True
    })

@app.route('/api/files', methods=['GET'])
def get_files():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    test_dir = os.path.join(base_dir, "test_environment")
    
    file_list = []
    if os.path.exists(test_dir):
        for root, _, files in os.walk(test_dir):
            for file in files:
                full_path = os.path.join(root, file)
                fname = file.lower()
                is_encrypted = file.endswith('.encrypted')
                is_honeypot = 'decoy' in fname or 'password' in fname or 'financial' in fname or 'client' in fname
                
                preview = ""
                full_content = ""
                try:
                    with open(full_path, 'r', encoding='utf-8', errors='ignore') as f:
                        full_content = f.read(2000)
                        preview = full_content[:150]
                except:
                    preview = "[Binary/Encrypted Data]"
                    full_content = "[Binary / Scrambled Ransomware Payload Data]"

                size_bytes = os.path.getsize(full_path) if os.path.exists(full_path) else 0
                mod_time = datetime.fromtimestamp(os.path.getmtime(full_path)).strftime('%Y-%m-%d %H:%M:%S') if os.path.exists(full_path) else ""
                
                file_hash = ""
                try:
                    with open(full_path, 'rb') as f:
                        file_hash = hashlib.sha256(f.read()).hexdigest()
                except:
                    file_hash = "ERROR_READING_HASH"

                if is_encrypted:
                    status = "ENCRYPTED"
                elif is_honeypot:
                    status = "HONEYPOT"
                else:
                    status = "HEALTHY"

                file_list.append({
                    "name": file,
                    "full_path": full_path,
                    "size_bytes": size_bytes,
                    "status": status,
                    "is_honeypot": is_honeypot,
                    "is_encrypted": is_encrypted,
                    "preview": preview,
                    "full_content": full_content,
                    "hash": file_hash,
                    "modified_at": mod_time
                })

    file_list.sort(key=lambda x: (not x['is_honeypot'], x['name']))
    return jsonify(file_list)

@app.route('/api/create-file', methods=['POST'])
def create_file():
    data = request.get_json() or {}
    filename = data.get('filename', '').strip()
    content = data.get('content', 'Sample corporate data file')

    if not filename:
        return jsonify({"status": "error", "message": "Filename is required"}), 400

    base_dir = os.path.dirname(os.path.abspath(__file__))
    test_dir = os.path.join(base_dir, "test_environment")
    file_path = os.path.join(test_dir, filename)

    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return jsonify({"status": "success", "message": f"Created file {filename}"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/reset-environment', methods=['POST'])
def reset_environment():
    global simulator, backup
    base_dir = os.path.dirname(os.path.abspath(__file__))
    test_dir = os.path.join(base_dir, "test_environment")

    try:
        if os.path.exists(test_dir):
            import shutil
            shutil.rmtree(test_dir)
        os.makedirs(test_dir, exist_ok=True)
        
        if simulator:
            simulator.seed_honeypots_and_files()
        if backup:
            backup.create_backup(tag="Environment Reset Baseline")
            
        return jsonify({"status": "success", "message": "Test environment reset to pristine state with active honeypots"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/defense-logs', methods=['GET'])
def get_defense_logs():
    if defense and hasattr(defense, 'suspicious_activities'):
        return jsonify(defense.suspicious_activities[-25:])
    return jsonify([])

@app.route('/api/toggle-auto-remediation', methods=['POST'])
def toggle_auto_remediation():
    global auto_remediation_active, defense
    auto_remediation_active = not auto_remediation_active
    if defense:
        defense.auto_remediation_enabled = auto_remediation_active
    return jsonify({
        "status": "success",
        "auto_remediation_active": auto_remediation_active,
        "message": f"Autonomous Self-Healing is now {'ENABLED' if auto_remediation_active else 'DISABLED'}"
    })

@app.route('/api/create-backup', methods=['POST'])
def create_backup():
    if backup:
        res = backup.create_backup(tag="Manual Snapshot")
        return jsonify({"status": "success" if res else "error", "backup": res})
    return jsonify({"status": "error", "message": "Backup system not initialized"})

@app.route('/api/backups', methods=['GET'])
def get_backups():
    if backup:
        return jsonify(backup.get_backups_info())
    return jsonify([])

@app.route('/api/restore-backup/<timestamp>', methods=['POST'])
def restore_backup(timestamp):
    if backup:
        success = backup.restore_from_backup(timestamp)
        return jsonify({"status": "success" if success else "error"})
    return jsonify({"status": "error", "message": "Backup system not initialized"})

@app.route('/api/suspicious-processes', methods=['GET'])
def get_suspicious_processes():
    return jsonify(detector.suspicious_processes[-10:])

@app.route('/api/forensic-report', methods=['GET'])
def get_forensic_report():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    test_dir = os.path.join(base_dir, "test_environment")
    
    logs = defense.suspicious_activities if defense else []
    backups_list = backup.get_backups_info() if backup else []
    
    report = {
        "report_id": f"RWSA-FORENSIC-{int(time.time())}",
        "generated_at": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        "system_name": "Ransomware Early Warning & Self-Healing Defense System (RWSA v2.0)",
        "protection_status": "ACTIVE",
        "total_security_events": len(logs),
        "total_snapshots": len(backups_list),
        "auto_remediation_status": "ENABLED" if auto_remediation_active else "DISABLED",
        "honeypot_tripwire_status": "ARMED",
        "recent_incidents": logs[-10:],
        "available_snapshots": backups_list[:5]
    }
    return jsonify(report)

@app.route('/', methods=['GET'])
def index():
    return jsonify({
        "status": "running",
        "system": "RWSA Enterprise Ransomware Defense Platform",
        "version": "2.0.0"
    })

if __name__ == "__main__":
    app.run(debug=False, host='localhost', port=5000, use_reloader=False, ssl_context='adhoc')