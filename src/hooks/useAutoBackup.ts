import { useEffect, useCallback } from 'react';
import { backupService } from '../services/backup.service';
import { indexedDBService } from '../services/indexedDB.service';

/**
 * Custom hook that automatically creates backups when data changes
 * and attempts to restore from backup on app initialization
 */
export const useAutoBackup = () => {
  /**
   * Creates an auto-backup
   */
  const createBackup = useCallback(async (): Promise<void> => {
    try {
      await backupService.createAutoBackup();
    } catch (error) {
      console.error('Auto-backup failed:', error);
      // Don't throw error to avoid breaking the app
    }
  }, []);

  /**
   * Restores from backup if available
   */
  const restoreFromBackup = useCallback(async (): Promise<boolean> => {
    try {
      return await backupService.restoreFromBackup();
    } catch (error) {
      console.error('Backup restoration failed:', error);
      return false;
    }
  }, []);

  /**
   * Checks backup status
   */
  const checkBackupStatus = useCallback(async () => {
    try {
      return await backupService.checkBackupStatus();
    } catch (error) {
      console.error('Backup status check failed:', error);
      return { hasBackup: false, isNewer: false };
    }
  }, []);

  /**
   * Initialize backup system on app start
   */
  const initializeBackup = useCallback(async (): Promise<{
    restored: boolean;
    hasBackup: boolean;
  }> => {
    try {
      // Check if we should skip auto-restore (after manual clear)
      const skipAutoRestore = localStorage.getItem('skipAutoRestore');
      if (skipAutoRestore === 'true') {
        localStorage.removeItem('skipAutoRestore');
        console.log('Skipping auto-restore due to manual clear');
        return {
          restored: false,
          hasBackup: false,
        };
      }

      // Check if IndexedDB is empty
      const dbSize = await indexedDBService.getDatabaseSize();
      const isEmpty = dbSize.machines === 0 && dbSize.history === 0;

      if (isEmpty) {
        // Try to restore from backup
        const restored = await restoreFromBackup();
        const status = await checkBackupStatus();
        
        return {
          restored,
          hasBackup: status.hasBackup,
        };
      }

      // If not empty, check if we should create initial backup
      const status = await checkBackupStatus();
      if (!status.hasBackup) {
        await createBackup();
      }

      return {
        restored: false,
        hasBackup: true,
      };
    } catch (error) {
      console.error('Backup initialization failed:', error);
      return {
        restored: false,
        hasBackup: false,
      };
    }
  }, [createBackup, restoreFromBackup, checkBackupStatus]);

  return {
    createBackup,
    restoreFromBackup,
    checkBackupStatus,
    initializeBackup,
  };
};

/**
 * Hook for automatic backup on data changes
 * Should be used in components that modify data
 */
export const useAutoBackupOnChange = (dependencies: any[] = []) => {
  const { createBackup } = useAutoBackup();

  useEffect(() => {
    // Only create backup if dependencies have changed and it's not the initial render
    if (dependencies.length > 0 && dependencies.some(dep => dep !== undefined)) {
      createBackup();
    }
  }, dependencies);
};

/**
 * Hook for components that need to trigger backup after specific operations
 */
export const useBackupTrigger = () => {
  const { createBackup } = useAutoBackup();

  const triggerBackup = useCallback(async (): Promise<void> => {
    try {
      await createBackup();
    } catch (error) {
      console.error('Manual backup trigger failed:', error);
      throw error;
    }
  }, [createBackup]);

  return { triggerBackup };
};
