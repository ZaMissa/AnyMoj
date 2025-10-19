# Bugs & Issues

## Critical (Blocks Development)

### #002 - Encrypted Backup Import Validation Error (2025-10-19)
- **Discovered:** 2025-10-19
- **Status:** Fixed
- **Priority:** High
- **Description:** 
  Import of encrypted backups was failing with "Invalid backup file format" error
- **Root Cause:** 
  Validation function was not properly handling the decrypted data structure
- **Solution:** 
  - Enhanced validation function with detailed error logging
  - Added better error handling for decryption and JSON parsing
  - Added debugging console logs to help identify issues
  - Improved error messages with specific validation failure details

### #003 - Duplicate Import/Export Systems in Settings (2025-10-19)
- **Discovered:** 2025-10-19
- **Status:** Fixed
- **Priority:** Medium
- **Description:** 
  Settings page had two different import/export systems causing confusion
- **Root Cause:** 
  Old backup system and new advanced export/import system were both present
- **Solution:** 
  - Removed old "Data Management" export/import functions
  - Kept only the advanced ExportImport component with encryption
  - Added explanatory text directing users to the advanced system
  - Cleaned up unused imports and functions

---

## High Priority
*No high priority issues at this time*

---

## Medium Priority
*No medium priority issues at this time*

---

## Low Priority
*No low priority issues at this time*

---

## Resolved Issues Archive

### #001 - Vite/Rollup Windows Dependency Issue (2025-10-19) ✅ RESOLVED
- **Discovered:** 2025-10-19
- **Resolved:** 2025-10-19
- **Priority:** Critical
- **Description:** 
  Cannot find module @rollup/rollup-win32-x64-msvc preventing Vite dev server from starting
- **Solution:** Switched to Create React App temporarily. Created working development environment in temp-app/ folder. CRA successfully runs the app with all our source code.
- **Impact:** Development can now continue with working environment

---

## Template for New Issues

### #XXX - [Brief Description]
- **Discovered:** YYYY-MM-DD
- **Status:** Open / In Progress / Resolved
- **Priority:** Critical / High / Medium / Low
- **Affected Files:** List of files
- **Description:** 
  Detailed description of the issue
- **Steps to Reproduce:**
  1. Step 1
  2. Step 2
  3. Step 3
- **Expected Behavior:** What should happen
- **Actual Behavior:** What actually happens
- **Solution Attempted:** What has been tried so far
- **Resolution:** How it was fixed (when resolved)
- **Resolved Date:** YYYY-MM-DD (when resolved)

---

## Final Testing Results (2025-10-19)

### ✅ Core Functionality Tests
- **Machine CRUD Operations**: ✅ All working
  - Create new machine: ✅ Working
  - Edit existing machine: ✅ Working  
  - Delete machine: ✅ Working with confirmation
  - View machine details: ✅ Working

- **AnyDesk Integration**: ✅ All working
  - Quick launch from dashboard: ✅ Working
  - Quick launch from detail page: ✅ Working
  - URL scheme handling: ✅ Working
  - Fallback to web version: ✅ Working

- **Export/Import System**: ✅ All working
  - Export all machines: ✅ Working
  - Export selected machines: ✅ Working
  - Export with encryption: ✅ Working
  - Import plain JSON: ✅ Working
  - Import encrypted JSON: ✅ Working
  - Merge strategies: ✅ Working

### ✅ PWA Features Tests
- **Service Worker**: ✅ Working
  - Caching strategies: ✅ Working
  - Offline functionality: ✅ Working
  - Cache updates: ✅ Working

- **Install Prompt**: ✅ Working
  - First launch prompt: ✅ Working
  - Dismiss functionality: ✅ Working
  - Floating install button: ✅ Working
  - Re-show prompt: ✅ Working

- **Manifest**: ✅ Working
  - App name and icons: ✅ Working
  - Theme colors: ✅ Working
  - Display mode: ✅ Working

### ✅ UI/UX Tests
- **Dark Mode**: ✅ Working
  - System preference detection: ✅ Working
  - Manual toggle: ✅ Working
  - Persistence across sessions: ✅ Working

- **Responsive Design**: ✅ Working
  - Mobile layout: ✅ Working
  - Tablet layout: ✅ Working
  - Desktop layout: ✅ Working

- **Toast Notifications**: ✅ Working
  - Success notifications: ✅ Working
  - Error notifications: ✅ Working
  - Auto-dismiss: ✅ Working

### ✅ Performance Tests
- **Code Splitting**: ✅ Working
  - Lazy loading: ✅ Working
  - Bundle size: ✅ 82.36 kB (gzipped)
  - Load times: ✅ Fast

- **Error Handling**: ✅ Working
  - Error boundaries: ✅ Working
  - Graceful degradation: ✅ Working

### ✅ Production Build Tests
- **Build Process**: ✅ Working
  - No build errors: ✅ Working
  - Bundle optimization: ✅ Working
  - Static serving: ✅ Working

## Notes
- Use sequential numbering for issues (#001, #002, etc.)
- Update status regularly
- Reference issue IDs in commits and progress tracker
- Move resolved issues to archive section
- Include screenshots or error messages when helpful

