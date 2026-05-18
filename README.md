# Ricash Back-Office v4.0

Back-office d'administration pour **Ricash** — plateforme de transfert d'argent international en Afrique de l'Ouest.

Interface web permettant aux équipes internes de gérer clients, agents, transactions, KYC, liquidités (float), configuration, notifications et paramètres.

## Fonctionnalités

| Module | Description |
|--------|-------------|
| **Tableau de bord** | Vue d'ensemble, statistiques et graphiques |
| **Clients** | Liste, détail, statuts et historique |
| **Agents** | Gestion des agents, float et mouvements |
| **Administrateurs** | Comptes admin (super admin uniquement) |
| **Transactions** | Suivi, détail et actions de modération |
| **KYC** | Vérification et validation des dossiers |
| **Float** | Demandes de rechargement de liquidités |
| **Configuration** | Frais, limites KYC, paramètres généraux |
| **Notifications** | Envoi et historique des alertes |
| **Paramètres** | Préférences utilisateur et sécurité |

### Rôles

- **Super Admin** — accès complet (admins, config, etc.)
- **Admin** — accès opérationnel (clients, agents, transactions, KYC, float, notifications)

## Stack technique

- [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/) (Radix UI)
- [Zustand](https://zustand-demo.pmnd.rs/) — état global et persistance auth
- [Recharts](https://recharts.org/) — graphiques
- [Sonner](https://sonner.emilkowal.ski/) — notifications toast

> **Note :** les données sont fournies par des **mocks** en mémoire (`src/mocks/`). Aucune API backend n'est requise pour le développement local.

## Prérequis

- **Node.js** 18+
- **npm** (ou pnpm / bun)

## Installation

```bash
git clone https://github.com/amasbarry223/Back_office_Ricash.git
cd Back_office_Ricash
npm install
```

## Démarrage

```bash
# Développement (http://localhost:3000)
npm run dev

# Build production
npm run build

# Serveur production
npm run start

# Lint
npm run lint
```

## Connexion (démo)

Comptes mock définis dans `src/stores/auth-store.ts` :

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Super Admin | `superadmin@ricash.com` | `ricash2025` |
| Admin | `admin@ricash.com` | `ricash2025` |

## Structure du projet

```
src/
├── app/              # Layout Next.js, page racine (router client)
├── components/
│   ├── common/       # DataTable, PageHeader, RoleGuard, etc.
│   ├── layout/       # Sidebar, header, dashboard layout
│   ├── notifications/
│   └── ui/           # Composants shadcn/ui
├── hooks/
├── lib/              # Utilitaires (format, cn, common)
├── mocks/            # Données de démonstration
├── stores/           # Zustand (auth, router, entités métier)
├── types/            # Types TypeScript partagés
└── views/            # Écrans par domaine métier
```

## Navigation

Le routage est géré côté client via `useRouterStore` (`src/stores/router-store.ts`), sans routes Next.js multiples : une seule page (`/`) avec rendu conditionnel des vues.

## Déploiement Vercel

Le projet est prêt pour [Vercel](https://vercel.com) (Next.js détecté automatiquement).

### Déploiement via GitHub (recommandé)

1. Connectez-vous à [vercel.com](https://vercel.com) et cliquez sur **Add New Project**
2. Importez le dépôt [amasbarry223/Back_office_Ricash](https://github.com/amasbarry223/Back_office_Ricash)
3. Paramètres détectés automatiquement :
   - **Framework** : Next.js
   - **Build Command** : `npm run build`
   - **Output Directory** : (défaut Next.js)
   - **Install Command** : `npm install`
4. Aucune variable d'environnement obligatoire pour la version mock actuelle
5. Cliquez sur **Deploy**

### Déploiement via CLI

```bash
npm i -g vercel
vercel login
vercel
```

Pour la production :

```bash
vercel --prod
```

### Fichiers de configuration

| Fichier | Rôle |
|---------|------|
| `vercel.json` | Région `cdg1` (Paris, proche Afrique de l'Ouest) |
| `.env.example` | Modèle de variables pour une future API |
| `next.config.ts` | Config Next.js compatible Vercel (sans `standalone`) |

### Notes importantes

- Les **données mock** et l’**auth** sont côté client (localStorage via Zustand) : pas de base de données sur Vercel pour l’instant
- En production, le **code de réinitialisation** du mot de passe n’est **pas** affiché (uniquement en `development`)
- Node.js **20+** requis (`engines` dans `package.json`)

## Licence

Projet privé — usage interne Ricash.
