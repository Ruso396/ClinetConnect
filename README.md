# Ruso Bros (ClientConnect)

Mobile-first **Customer & Marketing Management** CRM for an internal marketing team.
Built with **React + Vite + TypeScript + Tailwind CSS + Supabase** (PostgreSQL, Auth, RLS).
Deployable to **Vercel**.

## Features

- Login (Supabase Auth, persisted browser session — no public signup)
- Dashboard with live statistics, today's follow-ups & recent customers
- Customer CRUD, search (debounced) and filters (status, type, follow-up, date added)
- Customer details with Call / WhatsApp / Google Maps quick actions
- Notes, follow-up date & time, activity history timeline
- Follow-ups page: Today / Tomorrow / Upcoming / Overdue, mark as completed
- Profile: edit profile, change password, logout (with confirmation)
- Mobile bottom navigation + desktop sidebar, skeleton loaders, toasts, touch-friendly

## Stack

| Layer        | Choice                                   |
| ------------ | ---------------------------------------- |
| Frontend     | React 19, Vite, TypeScript, Tailwind CSS 4 |
| Routing      | React Router                             |
| Icons        | lucide-react                             |
| Backend      | Supabase (PostgreSQL)                    |
| Auth         | Supabase Auth (email/password)           |
| Security     | Supabase Row Level Security              |
| Deploy       | Vercel                                   |

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Only the publishable/anonymous key is used. **Never** put a service-role key in the frontend. `.env` is git-ignored.

### 3. Create the internal CRM user (Supabase)

The account used to sign in is managed by Supabase Authentication — it is **not** hardcoded in the app.

1. Open your Supabase project.
2. Go to **Authentication → Users → Add user → Create new user**.
3. Create the internal account:

   - Email: `rusobros@tech.in`
   - Password: `rusobros123`

   > This password belongs to Supabase Authentication dashboard only. It is not stored in application source code. Change it anytime from the dashboard or the Profile page.

### 4. Run the database schema

Open **SQL Editor** in Supabase and run the whole file:

```
supabase/schema.sql
```

# ClinetConnect

This creates `profiles`, `customers`, `customer_activities`, indexes, the `updated_at` trigger, the auto-profile trigger on `auth.users`, constraints and all Row Level Security policies. It is idempotent — safe to run repeatedly.

When the user signs in for the first time the corresponding `profiles` row is created automatically.

### 5. Run locally

```bash
npm run dev
```

### 6. Deploy to Vercel

Import the repo on Vercel, add the two environment variables
(`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) and deploy. Framework preset: **Vite**.

## Data model

```
profiles            id (PK = auth.users.id), full_name, email, phone, role, avatar_url
customers           id, name, phone, alternate_phone, email, company, address, city,
                    district, state, pincode, customer_type, status, notes,
                    follow_up_date, follow_up_time, created_by, created_at, updated_at
customer_activities id, customer_id (FK -> customers ON DELETE CASCADE), user_id,
                    activity_type, description, created_at
```

Every status change and edit automatically writes an activity record in
`customer_activities`. Deleting a customer cascades to its activities.

## Scripts

```bash
npm run dev      # dev server
npm run build    # typecheck + production build
npm run lint     # oxlint
npm run preview  # preview production build
```

## Project structure

```
src/
  components/
    ui/            Button, Input, Textarea, Select, Modal, BottomSheet, Toast, Badge,
                   Avatar, Card utils, Skeleton, EmptyState, ConfirmDialog, SearchBar,
                   PageHeader, LoadingScreen
    layout/        AppLayout
    navigation/    BottomNavigation, Sidebar, NavItems
    customers/     CustomerCard, ActivityTimeline, CustomerForm, FilterSheet, AddActivitySheet
  pages/           Login, Dashboard, Customers, AddCustomer, CustomerDetails,
                   EditCustomer, FollowUps, Profile
  contexts/        AuthContext
  hooks/           useAuth, useCustomers
  lib/             supabase, constants, cn
  services/        customerService, activityService, profileService
  utils/           phone, date
  routes/          ProtectedRoute (protected + public-only routes)
  types/           shared types
supabase/schema.sql
```