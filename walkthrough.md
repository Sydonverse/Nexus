# Nexus Platform — Walkthrough & Implementation Guide

The **Nexus** Progressive Web App (PWA) is built and operational, solving the tech hub's resource fragmentation, project tracking, and communication challenges.

---

## 1. Accomplished Architecture & Implementation

### 1.1 Backend & Database (`server/`)
- **Runtime**: Node.js v24.19.0 LTS + TypeScript
- **Database**: SQLite via Prisma ORM (`dev.db`) with zero external dependency friction, fully structured for seamless migration to PostgreSQL / Supabase when ready.
- **RESTful API**: 35+ secure endpoints with CORS, rate-limiting, and parameter validation.
- **Security & Department Isolation**:
  - [auth.ts](file:///c:/Users/HP/Documents/Project%20Nexus/Nexus/server/src/middleware/auth.ts): Stateless JWT verification.
  - [departmentGuard.ts](file:///c:/Users/HP/Documents/Project%20Nexus/Nexus/server/src/middleware/departmentGuard.ts): Strict isolation middleware preventing interns of one department (e.g. Cybersecurity) from accessing another department's data (e.g. Data Analysis).
  - [roleGuard.ts](file:///c:/Users/HP/Documents/Project%20Nexus/Nexus/server/src/middleware/roleGuard.ts): Role-based permissions (`ADMIN`, `TUTOR`, `INTERN`).
- **Real-Time WebSockets**:
  - [socket/index.ts](file:///c:/Users/HP/Documents/Project%20Nexus/Nexus/server/src/socket/index.ts): Socket.IO server with JWT authentication and auto-joining of department rooms (`dept:{slug}`).
  - Live typing indicators and instant messaging.
- **Push & In-App Notifications**:
  - [push.ts](file:///c:/Users/HP/Documents/Project%20Nexus/Nexus/server/src/utils/push.ts): Web Push (VAPID) service worker dispatch + database notification history.
- **File Upload Service**:
  - [upload.ts](file:///c:/Users/HP/Documents/Project%20Nexus/Nexus/server/src/middleware/upload.ts): Multer storage supporting any file format (PDFs, shell scripts, PCAPs, 3D meshes, code archives) with sanitization and direct streaming.

### 1.2 Frontend Progressive Web App (`client/`)
- **Framework**: Vite + React 18 + TypeScript + Lucide Icons + Canvas Confetti
- **Styling**: Pure Vanilla CSS design tokens with futuristic dark glassmorphism, dynamic department HSL themes, and mobile responsive layout.
- **PWA Capabilities**:
  - [manifest.json](file:///c:/Users/HP/Documents/Project%20Nexus/Nexus/client/public/manifest.json): Standalone display mode with custom icons.
  - [sw.js](file:///c:/Users/HP/Documents/Project%20Nexus/Nexus/client/public/sw.js): Service worker handling native OS push events, caching, and notification clicks.
- **Core Views**:
  - **Dashboard**: Department hero banner, quick action buttons, live stats, active project progress circle, upcoming class countdown, latest announcements.
  - **Learning Resources**: Searchable file catalog, category filter pills (`LECTURE`, `TUTORIAL`, `EXERCISE`, `REFERENCE`, `TOOL`), download triggers, tutor file upload modal.
  - **Projects & Kanban Board**: 4 columns (`TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`), working group assignments, task cards with priority badges, intern deliverable submission modal, tutor review & feedback modal with celebratory confetti.
  - **Class Scheduler**: Calendar/agenda layout, location badges, virtual meeting links, tutor session scheduler modal.
  - **Announcements**: Pinned broadcasts, urgent priority alerts, tutor broadcast modal.
  - **Department Chat**: Live real-time chat room, typing status indicators, message bubbles styled by sender role.
  - **Members Directory**: Roster separating instructors and registered interns.
  - **Demo Persona Switcher**: Top navbar dropdown for 1-click persona switching during hackathon evaluation.

---

## 2. Verification & Security Testing

### 2.1 API Health & Session
```powershell
Invoke-RestMethod -Uri "http://localhost:4000/health"
# Returns: { status: "ok", service: "Nexus API & Real-time Server" }
```

### 2.2 Department Isolation Test (403 Forbidden)
Tested accessing Data Analysis resources as David Kim (Cybersecurity Intern):
```powershell
Invoke-RestMethod -Uri "http://localhost:4000/api/v1/departments/data-analysis/resources" -Headers @{ Authorization = "Bearer <david_token>" }
# Returns: 403 Forbidden {"error":"Access Denied: You are not an approved member of this department"}
```

### 2.3 Approved Department Access (200 OK)
Tested accessing Cybersecurity resources as David Kim:
```powershell
Invoke-RestMethod -Uri "http://localhost:4000/api/v1/departments/cybersecurity/resources" -Headers @{ Authorization = "Bearer <david_token>" }
# Returns: 200 OK with OWASP Guide, Network Recon Script, and Wireshark PCAP
```

### 2.4 Production Client Build
```powershell
npm run build (in client/)
# Output: ✓ built in 1.45s with 0 errors
```

---

## 3. Pre-Seeded Demo Accounts

All demo accounts use password: `password123`

| Role | Name | Email | Department |
|---|---|---|---|
| **Admin** | Sarah Director | `admin@nexus.hub` | Cross-Hub Global Access |
| **Tutor** | Alex Vance | `cyber.tutor@nexus.hub` | Cybersecurity |
| **Intern** | David Kim | `david.cyber@nexus.hub` | Cybersecurity (Group Alpha) |
| **Intern** | Maya Patel | `maya.cyber@nexus.hub` | Cybersecurity (Group Bravo) |
| **Tutor** | Dr. Evelyn Reed | `data.tutor@nexus.hub` | Data Analysis |
| **Intern** | Sam Taylor | `sam.data@nexus.hub` | Data Analysis |
| **Tutor** | Marcus Chen | `web.tutor@nexus.hub` | Web Development |

---

## 4. How to Run

From the root project directory `c:\Users\HP\Documents\Project Nexus\Nexus`:

```powershell
# Run both Backend Server (port 4000) and Frontend PWA (port 3000) simultaneously:
npm run dev

# Or run individually:
npm run dev:server   # Starts Express + Socket.IO API on http://localhost:4000
npm run dev:client   # Starts Vite PWA on http://localhost:3000
```
