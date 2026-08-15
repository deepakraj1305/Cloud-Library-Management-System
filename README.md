# ☁️ CloudLibrary Management System

A modern web-based **Library Management System** for managing college books, members, and book circulation through a centralized digital platform.

## 🌐 Live Demo

**[View Live Demo](YOUR_VERCEL_URL)**

> Replace `YOUR_VERCEL_URL` with the deployed application URL.

## 📌 Overview

CloudLibrary digitizes common library operations and provides a clean dashboard for monitoring books, registered members, issued books, returns, and overdue records. The frontend is built with React and TypeScript, while Supabase provides the database and backend services.

## ✨ Features

- 📊 Dashboard with library statistics
- 📚 Book catalog and copy availability management
- 👥 Library member management
- 🔄 Book issue and return tracking
- ⚠️ Overdue book monitoring
- 🗄️ Supabase database integration
- 📱 Responsive user interface

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| React | Frontend UI |
| TypeScript | Type-safe development |
| Vite | Development and production build tool |
| Tailwind CSS | UI styling |
| Supabase | Database and backend services |
| Lucide React | Interface icons |
| ESLint | Code quality |

## 🏗️ Architecture

```text
User / Library Staff
        ↓
React + TypeScript Frontend
        ↓
Vite Application
        ↓
Supabase
        ↓
Books • Members • Circulation Data
```

## 📁 Project Structure

```text
Cloud-Library-Management-System/
├── src/
│   ├── components/
│   ├── lib/
│   ├── pages/
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── supabase/
│   └── migrations/
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── README.md
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## 🚀 Getting Started

### Prerequisites

- Node.js
- npm
- Git
- A Supabase project

### 1. Clone the repository

```bash
git clone https://github.com/deepakraj1305/Cloud-Library-Management-System.git
cd Cloud-Library-Management-System
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Supabase

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Do not commit `.env` or private credentials to GitHub.

### 4. Set up the database

The SQL migration files are available in `supabase/migrations/`. Apply them to your Supabase project before running the application with a new database.

### 5. Run locally

```bash
npm run dev
```

### 6. Build for production

```bash
npm run build
```

### 7. Preview the production build

```bash
npm run preview
```

## 🗄️ Database

Supabase is used to store and manage library data including books, book copies, members, and circulation records. SQL migrations are included in `supabase/migrations/` for database setup.

## 🌍 Deployment

The project can be deployed using Vercel or another Vite-compatible hosting platform. Configure the following environment variables in the deployment platform:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Recommended deployment flow:

```text
GitHub → Vercel → CloudLibrary → Supabase
```

## 🔐 Security

- Keep `.env` files out of version control.
- Store deployment environment variables in the hosting platform.
- Configure appropriate Supabase Row Level Security policies for production use.
- Never commit private service-role keys to the repository.

## 📈 Future Enhancements

- Authentication and role-based access
- Student login
- Fine calculation
- Book reservation
- Email notifications
- QR/barcode-based book management
- Reports and analytics
- PDF report generation

## 📄 License

This project is developed as an academic and educational project.

## 👨‍💻 Project

**CloudLibrary Management System**

**GitHub:** https://github.com/deepakraj1305/Cloud-Library-Management-System
