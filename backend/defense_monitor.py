import time
from datetime import datetime
import logging
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import hashlib
import os

class DefenseMonitor(FileSystemEventHandler):
    def __init__(self, protected_dir, auto_remediation_callback=None):
        self.protected_dir = os.path.abspath(protected_dir)
        self.file_hashes = {}
        self.suspicious_activities = []
        self.auto_remediation_callback = auto_remediation_callback
        self.auto_remediation_enabled = True
        self.setup_logging()
        self.initialize_file_hashes()

    def setup_logging(self):
        log_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'defense.log')
        logging.basicConfig(
            filename=log_file,
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )

    def initialize_file_hashes(self):
        self.file_hashes.clear()
        if os.path.exists(self.protected_dir):
            for root, _, files in os.walk(self.protected_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    self.file_hashes[file_path] = self.calculate_file_hash(file_path)

    def calculate_file_hash(self, file_path):
        try:
            with open(file_path, 'rb') as f:
                return hashlib.sha256(f.read()).hexdigest()
        except:
            return None

    def record_activity(self, file_path, activity_type, severity="MEDIUM", details=""):
        file_name = os.path.basename(file_path)
        is_honeypot = "decoy" in file_name.lower() or "password" in file_name.lower() or "financial" in file_name.lower()
        
        if is_honeypot:
            severity = "CRITICAL"
            details = "[HONEYPOT TRIPWIRE BREACHED] Ransomware decoy file modified!"

        event = {
            'id': f"EVT-{int(time.time() * 1000)}",
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'file': file_name,
            'full_path': file_path,
            'activity': activity_type,
            'severity': severity,
            'is_honeypot': is_honeypot,
            'details': details or f"Detected {activity_type} on {file_name}"
        }
        
        self.suspicious_activities.append(event)
        # Keep last 100 entries
        if len(self.suspicious_activities) > 100:
            self.suspicious_activities.pop(0)

        logging.warning(f"[{severity}] Defense Alert: {event['details']} ({file_name})")

        # Trigger auto-remediation if critical honeypot tripwire or ransomware extension detected
        if self.auto_remediation_enabled and (is_honeypot or file_path.endswith('.encrypted')):
            if self.auto_remediation_callback:
                logging.info(f"Auto-remediation triggered for {file_name}")
                self.auto_remediation_callback(event)

    def on_created(self, event):
        if not event.is_directory:
            if event.src_path.endswith('.encrypted'):
                self.record_activity(
                    event.src_path, 
                    'Ransomware File Created', 
                    severity='HIGH',
                    details='Encrypted file payload detected'
                )
            else:
                self.file_hashes[event.src_path] = self.calculate_file_hash(event.src_path)

    def on_deleted(self, event):
        if not event.is_directory:
            if event.src_path in self.file_hashes:
                del self.file_hashes[event.src_path]
            self.record_activity(
                event.src_path, 
                'File Deleted / Renamed', 
                severity='MEDIUM',
                details='File removed or encrypted by external process'
            )

    def on_modified(self, event):
        if not event.is_directory:
            new_hash = self.calculate_file_hash(event.src_path)
            old_hash = self.file_hashes.get(event.src_path)

            if old_hash and new_hash != old_hash:
                self.file_hashes[event.src_path] = new_hash
                self.record_activity(
                    event.src_path, 
                    'Suspicious Content Alteration', 
                    severity='HIGH',
                    details='SHA-256 integrity hash mismatch detected'
                )

    def start_monitoring(self):
        observer = Observer()
        observer.schedule(self, self.protected_dir, recursive=True)
        observer.start()
        return observer