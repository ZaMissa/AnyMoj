import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Machine, MachineFormData } from '../types/machine.types';
import { indexedDBService } from '../services/indexedDB.service';
import LoadingSpinner from '../components/LoadingSpinner';

const MachineEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<MachineFormData>({
    name: '',
    anydeskId: '',
    address: '',
    passwords: [''],
    notes: '',
    categories: [],
    tags: [],
    customFields: [],
  });

  const isEditing = id && id !== 'new';

  useEffect(() => {
    if (isEditing && id) {
      loadMachine(id);
    } else {
      setLoading(false);
    }
  }, [id, isEditing]);

  const loadMachine = async (machineId: string) => {
    try {
      setLoading(true);
      const machine = await indexedDBService.getMachine(machineId);
      if (machine) {
        setFormData({
          name: machine.name,
          anydeskId: machine.anydeskId,
          address: machine.address || '',
          passwords: machine.passwords.length > 0 ? machine.passwords : [''],
          notes: machine.notes || '',
          categories: machine.categories,
          tags: machine.tags,
          customFields: machine.customFields,
        });
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

  const handleInputChange = (field: keyof MachineFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (index: number, value: string) => {
    const newPasswords = [...formData.passwords];
    newPasswords[index] = value;
    setFormData(prev => ({ ...prev, passwords: newPasswords }));
  };

  const addPassword = () => {
    setFormData(prev => ({ ...prev, passwords: [...prev.passwords, ''] }));
  };

  const removePassword = (index: number) => {
    if (formData.passwords.length > 1) {
      const newPasswords = formData.passwords.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, passwords: newPasswords }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.anydeskId.trim()) {
      alert('Name and AnyDesk ID are required');
      return;
    }

    // Validate AnyDesk ID format (should be numeric)
    if (!/^\d+$/.test(formData.anydeskId.trim())) {
      alert('AnyDesk ID must contain only numbers');
      return;
    }

    try {
      setSaving(true);
      
      // Check if AnyDesk ID already exists (if creating new machine or changing ID)
      if (!isEditing || formData.anydeskId !== (await indexedDBService.getMachine(id!))?.anydeskId) {
        const existingMachine = await indexedDBService.getMachineByAnyDeskId(formData.anydeskId.trim());
        if (existingMachine && existingMachine.id !== id) {
          alert('A machine with this AnyDesk ID already exists');
          return;
        }
      }
      
      const machineData: Machine = {
        id: isEditing ? id! : crypto.randomUUID(),
        name: formData.name.trim(),
        anydeskId: formData.anydeskId.trim(),
        address: formData.address.trim() || undefined,
        passwords: formData.passwords.filter(p => p.trim()),
        notes: formData.notes.trim() || undefined,
        categories: formData.categories,
        tags: formData.tags,
        customFields: formData.customFields,
        createdAt: isEditing ? (await indexedDBService.getMachine(id!))!.createdAt : new Date(),
        updatedAt: new Date(),
        lastAccessed: isEditing ? (await indexedDBService.getMachine(id!))!.lastAccessed : undefined,
        connectionCount: isEditing ? (await indexedDBService.getMachine(id!))!.connectionCount : 0,
      };

      if (isEditing) {
        await indexedDBService.updateMachine(machineData);
      } else {
        await indexedDBService.addMachine(machineData);
      }

      navigate(`/machine/${machineData.id}`);
    } catch (error) {
      console.error('Failed to save machine:', error);
      alert('Failed to save machine. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <LoadingSpinner size="lg" />
        <p>Loading machine data...</p>
      </div>
    );
  }

  return (
    <div className="machine-edit">
      <div className="page-header">
        <Link to={isEditing ? `/machine/${id}` : '/'} className="btn btn-secondary">
          ← {isEditing ? 'Back to Machine' : 'Back to Dashboard'}
        </Link>
        <h1 className="page-title">
          {isEditing ? 'Edit Machine' : 'Add New Machine'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="machine-form">
        <div className="form-section">
          <h3>Basic Information</h3>
          
          <div className="form-group">
            <label className="form-label">Machine Name *</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter machine name"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">AnyDesk ID *</label>
            <input
              type="text"
              className="form-input"
              value={formData.anydeskId}
              onChange={(e) => handleInputChange('anydeskId', e.target.value)}
              placeholder="Enter AnyDesk ID"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Address/IP</label>
            <input
              type="text"
              className="form-input"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Enter IP address or hostname"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Passwords</h3>
          {formData.passwords.map((password, index) => (
            <div key={index} className="password-input-group">
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => handlePasswordChange(index, e.target.value)}
                placeholder="Enter password"
              />
              {formData.passwords.length > 1 && (
                <button
                  type="button"
                  className="btn btn-error btn-sm"
                  onClick={() => removePassword(index)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={addPassword}
          >
            Add Password
          </button>
        </div>

        <div className="form-section">
          <h3>Additional Information</h3>
          
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea
              className="form-input form-textarea"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Enter any additional notes"
              rows={4}
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? <LoadingSpinner size="sm" /> : (isEditing ? 'Update Machine' : 'Create Machine')}
          </button>
          <Link
            to={isEditing ? `/machine/${id}` : '/'}
            className="btn btn-secondary"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default MachineEdit;
