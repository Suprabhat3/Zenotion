# Zenotion

<div align="center">

<h3>AI-Powered Notes & Knowledge Workspace</h3>

<p>
A modern <b>Notion-inspired productivity platform</b> built with Next.js 16, React 19, Prisma, PostgreSQL, and AI-powered workflows.
</p>

<p>
<img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=nextdotjs" />
<img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" />
<img src="https://img.shields.io/badge/TypeScript-Ready-3178C6?style=for-the-badge&logo=typescript" />
<img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma" />
<img src="https://img.shields.io/badge/PostgreSQL-Database-336791?style=for-the-badge&logo=postgresql" />
<img src="https://img.shields.io/badge/TailwindCSS-v4-38BDF8?style=for-the-badge&logo=tailwindcss" />
</p>

<p>
<img src="https://img.shields.io/github/stars/Suprabhat3/Zenotion?style=social" />
<img src="https://img.shields.io/github/forks/Suprabhat3/Zenotion?style=social" />
</p>

</div>

---

## ✨ What is Zenotion?

Zenotion is a modern note-taking and knowledge management platform inspired by Notion.

Instead of focusing on feature bloat, Zenotion demonstrates how a production-grade application can be built using modern Next.js architecture:

* ⚡ App Router
* 🧠 Server Actions
* 🔌 Route Handlers
* 🔐 Authentication
* 🗄 PostgreSQL + Prisma
* 🤖 AI-Powered Commands
* 🎯 SSR, ISR & Static Rendering
* 📦 Type-Safe APIs

---

## 🌐 Live Demo

### Application

https://zenotion.zenscail.com/

### Demo Credentials

```text
Email: test@zenotion.com
Password: Test@123
```

---

## 🎯 Core Features

### 📝 Smart Note Management

* Markdown note editor
* Live preview
* Auto-save support
* Fast note creation

### 🤖 AI Assistant

* AI command palette
* Writing assistance
* Content enhancement
* Multi-provider architecture

### 🗂 Organization System

* Folder support
* Tag management
* Structured note hierarchy
* Efficient workspace organization

### 🌍 Public Sharing

* Share notes publicly
* SEO-friendly URLs
* Slug-based note access

### 🔐 Authentication

* Email & Password Login
* 6-digit email verification codes (Resend) before a session is issued
* Google OAuth Support
* Secure Session Handling
* Welcome/onboarding email on first verified sign-up

### 🎨 User Experience

* Fully Responsive
* Light Mode
* Dark Mode
* Clean Productivity UI

---

## 🏗 Architecture

```text
┌────────────────────────────┐
│         Frontend           │
│       React 19 UI          │
└─────────────┬──────────────┘
              │
              ▼
┌────────────────────────────┐
│     Next.js App Router     │
│  Server Components + SSR   │
└─────────────┬──────────────┘
              │
     ┌────────┴─────────┐
     ▼                  ▼
Server Actions     Route Handlers
     │                  │
     └────────┬─────────┘
              ▼
┌────────────────────────────┐
│        Prisma ORM          │
└─────────────┬──────────────┘
              ▼
┌────────────────────────────┐
│      PostgreSQL DB         │
└────────────────────────────┘
```

---

## 🛠 Tech Stack

| Category       | Technology     |
| -------------- | -------------- |
| Framework      | Next.js 16     |
| Frontend       | React 19       |
| Language       | TypeScript     |
| Styling        | Tailwind CSS 4 |
| Database       | PostgreSQL     |
| ORM            | Prisma         |
| Authentication | Better Auth    |
| Validation     | Zod            |
| AI Integration | OpenAI SDK     |
| Deployment     | Vercel         |

---

## 📁 Project Structure

```bash
app
├── (auth)
│   ├── login
│   └── signup
│
├── (app)
│   ├── dashboard
│   └── notes
│
├── api
│   ├── auth
│   ├── notes
│   └── ai
│
├── templates
├── about
└── share

lib
├── api.ts
├── auth.ts
├── db.ts
├── notes.ts
├── session.ts
└── validators.ts

prisma
└── schema.prisma
```

---

## ⚡ Rendering Strategy

### Server Side Rendering (SSR)

Used for:

* Dashboard
* Note Editor
* Shared Notes

### Incremental Static Regeneration (ISR)

Templates Page:

```ts
export const revalidate = 3600
```

### Static Rendering

Used where user-specific data is unnecessary.

---

## 🔌 API Endpoints

### Notes

```http
GET    /api/notes
POST   /api/notes
GET    /api/notes/[id]
PATCH  /api/notes/[id]
DELETE /api/notes/[id]
```

### AI

```http
POST /api/ai
```

### Authentication

```http
GET  /api/auth/[...all]
POST /api/auth/[...all]
```

---

## 🚀 Quick Start

### Clone Repository

```bash
git clone https://github.com/Suprabhat3/Zenotion.git
cd Zenotion
```

### Install Dependencies

```bash
pnpm install
```

### Configure Environment

```env
DATABASE_URL=

BETTER_AUTH_SECRET=

BETTER_AUTH_URL=http://localhost:3000

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# ImageKit (note image + cover uploads; leave blank to disable uploads)
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_URL_ENDPOINT=

# Resend (email verification codes + welcome email) — required for
# email/password sign-up. EMAIL_FROM must use a Resend-verified domain.
RESEND_API_KEY=
EMAIL_FROM="Zenotion <hi@yourdomain.com>"
```

### Run Database Migration

```bash
pnpm db:migrate
```

### Start Development Server

```bash
pnpm dev
```

Open:

```text
http://localhost:3000
```

---

## ✅ Verification Checklist

```bash
pnpm lint
pnpm build
```

Verify:

* User Authentication (email OTP verification + Google OAuth)
* Note CRUD
* Folder Management
* Tag Management
* Public Sharing
* AI Commands
* API Responses

---

## 🤝 Contributing

Contributions are welcome.

```bash
Fork ➜ Clone ➜ Create Branch ➜ Commit ➜ Push ➜ Open PR
```

---

## ⭐ Why Zenotion?

Zenotion is more than a notes application.

It serves as a practical reference for developers learning:

* Next.js App Router
* Server Actions
* Route Handlers
* Authentication
* Prisma ORM
* PostgreSQL Integration
* AI Application Architecture

A clean example of how modern full-stack applications are built using the latest React and Next.js ecosystem.

---

## 📄 License

MIT License

---

<div align="center">

### Built with ❤️ using Next.js 16, React 19, Prisma & PostgreSQL

⭐ Star the repository if you found it useful.

</div>
