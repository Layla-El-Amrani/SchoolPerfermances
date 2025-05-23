import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Box, 
  Typography, 
  TextField, 
  Autocomplete, 
  Button, 
  Card, 
  CardContent, 
  Divider, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText, 
  Paper, 
  IconButton, 
  styled,
  TableHead,
  TableRow,
  TablePagination,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Tabs,
  Tab,
  useTheme,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import PageLoader from '../components/PageLoader';
import InitialPageLoadIndicator from '../components/InitialPageLoadIndicator';
import { useYear } from '../contexts/YearContext';
import StatCard from '../components/StatCard';
import { apiEndpoints } from '../services/api';
import api from '../services/api';
import { School, LocationOn, People, Timeline as TimelineIcon, CompareArrows } from '@mui/icons-material';
import SchoolIcon from '@mui/icons-material/School';
import NiveauxAnalysis from '../components/analyse-etablissement/niveaux/NiveauxAnalysis';
import MatieresAnalysis from '../components/analyse-etablissement/matieres/MatieresAnalysis';
import ComparaisonAnnuelle from '../components/analyse-etablissement/ComparaisonAnnuelle';
import DiagrammeMatiereParNiveau from '../components/AnalyseCommune/DiagrammeMatiereParNiveau';

const PageContainer = styled(Container)(({ theme }) => ({
  padding: '0 !important',
  width: '100%',
  maxWidth: '100% !important',
  margin: 0,
  '& > *': {
    width: '100%',
    maxWidth: '100%',
    margin: '0 !important',
    padding: `${theme.spacing(1)} !important`,
    [theme.breakpoints.up('sm')]: {
      padding: `${theme.spacing(2)} !important`,
    },
    '& .MuiGrid-root': {
      width: '100%',
      maxWidth: '100%',
      margin: 0,
    },
  },
}));

const AnalyseEtablissement = () => {
  const theme = useTheme();
  const [communes, setCommunes] = useState([]);
  const [etablissements, setEtablissements] = useState([]);
  const [selectedCommune, setSelectedCommune] = useState('');
  const [selectedEtablissement, setSelectedEtablissement] = useState('');
  const [selectedEtablissementData, setSelectedEtablissementData] = useState(null);
  const [statsEtablissement, setStatsEtablissement] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState({
    etablissement: false,
    stats: false,
    communes: false
  });
  const [loadingError, setLoadingError] = useState({
    etablissement: false,
    stats: false,
    communes: false
  });
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const { selectedYear } = useYear();
  
  // Fonction pour formater les nombres avec séparateur de milliers
  const formatNumber = (num) => {
    return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '0';
  };

  // Charger les communes
  useEffect(() => {
    const fetchCommunes = async () => {
      setLoading(prev => ({ ...prev, communes: true }));
      setLoadingError(prev => ({ ...prev, communes: false }));
      
      const timeoutId = setTimeout(() => {
        if (loading.communes) {
          setLoading(prev => ({ ...prev, communes: false }));
          setLoadingError(prev => ({ ...prev, communes: true }));
          setError('Le chargement des communes a pris trop de temps. Veuillez réessayer.');
        }
      }, 10000); // Timeout après 10 secondes

      try {
        const response = await api.get(apiEndpoints.getCommunes);
        clearTimeout(timeoutId);
        
        if (response.data && response.data.communes) {
          const formattedCommunes = response.data.communes.map(commune => ({
            value: commune.id_commune || commune.cd_com || '',
            label: commune.ll_com || commune.la_com || `Commune ${commune.id_commune || ''}`
          }));
          setCommunes(formattedCommunes);
        }
      } catch (err) {
        clearTimeout(timeoutId);
        setError('Erreur lors du chargement des communes');
        setLoadingError(prev => ({ ...prev, communes: true }));
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

      setLoading(prev => ({ ...prev, etablissements: true }));
      setLoadingError(prev => ({ ...prev, etablissements: false }));
      
      const timeoutId = setTimeout(() => {
        if (loading.etablissements) {
          setLoading(prev => ({ ...prev, etablissements: false }));
          setLoadingError(prev => ({ ...prev, etablissements: true }));
          setError('Le chargement des établissements a pris trop de temps. Veuillez réessayer.');
        }
      }, 10000); // Timeout après 10 secondes

      try {
        // Récupérer les établissements de la commune sélectionnée
        const response = await api.get(`/etablissement/commune/${selectedCommune}`);
        clearTimeout(timeoutId);
        
        if (response.data && response.data.success) {
          const formattedEtablissements = response.data.data.map(etab => ({
            value: etab.code_etab || '',
            label: etab.nom_etab_fr || etab.nom_etab_ar || `Établissement ${etab.code_etab || ''}`
          }));
          setEtablissements(formattedEtablissements);
        }
      } catch (err) {
        clearTimeout(timeoutId);
        setError('Erreur lors du chargement des établissements');
        setLoadingError(prev => ({ ...prev, etablissements: true }));
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

      setLoading(prev => ({ ...prev, stats: true }));
      setLoadingError(prev => ({ ...prev, stats: false }));
      
      const timeoutId = setTimeout(() => {
        if (loading.stats) {
          setLoading(prev => ({ ...prev, stats: false }));
          setLoadingError(prev => ({ ...prev, stats: true }));
          setError('Le chargement des statistiques a pris trop de temps. Veuillez réessayer.');
        }
      }, 15000); // Timeout après 15 secondes

      try {
        // Récupérer les statistiques et les données de l'établissement
        const [statsResponse, etablissementResponse] = await Promise.all([
          api.get(apiEndpoints.statEtablissement(selectedEtablissement, selectedYear)),
          api.get(`/etablissement/${selectedEtablissement}`)
        ]);
        
        clearTimeout(timeoutId);
        
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
        clearTimeout(timeoutId);
        setError('Erreur lors du chargement des statistiques');
        setLoadingError(prev => ({ ...prev, stats: true }));
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

  if (loading.communes && !loadingError.communes) {
    return (
      <Box 
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          minHeight: 'calc(100vh - 120px)',
        }}
      >
        <InitialPageLoadIndicator message="Chargement des données initiales..." />
      </Box>
    );
  }

  return (
    <PageContainer maxWidth={false} disableGutters sx={{ p: 0, pt: 0 }}>
      <Typography component="h1" sx={{ 
        fontWeight: 'normal', 
        mb: 1.5,
        fontSize: '1.1rem',
        color: 'text.secondary'
      }}>
        Analyse par Établissement
      </Typography>

      <Box sx={{ mb: 3, width: '100%' }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 200, flex: 1 }}>
            <InputLabel id="commune-select-label">Commune</InputLabel>
            <Select
              labelId="commune-select-label"
              value={selectedCommune || ''}
              onChange={(e) => handleFilterChange('commune', e.target.value)}
              label="Commune"
              disabled={loading.communes}
              size="small"
              sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'divider',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                },
              }}
            >
              <MenuItem value="">
                <em>Toutes</em>
              </MenuItem>
              {communes.map((commune) => (
                <MenuItem key={commune.value} value={commune.value}>
                  {commune.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl 
            size="small" 
            sx={{ minWidth: 200, flex: 1 }}
            disabled={!selectedCommune || loading.etablissements}
          >
            <InputLabel id="etablissement-select-label">Établissement</InputLabel>
            <Select
              labelId="etablissement-select-label"
              value={selectedEtablissement || ''}
              onChange={(e) => handleFilterChange('etablissement', e.target.value)}
              label="Établissement"
              disabled={!selectedCommune || loading.etablissements}
              size="small"
              sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'divider',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                },
              }}
            >
              <MenuItem value="">
                <em>Tous</em>
              </MenuItem>
              {etablissements.map((etablissement) => (
                <MenuItem key={etablissement.value} value={etablissement.value}>
                  {etablissement.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Button 
            variant="outlined" 
            color="primary" 
            size="small"
            onClick={() => {
              setSelectedCommune('');
              setSelectedEtablissement('');
            }}
            disabled={!selectedCommune && !selectedEtablissement}
            sx={{
              height: '40px',
              minWidth: '100px',
              textTransform: 'none',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            Réinitialiser
          </Button>
        </Box>
      </Box>

      {error && (
        <Box my={2} p={2} bgcolor="error.light" color="error.contrastText" borderRadius={1}>
          <Typography>{error}</Typography>
        </Box>
      )}

      {(loading.communes || loading.etablissements || loading.stats) && (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '300px',
          textAlign: 'center',
          p: 3
        }}>
          {loadingError.communes || loadingError.etablissements || loadingError.stats ? (
            <Box>
              <Typography variant="h6" color="error" gutterBottom>
                Erreur de chargement
              </Typography>
              <Typography variant="body1" color="textSecondary" paragraph>
                Impossible de charger les données. Veuillez vérifier votre connexion et réessayer.
              </Typography>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => {
                  // Réinitialiser les états d'erreur
                  setLoadingError({
                    communes: false,
                    etablissements: false,
                    stats: false
                  });
                  // Recharger les données
                  setSelectedCommune(prev => {
                    if (prev) {
                      const temp = prev;
                      setSelectedCommune('');
                      return temp;
                    }
                    return prev;
                  });
                }}
              >
                Réessayer
              </Button>
            </Box>
          ) : (
            <>
              <CircularProgress size={60} thickness={4} color="primary" />
              <Typography variant="body1" mt={2}>
                {loading.communes ? 'Chargement des communes...' : 
                 loading.etablissements ? 'Chargement des établissements...' : 
                 'Chargement des données de l\'établissement...'}
              </Typography>
            </>
          )}
        </Box>
      )}

      {selectedEtablissementData && (
        <Box sx={{ width: '100%', mt: 2, maxWidth: '100%' }}>
          <Grid container spacing={1} sx={{ display: 'flex', flexWrap: 'wrap', width: '100%', justifyContent: 'space-between' }}>
                  {/* Première rangée */}
                  <Grid item xs={12} sm={6} md={3} lg={3} xl={3} sx={{ display: 'flex', flex: '0 0 calc(25% - 12px)', marginBottom: '16px' }}>
                    <StatCard 
                      title="Établissement"
                      value={selectedEtablissementData.nom_etab_fr || selectedEtablissementData.nom_etab_ar || 'Non spécifié'}
                      icon={School}
                      type="etablissements"
                      fullHeight
                      sx={{ height: '100%', minHeight: '160px', display: 'flex', flexDirection: 'column' }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={3} lg={3} xl={3} sx={{ display: 'flex', flex: '0 0 calc(25% - 12px)', marginBottom: '16px' }}>
                    <StatCard 
                      title="Commune"
                      value={selectedEtablissementData.commune?.nom || 
                            (selectedCommune ? communes.find(c => c.value === selectedCommune)?.label : 'Non spécifiée')}
                      icon={LocationOn}
                      type="communes"
                      fullHeight
                      sx={{ height: '100%', minHeight: '160px', display: 'flex', flexDirection: 'column' }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={3} lg={3} xl={3} sx={{ display: 'flex', flex: '0 0 calc(25% - 12px)', marginBottom: '16px' }}>
                    <StatCard 
                      title="Cycle éducatif"
                      value={selectedEtablissementData.cycle || 'Non spécifié'}
                      icon={School}
                      type="cycles"
                      fullHeight
                      sx={{ height: '100%', minHeight: '160px', display: 'flex', flexDirection: 'column' }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={3} lg={3} xl={3} sx={{ display: 'flex', flex: '0 0 calc(25% - 12px)', marginBottom: '16px' }}>
                    <StatCard 
                      title="Nombre d'élèves"
                      value={statsEtablissement?.statistiques?.nombre_eleves !== undefined ? 
                            statsEtablissement.statistiques.nombre_eleves.toString() : 'N/A'}
                      icon={People}
                      type="eleves"
                      fullHeight
                      sx={{ height: '100%', minHeight: '160px', display: 'flex', flexDirection: 'column' }}
                    />
                  </Grid>

                  {/* Deuxième rangée */}
                  <Grid item xs={12} sm={6} md={3} lg={3} xl={3} sx={{ display: 'flex', flex: '0 0 calc(25% - 12px)', marginBottom: '16px' }}>
                    <StatCard 
                      title="Classement Province"
                      value={statsEtablissement?.statistiques?.rang_province ? 
                        `#${statsEtablissement.statistiques.rang_province}` : 'N/A'}
                      type="communes"
                      icon={LocationOn}
                      fullHeight
                      sx={{ height: '100%', minHeight: '160px', display: 'flex', flexDirection: 'column' }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={3} lg={3} xl={3} sx={{ display: 'flex', flex: '0 0 calc(25% - 12px)', marginBottom: '16px' }}>
                    <StatCard 
                      title="Classement Commune"
                      value={statsEtablissement?.statistiques?.rang_commune ? 
                        `#${statsEtablissement.statistiques.rang_commune}` : 'N/A'}
                      type="communes"
                      icon={LocationOn}
                      fullHeight
                      sx={{ height: '100%', minHeight: '160px', display: 'flex', flexDirection: 'column' }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={3} lg={3} xl={3} sx={{ display: 'flex', flex: '0 0 calc(25% - 12px)', marginBottom: '16px' }}>
                    <StatCard 
                      title="Moyenne Générale"
                      value={statsEtablissement?.statistiques?.moyenne_generale?.toFixed(2) || 'N/A'}
                      type="moyenne"
                      fullHeight
                      sx={{ height: '100%', minHeight: '160px', display: 'flex', flexDirection: 'column' }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={3} lg={3} xl={3} sx={{ display: 'flex', flex: '0 0 calc(25% - 12px)', marginBottom: '16px' }}>
                    <StatCard 
                      title="Taux de Réussite"
                      value={statsEtablissement?.statistiques?.taux_reussite ? 
                            `${statsEtablissement.statistiques.taux_reussite}%` : 'N/A'}
                      type="reussite"
                      fullHeight
                      sx={{ height: '100%', minHeight: '160px', display: 'flex', flexDirection: 'column' }}
                    />
                  </Grid>
              </Grid>

              {/* Onglets d'analyse */}
              <Box sx={{ width: '100%', mt: 3 }}>
                <Tabs 
                  value={activeTab} 
                  onChange={handleTabChange}
                  variant="fullWidth"
                  indicatorColor="primary"
                  textColor="primary"
                  sx={{ mt: 2 }}
                >
                  <Tab icon={<TimelineIcon />} label="Par Niveau" />
                  <Tab icon={<SchoolIcon />} label="Par Matière" />
                  <Tab icon={<CompareArrows />} label="Comparaison Annuelle" />
                </Tabs>

                <Box sx={{ mt: 3 }}>
                  {activeTab === 0 && <NiveauxAnalysis etablissementId={selectedEtablissement} anneeScolaire={selectedYear} />}
                  {activeTab === 1 && (
                    <>
                      <Box sx={{ width: '100%', my: 2 }}>
                        <DiagrammeMatiereParNiveau 
                          etablissementId={selectedEtablissement}
                          anneeScolaire={selectedYear}
                        />
                      </Box>
                      <MatieresAnalysis etablissementId={selectedEtablissement} anneeScolaire={selectedYear} />
                    </>
                  )}
                  {activeTab === 2 && <ComparaisonAnnuelle etablissementId={selectedEtablissement} anneeScolaire={selectedYear} />}
                </Box>
              </Box>
        </Box>
      )}
    </PageContainer>
  );
};

export default AnalyseEtablissement;