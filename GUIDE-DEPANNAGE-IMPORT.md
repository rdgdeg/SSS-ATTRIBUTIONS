# Guide de dépannage - Import des cours vacants

## 🔍 Diagnostic des problèmes d'import

### 1. Vérifier les colonnes Excel

Lors de l'import, le système affiche :
- **Les colonnes détectées** dans votre fichier Excel
- **Le mapping** des colonnes importantes
- **Les avertissements** si des colonnes critiques sont manquantes

### 2. Colonnes critiques pour les attributions

Les colonnes suivantes sont **essentielles** pour importer les attributions :

- ✅ **Vol1. Attribution** - Volume 1 attribué à la personne
- ✅ **Vol2. Attribution** - Volume 2 attribué à la personne
- ✅ **Nom** - Nom de la personne
- ✅ **Prénom** - Prénom de la personne
- ✅ **Fonction** - Fonction (Coordinateur, Cotitulaire, etc.)
- ✅ **Début** - Année de début d'attribution
- ✅ **Durée** - Durée en années

### 3. Comment vérifier que l'import fonctionne

#### Étape 1 : Ouvrir la console du navigateur
- Appuyez sur **F12** dans votre navigateur
- Allez dans l'onglet **Console**
- Vous verrez les logs détaillés de l'import

#### Étape 2 : Vérifier les logs
Recherchez dans la console :
- `📊 Import Excel - Informations:` - Affiche les colonnes détectées
- `📊 Cours XXX: Vol1=X, Vol2=Y` - Affiche les volumes trouvés pour chaque cours
- `✅ X attribution(s) insérée(s)` - Confirme que les attributions sont sauvegardées

#### Étape 3 : Vérifier les résultats
Après l'import, vérifiez :
- Le nombre d'attributions importées
- Les totaux Vol1. Attribution et Vol2. Attribution
- Ouvrez une fiche de cours et vérifiez le tableau "Membres du cours"

### 4. Problèmes courants et solutions

#### ❌ Problème : Les volumes d'attribution sont à 0

**Causes possibles :**
1. Les colonnes Excel ne s'appellent pas exactement "Vol1. Attribution" et "Vol2. Attribution"
2. Les valeurs dans Excel sont vides ou contiennent du texte
3. Les colonnes sont dans un format différent

**Solutions :**
1. Vérifiez le nom exact des colonnes dans votre Excel
2. Utilisez la fonction "Voir toutes les colonnes détectées" dans l'aperçu du fichier
3. Vérifiez la console pour voir quelles colonnes sont détectées
4. Assurez-vous que les valeurs sont des nombres (ex: 15, 20.5, pas "15h" ou "15 heures")

#### ❌ Problème : Aucune attribution n'est créée

**Causes possibles :**
1. Les colonnes "Nom", "Prénom" et "Fonction" sont vides
2. Les volumes "Vol1. Attribution" et "Vol2. Attribution" sont à 0
3. Le code du cours n'est pas détecté

**Solutions :**
1. Vérifiez qu'au moins une de ces conditions est remplie :
   - Nom OU Prénom OU Fonction est rempli
   - Vol1. Attribution > 0 OU Vol2. Attribution > 0
2. Vérifiez que la colonne "Cours" existe et contient des codes de cours

#### ❌ Problème : Les attributions ne s'affichent pas dans le tableau

**Causes possibles :**
1. La table `cours_vacants_attributions` n'existe pas dans Supabase
2. Les attributions n'ont pas été sauvegardées correctement

**Solutions :**
1. Exécutez le script SQL `supabase-create-attributions-table.sql` dans Supabase
2. Vérifiez la console pour voir les erreurs d'insertion
3. Réimportez le fichier Excel

### 5. Format attendu du fichier Excel

#### Structure recommandée :
- **Une ligne par attribution** (une personne peut avoir plusieurs lignes si elle a plusieurs attributions)
- **Le code du cours** doit être dans la colonne "Cours"
- **Les volumes d'attribution** doivent être dans "Vol1. Attribution" et "Vol2. Attribution"
- **Les valeurs numériques** doivent être des nombres (pas de texte)

#### Exemple de ligne Excel :
```
Cours | Nom | Prénom | Fonction | Vol1. Attribution | Vol2. Attribution | Début | Durée
ABC123 | Dupont | Jean | Coordinateur | 15 | 10 | 2025 | 3
```

### 6. Vérification après import

1. **Vérifiez le résumé** affiché après l'import :
   - Nombre d'attributions importées
   - Totaux Vol1. Attribution et Vol2. Attribution

2. **Ouvrez une fiche de cours** et vérifiez :
   - Le tableau "Membres du cours" s'affiche
   - Les volumes d'attribution sont corrects
   - Les informations (Nom, Prénom, Fonction, Début, Durée) sont présentes

3. **Vérifiez la console** pour les erreurs ou avertissements

### 7. Logs de debug

Le système enregistre automatiquement dans la console :
- Les colonnes détectées dans Excel
- Les attributions trouvées pour chaque cours
- Les erreurs d'insertion dans la base de données
- Le résumé final de l'import

**Pour voir les logs :**
1. Ouvrez la console (F12)
2. Filtrez par "📊" ou "✅" ou "❌" pour voir les messages importants
3. Vérifiez les messages d'erreur en rouge

### 8. Contact et support

Si le problème persiste :
1. Vérifiez que tous les scripts SQL ont été exécutés dans Supabase
2. Vérifiez les logs de la console
3. Vérifiez que les noms de colonnes Excel correspondent exactement à ceux attendus
