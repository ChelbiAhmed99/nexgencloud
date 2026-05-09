# NexGen Cloud - Plateforme d'Hébergement Web Sécurisée (PFE)

Ce projet est une plateforme SaaS d'hébergement web simplifiée, conçue pour fonctionner de manière autonome sans dépendances externes lourdes (pas de Docker, pas de Redis).

## Architecture du Projet
- **Backend** : NestJS (Mode Simulation pour l'hébergement)
- **Frontend** : Angular
- **Base de données** : MySQL (via XAMPP)

## Prérequis

- [XAMPP](https://www.apachefriends.org/index.html) avec MySQL activé (Port par défaut: 3307 ou 3306 selon votre configuration).
- [Node.js](https://nodejs.org/) (version 18 ou supérieure) installé.

## Instructions d'Exécution

### 1. Préparer la Base de Données
1. Lancez **XAMPP** et démarrez le service **MySQL**.
2. Créez une base de données nommée `hosting_db`.
3. Importez le fichier `base_de_donnees.sql` situé à la racine du projet via phpMyAdmin.

### 2. Démarrer le Backend (API NestJS)
Ouvrez un terminal dans le dossier `backend` :
```bash
cd backend
npm install
npm run start:dev
```
Le backend sera accessible sur : `http://localhost:3000`
*Note : Le déploiement des applications est simulé. Lorsque vous créez une application, elle passera en mode "RUNNING" après quelques secondes sans avoir besoin de Docker.*

### 3. Démarrer le Frontend (Interface Angular)
Ouvrez un autre terminal dans le dossier `frontend` :
```bash
cd frontend
npm install
npm run start
```
Le frontend sera accessible sur : `http://localhost:4200`

---

## Pourquoi "Sans Docker" ?
Cette version a été optimisée pour la présentation PFE afin de :
- Garantir un fonctionnement immédiat sur n'importe quelle machine (Windows/Linux/Mac).
- Éviter les conflits de configuration réseau et les sockets Docker.
- Se concentrer sur la logique métier, la sécurité (2FA) et l'interface utilisateur.
