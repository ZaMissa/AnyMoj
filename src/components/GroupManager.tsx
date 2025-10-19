import React, { useState, useEffect } from 'react';
import { Group, Machine } from '../types/machine.types';
import { indexedDBService } from '../services/indexedDB.service';
import LoadingSpinner from './LoadingSpinner';
import './GroupManager.css';

interface GroupManagerProps {
  machines: Machine[];
  onGroupChange: () => void;
}

const GroupManager: React.FC<GroupManagerProps> = ({ machines, onGroupChange }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3b82f6'
  });

  const predefinedColors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
    '#8b5cf6', '#06b6d4', '#84cc16', '#f97316',
    '#ec4899', '#6366f1', '#14b8a6', '#eab308'
  ];

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const settings = await indexedDBService.getSettings();
      const groupsWithCounts = (settings?.groups || []).map(group => ({
        ...group,
        machineCount: machines.filter(m => m.groupId === group.id).length
      }));
      setGroups(groupsWithCounts);
    } catch (error) {
      console.error('Failed to load groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      const settings = await indexedDBService.getSettings();
      const newGroup: Group = {
        id: crypto.randomUUID(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        color: formData.color,
        createdAt: new Date(),
        updatedAt: new Date(),
        machineCount: 0
      };

      const updatedGroups = editingGroup
        ? groups.map(g => g.id === editingGroup.id ? { ...newGroup, id: editingGroup.id, createdAt: editingGroup.createdAt } : g)
        : [...groups, newGroup];

      await indexedDBService.updateSettings({
        ...settings,
        groups: updatedGroups
      });

      setGroups(updatedGroups);
      setShowCreateForm(false);
      setEditingGroup(null);
      setFormData({ name: '', description: '', color: '#3b82f6' });
      onGroupChange();
    } catch (error) {
      console.error('Failed to save group:', error);
      alert('Failed to save group. Please try again.');
    }
  };

  const handleEdit = (group: Group) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      description: group.description || '',
      color: group.color
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this group? Machines in this group will be ungrouped.')) {
      return;
    }

    try {
      // Remove group from all machines
      const machinesToUpdate = machines.filter(m => m.groupId === groupId);
      for (const machine of machinesToUpdate) {
        await indexedDBService.updateMachine({
          ...machine,
          groupId: undefined
        });
      }

      // Remove group from settings
      const settings = await indexedDBService.getSettings();
      const updatedGroups = groups.filter(g => g.id !== groupId);
      await indexedDBService.updateSettings({
        ...settings,
        groups: updatedGroups
      });

      setGroups(updatedGroups);
      onGroupChange();
    } catch (error) {
      console.error('Failed to delete group:', error);
      alert('Failed to delete group. Please try again.');
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingGroup(null);
    setFormData({ name: '', description: '', color: '#3b82f6' });
  };

  if (loading) {
    return (
      <div className="group-manager-loading">
        <LoadingSpinner size="md" />
        <p>Loading groups...</p>
      </div>
    );
  }

  return (
    <div className="group-manager">
      <div className="group-manager-header">
        <h3>Machine Groups</h3>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn btn-primary btn-sm"
        >
          + Add Group
        </button>
      </div>

      {showCreateForm && (
        <div className="group-form-overlay">
          <div className="group-form">
            <h4>{editingGroup ? 'Edit Group' : 'Create New Group'}</h4>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="group-name">Group Name *</label>
                <input
                  id="group-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter group name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="group-description">Description</label>
                <textarea
                  id="group-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter group description (optional)"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Color</label>
                <div className="color-picker">
                  {predefinedColors.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`color-option ${formData.color === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={handleCancel} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingGroup ? 'Update Group' : 'Create Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="groups-list">
        {groups.length === 0 ? (
          <div className="no-groups">
            <p>No groups created yet. Create your first group to organize your machines.</p>
          </div>
        ) : (
          groups.map(group => (
            <div key={group.id} className="group-item">
              <div className="group-info">
                <div 
                  className="group-color-indicator" 
                  style={{ backgroundColor: group.color }}
                />
                <div className="group-details">
                  <h4>{group.name}</h4>
                  {group.description && <p>{group.description}</p>}
                  <span className="machine-count">
                    {group.machineCount} machine{group.machineCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <div className="group-actions">
                <button
                  onClick={() => handleEdit(group)}
                  className="btn btn-sm btn-secondary"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(group.id)}
                  className="btn btn-sm btn-error"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GroupManager;
