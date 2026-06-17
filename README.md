# 🚀 NexGen Cloud — Plateforme d'Hébergement Web

> Plateforme SaaS complète d'hébergement d'applications web avec déploiement automatisé, gestion DNS, monitoring en temps réel et administration centralisée.

---

## 📋 Table des Matières

- [Architecture](#-architecture)
- [Fonctionnalités](#-fonctionnalités)
- [Prérequis](#-prérequis)
- [Installation avec Docker](#-installation-avec-docker-recommandé)
- [Installation Manuelle](#-installation-manuelle-développement)
- [Identifiants par Défaut](#-identifiants-par-défaut)
- [Structure du Projet](#-structure-du-projet)
- [API Documentation](#-api-documentation)
- [Technologies](#-technologies)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                   NGINX (Port 80)               │
│            Frontend Angular + Proxy             │
├─────────────────┬───────────────────────────────┤
│   Frontend      │        /api/*                 │
│   Angular 21    │    ┌───────────────┐           │
│   (SPA)         │───▶│  Backend      │           │
│                 │    │  NestJS       │           │
│                 │    │  (Port 3000)  │           │
│                 │    └──────┬────────┘           │
│                 │           │                    │
│                 │    ┌──────▼────────┐           │
│                 │    │  MySQL 8.0    │           │
│                 │    │  (Port 3306)  │           │
│                 │    └───────────────┘           │
└─────────────────┴───────────────────────────────┘
```

---

## ✨ Fonctionnalités

### Utilisateurs
- 🔐 Authentification JWT avec inscription/connexion
- 🌐 OAuth (Google, GitHub, Microsoft)
- 🔑 Authentification à deux facteurs (2FA/TOTP)
- 👤 Gestion du profil utilisateur

### Déploiement
- 📦 Déploiement d'applications (simulation Docker)
- 🔄 Redémarrage et arrêt des instances
- 📊 Monitoring en temps réel (CPU, RAM, réseau)
- 🗑️ Suppression d'applications

### DNS
- 🌍 Gestion de domaines personnalisés
- 📝 CRUD des enregistrements DNS (A, AAAA, CNAME, MX, TXT, NS, SRV)
- ✅ Vérification de propagation DNS
- 📥 Import/Export de zones DNS

### Administration
- 👥 Gestion des utilisateurs (CRUD complet)
- 🖥️ Surveillance de l'infrastructure
- 📈 Quotas et ressources
- 🛡️ Rate limiting et protection contre les abus

---

## 📌 Prérequis

### Avec Docker (Recommandé)
- [Docker](https://docs.docker.com/get-docker/) >= 20.10
- [Docker Compose](https://docs.docker.com/compose/install/) >= 2.0

### Installation Manuelle
- [Node.js](https://nodejs.org/) >= 20.x
- [npm](https://www.npmjs.com/) >= 10.x
- [MySQL](https://www.mysql.com/) 8.0 (ou XAMPP)
- [Angular CLI](https://angular.dev/) >= 21.x

---

## 🐳 Installation avec Docker (Recommandé)

### 1. Cloner le projet
```bash
git clone <repository-url>
cd nexgen-cloud
```

### 2. Configurer l'environnement
```bash
cp .env.example .env
# Modifier les valeurs dans .env si nécessaire
```

### 3. Lancer la plateforme
```bash
docker compose up -d --build
```

### 4. Accéder à l'application
- **Frontend** : http://localhost
- **API** : http://localhost:3000/api
- **Swagger** : http://localhost:3000/api/docs

### Commandes utiles
```bash
# Voir les logs
docker compose logs -f

# Arrêter la plateforme
docker compose down

# Rebuild complet
docker compose up -d --build --force-recreate

# Voir l'état des services
docker compose ps
```

---

## 💻 Installation Manuelle (Développement)

### 1. Base de données
Créer la base de données MySQL :
```bash
mysql -u root -p < base_de_donnees.sql
```
> Ou importer `base_de_donnees.sql` via phpMyAdmin (XAMPP).

### 2. Backend
```bash
cd backend
cp .env.example .env   # Configurer les variables
npm install
npm run start:dev
```
Le serveur API sera accessible sur `http://localhost:3000`

### 3. Frontend
```bash
cd frontend
npm install
npm run start
```
L'application sera accessible sur `http://localhost:4200`

---

## 🔑 Identifiants par Défaut

| Rôle    | Email              | Mot de passe |
|---------|-------------------|-------------|
| Admin   | admin@gmail.com   | admin123    |
| User    | user@test.com     | password    |

> L'utilisateur `admin@gmail.com` obtient automatiquement le rôle `admin`.

---

## 📁 Structure du Projet

```
nexgen-cloud/
├── docker-compose.yml          # Orchestration Docker
├── .env.example                # Template des variables d'env
├── base_de_donnees.sql         # Schéma initial MySQL
│
├── backend/                    # API NestJS
│   ├── Dockerfile
│   ├── src/
│   │   ├── main.ts             # Point d'entrée
│   │   ├── app.module.ts       # Module racine
│   │   ├── auth/               # Authentification (JWT, OAuth, 2FA)
│   │   ├── users/              # Gestion des utilisateurs
│   │   ├── apps/               # Déploiement d'applications
│   │   ├── dns/                # Gestion DNS
│   │   ├── admin/              # Administration
│   │   └── entities/           # Entités TypeORM
│   └── package.json
│
├── frontend/                   # SPA Angular
│   ├── Dockerfile
│   ├── nginx.conf              # Config Nginx (production)
│   ├── src/
│   │   ├── app/
│   │   │   ├── pages/          # Composants de pages
│   │   │   │   ├── login/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── applications/
│   │   │   │   ├── deploy/
│   │   │   │   ├── dns/
│   │   │   │   ├── settings/
│   │   │   │   └── admin/
│   │   │   ├── services/       # Services Angular
│   │   │   ├── guards/         # Auth & Admin guards
│   │   │   └── components/     # Composants réutilisables
│   │   ├── environments/       # Config dev/prod
│   │   └── styles.scss         # Styles globaux
│   └── package.json
│
└── README.md
```

---

## 📚 API Documentation

L'API REST est documentée via **Swagger/OpenAPI**.

Accès : `http://localhost:3000/api/docs`

### Endpoints principaux

| Méthode | Endpoint                    | Description                    |
|---------|----------------------------|---------------------------------|
| POST    | /api/auth/signup           | Inscription                     |
| POST    | /api/auth/login            | Connexion                       |
| GET     | /api/apps                  | Liste des applications          |
| POST    | /api/apps/deploy           | Déployer une application        |
| POST    | /api/apps/:id/restart      | Redémarrer une application      |
| DELETE  | /api/apps/:id              | Supprimer une application       |
| GET     | /api/dns/domains           | Liste des domaines              |
| GET     | /api/admin/users           | Liste des utilisateurs (admin)  |
| DELETE  | /api/admin/users/:id       | Supprimer un utilisateur (admin)|
| GET     | /api/admin/infrastructure  | État de l'infrastructure        |

---

## 🛠️ Technologies

| Composant   | Technologie                                |
|-------------|--------------------------------------------|
| Frontend    | Angular 21, TypeScript, SCSS               |
| Backend     | NestJS, TypeORM, Passport.js               |
| Base de données | MySQL 8.0                              |
| Auth        | JWT, bcrypt, TOTP (2FA)                    |
| Sécurité    | Helmet, CORS, Rate Limiting (Throttler)    |
| DevOps      | Docker, Docker Compose, Nginx              |
| Documentation | Swagger / OpenAPI                        |

---

## 📄 Licence

Projet réalisé dans le cadre d'un Projet de Fin d'Études (PFE).

---

> **NexGen Cloud** — Infrastructure as a Service, réinventée. 🌩️
