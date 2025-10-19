# Technical Decisions

## Decision Log

### DEC-001: Use React with TypeScript (2025-10-19)
- **Context:** Need modern framework for PWA with type safety
- **Options Considered:**
  1. React + TypeScript - Popular, great PWA support, strong typing
  2. Vue + TypeScript - Lighter, simpler learning curve
  3. Vanilla JavaScript - No dependencies, more code to write
- **Decision:** Use React 18 with TypeScript
- **Rationale:** 
  - Large ecosystem and community support
  - Excellent PWA tooling and libraries
  - Type safety reduces bugs in complex state management
  - Good mobile performance when optimized
- **Impact:** Sets up entire project architecture and tooling choices

### DEC-002: Use Vite over Create-React-App (2025-10-19)
- **Context:** Need fast dev server and optimized PWA builds
- **Options Considered:**
  1. Create-React-App - Traditional, stable, but slower
  2. Vite - Modern, fast HMR, built-in PWA plugin
  3. Next.js - Server-side rendering, overkill for static PWA
- **Decision:** Use Vite
- **Rationale:** 
  - Significantly faster hot module replacement (HMR)
  - vite-plugin-pwa provides excellent PWA configuration
  - Smaller bundle sizes out of the box
  - Better developer experience
  - No ejecting needed for customization
- **Impact:** Affects build configuration, development workflow, and deployment

### DEC-003: IndexedDB for Primary Storage, LocalStorage for Backup (2025-10-19)
- **Context:** Need local storage for potentially large datasets
- **Options Considered:**
  1. LocalStorage only - Simple but 5-10MB limit
  2. IndexedDB only - Scalable but no built-in backup
  3. IndexedDB + LocalStorage - Best of both worlds
- **Decision:** Use IndexedDB as primary, LocalStorage as auto-backup
- **Rationale:**
  - IndexedDB can handle large amounts of data
  - Structured data with indexes for fast queries
  - LocalStorage provides safety net if IndexedDB clears
  - Both are completely offline and local
- **Impact:** Requires IndexedDB wrapper library, backup service layer

### DEC-004: No Master Password, Optional Export Encryption (2025-10-19)
- **Context:** Balance between security and ease of use
- **Options Considered:**
  1. Master password required for app access - More secure, friction
  2. No master password, plain storage - Fastest development
  3. No master password, optional export encryption - Flexible
- **Decision:** Option 3 - No master password, user chooses encryption per export
- **Rationale:**
  - Data stays local on user's device (already secure in that sense)
  - User can choose strong encryption when sharing data
  - No friction for daily use
  - Flexibility for different security needs
- **Impact:** Export service needs encryption toggle, user education needed

### DEC-005: Support Both Encrypted Files and QR Codes for Sharing (2025-10-19)
- **Context:** Users need to share data between devices/users
- **Options Considered:**
  1. File export/import only - Traditional, reliable
  2. QR codes only - Convenient for mobile, data size limits
  3. Both encrypted files and QR codes - Maximum flexibility
- **Decision:** Support both methods with optional encryption
- **Rationale:**
  - Files good for large backups and full database transfers
  - QR codes perfect for quick single-machine sharing
  - Encryption optional for both gives user control
  - Different use cases benefit from different methods
- **Impact:** Need to implement both QR and file services, camera permissions

### DEC-006: AnyDesk URL Scheme with Web Fallback (2025-10-19)
- **Context:** Enable quick launch of AnyDesk with machine ID
- **Options Considered:**
  1. Custom protocol handler - Complex, requires registration
  2. AnyDesk URL scheme (anydesk://) - Standard, works immediately
  3. Web link only - No app integration
- **Decision:** Use `anydesk://[ID]` with fallback to web version
- **Rationale:**
  - anydesk:// is standard protocol supported by AnyDesk
  - Works on all platforms (Windows, Mac, Linux, Android, iOS)
  - Graceful fallback to web if app not installed
  - Simple implementation with `window.location.href`
- **Impact:** Creates anydesk.service.ts, deeplink.ts utility

### DEC-007: Triple-Layer Backup Strategy (2025-10-19)
- **Context:** Prevent data loss for users
- **Options Considered:**
  1. Manual export only - Simple, relies on user discipline
  2. Auto-backup to files - Not possible with PWA security
  3. IndexedDB + LocalStorage auto-backup + manual export
- **Decision:** Option 3 - Triple protection
- **Rationale:**
  - IndexedDB is primary, fast and scalable
  - LocalStorage auto-backs up on every change (safety net)
  - Manual exports protect against device failure
  - Best balance of automation and user control
- **Impact:** Needs backup service, recovery logic on app init

---

## Template for New Decisions

### DEC-XXX: [Decision Title] (YYYY-MM-DD)
- **Context:** Why this decision needed to be made
- **Options Considered:**
  1. Option 1 - Brief description
  2. Option 2 - Brief description
  3. Option 3 - Brief description
- **Decision:** Which option was chosen
- **Rationale:** 
  - Reason 1
  - Reason 2
  - Reason 3
- **Impact:** How this affects the project

### DEC-006: GitHub Pages Deployment Strategy
**Date:** 2025-10-19  
**Context:** Need to deploy PWA to a free hosting platform  
**Decision:** Use GitHub Pages with gh-pages package  
**Rationale:**
- Free hosting with custom domain support
- Automatic deployment from git repository
- HTTPS enabled by default (required for PWA)
- Good performance and reliability
- Easy to maintain and update

**Implementation:**
- Repository: https://github.com/ZaMissa/AnyMoj.git
- Live URL: https://zamissa.github.io/AnyMoj/
- Deployment method: `npm run deploy` (builds and deploys to gh-pages branch)

**Trade-offs:**
- ✅ Free hosting
- ✅ Automatic HTTPS
- ✅ Easy deployment
- ❌ Limited to static sites
- ❌ No server-side processing

### DEC-007: React Router Basename Configuration
**Date:** 2025-10-19  
**Context:** GitHub Pages serves from subdirectory, causing routing issues  
**Decision:** Add basename="/AnyMoj" to BrowserRouter  
**Rationale:**
- GitHub Pages serves from /AnyMoj/ subdirectory
- Without basename, routes don't work correctly
- URLs change incorrectly when navigating
- Service worker registration fails

**Implementation:**
```tsx
<Router basename="/AnyMoj">
```

**Trade-offs:**
- ✅ Correct URL handling
- ✅ Proper routing on GitHub Pages
- ✅ Service worker works correctly
- ❌ Must be updated if deployment path changes

---

## Notes
- Document significant technical choices only
- Reference decisions in code comments when relevant (e.g., // Using IndexedDB per DEC-003)
- Update if decision changes
- Keep rationale clear for future reference

