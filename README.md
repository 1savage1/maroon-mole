# Minhaj — Vocational Training Platform

A full-stack **Next.js + TypeScript** platform designed to connect vocational training institutes, companies, apprentices and administrators in Algeria.

The application includes authentication, role-based dashboards, database integration and dedicated areas for multiple user types.

## Main user roles

- Apprentice
- Training institute
- Company
- Administrator

After authentication, users are redirected to an interface matching their role.

## Main features

- User registration and login
- Role-based access and dashboards
- Apprentice area
- Company area
- Institute area
- Administration area
- Exploration / discovery pages
- Server-side API routes
- SQL database integration
- Form handling and validation
- Responsive Arabic interface with RTL support

## Application flow

```text
Visitor
  ↓
Register / Login
  ↓
Role detected
  ├─ Admin      → Admin dashboard
  ├─ Institute  → Institute area
  ├─ Company    → Company area
  └─ Apprentice → Apprentice area
```

## Tech stack

### Application

- Next.js 15
- React 19
- TypeScript
- Node.js

### UI

- Tailwind CSS
- Radix UI components
- Lucide icons
- Framer Motion

### Backend and data

- Next.js API routes
- MySQL (`mysql2`)
- JSON Web Tokens
- `bcryptjs` password hashing
- Zod validation
- React Hook Form

## Project structure

```text
src/app/          Application routes and pages
src/app/api/      Backend API endpoints
src/app/admin/    Administrator interface
src/app/company/  Company interface
src/app/institute/ Institute interface
src/app/apprentice/ Apprentice interface
src/components/   Reusable UI components
src/lib/          Authentication and shared application logic
database.sql      SQL database structure
public/           Static assets
```

## Local installation

### Requirements

- Node.js
- npm
- MySQL

### Setup

```bash
git clone https://github.com/1savage1/maroon-mole.git
cd maroon-mole
npm install
npm run dev
```

Configure the database settings required by the project before testing authentication and role-based features.

Then open:

```text
http://localhost:3000
```

## Security-related implementation

The project uses password hashing, token-based authentication and role-aware application routing. Different sections of the platform are separated according to the authenticated user's role.

## Portfolio value

This project demonstrates experience with:

- Multi-role business applications
- Authentication workflows
- Full-stack Next.js development
- SQL-backed applications
- Dashboard interfaces
- Arabic / RTL web interfaces
- Modern component-based UI architecture

## Future improvements

- Automated tests
- Email notifications
- Improved audit logs
- Production deployment configuration
- Expanded admin reporting
- File / document management

## Author

Developed by [1savage1](https://github.com/1savage1).
