import React, { useEffect, useState } from 'react';
import { versionService } from '../services/version.service';
import UpdateConfirmation from './UpdateConfirmation';

const UpdateHandler: React.FC = () => {
  const [pendingUpdate, setPendingUpdate] = useState<{
    currentVersion: string;
    newVersion: string;
    releaseNotes?: string;
  } | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    // Check for pending updates on app startup
    const pending = versionService.getPendingUpdate();
    if (pending) {
      setPendingUpdate(pending);
      setShowConfirmation(true);
    }
  }, []);

  const handleConfirmUpdate = async () => {
    try {
      await versionService.executePendingUpdate();
      // The page will reload automatically
    } catch (error) {
      console.error('Failed to execute update:', error);
      setShowConfirmation(false);
    }
  };

  const handleCancelUpdate = () => {
    setShowConfirmation(false);
    setPendingUpdate(null);
    // Clear pending update
    localStorage.removeItem('pending_update');
  };

  if (!pendingUpdate) {
    return null;
  }

  return (
    <UpdateConfirmation
      isOpen={showConfirmation}
      onClose={handleCancelUpdate}
      onConfirm={handleConfirmUpdate}
      currentVersion={pendingUpdate.currentVersion}
      newVersion={pendingUpdate.newVersion}
      releaseNotes={pendingUpdate.releaseNotes}
    />
  );
};

export default UpdateHandler;
