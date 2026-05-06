# HomeLink — Setup Guide

## Prerequisites
- Node.js 18+ (https://nodejs.org)
- Your existing MySQL `homelink` database running locally

---

## 1. Install dependencies
Open a terminal in the project folder and run:
```
npm install
```

## 2. Configure environment variables
Copy the example file and fill in your MySQL credentials:
```
cp .env.example .env.local
```
Open `.env.local` and set:
- `DB_PASSWORD` — your MySQL root password
- `JWT_SECRET` — any long random string (e.g. 32+ characters)

## 3. Add password column to servicer table
Your current `servicer` table doesn't have a `password` column yet.
Run this in MySQL Workbench or your MySQL terminal:
```sql
ALTER TABLE servicer ADD COLUMN password VARCHAR(255) DEFAULT NULL;
```

## 4. Start the development server
```
npm run dev
```
Open http://localhost:3000 in your browser.

---

## Project structure
```
src/
  app/
    page.tsx                  ← Landing page (choose customer or servicer)
    login/page.tsx            ← Unified login/signup for both roles
    customer/
      page.tsx                ← Customer dashboard
      request/new/page.tsx    ← New service request form
    servicer/
      page.tsx                ← Servicer dashboard
      accept/[id]/page.tsx    ← Accept request + book appointment
    api/
      auth/login/route.ts     ← POST login
      auth/signup/route.ts    ← POST signup
      auth/logout/route.ts    ← POST logout
      requests/route.ts       ← GET + POST requests
      appointments/route.ts   ← GET + POST appointments
      receipts/route.ts       ← GET + POST receipts
      reviews/route.ts        ← GET + POST reviews
      companies/route.ts      ← GET companies
  lib/
    db.ts                     ← MySQL connection pool
    auth.ts                   ← JWT helpers
  components/
    shared/LogoutButton.tsx
```

## Database tables used
| Table       | Used by                          |
|-------------|----------------------------------|
| customer    | Login, dashboard, requests       |
| servicer    | Login, dashboard, appointments   |
| request     | Customer creates, servicer accepts|
| appointment | Booked when servicer accepts     |
| receipt     | Linked by contract_number        |
| review      | Customer leaves after job        |
| company     | Servicer profile / browse        |
| service     | Company service types            |
| manager     | Admin oversight (future)         |
