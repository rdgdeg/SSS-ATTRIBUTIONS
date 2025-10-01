// pages/index.jsx ou app/page.jsx (selon Next.js App Router ou Pages Router)
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Users, BookOpen, Clock, ChevronDown, ChevronUp, Filter, RefreshCw, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { fetchCoursWithAttributions, getStatistics, parseVolume } from '../lib/dataHelpers';

const App = () => {
  const [coursData, setCoursData] = useState([]);
  const [statistics, setStatistics] = useState({
    totalCours: 0,
    coursAttribues: 0,
    coursAvecCoordinateur: 0,
    coursNonAttribues: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCours, setSelectedCours] = useState(null);
  const [filterDpt, setFilterDpt] = useState('');

  // Charger les données au montage
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [cours, stats] = await Promise.all([
        fetchCoursWithAttributions(),
        getStatistics()
      ]);
      
      setCoursData(cours);
      setStatistics(stats);
    } catch (err) {
      console.error('Erreur chargement:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les cours
  const filteredCours = useMemo(() => {
    return coursData.filter(c => {
      const matchSearch = !searchTerm || 
        c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.intitule_abrege.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDpt = !filterDpt || c.dpt_attribution === filterDpt;
      return matchSearch && matchDpt;
    });
  }, [coursData, searchTerm, filterDpt]);

  // Départements uniques
  const departements = useMemo(() => {
    return [...new Set(coursData.map(c => c.dpt_attribution))].filter(d => d).sort();
  }, [coursData]);

  const CoursCard = ({ cours }) => {
    const isSelected = selectedCours?.code === cours.code;
    
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        <div 
          className="p-4 cursor-pointer"
          onClick={() => setSelectedCours(isSelected ? null : cours)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="font-semibold text-blue-600">{cours.code}</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">{cours.dpt_attribution}</span>
                {cours.type_cours && (
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">{cours.type_cours}</span>
                )}
                {!cours.estAttribue && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-medium">
                    ⚠️ Non attribué
                  </span>
                )}
                {cours.etat_vacance === 'Vacant' && (
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">Vacant</span>
                )}
              </div>
              
              <h3 className="text-sm text-gray-700 mb-3 font-medium">{cours.intitule_abrege}</h3>
              
              <div className="space-y-2">
                {cours.coordinateur && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-purple-500 flex-shrink-0" />
                    <span className="font-medium text-purple-700">Coordinateur:</span>
                    <span className="text-gray-700 truncate">{cours.coordinateur.enseignant}</span>
                  </div>
                )}
                
                {cours.enseignants.length > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <BookOpen className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="font-medium text-green-700">Enseignants:</span>
                    <span className="text-gray-700">
                      {cours.enseignants.length} personne{cours.enseignants.length > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span className="text-gray-600">Vol1: <span className="font-medium">{cours.totalVol1}h</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    <span className="text-gray-600">Vol2: <span className="font-medium">{cours.totalVol2}h</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Total: <span className="font-semibold text-gray-900">{cours.totalVol1 + cours.totalVol2}h</span></span>
                  </div>
                </div>
              </div>
            </div>
            
            <button className="ml-4 text-gray-400 hover:text-gray-600 flex-shrink-0">
              {isSelected ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>
        
        {isSelected && (
          <div className="border-t border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-700">Répartition détaillée</h4>
              {cours.periodicite && (
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">
                  {cours.periodicite}
                </span>
              )}
            </div>
            
            <div className="space-y-3">
              {cours.attributions.length === 0 ? (
                <div className="bg-red-50 border border-red-200 rounded p-3 text-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mx-auto mb-2" />
                  <p className="text-sm text-red-700">Aucune attribution pour ce cours</p>
                </div>
              ) : (
                cours.attributions.map((attr, idx) => (
                  <div key={idx} className="bg-white p-3 rounded border border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {attr.enseignant || <span className="text-red-500 italic">Non attribué</span>}
                        </div>
                        {attr.email_ucl && (
                          <div className="text-xs text-gray-500 mt-1">{attr.email_ucl}</div>
                        )}
                        {attr.debut && attr.duree && (
                          <div className="text-xs text-gray-500 mt-1">
                            Période: {attr.debut} - {attr.debut + attr.duree} ({attr.duree} ans)
                          </div>
                        )}
                      </div>
                      {attr.fonction && attr.fonction.trim() && (
                        <span className={`text-xs px-2 py-1 rounded font-medium flex-shrink-0 ml-2 ${
                          attr.fonction === 'Coordinateur' 
                            ? 'bg-purple-100 text-purple-700'
                            : attr.fonction === 'Titulaire'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {attr.fonction}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex gap-4 text-sm flex-wrap">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-600">Vol1:</span>
                        <span className="font-medium text-blue-600">{parseVolume(attr.vol1_enseignant)}h</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-600">Vol2:</span>
                        <span className="font-medium text-orange-600">{parseVolume(attr.vol2_enseignant)}h</span>
                      </div>
                      <div className="flex items-center gap-1 ml-auto">
                        <span className="text-gray-600">Total:</span>
                        <span className="font-semibold text-gray-900">
                          {parseVolume(attr.vol1_enseignant) + parseVolume(attr.vol2_enseignant)}h
                        </span>
                      </div>
                    </div>
                    
                    {(attr.mode_paiement_vol1 || attr.mode_paiement_vol2) && (
                      <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-600">
                        {attr.mode_paiement_vol1 && attr.mode_paiement_vol1 !== 'Non précisé' && (
                          <div>Paiement Vol1: {attr.mode_paiement_vol1}</div>
                        )}
                        {attr.mode_paiement_vol2 && attr.mode_paiement_vol2 !== 'Non précisé' && (
                          <div>Paiement Vol2: {attr.mode_paiement_vol2}</div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-700">Total du cours</span>
                <div className="flex gap-4 text-sm">
                  <span className="text-blue-600 font-semibold">Vol1: {cours.totalVol1}h</span>
                  <span className="text-orange-600 font-semibold">Vol2: {cours.totalVol2}h</span>
                  <span className="text-gray-900 font-bold">
                    Total: {cours.totalVol1 + cours.totalVol2}h
                  </span>
                </div>
              </div>
              
              {cours.vol1_cours > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  Volume théorique cours: Vol1: {cours.vol1_cours}h, Vol2: {cours.vol2_cours}h
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">Erreur</h2>
          <p className="text-gray-600 text-center mb-4">{error}</p>
          <button
            onClick={loadData}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Attributions de Cours 2025
              </h1>
              <p className="text-gray-600 text-sm md:text-base">
                Gestion des coordinateurs et enseignants
              </p>
            </div>
            <button
              onClick={loadData}
              className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
              title="Actualiser"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xl md:text-2xl font-bold text-green-600">{statistics.coursAttribues}</div>
            <div className="text-xs md:text-sm text-gray-600">Cours attribués</div>
          </div>
          <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xl md:text-2xl font-bold text-purple-600">{statistics.coursAvecCoordinateur}</div>
            <div className="text-xs md:text-sm text-gray-600">Avec coordinateur</div>
          </div>
          <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xl md:text-2xl font-bold text-red-600">{statistics.coursNonAttribues}</div>
            <div className="text-xs md:text-sm text-gray-600">Non attribués</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par code ou intitulé..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="relative md:w-64">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              <select
                value={filterDpt}
                onChange={(e) => setFilterDpt(e.target.value)}
                className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white outline-none cursor-pointer"
              >
                <option value="">Tous les départements</option>
                {departements.map(dpt => (
                  <option key={dpt} value={dpt}>{dpt}</option>
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
              <p className="text-gray-500">Aucun cours trouvé avec ces critères</p>
              {(searchTerm || filterDpt) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterDpt('');
                  }}
                  className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          ) : (
            filteredCours.map(cours => (
              <CoursCard key={cours.code} cours={cours} />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            {filteredCours.length === coursData.length 
              ? `${coursData.length} cours au total`
              : `${filteredCours.length} cours affichés sur ${coursData.length}`
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;sm border border-gray-200">
            <div className="text-xl md:text-2xl font-bold text-blue-600">{statistics.totalCours}</div>
            <div className="text-xs md:text-sm text-gray-600">Cours total</div>
          </div>
          <div className="bg-white p-3 md:p-4 rounded-lg shadow-