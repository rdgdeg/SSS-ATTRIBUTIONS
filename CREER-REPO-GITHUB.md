# Instructions pour créer le repository GitHub

## Option 1 : Via l'interface web GitHub (Recommandé)

1. Allez sur https://github.com/new
2. Remplissez les informations :
   - **Repository name** : `sss-attributions`
   - **Description** : `Application de gestion des cours vacants et attributions pour UCLouvain`
   - **Visibilité** : Public ou Private (selon votre choix)
   - **Ne cochez PAS** "Initialize this repository with a README" (nous avons déjà un README)
   - **Ne cochez PAS** "Add .gitignore" (nous avons déjà un .gitignore)
3. Cliquez sur **"Create repository"**

4. Ensuite, dans votre terminal, exécutez :
```bash
cd "c:\Users\rdegand\Documents\DEV\SSS-ATTRIBUTIONS"
git push -u origin main
```

## Option 2 : Via GitHub CLI (si installé)

```bash
gh repo create sss-attributions --public --source=. --remote=origin --push
```

## Option 3 : Créer le repo et pousser en une commande

Si vous avez un token GitHub avec les permissions appropriées, vous pouvez utiliser l'API GitHub directement.

Une fois le repository créé, le code sera automatiquement disponible sur :
**https://github.com/rdgdeg/sss-attributions**
