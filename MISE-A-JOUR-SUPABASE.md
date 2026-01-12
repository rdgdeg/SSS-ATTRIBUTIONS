# ✅ Mise à jour des informations Supabase

## Nouvelles informations de connexion

Les fichiers ont été mis à jour avec les nouvelles informations Supabase :

- **URL**: `https://dhuuduphwvxrecfqvbbw.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRodXVkdXBod3Z4cmVjZnF2YmJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMTEyODksImV4cCI6MjA4Mzc4NzI4OX0.RyURwma808AT0PqFIWXpe6NIdIdoscYN5GiC8Dh7Ktk`
- **Service Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRodXVkdXBod3Z4cmVjZnF2YmJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODIxMTI4OSwiZXhwIjoyMDgzNzg3Mjg5fQ.8MxRin8vRlOvGTwFS0YxmU8zf6XsTRj5KKsF2leUZwY`

## Fichiers mis à jour

✅ `import-cours-vacants.tsx`
✅ `cours-vacants-view.tsx`
✅ `import-excel-component.tsx`
✅ `guide-cours-vacants.md`
✅ `guide-integration-supabase.md`

## Prochaines étapes

1. **Créer la table dans Supabase** :
   - Allez sur https://dhuuduphwvxrecfqvbbw.supabase.co
   - Ouvrez le SQL Editor
   - Exécutez le script `supabase-cours-vacants-sql.sql`

2. **Vérifier les politiques RLS** :
   - Assurez-vous que les politiques permettent la lecture/écriture selon vos besoins

3. **Tester l'import** :
   - Utilisez l'application standalone : `index-standalone.html`
   - Ou intégrez les composants dans votre application Next.js

## Configuration pour Next.js

Si vous utilisez Next.js, créez un fichier `.env.local` avec :

```env
NEXT_PUBLIC_SUPABASE_URL=https://dhuuduphwvxrecfqvbbw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRodXVkdXBod3Z4cmVjZnF2YmJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMTEyODksImV4cCI6MjA4Mzc4NzI4OX0.RyURwma808AT0PqFIWXpe6NIdIdoscYN5GiC8Dh7Ktk
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRodXVkdXBod3Z4cmVjZnF2YmJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODIxMTI4OSwiZXhwIjoyMDgzNzg3Mjg5fQ.8MxRin8vRlOvGTwFS0YxmU8zf6XsTRj5KKsF2leUZwY
```

Vous pouvez copier le fichier `.env.local.example` et le renommer en `.env.local`.
