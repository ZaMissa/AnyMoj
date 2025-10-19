import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Machine } from '../types/machine.types';
import { indexedDBService } from '../services/indexedDB.service';
import { useAutoBackupOnChange } from '../hooks/useAutoBackup';
import LoadingSpinner from '../components/LoadingSpinner';
import AnydeskLaunchButton from '../components/AnydeskLaunchButton';
import { formatRelativeTimeHours } from '../utils/dateUtils';
import { versionService } from '../services/version.service';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [hasPasswordFilter, setHasPasswordFilter] = useState<boolean | null>(null);
  const [filteredMachines, setFilteredMachines] = useState<Machine[]>([]);

  // Auto-backup when machines change
  useAutoBackupOnChange([machines]);

  const loadMachines = async () => {
    try {
      setLoading(true);
      const allMachines = await indexedDBService.getAllMachines();
      setMachines(allMachines);
    } catch (error) {
      console.error('Failed to load machines:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMachines = useCallback(() => {
    let filtered = machines;

    // Search term filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(machine =>
        machine.name.toLowerCase().includes(searchLower) ||
        machine.anydeskId.toLowerCase().includes(searchLower) ||
        machine.address?.toLowerCase().includes(searchLower) ||
        machine.notes?.toLowerCase().includes(searchLower) ||
        machine.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
        machine.categories.some(cat => cat.toLowerCase().includes(searchLower))
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(machine =>
        selectedCategories.some(category => machine.categories.includes(category))
      );
    }

    // Tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(machine =>
        selectedTags.some(tag => machine.tags.includes(tag))
      );
    }

    // Password filter
    if (hasPasswordFilter !== null) {
      filtered = filtered.filter(machine =>
        hasPasswordFilter ? machine.passwords.length > 0 : machine.passwords.length === 0
      );
    }

    setFilteredMachines(filtered);
  }, [machines, searchTerm, selectedCategories, selectedTags, hasPasswordFilter]);

  useEffect(() => {
    loadMachines();
  }, []);

  useEffect(() => {
    filterMachines();
  }, [filterMachines]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Get unique categories and tags from all machines
  const getAllCategories = useCallback(() => {
    const categories = new Set<string>();
    machines.forEach(machine => {
      machine.categories.forEach(category => categories.add(category));
    });
    return Array.from(categories).sort();
  }, [machines]);

  const getAllTags = useCallback(() => {
    const tags = new Set<string>();
    machines.forEach(machine => {
      machine.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [machines]);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setSelectedTags([]);
    setHasPasswordFilter(null);
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <LoadingSpinner size="lg" />
        <p>Loading machines...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="dashboard-title-section">
          <h1 className="dashboard-title">Machine Manager</h1>
          <span className="version-indicator">{versionService.getFormattedVersion()}</span>
          <span className="new-feature-badge">✨ New</span>
        </div>
        
        <div className="dashboard-stats">
          <div className="stat-card">
            <span className="stat-number">{machines.length}</span>
            <span className="stat-label">Total Machines</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">
              {machines.filter(m => m.connectionCount > 0).length}
            </span>
            <span className="stat-label">Connected</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">
              {machines.filter(m => m.lastAccessed).length}
            </span>
            <span className="stat-label">Recently Used</span>
          </div>
        </div>
      </div>

      <div className="search-filter-bar">
        <input
          type="text"
          placeholder="Search machines by name, ID, address, or tags..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
        
        <div className="filter-section">
          <div className="filter-group">
            <h4>Categories</h4>
            <div className="filter-chips">
              {getAllCategories().map(category => (
                <button
                  key={category}
                  className={`filter-chip ${selectedCategories.includes(category) ? 'active' : ''}`}
                  onClick={() => handleCategoryToggle(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          
          <div className="filter-group">
            <h4>Tags</h4>
            <div className="filter-chips">
              {getAllTags().map(tag => (
                <button
                  key={tag}
                  className={`filter-chip ${selectedTags.includes(tag) ? 'active' : ''}`}
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          
          <div className="filter-group">
            <h4>Password</h4>
            <div className="filter-chips">
              <button
                className={`filter-chip ${hasPasswordFilter === true ? 'active' : ''}`}
                onClick={() => setHasPasswordFilter(hasPasswordFilter === true ? null : true)}
              >
                Has Passwords
              </button>
              <button
                className={`filter-chip ${hasPasswordFilter === false ? 'active' : ''}`}
                onClick={() => setHasPasswordFilter(hasPasswordFilter === false ? null : false)}
              >
                No Passwords
              </button>
            </div>
          </div>
          
          {(selectedCategories.length > 0 || selectedTags.length > 0 || hasPasswordFilter !== null) && (
            <button className="clear-filters-btn" onClick={clearAllFilters}>
              Clear All Filters
            </button>
          )}
        </div>
      </div>

      <div className="dashboard-actions">
        <Link to="/machine/new" className="btn btn-primary">
          <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Machine
        </Link>
      </div>

      {filteredMachines.length === 0 ? (
        <div className="empty-state">
          {machines.length === 0 ? (
            <>
              <div className="empty-state-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                  <line x1="8" y1="21" x2="16" y2="21"/>
                  <line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
              </div>
              <h3>No machines yet</h3>
              <p>Get started by adding your first machine to manage.</p>
              <Link to="/machine/new" className="btn btn-primary">
                Add Your First Machine
              </Link>
            </>
          ) : (
            <>
              <div className="empty-state-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
              </div>
              <h3>No machines found</h3>
              <p>Try adjusting your search terms.</p>
              <button 
                className="btn btn-secondary"
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="machine-grid">
          {filteredMachines.map((machine) => (
            <MachineCard key={machine.id} machine={machine} />
          ))}
        </div>
      )}
    </div>
  );
};

interface MachineCardProps {
  machine: Machine;
}

const MachineCard: React.FC<MachineCardProps> = ({ machine }) => {
  const formatLastAccessed = (date?: Date) => {
    return formatRelativeTimeHours(date);
  };

  const handleLaunchResult = (result: any) => {
    // Handle launch result if needed
    console.log('AnyDesk launch result:', result);
  };

  return (
    <div className="machine-card">
      <Link to={`/machine/${machine.id}`} className="machine-card-link">
        <div className="machine-card-header">
          <h3 className="machine-name">{machine.name}</h3>
          <span className="machine-connection-indicator">
            {machine.connectionCount > 0 && (
              <span className="connection-count" title={`Connected ${machine.connectionCount} times`}>
                {machine.connectionCount}
              </span>
            )}
          </span>
        </div>
        
        <div className="machine-id">{machine.anydeskId}</div>
        
        {machine.address && (
          <div className="machine-address">{machine.address}</div>
        )}
        
        {machine.tags.length > 0 && (
          <div className="machine-tags">
            {machine.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="machine-tag">
                {tag}
              </span>
            ))}
            {machine.tags.length > 3 && (
              <span className="machine-tag">+{machine.tags.length - 3}</span>
            )}
          </div>
        )}
        
        <div className="machine-footer">
          <span className="machine-last-accessed">
            Last: {formatLastAccessed(machine.lastAccessed)}
          </span>
          <span className="machine-password-count">
            {machine.passwords.length} password{machine.passwords.length !== 1 ? 's' : ''}
          </span>
        </div>
      </Link>
      
      <div className="machine-card-actions">
        <AnydeskLaunchButton
          machineId={machine.id}
          machineName={machine.name}
          anydeskId={machine.anydeskId}
          size="sm"
          variant="primary"
          onLaunchResult={handleLaunchResult}
        />
      </div>
    </div>
  );
};

export default Dashboard;
