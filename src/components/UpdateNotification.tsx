import React, { useState, useEffect } from 'react';
import { versionService, VersionInfo } from '../services/version.service';
import UpdateConfirmation from './UpdateConfirmation';
import './UpdateNotification.css';

interface UpdateNotificationProps {
  onDismiss?: () => void;
  autoCheck?: boolean;
}

const UpdateNotification: React.FC<UpdateNotificationProps> = ({ 
  onDismiss,
  autoCheck = true 
}) => {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (autoCheck) {
      checkForUpdates();
    }
  }, [autoCheck]);

  const checkForUpdates = async () => {
    try {
      const hasUpdate = await versionService.checkIfUpdateNeeded();
      if (hasUpdate) {
        const info = versionService.getStoredVersionInfo();
        setVersionInfo(info);
        setIsVisible(true);
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
  };

  const handleUpdate = () => {
    if (versionInfo) {
      setShowConfirmation(true);
    }
  };

  const handleConfirmUpdate = async () => {
    if (versionInfo) {
      try {
        await versionService.performUpdateWithConfirmation(
          versionInfo.current,
          versionInfo.latest
        );
        setShowConfirmation(false);
        setIsVisible(false);
        // The actual update will be handled by the confirmation component
      } catch (error) {
        console.error('Failed to initiate update:', error);
      }
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    if (onDismiss) {
      onDismiss();
    }
  };

  const handleLater = () => {
    setIsVisible(false);
    // Show again in 24 hours
    setTimeout(() => {
      setIsDismissed(false);
    }, 24 * 60 * 60 * 1000);
  };

  if (!isVisible || isDismissed || !versionInfo?.isUpdateAvailable) {
    return null;
  }

  return (
    <>
      <div className="update-notification">
        <div className="update-notification-content">
          <div className="update-icon">
            🔄
          </div>
          
          <div className="update-text">
            <h4 className="update-title">Update Available!</h4>
            <p className="update-description">
              A new version (v{versionInfo.latest}) is available. 
              You're currently on v{versionInfo.current}.
            </p>
          </div>

          <div className="update-actions">
            <button
              className="btn btn-sm btn-secondary"
              onClick={handleLater}
            >
              Later
            </button>
            
            <button
              className="btn btn-sm btn-primary"
              onClick={handleUpdate}
            >
              Update Now
            </button>
            
            <button
              className="btn btn-sm btn-ghost"
              onClick={handleDismiss}
              title="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      {showConfirmation && versionInfo && (
        <UpdateConfirmation
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          onConfirm={handleConfirmUpdate}
          currentVersion={versionInfo.current}
          newVersion={versionInfo.latest}
        />
      )}
    </>
  );
};

export default UpdateNotification;
