import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Divider, 
  CircularProgress,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  styled
} from '@mui/material';
import { useYear } from '../contexts/YearContext';
import FilterSection from '../components/FilterSection';
import StatCard from '../components/StatCard';
import { apiEndpoints } from '../services/api';
import api from '../services/api';
import { School, LocationOn, People, Class } from '@mui/icons-material';

const PageContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

const AnalyseEtablissement = () => {
  const [communes, setCommunes] = useState([]);
  const [etablissements, setEtablissements] = useState([]);
  const [selectedCommune, setSelectedCommune] = useState('');
  const [selectedEtablissement, setSelectedEtablissement] = useState('');
  const [selectedEtablissementData, setSelectedEtablissementData] = useState(null);
  const [statsEtablissement, setStatsEtablissement] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState({
    communes: false,
    etablissements: false,
    stats: false
  });
  const { selectedYear } = useYear();
  
  // Fonction pour formater les nombres avec séparateur de milliers
  const formatNumber = (num) => {
    return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '0';
  };

  // Charger les communes
  useEffect(() => {
    const fetchCommunes = async () => {
      try {
        setLoading(prev => ({ ...prev, communes: true }));
        const response = await api.get(apiEndpoints.getCommunes);
        
        if (response.data && response.data.communes) {
          const formattedCommunes = response.data.communes.map(commune => ({
            value: commune.id_commune || commune.cd_com || '',
            label: commune.ll_com || commune.la_com || `Commune ${commune.id_commune || ''}`
          }));
          setCommunes(formattedCommunes);
        }
      } catch (err) {
        setError('Erreur lors du chargement des communes');
        console.error('Erreur:', err);
      } finally {
        setLoading(prev => ({ ...prev, communes: false }));
      }
    };

    fetchCommunes();
  }, []);

  // Charger les établissements quand une commune est sélectionnée
  useEffect(() => {
    const fetchEtablissements = async () => {
      if (!selectedCommune) {
        setEtablissements([]);
        setSelectedEtablissement('');
        return;
      }

      try {
        setLoading(prev => ({ ...prev, etablissements: true }));
        
        // Récupérer les établissements de la commune sélectionnée
        const response = await api.get(`/etablissement/commune/${selectedCommune}`);
        
        if (response.data && response.data.success) {
          const formattedEtablissements = response.data.data.map(etab => ({
            value: etab.code_etab || '',
            label: etab.nom_etab_fr || etab.nom_etab_ar || `Établissement ${etab.code_etab || ''}`
          }));
          setEtablissements(formattedEtablissements);
        }
      } catch (err) {
        setError('Erreur lors du chargement des établissements');
        console.error('Erreur:', err);
      } finally {
        setLoading(prev => ({ ...prev, etablissements: false }));
      }
    };

    fetchEtablissements();
  }, [selectedCommune]);

  // Charger les statistiques de l'établissement sélectionné
  useEffect(() => {
    const fetchStats = async () => {
      if (!selectedEtablissement || !selectedYear) return;

      try {
        setLoading(prev => ({ ...prev, stats: true }));
        
        // Récupérer les statistiques et les données de l'établissement
        const [statsResponse, etablissementResponse] = await Promise.all([
          api.get(apiEndpoints.statEtablissement(selectedEtablissement, selectedYear)),
          api.get(`/etablissement/${selectedEtablissement}`)
        ]);
        
        console.log('Réponse des statistiques:', statsResponse.data);
        console.log('Réponse des données de l\'établissement:', etablissementResponse.data);
        
        if (statsResponse.data) {
          // Si les statistiques sont dans une propriété 'data', on l'utilise, sinon on prend la réponse complète
          setStatsEtablissement(statsResponse.data.data || statsResponse.data);
        }
        
        if (etablissementResponse.data) {
          setSelectedEtablissementData(etablissementResponse.data.data || etablissementResponse.data);
        }
      } catch (err) {
        setError('Erreur lors du chargement des statistiques');
        console.error('Erreur:', err);
      } finally {
        setLoading(prev => ({ ...prev, stats: false }));
      }
    };

    fetchStats();
  }, [selectedEtablissement, selectedYear]);

  // Gérer le changement de filtre
  const handleFilterChange = (filterId, value) => {
    if (filterId === 'commune') {
      setSelectedCommune(value);
      setSelectedEtablissement('');
      setSelectedEtablissementData(null);
      setStatsEtablissement(null);
    } else if (filterId === 'etablissement') {
      setSelectedEtablissement(value);
    }
  };

  return (
    <PageContainer maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Analyse par Établissement
      </Typography>

      <FilterSection
        title="Filtrer les établissements"
        filters={[
          {
            id: 'commune',
            label: 'Sélectionner une commune',
            options: communes
          },
          {
            id: 'etablissement',
            label: 'Sélectionner un établissement',
            options: etablissements,
            disabled: !selectedCommune
          }
        ]}
        selectedValues={{
          commune: selectedCommune,
          etablissement: selectedEtablissement
        }}
        onFilterChange={handleFilterChange}
        loading={{
          commune: loading.communes,
          etablissement: loading.etablissements
        }}
      />

      {error && (
        <Box my={2} p={2} bgcolor="error.light" color="error.contrastText" borderRadius={1}>
          <Typography>{error}</Typography>
        </Box>
      )}

      {loading.stats && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}

      {selectedEtablissementData && (
        <Box mt={4}>
          <Card elevation={3}>
            <CardContent>
              <Grid container spacing={3} sx={{ '& > .MuiGrid-item': { display: 'flex' } }}>
                {/* Carte du nom de l'établissement */}
                <Grid xs={12} sm={6} md={3}>
                  <StatCard 
                    title="Établissement"
                    value={selectedEtablissementData.nom_etab_fr || selectedEtablissementData.nom_etab_ar || 'Non spécifié'}
                    icon={School}
                    type="etablissements"
                    fullHeight
                    sx={{ height: '100%' }}
                  />
                </Grid>

                {/* Carte de la commune */}
                <Grid xs={12} sm={6} md={3}>
                  <StatCard 
                    title="Commune"
                    value={selectedEtablissementData.commune?.nom || 
                           (selectedCommune ? communes.find(c => c.value === selectedCommune)?.label : 'Non spécifiée')}
                    icon={LocationOn}
                    type="communes"
                    fullHeight
                    sx={{ height: '100%' }}
                  />
                </Grid>

                {/* Carte du cycle éducatif */}
                <Grid xs={12} sm={6} md={3}>
                  <StatCard 
                    title="Cycle éducatif"
                    value={selectedEtablissementData.cycle || 'Non spécifié'}
                    icon={School}
                    type="etablissements"
                    fullHeight
                    sx={{ height: '100%' }}
                  />
                </Grid>

                {/* Carte du nombre d'élèves */}
                <Grid xs={12} sm={6} md={3}>
                  <StatCard 
                    title="Nombre d'élèves"
                    value={statsEtablissement?.statistiques?.nombre_eleves !== undefined ? 
                           formatNumber(statsEtablissement.statistiques.nombre_eleves) : 'N/A'}
                    icon={People}
                    type="eleves"
                    fullHeight
                    sx={{ height: '100%' }}
                  />
                </Grid>
                
                {/* Statistiques de l'établissement */}
                <Grid xs={12} mt={3}>
                  <Grid container spacing={2} sx={{ '& > .MuiGrid-item': { display: 'flex' } }}>
                    <Grid xs={12} md={6}>
                      <StatCard 
                        title="Moyenne Générale"
                        value={statsEtablissement?.moyenne_generale !== undefined ? 
                          statsEtablissement.moyenne_generale.toFixed(2) : 'N/A'}
                        type="moyenne"
                        trend={0}
                        sx={{ height: '100%' }}
                      />
                    </Grid>
                    
                    <Grid xs={12} md={6}>
                      <StatCard 
                        title="Taux de Réussite"
                        value={statsEtablissement?.taux_reussite !== undefined ? 
                          `${statsEtablissement.taux_reussite}%` : 'N/A'}
                        type="reussite"
                        trend={0}
                        sx={{ height: '100%' }}
                      />
                    </Grid>
                    
                    <Grid xs={12} md={6}>
                      <StatCard 
                        title="Classement Commune"
                        value={statsEtablissement?.rang_commune ? 
                          `#${statsEtablissement.rang_commune}` : 'N/A'}
                        type="communes"
                        icon={LocationOn}
                        sx={{ height: '100%' }}
                      />
                    </Grid>
                    
                    <Grid xs={12} md={6}>
                      <StatCard 
                        title="Classement Province"
                        value={statsEtablissement?.rang_province ? 
                          `#${statsEtablissement.rang_province}` : 'N/A'}
                        type="communes"
                        icon={LocationOn}
                        sx={{ height: '100%' }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      )}
    </PageContainer>
  );
};

export default AnalyseEtablissement;