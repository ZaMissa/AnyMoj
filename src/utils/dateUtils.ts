/**
 * Utility functions for handling date conversion and formatting
 * This ensures consistent date handling across the application
 */

/**
 * Safely converts a date value to a Date object
 * Handles both Date objects and date strings from IndexedDB
 */
export const toDate = (dateValue: Date | string | undefined | null): Date | null => {
  if (!dateValue) return null;
  if (dateValue instanceof Date) return dateValue;
  return new Date(dateValue);
};

/**
 * Safely formats a date value to a localized date string
 * Returns 'Never' for null/undefined values
 */
export const formatDate = (dateValue: Date | string | undefined | null): string => {
  const date = toDate(dateValue);
  if (!date) return 'Never';
  return date.toLocaleDateString();
};

/**
 * Safely formats a date value to a localized date and time string
 * Returns 'Never' for null/undefined values
 */
export const formatDateTime = (dateValue: Date | string | undefined | null): string => {
  const date = toDate(dateValue);
  if (!date) return 'Never';
  return date.toLocaleString();
};

/**
 * Formats a date for relative time display (e.g., "2 hours ago")
 */
export const formatRelativeTime = (dateValue: Date | string | undefined | null): string => {
  const date = toDate(dateValue);
  if (!date) return 'Never';
  
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
  return date.toLocaleDateString();
};

/**
 * Formats a date for relative time display in hours (e.g., "2 hours ago")
 */
export const formatRelativeTimeHours = (dateValue: Date | string | undefined | null): string => {
  const date = toDate(dateValue);
  if (!date) return 'Never';
  
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
  return date.toLocaleDateString();
};
