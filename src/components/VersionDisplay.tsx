import React, { useState, useEffect } from 'react';
import { versionService, VersionInfo } from '../services/version.service';
import './VersionDisplay.css';

interface VersionDisplayProps {
  showUpdateButton?: boolean;
  className?: string;
}

const VersionDisplay: React.FC<VersionDisplayProps> = ({ 
  showUpdateButton = true, 
  className = '' 
}) => {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadVersionInfo();
  }, []);

  const loadVersionInfo = () => {
    const info = versionService.getStoredVersionInfo();
    setVersionInfo(info);
  };

  const handleCheckForUpdates = async () => {
    setIsChecking(true);
    try {
      const result = await versionService.forceUpdateCheck();
      loadVersionInfo(); // Reload to get updated info
    } catch (error) {
      console.error('Failed to check for updates:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleUpdate = () => {
    if (versionInfo?.updateUrl) {
      window.open(versionInfo.updateUrl, '_blank');
    } else {
      // Fallback to page reload
      window.location.reload();
    }
  };

  if (!versionInfo) {
    return null;
  }

  return (
    <div className={`version-display ${className}`}>
      <div className="version-info">
        <span className="version-text">
          {versionService.getFormattedVersion()}
        </span>
        
        {versionInfo.isUpdateAvailable && (
          <span className="update-badge">
            Update Available
          </span>
        )}
        
        <button
          className="version-toggle-btn"
          onClick={() => setShowDetails(!showDetails)}
          title={showDetails ? 'Hide details' : 'Show details'}
        >
          {showDetails ? '▼' : '▶'}
        </button>
      </div>

      {showDetails && (
        <div className="version-details">
          <div className="version-detail-item">
            <span className="detail-label">Current:</span>
            <span className="detail-value">v{versionInfo.current}</span>
          </div>
          
          <div className="version-detail-item">
            <span className="detail-label">Latest:</span>
            <span className="detail-value">v{versionInfo.latest}</span>
          </div>
          
          {versionInfo.lastChecked && (
            <div className="version-detail-item">
              <span className="detail-label">Last checked:</span>
              <span className="detail-value">
                {versionInfo.lastChecked.toLocaleDateString()} {versionInfo.lastChecked.toLocaleTimeString()}
              </span>
            </div>
          )}

          <div className="version-actions">
            <button
              className="btn btn-sm btn-secondary"
              onClick={handleCheckForUpdates}
              disabled={isChecking}
            >
              {isChecking ? 'Checking...' : 'Check for Updates'}
            </button>
            
            {versionInfo.isUpdateAvailable && showUpdateButton && (
              <button
                className="btn btn-sm btn-primary"
                onClick={handleUpdate}
              >
                Update Now
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VersionDisplay;
