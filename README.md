# Rescue the GDG Event Finder — Participant Challenge

Welcome, debugger! The GDG Event Finder is broken. Your task is to repair the React app so that a student can sign in, view GDG events, ask Gemini a question, and reveal the final escape code.

**Time:** 45–60 minutes  
**Team size:** 2–3  
**Stack:** React + Vite, Firebase Authentication, Cloud Firestore, Express, Gemini API

## Your mission

1. Run the application and reproduce the failures.
2. Inspect the browser console, terminal and Network tab.
3. Repair the Firebase login flow.
4. Repair the Firestore event loading flow.
5. Repair the Gemini request and response flow.
6. Demonstrate the working app to a volunteer and retrieve the escape code.

## What is provided

- `frontend/` — React + Vite application
- `backend/` — Express API server that calls Gemini
- `.env.example` files — configuration templates
- `BUG_REPORT.md` — symptoms and investigation clues

## Setup

### Requirements

- Node.js 20 or newer
- npm
- A Firebase project
- A Gemini API key from Google AI Studio

### 1. Configure Firebase

In the Firebase console:

1. Create a project and register a **Web app**.
2. Copy the web app configuration values into `frontend/.env`.
3. Under **Authentication → Sign-in method**, enable **Email/Password**.
4. Create a test user under **Authentication → Users**.
5. Create a **Cloud Firestore** database.
6. Create a collection named `events` and add documents with these fields:

| Field | Type | Example |
|---|---|---|
| title | string | GDG Build with AI |
| date | string | 2026-11-20 |
| location | string | REC Auditorium |
| description | string | Build practical AI applications |

You can add 2–3 event documents. Use the field names exactly as shown.

For this local challenge, set Firestore rules to allow signed-in users to read events. Do not use open public write rules. Example read-only rule:

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /events/{eventId} {
      allow read: if request.auth != null;
      allow write: if false;
    }
  }
}
```

### 2. Configure the frontend

From the `participant/frontend` folder:

```bash
cp .env.example .env
npm install
```

On Windows PowerShell, copy the file with:

```powershell
Copy-Item .env.example .env
```

Fill in the Firebase values in `.env`. Keep the variable names beginning with `VITE_`.

### 3. Configure the backend

From `participant/backend`:

```bash
cp .env.example .env
npm install
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Add your Gemini API key to `GEMINI_API_KEY`. Never put this key in the React frontend or commit the `.env` file.

`GEMINI_MODEL` is configurable. Use a model currently available to your Gemini API key. The challenge starter contains an intentionally incorrect model value.

### 4. Run both servers

Terminal 1 — backend:

```bash
cd backend
npm run dev
```

Terminal 2 — frontend:

```bash
cd frontend
npm run dev
```

Open the Vite URL shown in the terminal, usually `http://localhost:5173`.

## Rules

- You may use browser DevTools, terminal logs and official documentation.
- You may edit files inside `frontend/` and `backend/`.
- Do not ask volunteers for the fixes.
- Do not publish API keys or Firebase service credentials.
- You must explain at least two fixes during validation.

## Completion criteria

- [ ] Login succeeds with the provided test account.
- [ ] GDG events load from Firestore.
- [ ] Gemini answers a question about the events.
- [ ] The final escape code is displayed.
- [ ] You can explain at least two bugs and their fixes.

**Hint:** The app has more than one independent failure. Fixing only the login will not complete the mission.
