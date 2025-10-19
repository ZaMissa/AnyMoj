import React, { useEffect, useState, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { indexedDBService } from './services/indexedDB.service';
import { useAutoBackup } from './hooks/useAutoBackup';
import Navigation from './components/Navigation';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import InstallPrompt from './components/InstallPrompt';
import ToastContainer from './components/ToastContainer';
import { useToast } from './hooks/useToast';
import './App.css';

// Lazy load pages for better performance
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const MachineDetail = React.lazy(() => import('./pages/MachineDetail'));
const MachineEdit = React.lazy(() => import('./pages/MachineEdit'));
const History = React.lazy(() => import('./pages/History'));
const Settings = React.lazy(() => import('./pages/Settings'));

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const { initializeBackup } = useAutoBackup();
  const { toasts, removeToast, showSuccess } = useToast();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize IndexedDB
        await indexedDBService.initialize();
        
        // Apply dark mode setting on app load
        const settings = await indexedDBService.getSettings();
        if (settings?.darkMode) {
          document.documentElement.classList.add('dark');
        } else {
          // Check system preference if no setting is saved
          if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
        
        // Initialize backup system
        const backupResult = await initializeBackup();
        
        if (backupResult.restored) {
          console.log('Data restored from backup');
          showSuccess('Data Restored', 'Your data has been successfully restored from backup');
        }
        
        setIsInitialized(true);
        showSuccess('App Initialized', 'AnyMoj is ready to use');
      } catch (error) {
        console.error('App initialization failed:', error);
        setInitError(error instanceof Error ? error.message : 'Unknown error');
      }
    };

    initializeApp();
  }, [initializeBackup, showSuccess]);

  if (!isInitialized) {
    return (
      <div className="app-loading">
        <LoadingSpinner />
        <p>Initializing Machine Manager...</p>
        {initError && (
          <div className="error-message">
            <p>Initialization failed: {initError}</p>
            <button onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router basename="/AnyMoj">
        <div className="app">
          <main className="app-main">
            <Suspense fallback={
              <div className="page-loading">
                <LoadingSpinner size="lg" />
                <p>Loading page...</p>
              </div>
            }>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/machine/:id" element={<MachineDetail />} />
                <Route path="/machine/:id/edit" element={<MachineEdit />} />
                <Route path="/machine/new" element={<MachineEdit />} />
                <Route path="/history" element={<History />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </Suspense>
          </main>
          <Navigation />
          <InstallPrompt />
          <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
