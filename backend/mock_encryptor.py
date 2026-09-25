import os
import logging
import base64
import random

class MockEncryptor:
    def __init__(self, target_dir="./test_environment"):
        self.target_dir = os.path.abspath(target_dir)
        self.setup_logging()
        self.seed_honeypots_and_files()

    def setup_logging(self):
        """Initialize logging configuration"""
        log_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'simulation.log')
        logging.basicConfig(
            filename=log_file,
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            filemode='a'
        )

    def seed_honeypots_and_files(self):
        """Populate target directory with sample files and honeypots if empty"""
        os.makedirs(self.target_dir, exist_ok=True)

        sample_files = {
            # Honeypot Decoys (Tripwires)
            "passwords_decoy.txt": "[HONEYPOT DECOY] root_pass=P@ssw0rd2026! db_admin=SuperSecret123",
            "financial_q3_report.xlsx": "[HONEYPOT DECOY] Financial Ledger Q3 2026 - Total Revenue: $4,500,000",
            "client_database.sql": "[HONEYPOT DECOY] CREATE TABLE clients (id INT, name VARCHAR(100), ssn VARCHAR(11));",
            
            # Mission Critical Files
            "executive_strategy.docx": "CONFIDENTIAL: 2026 Expansion & Acquisition Plan for RWSA Corp.",
            "employee_payroll.csv": "EmpID, Name, Department, Salary\n101, Alice Vance, Security, $145000\n102, Bob Miller, Operations, $120000",
            "system_config.json": '{\n  "environment": "production",\n  "encryption_enabled": true,\n  "firewall_active": true\n}',
            "network_topology.diagram": "VLAN-10 -> Firewall Gateway -> Core Switch -> Database Cluster"
        }

        for filename, content in sample_files.items():
            file_path = os.path.join(self.target_dir, filename)
            # Only create if neither original nor encrypted version exists
            if not os.path.exists(file_path) and not os.path.exists(file_path + '.encrypted'):
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                logging.info(f"Created sample file: {filename}")

    def simulate_encryption(self, file_path):
        """Simulate encrypting a single file safely (bypasses AV)"""
        if file_path.endswith('.encrypted'):
            return False
            
        try:
            with open(file_path, 'rb') as f:
                data = f.read()
            
            # Simple base64 encoding with ransomware banner to simulate payload
            scrambled_data = b"=== LOCKED BY RWSA-SIMULATED-RANSOMWARE ===\n" + base64.b64encode(data)
            
            with open(file_path + '.encrypted', 'wb') as f:
                f.write(scrambled_data)
                
            os.remove(file_path)
            logging.info(f"Simulated encryption completed on: {file_path}")
            return True
        except Exception as e:
            logging.error(f"Failed to encrypt {file_path}: {str(e)}")
            return False

    def simulate_decryption(self, file_path):
        """Simulate decrypting a single file"""
        if not file_path.endswith('.encrypted'):
            return False
            
        try:
            with open(file_path, 'rb') as f:
                scrambled_data = f.read()
                
            prefix = b"=== LOCKED BY RWSA-SIMULATED-RANSOMWARE ===\n"
            if scrambled_data.startswith(prefix):
                scrambled_data = scrambled_data[len(prefix):]
                
            # Decode the base64 data
            original_data = base64.b64decode(scrambled_data)
            
            original_file_path = file_path[:-10]  # Remove '.encrypted'
            with open(original_file_path, 'wb') as f:
                f.write(original_data)
                
            os.remove(file_path)
            logging.info(f"Successfully decrypted: {original_file_path}")
            return True
        except Exception as e:
            logging.error(f"Failed to decrypt {file_path}: {str(e)}")
            return False

    def encrypt_directory(self):
        """Encrypt all unencrypted files in target directory"""
        encrypted_count = 0
        try:
            for root, _, files in os.walk(self.target_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    if not file.endswith('.encrypted'):
                        if self.simulate_encryption(file_path):
                            encrypted_count += 1
            return encrypted_count > 0
        except Exception as e:
            logging.error(f"Directory encryption failed: {str(e)}")
            return False

    def encrypt_honeypots(self):
        """Target only honeypot decoy files to trigger early tripwire response"""
        encrypted_count = 0
        try:
            for root, _, files in os.walk(self.target_dir):
                for file in files:
                    if 'decoy' in file.lower() or 'passwords' in file.lower() or 'financial' in file.lower() or 'client' in file.lower():
                        file_path = os.path.join(root, file)
                        if not file.endswith('.encrypted'):
                            if self.simulate_encryption(file_path):
                                encrypted_count += 1
            return encrypted_count > 0
        except Exception as e:
            logging.error(f"Honeypot encryption failed: {str(e)}")
            return False

    def encrypt_random_file(self):
        """Target a single random file to simulate stealth targeted attack"""
        try:
            candidates = []
            for root, _, files in os.walk(self.target_dir):
                for file in files:
                    if not file.endswith('.encrypted'):
                        candidates.append(os.path.join(root, file))
            if candidates:
                target = random.choice(candidates)
                return self.simulate_encryption(target)
            return False
        except Exception as e:
            logging.error(f"Stealth encryption failed: {str(e)}")
            return False

    def decrypt_directory(self):
        """Decrypt all encrypted files in the target directory"""
        try:
            decrypted_count = 0
            for root, _, files in os.walk(self.target_dir):
                for file in files:
                    if file.endswith('.encrypted'):
                        file_path = os.path.join(root, file)
                        if self.simulate_decryption(file_path):
                            decrypted_count += 1
            return decrypted_count > 0
        except Exception as e:
            logging.error(f"Directory decryption failed: {str(e)}")
            return False
