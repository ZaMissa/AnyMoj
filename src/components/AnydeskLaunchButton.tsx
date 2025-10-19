import React, { useState } from 'react';
import { anydeskService } from '../services/anydesk.service';
import { AnyDeskLaunchResult } from '../types/machine.types';
import LoadingSpinner from './LoadingSpinner';
import './AnydeskLaunchButton.css';

interface AnydeskLaunchButtonProps {
  machineId: string;
  machineName: string;
  anydeskId: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'icon';
  onLaunchResult?: (result: AnyDeskLaunchResult) => void;
  className?: string;
}

const AnydeskLaunchButton: React.FC<AnydeskLaunchButtonProps> = ({
  machineId,
  machineName,
  anydeskId,
  size = 'md',
  variant = 'primary',
  onLaunchResult,
  className = ''
}) => {
  const [isLaunching, setIsLaunching] = useState(false);
  const [lastResult, setLastResult] = useState<AnyDeskLaunchResult | null>(null);

  const handleLaunch = async () => {
    if (isLaunching) return;

    try {
      setIsLaunching(true);
      setLastResult(null);

      const result = await anydeskService.launchAnyDesk(machineId);
      setLastResult(result);
      
      if (onLaunchResult) {
        onLaunchResult(result);
      }

      // Show user feedback
      const message = anydeskService.getLaunchMessage(result, machineName);
      
      if (result.success) {
        // Show success message briefly
        if (result.method === 'web') {
          alert(`✅ ${message}\n\n💡 Tip: Download AnyDesk app for better experience!`);
        } else {
          alert(`✅ ${message}`);
        }
      } else {
        // Show error message with download option
        const shouldDownload = window.confirm(`❌ ${message}\n\nWould you like to download AnyDesk?`);
        if (shouldDownload) {
          window.open(anydeskService.getAnyDeskDownloadUrl(), '_blank');
        }
      }
    } catch (error) {
      console.error('Launch error:', error);
      const errorResult: AnyDeskLaunchResult = {
        success: false,
        method: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      setLastResult(errorResult);
      
      if (onLaunchResult) {
        onLaunchResult(errorResult);
      }
      
      alert(`❌ Failed to launch AnyDesk: ${errorResult.error}`);
    } finally {
      setIsLaunching(false);
    }
  };

  const getButtonText = () => {
    if (isLaunching) {
      return size === 'sm' ? '...' : 'Launching...';
    }
    
    switch (variant) {
      case 'icon':
        return '🚀';
      case 'secondary':
        return `Connect to ${machineName}`;
      default:
        return 'Launch AnyDesk';
    }
  };

  const getButtonClass = () => {
    const baseClass = 'anydesk-launch-btn';
    const sizeClass = `anydesk-launch-btn-${size}`;
    const variantClass = `anydesk-launch-btn-${variant}`;
    const stateClass = isLaunching ? 'anydesk-launch-btn-loading' : '';
    const resultClass = lastResult ? `anydesk-launch-btn-${lastResult.success ? 'success' : 'error'}` : '';
    
    return `${baseClass} ${sizeClass} ${variantClass} ${stateClass} ${resultClass} ${className}`.trim();
  };

  const getButtonIcon = () => {
    if (isLaunching) {
      return <LoadingSpinner size={size === 'sm' ? 'sm' : 'md'} />;
    }
    
    if (lastResult?.success) {
      return '✅';
    }
    
    if (lastResult && !lastResult.success) {
      return '❌';
    }
    
    return '🚀';
  };

  return (
    <button
      className={getButtonClass()}
      onClick={handleLaunch}
      disabled={isLaunching}
      title={`Launch AnyDesk for ${machineName} (ID: ${anydeskId})`}
    >
      <span className="anydesk-launch-btn-icon">{getButtonIcon()}</span>
      <span className="anydesk-launch-btn-text">{getButtonText()}</span>
    </button>
  );
};

export default AnydeskLaunchButton;
