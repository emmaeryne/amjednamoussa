# Namoussa - Boutique de Prêt-à-porter Féminin

Site web de la boutique Namoussa, spécialisée dans le prêt-à-porter féminin en Tunisie.

**Site web**: https://xnamoussa.com

## Technologies utilisées

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (Base de données, Authentification, Storage)

## Installation

```sh
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Build pour la production
npm run build
```

## Fonctionnalités

- Catalogue de produits avec catégories
- Panier d'achat
- Système de commandes
- Gestion admin (produits, commandes, codes promo)
- Recherche de produits
- Filtrage par catégorie et prix
- Génération automatique de variantes de couleur avec IA
- Upload d'images
- Statistiques de ventes et profits

## Configuration

Assurez-vous de configurer les variables d'environnement dans un fichier `.env`:

```
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_PUBLISHABLE_KEY=votre_cle_supabase
```
