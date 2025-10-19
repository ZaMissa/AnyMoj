export interface Machine {
  id: string; // UUID
  name: string;
  anydeskId: string;
  address?: string; // IP or hostname
  passwords: string[];
  notes?: string;
  categories: string[];
  tags: string[];
  customFields: CustomField[];
  createdAt: Date;
  updatedAt: Date;
  lastAccessed?: Date;
  connectionCount: number;
}

export interface CustomField {
  id: string;
  key: string;
  value: string;
  type: 'text' | 'password' | 'url' | 'number';
}

export interface ConnectionHistory {
  id: string;
  machineId: string;
  timestamp: Date;
  action: 'launch_attempt' | 'launch_success' | 'launch_failure';
  notes?: string;
}

export interface AppSettings {
  id: string;
  darkMode: boolean;
  autoBackup: boolean;
  defaultEncryption: boolean;
  categories: string[];
  customFieldDefinitions: CustomFieldDefinition[];
  lastBackupDate?: Date;
}

export interface CustomFieldDefinition {
  id: string;
  name: string;
  type: 'text' | 'password' | 'url' | 'number';
  required: boolean;
  defaultValue?: string;
}

export interface BackupData {
  version: string;
  exportDate: Date;
  machines: Machine[];
  settings: AppSettings;
  history: ConnectionHistory[];
}

export interface ExportOptions {
  includeMachines: boolean;
  includeSettings: boolean;
  includeHistory: boolean;
  selectedMachineIds?: string[];
  encrypt: boolean;
  password?: string;
}

export interface ImportResult {
  success: boolean;
  importedMachines: number;
  importedSettings: boolean;
  importedHistory: number;
  errors: string[];
  warnings: string[];
}

// Form types for validation
export interface MachineFormData {
  name: string;
  anydeskId: string;
  address: string;
  passwords: string[];
  notes: string;
  categories: string[];
  tags: string[];
  customFields: CustomField[];
}

// Filter and search types
export interface MachineFilters {
  searchTerm: string;
  categories: string[];
  tags: string[];
  hasPassword: boolean | null;
  lastAccessedDays: number | null;
}

export interface MachineSortOptions {
  field: 'name' | 'lastAccessed' | 'createdAt' | 'connectionCount';
  direction: 'asc' | 'desc';
}

// AnyDesk integration types
export interface AnyDeskLaunchResult {
  success: boolean;
  method: 'app' | 'web' | 'failed';
  error?: string;
}

// QR Code types
export interface QRCodeData {
  type: 'machine' | 'backup';
  data: Machine | BackupData;
  encrypted: boolean;
  version: string;
}
