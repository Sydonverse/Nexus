# Knowvia Platform Rebuild — Walkthrough

Knowvia has been rebuilt from the ground up as a streamlined, responsive Progressive Web Application (PWA) knowledge repository.

---

## What Was Accomplished

### 1. Platform Rebranding & Architecture Streamlining
- Rebranded from **Nexus** to **Knowvia** across all packages, metadata, HTML, PWA manifest, and UI components.
- Stripped unnecessary features (complex project management groups, separate tasks boards, members directory) down to the core 4 features + assignment management:
  1. **Class Scheduling** (primary tutor feature for extra classes beyond static timetable; class timetable for students).
  2. **Learning Materials & File Sharing** (curated file repository for students; file sharing for tutors/admin with 25MB limits and magic-byte security inspection).
  3. **Assignment Management** (replaces project management; submission tracking, milestone progress meter, and tutor reviews).
  4. **Chatbox** (text-only discussion channel, sender names, reply threading, no emojis/attachments).
  5. **Announcements** (bell icon for students with click-through deep links; dedicated management tab for tutors/admin; global broadcast for admin; 1-day automated class reminders).

---

### 2. Design System: Clean Lighter Theme
- Implemented in [design-tokens.css](file:///c:/Users/HP/Documents/Project%20Nexus/Nexus/client/src/styles/design-tokens.css) and [app.css](file:///c:/Users/HP/Documents/Project%20Nexus/Nexus/client/src/styles/app.css):
  - **Soft minimal palette**: Crisp white surfaces (`#ffffff`), soft slate page background (`#f8fafc`), subtle borders (`#e2e8f0`).
  - **Accents**: Soft indigo (`#4f46e5`), emerald green (`#10b981`), amber (`#f59e0b`), and sky blue (`#0ea5e9`).
  - **Generous spacing and typography**: Crisp `Inter` and `Outfit` font scales.
  - **Subtle shadows**: Clean elevation without heavy dark glows.
  - **Fluid responsive layout**: Adapts seamlessly to mobile (<600px), tablet (<860px), and desktop.

---

### 3. Role-Tailored Dashboards & Feature Highlights
- **For Tutors & Admin**:
  - **Class Scheduler** featured as the primary component with "Schedule Extra Class" quick button to provide flexibility over static timetables.
  - **Learning Materials & File Sharing** highlighted with upload button and 25MB storage efficiency note.
  - **Sidebar** includes the **Announcements** tab for creating and managing broadcasts.
- **For Interns & Students**:
  - **Upcoming Class Timetable** featured as the primary component, displaying locations, virtual meeting links, and "1-Day Reminder Active" indicator.
  - **Assignment Progress Tracker & Milestone Meter**:
    - Progress bar showing milestone completion percentage.
    - Summary counters: Approved, Needs Revision, Under Review, Total Given.
    - **Current Focus Assignment Card**: Highlights the primary assignment the student is working on.
    - **Recent Feedback Feed**: Displays qualitative feedback and verdicts from tutors.
  - **Announcements**: Accessed via the **Bell Icon** on the top navigation bar (not a separate tab).

---

### 4. File Security & Storage Safety
- Implemented in [fileValidator.ts](file:///c:/Users/HP/Documents/Project%20Nexus/Nexus/server/src/utils/fileValidator.ts) and [upload.ts](file:///c:/Users/HP/Documents/Project%20Nexus/Nexus/server/src/middleware/upload.ts):
  - **25MB File Upload Limit**: Enforces storage efficiency for free-tier deployments.
  - **Executable Blocklist**: Rejects dangerous extensions (`.exe`, `.bat`, `.cmd`, `.sh`, `.ps1`, `.vbs`, `.dll`, `.scr`, `.msi`, `.jar`, etc.).
  - **Magic-Byte Signature Inspection**: Inspects binary headers to detect disguised executables (e.g. Windows PE `MZ` header, Linux ELF, Mach-O binaries renamed to `.pdf` or `.txt`).
  - **Filename Sanitization**: Cleans path traversal (`../`), null bytes, and unsafe characters.
  - **Safe Serving**: Downloads forced as attachments (`Content-Disposition: attachment`).

---

### 5. Auto-Announcements, Deep-Links & Push Notifications
- Implemented in [announcement.service.ts](file:///c:/Users/HP/Documents/Project%20Nexus/Nexus/server/src/services/announcement.service.ts) and [notification.service.ts](file:///c:/Users/HP/Documents/Project%20Nexus/Nexus/server/src/services/notification.service.ts):
  - When a tutor/admin creates an assignment, schedules a class, or uploads a material, an announcement is **auto-generated**.
  - Announcements store `sourceType` (`ASSIGNMENT`, `CLASS_SCHEDULE`, `MATERIAL`) and `sourceId` for deep linking.
  - Clicking an announcement navigates directly to that assignment, schedule, or material.
  - Web Push notifications dispatched via `web-push` to subscribed devices.

---

### 6. Automated 1-Day Class Reminder Scheduler
- Implemented in [reminder.service.ts](file:///c:/Users/HP/Documents/Project%20Nexus/Nexus/server/src/services/reminder.service.ts):
  - Cron scheduler checks every 30 minutes for classes scheduled within the next 24 hours where `reminderSent = false`.
  - Dispatches automated reminders with class time, room, and meeting link.
  - Marks `reminderSent = true` to prevent duplicates.

---

### 7. Department Isolation & Registration
- Enforced single department membership per student and tutor (admin has global access).
- Registration form requires selecting a department from the live list.
- Route guards strictly prevent users from accessing another department's materials, schedules, assignments, or chat (returns 403 Forbidden).

---

## Validation & Verification Results

| Test Scenario | Verification Method | Result |
|---|---|---|
| **Server TypeScript Build** | `npm --prefix server run build` (`tsc`) | ✅ Exit code 0, clean compilation |
| **Client Vite Build** | `npm --prefix client run build` (`tsc -b && vite build`) | ✅ Exit code 0, 1.58s build time |
| **Prisma DB Sync & Seed** | `npx prisma db push --force-reset` + seed | ✅ Seeded all departments, demo accounts, schedules, materials, and assignments |
| **Server Dev Startup & Health** | `GET /health` | ✅ `{"status":"ok","service":"Knowvia Knowledge Repo & Real-time Platform"}` |
| **Automated Class Reminder** | Server startup log | ✅ Dispatched 1-day reminder for tomorrow's class in Cybersecurity |
| **Student Login & Department** | `POST /auth/login` | ✅ Returns JWT + user enrolled in single department |
| **Assignment Progress Stats** | `GET /departments/cybersecurity/assignments` | ✅ Returned 67% completion, focus assignment, and tutor review comments |
| **File Security: Blocked Extension** | Upload `.exe` file via curl | ✅ Rejected: `{"error":"Security Alert: Executable or script files (.exe) are strictly blocked..."}` |
| **File Security: Disguised Binary** | Upload PE binary renamed to `.pdf` | ✅ Rejected: `{"error":"Security Alert: File signature matches a Windows executable (MZ header)..."}` |
| **Valid Material Upload** | Upload `.txt` file via curl | ✅ Uploaded cleanly: size verified, announcement & notification triggered |
| **Department Isolation** | David (Cyber) accessing Web Dev | ✅ Rejected: `403 {"error":"Access Denied: You are not an approved member of this department"}` |
| **Real-time Deduplication & Cleanup** | Socket listener lifecycle + ID guard | ✅ Fixed listener accumulation on role switch; enforced ID deduplication for materials, messages, schedules, assignments |
| **Personalized Announcement Clear/Delete** | `DismissedAnnouncement` model + personal socket rooms | ✅ Deleting or clearing announcements only dismisses them for the current user without affecting peers |
| **Git Commit** | `git commit` | ✅ Committed locally, ready to push on user approval |

---

## Demo Credentials for Evaluation

| Role | Email | Password | Scope |
|---|---|---|---|
| **Admin** | `admin@knowvia.internal` | `password123` | Global access across all departments |
| **Cyber Tutor** | `cyber.tutor@knowvia.internal` | `password123` | Schedule classes, share materials, review assignments |
| **Cyber Intern (David)** | `david.cyber@knowvia.internal` | `password123` | Timetable, download materials, progress tracker, submit work |
| **Cyber Intern (Maya)** | `maya.cyber@knowvia.internal` | `password123` | Assigned work needing revision |
| **Web Dev Tutor** | `web.tutor@knowvia.internal` | `password123` | Web Development department |
