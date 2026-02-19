# Marshmallowz 🍬

Marshmallowz is a modern, high-performance **Inventory Management System** built with **Next.js 16**, **TypeScript**, and **LibSQL**. It offers a sleek, responsive dashboard for tracking products, managing stock levels, and monitoring sales in real-time.

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://marshmallowz.vercel.app)

## ✨ Features

- **📊 Comprehensive Dashboard**: Real-time overview of total products, inventory value, and sales performance.
- **📦 Product Management**: Full CRUD operations for products with category-based filtering.
- **📈 Sales Tracking**: Record sales across different platforms and track daily/weekly revenue.
- **⚠️ Low Stock Alerts**: Automatic visual indicators for items that need restocking.
- **⚡ Fast Search**: Debounced search for quickly finding products in large inventories.
- **🔒 Secure Authentication**: Robust session management and protected API routes using `jose` and `bcryptjs`.
- **📱 Responsive Design**: Fully optimized for mobile and desktop viewing.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [LibSQL](https://github.com/tursodatabase/libsql) (SQLite-compatible)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Auth**: [bcryptjs](https://github.com/dcodeIO/bcrypt.js) & [jose](https://github.com/panva/jose)
- **Deployment**: [Vercel](https://vercel.com/)

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or pnpm

### Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/shivam27k/Marshmallowz.git
   cd Marshmallowz
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env.local` file in the root directory and add your environment variables (refer to `.env.example`).

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

## 👤 Demo Access

You can access the live demo using the following credentials:

- **Username**: `admin`
- **Password**: `admin123`

## 📁 Repository Structure

- `app/`: Next.js App Router routes and page components.
- `components/`: Reusable React components (Modals, Icons, etc.).
- `lib/`: Shared utilities, database config, and TypeScript types.
- `public/`: Static assets.
- `scripts/`: Maintenance and utility scripts.

## 📫 Contact

Created by **Shivam** - feel free to reach out on GitHub at [@shivam27k](https://github.com/shivam27k).

---

*Last updated on 2026-02-20*
