import React, { useState, useEffect } from 'react';
import { AppSettings, Machine } from '../types/machine.types';
import { indexedDBService } from '../services/indexedDB.service';
import { backupService } from '../services/backup.service';
import LoadingSpinner from '../components/LoadingSpinner';
import ExportImport from '../components/ExportImport';
import VersionDisplay from '../components/VersionDisplay';
import './Settings.css';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
    loadMachines();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const settingsData = await indexedDBService.getSettings();
      setSettings(settingsData);
      
      // Apply dark mode on load
      if (settingsData?.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMachines = async () => {
    try {
      const allMachines = await indexedDBService.getAllMachines();
      setMachines(allMachines);
    } catch (error) {
      console.error('Failed to load machines:', error);
    }
  };

  const handleSettingChange = async (field: keyof AppSettings, value: any) => {
    if (settings) {
      const newSettings = { ...settings, [field]: value };
      setSettings(newSettings);
      
      // Apply dark mode immediately for better UX
      if (field === 'darkMode') {
        if (value) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        
        // Auto-save dark mode setting immediately
        try {
          await indexedDBService.updateSettings(newSettings);
        } catch (error) {
          console.error('Failed to save dark mode setting:', error);
        }
      }
    }
  };

  const saveSettings = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      await indexedDBService.updateSettings(settings);
      
      // Apply dark mode class to document
      if (settings.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };


  const clearAllData = async () => {
    // Create a custom confirmation dialog with backup checkbox
    const confirmed = await showBackupConfirmationDialog();
    if (!confirmed) {
      return;
    }

    try {
      // Clear backup first to prevent auto-restore
      await backupService.clearBackup();
      
      // Clear all data from IndexedDB
      await indexedDBService.clearAllData();
      
      // Set a flag to prevent auto-restore on next load
      localStorage.setItem('skipAutoRestore', 'true');
      
      // Set a flag to show theme chooser after reload
      localStorage.setItem('showThemeChooser', 'true');
      
      alert('All data has been cleared. The app will reload and show theme selection.');
      window.location.reload();
    } catch (error) {
      console.error('Failed to clear data:', error);
      alert('Failed to clear data. Please try again.');
    }
  };

  const showBackupConfirmationDialog = (): Promise<boolean> => {
    return new Promise((resolve) => {
      // Create modal overlay
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
      `;

      // Create modal content
      const modal = document.createElement('div');
      modal.style.cssText = `
        background: white;
        padding: 24px;
        border-radius: 8px;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;

      modal.innerHTML = `
        <h3 style="margin: 0 0 16px 0; color: #d32f2f; font-size: 18px;">⚠️ Clear All Data</h3>
        <p style="margin: 0 0 16px 0; color: #333; line-height: 1.5;">
          This will permanently delete ALL your machines, connection history, and settings. 
          <strong>This action cannot be undone!</strong>
        </p>
        <p style="margin: 0 0 16px 0; color: #666; font-size: 14px;">
          Before proceeding, please ensure you have exported your data as a backup.
        </p>
        <label style="display: flex; align-items: center; margin: 16px 0; cursor: pointer;">
          <input type="checkbox" id="backup-confirmation" style="margin-right: 8px;">
          <span style="color: #333; font-weight: 500;">
            I confirm that I have made a backup of my data and understand this action is irreversible
          </span>
        </label>
        <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
          <button id="cancel-btn" style="
            padding: 8px 16px;
            border: 1px solid #ccc;
            background: white;
            border-radius: 4px;
            cursor: pointer;
            color: #333;
          ">Cancel</button>
          <button id="confirm-btn" style="
            padding: 8px 16px;
            border: none;
            background: #d32f2f;
            color: white;
            border-radius: 4px;
            cursor: pointer;
            opacity: 0.5;
          " disabled>Clear All Data</button>
        </div>
      `;

      overlay.appendChild(modal);
      document.body.appendChild(overlay);

      const checkbox = modal.querySelector('#backup-confirmation') as HTMLInputElement;
      const cancelBtn = modal.querySelector('#cancel-btn') as HTMLButtonElement;
      const confirmBtn = modal.querySelector('#confirm-btn') as HTMLButtonElement;

      // Enable/disable confirm button based on checkbox
      const updateConfirmButton = () => {
        if (checkbox.checked) {
          confirmBtn.disabled = false;
          confirmBtn.style.opacity = '1';
        } else {
          confirmBtn.disabled = true;
          confirmBtn.style.opacity = '0.5';
        }
      };

      checkbox.addEventListener('change', updateConfirmButton);

      // Event handlers
      cancelBtn.addEventListener('click', () => {
        document.body.removeChild(overlay);
        resolve(false);
      });

      confirmBtn.addEventListener('click', () => {
        if (checkbox.checked) {
          document.body.removeChild(overlay);
          resolve(true);
        }
      });

      // Close on overlay click
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          document.body.removeChild(overlay);
          resolve(false);
        }
      });

      // Close on Escape key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          document.body.removeChild(overlay);
          document.removeEventListener('keydown', handleEscape);
          resolve(false);
        }
      };
      document.addEventListener('keydown', handleEscape);
    });
  };

  const handleImportComplete = async (result: any) => {
    // Reload data after successful import
    await loadSettings();
    await loadMachines();
  };

  if (loading) {
    return (
      <div className="page-loading">
        <LoadingSpinner size="lg" />
        <p>Loading settings...</p>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="page-error">
        <h2>Failed to load settings</h2>
        <button onClick={loadSettings} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">
          Manage your app preferences and data
        </p>
      </div>

      <div className="settings-sections">
        {/* Appearance Settings */}
        <div className="settings-section">
          <h3>Appearance</h3>
          
          <div className="setting-item">
            <div className="setting-info">
              <label className="setting-label">Dark Mode</label>
              <p className="setting-description">
                Enable dark theme for better viewing in low light
              </p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.darkMode}
                onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
                aria-label="Toggle dark mode"
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {/* Backup Settings */}
        <div className="settings-section">
          <h3>Backup & Restore</h3>
          
          <div className="setting-item">
            <div className="setting-info">
              <label className="setting-label">Auto Backup</label>
              <p className="setting-description">
                Automatically backup data to browser storage
              </p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.autoBackup}
                onChange={(e) => handleSettingChange('autoBackup', e.target.checked)}
                aria-label="Toggle auto backup"
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label className="setting-label">Default Encryption</label>
              <p className="setting-description">
                Encrypt exports by default (you can still choose per export)
              </p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.defaultEncryption}
                onChange={(e) => handleSettingChange('defaultEncryption', e.target.checked)}
                aria-label="Toggle default encryption"
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {/* Data Management */}
        <div className="settings-section">
          <h3>Data Management</h3>
          
          <div className="setting-actions">
            <button onClick={clearAllData} className="btn btn-error">
              Clear All Data
            </button>
          </div>
          
          <div className="setting-info">
            <p>Use the Export & Import section below for advanced backup and restore functionality with encryption options.</p>
          </div>
        </div>

        {/* Export/Import Section */}
        <ExportImport 
          machines={machines} 
          onImportComplete={handleImportComplete}
        />

        {/* App Information */}
        <div className="settings-section">
          <h3>App Information</h3>
          <VersionDisplay showUpdateButton={true} />
        </div>

        {/* Save Button */}
        <div className="settings-actions">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="btn btn-primary btn-lg"
          >
            {saving ? <LoadingSpinner size="sm" /> : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
