import React, { useState, useMemo, useEffect } from 'react';
import { Search, Grid, ChevronLeft, ChevronRight, Users, BookOpen, AlertTriangle, CheckCircle, Database, Upload, Edit, Bell, X, FileText } from 'lucide-react';

const App = () => {
  const [coursData, setCoursData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [filterType, setFilterType] = useState('all');
  const [filterDpt, setFilterDpt] = useState('');
  const [demandes, setDemandes] = useState([]);
  const [currentView, setCurrentView] = useState('cours');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const itemsPerPage = 12;

  const parseVolume = (value) => {
    if (!value || value === '' || String(value).includes('#')) return 0;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  const loadFromExcel = async (file) => {
    try {
      setLoading(true);
      setShowUpload(false);

      if (!window.XLSX) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
        document.head.appendChild(script);
        await new Promise((resolve) => { script.onload = resolve; });
      }
      
      const fileData = await file.arrayBuffer();
      const workbook = window.XLSX.read(fileData, { raw: false });
      const worksheet = workbook.Sheets['2025 Attributions'];
      const data = window.XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: '' });

      const coursMap = {};
      
      data.forEach(row => {
        const code = row.Cours;
        if (!code) return;

        if (!coursMap[code]) {
          coursMap[code] = {
            code,
            intitule: row['Intitulé abrégé'] || 'Sans titre',
            dpt: row['Dpt Attribution'] || 'N/A',
            vol1Total: parseVolume(row['Vol.1 Total']),
            vol2Total: parseVolume(row['Vol.2 Total']),
            attributions: []
          };
        }

        if (row.Enseignant || row.Fonction) {
          coursMap[code].attributions.push({
            enseignant: row.Enseignant || '',
            email: row['Email UCL'] || '',
            fonction: row.Fonction || '',
            vol1Ens: parseVolume(row['Vol1. enseignant']),
            vol2Ens: parseVolume(row['Vol2. enseignant'])
          });
        }
      });

      const coursArray = Object.values(coursMap).map(c => {
        const coordinateur = c.attributions.find(a => a.fonction === 'Coordinateur');
        const enseignants = c.attributions.filter(a => 
          a.fonction !== 'Coordinateur' && a.enseignant && a.enseignant.trim() !== ''
        );
        
        const sommeVol1 = c.attributions.reduce((sum, a) => sum + (a.vol1Ens || 0), 0);
        const sommeVol2 = c.attributions.reduce((sum, a) => sum + (a.vol2Ens || 0), 0);
        
        return {
          ...c,
          coordinateur,
          enseignants,
          sommeVol1,
          sommeVol2,
          ecartVol1: Math.abs(sommeVol1 - c.vol1Total),
          ecartVol2: Math.abs(sommeVol2 - c.vol2Total),
          coherent: Math.abs(sommeVol1 - c.vol1Total) < 0.01 && Math.abs(sommeVol2 - c.vol2Total) < 0.01,
          estAttribue: c.attributions.some(a => a.enseignant && a.enseignant.trim() !== '')
        };
      });

      setCoursData(coursArray);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setShowUpload(true);
    }
  };

  const departementsUniques = useMemo(() => {
    const dpts = [...new Set(coursData.map(c => c.dpt).filter(d => d && d !== 'N/A'))];
    return dpts.sort();
  }, [coursData]);

  const filteredCours = useMemo(() => {
    return coursData.filter(c => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        if (!c.code.toLowerCase().includes(term) && 
            !c.intitule.toLowerCase().includes(term) &&
            !(c.coordinateur && c.coordinateur.enseignant.toLowerCase().includes(term)) &&
            !c.enseignants.some(e => e.enseignant.toLowerCase().includes(term))) {
          return false;
        }
      }

      if (filterDpt && c.dpt !== filterDpt) {
        return false;
      }

      if (filterType === 'problemes') return !c.estAttribue || !c.coherent;
      if (filterType === 'non-attribues') return !c.estAttribue;
      if (filterType === 'incoherents') return !c.coherent;
      if (filterType === 'coherents') return c.coherent && c.estAttribue;
      return true;
    });
  }, [coursData, searchTerm, filterType, filterDpt]);

  const paginatedCours = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredCours.slice(start, start + itemsPerPage);
  }, [filteredCours, page]);

  const stats = useMemo(() => ({
    total: coursData.length,
    coherents: coursData.filter(c => c.coherent).length,
    incoherents: coursData.filter(c => !c.coherent).length,
    nonAttribues: coursData.filter(c => !c.estAttribue).length
  }), [coursData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Chargement...</p>
        </div>
      </div>
    );
  }

  if (showUpload) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl w-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Attributions 2025</h1>
              <p className="text-gray-600">UCLouvain</p>
            </div>
          </div>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors cursor-pointer">
            <input
              type="file"
              accept=".xlsx"
              onChange={(e) => e.target.files[0] && loadFromExcel(e.target.files[0])}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Database className="w-20 h-20 text-gray-400 mx-auto mb-4" />
              <p className="text-xl font-semibold text-gray-700 mb-2">Importez votre fichier Excel</p>
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg">
                <Upload className="w-5 h-5" />
                Sélectionner
              </div>
            </label>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'admin' && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Accès admin</h2>
          <input
            type="password"
            placeholder="Mot de passe"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && e.target.value === 'UCLouvain') {
                setIsAuthenticated(true);
              }
            }}
            className="w-full p-3 border-2 border-gray-300 rounded-lg mb-4"
          />
          <button
            onClick={() => setCurrentView('cours')}
            className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  if (currentView === 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Panneau admin - {demandes.length} demande(s)</h2>
              <button
                onClick={() => { setCurrentView('cours'); setIsAuthenticated(false); }}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium"
              >
                Déconnexion
              </button>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            {demandes.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Aucune demande</p>
              </div>
            ) : (
              <div className="space-y-4">
                {demandes.map(d => (
                  <div key={d.id} className="border-2 rounded-lg p-5 bg-blue-50">
                    <h3 className="font-bold mb-2">{d.cours} - {d.intitule}</h3>
                    <p className="text-sm mb-2">Par: {d.nomDemandeur} - {d.date}</p>
                    <p className="text-sm bg-white p-3 rounded mb-3">{d.description}</p>
                    <button
                      onClick={() => setDemandes(demandes.filter(x => x.id !== d.id))}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm"
                    >
                      Supprimer
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Attributions 2025</h1>
              <p className="text-gray-600">{coursData.length} cours chargés</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowUpload(true)}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium"
              >
                <Upload className="w-4 h-4 inline mr-2" />
                Charger
              </button>
              <button
                onClick={() => window.location.href = '/cours-vacants'}
                className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg font-medium"
              >
                <AlertTriangle className="w-4 h-4 inline mr-2" />
                Cours Vacants
              </button>
              <button
                onClick={() => setCurrentView('admin')}
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium relative"
              >
                <Bell className="w-4 h-4 inline mr-2" />
                Admin
                {demandes.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {demandes.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-blue-500">
            <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-green-500">
            <div className="text-3xl font-bold text-green-600">{stats.coherents}</div>
            <div className="text-sm text-gray-600">Cohérents</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-red-500">
            <div className="text-3xl font-bold text-red-600">{stats.incoherents}</div>
            <div className="text-sm text-gray-600">Incohérents</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-orange-500">
            <div className="text-3xl font-bold text-orange-600">{stats.nonAttribues}</div>
            <div className="text-sm text-gray-600">Non attribués</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-5 mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {['all', 'problemes', 'non-attribues', 'incoherents', 'coherents'].map(type => (
              <button
                key={type}
                onClick={() => { setFilterType(type); setPage(1); }}
                className={'px-4 py-2 rounded-lg font-medium ' + (filterType === type ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700')}
              >
                {type === 'all' ? 'Tous' : 
                 type === 'problemes' ? 'Problèmes' :
                 type === 'non-attribues' ? 'Non attribués' :
                 type === 'incoherents' ? 'Incohérents' : 'Cohérents'}
              </button>
            ))}
          </div>

          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg"
              />
            </div>

            <div className="w-64">
              <select
                value={filterDpt}
                onChange={(e) => { setFilterDpt(e.target.value); setPage(1); }}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tous les départements</option>
                {departementsUniques.map(dpt => (
                  <option key={dpt} value={dpt}>{dpt}</option>
                ))}
              </select>
            </div>
          </div>

          {(filterType !== 'all' || filterDpt) && (
            <div className="mt-3 flex items-center gap-2 text-sm">
              <span className="text-gray-600">Filtres actifs:</span>
              {filterType !== 'all' && (
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                  {filterType === 'problemes' ? 'Problèmes' :
                   filterType === 'non-attribues' ? 'Non attribués' :
                   filterType === 'incoherents' ? 'Incohérents' : 'Cohérents'}
                </span>
              )}
              {filterDpt && (
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">
                  {filterDpt}
                </span>
              )}
              <button
                onClick={() => { setFilterType('all'); setFilterDpt(''); setPage(1); }}
                className="text-blue-600 hover:text-blue-700 font-medium ml-2"
              >
                Réinitialiser
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {paginatedCours.map(cours => (
            <div key={cours.code} className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
              <div className="flex justify-between mb-3">
                <div>
                  <h3 className="text-xl font-bold">{cours.code}</h3>
                  <p className="text-sm text-gray-600">{cours.intitule}</p>
                </div>
                {cours.coherent ? <CheckCircle className="w-6 h-6 text-green-500" /> : <AlertTriangle className="w-6 h-6 text-red-500" />}
              </div>

              {cours.coordinateur ? (
                <div className="mb-3 p-3 bg-purple-100 border-2 border-purple-300 rounded-lg">
                  <div className="flex justify-between">
                    <div>
                      <div className="text-xs font-bold text-purple-700 uppercase">Coordinateur</div>
                      <div className="font-bold text-purple-900">{cours.coordinateur.enseignant}</div>
                    </div>
                    <div className="text-right text-xs text-purple-700 font-semibold">
                      <div>V1: {cours.coordinateur.vol1Ens}h</div>
                      <div>V2: {cours.coordinateur.vol2Ens}h</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-center text-xs text-red-700">
                  Pas de coordinateur
                </div>
              )}

              <div className="mb-3">
                <div className="text-xs font-bold text-blue-700 uppercase mb-2">Enseignants ({cours.enseignants.length})</div>
                {cours.enseignants.length > 0 ? (
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {cours.enseignants.map((ens, i) => (
                      <div key={i} className="bg-blue-50 border border-blue-200 rounded p-2 text-xs flex justify-between">
                        <span className="font-semibold text-blue-900 truncate">{ens.enseignant}</span>
                        <div className="flex gap-1">
                          <span className="bg-blue-200 px-1.5 py-0.5 rounded">V1:{ens.vol1Ens}h</span>
                          <span className="bg-orange-200 px-1.5 py-0.5 rounded">V2:{ens.vol2Ens}h</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded p-2 text-center text-xs text-red-600">Aucun</div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-blue-50 p-2 rounded border border-blue-200">
                  <div className="text-xs text-blue-600">Vol 1 Total</div>
                  <div className="text-lg font-bold text-blue-900">{cours.sommeVol1}/{cours.vol1Total}h</div>
                </div>
                <div className="bg-orange-50 p-2 rounded border border-orange-200">
                  <div className="text-xs text-orange-600">Vol 2 Total</div>
                  <div className="text-lg font-bold text-orange-900">{cours.sommeVol2}/{cours.vol2Total}h</div>
                </div>
              </div>

              <button
                onClick={() => {
                  const nom = prompt('Votre nom:');
                  if (!nom) return;
                  const description = prompt('Description de la demande:');
                  if (!description) return;
                  setDemandes([...demandes, {
                    id: Date.now(),
                    cours: cours.code,
                    intitule: cours.intitule,
                    nomDemandeur: nom,
                    description,
                    date: new Date().toLocaleString('fr-FR'),
                    statut: 'En attente'
                  }]);
                  alert('Demande envoyée !');
                }}
                className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Demander une modification
              </button>
            </div>
          ))}
        </div>

        {Math.ceil(filteredCours.length / itemsPerPage) > 1 && (
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              className="p-2 rounded-lg bg-white border"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {[...Array(Math.min(10, Math.ceil(filteredCours.length / itemsPerPage)))].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={'w-10 h-10 rounded-lg font-semibold ' + (page === i + 1 ? 'bg-blue-600 text-white' : 'bg-white border')}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage(Math.min(Math.ceil(filteredCours.length / itemsPerPage), page + 1))}
              className="p-2 rounded-lg bg-white border"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;