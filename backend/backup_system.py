import os
import shutil
import time
import logging
from datetime import datetime

class BackupSystem:
    def __init__(self, source_dir, backup_dir):
        self.source_dir = os.path.abspath(source_dir)
        self.backup_dir = os.path.abspath(backup_dir)
        self.setup_logging()
        os.makedirs(self.backup_dir, exist_ok=True)

    def setup_logging(self):
        log_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backup.log')
        logging.basicConfig(
            filename=log_file,
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )

    def create_backup(self, tag="Automated"):
        try:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            backup_folder_name = f'backup_{timestamp}'
            backup_path = os.path.join(self.backup_dir, backup_folder_name)
            
            # Clean source directory of any .encrypted files before creating baseline backup if requested
            if os.path.exists(backup_path):
                shutil.rmtree(backup_path)

            shutil.copytree(self.source_dir, backup_path)
            logging.info(f"Backup created successfully: {backup_path} ({tag})")
            return {
                "name": backup_folder_name,
                "timestamp": timestamp,
                "created_at": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                "tag": tag,
                "path": backup_path
            }
        except Exception as e:
            logging.error(f"Backup creation failed: {str(e)}")
            return None

    def get_latest_backup(self):
        try:
            if not os.path.exists(self.backup_dir):
                return None
            entries = os.listdir(self.backup_dir)
            backups = [e for e in entries if os.path.isdir(os.path.join(self.backup_dir, e))]
            if not backups:
                return None
            backups.sort(reverse=True)
            return backups[0]
        except Exception as e:
            logging.error(f"Error fetching latest backup: {str(e)}")
            return None

    def get_backups_info(self):
        result = []
        try:
            if not os.path.exists(self.backup_dir):
                return result
            entries = os.listdir(self.backup_dir)
            for entry in entries:
                full_path = os.path.join(self.backup_dir, entry)
                if os.path.isdir(full_path):
                    # Compute directory size and file count
                    file_count = 0
                    total_size = 0
                    for root, _, files in os.walk(full_path):
                        for f in files:
                            file_count += 1
                            fp = os.path.join(root, f)
                            total_size += os.path.getsize(fp) if os.path.exists(fp) else 0

                    formatted_time = entry.replace('backup_', '')
                    try:
                        dt = datetime.strptime(formatted_time, '%Y%m%d_%H%M%S')
                        readable_time = dt.strftime('%Y-%m-%d %H:%M:%S')
                    except:
                        readable_time = formatted_time

                    result.append({
                        'name': entry,
                        'timestamp': readable_time,
                        'file_count': file_count,
                        'size_kb': round(total_size / 1024, 2),
                        'status': 'HEALTHY'
                    })
            result.sort(key=lambda x: x['name'], reverse=True)
        except Exception as e:
            logging.error(f"Error listing backups: {str(e)}")
        return result

    def restore_from_backup(self, backup_name):
        try:
            folder_name = backup_name if backup_name.startswith('backup_') else f'backup_{backup_name}'
            backup_path = os.path.join(self.backup_dir, folder_name)
            
            if os.path.exists(backup_path):
                if os.path.exists(self.source_dir):
                    shutil.rmtree(self.source_dir)
                shutil.copytree(backup_path, self.source_dir)
                logging.info(f"Successfully restored environment from snapshot: {folder_name}")
                return True
            else:
                logging.error(f"Backup snapshot not found: {backup_path}")
                return False
        except Exception as e:
            logging.error(f"Restore operation failed: {str(e)}")
            return False