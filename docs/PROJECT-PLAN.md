# PWA Machine Manager Development Plan

## Tech Stack
- **Frontend:** React 18 with TypeScript
- **Build Tool:** Vite (fast dev server, optimized PWA builds)
- **PWA:** Workbox for service worker management
- **Storage:** IndexedDB (primary) + LocalStorage (auto-backup)
- **Styling:** CSS Modules + Mobile-first responsive design
- **Data Encryption:** CryptoJS for optional export encryption
- **QR Codes:** qrcode.react for generation, html5-qrcode for scanning

## Project Structure
```
/src
  /components      # Reusable UI components
  /pages           # Main app pages
  /services        # Data service layer
  /utils           # Helpers (encryption, validation)
  /hooks           # Custom React hooks
  /types           # TypeScript interfaces
/public
  /icons           # PWA icons (multiple sizes)
  manifest.json    # PWA manifest
/docs              # Project tracking documentation
```

## Core Features & Implementation

### 1. Data Model
Each machine entry contains:
- Basic: AnyDesk ID, machine name, IP/address, passwords (array)
- Metadata: Notes, last access date, connection history (timestamps)
- Custom: Custom fields (key-value), categories (array), tags (array)
- System: UUID, created date, modified date

### 2. Storage Architecture
- **IndexedDB Service:** Primary storage with database name "MachineManagerDB"
  - Store: "machines" with UUID as key
  - Store: "settings" for app configuration
  - Store: "history" for connection logs
- **Auto-backup Service:** On every data change, stringify and save to LocalStorage key "machineManagerBackup"
- **Recovery Service:** Check LocalStorage on app load if IndexedDB is empty/corrupted

### 3. UI Pages
- **Dashboard:** List all machines (cards/list view toggle), search, filter by category/tags, quick AnyDesk launch button on each card
- **Machine Detail:** View/edit all machine information, prominent AnyDesk quick launch button
- **Add/Edit Machine:** Form with dynamic custom fields
- **Settings:** Backup/restore, export/import options, app preferences
- **History:** Connection history log per machine

### 4. AnyDesk Quick Launch Integration
**Key Feature:** One-click button to open AnyDesk with prefilled machine ID

**Implementation:**
- Use AnyDesk URL scheme: `anydesk://[AnyDesk-ID]`
- Fallback URL: `https://anydesk.com/[AnyDesk-ID]`
- Button triggers `window.location.href` or `window.open()`

**Behavior:**
- If AnyDesk installed on device: Opens app with ID prefilled, ready to connect
- If AnyDesk not installed: Browser opens AnyDesk web version or shows download page
- Mobile: Deep link directly opens AnyDesk mobile app
- Desktop: Launches AnyDesk desktop application

**UI Placement:**
- Primary action button on machine detail page (large, prominent)
- Quick launch icon button on dashboard machine cards
- Icon: AnyDesk logo or connection icon

**Connection Tracking:**
- Automatically log connection attempt when button clicked
- Record timestamp, machine ID, success/attempt status
- Display in connection history for each machine
- Statistics: Last connected, total connections count

**Files to Create:**
- `src/services/anydesk.service.ts` - Launch logic and URL handling
- `src/components/AnydeskLaunchButton.tsx` - Reusable button component
- `src/utils/deeplink.ts` - Deep link detection and fallback handling

### 5. Export/Import System
**Export Options:**
- Format: JSON or Encrypted JSON (user choice each time)
- Scope: All machines or selected entries
- Encryption: Optional password (CryptoJS AES-256)
- Filename: `machine-backup-{timestamp}.json` or `.enc`

**Import Options:**
- Detect format (plain or encrypted)
- If encrypted, prompt for password
- Merge strategy: Skip duplicates by UUID or overwrite

**QR Code (Future Implementation):**
- Generate: Single machine entry as JSON string
- Optional encryption toggle in UI for each QR generation
- Scan: Camera-based scanner page imports directly
- Note: Moved to future implementation due to complexity and dependencies

### 6. PWA Configuration
- **Manifest:** App name, icons (192x192, 512x512), theme color, display: standalone
- **Service Worker:** Cache all assets, offline-first strategy
- **Install Prompt:** Custom UI to guide users on installation
- **Works Offline:** All functionality available without internet (except QR scanner camera)

### 7. Mobile-First Design
- Touch-friendly buttons (min 44px tap targets)
- Swipe gestures for delete/edit actions
- Bottom navigation bar for easy thumb access
- Responsive breakpoints: 320px (mobile), 768px (tablet), 1024px (desktop)
- Dark mode support with system preference detection

## Development Phases

### Phase 1: Project Setup & Core Infrastructure
- [ ] Initialize React + Vite + TypeScript project
- [ ] Configure PWA plugin (vite-plugin-pwa)
- [ ] Set up project folder structure
- [ ] Install all dependencies (React Router, IndexedDB wrapper, CryptoJS, QR libraries)
- [ ] Create TypeScript interfaces for data models
- [ ] Set up IndexedDB service with CRUD operations
- [ ] Implement LocalStorage auto-backup hook

### Phase 2: Core UI & Machine Management
- [ ] Build responsive layout with navigation
- [ ] Create machine list page (Dashboard) with search/filter
- [ ] Implement add/edit machine form with validation
- [ ] Build machine detail view
- [ ] Add categories and tags management
- [ ] Implement custom fields functionality

### Phase 3: AnyDesk Integration & History
- [ ] Create AnyDesk launch service with URL scheme handling
- [ ] Build AnyDesk launch button component
- [ ] Implement deep link detection and fallback
- [ ] Add connection history tracking on launch
- [ ] Create history display page
- [ ] Test AnyDesk integration on mobile and desktop

### Phase 4: Backup & Data Sharing
- [ ] Implement export functionality (JSON/encrypted with user choice)
- [ ] Build import functionality with merge strategies
- [ ] Implement auto-backup recovery on app initialization
- [ ] Test encryption/decryption thoroughly

### Phase 5: PWA Finalization & Polish
- [ ] Generate all required icon sizes (192x192, 512x512, favicon)
- [ ] Configure service worker caching strategies
- [ ] Add install prompt UI with instructions
- [ ] Implement dark mode with toggle
- [ ] Test offline functionality comprehensively
- [ ] Optimize performance (code splitting, lazy loading, image optimization)
- [ ] Add loading states and error handling

### Phase 6: Local Testing & Deployment
- [ ] Test on local dev server (Vite dev server)
- [ ] Test PWA features (requires HTTPS: use ngrok or Vite's local HTTPS)
- [ ] Test AnyDesk launch on actual devices with AnyDesk installed
- [ ] Test data persistence, backup, and recovery scenarios
- [ ] Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Build for production
- [ ] Configure GitHub Pages deployment (gh-pages branch or /docs folder)
- [ ] Set correct base URL in vite.config.ts
- [ ] Deploy and test live version on mobile devices (Android & iOS)

## Key Files to Create

### Services
1. `src/services/indexedDB.service.ts` - Database operations (CRUD)
2. `src/services/backup.service.ts` - Auto-backup logic
3. `src/services/encryption.service.ts` - Encrypt/decrypt functions
4. `src/services/export.service.ts` - Export/import logic
5. `src/services/anydesk.service.ts` - AnyDesk launch and tracking

### Components
6. `src/components/MachineCard.tsx` - Machine display card
7. `src/components/MachineForm.tsx` - Add/edit form
8. `src/components/AnydeskLaunchButton.tsx` - AnyDesk launch button
9. `src/components/InstallPrompt.tsx` - PWA install UI

### Future Implementation Components
10. `src/components/QRGenerator.tsx` - QR code generation
11. `src/components/QRScanner.tsx` - QR code scanning

### Pages
12. `src/pages/Dashboard.tsx` - Main machine list page
13. `src/pages/MachineDetail.tsx` - Machine detail view
14. `src/pages/MachineEdit.tsx` - Add/edit machine page
15. `src/pages/History.tsx` - Connection history
16. `src/pages/Settings.tsx` - App settings and backup/restore

### Configuration & Utilities
17. `src/hooks/useAutoBackup.ts` - Hook for auto-saving
18. `src/utils/deeplink.ts` - Deep link handling
19. `src/types/machine.types.ts` - TypeScript interfaces
20. `vite.config.ts` - PWA and build configuration
21. `public/manifest.json` - PWA manifest

## Security Considerations
- All data stays in browser storage (never sent to external servers)
- Optional encryption uses strong AES-256 for exports
- Service worker only caches static assets (no sensitive data in cache)
- No analytics, tracking, or telemetry
- User has complete control over all data exports and imports
- AnyDesk launch only sends machine ID to AnyDesk app (standard behavior)

## Testing Strategy
- Manual testing on Chrome, Firefox, Safari, Edge (mobile and desktop)
- PWA installation testing on Android and iOS devices
- Offline functionality testing (disconnect network, verify app still works)
- Data import/export testing with large datasets (100+ machines)
- QR code functionality testing on multiple devices
- AnyDesk launch testing with app installed and not installed
- Data persistence testing (close browser, reopen, verify data intact)
- Auto-backup recovery testing (corrupt IndexedDB, verify LocalStorage recovery)

## Deployment to GitHub Pages
1. Create repository on GitHub
2. Configure base URL in `vite.config.ts`: `base: '/[repo-name]/'`
3. Build: `npm run build`
4. Deploy: Use `gh-pages` package or manual copy to gh-pages branch
5. Configure Pages in repository settings
6. Test deployed URL thoroughly on mobile devices

## Future Implementation Features

### QR Code Integration
**QR Code Generation:**
- Create QRGenerator component for individual machine sharing
- Convert machine data to JSON string with optional encryption
- Add download QR option for saving as image
- Display QR code in modal or dedicated page

**QR Code Scanning:**
- Create QRScanner component with camera access
- Request camera permissions and handle errors gracefully
- Scan and decode QR codes containing machine data
- Parse machine data and import into database
- Add validation for scanned data format

**Implementation Files:**
- `src/components/QRGenerator.tsx` - QR code generation component
- `src/components/QRScanner.tsx` - QR code scanning component
- `src/pages/QRScan.tsx` - Dedicated QR scanning page
- Update `src/pages/Settings.tsx` to include QR generation options

**Dependencies:**
- `qrcode.react` - For QR code generation
- `html5-qrcode` - For QR code scanning with camera

**Technical Considerations:**
- Camera permissions handling across different browsers
- Mobile-specific camera access limitations
- QR code size optimization for different screen sizes
- Error handling for invalid or corrupted QR codes
- Integration with existing export/import encryption system

