import React, { useState, useEffect } from 'react';
import { ConnectionHistory } from '../types/machine.types';
import { indexedDBService } from '../services/indexedDB.service';
import LoadingSpinner from '../components/LoadingSpinner';

const History: React.FC = () => {
  const [history, setHistory] = useState<ConnectionHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const historyData = await indexedDBService.getConnectionHistory();
      // Sort by timestamp, newest first
      const sortedHistory = historyData.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setHistory(sortedHistory);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return date.toLocaleDateString();
  };

  const getActionIcon = (action: ConnectionHistory['action']) => {
    switch (action) {
      case 'launch_success':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22,4 12,14.01 9,11.01"/>
          </svg>
        );
      case 'launch_failure':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        );
      case 'launch_attempt':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12,6 12,12 16,14"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const getActionColor = (action: ConnectionHistory['action']) => {
    switch (action) {
      case 'launch_success':
        return 'text-success';
      case 'launch_failure':
        return 'text-error';
      case 'launch_attempt':
        return 'text-warning';
      default:
        return 'text-secondary';
    }
  };

  const getActionText = (action: ConnectionHistory['action']) => {
    switch (action) {
      case 'launch_success':
        return 'Connected successfully';
      case 'launch_failure':
        return 'Connection failed';
      case 'launch_attempt':
        return 'Connection attempted';
      default:
        return 'Unknown action';
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <LoadingSpinner size="lg" />
        <p>Loading connection history...</p>
      </div>
    );
  }

  return (
    <div className="history-page">
      <div className="page-header">
        <h1 className="page-title">Connection History</h1>
        <p className="page-subtitle">
          Track all your AnyDesk connection attempts
        </p>
      </div>

      {history.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
            </svg>
          </div>
          <h3>No connection history yet</h3>
          <p>Start using AnyDesk quick launch to see your connection history here.</p>
        </div>
      ) : (
        <div className="history-list">
          {history.map((entry) => (
            <div key={entry.id} className="history-item">
              <div className="history-icon">
                <div className={`action-icon ${getActionColor(entry.action)}`}>
                  {getActionIcon(entry.action)}
                </div>
              </div>
              
              <div className="history-content">
                <div className="history-main">
                  <span className="machine-id">{entry.machineId}</span>
                  <span className={`action-text ${getActionColor(entry.action)}`}>
                    {getActionText(entry.action)}
                  </span>
                </div>
                
                <div className="history-meta">
                  <span className="timestamp">{formatTimestamp(entry.timestamp)}</span>
                  {entry.notes && (
                    <span className="notes">{entry.notes}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
