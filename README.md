# NexGen Cloud - Plateforme d'Hébergement Web Sécurisée (PFE)

Ce projet est composé de trois parties principales : l'infrastructure (Docker), le backend (NestJS) et le frontend (Angular).

## Prérequis

- [Docker](https://docs.docker.com/get-docker/) et Docker Compose installés.
- [Node.js](https://nodejs.org/) (version 18 ou supérieure) installé.
- Gestionnaire de paquets `npm` (installé avec Node.js).

## Instructions d'Exécution

Pour lancer la plateforme en environnement de développement local, suivez ces 3 étapes en ouvrant **3 terminaux différents**.

### 1. Démarrer l'Infrastructure (Base de données)
Ouvrez un premier terminal à la racine du projet (\`/home/choubi/Desktop/Amal Assadi Project\`) :
\`\`\`bash
# Démarre PostgreSQL et Redis en arrière-plan
docker-compose up -d
\`\`\`

### 2. Démarrer le Backend (API NestJS)
Ouvrez un deuxième terminal, placez-vous dans le dossier \`backend\` :
\`\`\`bash
cd backend

# Installe les dépendances (si ce n'est pas déjà fait)
npm install

# Lance le serveur de développement
npm run start:dev
\`\`\`
Le backend sera accessible sur : \`http://localhost:3000\`

### 3. Démarrer le Frontend (Interface Angular)
Ouvrez un troisième terminal, placez-vous dans le dossier \`frontend\` :
\`\`\`bash
cd frontend

# Installe les dépendances (si ce n'est pas déjà fait)
npm install

# Lance le serveur de développement
npm run start
\`\`\`
Le frontend (portail web) sera accessible sur : \`http://localhost:4200\`

---

## Remarques importantes pour le PFE :
- Lors du premier lancement du Backend, la base de données PostgreSQL sera automatiquement synchronisée avec les entités définies (grâce à \`synchronize: true\` dans TypeORM).
- L'authentification OAuth (Google/Microsoft) nécessite des clés API valides. Par défaut, des valeurs de test sont utilisées dans les stratégies d'authentification (\`backend/src/auth/strategies/\`).
