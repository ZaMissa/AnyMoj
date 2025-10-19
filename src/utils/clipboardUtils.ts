/**
 * Utility functions for clipboard operations
 * Handles copying text to clipboard with proper error handling and user feedback
 */

/**
 * Copies text to clipboard with fallback for older browsers
 * @param text - The text to copy to clipboard
 * @returns Promise<boolean> - True if successful, false if failed
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    // Modern clipboard API (preferred)
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    
    // Fallback for older browsers or non-secure contexts
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    return successful;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

/**
 * Shows a temporary toast notification for copy feedback
 * @param message - The message to display
 * @param isSuccess - Whether the operation was successful
 */
export const showCopyFeedback = (message: string, isSuccess: boolean = true): void => {
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `copy-feedback ${isSuccess ? 'success' : 'error'}`;
  toast.textContent = message;
  
  // Style the toast
  Object.assign(toast.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '12px 20px',
    borderRadius: '8px',
    color: 'white',
    fontWeight: '600',
    fontSize: '14px',
    zIndex: '10000',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    transform: 'translateX(100%)',
    transition: 'transform 0.3s ease-in-out',
    backgroundColor: isSuccess ? '#10b981' : '#ef4444',
    maxWidth: '300px',
    wordWrap: 'break-word'
  });
  
  document.body.appendChild(toast);
  
  // Animate in
  setTimeout(() => {
    toast.style.transform = 'translateX(0)';
  }, 10);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, 3000);
};

/**
 * Copies text to clipboard and shows user feedback
 * @param text - The text to copy
 * @param successMessage - Message to show on success
 * @param errorMessage - Message to show on error
 */
export const copyWithFeedback = async (
  text: string, 
  successMessage: string = 'Copied to clipboard!',
  errorMessage: string = 'Failed to copy to clipboard'
): Promise<void> => {
  const success = await copyToClipboard(text);
  showCopyFeedback(success ? successMessage : errorMessage, success);
};
