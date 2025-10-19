import React, { useState, useEffect } from 'react';
import { AppSettings, Machine } from '../types/machine.types';
import { indexedDBService } from '../services/indexedDB.service';
import LoadingSpinner from '../components/LoadingSpinner';
import ExportImport from '../components/ExportImport';
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

  const handleSettingChange = (field: keyof AppSettings, value: any) => {
    if (settings) {
      setSettings({ ...settings, [field]: value });
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
    if (!window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      return;
    }

    if (!window.confirm('This will delete ALL machines, history, and settings. Are you absolutely sure?')) {
      return;
    }

    try {
      await indexedDBService.clearAllData();
      alert('All data has been cleared. The app will reload.');
      window.location.reload();
    } catch (error) {
      console.error('Failed to clear data:', error);
      alert('Failed to clear data. Please try again.');
    }
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
