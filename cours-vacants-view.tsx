import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, RefreshCw, AlertTriangle, Download, Upload, ChevronDown, ChevronUp, Calendar, User, Mail, Briefcase, Clock, Edit, Save, X, History, FileText, Users } from 'lucide-react';

const SUPABASE_URL = 'https://dhuuduphwvxrecfqvbbw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRodXVkdXBod3Z4cmVjZnF2YmJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMTEyODksImV4cCI6MjA4Mzc4NzI4OX0.RyURwma808AT0PqFIWXpe6NIdIdoscYN5GiC8Dh7Ktk';

const CoursVacantsView = () => {
  const [coursVacants, setCoursVacants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDpt, setFilterDpt] = useState('');
  const [filterEtat, setFilterEtat] = useState('');
  const [selectedCours, setSelectedCours] = useState(null);
  const [sortBy, setSortBy] = useState('code_cours');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    loadCoursVacants();
  }, []);

  const loadCoursVacants = async () => {
    try {
      setLoading(true);
      setError(null);

      const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

      const { data, error: fetchError } = await supabase
        .from('cours_vacants')
        .select('*')
        .order('code_cours', { ascending: true });

      if (fetchError) throw fetchError;
      setCoursVacants(data || []);
    } catch (err) {
      console.error('Erreur chargement:', err);
      setError('Erreur lors du chargement des cours vacants');
    } finally {
      setLoading(false);
    }
  };

  const departements = useMemo(() => {
    return [...new Set(coursVacants.map(c => c.dpt_attribution).filter(d => d))].sort();
  }, [coursVacants]);

  const etats = useMemo(() => {
    return [...new Set(coursVacants.map(c => c.etat_validation).filter(e => e))].sort();
  }, [coursVacants]);

  const filteredCours = useMemo(() => {
    let filtered = [...coursVacants];

    // Recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        (c.code_cours && c.code_cours.toLowerCase().includes(term)) ||
        (c.intitule && c.intitule.toLowerCase().includes(term)) ||
        (c.nom && c.nom.toLowerCase().includes(term)) ||
        (c.prenom && c.prenom.toLowerCase().includes(term)) ||
        (c.matricule && c.matricule.toLowerCase().includes(term))
      );
    }

    // Filtre département
    if (filterDpt) {
      filtered = filtered.filter(c => c.dpt_attribution === filterDpt);
    }

    // Filtre état
    if (filterEtat) {
      filtered = filtered.filter(c => c.etat_validation === filterEtat);
    }

    // Tri
    filtered.sort((a, b) => {
      const aVal = a[sortBy] || '';
      const bVal = b[sortBy] || '';
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });

    return filtered;
  }, [coursVacants, searchTerm, filterDpt, filterEtat, sortBy, sortOrder]);

  const stats = useMemo(() => {
    return {
      total: coursVacants.length,
      avecCandidat: coursVacants.filter(c => c.candidat && c.candidat.trim() !== '').length,
      sansCandidat: coursVacants.filter(c => !c.candidat || c.candidat.trim() === '').length,
      inactifs: coursVacants.filter(c => c.inactif).length
    };
  }, [coursVacants]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-orange-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement des cours vacants...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">Erreur</h2>
          <p className="text-gray-600 text-center mb-4">{error}</p>
          <button
            onClick={loadCoursVacants}
            className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-8 h-8 text-orange-600" />
                Cours Vacants
              </h1>
              <p className="text-gray-600 text-sm md:text-base">
                Gestion et suivi des cours vacants
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => window.location.href = '/import-cours-vacants'}
                className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Importer
              </button>
              <button
                onClick={loadCoursVacants}
                className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
                title="Actualiser"
              >
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xl md:text-2xl font-bold text-orange-600">{stats.total}</div>
            <div className="text-xs md:text-sm text-gray-600">Total cours vacants</div>
          </div>
          <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xl md:text-2xl font-bold text-green-600">{stats.avecCandidat}</div>
            <div className="text-xs md:text-sm text-gray-600">Avec candidat</div>
          </div>
          <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xl md:text-2xl font-bold text-red-600">{stats.sansCandidat}</div>
            <div className="text-xs md:text-sm text-gray-600">Sans candidat</div>
          </div>
          <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xl md:text-2xl font-bold text-gray-600">{stats.inactifs}</div>
            <div className="text-xs md:text-sm text-gray-600">Inactifs</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par code, intitulé, nom, prénom, matricule..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="relative md:w-64">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              <select
                value={filterDpt}
                onChange={(e) => setFilterDpt(e.target.value)}
                className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white outline-none cursor-pointer"
              >
                <option value="">Tous les départements</option>
                {departements.map(dpt => (
                  <option key={dpt} value={dpt}>{dpt}</option>
                ))}
              </select>
            </div>
            <div className="relative md:w-64">
              <select
                value={filterEtat}
                onChange={(e) => setFilterEtat(e.target.value)}
                className="w-full pl-4 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white outline-none cursor-pointer"
              >
                <option value="">Tous les états</option>
                {etats.map(etat => (
                  <option key={etat} value={etat}>{etat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Cours List */}
        <div className="space-y-4">
          {filteredCours.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Aucun cours vacant trouvé avec ces critères</p>
              {(searchTerm || filterDpt || filterEtat) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterDpt('');
                    setFilterEtat('');
                  }}
                  className="mt-4 text-orange-600 hover:text-orange-700 text-sm font-medium"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          ) : (
            filteredCours.map((cours, index) => (
              <CoursVacantCard 
                key={cours.id || index} 
                cours={cours} 
                isSelected={selectedCours?.id === cours.id}
                onToggle={() => setSelectedCours(selectedCours?.id === cours.id ? null : cours)}
                onUpdate={loadCoursVacants}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            {filteredCours.length === coursVacants.length 
              ? `${coursVacants.length} cours vacants au total`
              : `${filteredCours.length} cours vacants affichés sur ${coursVacants.length}`
            }
          </p>
        </div>
      </div>
    </div>
  );
};

// Composant helper pour afficher un champ d'information
const InfoField = ({ label, value }) => (
  <div>
    <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
    <div className="text-sm text-gray-900 font-medium">{value}</div>
  </div>
);

const CoursVacantCard = ({ cours, isSelected, onToggle, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({ ...cours });
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [attributions, setAttributions] = useState([]);
  const [loadingAttributions, setLoadingAttributions] = useState(false);

  useEffect(() => {
    if (isSelected && cours.id) {
      loadHistory();
      loadAttributions();
    }
  }, [isSelected, cours.id]);

  const loadHistory = async () => {
    try {
      setLoadingHistory(true);
      const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

      const { data, error } = await supabase
        .from('cours_vacants_history')
        .select('*')
        .eq('cours_vacant_id', cours.id)
        .order('modified_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setHistory(data || []);
    } catch (err) {
      console.error('Erreur chargement historique:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadAttributions = async () => {
    try {
      setLoadingAttributions(true);
      const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

      const { data, error } = await supabase
        .from('cours_vacants_attributions')
        .select('*')
        .eq('cours_vacant_id', cours.id)
        .order('fonction', { ascending: true })
        .order('nom', { ascending: true });

      if (error) throw error;
      setAttributions(data || []);
    } catch (err) {
      console.error('Erreur chargement attributions:', err);
      setAttributions([]);
    } finally {
      setLoadingAttributions(false);
    }
  };

  const handleSave = async () => {
    try {
      const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

      // Détecter les changements et créer l'historique
      const changes = [];
      const historyEntries = [];

      Object.keys(editedData).forEach(key => {
        const oldValue = cours[key];
        const newValue = editedData[key];
        
        // Comparer les valeurs (en tenant compte des types)
        if (oldValue !== newValue && 
            (oldValue != null || newValue != null) &&
            String(oldValue || '') !== String(newValue || '')) {
          changes.push(key);
          historyEntries.push({
            cours_vacant_id: cours.id,
            field_name: key,
            old_value: oldValue != null ? String(oldValue) : null,
            new_value: newValue != null ? String(newValue) : null,
            modified_by: 'Utilisateur' // Vous pouvez récupérer l'utilisateur connecté ici
          });
        }
      });

      if (changes.length === 0) {
        setIsEditing(false);
        return;
      }

      // Mettre à jour le cours
      const { error: updateError } = await supabase
        .from('cours_vacants')
        .update(editedData)
        .eq('id', cours.id);

      if (updateError) throw updateError;

      // Enregistrer l'historique
      if (historyEntries.length > 0) {
        const { error: historyError } = await supabase
          .from('cours_vacants_history')
          .insert(historyEntries);

        if (historyError) {
          console.error('Erreur enregistrement historique:', historyError);
        }
      }
      
      setIsEditing(false);
      if (onUpdate) onUpdate();
      loadHistory(); // Recharger l'historique
    } catch (err) {
      console.error('Erreur mise à jour:', err);
      alert('Erreur lors de la mise à jour');
    }
  };

  const handleCancel = () => {
    setEditedData({ ...cours });
    setIsEditing(false);
  };

  const handleFieldChange = (field, value) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4 cursor-pointer" onClick={() => !isEditing && onToggle()}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-semibold text-orange-600">{cours.code_cours || cours.sigle}</span>
              {cours.cnum && (
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">#{cours.cnum}</span>
              )}
              {cours.dpt_attribution && (
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">{cours.dpt_attribution}</span>
              )}
              {cours.inactif && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-medium">Inactif</span>
              )}
              {cours.candidat && cours.candidat.trim() !== '' && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">Candidat</span>
              )}
              {cours.etat_validation && (
                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">{cours.etat_validation}</span>
              )}
            </div>
            
            <h3 className="text-sm text-gray-700 mb-2 font-medium">
              {cours.intitule_court || cours.intitule || 'Sans intitulé'}
            </h3>
            
            <div className="flex flex-wrap gap-4 text-xs text-gray-600">
              {(cours.vol1 || cours.vol1 > 0) && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Vol1: <span className="font-medium">{cours.vol1}h</span></span>
                </div>
              )}
              {(cours.vol2 || cours.vol2 > 0) && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Vol2: <span className="font-medium">{cours.vol2}h</span></span>
                </div>
              )}
              {cours.type_cours && (
                <div className="flex items-center gap-1">
                  <Briefcase className="w-3 h-3" />
                  <span>{cours.type_cours}</span>
                </div>
              )}
              {cours.periodicite && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{cours.periodicite}</span>
                </div>
              )}
            </div>

            {(cours.nom || cours.prenom) && (
              <div className="mt-2 flex items-center gap-2 text-xs">
                <User className="w-3 h-3 text-gray-400" />
                <span className="text-gray-600">
                  {cours.prenom} {cours.nom}
                  {cours.fonction && ` - ${cours.fonction}`}
                </span>
              </div>
            )}
          </div>
          
          <button 
            className="ml-4 text-gray-400 hover:text-gray-600 flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              if (!isEditing) onToggle();
            }}
          >
            {isSelected ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>
      
      {isSelected && (
        <div className="border-t border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-6">
          {/* Header avec bouton d'édition */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="text-2xl font-bold text-gray-900 mb-1">Détails du cours</h4>
              <p className="text-sm text-gray-600">{cours.code_cours || cours.sigle}</p>
            </div>
            {!isEditing ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all shadow-md hover:shadow-lg text-sm font-semibold"
              >
                <Edit className="w-4 h-4" />
                Modifier
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSave();
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-md hover:shadow-lg text-sm font-semibold"
                >
                  <Save className="w-4 h-4" />
                  Enregistrer
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCancel();
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all shadow-md hover:shadow-lg text-sm font-semibold"
                >
                  <X className="w-4 h-4" />
                  Annuler
                </button>
              </div>
            )}
          </div>

          {/* Grille principale avec cartes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Carte Informations générales */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-200">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                </div>
                <h5 className="text-lg font-bold text-gray-900">Informations générales</h5>
              </div>
              <div className="space-y-4">
                <InfoField label="Intitulé" value={isEditing ? (
                  <input type="text" value={editedData.intitule_court || ''} onChange={(e) => handleFieldChange('intitule_court', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500" onClick={(e) => e.stopPropagation()} />
                ) : (cours.intitule_court || cours.intitule || '-')} />
                {cours.intitule_complet && (
                  <InfoField label="Intitulé complet" value={isEditing ? (
                    <input type="text" value={editedData.intitule_complet || ''} onChange={(e) => handleFieldChange('intitule_complet', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500" onClick={(e) => e.stopPropagation()} />
                  ) : cours.intitule_complet} />
                )}
                <div className="grid grid-cols-2 gap-4">
                  <InfoField label="Département attribution" value={cours.dpt_attribution || '-'} />
                  <InfoField label="Département client" value={cours.dpt_client || '-'} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InfoField label="Type cours" value={cours.type_cours || '-'} />
                  <InfoField label="Périodicité" value={cours.periodicite || '-'} />
                </div>
              </div>
            </div>

            {/* Carte Volumes */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-200">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <h5 className="text-lg font-bold text-gray-900">Volumes</h5>
              </div>
              
              {/* Validation des volumes */}
              {(() => {
                const vol1_total = cours.vol1_total || 0;
                const vol2_total = cours.vol2_total || 0;
                const vol1_attribue = attributions.reduce((sum, a) => sum + (a.vol1_attrib || 0), 0);
                const vol2_attribue = attributions.reduce((sum, a) => sum + (a.vol2_attrib || 0), 0);
                const vol1_ecart = Math.abs(vol1_total - vol1_attribue);
                const vol2_ecart = Math.abs(vol2_total - vol2_attribue);
                const volumesOk = vol1_ecart < 0.01 && vol2_ecart < 0.01 && (vol1_total > 0 || vol2_total > 0);
                
                if (!volumesOk && (vol1_total > 0 || vol2_total > 0)) {
                  return (
                    <div className="mb-4 p-3 bg-orange-50 border-2 border-orange-300 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                        <span className="font-semibold text-orange-900 text-sm">Écart détecté dans les volumes</span>
                      </div>
                      <div className="text-xs text-orange-800 space-y-1">
                        {vol1_total > 0 && (
                          <div>
                            <strong>Vol1:</strong> Total={vol1_total}h, Attribué={vol1_attribue.toFixed(2)}h, 
                            Écart={vol1_ecart.toFixed(2)}h
                          </div>
                        )}
                        {vol2_total > 0 && (
                          <div>
                            <strong>Vol2:</strong> Total={vol2_total}h, Attribué={vol2_attribue.toFixed(2)}h, 
                            Écart={vol2_ecart.toFixed(2)}h
                          </div>
                        )}
                        <div className="mt-2 text-orange-700">
                          La somme des attributions doit correspondre aux volumes totaux du cours.
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="text-xs text-blue-600 font-medium mb-1">Volume 1 Total</div>
                    <div className="text-2xl font-bold text-blue-900">{cours.vol1_total || cours.vol1 || 0}h</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <div className="text-xs text-orange-600 font-medium mb-1">Volume 2 Total</div>
                    <div className="text-2xl font-bold text-orange-900">{cours.vol2_total || cours.vol2 || 0}h</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">Vol1. Attribution</label>
                    {isEditing ? (
                      <input type="number" step="0.01" value={editedData.vol1_enseignant || ''} onChange={(e) => handleFieldChange('vol1_enseignant', parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg text-sm font-semibold text-purple-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500" onClick={(e) => e.stopPropagation()} />
                    ) : (
                      <div className="px-3 py-2 bg-purple-50 border-2 border-purple-200 rounded-lg text-sm font-semibold text-purple-700">{cours.vol1_enseignant || 0}h</div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">Vol2. Attribution</label>
                    {isEditing ? (
                      <input type="number" step="0.01" value={editedData.vol2_enseignant || ''} onChange={(e) => handleFieldChange('vol2_enseignant', parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg text-sm font-semibold text-purple-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500" onClick={(e) => e.stopPropagation()} />
                    ) : (
                      <div className="px-3 py-2 bg-purple-50 border-2 border-purple-200 rounded-lg text-sm font-semibold text-purple-700">{cours.vol2_enseignant || 0}h</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Carte Informations personne */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-200">
                <div className="p-2 bg-green-100 rounded-lg">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <h5 className="text-lg font-bold text-gray-900">Informations personne</h5>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <InfoField label="Nom" value={isEditing ? (
                    <input type="text" value={editedData.nom || ''} onChange={(e) => handleFieldChange('nom', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500" onClick={(e) => e.stopPropagation()} />
                  ) : (cours.nom || '-')} />
                  <InfoField label="Prénom" value={isEditing ? (
                    <input type="text" value={editedData.prenom || ''} onChange={(e) => handleFieldChange('prenom', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500" onClick={(e) => e.stopPropagation()} />
                  ) : (cours.prenom || '-')} />
                </div>
                <InfoField label="Email UCL" value={isEditing ? (
                  <input type="email" value={editedData.email_ucl || ''} onChange={(e) => handleFieldChange('email_ucl', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500" onClick={(e) => e.stopPropagation()} />
                ) : (cours.email_ucl ? (
                  <a href={`mailto:${cours.email_ucl}`} className="text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-2 font-medium">
                    <Mail className="w-4 h-4" />
                    {cours.email_ucl}
                  </a>
                ) : '-'))} />
                <div className="grid grid-cols-2 gap-4">
                  <InfoField label="Matricule" value={cours.matricule || '-'} />
                  <InfoField label="Fonction" value={isEditing ? (
                    <input type="text" value={editedData.fonction || ''} onChange={(e) => handleFieldChange('fonction', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500" onClick={(e) => e.stopPropagation()} />
                  ) : (cours.fonction || '-')} />
                </div>
              </div>
            </div>

            {/* Carte Attribution */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-200">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-orange-600" />
                </div>
                <h5 className="text-lg font-bold text-gray-900">Attribution</h5>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <InfoField label="Début" value={isEditing ? (
                    <input type="number" value={editedData.debut || ''} onChange={(e) => handleFieldChange('debut', parseInt(e.target.value) || null)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500" onClick={(e) => e.stopPropagation()} />
                  ) : (cours.debut || '-')} />
                  <InfoField label="Durée" value={isEditing ? (
                    <input type="number" value={editedData.duree || ''} onChange={(e) => handleFieldChange('duree', parseInt(e.target.value) || null)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500" onClick={(e) => e.stopPropagation()} />
                  ) : (cours.duree ? `${cours.duree} ans` : '-')} />
                </div>
                {cours.debut && cours.duree && (
                  <div className="bg-orange-50 rounded-lg p-4 border-2 border-orange-200">
                    <div className="text-xs text-orange-600 font-medium mb-1">À attribuer</div>
                    <div className="text-2xl font-bold text-orange-900">{parseInt(cours.debut) + parseInt(cours.duree)}</div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <InfoField label="Mode paiement" value={isEditing ? (
                    <input type="text" value={editedData.mode_paiement || ''} onChange={(e) => handleFieldChange('mode_paiement', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500" onClick={(e) => e.stopPropagation()} />
                  ) : (cours.mode_paiement || '-')} />
                  <InfoField label="Poste" value={isEditing ? (
                    <input type="text" value={editedData.poste || ''} onChange={(e) => handleFieldChange('poste', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500" onClick={(e) => e.stopPropagation()} />
                  ) : (cours.poste || '-')} />
                </div>
              </div>
            </div>
          </div>

          {/* Tableau des membres du cours */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-200">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
              <h5 className="text-lg font-bold text-gray-900">Membres du cours</h5>
              <span className="ml-auto text-sm text-gray-500">
                {loadingAttributions ? 'Chargement...' : `${attributions.length} membre(s)`}
              </span>
            </div>
            
            {loadingAttributions ? (
              <div className="text-center py-8">
                <RefreshCw className="w-6 h-6 text-gray-400 animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-500">Chargement des membres...</p>
              </div>
            ) : attributions.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-2">Aucun membre attribué à ce cours</p>
                <p className="text-xs text-gray-400">
                  Les membres apparaîtront ici après l'import du fichier Excel avec les colonnes "Vol1. Attribution" et "Vol2. Attribution"
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Nom</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Prénom</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Fonction</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Vol1. Attribution</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Vol2. Attribution</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Début</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Durée</th>
                      {attributions.some(a => a.email_ucl) && (
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email UCL</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {attributions.map((attr, index) => (
                      <tr key={attr.id || index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {attr.nom || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {attr.prenom || '-'}
                        </td>
                        <td className="px-4 py-3">
                          {attr.fonction ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {attr.fonction}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {attr.vol1_attrib > 0 ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                              {attr.vol1_attrib}h
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {attr.vol2_attrib > 0 ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold bg-orange-50 text-orange-700 border border-orange-200">
                              {attr.vol2_attrib}h
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-700">
                          {attr.debut || '-'}
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-700">
                          {attr.duree ? `${attr.duree} ans` : '-'}
                        </td>
                        {attributions.some(a => a.email_ucl) && (
                          <td className="px-4 py-3">
                            {attr.email_ucl ? (
                              <a href={`mailto:${attr.email_ucl}`} className="text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 text-sm">
                                <Mail className="w-3 h-3" />
                                {attr.email_ucl}
                              </a>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                  {attributions.length > 0 && (
                    <tfoot className="bg-gray-50">
                      <tr className="font-semibold">
                        <td colSpan="3" className="px-4 py-3 text-sm text-gray-700 text-right">
                          Total:
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold bg-purple-100 text-purple-800 border-2 border-purple-300">
                            {attributions.reduce((sum, a) => sum + (a.vol1_attrib || 0), 0).toFixed(2)}h
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold bg-orange-100 text-orange-800 border-2 border-orange-300">
                            {attributions.reduce((sum, a) => sum + (a.vol2_attrib || 0), 0).toFixed(2)}h
                          </span>
                        </td>
                        <td colSpan={attributions.some(a => a.email_ucl) ? 3 : 2}></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            )}
          </div>

          {/* Remarques */}
          {(cours.remarque || cours.remarque_speciale || cours.candidat) && (
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-200">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <FileText className="w-5 h-5 text-yellow-600" />
                </div>
                <h5 className="text-lg font-bold text-gray-900">Remarques</h5>
              </div>
              <div className="space-y-4">
                {cours.remarque && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">Remarque</label>
                    {isEditing ? (
                      <textarea value={editedData.remarque || ''} onChange={(e) => handleFieldChange('remarque', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500" rows="3" onClick={(e) => e.stopPropagation()} />
                    ) : (
                      <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">{cours.remarque}</div>
                    )}
                  </div>
                )}
                {cours.remarque_speciale && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">Remarque spéciale</label>
                    {isEditing ? (
                      <textarea value={editedData.remarque_speciale || ''} onChange={(e) => handleFieldChange('remarque_speciale', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500" rows="3" onClick={(e) => e.stopPropagation()} />
                    ) : (
                      <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">{cours.remarque_speciale}</div>
                    )}
                  </div>
                )}
                {cours.candidat && (
                  <InfoField label="Candidat" value={isEditing ? (
                    <input type="text" value={editedData.candidat || ''} onChange={(e) => handleFieldChange('candidat', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500" onClick={(e) => e.stopPropagation()} />
                  ) : cours.candidat} />
                )}
              </div>
            </div>
          )}

          {/* Historique des modifications */}
          <div className="mt-8 border-t-2 border-gray-300 pt-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <History className="w-5 h-5 text-indigo-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900">Historique des modifications</h4>
            </div>
            
            {loadingHistory ? (
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 text-center">
                <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Chargement de l'historique...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 text-center">
                <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Aucune modification enregistrée</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                      <tr>
                        <th className="px-5 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                        <th className="px-5 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Champ</th>
                        <th className="px-5 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Ancienne valeur</th>
                        <th className="px-5 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Nouvelle valeur</th>
                        <th className="px-5 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Modifié par</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {history.map((entry, index) => (
                        <tr key={entry.id || index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-3 text-sm text-gray-600 font-medium">
                            {new Date(entry.modified_at).toLocaleString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="px-5 py-3">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                              {entry.field_name}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                              {entry.old_value || '(vide)'}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                              {entry.new_value || '(vide)'}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-sm text-gray-600">{entry.modified_by || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursVacantsView;
