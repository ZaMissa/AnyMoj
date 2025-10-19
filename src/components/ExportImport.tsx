import React, { useState, useRef } from 'react';
import { Machine } from '../types/machine.types';
import { exportService } from '../services/export.service';
import LoadingSpinner from './LoadingSpinner';
import './ExportImport.css';

interface ExportImportProps {
  machines: Machine[];
  onImportComplete?: (result: any) => void;
}

const ExportImport: React.FC<ExportImportProps> = ({ machines, onImportComplete }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    includeMachines: true,
    includeSettings: true,
    includeHistory: true,
    selectedMachineIds: [] as string[],
    encrypt: false,
    password: ''
  });
  const [importResult, setImportResult] = useState<any>(null);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    if (exportOptions.encrypt && !exportOptions.password.trim()) {
      alert('Please enter a password for encryption');
      return;
    }

    try {
      setIsExporting(true);
      
      const blob = await exportService.exportData(exportOptions);
      const filename = exportService.generateFilename(exportOptions);
      
      exportService.downloadBlob(blob, filename);
      
      alert(`✅ Export completed! File: ${filename}`);
    } catch (error) {
      console.error('Export failed:', error);
      alert(`❌ Export failed: ${error}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (file: File, password?: string) => {
    try {
      setIsImporting(true);
      setImportResult(null);
      
      const result = await exportService.importData(file, password);
      setImportResult(result);
      
      if (result.success) {
        alert(`✅ Import completed!\n\nImported: ${result.importedMachines} machines, ${result.importedHistory} history entries${result.importedSettings ? ', settings' : ''}`);
        if (onImportComplete) {
          onImportComplete(result);
        }
      } else {
        alert(`❌ Import failed:\n${result.errors.join('\n')}`);
      }
    } catch (error) {
      console.error('Import failed:', error);
      alert(`❌ Import failed: ${error}`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    try {
      const isEncrypted = await exportService.detectEncryption(file);
      
      if (isEncrypted) {
        setPendingFile(file);
        setShowPasswordPrompt(true);
      } else {
        await handleImport(file);
      }
    } catch (error) {
      console.error('File processing error:', error);
      alert(`❌ Failed to process file: ${error}`);
    }
  };

  const handlePasswordSubmit = async (password: string) => {
    if (pendingFile) {
      setShowPasswordPrompt(false);
      await handleImport(pendingFile, password);
      setPendingFile(null);
    }
  };

  const toggleMachineSelection = (machineId: string) => {
    setExportOptions(prev => ({
      ...prev,
      selectedMachineIds: prev.selectedMachineIds.includes(machineId)
        ? prev.selectedMachineIds.filter(id => id !== machineId)
        : [...prev.selectedMachineIds, machineId]
    }));
  };

  const selectAllMachines = () => {
    setExportOptions(prev => ({
      ...prev,
      selectedMachineIds: machines.map(m => m.id)
    }));
  };

  const clearMachineSelection = () => {
    setExportOptions(prev => ({
      ...prev,
      selectedMachineIds: []
    }));
  };

  return (
    <div className="export-import">
      <h3>Export & Import Data</h3>
      
      {/* Export Section */}
      <div className="export-section">
        <h4>Export Data</h4>
        
        <div className="export-options">
          <div className="option-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={exportOptions.includeMachines}
                onChange={(e) => setExportOptions(prev => ({ ...prev, includeMachines: e.target.checked }))}
              />
              Include Machines
            </label>
            
            {exportOptions.includeMachines && (
              <div className="machine-selection">
                <div className="selection-controls">
                  <button type="button" onClick={selectAllMachines} className="btn btn-sm">
                    Select All
                  </button>
                  <button type="button" onClick={clearMachineSelection} className="btn btn-sm">
                    Clear All
                  </button>
                </div>
                <div className="machine-list">
                  {machines.map(machine => (
                    <label key={machine.id} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={exportOptions.selectedMachineIds.includes(machine.id)}
                        onChange={() => toggleMachineSelection(machine.id)}
                      />
                      {machine.name} ({machine.anydeskId})
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={exportOptions.includeSettings}
              onChange={(e) => setExportOptions(prev => ({ ...prev, includeSettings: e.target.checked }))}
            />
            Include Settings
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={exportOptions.includeHistory}
              onChange={(e) => setExportOptions(prev => ({ ...prev, includeHistory: e.target.checked }))}
            />
            Include Connection History
          </label>
        </div>

        <div className="encryption-section">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={exportOptions.encrypt}
              onChange={(e) => setExportOptions(prev => ({ ...prev, encrypt: e.target.checked }))}
            />
            Encrypt Export
          </label>
          
          {exportOptions.encrypt && (
            <div className="password-input">
              <input
                type="password"
                placeholder="Enter encryption password"
                value={exportOptions.password}
                onChange={(e) => setExportOptions(prev => ({ ...prev, password: e.target.value }))}
                className="form-input"
              />
            </div>
          )}
        </div>

        <button
          onClick={handleExport}
          disabled={isExporting}
          className="btn btn-primary"
        >
          {isExporting ? (
            <>
              <LoadingSpinner size="sm" />
              Exporting...
            </>
          ) : (
            'Export Data'
          )}
        </button>
      </div>

      {/* Import Section */}
      <div className="import-section">
        <h4>Import Data</h4>
        
        <div className="import-info">
          <p>Import data from a previously exported backup file. The import will merge with existing data.</p>
        </div>

        <div className="file-input-container">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="file-input"
            id="import-file"
          />
          <label htmlFor="import-file" className="file-input-label">
            {isImporting ? (
              <>
                <LoadingSpinner size="sm" />
                Importing...
              </>
            ) : (
              'Choose Backup File'
            )}
          </label>
        </div>

        {importResult && (
          <div className={`import-result ${importResult.success ? 'success' : 'error'}`}>
            <h5>Import Result</h5>
            <p>✅ Imported: {importResult.importedMachines} machines, {importResult.importedHistory} history entries</p>
            {importResult.importedSettings && <p>✅ Settings imported</p>}
            {importResult.errors.length > 0 && (
              <div className="errors">
                <h6>Errors:</h6>
                <ul>
                  {importResult.errors.map((error: string, index: number) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            {importResult.warnings.length > 0 && (
              <div className="warnings">
                <h6>Warnings:</h6>
                <ul>
                  {importResult.warnings.map((warning: string, index: number) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Password Prompt Modal */}
      {showPasswordPrompt && (
        <div className="password-modal-overlay">
          <div className="password-modal">
            <h4>Encrypted File</h4>
            <p>This backup file is encrypted. Please enter the password:</p>
            <PasswordPrompt
              onSubmit={handlePasswordSubmit}
              onCancel={() => {
                setShowPasswordPrompt(false);
                setPendingFile(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Password prompt component
const PasswordPrompt: React.FC<{
  onSubmit: (password: string) => void;
  onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      onSubmit(password.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="password-form">
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter password"
        className="form-input"
        autoFocus
      />
      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={!password.trim()}>
          Import
        </button>
      </div>
    </form>
  );
};

export default ExportImport;
