import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Chip,
  Card,
  CardContent,
  CardHeader,
  Divider,
  CircularProgress
} from '@mui/material';
import { 
  CalendarToday, 
  LocationOn,
  Timeline as TimelineIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { useYear } from '../contexts/YearContext';
import api from '../services/api';
import { apiEndpoints } from '../services/api';
import { 
  CommuneStatsCards, 
  CommuneMap, 
  CyclesPieChart, 
  EvolutionCharts,
  NoDataMessage 
} from '../components/AnalyseCommune';
import TopEtablissementsCommune from '../components/TopEtablissementsCommune';

// Configuration de Chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AnalyseCommune = () => {
  const { selectedYear } = useYear();
  const chartRef = useRef(null);
  
  // États pour stocker les données
  const [communes, setCommunes] = useState([]);
  const [selectedCommune, setSelectedCommune] = useState('');
  const [selectedCommuneData, setSelectedCommuneData] = useState(null);
  const [statsCommune, setStatsCommune] = useState(null);
  const [evolutionData, setEvolutionData] = useState({ moyennes: null, taux: null });

  const [cyclesData, setCyclesData] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  });
  const [activeTab, setActiveTab] = useState('cycle');
  const [chartType, setChartType] = useState('moyenne'); // 'moyenne' ou 'taux'
  
  const [isLoading, setIsLoading] = useState({
    communes: true,
    stats: false,
    evolution: false,
    cycles: false,
    classement: false
  });
  
  const [error, setError] = useState({
    stats: null,
    evolution: null,
    cycles: null
  });

  // Charger la liste des communes
  useEffect(() => {
    const fetchCommunes = async () => {
      try {
        setIsLoading(prev => ({ ...prev, communes: true }));
        const response = await api.get(apiEndpoints.getCommunes);
        
        if (response.data?.success && response.data.communes) {
          const formattedCommunes = response.data.communes.map(commune => ({
            id: commune.cd_com,
            code: commune.cd_com,
            nom: commune.ll_com || `Commune ${commune.cd_com}`
          }));
          
          setCommunes(formattedCommunes);
          
          // Sélectionner automatiquement la première commune si disponible
          if (formattedCommunes.length > 0 && !selectedCommune) {
            setSelectedCommune(formattedCommunes[0].id);
          }
        }
      } catch (err) {
        setError(prev => ({ 
          ...prev, 
          commune: 'Erreur lors du chargement des communes. Veuillez réessayer.' 
        }));
        console.error('Erreur:', err);
      } finally {
        setIsLoading(prev => ({ ...prev, communes: false }));
      }
    };

    fetchCommunes();
  }, []);

  // Fonction pour charger les données de la commune
  const loadCommuneData = useCallback(async () => {
    if (!selectedCommune || !selectedYear) {
      setStatsCommune(null);
      return;
    }

    try {
      setIsLoading(prev => ({ ...prev, stats: true }));
      setError(prev => ({ ...prev, stats: null }));
      
      const [statsResponse, communeResponse] = await Promise.all([
        api.get(apiEndpoints.statCommune(selectedCommune, selectedYear)),
        api.get(apiEndpoints.getCommune(selectedCommune))
      ]);
      
      if (statsResponse.data?.success) {
        const stats = statsResponse.data.data?.statistiques || {};
        setStatsCommune({
          ...stats,
          taux_reussite: stats.taux_reussite ? parseFloat(stats.taux_reussite) : 0,
          taux_echec: stats.taux_echec ? parseFloat(stats.taux_echec) : 0
        });
      } else {
        setError(prev => ({ ...prev, stats: 'Impossible de charger les statistiques de la commune' }));
      }
      
      if (communeResponse.data?.success) {
        setSelectedCommuneData({
          ...communeResponse.data.data,
          nom: communeResponse.data.data.ll_com || `Commune ${communeResponse.data.data.cd_com}`,
          province: {
            ...communeResponse.data.data.province,
            ll_prov: communeResponse.data.data.province?.ll_prov || 'Inconnue'
          }
        });
      }
    } catch (err) {
      setError(prev => ({ ...prev, stats: 'Erreur lors du chargement des statistiques' }));
      console.error('Erreur:', err);
    } finally {
      setIsLoading(prev => ({ ...prev, stats: false }));
    }
  }, [selectedCommune, selectedYear]);

  // Effet pour charger les données au chargement du composant et quand la commune ou l'année change
  useEffect(() => {
    const loadData = async () => {
      if (selectedCommune) {
        await Promise.all([
          loadCommuneData(),
          loadEvolutionData(),
          loadCyclesData()
        ]);
      }
    };
    
    loadData();
  }, [selectedCommune, selectedYear]);

  // Fonction pour charger les données d'évolution
  const loadEvolutionData = useCallback(async () => {
    if (!selectedCommune) return;

    try {
      setIsLoading(prev => ({ ...prev, evolution: true }));
      setError(prev => ({ ...prev, evolution: null }));
      
      const response = await api.get(apiEndpoints.evolutionCommune(selectedCommune));
      console.log('Données d\'évolution reçues:', response.data);
      
      if (response.data?.success) {
        // Extraire les données de la réponse
        const responseData = response.data.data || {};
        
        // Récupérer les données d'évolution (peut être undefined si pas de données)
        const evolutionData = Array.isArray(responseData.evolution) ? responseData.evolution : [];
        
        // Si nous n'avons pas de données d'évolution, on s'arrête là
        if (evolutionData.length === 0) {
          console.log('Aucune donnée d\'évolution disponible');
          setEvolutionData({ moyennes: null, taux: null });
          return;
        }
        
        // Utiliser uniquement les années disponibles dans les données
        const processedData = [...evolutionData];
        console.log('Données traitées pour le graphique:', processedData);
        
        try {
          // Trier les données par année scolaire
          const sortedData = [...processedData].sort((a, b) => {
            return a.annee_scolaire.localeCompare(b.annee_scolaire);
          });
          
          // Transformation des données pour les graphiques
          const moyennes = {
            labels: sortedData.map(item => item.annee_scolaire || 'Inconnu'),
            datasets: [
              {
                label: 'Moyenne /20',
                data: sortedData.map(item => {
                  const value = parseFloat(item.moyenne_generale);
                  return isNaN(value) ? 0 : value;
                }),
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
              }
            ]
          };
          
          const taux = {
            labels: sortedData.map(item => item.annee_scolaire || 'Inconnu'),
            datasets: [
              {
                label: 'Taux de Réussite %',
                data: sortedData.map(item => {
                  const value = parseFloat(item.taux_reussite);
                  return isNaN(value) ? 0 : value;
                }),
                backgroundColor: 'rgba(255, 99, 132, 0.7)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
              }
            ]
          };
          
          setEvolutionData({ moyennes, taux });
        } catch (transformError) {
          console.error('Erreur lors de la transformation des données d\'évolution:', transformError);
          setError(prev => ({ ...prev, evolution: 'Erreur de format des données d\'évolution' }));
        }
      } else {
        setError(prev => ({ ...prev, evolution: response.data?.message || 'Erreur lors du chargement des données d\'évolution' }));
      }
    } catch (err) {
      setError(prev => ({ ...prev, evolution: 'Erreur lors du chargement des données d\'évolution' }));
      console.error('Erreur:', err);
    } finally {
      setIsLoading(prev => ({ ...prev, evolution: false }));
    }
  }, [selectedCommune]);

  // Fonction pour charger les données des cycles
  const loadCyclesData = useCallback(async () => {
    if (!selectedCommune) return;
    
    setIsLoading(prev => ({ ...prev, cycles: true }));
    try {
      const response = await api.get(apiEndpoints.statsParCycleCommune(selectedCommune, selectedYear));
      console.log('Données des cycles reçues:', response.data);
      
      if (response.data?.success && Array.isArray(response.data.data)) {
        const data = response.data.data;
        
        // Transformation des données pour le graphique
        const labels = data.map(item => item.cycle || 'Autre');
        
        const moyenneData = data.map(item => parseFloat(item.moyenne_generale || 0));
        const tauxReussiteData = data.map(item => parseFloat(item.taux_reussite || 0));
        
        setCyclesData(prev => ({
          ...prev,
          labels,
          datasets: [
            {
              ...prev.datasets[0],
              data: chartType === 'moyenne' ? moyenneData : tauxReussiteData,
              label: chartType === 'moyenne' ? 'Moyenne /20' : 'Taux de Réussite %',
            }
          ]
        }));
      } else {
        setCyclesData({
          labels: [],
          datasets: [{ data: [] }]
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données des cycles:', error);
      setCyclesData({
        labels: [],
        datasets: [{ data: [] }]
      });
    } finally {
      setIsLoading(prev => ({ ...prev, cycles: false }));
    }
  }, [selectedCommune, selectedYear, chartType]);

  // Mettre à jour les données du graphique quand le type de graphique change
  useEffect(() => {
    if (cyclesData && cyclesData.datasets && cyclesData.datasets[0]) {
      // On recharge les données pour s'assurer d'avoir les bonnes valeurs
      loadCyclesData();
    }
  }, [chartType, loadCyclesData]);

  // Gestion du changement de commune
  const handleCommuneChange = (event) => {
    setSelectedCommune(event.target.value);
    // Réinitialiser les données de la commune précédente
    setSelectedCommuneData(null);
    setStatsCommune(null);
    setEvolutionData({ moyennes: null, taux: null });
    setCyclesData(null);
  };

  // Fonction pour obtenir le chemin de la carte de la commune
  const getCommuneMapPath = (communeId) => {
    if (!communeId) return null;
    const commune = communes.find(c => c.id === communeId);
    if (!commune) return null;
    
    const nomSansAccent = commune.nom
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/\s+/g, '_');

    return `/CarteCommune/${nomSansAccent}.png`;
  };

  const NoDataMessage = ({ message = 'Aucune donnée disponible' }) => (
    <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
      {message}
    </Typography>
  );

  // Options pour les graphiques
  const moyennesOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Évolution des moyennes par année',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 20,
        title: {
          display: true,
          text: 'Moyenne /20'
        }
      }
    }
  };

  const tauxOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Évolution des taux de réussite et d\'échec',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Pourcentage (%)'
        }
      }
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 0, pt: 0, '& > * + *': { mt: 1 } }}>
      <Typography component="h1" sx={{ 
        fontWeight: 'normal', 
        mb: 1.5,
        fontSize: '1.1rem',
        color: 'text.secondary'
      }}>
        Analyse par Commune
      </Typography>
      
      {/* Sélecteur de commune */}
      <Paper elevation={1} sx={{ p: 1 }}>
        <Typography variant="subtitle2" sx={{ 
          display: 'flex', 
          alignItems: 'center',
          mb: 1,
          color: 'text.secondary'
        }}>
          <LocationOn color="primary" sx={{ mr: 1, fontSize: '1rem' }} />
          Sélectionnez une commune
        </Typography>
        <FormControl fullWidth size="small">
          <InputLabel id="commune-select-label">Commune</InputLabel>
          <Select
            labelId="commune-select-label"
            value={selectedCommune}
            onChange={handleCommuneChange}
            label="Commune"
            disabled={isLoading.communes}
            size="small"
            sx={{
              '& .MuiSelect-select': {
                padding: '8px 12px',
                fontSize: '0.875rem'
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'divider'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main'
              }
            }}
          >
            {communes.map((commune) => (
              <MenuItem key={commune.id} value={commune.id}>
                {commune.nom}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {selectedCommune ? (
        <>
          {/* Cartes de statistiques */}
          {statsCommune && selectedCommuneData && (
              <Grid container spacing={1}>
                <CommuneStatsCards 
                  selectedCommuneData={selectedCommuneData} 
                  statsCommune={statsCommune} 
                />
              </Grid>
            )}

            {/* Carte et répartition par cycle */}
            <Grid container spacing={1} sx={{ display: 'flex', alignItems: 'stretch' }}>
              <Grid item xs={12} md={5}>
                <Paper elevation={1} sx={{ p: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                    <Typography variant="h6">
                      Répartition des établissements par cycle d'enseignement
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flex: 1, gap: 2 }}>
                    <Box sx={{ flex: 1, minHeight: '300px' }}>
                      <CyclesPieChart
                        cyclesData={cyclesData}
                        cyclesOptions={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'right',
                              labels: {
                                padding: 20,
                                usePointStyle: true,
                                pointStyle: 'rectRounded'
                              }
                            },
                            title: {
                              display: false
                            }
                          }
                        }}
                      />
                    </Box>
                    <Box sx={{ width: '250px', p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Légende des cycles :</Typography>
                      <Box component="ul" sx={{ pl: 2, m: 0, listStyle: 'none' }}>
                        <Box component="li" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ width: 12, height: 12, bgcolor: '#FF6384', mr: 1, borderRadius: '2px' }} />
                          <Typography variant="body2">Cycle Primaire</Typography>
                        </Box>
                        <Box component="li" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ width: 12, height: 12, bgcolor: '#36A2EB', mr: 1, borderRadius: '2px' }} />
                          <Typography variant="body2">Cycle Collégial</Typography>
                        </Box>
                        <Box component="li" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ width: 12, height: 12, bgcolor: '#FFCE56', mr: 1, borderRadius: '2px' }} />
                          <Typography variant="body2">Cycle Secondaire</Typography>
                        </Box>
                        <Box component="li" sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ width: 12, height: 12, bgcolor: '#4BC0C0', mr: 1, borderRadius: '2px' }} />
                          <Typography variant="body2">Cycle Qualifiant</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={7}>
                <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                  <CommuneMap
                    selectedCommune={selectedCommune}
                    statsCommune={selectedCommuneData}
                    getCommuneMapPath={getCommuneMapPath}
                  />
                </Paper>
              </Grid>
            </Grid>

            {/* Graphiques d'évolution */}
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Paper elevation={1} sx={{ p: 1, borderRadius: 2, height: '100%', width: '100%' }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                    <Typography variant="h6">
                      {chartType === 'moyenne' ? 'Moyenne par Cycle' : 'Taux de Réussite par Cycle'}
                    </Typography>
                    <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
                      <InputLabel>Type de graphique</InputLabel>
                      <Select
                        value={chartType}
                        onChange={(e) => setChartType(e.target.value)}
                        label="Type de graphique"
                      >
                        <MenuItem value="moyenne">Moyenne /20</MenuItem>
                        <MenuItem value="taux">Taux de réussite %</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  
                  {isLoading.cycles ? (
                    <Box sx={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                      <CircularProgress />
                    </Box>
                  ) : cyclesData && cyclesData.labels && cyclesData.labels.length > 0 && cyclesData.datasets && cyclesData.datasets[0] ? (
                    <Box sx={{ height: '400px', position: 'relative', width: '100%' }}>
                      <Bar 
                        data={{
                          labels: cyclesData.labels,
                          datasets: [{
                            label: chartType === 'moyenne' ? 'Moyenne /20' : 'Taux de Réussite %',
                            data: cyclesData.datasets[0]?.data || [],
                            backgroundColor: cyclesData.datasets[0]?.backgroundColor || 'rgba(54, 162, 235, 0.7)',
                            borderColor: cyclesData.datasets[0]?.borderColor || 'rgba(54, 162, 235, 1)',
                            borderWidth: 1
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                              beginAtZero: true,
                              max: chartType === 'moyenne' ? 20 : 100,
                              title: {
                                display: true,
                                text: chartType === 'moyenne' ? 'Moyenne /20' : 'Taux de Réussite (%)'
                              }
                            }
                          },
                          plugins: {
                            tooltip: {
                              callbacks: {
                                label: function(context) {
                                  return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}`;
                                }
                              }
                            }
                          }
                        }}
                      />
                    </Box>
                  ) : (
                    <NoDataMessage message="Aucune donnée de cycle disponible" />
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper elevation={1} sx={{ p: 1, borderRadius: 2, height: '100%', width: '100%' }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                    <Typography variant="h6">
                      {chartType === 'moyenne'
                        ? 'Évolution des Moyennes'
                        : 'Évolution des Taux de Réussite'}
                    </Typography>
                    <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
                      <InputLabel>Type de graphique</InputLabel>
                      <Select
                        value={chartType}
                        onChange={(e) => setChartType(e.target.value)}
                        label="Type de graphique"
                      >
                        <MenuItem value="moyenne">Moyennes</MenuItem>
                        <MenuItem value="taux">Taux de réussite</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  
                  {chartType === 'moyenne' ? (
                    <Box sx={{ height: '400px', position: 'relative', width: '100%' }}>
                      {evolutionData.moyennes && evolutionData.moyennes.labels && evolutionData.moyennes.labels.length > 0 ? (
                        <Line
                          data={evolutionData.moyennes}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: 'top',
                              },
                              title: {
                                display: true,
                                text: 'Évolution des moyennes par année',
                              },
                            },
                            scales: {
                              y: {
                                beginAtZero: true,
                                max: 20,
                                title: {
                                  display: true,
                                  text: 'Moyenne /20'
                                }
                              }
                            }
                          }}
                        />
                      ) : (
                        <NoDataMessage />
                      )}
                    </Box>
                  ) : (
                    <Box sx={{ height: '400px', position: 'relative', flexGrow: 1 }}>
                      {evolutionData.taux && evolutionData.taux.labels && evolutionData.taux.labels.length > 0 ? (
                        <Line
                          data={evolutionData.taux}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: 'top',
                              },
                              title: {
                                display: true,
                                text: 'Évolution des taux de réussite',
                              },
                            },
                            scales: {
                              y: {
                                beginAtZero: true,
                                max: 100,
                                title: {
                                  display: true,
                                  text: 'Pourcentage (%)'
                                }
                              }
                            }
                          }}
                        />
                      ) : (
                        <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <NoDataMessage />
                        </Box>
                      )}
                    </Box>
                  )}
                </Paper>
              </Grid>

              {/* Top 3 des établissements de la commune */}
              <Grid item xs={12}>
                <TopEtablissementsCommune 
                  communeId={selectedCommune} 
                  anneeScolaire={selectedYear} 
                />
              </Grid>
            </Grid>
          </>
        ) : (
          <Box textAlign="center" my={4}>
            <Typography variant="body1" color="textSecondary">
              Veuillez sélectionner une commune pour afficher les statistiques
            </Typography>
          </Box>
        )}
    </Container>
  );
};

export default AnalyseCommune;