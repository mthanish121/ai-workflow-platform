# ⚡ AI Workflow Automation Platform (Zapier-style)

A modern full-stack workflow automation and orchestration platform powered by Google Gemini AI, PostgreSQL, and React. Build, generate, edit, and manage multi-step automated workflows with natural language prompts or an interactive visual editor.

---

## 🚀 Key Features Implemented

### 1. 🤖 AI Natural Language Workflow Generator
- **Prompt-to-Pipeline:** Describe any automation in plain English (e.g., *"When RSS publishes an article, summarize it with Gemini and email it to me"*).
- **Gemini Engine:** Uses `@google/genai` (server-side only) with strict JSON output schemas and **Zod** validation.
- **Auto-Provisioning:** Automatically configures triggers, AI processing blocks, condition filters, and action nodes.

### 2. 🎛️ Visual Workflow Canvas & Editor
- **Interactive Node Canvas:** Step-by-step visual automation pipeline (Triggers, Filters, AI Steps, Actions).
- **App Picker Modal:** Smooth search & selection of connected apps (Gmail, Slack, Google Sheets, Webhooks, RSS, Gemini) with atomic state updates.
- **Step Configuration Panel:** Real-time right-hand inspector tab for configuring triggers, authentication gates, and action parameters.
- **Dynamic Variable Mapping (`{{StepN.var}}`):** Contextual pill tokens (e.g., `{{Step1.feed_title}}`, `{{Step2.gemini_summary}}`) dynamically generated from upstream steps with one-click injection into fields.
- **Dedicated Gmail Action Panel:** Tailored configuration interface for recipient mapping, dynamic subjects, and AI-summarized email bodies.

### 3. ⚡ Workflow Lifecycle & Live Activation Toggles
- **Instant Status Toggle:** One-click Zapier-style toggle switch on workflow cards (`PATCH /api/workflows/:id/status`) with optimistic UI updating.
- **Execution Engine:** Mock execution simulation measuring duration, step-by-step execution payloads, and timestamped run histories.
- **Execution Logs & Metrics:** Complete audit trails with expandable step payload breakdowns, status badges (success/running/failed), and run count tracking.

### 4. 🔌 Integrations, MCP & Billing
- **Connected Accounts Manager:** Management hub for external credentials and OAuth connectors.
- **Model Context Protocol (MCP):** Server routes and UI panel for registering and discovering MCP tools and resources.
- **Stripe Billing & Plans:** Free, Pro, and Enterprise subscription tiers with plan column tracking and transaction history.
- **Secure Authentication:** JWT authentication with bcrypt password hashing and row-level data isolation by `user_id`.

---

## 🏗️ Architecture & Tech Stack

```
ai workflow/
├── client/                     # Frontend (React 18 + Vite + Tailwind CSS)
│   └── src/
│       ├── components/         # Layout, Navbar, ProtectedRoute, Canvas Nodes
│       ├── context/            # AuthContext (JWT session state)
│       ├── pages/              # Dashboard, WorkflowsPage, WorkflowEditor,
│       │                       # ConnectionsPage, McpPage, PricingPage, Logs
│       └── lib/                # Axios API client (REST endpoints)
│
└── server/                     # Backend (Node.js + Express ES Modules)
    └── src/
        ├── db/                 # PostgreSQL pool, schema migrations & scripts
        ├── middleware/         # JWT auth middleware, error handlers
        └── routes/             # workflows.js, connections.js, ai.js,
                                # auth.js, billing.js, logs.js, mcp.js
```

---

## 🛠️ Quick Start & Local Setup

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **PostgreSQL** (local instance or hosted via [Supabase](https://supabase.com) / [Neon](https://neon.tech))
- **Google Gemini API Key** (from [Google AI Studio](https://aistudio.google.com/app/apikey))

---

### 2. Backend Setup (`/server`)

1. Navigate to the server folder:
   ```bash
   cd server
   ```

2. Copy the environment variables:
   ```bash
   cp .env.example .env
   ```

3. Configure your `server/.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   DATABASE_URL=postgresql://username:password@localhost:5432/ai_workflow_db
   JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters
   JWT_EXPIRES_IN=7d
   GEMINI_API_KEY=your_gemini_api_key_here
   CLIENT_URL=http://localhost:5173
   ```

4. Install dependencies and run database migrations:
   ```bash
   npm install
   npm run db:migrate
   ```

5. Start the backend development server:
   ```bash
   npm run dev
   ```
   *Runs at `http://localhost:5000` (or `http://localhost:3001` if configured).*

---

### 3. Frontend Setup (`/client`)

1. In a new terminal, navigate to the client folder:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *Runs at `http://localhost:5173`.*

---

## 📦 What Was Built & Polished (Recent Changelog)

| Feature | Details |
| :--- | :--- |
| **Workflow Status Toggle** | Added `PATCH /api/workflows/:id/status` endpoint and animated toggle switch on workflow list cards with live backend persistence. |
| **Gmail Config Panel** | Built right-hand sidebar editor panel with dynamic variable pills, recipient mapping, and auth gate status. |
| **App Picker Atomic State** | Refactored step action picker to execute single atomic state updates to prevent stale closure overwrites. |
| **Variable Injection Engine** | Upstream step output scanner generating dynamic `{{StepN.var}}` tokens for RSS, Gemini, Google Sheets, Slack, and Webhooks. |
| **Production Build Fixes** | Verified bundle stability and asset chunking with `npm run build` passing cleanly. |

---

## 🔒 Security Best Practices

- **Zero Client-Side Keys:** `GEMINI_API_KEY` and database credentials are strictly server-side.
- **Row-Level Tenant Isolation:** All SQL queries enforce `WHERE user_id = $1` validation extracted from verified JWT tokens.
- **Strict Input Validation:** Payloads verified via **Zod** before hitting database or AI APIs.
- **Protected Environment:** `.gitignore` configured to ensure all `.env` files and local secrets are excluded from Git commits.

---

## 📄 License
ISC / Private Project.
