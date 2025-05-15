# Application d'Analyse des Performances Scolaires

## 📋 Table des matières
1. [Aperçu du projet](#-aperçu-du-projet)
2. [Architecture technique](#-architecture-technique)
3. [Fonctionnalités principales](#-fonctionnalités-principales)
4. [Structure du projet](#-structure-du-projet)
5. [Installation et configuration](#-installation-et-configuration)
6. [Points d'amélioration](#-points-damélioration)
7. [Sécurité](#-sécurité)
8. [Contribution](#-contribution)
9. [Licence](#-licence)

## 🌟 Aperçu du projet

Cette application web permet de visualiser et d'analyser les performances scolaires à différents niveaux (province, commune, établissement). Elle offre des tableaux de bord interactifs avec des graphiques et des indicateurs clés pour le suivi des résultats scolaires.

## 🏗️ Architecture technique

### Stack technique
- **Frontend** : React.js avec Material-UI
- **Backend** : Laravel (PHP)
- **Base de données** : MySQL/MariaDB
- **Visualisation** : Chart.js
- **Authentification** : JWT (JSON Web Tokens)

### Schéma d'architecture
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │
│  Frontend   │ ◄──►│   Backend   │ ◄──►│  Base de    │
│  (React)    │     │  (Laravel)  │     │  Données    │
│             │     │             │     │  (MySQL)    │
└─────────────┘     └─────────────┘     └─────────────┘
```

## 🚀 Fonctionnalités principales

### Tableau de bord
- Vue d'ensemble des statistiques par province/commune/établissement
- Indicateurs clés (moyennes, taux de réussite, nombre d'élèves)
- Graphiques évolutifs

### Analyse par cycle
- Comparaison des performances entre cycles scolaires
- Répartition des établissements par cycle
- Évolution des résultats dans le temps

### Gestion des établissements
- Fiche détaillée par établissement
- Classement des établissements
- Analyse par niveau et matière

## 📂 Structure du projet

### Frontend (`/client`)
```
client/
├── src/
│   ├── components/     # Composants réutilisables
│   ├── pages/          # Pages de l'application
│   ├── services/       # Services API
│   ├── contexts/       # Contexte React
│   └── assets/         # Ressources statiques
└── public/             # Fichiers publics
```

### Backend (`/server`)
```
server/
├── app/
│   ├── Http/          # Contrôleurs et Middleware
│   ├── Models/         # Modèles Eloquent
│   └── Providers/      # Fournisseurs de service
├── database/           # Migrations et seeders
├── routes/             # Définition des routes
└── config/             # Fichiers de configuration
```

## 🛠️ Installation et configuration

### Prérequis
- PHP 8.0+
- Composer
- Node.js 14+
- MySQL 5.7+

### Installation

1. **Cloner le dépôt**
   ```bash
   git clone [URL_DU_DEPOT]
   cd pfe
   ```

2. **Backend**
   ```bash
   cd server
   cp .env.example .env
   composer install
   php artisan key:generate
   php artisan migrate --seed
   php artisan serve
   ```

3. **Frontend**
   ```bash
   cd ../client
   npm install
   npm run dev
   ```

4. **Accès**
   - Frontend : http://localhost:3000
   - Backend : http://localhost:8000

## 🎯 Points d'amélioration

### Performance
- [ ] Mise en cache des requêtes fréquentes
- [ ] Pagination des tableaux de données volumineux
- [ ] Optimisation des requêtes SQL

### Expérience utilisateur
- [ ] Amélioration du design responsive
- [ ] Ajout de filtres avancés
- [ ] Export des données (PDF/Excel)

### Fonctionnalités
- [ ] Tableau de bord personnalisable
- [ ] Alertes et notifications
- [ ] Tableaux de bord pour les directeurs d'établissement

## 🔒 Sécurité

### Mesures en place
- Authentification JWT
- Protection CSRF
- Validation des entrées
- Gestion des erreurs

### Recommandations
- [ ] Mise en place de rate limiting
- [ ] Journalisation des actions sensibles
- [ ] Tests de sécurité automatisés

## 🤝 Contribution

1. Forkez le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Poussez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

<div align="center">
  <p>Développé avec ❤️ par [Votre Équipe]</p>
  <p>© 2025 - Tous droits réservés</p>
</div>
