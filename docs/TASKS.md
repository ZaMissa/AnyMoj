# Task Breakdown

## Phase 1: Project Setup & Core Infrastructure

### 1.1 Initialize Vite Project @pending
- [ ] Run `npm create vite@latest` with React + TypeScript template
- [ ] Clean up default boilerplate files
- [ ] Test that dev server runs
- **Estimated:** 30 minutes
- **Files:** package.json, vite.config.ts, index.html

### 1.2 Install Dependencies @pending
- [ ] Install React Router: `npm install react-router-dom`
- [ ] Install IndexedDB wrapper: `npm install idb`
- [ ] Install CryptoJS: `npm install crypto-js` and types
- [ ] Install PWA plugin: `npm install vite-plugin-pwa -D`
- [ ] Install QR code libraries: `npm install qrcode.react html5-qrcode`
- [ ] Install CSS preprocessor (if needed): `npm install -D sass`
- **Estimated:** 20 minutes
- **Files:** package.json, package-lock.json

### 1.3 Configure PWA Plugin @pending
- [ ] Set up vite-plugin-pwa in vite.config.ts
- [ ] Configure service worker strategy
- [ ] Set manifest generation options
- **Estimated:** 45 minutes
- **Files:** vite.config.ts

### 1.4 Set Up Project Folder Structure @pending
- [ ] Create /src/components folder
- [ ] Create /src/pages folder
- [ ] Create /src/services folder
- [ ] Create /src/utils folder
- [ ] Create /src/hooks folder
- [ ] Create /src/types folder
- [ ] Create /public/icons folder
- **Estimated:** 15 minutes

### 1.5 Create TypeScript Interfaces @pending
- [ ] Define Machine interface
- [ ] Define Settings interface
- [ ] Define History interface
- [ ] Define CustomField type
- [ ] Define Category and Tag types
- **Estimated:** 1 hour
- **Files:** src/types/machine.types.ts

### 1.6 Set Up IndexedDB Service @pending
- [ ] Initialize IndexedDB connection
- [ ] Create "machines" store with CRUD operations
- [ ] Create "settings" store
- [ ] Create "history" store
- [ ] Add error handling and recovery
- **Estimated:** 3 hours
- **Files:** src/services/indexedDB.service.ts

### 1.7 Implement LocalStorage Auto-Backup Hook @pending
- [ ] Create useAutoBackup custom hook
- [ ] Implement backup on data change
- [ ] Implement recovery check on initialization
- [ ] Test backup and restore functionality
- **Estimated:** 2 hours
- **Files:** src/hooks/useAutoBackup.ts, src/services/backup.service.ts

---

## Phase 2: Core UI & Machine Management

### 2.1 Build Responsive Layout @pending
- [ ] Create main App component structure
- [ ] Set up React Router with routes
- [ ] Create navigation component (bottom bar for mobile)
- [ ] Implement responsive breakpoints
- [ ] Add basic styling structure
- **Estimated:** 3 hours
- **Files:** src/App.tsx, src/components/Navigation.tsx

### 2.2 Create Machine List Page (Dashboard) @pending
- [ ] Build Dashboard component
- [ ] Implement list/card view toggle
- [ ] Add basic machine card display
- [ ] Implement responsive grid layout
- **Estimated:** 2 hours
- **Files:** src/pages/Dashboard.tsx, src/components/MachineCard.tsx

### 2.3 Implement Search and Filter @pending
- [ ] Add search bar component
- [ ] Implement text search across machine fields
- [ ] Add category filter dropdown
- [ ] Add tag filter chips
- [ ] Implement filter logic
- **Estimated:** 2.5 hours
- **Files:** src/pages/Dashboard.tsx, src/components/SearchBar.tsx, src/components/FilterBar.tsx

### 2.4 Build Add/Edit Machine Form @pending
- [ ] Create MachineForm component
- [ ] Add form fields (name, AnyDesk ID, address, passwords)
- [ ] Implement form validation
- [ ] Add password array management (add/remove)
- [ ] Connect to IndexedDB service
- **Estimated:** 3 hours
- **Files:** src/components/MachineForm.tsx, src/pages/MachineEdit.tsx

### 2.5 Build Machine Detail View @pending
- [ ] Create MachineDetail component
- [ ] Display all machine information
- [ ] Add edit button (navigates to edit form)
- [ ] Add delete functionality with confirmation
- [ ] Format display nicely
- **Estimated:** 2 hours
- **Files:** src/pages/MachineDetail.tsx

### 2.6 Implement Categories and Tags @pending
- [ ] Add category selector to form
- [ ] Add tag input with chips
- [ ] Store categories/tags in settings
- [ ] Implement autocomplete for existing tags
- **Estimated:** 2 hours
- **Files:** src/components/MachineForm.tsx, src/components/TagInput.tsx

### 2.7 Add Custom Fields Functionality @pending
- [ ] Create custom field add/remove UI
- [ ] Implement key-value pair management
- [ ] Add custom field display in detail view
- [ ] Store custom field definitions
- **Estimated:** 2.5 hours
- **Files:** src/components/CustomFields.tsx

---

## Phase 3: AnyDesk Integration & History

### 3.1 Create AnyDesk Launch Service @pending
- [ ] Implement URL scheme handling (anydesk://)
- [ ] Add fallback to web version
- [ ] Add error handling for launch failures
- [ ] Test on different platforms
- **Estimated:** 1.5 hours
- **Files:** src/services/anydesk.service.ts, src/utils/deeplink.ts

### 3.2 Build AnyDesk Launch Button Component @pending
- [ ] Create reusable AnydeskLaunchButton component
- [ ] Add appropriate icon
- [ ] Implement click handler
- [ ] Add loading/success states
- **Estimated:** 1 hour
- **Files:** src/components/AnydeskLaunchButton.tsx

### 3.3 Add Connection History Tracking @pending
- [ ] Log connection attempt on button click
- [ ] Store timestamp and machine ID
- [ ] Update last access date on machine
- [ ] Increment connection count
- **Estimated:** 1.5 hours
- **Files:** src/services/anydesk.service.ts, src/services/indexedDB.service.ts

### 3.4 Create History Display Page @pending
- [ ] Build History component
- [ ] Display connection log per machine
- [ ] Show statistics (last connected, total connections)
- [ ] Format timestamps nicely
- **Estimated:** 2 hours
- **Files:** src/pages/History.tsx

### 3.5 Integrate Launch Button in UI @pending
- [ ] Add button to machine detail page (prominent)
- [ ] Add quick launch icon to dashboard cards
- [ ] Test functionality
- **Estimated:** 1 hour
- **Files:** src/pages/MachineDetail.tsx, src/components/MachineCard.tsx

### 3.6 Test AnyDesk Integration @pending
- [ ] Test on desktop with AnyDesk installed
- [ ] Test on desktop without AnyDesk
- [ ] Test on mobile with AnyDesk app
- [ ] Test on mobile without AnyDesk app
- [ ] Document findings
- **Estimated:** 1.5 hours

---

## Phase 4: Backup & Data Sharing

### 4.1 Create Encryption Service @pending
- [ ] Implement AES-256 encryption function
- [ ] Implement decryption function
- [ ] Add password strength validation
- [ ] Test with various data sizes
- **Estimated:** 2 hours
- **Files:** src/services/encryption.service.ts

### 4.2 Implement Export Functionality @pending
- [ ] Create export service
- [ ] Add option to export all or selected machines
- [ ] Add encryption toggle (user choice)
- [ ] Generate timestamped filename
- [ ] Trigger file download
- **Estimated:** 2.5 hours
- **Files:** src/services/export.service.ts, src/pages/Settings.tsx

### 4.3 Build Import Functionality @pending
- [ ] Create import service
- [ ] Detect file format (JSON or encrypted)
- [ ] Prompt for password if encrypted
- [ ] Implement merge strategies (skip duplicates or overwrite)
- [ ] Handle errors gracefully
- **Estimated:** 3 hours
- **Files:** src/services/export.service.ts, src/pages/Settings.tsx


### 4.4 Implement Auto-Backup Recovery @pending
- [ ] Add check on app initialization
- [ ] Detect if IndexedDB is empty/corrupted
- [ ] Restore from LocalStorage backup
- [ ] Show success/failure notification
- **Estimated:** 1.5 hours
- **Files:** src/App.tsx, src/services/backup.service.ts

### 4.5 Test Encryption/Decryption Thoroughly @pending
- [ ] Test with various password strengths
- [ ] Test with large datasets
- [ ] Test error cases (wrong password)
- [ ] Document test results
- **Estimated:** 1.5 hours

---

## Phase 5: PWA Finalization & Polish

### 5.1 Generate PWA Icons @completed
- [x] Create or find base icon image
- [x] Generate 192x192 icon
- [x] Generate 512x512 icon
- [x] Generate favicon
- [x] Place in /public/icons
- **Estimated:** 1 hour
- **Files:** public/icons/
- **Completed:** 2025-10-19

### 5.2 Configure PWA Manifest @completed
- [x] Create manifest.json
- [x] Set app name and short name
- [x] Configure icons
- [x] Set theme and background colors
- [x] Set display mode to standalone
- **Estimated:** 30 minutes
- **Files:** public/manifest.json
- **Completed:** 2025-10-19

### 5.3 Configure Service Worker @completed
- [x] Set caching strategies in vite.config.ts
- [x] Configure offline fallback
- [x] Test cache functionality
- [x] Ensure no sensitive data cached
- **Estimated:** 2 hours
- **Files:** public/sw.js, src/index.tsx
- **Completed:** 2025-10-19

### 5.4 Add Install Prompt UI @completed
- [x] Create InstallPrompt component
- [x] Detect if app is installable
- [x] Show custom install instructions
- [x] Handle install event
- **Estimated:** 1.5 hours
- **Files:** src/components/InstallPrompt.tsx, src/components/InstallPrompt.css
- **Completed:** 2025-10-19

### 5.5 Implement Dark Mode @completed
- [x] Create dark theme CSS variables
- [x] Detect system preference
- [x] Add manual toggle in settings
- [x] Store preference in settings
- [x] Apply theme globally
- **Estimated:** 2 hours
- **Files:** src/index.css, src/pages/Settings.tsx, src/App.tsx
- **Completed:** 2025-10-19

### 5.6 Test Offline Functionality @completed
- [x] Test all pages work offline
- [x] Test data persistence offline
- [x] Document offline behavior
- **Estimated:** 1.5 hours
- **Completed:** 2025-10-19

### 5.7 Optimize Performance @completed
- [x] Implement code splitting
- [x] Add lazy loading for routes
- [x] Optimize images
- [x] Minimize bundle size
- [x] Test load times
- **Estimated:** 2.5 hours
- **Files:** src/App.tsx
- **Completed:** 2025-10-19

### 5.8 Add Loading States and Error Handling @completed
- [x] Add loading spinners where needed
- [x] Implement error boundaries
- [x] Add user-friendly error messages
- [x] Add success notifications
- **Estimated:** 2 hours
- **Files:** src/components/LoadingSpinner.tsx, src/components/ErrorBoundary.tsx, src/components/Toast.tsx, src/hooks/useToast.ts
- **Completed:** 2025-10-19

---

## Phase 6: Local Testing & Deployment

### 6.1 Local Development Testing @completed
- [x] Test all features on dev server
- [x] Test on different browsers
- [x] Fix any bugs found
- [x] Update BUGS-ISSUES.md
- **Estimated:** 3 hours
- **Completed:** 2025-10-19

### 6.2 PWA Testing with HTTPS @pending
- [ ] Set up ngrok or Vite HTTPS
- [ ] Test PWA installation
- [ ] Test service worker
- [ ] Test offline mode
- **Estimated:** 2 hours

### 6.3 AnyDesk Integration Testing @pending
- [ ] Test on devices with AnyDesk
- [ ] Test on devices without AnyDesk
- [ ] Verify connection tracking works
- [ ] Document results in TESTING-LOG.md
- **Estimated:** 2 hours

### 6.4 Data Persistence Testing @pending
- [ ] Test data survives browser close
- [ ] Test auto-backup recovery
- [ ] Test large datasets
- [ ] Test export/import workflows
- **Estimated:** 2 hours

### 6.5 Build for Production @completed
- [x] Run `npm run build`
- [x] Test production build locally
- [x] Verify bundle size acceptable
- [x] Check for console errors
- **Estimated:** 1 hour
- **Completed:** 2025-10-19

### 6.6 Configure GitHub Pages @pending
- [ ] Create GitHub repository
- [ ] Set base URL in vite.config.ts
- [ ] Install gh-pages package
- [ ] Configure deployment script
- **Estimated:** 1 hour
- **Files:** vite.config.ts, package.json

### 6.7 Deploy to GitHub Pages @pending
- [ ] Deploy built files
- [ ] Verify deployment successful
- [ ] Test live URL
- [ ] Update PROJECT-PLAN.md with live URL
- **Estimated:** 1 hour

### 6.8 Mobile Device Testing @pending
- [ ] Test on Android device
- [ ] Test on iOS device
- [ ] Install PWA on both platforms
- [ ] Test all features on mobile
- [ ] Document any mobile-specific issues
- **Estimated:** 3 hours

---

## Status Legend
- @pending - Not yet started
- @in-progress - Currently working on
- @completed - Finished
- @blocked - Waiting on something
- @testing - In testing phase

---

## Notes
- Update task status when starting or completing work
- Add completion dates when marking @completed
- Add file references as work progresses
- Break down tasks further if needed

