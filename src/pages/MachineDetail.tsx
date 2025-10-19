import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Machine, AnyDeskLaunchResult } from '../types/machine.types';
import { indexedDBService } from '../services/indexedDB.service';
import LoadingSpinner from '../components/LoadingSpinner';
import AnydeskLaunchButton from '../components/AnydeskLaunchButton';
import './MachineDetail.css';

// Password item component with show/hide functionality
const PasswordItem: React.FC<{ password: string; index: number }> = ({ password, index }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="password-item">
      <span className="password-value">
        {isVisible ? password : '*'.repeat(password.length)}
      </span>
      <button 
        className="btn btn-sm"
        onClick={() => setIsVisible(!isVisible)}
      >
        {isVisible ? 'Hide' : 'Show'}
      </button>
      <button 
        className="btn btn-sm btn-secondary"
        onClick={() => {
          navigator.clipboard.writeText(password);
          alert('Password copied to clipboard!');
        }}
      >
        Copy
      </button>
    </div>
  );
};

const MachineDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [machine, setMachine] = useState<Machine | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadMachine(id);
    }
  }, [id]);

  const loadMachine = async (machineId: string) => {
    try {
      setLoading(true);
      const machineData = await indexedDBService.getMachine(machineId);
      if (machineData) {
        setMachine(machineData);
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Failed to load machine:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!machine || !window.confirm('Are you sure you want to delete this machine?')) {
      return;
    }

    try {
      await indexedDBService.deleteMachine(machine.id);
      navigate('/');
    } catch (error) {
      console.error('Failed to delete machine:', error);
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <LoadingSpinner size="lg" />
        <p>Loading machine details...</p>
      </div>
    );
  }

  if (!machine) {
    return (
      <div className="page-error">
        <h2>Machine not found</h2>
        <Link to="/" className="btn btn-primary">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="machine-detail">
      <div className="page-header">
        <Link to="/" className="btn btn-secondary">
          ← Back to Dashboard
        </Link>
        <h1 className="page-title">{machine.name}</h1>
      </div>

      <div className="machine-info">
        <div className="info-section">
          <h3>Basic Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Machine ID</label>
              <span className="machine-id">{machine.id}</span>
              <button
                className="btn btn-secondary btn-sm copy-btn"
                onClick={() => {
                  navigator.clipboard.writeText(machine.id);
                  alert('Machine ID copied to clipboard!');
                }}
                title="Copy Machine ID"
              >
                📋 Copy ID
              </button>
            </div>
            <div className="info-item">
              <label>AnyDesk ID</label>
              <span className="anydesk-id">{machine.anydeskId}</span>
              <button
                className="btn btn-secondary btn-sm copy-btn"
                onClick={() => {
                  navigator.clipboard.writeText(machine.anydeskId);
                  alert('AnyDesk ID copied to clipboard!');
                }}
                title="Copy AnyDesk ID"
              >
                📋 Copy ID
              </button>
              <AnydeskLaunchButton
                machineId={machine.id}
                machineName={machine.name}
                anydeskId={machine.anydeskId}
                size="sm"
                variant="primary"
              />
            </div>
            {machine.address && (
              <div className="info-item">
                <label>Address</label>
                <span>{machine.address}</span>
              </div>
            )}
            <div className="info-item">
              <label>Created</label>
              <span>{machine.createdAt.toLocaleDateString()}</span>
            </div>
            {machine.lastAccessed && (
              <div className="info-item">
                <label>Last Accessed</label>
                <span>{machine.lastAccessed.toLocaleDateString()}</span>
              </div>
            )}
            <div className="info-item">
              <label>Connections</label>
              <span>{machine.connectionCount} times</span>
            </div>
          </div>
        </div>

        {machine.notes && (
          <div className="info-section">
            <h3>Notes</h3>
            <p className="notes">{machine.notes}</p>
          </div>
        )}

        {machine.passwords.length > 0 && (
          <div className="info-section">
            <h3>Passwords</h3>
            <div className="password-list">
              {machine.passwords.map((password, index) => (
                <PasswordItem key={index} password={password} index={index} />
              ))}
            </div>
          </div>
        )}

        {machine.tags.length > 0 && (
          <div className="info-section">
            <h3>Tags</h3>
            <div className="tags-list">
              {machine.tags.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>
          </div>
        )}

        {machine.categories.length > 0 && (
          <div className="info-section">
            <h3>Categories</h3>
            <div className="categories-list">
              {machine.categories.map((category, index) => (
                <span key={index} className="category">{category}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="page-actions">
        <AnydeskLaunchButton
          machineId={machine.id}
          machineName={machine.name}
          anydeskId={machine.anydeskId}
          size="lg"
          variant="primary"
        />
        <Link to={`/machine/${machine.id}/edit`} className="btn btn-secondary">
          Edit Machine
        </Link>
        <button onClick={handleDelete} className="btn btn-error">
          Delete Machine
        </button>
      </div>
    </div>
  );
};

export default MachineDetail;
