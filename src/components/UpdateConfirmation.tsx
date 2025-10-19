import React, { useState } from 'react';
import { backupService } from '../services/backup.service';
import './UpdateConfirmation.css';

interface UpdateConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentVersion: string;
  newVersion: string;
  releaseNotes?: string;
}

const UpdateConfirmation: React.FC<UpdateConfirmationProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentVersion,
  newVersion,
  releaseNotes
}) => {
  const [hasBackup, setHasBackup] = useState(false);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [backupCreated, setBackupCreated] = useState(false);
  const [canProceed, setCanProceed] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      checkExistingBackup();
    }
  }, [isOpen]);

  const checkExistingBackup = async () => {
    try {
      const backup = await backupService.getLatestBackup();
      if (backup && backup.exportDate) {
        const backupAge = Date.now() - new Date(backup.exportDate).getTime();
        const isRecent = backupAge < 24 * 60 * 60 * 1000; // 24 hours
        setHasBackup(isRecent);
        setCanProceed(isRecent);
      } else {
        setHasBackup(false);
        setCanProceed(false);
      }
    } catch (error) {
      console.error('Failed to check backup:', error);
      setHasBackup(false);
      setCanProceed(false);
    }
  };

  const createBackup = async () => {
    setIsCreatingBackup(true);
    try {
      await backupService.createAutoBackup();
      setBackupCreated(true);
      setHasBackup(true);
      setCanProceed(true);
    } catch (error) {
      console.error('Failed to create backup:', error);
      alert('Failed to create backup. Please try again.');
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleConfirm = () => {
    if (canProceed) {
      onConfirm();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content update-confirmation-modal">
        <div className="modal-header">
          <h2 className="modal-title">🔄 Update Available</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="update-info">
            <div className="version-comparison">
              <div className="version-item">
                <span className="version-label">Current Version:</span>
                <span className="version-value current">v{currentVersion}</span>
              </div>
              <div className="version-arrow">→</div>
              <div className="version-item">
                <span className="version-label">New Version:</span>
                <span className="version-value new">v{newVersion}</span>
              </div>
            </div>

            {releaseNotes && (
              <div className="release-notes">
                <h4>What's New:</h4>
                <p>{releaseNotes}</p>
              </div>
            )}
          </div>

          <div className="backup-section">
            <h3>📋 Backup Status</h3>
            
            {hasBackup ? (
              <div className="backup-status success">
                <div className="backup-icon">✅</div>
                <div className="backup-text">
                  <strong>Recent backup found!</strong>
                  <p>Your data is safely backed up and ready for update.</p>
                </div>
              </div>
            ) : (
              <div className="backup-status warning">
                <div className="backup-icon">⚠️</div>
                <div className="backup-text">
                  <strong>No recent backup found</strong>
                  <p>We recommend creating a backup before updating to ensure your data is safe.</p>
                </div>
              </div>
            )}

            {!hasBackup && (
              <div className="backup-actions">
                <button
                  className="btn btn-secondary"
                  onClick={createBackup}
                  disabled={isCreatingBackup}
                >
                  {isCreatingBackup ? 'Creating Backup...' : 'Create Backup Now'}
                </button>
              </div>
            )}

            {backupCreated && (
              <div className="backup-success">
                <div className="backup-icon">✅</div>
                <div className="backup-text">
                  <strong>Backup created successfully!</strong>
                  <p>Your data is now safely backed up.</p>
                </div>
              </div>
            )}
          </div>

          <div className="update-warning">
            <div className="warning-icon">⚠️</div>
            <div className="warning-text">
              <strong>Important:</strong> The update will refresh the page and apply the new version. 
              Make sure you have saved any important work before proceeding.
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleConfirm}
            disabled={!canProceed}
          >
            {canProceed ? 'Update Now' : 'Create Backup First'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateConfirmation;
