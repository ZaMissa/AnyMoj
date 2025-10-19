# 📚 AnyMoj Project Documentation

This folder contains all project planning, tracking, and documentation files for the PWA Machine Manager application.

## 🚀 **QUICK START**

### 📊 **Main Dashboard**
**[📊 TRACKING-DASHBOARD.md](./TRACKING-DASHBOARD.md)** - Real-time project status, metrics, and navigation hub

### 📋 **Documentation Index**
**[📚 INDEX.md](./INDEX.md)** - Complete navigation guide for all documentation

---

## 📋 **DOCUMENTATION STRUCTURE**

### 🏗️ **Project Management**
- **[PROJECT-PLAN.md](./PROJECT-PLAN.md)** - Master development plan with all features, phases, and architecture
- **[PROGRESS-TRACKER.md](./PROGRESS-TRACKER.md)** - Daily/weekly progress journal
- **[TASKS.md](./TASKS.md)** - Granular task breakdown with status tracking

### 🐛 **Issue Management**
- **[BUGS-ISSUES.md](./BUGS-ISSUES.md)** - Centralized bug tracking and resolution
- **[TESTING-LOG.md](./TESTING-LOG.md)** - Test session results and findings
- **[FINAL-TESTING-REPORT.md](./FINAL-TESTING-REPORT.md)** - Comprehensive test results

### 🛠️ **Technical Documentation**
- **[DECISIONS.md](./DECISIONS.md)** - Technical decision log with rationale
- **[DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md)** - Pre-deployment verification checklist
- **[REFACTORING-LOG.md](./REFACTORING-LOG.md)** - Major code refactoring history

### 🔄 **Tracking System**
- **[TRACKING-DASHBOARD.md](./TRACKING-DASHBOARD.md)** - Real-time status overview
- **[SYNC-STATUS.md](./SYNC-STATUS.md)** - Documentation synchronization guide

## How to Use This Documentation

### Daily Workflow
1. **Start of Day:** 
   - Review TASKS.md to see what's next
   - Check BUGS-ISSUES.md for any blockers
   
2. **During Development:**
   - Update task status in TASKS.md (@in-progress)
   - Log bugs immediately in BUGS-ISSUES.md
   - Document technical decisions in DECISIONS.md
   
3. **End of Session:**
   - Update PROGRESS-TRACKER.md with summary
   - Mark completed tasks in TASKS.md and PROJECT-PLAN.md
   - Update bug statuses if resolved

### When to Update Each File

| File | Update Frequency | When to Update |
|------|------------------|----------------|
| PROJECT-PLAN.md | Weekly | When scope changes or phases complete |
| PROGRESS-TRACKER.md | Daily | End of each work session |
| TASKS.md | Daily | When starting/completing tasks |
| BUGS-ISSUES.md | Immediately | When bugs found or resolved |
| TESTING-LOG.md | After testing | After each test session |
| DECISIONS.md | As needed | When making technical choices |
| REFACTORING-LOG.md | As needed | When doing major refactoring |
| DEPLOYMENT-CHECKLIST.md | Pre-deploy | Before deployment process |

## Benefits

- **Never Lose Track:** Always know what's done and what's next
- **Bug Management:** All issues documented with context
- **Decision History:** Remember why choices were made
- **Progress Visibility:** Clear record of work completed
- **Easy Onboarding:** Future you (or others) can understand the project
- **Quality Assurance:** Comprehensive testing and deployment checklists

## Guidelines

1. **Be Consistent:** Update files regularly and consistently
2. **Be Specific:** Include file names, line numbers, and details
3. **Reference Links:** Use issue IDs (#XXX) and decision IDs (DEC-XXX)
4. **Keep Current:** Archive old information, keep active sections clean
5. **Be Honest:** Document failures and challenges, not just successes

## Quick Reference

### Status Tags (TASKS.md)
- `@pending` - Not yet started
- `@in-progress` - Currently working on
- `@completed` - Finished
- `@blocked` - Waiting on something
- `@testing` - In testing phase

### Priority Levels (BUGS-ISSUES.md)
- **Critical** - Blocks development
- **High** - Important but not blocking
- **Medium** - Should be fixed soon
- **Low** - Nice to have

### Test Result Symbols (TESTING-LOG.md)
- ✅ Pass
- ❌ Fail
- ⚠️ Partial pass

## Commit Message Format

Reference documentation in commits:
```
feat: Add QR scanner component (TASK-4.5, closes #004)
fix: IndexedDB initialization on Firefox (fixes #001)
refactor: Split storage services (REF-001)
docs: Update progress tracker
```

---

Last Updated: 2025-10-19

