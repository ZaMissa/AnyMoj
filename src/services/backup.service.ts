import { Machine, ConnectionHistory, AppSettings, BackupData } from '../types/machine.types';
import { indexedDBService } from './indexedDB.service';

class BackupService {
  private readonly BACKUP_KEY = 'machineManagerBackup';
  private readonly BACKUP_VERSION = '1.0';

  /**
   * Creates a backup of all data and stores it in LocalStorage
   */
  async createAutoBackup(): Promise<void> {
    try {
      const data = await indexedDBService.exportAllData();
      
      const backup: BackupData = {
        version: this.BACKUP_VERSION,
        exportDate: new Date(),
        machines: data.machines,
        history: data.history,
        settings: data.settings,
      };

      const backupString = JSON.stringify(backup);
      localStorage.setItem(this.BACKUP_KEY, backupString);

      // Update last backup date in settings
      const settings = data.settings;
      settings.lastBackupDate = new Date();
      await indexedDBService.updateSettings(settings);

      console.log('Auto-backup created successfully');
    } catch (error) {
      console.error('Failed to create auto-backup:', error);
      throw new Error('Auto-backup failed');
    }
  }

  /**
   * Restores data from LocalStorage backup
   */
  async restoreFromBackup(): Promise<boolean> {
    try {
      const backupString = localStorage.getItem(this.BACKUP_KEY);
      if (!backupString) {
        console.log('No backup found in LocalStorage');
        return false;
      }

      const backup: BackupData = JSON.parse(backupString);
      
      // Validate backup structure
      if (!this.validateBackupData(backup)) {
        console.error('Invalid backup data structure');
        return false;
      }

      // Convert date strings back to Date objects
      backup.exportDate = new Date(backup.exportDate);
      backup.machines.forEach(machine => {
        machine.createdAt = new Date(machine.createdAt);
        machine.updatedAt = new Date(machine.updatedAt);
        if (machine.lastAccessed) {
          machine.lastAccessed = new Date(machine.lastAccessed);
        }
      });
      backup.history.forEach(entry => {
        entry.timestamp = new Date(entry.timestamp);
      });

      await indexedDBService.importData({
        machines: backup.machines,
        history: backup.history,
        settings: backup.settings,
      });

      console.log('Data restored from backup successfully');
      return true;
    } catch (error) {
      console.error('Failed to restore from backup:', error);
      return false;
    }
  }

  /**
   * Checks if backup exists and is newer than current data
   */
  async checkBackupStatus(): Promise<{
    hasBackup: boolean;
    backupDate?: Date;
    isNewer: boolean;
  }> {
    try {
      const backupString = localStorage.getItem(this.BACKUP_KEY);
      if (!backupString) {
        return { hasBackup: false, isNewer: false };
      }

      const backup: BackupData = JSON.parse(backupString);
      const backupDate = new Date(backup.exportDate);

      // Get current settings to compare dates
      const settings = await indexedDBService.getSettings();
      const currentDate = settings.lastBackupDate || new Date(0);

      return {
        hasBackup: true,
        backupDate,
        isNewer: backupDate > currentDate,
      };
    } catch (error) {
      console.error('Failed to check backup status:', error);
      return { hasBackup: false, isNewer: false };
    }
  }

  /**
   * Creates a backup for export (download)
   */
  async createExportBackup(): Promise<BackupData> {
    try {
      const data = await indexedDBService.exportAllData();
      
      return {
        version: this.BACKUP_VERSION,
        exportDate: new Date(),
        machines: data.machines,
        history: data.history,
        settings: data.settings,
      };
    } catch (error) {
      console.error('Failed to create export backup:', error);
      throw new Error('Export backup failed');
    }
  }

  /**
   * Imports backup data from file
   */
  async importBackupFile(backupData: BackupData): Promise<{
    success: boolean;
    importedMachines: number;
    importedHistory: number;
    errors: string[];
  }> {
    const errors: string[] = [];

    try {
      // Validate backup structure
      if (!this.validateBackupData(backupData)) {
        errors.push('Invalid backup file format');
        return {
          success: false,
          importedMachines: 0,
          importedHistory: 0,
          errors,
        };
      }

      // Convert date strings back to Date objects
      backupData.exportDate = new Date(backupData.exportDate);
      backupData.machines.forEach(machine => {
        machine.createdAt = new Date(machine.createdAt);
        machine.updatedAt = new Date(machine.updatedAt);
        if (machine.lastAccessed) {
          machine.lastAccessed = new Date(machine.lastAccessed);
        }
      });
      backupData.history.forEach(entry => {
        entry.timestamp = new Date(entry.timestamp);
      });

      // Import data
      await indexedDBService.importData({
        machines: backupData.machines,
        history: backupData.history,
        settings: backupData.settings,
      });

      // Create new auto-backup after successful import
      await this.createAutoBackup();

      return {
        success: true,
        importedMachines: backupData.machines.length,
        importedHistory: backupData.history.length,
        errors: [],
      };
    } catch (error) {
      errors.push(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        success: false,
        importedMachines: 0,
        importedHistory: 0,
        errors,
      };
    }
  }

  /**
   * Validates backup data structure
   */
  private validateBackupData(backup: any): backup is BackupData {
    return (
      backup &&
      typeof backup.version === 'string' &&
      backup.exportDate &&
      Array.isArray(backup.machines) &&
      Array.isArray(backup.history) &&
      backup.settings &&
      typeof backup.settings === 'object'
    );
  }


  /**
   * Gets the latest backup data
   */
  async getLatestBackup(): Promise<BackupData | null> {
    try {
      const backupString = localStorage.getItem(this.BACKUP_KEY);
      if (!backupString) {
        return null;
      }

      const backup: BackupData = JSON.parse(backupString);
      if (this.validateBackupData(backup)) {
        return backup;
      }
      return null;
    } catch (error) {
      console.error('Failed to get latest backup:', error);
      return null;
    }
  }

  /**
   * Gets backup file size in bytes
   */
  async getBackupSize(): Promise<number> {
    try {
      const backupString = localStorage.getItem(this.BACKUP_KEY);
      return backupString ? new Blob([backupString]).size : 0;
    } catch (error) {
      console.error('Failed to get backup size:', error);
      return 0;
    }
  }

  /**
   * Checks if LocalStorage has enough space for backup
   */
  async checkStorageSpace(): Promise<{
    hasSpace: boolean;
    availableSpace: number;
    backupSize: number;
  }> {
    try {
      const backupSize = await this.getBackupSize();
      
      // Estimate available space by trying to store a test string
      const testString = 'x'.repeat(1024 * 1024); // 1MB test
      let availableSpace = 0;
      
      try {
        localStorage.setItem('test', testString);
        localStorage.removeItem('test');
        availableSpace = 5 * 1024 * 1024; // Assume 5MB available (conservative estimate)
      } catch (e) {
        availableSpace = 0;
      }

      return {
        hasSpace: availableSpace > backupSize + 1024 * 1024, // 1MB buffer
        availableSpace,
        backupSize,
      };
    } catch (error) {
      console.error('Failed to check storage space:', error);
      return {
        hasSpace: false,
        availableSpace: 0,
        backupSize: 0,
      };
    }
  }

  /**
   * Clears the backup from LocalStorage
   */
  async clearBackup(): Promise<void> {
    try {
      localStorage.removeItem(this.BACKUP_KEY);
      console.log('Backup cleared from LocalStorage');
    } catch (error) {
      console.error('Failed to clear backup:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const backupService = new BackupService();
