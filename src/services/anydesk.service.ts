import { AnyDeskLaunchResult } from '../types/machine.types';
import { indexedDBService } from './indexedDB.service';

class AnyDeskService {
  /**
   * Launches AnyDesk with the specified machine ID
   */
  async launchAnyDesk(machineId: string): Promise<AnyDeskLaunchResult> {
    try {
      // Get machine details
      const machine = await indexedDBService.getMachine(machineId);
      if (!machine) {
        return {
          success: false,
          method: 'failed',
          error: 'Machine not found'
        };
      }

      // Log connection attempt
      await indexedDBService.logConnectionAttempt(machineId, 'launch_attempt');

      // Try AnyDesk URL scheme first
      const anydeskUrl = `anydesk://${machine.anydeskId}`;
      const fallbackUrl = `https://anydesk.com/${machine.anydeskId}`;

      try {
        // Attempt to open AnyDesk app
        const opened = await this.openAnyDeskApp(anydeskUrl);
        
        if (opened) {
          // Log successful launch attempt
          await indexedDBService.logConnectionAttempt(machineId, 'launch_success', 'AnyDesk app launched');
          
          return {
            success: true,
            method: 'app'
          };
        }
      } catch (error) {
        console.log('AnyDesk app not available, trying web fallback');
      }

      // Fallback to web version
      try {
        window.open(fallbackUrl, '_blank');
        
        // Log web fallback attempt
        await indexedDBService.logConnectionAttempt(machineId, 'launch_attempt', 'Opened web version');
        
        return {
          success: true,
          method: 'web'
        };
      } catch (error) {
        await indexedDBService.logConnectionAttempt(machineId, 'launch_failure', `Web fallback failed: ${error}`);
        
        return {
          success: false,
          method: 'failed',
          error: 'Failed to open AnyDesk app or web version'
        };
      }
    } catch (error) {
      console.error('AnyDesk launch error:', error);
      
      // Log failure
      await indexedDBService.logConnectionAttempt(machineId, 'launch_failure', `Launch error: ${error}`);
      
      return {
        success: false,
        method: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Attempts to open AnyDesk application using URL scheme
   */
  private async openAnyDeskApp(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      // Create a hidden iframe to attempt the URL scheme
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = url;
      
      // Timeout to detect if the app opened
      const timeout = setTimeout(() => {
        document.body.removeChild(iframe);
        resolve(false);
      }, 2000);

      // Listen for focus events to detect if app opened
      const handleFocus = () => {
        clearTimeout(timeout);
        document.body.removeChild(iframe);
        window.removeEventListener('focus', handleFocus);
        resolve(true);
      };

      window.addEventListener('focus', handleFocus);
      document.body.appendChild(iframe);

      // Also try direct window.location as fallback
      try {
        window.location.href = url;
        setTimeout(() => {
          clearTimeout(timeout);
          document.body.removeChild(iframe);
          window.removeEventListener('focus', handleFocus);
          resolve(true);
        }, 1000);
      } catch (error) {
        // Ignore errors, let the iframe method handle it
      }
    });
  }

  /**
   * Checks if AnyDesk is likely installed on the system
   */
  async checkAnyDeskAvailability(): Promise<boolean> {
    try {
      // Try to detect AnyDesk installation
      // This is a simple heuristic - in reality, we can't reliably detect
      // if AnyDesk is installed without user interaction
      
      // For now, we'll assume it might be available and let the launch attempt determine
      return true;
    } catch (error) {
      console.error('Error checking AnyDesk availability:', error);
      return false;
    }
  }

  /**
   * Gets AnyDesk download URL for the current platform
   */
  getAnyDeskDownloadUrl(): string {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('windows')) {
      return 'https://anydesk.com/downloads/windows';
    } else if (userAgent.includes('mac')) {
      return 'https://anydesk.com/downloads/macos';
    } else if (userAgent.includes('linux')) {
      return 'https://anydesk.com/downloads/linux';
    } else if (userAgent.includes('android')) {
      return 'https://play.google.com/store/apps/details?id=com.anydesk.anydeskandroid';
    } else if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
      return 'https://apps.apple.com/app/anydesk/id1114002967';
    }
    
    return 'https://anydesk.com/downloads';
  }

  /**
   * Formats AnyDesk ID for display (adds spaces for readability)
   */
  formatAnyDeskId(id: string): string {
    // Remove any non-numeric characters
    const cleanId = id.replace(/\D/g, '');
    
    // Add spaces every 3 digits for readability
    return cleanId.replace(/(\d{3})(?=\d)/g, '$1 ');
  }

  /**
   * Validates AnyDesk ID format
   */
  isValidAnyDeskId(id: string): boolean {
    // AnyDesk IDs are typically 9 digits
    const cleanId = id.replace(/\D/g, '');
    return cleanId.length === 9 && /^\d+$/.test(cleanId);
  }

  /**
   * Shows user-friendly message based on launch result
   */
  getLaunchMessage(result: AnyDeskLaunchResult, machineName: string): string {
    if (result.success) {
      if (result.method === 'app') {
        return `AnyDesk app opened for ${machineName}. If the connection doesn't start automatically, enter the ID: ${result.method}`;
      } else if (result.method === 'web') {
        return `AnyDesk web version opened for ${machineName}. You can also download the AnyDesk app for better experience.`;
      }
    }
    
    return `Failed to launch AnyDesk for ${machineName}. ${result.error || 'Please ensure AnyDesk is installed or try again.'}`;
  }
}

// Export singleton instance
export const anydeskService = new AnyDeskService();
