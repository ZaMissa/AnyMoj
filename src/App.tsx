import React, { useEffect, useState, Suspense } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { indexedDBService } from './services/indexedDB.service';
import { useAutoBackup } from './hooks/useAutoBackup';
import Navigation from './components/Navigation';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import InstallPrompt from './components/InstallPrompt';
import ToastContainer from './components/ToastContainer';
import ThemeSelector from './components/ThemeSelector';
import UpdateNotification from './components/UpdateNotification';
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
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);
  const { initializeBackup } = useAutoBackup();
  const { toasts, removeToast, showSuccess } = useToast();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize IndexedDB
        await indexedDBService.initialize();
        
        // Check if this is first launch or theme chooser requested
        const settings = await indexedDBService.getSettings();
        const isFirstTime = !settings || settings.darkMode === undefined;
        const showThemeChooser = localStorage.getItem('showThemeChooser') === 'true';
        
        if (isFirstTime || showThemeChooser) {
          // First launch or theme chooser requested - show theme selector
          setIsFirstLaunch(isFirstTime);
          setShowThemeSelector(true);
          setIsInitialized(true); // Allow app to render so theme selector can show
          
          // Clear the flag if it was set
          if (showThemeChooser) {
            localStorage.removeItem('showThemeChooser');
          }
        } else {
          // Apply saved theme setting
          if (settings.darkMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          
          // Initialize backup system
          const backupResult = await initializeBackup();
          
          if (backupResult.restored) {
            console.log('Data restored from backup');
            showSuccess('Data Restored', 'Your data has been successfully restored from backup');
          }
          
          setIsInitialized(true);
          showSuccess('App Initialized', 'AnyMoj is ready to use');
        }
      } catch (error) {
        console.error('App initialization failed:', error);
        setInitError(error instanceof Error ? error.message : 'Unknown error');
      }
    };

    initializeApp();
  }, [initializeBackup, showSuccess]);

  const handleThemeSelect = async (theme: 'light' | 'dark') => {
    try {
      // Apply theme immediately
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      // Save theme setting
      const currentSettings = await indexedDBService.getSettings();
      const updatedSettings = {
        ...currentSettings,
        darkMode: theme === 'dark'
      };
      await indexedDBService.updateSettings(updatedSettings);

      // Initialize backup system after theme selection
      if (isFirstLaunch) {
        const backupResult = await initializeBackup();
        
        if (backupResult.restored) {
          console.log('Data restored from backup');
          showSuccess('Data Restored', 'Your data has been successfully restored from backup');
        }
        
        showSuccess('Welcome!', 'AnyMoj is ready to use');
      }

      // Close theme selector
      setShowThemeSelector(false);
      setIsFirstLaunch(false);
    } catch (error) {
      console.error('Failed to save theme setting:', error);
    }
  };

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
      <Router>
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
          <UpdateNotification />
          {showThemeSelector && (
            <ThemeSelector
              onThemeSelect={handleThemeSelect}
              isFirstLaunch={isFirstLaunch}
              onClose={() => setShowThemeSelector(false)}
            />
          )}
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
