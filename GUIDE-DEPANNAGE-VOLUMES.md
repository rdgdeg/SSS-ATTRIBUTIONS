# 🔧 Guide de Dépannage - Volumes non chargés

## Problème : Les volumes ne s'affichent pas dans les fiches

### Étape 1 : Vérifier que les colonnes existent dans Supabase

1. Allez sur https://dhuuduphwvxrecfqvbbw.supabase.co
2. Ouvrez le **SQL Editor**
3. Exécutez cette requête pour vérifier les colonnes :

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'cours_vacants' 
AND column_name IN ('vol1_total', 'vol2_total', 'vol1_non_attribue', 'vol2_non_attribue')
ORDER BY column_name;
```

**Si les colonnes n'existent pas**, exécutez le script `supabase-add-missing-columns.sql` dans le SQL Editor.

### Étape 2 : Vérifier les données dans Supabase

Exécutez cette requête pour voir si les volumes sont bien enregistrés :

```sql
SELECT code_cours, intitule, vol1_total, vol2_total, vol1_non_attribue, vol2_non_attribue
FROM cours_vacants
ORDER BY code_cours
LIMIT 10;
```

### Étape 3 : Vérifier la console du navigateur

1. Ouvrez l'application : http://localhost:8002/app-gestion-cours-vacants.html
2. Appuyez sur **F12** pour ouvrir la console
3. Regardez les messages :
   - "Cours chargés: X" - doit afficher le nombre de cours
   - "Premier cours: ..." - doit afficher les détails du premier cours
   - S'il y a des erreurs, notez-les

### Étape 4 : Vérifier l'import

1. Allez dans l'onglet **Import Excel**
2. Sélectionnez votre fichier Excel
3. Ouvrez la console (F12)
4. Regardez les messages :
   - "Colonnes disponibles dans le fichier Excel:" - liste toutes les colonnes
   - "Cours XXX: Vol1 Total = X, Vol2 Total = Y" - affiche les volumes lus
   - "Sauvegarde cours XXX:" - affiche les volumes sauvegardés

### Étape 5 : Vérifier le format des colonnes Excel

Les colonnes peuvent avoir différents noms. Le code cherche :
- `Vol.1 Total`, `Vol1 Total`, `Volume 1 Total`, `Volume 1 to`, `Volume 1`, `Vol.1`
- `Vol.2 Total`, `Vol2 Total`, `Volume 2 Total`, `Volume 2 to`, `Volume 2`, `Vol.2`

Si vos colonnes ont un autre nom, dites-moi le nom exact et je l'ajouterai.

### Étape 6 : Forcer le rechargement

1. Cliquez sur le bouton **🔄 Actualiser** dans la liste des cours
2. Ou rechargez la page avec **Ctrl+Shift+R** (vide le cache)

### Solutions rapides

#### Solution 1 : Ajouter les colonnes manquantes

Exécutez ce script dans Supabase SQL Editor :

```sql
-- Ajouter les colonnes de volumes si elles n'existent pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cours_vacants' AND column_name = 'vol1_total') THEN
        ALTER TABLE cours_vacants ADD COLUMN vol1_total DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cours_vacants' AND column_name = 'vol2_total') THEN
        ALTER TABLE cours_vacants ADD COLUMN vol2_total DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cours_vacants' AND column_name = 'vol1_non_attribue') THEN
        ALTER TABLE cours_vacants ADD COLUMN vol1_non_attribue DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cours_vacants' AND column_name = 'vol2_non_attribue') THEN
        ALTER TABLE cours_vacants ADD COLUMN vol2_non_attribue DECIMAL(10,2) DEFAULT 0;
    END IF;
END $$;
```

#### Solution 2 : Mettre à jour les cours existants

Si les colonnes existent mais sont vides, vous pouvez mettre à jour manuellement :

```sql
-- Mettre à jour les volumes (remplacez les valeurs par vos vraies valeurs)
UPDATE cours_vacants 
SET vol1_total = 0, vol2_total = 0 
WHERE vol1_total IS NULL OR vol2_total IS NULL;
```

### Contact

Si le problème persiste, envoyez-moi :
1. Les messages de la console (F12)
2. Le résultat de la requête SQL de l'étape 2
3. Les noms exacts des colonnes dans votre fichier Excel
