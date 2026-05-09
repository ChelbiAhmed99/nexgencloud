# SecureHost Platform - Backend API (Simulation Mode)

## Purpose
The SecureHost backend is a scalable, modular monolith built with NestJS. In this version, the infrastructure orchestration is **simulated** to allow for seamless development and presentation without requiring Docker.

## Architecture Guidelines
- **Framework:** NestJS
- **Database:** MySQL (via XAMPP) managed by TypeORM
- **Hosting Engine:** Simulation Mode (Mocked container lifecycle)

## Prerequisites
- Node.js (v18+)
- MySQL via XAMPP

## Setup & Installation

1. Install dependencies:
   ```bash
   npm install
   ```
2. Import the initial database schema using the `base_de_donnees.sql` file via phpMyAdmin.
3. Configure `.env` with your database credentials.

## Run Instructions

**Development Mode:**
```bash
npm run start:dev
```

## Features
- **User Authentication:** Secure login with JWT and 2FA support.
- **Quota Management:** Automatic checks for tenant resource limits.
- **Simulated Deployment:** Apps transition from `CREATING` to `RUNNING` status automatically.
- **Mock Statistics:** Real-time generation of CPU and RAM usage for hosted apps.
