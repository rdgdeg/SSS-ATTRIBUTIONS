import { useState, useMemo } from 'react'
import { Search, RefreshCw, AlertTriangle, Upload, ChevronDown, ChevronUp, Edit, Save, X, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCoursVacants, useUpdateCoursVacant, CoursVacant } from '@/hooks/useCoursVacants'
import { useNavigate } from 'react-router-dom'

export default function CoursVacantsView() {
  const { data: coursVacants = [], isLoading, error, refetch } = useCoursVacants()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDpt, setFilterDpt] = useState('')
  const [filterEtat, setFilterEtat] = useState('')
  const [selectedCours, setSelectedCours] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState('code_cours')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const departements = useMemo(() => {
    return [...new Set(coursVacants.map(c => c.dpt_attribution).filter(d => d))].sort()
  }, [coursVacants])

  const etats = useMemo(() => {
    return [...new Set(coursVacants.map(c => c.etat_validation).filter(e => e))].sort()
  }, [coursVacants])

  const filteredCours = useMemo(() => {
    let filtered = [...coursVacants]

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(c => 
        (c.code_cours && c.code_cours.toLowerCase().includes(term)) ||
        (c.intitule_court && c.intitule_court.toLowerCase().includes(term)) ||
        (c.intitule_complet && c.intitule_complet?.toLowerCase().includes(term))
      )
    }

    if (filterDpt) {
      filtered = filtered.filter(c => c.dpt_attribution === filterDpt)
    }

    if (filterEtat) {
      filtered = filtered.filter(c => c.etat_validation === filterEtat)
    }

    filtered.sort((a, b) => {
      const aVal = a[sortBy] || ''
      const bVal = b[sortBy] || ''
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0
      }
    })

    return filtered
  }, [coursVacants, searchTerm, filterDpt, filterEtat, sortBy, sortOrder])

  const stats = useMemo(() => {
    return {
      total: coursVacants.length,
      avecCandidat: coursVacants.filter(c => c.candidat && c.candidat.trim() !== '').length,
      sansCandidat: coursVacants.filter(c => !c.candidat || c.candidat.trim() === '').length,
    }
  }, [coursVacants])

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement des cours vacants...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Erreur</h2>
            <p className="text-muted-foreground mb-4">{error.message}</p>
            <Button onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Cours Vacants</h1>
          <p className="text-muted-foreground mt-2">
            Gérez et suivez les cours vacants
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/import')}>
            <Upload className="w-4 h-4 mr-2" />
            Importer
          </Button>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Cours vacants</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avec Candidat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.avecCandidat}</div>
            <p className="text-xs text-muted-foreground">Cours avec candidat</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sans Candidat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.sansCandidat}</div>
            <p className="text-xs text-muted-foreground">Cours sans candidat</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtres et recherche</CardTitle>
          <CardDescription>Recherchez et filtrez les cours vacants</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Rechercher par code, intitulé..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterDpt || 'all'} onValueChange={(value) => setFilterDpt(value === 'all' ? '' : value)}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Tous les départements" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les départements</SelectItem>
                {departements.map(dpt => (
                  <SelectItem key={dpt} value={dpt || 'unknown'}>{dpt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterEtat || 'all'} onValueChange={(value) => setFilterEtat(value === 'all' ? '' : value)}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Tous les états" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les états</SelectItem>
                {etats.map(etat => (
                  <SelectItem key={etat} value={etat || 'unknown'}>{etat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Liste des cours vacants</CardTitle>
          <CardDescription>
            {filteredCours.length} cours affiché{filteredCours.length > 1 ? 's' : ''} sur {coursVacants.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCours.length === 0 ? (
            <div className="text-center py-8">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Aucun cours vacant trouvé avec ces critères</p>
              {(searchTerm || filterDpt || filterEtat) && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchTerm('')
                    setFilterDpt('')
                    setFilterEtat('')
                  }}
                >
                  Réinitialiser les filtres
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8"
                      onClick={() => handleSort('code_cours')}
                    >
                      Code
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8"
                      onClick={() => handleSort('intitule_court')}
                    >
                      Intitulé
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Volumes</TableHead>
                  <TableHead>Département</TableHead>
                  <TableHead>État</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCours.map((cours) => (
                  <CoursVacantRow
                    key={cours.id}
                    cours={cours}
                    isSelected={selectedCours === cours.id}
                    onToggle={() => setSelectedCours(selectedCours === cours.id ? null : (cours.id || null))}
                    onUpdate={() => refetch()}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function CoursVacantRow({ 
  cours, 
  isSelected, 
  onToggle, 
  onUpdate 
}: { 
  cours: CoursVacant
  isSelected: boolean
  onToggle: () => void
  onUpdate: () => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedData, setEditedData] = useState({ ...cours })
  const updateMutation = useUpdateCoursVacant()

  const handleSave = async () => {
    if (!cours.id) return
    try {
      await updateMutation.mutateAsync({
        id: cours.id,
        updates: editedData
      })
      setIsEditing(false)
      onUpdate()
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
    }
  }

  return (
    <>
      <TableRow>
        <TableCell className="font-medium">{cours.code_cours}</TableCell>
        <TableCell>{cours.intitule_court || cours.intitule_complet || '-'}</TableCell>
        <TableCell>
          <div className="text-sm">
            <div>Vol1: {cours.vol1_total || 0}h</div>
            <div>Vol2: {cours.vol2_total || 0}h</div>
          </div>
        </TableCell>
        <TableCell>{cours.dpt_attribution || '-'}</TableCell>
        <TableCell>
          {cours.etat_validation ? (
            <Badge variant="outline">{cours.etat_validation}</Badge>
          ) : (
            '-'
          )}
        </TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            {isEditing ? (
              <>
                <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending}>
                  <Save className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => {
                  setIsEditing(false)
                  setEditedData({ ...cours })
                }}>
                  <X className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4" />
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={onToggle}>
              {isSelected ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </TableCell>
      </TableRow>
      {isSelected && (
        <TableRow>
          <TableCell colSpan={6}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Détails du cours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Volume 1 total</label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editedData.vol1_total || ''}
                        onChange={(e) => setEditedData({ ...editedData, vol1_total: parseFloat(e.target.value) || 0 })}
                        className="mt-1"
                      />
                    ) : (
                      <div className="text-sm font-medium mt-1">{cours.vol1_total || 0}h</div>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Volume 2 total</label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editedData.vol2_total || ''}
                        onChange={(e) => setEditedData({ ...editedData, vol2_total: parseFloat(e.target.value) || 0 })}
                        className="mt-1"
                      />
                    ) : (
                      <div className="text-sm font-medium mt-1">{cours.vol2_total || 0}h</div>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Département</label>
                    <div className="text-sm font-medium mt-1">{cours.dpt_attribution || '-'}</div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">État</label>
                    <div className="text-sm font-medium mt-1">{cours.etat_validation || '-'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}
