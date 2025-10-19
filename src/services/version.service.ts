/**
 * Version Service for AnyMoj PWA
 * Handles version tracking, comparison, and update notifications
 */

export interface VersionInfo {
  current: string;
  latest: string;
  isUpdateAvailable: boolean;
  lastChecked: Date | null;
  updateUrl?: string;
}

export interface VersionCheckResult {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  updateUrl?: string;
  releaseNotes?: string;
}

class VersionService {
  private readonly VERSION_KEY = 'anymoj-version';
  private readonly LAST_CHECK_KEY = 'anymoj-last-version-check';
  private readonly CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Get current app version from package.json
   */
  getCurrentVersion(): string {
    // In a real app, this would be injected at build time
    // For now, we'll use a hardcoded version that matches package.json
    return '1.0.1';
  }

  /**
   * Get stored version info from localStorage
   */
  getStoredVersionInfo(): VersionInfo {
    try {
      const stored = localStorage.getItem(this.VERSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          current: parsed.current || this.getCurrentVersion(),
          latest: parsed.latest || this.getCurrentVersion(),
          isUpdateAvailable: parsed.isUpdateAvailable || false,
          lastChecked: parsed.lastChecked ? new Date(parsed.lastChecked) : null,
          updateUrl: parsed.updateUrl
        };
      }
    } catch (error) {
      console.error('Failed to parse stored version info:', error);
    }

    return {
      current: this.getCurrentVersion(),
      latest: this.getCurrentVersion(),
      isUpdateAvailable: false,
      lastChecked: null
    };
  }

  /**
   * Store version info to localStorage
   */
  private storeVersionInfo(info: VersionInfo): void {
    try {
      localStorage.setItem(this.VERSION_KEY, JSON.stringify({
        ...info,
        lastChecked: info.lastChecked?.toISOString() || null
      }));
    } catch (error) {
      console.error('Failed to store version info:', error);
    }
  }

  /**
   * Check if enough time has passed since last version check
   */
  shouldCheckForUpdates(): boolean {
    try {
      const lastCheck = localStorage.getItem(this.LAST_CHECK_KEY);
      if (!lastCheck) return true;

      const lastCheckDate = new Date(lastCheck);
      const now = new Date();
      return (now.getTime() - lastCheckDate.getTime()) > this.CHECK_INTERVAL;
    } catch (error) {
      console.error('Failed to check last version check time:', error);
      return true;
    }
  }

  /**
   * Update last check time
   */
  private updateLastCheckTime(): void {
    try {
      localStorage.setItem(this.LAST_CHECK_KEY, new Date().toISOString());
    } catch (error) {
      console.error('Failed to update last check time:', error);
    }
  }

  /**
   * Check for app updates
   * In a real implementation, this would fetch from a version API
   * For now, we'll simulate version checking
   */
  async checkForUpdates(): Promise<VersionCheckResult> {
    const currentVersion = this.getCurrentVersion();
    
    try {
      // Simulate API call - in real implementation, this would fetch from your version API
      // For now, we'll use a simple simulation
      const simulatedLatestVersion = await this.simulateVersionCheck();
      
      const hasUpdate = this.compareVersions(simulatedLatestVersion, currentVersion) > 0;
      
      const result: VersionCheckResult = {
        hasUpdate,
        currentVersion,
        latestVersion: simulatedLatestVersion,
        updateUrl: hasUpdate ? 'https://zamissa.github.io/AnyMoj/' : undefined,
        releaseNotes: hasUpdate ? this.getReleaseNotes(simulatedLatestVersion) : undefined
      };

      // Update stored version info
      const versionInfo: VersionInfo = {
        current: currentVersion,
        latest: simulatedLatestVersion,
        isUpdateAvailable: hasUpdate,
        lastChecked: new Date(),
        updateUrl: result.updateUrl
      };
      
      this.storeVersionInfo(versionInfo);
      this.updateLastCheckTime();

      return result;
    } catch (error) {
      console.error('Failed to check for updates:', error);
      return {
        hasUpdate: false,
        currentVersion,
        latestVersion: currentVersion
      };
    }
  }

  /**
   * Simulate version check - replace with real API call
   */
  private async simulateVersionCheck(): Promise<string> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo purposes, always return a newer version for testing
    return '1.1.0';
  }

  /**
   * Compare two version strings
   * Returns: 1 if v1 > v2, -1 if v1 < v2, 0 if equal
   */
  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    const maxLength = Math.max(parts1.length, parts2.length);
    
    for (let i = 0; i < maxLength; i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;
      
      if (part1 > part2) return 1;
      if (part1 < part2) return -1;
    }
    
    return 0;
  }

  /**
   * Get release notes for a version
   */
  private getReleaseNotes(version: string): string {
    const releaseNotes: Record<string, string> = {
      '1.1.0': 'New features: Enhanced theme selection, improved copy functionality, and better user experience.',
      '1.0.1': 'Bug fixes and performance improvements.',
      '1.0.0': 'Initial release with core AnyMoj functionality.'
    };
    
    return releaseNotes[version] || 'Update available with improvements and bug fixes.';
  }

  /**
   * Get formatted version string for display
   */
  getFormattedVersion(): string {
    return `v${this.getCurrentVersion()}`;
  }

  /**
   * Check if app needs to be updated
   */
  async checkIfUpdateNeeded(): Promise<boolean> {
    if (!this.shouldCheckForUpdates()) {
      const stored = this.getStoredVersionInfo();
      return stored.isUpdateAvailable;
    }

    const result = await this.checkForUpdates();
    return result.hasUpdate;
  }

  /**
   * Force update check (ignores time interval)
   */
  async forceUpdateCheck(): Promise<VersionCheckResult> {
    return this.checkForUpdates();
  }

  /**
   * Clear version info (useful for testing)
   */
  clearVersionInfo(): void {
    localStorage.removeItem(this.VERSION_KEY);
    localStorage.removeItem(this.LAST_CHECK_KEY);
  }
}

export const versionService = new VersionService();
