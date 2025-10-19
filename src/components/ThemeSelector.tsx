import React, { useState } from 'react';
import './ThemeSelector.css';

interface ThemeSelectorProps {
  onThemeSelect: (theme: 'light' | 'dark') => void;
  isFirstLaunch?: boolean;
  onClose?: () => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ 
  onThemeSelect, 
  isFirstLaunch = false,
  onClose 
}) => {
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | null>(null);

  const handleThemeSelect = (theme: 'light' | 'dark') => {
    setSelectedTheme(theme);
    onThemeSelect(theme);
  };

  const handleContinue = () => {
    if (selectedTheme) {
      onThemeSelect(selectedTheme);
      if (onClose) {
        onClose();
      }
    }
  };

  return (
    <div className="theme-selector-overlay">
      <div className="theme-selector-modal">
        <div className="theme-selector-header">
          <h2>{isFirstLaunch ? 'Welcome to AnyMoj!' : 'Choose Your Theme'}</h2>
          <p className="theme-selector-subtitle">
            {isFirstLaunch 
              ? 'Let\'s start by choosing your preferred theme. You can change this anytime in settings.'
              : 'Select your preferred theme for the application.'
            }
          </p>
        </div>

        <div className="theme-options">
          <div 
            className={`theme-option ${selectedTheme === 'light' ? 'selected' : ''}`}
            onClick={() => handleThemeSelect('light')}
          >
            <div className="theme-preview light-preview">
              <div className="preview-header">
                <div className="preview-dot"></div>
                <div className="preview-dot"></div>
                <div className="preview-dot"></div>
              </div>
              <div className="preview-content">
                <div className="preview-line"></div>
                <div className="preview-line short"></div>
                <div className="preview-line medium"></div>
              </div>
            </div>
            <div className="theme-info">
              <h3>Light Theme</h3>
              <p>Clean and bright interface</p>
            </div>
          </div>

          <div 
            className={`theme-option ${selectedTheme === 'dark' ? 'selected' : ''}`}
            onClick={() => handleThemeSelect('dark')}
          >
            <div className="theme-preview dark-preview">
              <div className="preview-header">
                <div className="preview-dot"></div>
                <div className="preview-dot"></div>
                <div className="preview-dot"></div>
              </div>
              <div className="preview-content">
                <div className="preview-line"></div>
                <div className="preview-line short"></div>
                <div className="preview-line medium"></div>
              </div>
            </div>
            <div className="theme-info">
              <h3>Dark Theme</h3>
              <p>Easy on the eyes, especially in low light</p>
            </div>
          </div>
        </div>

        <div className="theme-selector-actions">
          {isFirstLaunch ? (
            <button 
              className="btn btn-primary theme-continue-btn"
              onClick={handleContinue}
              disabled={!selectedTheme}
            >
              Continue with {selectedTheme === 'light' ? 'Light' : 'Dark'} Theme
            </button>
          ) : (
            <div className="theme-actions-row">
              <button 
                className="btn btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleContinue}
                disabled={!selectedTheme}
              >
                Apply Theme
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector;
