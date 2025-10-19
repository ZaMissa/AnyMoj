import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Machine, ConnectionHistory, AppSettings } from '../types/machine.types';

interface MachineManagerDB extends DBSchema {
  machines: {
    key: string; // UUID
    value: Machine;
    indexes: { 'by-name': string; 'by-anydesk-id': string; 'by-category': string };
  };
  history: {
    key: string; // UUID
    value: ConnectionHistory;
    indexes: { 'by-machine-id': string; 'by-timestamp': Date };
  };
  settings: {
    key: string; // 'app-settings'
    value: AppSettings;
  };
}

class IndexedDBService {
  private db: IDBPDatabase<MachineManagerDB> | null = null;
  private readonly DB_NAME = 'MachineManagerDB';
  private readonly DB_VERSION = 1;

  async initialize(): Promise<void> {
    try {
      this.db = await openDB<MachineManagerDB>(this.DB_NAME, this.DB_VERSION, {
        upgrade(db) {
          // Machines store
          if (!db.objectStoreNames.contains('machines')) {
            const machineStore = db.createObjectStore('machines', { keyPath: 'id' });
            machineStore.createIndex('by-name', 'name');
            machineStore.createIndex('by-anydesk-id', 'anydeskId');
            machineStore.createIndex('by-category', 'categories', { multiEntry: true });
          }

          // History store
          if (!db.objectStoreNames.contains('history')) {
            const historyStore = db.createObjectStore('history', { keyPath: 'id' });
            historyStore.createIndex('by-machine-id', 'machineId');
            historyStore.createIndex('by-timestamp', 'timestamp');
          }

          // Settings store
          if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings', { keyPath: 'id' });
          }
        },
      });

      // Initialize default settings if they don't exist
      await this.initializeDefaultSettings();
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error);
      throw new Error('Database initialization failed');
    }
  }

  private async initializeDefaultSettings(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const existingSettings = await this.db.get('settings', 'app-settings');
    if (!existingSettings) {
      const defaultSettings: AppSettings = {
        id: 'app-settings',
        darkMode: false,
        autoBackup: true,
        defaultEncryption: false,
        categories: ['Work', 'Personal', 'Server', 'Development'],
        customFieldDefinitions: [],
        lastBackupDate: undefined,
      };

      await this.db.add('settings', defaultSettings);
    }
  }

  // Machine operations
  async addMachine(machine: Machine): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.add('machines', machine);
  }

  async updateMachine(machine: Machine): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    machine.updatedAt = new Date();
    await this.db.put('machines', machine);
  }

  async deleteMachine(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.delete('machines', id);
  }

  async getMachine(id: string): Promise<Machine | undefined> {
    if (!this.db) throw new Error('Database not initialized');
    return await this.db.get('machines', id);
  }

  async getAllMachines(): Promise<Machine[]> {
    if (!this.db) throw new Error('Database not initialized');
    return await this.db.getAll('machines');
  }

  async searchMachines(searchTerm: string): Promise<Machine[]> {
    if (!this.db) throw new Error('Database not initialized');
    const allMachines = await this.getAllMachines();
    
    return allMachines.filter(machine => 
      machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.anydeskId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }

  async getMachinesByCategory(category: string): Promise<Machine[]> {
    if (!this.db) throw new Error('Database not initialized');
    return await this.db.getAllFromIndex('machines', 'by-category', category);
  }

  async getMachineByAnyDeskId(anydeskId: string): Promise<Machine | undefined> {
    if (!this.db) throw new Error('Database not initialized');
    const machines = await this.db.getAllFromIndex('machines', 'by-anydesk-id', anydeskId);
    return machines[0];
  }

  // History operations
  async addConnectionHistory(history: ConnectionHistory): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.add('history', history);
  }

  async getConnectionHistory(machineId?: string): Promise<ConnectionHistory[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    if (machineId) {
      return await this.db.getAllFromIndex('history', 'by-machine-id', machineId);
    }
    
    return await this.db.getAll('history');
  }

  async deleteConnectionHistory(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.delete('history', id);
  }

  async clearConnectionHistory(machineId?: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    if (machineId) {
      const history = await this.getConnectionHistory(machineId);
      for (const entry of history) {
        await this.db.delete('history', entry.id);
      }
    } else {
      await this.db.clear('history');
    }
  }

  // Settings operations
  async getSettings(): Promise<AppSettings> {
    if (!this.db) throw new Error('Database not initialized');
    const settings = await this.db.get('settings', 'app-settings');
    if (!settings) {
      throw new Error('Settings not found');
    }
    return settings;
  }

  async updateSettings(settings: AppSettings): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.put('settings', settings);
  }

  // Utility operations
  async clearAllData(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.clear('machines');
    await this.db.clear('history');
    await this.db.clear('settings');
    await this.initializeDefaultSettings();
  }

  async getDatabaseSize(): Promise<{ machines: number; history: number; settings: number }> {
    if (!this.db) throw new Error('Database not initialized');
    
    const machines = await this.db.count('machines');
    const history = await this.db.count('history');
    const settings = await this.db.count('settings');
    
    return { machines, history, settings };
  }

  async exportAllData(): Promise<{ machines: Machine[]; history: ConnectionHistory[]; settings: AppSettings }> {
    if (!this.db) throw new Error('Database not initialized');
    
    const machines = await this.getAllMachines();
    const history = await this.getConnectionHistory();
    const settings = await this.getSettings();
    
    return { machines, history, settings };
  }

  async importData(data: { machines: Machine[]; history: ConnectionHistory[]; settings: AppSettings }): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const tx = this.db.transaction(['machines', 'history', 'settings'], 'readwrite');
    
    // Clear existing data
    await tx.objectStore('machines').clear();
    await tx.objectStore('history').clear();
    await tx.objectStore('settings').clear();
    
    // Import new data
    for (const machine of data.machines) {
      await tx.objectStore('machines').add(machine);
    }
    
    for (const historyEntry of data.history) {
      await tx.objectStore('history').add(historyEntry);
    }
    
    await tx.objectStore('settings').add(data.settings);
    
    await tx.done;
  }

  // Connection tracking helpers
  async logConnectionAttempt(machineId: string, action: ConnectionHistory['action'], notes?: string): Promise<void> {
    const historyEntry: ConnectionHistory = {
      id: crypto.randomUUID(),
      machineId,
      timestamp: new Date(),
      action,
      notes,
    };

    await this.addConnectionHistory(historyEntry);

    // Update machine's last accessed time and connection count
    const machine = await this.getMachine(machineId);
    if (machine) {
      machine.lastAccessed = new Date();
      if (action === 'launch_success') {
        machine.connectionCount += 1;
      }
      await this.updateMachine(machine);
    }
  }
}

// Export singleton instance
export const indexedDBService = new IndexedDBService();
