import CryptoJS from 'crypto-js';
import { AppSettings, BackupData, ExportOptions, ImportResult } from '../types/machine.types';

class ExportService {
  /**
   * Export data to JSON format
   */
  async exportData(options: ExportOptions): Promise<Blob> {
    const backupData: BackupData = {
      version: '1.0.0',
      exportDate: new Date(),
      machines: [],
      settings: {} as AppSettings,
      history: []
    };

    // Get data based on export options
    if (options.includeMachines) {
      const { indexedDBService } = await import('./indexedDB.service');
      if (options.selectedMachineIds && options.selectedMachineIds.length > 0) {
        // Export selected machines only
        for (const machineId of options.selectedMachineIds) {
          const machine = await indexedDBService.getMachine(machineId);
          if (machine) {
            backupData.machines.push(machine);
          }
        }
      } else {
        // Export all machines
        backupData.machines = await indexedDBService.getAllMachines();
      }
    }

    if (options.includeSettings) {
      const { indexedDBService } = await import('./indexedDB.service');
      backupData.settings = await indexedDBService.getSettings();
    }

    if (options.includeHistory) {
      const { indexedDBService } = await import('./indexedDB.service');
      backupData.history = await indexedDBService.getConnectionHistory();
    }

    // Convert to JSON string
    let jsonString = JSON.stringify(backupData, null, 2);

    // Encrypt if requested
    if (options.encrypt && options.password) {
      const encrypted = CryptoJS.AES.encrypt(jsonString, options.password).toString();
      const encryptedWrapper = {
        encrypted: true,
        data: encrypted,
        version: backupData.version,
        exportDate: backupData.exportDate
      };
      jsonString = JSON.stringify(encryptedWrapper, null, 2);
      console.log('Encrypted export structure:', encryptedWrapper);
    }

    // Create blob with appropriate MIME type
    const mimeType = options.encrypt ? 'application/json' : 'application/json';
    return new Blob([jsonString], { type: mimeType });
  }

  /**
   * Import data from JSON format
   */
  async importData(file: File, password?: string): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      importedMachines: 0,
      importedSettings: false,
      importedHistory: 0,
      errors: [],
      warnings: []
    };

    try {
      // Read file content
      const fileContent = await this.readFileAsText(file);
      let backupData: BackupData;

      try {
        // Try to parse as JSON
        const parsedData = JSON.parse(fileContent);

        // Check if data is encrypted
        if (parsedData.encrypted) {
          if (!password) {
            result.errors.push('File is encrypted but no password provided');
            return result;
          }

          try {
            // Decrypt the data
            const decrypted = CryptoJS.AES.decrypt(parsedData.data, password).toString(CryptoJS.enc.Utf8);
            if (!decrypted) {
              result.errors.push('Invalid password or corrupted encrypted data');
              return result;
            }
            
            // Parse the decrypted JSON
            try {
              backupData = JSON.parse(decrypted);
              console.log('Decrypted backup data structure:', backupData);
            } catch (parseError) {
              result.errors.push('Failed to parse decrypted data. File may be corrupted.');
              console.error('JSON parse error:', parseError);
              console.error('Decrypted string:', decrypted);
              return result;
            }
          } catch (decryptError) {
            result.errors.push('Failed to decrypt data. Check password.');
            console.error('Decryption error:', decryptError);
            return result;
          }
        } else {
          backupData = parsedData;
        }

        // Validate backup data structure
        if (!this.validateBackupData(backupData)) {
          result.errors.push('Invalid backup file format. Expected: version, exportDate, machines, settings, history');
          console.error('Validation failed for data:', backupData);
          return result;
        }

        // Import data
        await this.importBackupData(backupData, result);

        result.success = true;
      } catch (parseError) {
        result.errors.push('Invalid JSON format in backup file');
        return result;
      }
    } catch (fileError) {
      result.errors.push(`Failed to read file: ${fileError}`);
      return result;
    }

    return result;
  }

  /**
   * Generate filename for export
   */
  generateFilename(options: ExportOptions): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const scope = options.selectedMachineIds ? 'selected' : 'all';
    const encryption = options.encrypt ? 'encrypted' : 'plain';
    return `machine-backup-${scope}-${encryption}-${timestamp}.json`;
  }

  /**
   * Download blob as file
   */
  downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Read file as text
   */
  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  }

  /**
   * Validate backup data structure
   */
  private validateBackupData(data: any): data is BackupData {
    try {
      // Check basic structure
      if (!data || typeof data !== 'object') {
        console.error('Validation failed: data is not an object');
        return false;
      }

      // Check required fields
      if (typeof data.version !== 'string') {
        console.error('Validation failed: version is not a string', data.version);
        return false;
      }

      if (!data.exportDate) {
        console.error('Validation failed: exportDate is missing');
        return false;
      }

      if (!Array.isArray(data.machines)) {
        console.error('Validation failed: machines is not an array', data.machines);
        return false;
      }

      if (!Array.isArray(data.history)) {
        console.error('Validation failed: history is not an array', data.history);
        return false;
      }

      if (!data.settings || typeof data.settings !== 'object') {
        console.error('Validation failed: settings is not an object', data.settings);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Validation error:', error);
      return false;
    }
  }

  /**
   * Import backup data into IndexedDB
   */
  private async importBackupData(backupData: BackupData, result: ImportResult): Promise<void> {
    const { indexedDBService } = await import('./indexedDB.service');

    try {
      // Import machines
      for (const machine of backupData.machines) {
        try {
          const existingMachine = await indexedDBService.getMachine(machine.id);
          
          if (existingMachine) {
            // Machine exists - update it
            await indexedDBService.updateMachine(machine);
            result.warnings.push(`Updated existing machine: ${machine.name}`);
          } else {
            // New machine - add it
            await indexedDBService.addMachine(machine);
            result.importedMachines++;
          }
        } catch (machineError) {
          result.errors.push(`Failed to import machine ${machine.name}: ${machineError}`);
        }
      }

      // Import history
      for (const historyEntry of backupData.history) {
        try {
          await indexedDBService.addConnectionHistory(historyEntry);
          result.importedHistory++;
        } catch (historyError) {
          result.warnings.push(`Failed to import history entry: ${historyError}`);
        }
      }

      // Import settings (merge strategy)
      try {
        const currentSettings = await indexedDBService.getSettings();
        const mergedSettings = this.mergeSettings(currentSettings, backupData.settings);
        await indexedDBService.updateSettings(mergedSettings);
        result.importedSettings = true;
      } catch (settingsError) {
        result.warnings.push(`Failed to import settings: ${settingsError}`);
      }

    } catch (error) {
      result.errors.push(`Import failed: ${error}`);
    }
  }

  /**
   * Merge settings with existing settings
   */
  private mergeSettings(current: AppSettings, imported: AppSettings): AppSettings {
    return {
      ...current,
      ...imported,
      id: current.id, // Keep current ID
      // Preserve some current settings while importing others
      darkMode: imported.darkMode !== undefined ? imported.darkMode : current.darkMode,
      autoBackup: imported.autoBackup !== undefined ? imported.autoBackup : current.autoBackup,
      defaultEncryption: imported.defaultEncryption !== undefined ? imported.defaultEncryption : current.defaultEncryption,
      // Merge categories and custom field definitions
      categories: Array.from(new Set([...current.categories, ...imported.categories])),
      customFieldDefinitions: this.mergeCustomFieldDefinitions(current.customFieldDefinitions, imported.customFieldDefinitions)
    };
  }

  /**
   * Merge custom field definitions
   */
  private mergeCustomFieldDefinitions(current: any[], imported: any[]): any[] {
    const merged = [...current];
    
    for (const importedField of imported) {
      const existingIndex = merged.findIndex(field => field.id === importedField.id);
      if (existingIndex >= 0) {
        // Update existing field
        merged[existingIndex] = importedField;
      } else {
        // Add new field
        merged.push(importedField);
      }
    }
    
    return merged;
  }

  /**
   * Detect if file is encrypted
   */
  async detectEncryption(file: File): Promise<boolean> {
    try {
      const content = await this.readFileAsText(file);
      const parsed = JSON.parse(content);
      return parsed.encrypted === true;
    } catch {
      return false;
    }
  }

  /**
   * Get export summary for UI display
   */
  async getExportSummary(options: ExportOptions): Promise<{
    machineCount: number;
    hasSettings: boolean;
    hasHistory: boolean;
    estimatedSize: string;
  }> {
    const { indexedDBService } = await import('./indexedDB.service');
    
    let machineCount = 0;
    if (options.includeMachines) {
      if (options.selectedMachineIds && options.selectedMachineIds.length > 0) {
        machineCount = options.selectedMachineIds.length;
      } else {
        const allMachines = await indexedDBService.getAllMachines();
        machineCount = allMachines.length;
      }
    }

    const hasSettings = options.includeSettings;
    
    let hasHistory = false;
    if (options.includeHistory) {
      const history = await indexedDBService.getConnectionHistory();
      hasHistory = history.length > 0;
    }

    // Estimate file size (rough calculation)
    const estimatedSizeBytes = machineCount * 500 + (hasSettings ? 1000 : 0) + (hasHistory ? 200 : 0);
    const estimatedSize = this.formatFileSize(estimatedSizeBytes);

    return {
      machineCount,
      hasSettings,
      hasHistory,
      estimatedSize
    };
  }

  /**
   * Format file size for display
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Test export/import cycle for debugging
   */
  async testExportImportCycle(password: string = 'test123'): Promise<boolean> {
    try {
      console.log('Testing export/import cycle...');

      // Test export
      const exportBlob = await this.exportData({
        includeMachines: true,
        includeSettings: true,
        includeHistory: true,
        selectedMachineIds: [],
        encrypt: true,
        password
      });

      // Create a test file from the blob
      const testFile = new File([exportBlob], 'test-backup.json', { type: 'application/json' });

      // Test import
      const importResult = await this.importData(testFile, password);
      
      console.log('Test result:', importResult);
      return importResult.success;
    } catch (error) {
      console.error('Test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const exportService = new ExportService();
