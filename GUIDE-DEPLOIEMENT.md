# Guide de déploiement - GitHub et Vercel

## 📋 Étape 1 : Créer le repository GitHub

### Option A : Via l'interface web (Recommandé)

1. Allez sur https://github.com/new
2. Remplissez les informations :
   - **Repository name** : `SSS-ATTRIBUTIONS`
   - **Description** : `Application de gestion des cours vacants et attributions pour UCLouvain`
   - **Visibilité** : Public ou Private (selon votre choix)
   - **Ne cochez PAS** "Initialize this repository with a README"
   - **Ne cochez PAS** "Add .gitignore"
   - **Ne cochez PAS** "Choose a license"
3. Cliquez sur **"Create repository"**

### Option B : Via GitHub CLI (si installé)

```bash
gh repo create SSS-ATTRIBUTIONS --public --source=. --remote=origin --push
```

## 📤 Étape 2 : Pousser le code vers GitHub

Une fois le repository créé, exécutez dans PowerShell :

```powershell
cd c:\Users\rdegand\Documents\DEV\SSS-ATTRIBUTIONS
git push -u origin main
```

Si vous avez des problèmes d'authentification, vous devrez peut-être :
- Configurer un Personal Access Token (PAT) GitHub
- Ou utiliser SSH au lieu de HTTPS

### Configurer un Personal Access Token

1. Allez sur https://github.com/settings/tokens
2. Cliquez sur "Generate new token (classic)"
3. Donnez-lui un nom (ex: "SSS-ATTRIBUTIONS")
4. Sélectionnez les permissions : `repo` (toutes)
5. Cliquez sur "Generate token"
6. Copiez le token (vous ne pourrez plus le voir après)

Ensuite, lors du `git push`, utilisez votre nom d'utilisateur GitHub et le token comme mot de passe.

## 🚀 Étape 3 : Déployer sur Vercel

### Option A : Via l'interface web Vercel (Recommandé)

1. Allez sur https://vercel.com
2. Connectez-vous avec votre compte GitHub
3. Cliquez sur **"Add New Project"**
4. Sélectionnez le repository `SSS-ATTRIBUTIONS`
5. Vercel détectera automatiquement la configuration :
   - **Framework Preset** : Other (ou Static Site)
   - **Root Directory** : `./` (racine)
   - **Build Command** : (laissez vide - pas de build nécessaire)
   - **Output Directory** : `./` (racine)
6. Cliquez sur **"Deploy"**

### Option B : Via Vercel CLI

1. Installez Vercel CLI :
```bash
npm install -g vercel
```

2. Dans le dossier du projet :
```bash
cd c:\Users\rdegand\Documents\DEV\SSS-ATTRIBUTIONS
vercel login
vercel
```

3. Suivez les instructions interactives

## ⚙️ Configuration Vercel

Le fichier `vercel.json` est déjà configuré avec :
- **Routes** : Redirection vers `app-cours-vacants-complete.html` comme page principale
- **Headers de sécurité** : Protection XSS, frame options, etc.

### Routes disponibles après déploiement :
- `/` → `app-cours-vacants-complete.html`
- `/app` → `app-cours-vacants-complete.html`
- `/gestion` → `app-gestion-cours-vacants.html`
- `/import` → `app-import-cours-vacants.html`

## 🔐 Variables d'environnement (si nécessaire)

Si vous avez besoin de variables d'environnement pour Supabase :

1. Dans Vercel, allez dans **Settings** → **Environment Variables**
2. Ajoutez les variables nécessaires :
   - `SUPABASE_URL` (si utilisé côté serveur)
   - `SUPABASE_ANON_KEY` (si utilisé côté serveur)

**Note** : Dans votre application actuelle, les clés Supabase sont directement dans le code HTML. Pour la production, il serait recommandé de les déplacer vers des variables d'environnement.

## 📝 Vérification du déploiement

Après le déploiement, Vercel vous donnera une URL comme :
- `https://sss-attributions.vercel.app` (ou un nom personnalisé)
- Ou un nom personnalisé si configuré

Testez l'application en accédant à cette URL.

## 🔄 Mises à jour futures

Pour mettre à jour l'application :

1. Faites vos modifications localement
2. Commitez les changements :
```bash
git add .
git commit -m "Description des changements"
git push origin main
```

3. Vercel déploiera automatiquement les changements (si le déploiement automatique est activé)

## 🐛 Dépannage

### Problème : "Repository not found"
- Vérifiez que le repository GitHub existe bien
- Vérifiez que vous avez les permissions d'accès
- Vérifiez l'URL du remote : `git remote -v`

### Problème : Erreur d'authentification GitHub
- Configurez un Personal Access Token
- Ou changez le remote vers SSH : `git remote set-url origin git@github.com:rdgdeg/SSS-ATTRIBUTIONS.git`

### Problème : Vercel ne trouve pas les fichiers
- Vérifiez que `vercel.json` est à la racine
- Vérifiez que les fichiers HTML existent
- Vérifiez les logs de build dans Vercel

### Problème : Les routes ne fonctionnent pas
- Vérifiez que `vercel.json` est correctement formaté
- Vérifiez les logs de déploiement dans Vercel

## 📚 Ressources

- [Documentation Vercel](https://vercel.com/docs)
- [Documentation GitHub](https://docs.github.com)
- [Guide Supabase](https://supabase.com/docs)
