import React, { useState, useEffect } from 'react';
import './InstallPrompt.css';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return;
      }
      
      // Check for iOS Safari
      if ((window.navigator as any).standalone === true) {
        setIsInstalled(true);
        return;
      }
    };

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Check if user has dismissed the prompt before
      const dismissed = sessionStorage.getItem('installPromptDismissed');
      if (dismissed) {
        setIsDismissed(true);
      } else {
        // Show install prompt after a delay to not be intrusive
        setTimeout(() => {
          setShowInstallPrompt(true);
        }, 3000);
      }
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    checkInstalled();

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setIsDismissed(true);
    // Don't show again for this session
    sessionStorage.setItem('installPromptDismissed', 'true');
  };

  const handleShowPrompt = () => {
    setShowInstallPrompt(true);
    setIsDismissed(false);
  };

  // Don't show anything if already installed
  if (isInstalled) {
    return null;
  }

  // Show small install button if dismissed and prompt is available
  if (isDismissed && deferredPrompt && !showInstallPrompt) {
    return (
      <div className="install-floating-button" onClick={handleShowPrompt}>
        <div className="install-floating-icon">
          <svg width="20" height="20" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
            <circle cx="256" cy="256" r="240" fill="#2563eb"/>
            <rect x="128" y="160" width="256" height="192" rx="16" fill="#ffffff"/>
            <rect x="144" y="176" width="224" height="128" rx="8" fill="#1e40af"/>
            <rect x="160" y="192" width="192" height="96" rx="4" fill="#3b82f6"/>
            <circle cx="400" cy="200" r="12" fill="#10b981"/>
          </svg>
        </div>
        <span className="install-floating-text">Install</span>
      </div>
    );
  }

  // Don't show full prompt if not available or not ready to show
  if (!deferredPrompt || !showInstallPrompt) {
    return null;
  }

  return (
    <div className="install-prompt-overlay">
      <div className="install-prompt">
        <div className="install-prompt-header">
          <h3>Install AnyMoj</h3>
          <button 
            className="install-prompt-close" 
            onClick={handleDismiss}
            aria-label="Close install prompt"
          >
            ×
          </button>
        </div>
        
        <div className="install-prompt-content">
          <div className="install-prompt-icon">
            <svg width="48" height="48" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
              <circle cx="256" cy="256" r="240" fill="#2563eb"/>
              <rect x="128" y="160" width="256" height="192" rx="16" fill="#ffffff"/>
              <rect x="144" y="176" width="224" height="128" rx="8" fill="#1e40af"/>
              <rect x="160" y="192" width="192" height="96" rx="4" fill="#3b82f6"/>
              <circle cx="400" cy="200" r="12" fill="#10b981"/>
            </svg>
          </div>
          
          <p>Install AnyMoj on your device for quick access to your machine connections.</p>
          
          <div className="install-prompt-benefits">
            <div className="benefit">
              <span className="benefit-icon">📱</span>
              <span>Works offline</span>
            </div>
            <div className="benefit">
              <span className="benefit-icon">⚡</span>
              <span>Faster access</span>
            </div>
            <div className="benefit">
              <span className="benefit-icon">🔒</span>
              <span>Secure local storage</span>
            </div>
          </div>
        </div>
        
        <div className="install-prompt-actions">
          <button 
            className="install-prompt-dismiss" 
            onClick={handleDismiss}
          >
            Not now
          </button>
          <button 
            className="install-prompt-install" 
            onClick={handleInstallClick}
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
