import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className = '' }) => {
  return (
    <div className={`spinner spinner-${size} ${className}`}>
      <div className="spinner-inner"></div>
    </div>
  );
};

export default LoadingSpinner;
