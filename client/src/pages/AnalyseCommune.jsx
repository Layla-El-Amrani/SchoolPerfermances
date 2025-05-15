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
  CircularProgress,
  Tabs,
  Tab
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

const MODERN_COLORS = ['#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE', '#3BA272', '#FC8452', '#9A60B4', '#EA7CCC'];
const MODERN_COLORS_BG_ALPHA = MODERN_COLORS.map(color => `${color}B3`); // ~70% alpha
const MODERN_COLORS_BORDER = MODERN_COLORS;

const AnalyseCommune = () => {
  const { selectedYear } = useYear();
  const chartRef = useRef(null);
  
  // États pour stocker les données
  const [communes, setCommunes] = useState([]);
  const [selectedCommune, setSelectedCommune] = useState('');
  const [selectedCommuneData, setSelectedCommuneData] = useState(null);
  const [statsCommune, setStatsCommune] = useState(null);
  const [evolutionData, setEvolutionData] = useState({ 
    moyennes: null, 
    taux: null, 
    cycles: null 
  });

  const [cyclesMoyenneData, setCyclesMoyenneData] = useState({
    labels: [],
    datasets: []
  });
  
  const [cyclesTauxData, setCyclesTauxData] = useState({
    labels: [],
    datasets: []
  });
  
  const [cyclesRepartitionData, setCyclesRepartitionData] = useState({
    labels: [],
    datasets: [{
      label: "Nombre d'établissements",
      data: [],
      backgroundColor: [],
      borderColor: [],
      borderWidth: 1
    }]
  });
  const [activeTab, setActiveTab] = useState('cycle');
  const [chartType, setChartType] = useState('moyenne'); // 'moyenne', 'taux' ou 'cycles'
  
  const [isLoading, setIsLoading] = useState({
    communes: true,
    stats: false,
    evolution: false,
    evolutionCycles: false,
    cycles: false,
    classement: false
  });
  
  const [error, setError] = useState({
    stats: null,
    evolution: null,
    cycles: null
  });

  // --- DÉFINITIONS DES FONCTIONS DE CHARGEMENT DES DONNÉES ---
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
      console.error('Erreur loadCommuneData:', err);
    } finally {
      setIsLoading(prev => ({ ...prev, stats: false }));
    }
  }, [selectedCommune, selectedYear]);

  const loadEvolutionData = useCallback(async () => {
    if (!selectedCommune) return;
    try {
      setIsLoading(prev => ({ ...prev, evolution: true }));
      setError(prev => ({ ...prev, evolution: null }));
      const response = await api.get(apiEndpoints.evolutionCommune(selectedCommune));
      if (response.data?.success) {
        const responseData = response.data.data || {};
        const evolutionRawData = Array.isArray(responseData.evolution) ? responseData.evolution : [];
        if (evolutionRawData.length === 0) {
          setEvolutionData(prev => ({ ...prev, moyennes: null, taux: null }));
          return;
        }
        const sortedData = [...evolutionRawData].sort((a, b) => 
          (a.annee_scolaire || '').localeCompare(b.annee_scolaire || '')
        );
        const communeNom = selectedCommuneData?.nom || 'la commune';
        const moyennes = {
          labels: sortedData.map(item => item.annee_scolaire || 'Inconnu'),
          datasets: [{
            label: `Moyenne annuelle - ${communeNom}`,
            data: sortedData.map(item => parseFloat(item.moyenne_generale || 0)),
            backgroundColor: MODERN_COLORS_BG_ALPHA[0],
            borderColor: MODERN_COLORS_BORDER[0],
            borderWidth: 2, tension: 0.4, fill: true,
            pointBackgroundColor: MODERN_COLORS_BORDER[0], pointBorderColor: '#fff',
            pointHoverRadius: 7, pointHoverBackgroundColor: MODERN_COLORS_BORDER[0], pointRadius: 5,
          }]
        };
        const taux = {
          labels: sortedData.map(item => item.annee_scolaire || 'Inconnu'),
          datasets: [{
            label: 'Taux de Réussite %',
            data: sortedData.map(item => parseFloat(item.taux_reussite || 0)),
            backgroundColor: MODERN_COLORS_BG_ALPHA[1],
            borderColor: MODERN_COLORS_BORDER[1],
            borderWidth: 2, tension: 0.4, fill: true,
            pointBackgroundColor: MODERN_COLORS_BORDER[1], pointBorderColor: '#fff',
            pointHoverRadius: 7, pointHoverBackgroundColor: MODERN_COLORS_BORDER[1], pointRadius: 5,
          }]
        };
        setEvolutionData(prev => ({ ...prev, moyennes, taux }));
      } else {
        setError(prev => ({ ...prev, evolution: response.data?.message || 'Erreur chargement évolution' }));
        setEvolutionData(prev => ({ ...prev, moyennes: null, taux: null }));
      }
    } catch (err) {
      setError(prev => ({ ...prev, evolution: 'Erreur critique chargement évolution' }));
      setEvolutionData(prev => ({ ...prev, moyennes: null, taux: null }));
      console.error('Erreur loadEvolutionData:', err);
    } finally {
      setIsLoading(prev => ({ ...prev, evolution: false }));
    }
  }, [selectedCommune, selectedCommuneData?.nom]);

  const loadEvolutionCyclesData = useCallback(async () => {
    if (!selectedCommune) return;
    try {
      setIsLoading(prev => ({ ...prev, evolutionCycles: true }));
      setError(prev => ({ ...prev, evolutionCycles: null }));
      const response = await api.get(apiEndpoints.evolutionMoyennesParCycle(selectedCommune));
      if (response.data?.success && response.data.data) {
        const { labels: yearLabels, datasets: cycleDatasets } = response.data.data;
        if (yearLabels && yearLabels.length > 0 && cycleDatasets && cycleDatasets.length > 0) {
          const formattedData = {
            labels: yearLabels,
            datasets: cycleDatasets.map((dataset, index) => ({
              ...dataset,
              label: dataset.label || `Cycle ${index + 1}`,
              data: Array.isArray(dataset.data) ? dataset.data.map(val => parseFloat(val || 0)) : [],
              backgroundColor: MODERN_COLORS_BG_ALPHA[index % MODERN_COLORS_BG_ALPHA.length],
              borderColor: MODERN_COLORS_BORDER[index % MODERN_COLORS_BORDER.length],
              borderWidth: 2.5, tension: 0.4, fill: false,
              pointBackgroundColor: MODERN_COLORS_BORDER[index % MODERN_COLORS_BORDER.length],
              pointBorderColor: '#fff', pointHoverRadius: 7,
              pointHoverBackgroundColor: MODERN_COLORS_BORDER[index % MODERN_COLORS_BORDER.length],
              pointRadius: 5, pointHitRadius: 10, pointBorderWidth: 2
            }))
          };
          setEvolutionData(prev => ({ ...prev, cycles: formattedData }));
        } else {
          setEvolutionData(prev => ({ ...prev, cycles: null }));
        }
      } else {
        setError(prev => ({ ...prev, evolutionCycles: response.data?.message || 'Erreur chargement évolution cycles' }));
        setEvolutionData(prev => ({ ...prev, cycles: null }));
      }
    } catch (err) {
      setError(prev => ({ ...prev, evolutionCycles: 'Erreur critique chargement évolution cycles' }));
      setEvolutionData(prev => ({ ...prev, cycles: null }));
      console.error('Erreur loadEvolutionCyclesData:', err);
    } finally {
      setIsLoading(prev => ({ ...prev, evolutionCycles: false }));
    }
  }, [selectedCommune]);

  const loadCyclesData = useCallback(async () => {
    if (!selectedCommune || !selectedYear) {
      setCyclesMoyenneData({ labels: [], datasets: [] });
      setCyclesTauxData({ labels: [], datasets: [] });
      setCyclesRepartitionData({ labels: [], datasets: [{ data: [] }] });
      return;
    }
    setIsLoading(prev => ({ ...prev, cycles: true }));
    setError(prev => ({ ...prev, cycles: null }));
    try {
      const response = await api.get(apiEndpoints.statsParCycleCommune(selectedCommune, selectedYear));
      if (response.data?.success && Array.isArray(response.data.data)) {
        const rawData = response.data.data;
        if (rawData.length === 0) {
          setCyclesMoyenneData({ labels: [], datasets: [] });
          setCyclesTauxData({ labels: [], datasets: [] });
          setCyclesRepartitionData({ labels: [], datasets: [{ data: [] }]});
          return;
        }
        const cycleLabels = rawData.map(item => item.cycle || item.nom_cycle || 'Autre Cycle');
        const moyennesPerCycle = rawData.map(item => parseFloat(item.moyenne_generale || item.moyenne || 0));
        const tauxReussitePerCycle = rawData.map(item => parseFloat(item.taux_reussite || item.taux || 0));
        const nbEtabParCycle = rawData.map(item => parseInt(item.nb_etablissements || item.nombre_etablissements || item.nb_etab || item.nombre_etab || 0));
        setCyclesMoyenneData({ labels: cycleLabels, datasets: [{ label: `Moyenne /20 (${selectedYear})`, data: moyennesPerCycle, backgroundColor: cycleLabels.map((_, i) => MODERN_COLORS_BG_ALPHA[i % MODERN_COLORS_BG_ALPHA.length]), borderColor: cycleLabels.map((_, i) => MODERN_COLORS_BORDER[i % MODERN_COLORS_BORDER.length]), borderWidth: 1.5, borderRadius: 4, }] });
        setCyclesTauxData({ labels: cycleLabels, datasets: [{ label: `Taux Réussite % (${selectedYear})`, data: tauxReussitePerCycle, backgroundColor: cycleLabels.map((_, i) => MODERN_COLORS_BG_ALPHA[i % MODERN_COLORS_BG_ALPHA.length]), borderColor: cycleLabels.map((_, i) => MODERN_COLORS_BORDER[i % MODERN_COLORS_BORDER.length]), borderWidth: 1.5, borderRadius: 4, }] });
        setCyclesRepartitionData({ labels: cycleLabels, datasets: [{ label: "Nombre d'établissements", data: nbEtabParCycle, backgroundColor: cycleLabels.map((_, i) => MODERN_COLORS[(i + 2) % MODERN_COLORS.length]), borderColor: cycleLabels.map((_, i) => MODERN_COLORS_BORDER[(i + 2) % MODERN_COLORS_BORDER.length]), borderWidth: 2, hoverOffset: 8, }] });
      } else {
        setError(prev => ({...prev, cycles: response.data?.message || 'Erreur chargement données cycles'}));
        setCyclesMoyenneData({ labels: [], datasets: [] });
        setCyclesTauxData({ labels: [], datasets: [] });
        setCyclesRepartitionData({ labels: [], datasets: [{data: []}]});
      }
    } catch (error) {
      setError(prev => ({...prev, cycles: 'Erreur critique chargement données cycles'}));
      setCyclesMoyenneData({ labels: [], datasets: [] });
      setCyclesTauxData({ labels: [], datasets: [] });
      setCyclesRepartitionData({ labels: [], datasets: [{data: []}]});
      console.error('Erreur loadCyclesData:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, cycles: false }));
    }
  }, [selectedCommune, selectedYear]);
  // --- FIN DES DÉFINITIONS DES FONCTIONS DE CHARGEMENT ---

  // Charger la liste des communes (uniquement au montage)
  useEffect(() => {
    const fetchCommunes = async () => {
      try {
        setIsLoading(prev => ({ ...prev, communes: true }));
        const response = await api.get(apiEndpoints.getCommunes);
        if (response.data?.success && response.data.communes) {
          const formattedCommunes = response.data.communes.map(commune => ({
            id: commune.cd_com, code: commune.cd_com,
            nom: commune.ll_com || `Commune ${commune.cd_com}`
          }));
          setCommunes(formattedCommunes);
          if (formattedCommunes.length > 0 && !selectedCommune) {
            setSelectedCommune(formattedCommunes[0].id);
          }
        }
      } catch (err) {
        setError(prev => ({ ...prev, commune: 'Erreur chargement communes.' }));
        console.error('Erreur fetchCommunes:', err);
      } finally {
        setIsLoading(prev => ({ ...prev, communes: false }));
      }
    };
    fetchCommunes();
  }, []); // Vide pour exécution unique au montage

  // Effet pour charger toutes les données de la commune sélectionnée lorsque la commune ou l'année change
  useEffect(() => {
    const loadAllDataForCommune = async () => {
      if (selectedCommune) {
        await Promise.all([
          loadCommuneData(),
          loadEvolutionData(),
          loadCyclesData(),
          loadEvolutionCyclesData()
        ]);
      }
    };
    loadAllDataForCommune();
  }, [selectedCommune, selectedYear, loadCommuneData, loadEvolutionData, loadCyclesData, loadEvolutionCyclesData]);

  // Gestion du changement de commune
  const handleCommuneChange = (event) => {
    setSelectedCommune(event.target.value);
    // Réinitialisation explicite des données liées à la commune précédente
    setSelectedCommuneData(null);
    setStatsCommune(null);
    setEvolutionData({ moyennes: null, taux: null, cycles: null }); // Réinitialiser toutes les données d'évolution
    setCyclesMoyenneData({ labels: [], datasets: [] });
    setCyclesTauxData({ labels: [], datasets: [] });
    setCyclesRepartitionData({ labels: [], datasets: [{ data: [] }] });
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
  const moyennesOptions = { // This is for the global evolution chart
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

  // Nouvelles options pour les graphiques par cycle
  const baseChartOptions = (chartTitle = 'Chart') => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          padding: 15,
          usePointStyle: true,
          pointStyle: 'rectRounded',
          font: { size: 12, family: 'Inter, Poppins, Arial, sans-serif' },
          color: '#444'
        }
      },
      title: { // Main title will be via Typography component above chart
        display: false,
        text: chartTitle,
        font: { size: 16, weight: '600', family: 'Inter, Poppins, Arial, sans-serif' },
        color: '#333',
        padding: { top: 5, bottom: 15 }
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        titleColor: '#fff',
        bodyColor: '#fff',
        titleFont: { size: 14, weight: 'bold', family: 'Inter, Poppins, Arial, sans-serif' },
        bodyFont: { size: 13, family: 'Inter, Poppins, Arial, sans-serif' },
        padding: 12,
        usePointStyle: true,
        pointStyle: 'rectRounded',
        borderColor: 'rgba(255,255,255,0.2)',
        borderWidth: 1,
        caretPadding: 10,
        caretSize: 6,
        cornerRadius: 6,
        boxPadding: 5,
      }
    },
    layout: {
      padding: {
        top: 5,
        right: 2,
        bottom: 5,
        left: 2
      }
    },
    scales: {
      x: {
        grid: { 
          display: true,
          color: 'rgba(0, 0, 0, 0.05)', // Lighter grid lines
          drawBorder: false,
        },
        ticks: { 
          font: { size: 11, family: 'Inter, Poppins, Arial, sans-serif' },
          color: '#555',
          maxRotation: 0, // Prevent label rotation if possible
          autoSkipPadding: 10,
      },
      title: {
          display: false, // Typically set per chart if needed
          font: { size: 13, weight: '500', family: 'Inter, Poppins, Arial, sans-serif' },
          color: '#333'
        }
      },
      y: {
        grid: { 
        display: true,
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
        },
        ticks: { 
          font: { size: 11, family: 'Inter, Poppins, Arial, sans-serif' },
          color: '#555',
          padding: 5,
        },
        title: {
          display: false, // Typically set per chart if needed
          font: { size: 13, weight: '500', family: 'Inter, Poppins, Arial, sans-serif' },
          color: '#333'
        }
      }
    }
  });

  const moyenneParCycleOptions = {
    ...baseChartOptions('Moyenne par Cycle'),
    plugins: {
      ...baseChartOptions().plugins,
      legend: { display: false }, // Single dataset, legend not very useful
      tooltip: {
         ...baseChartOptions().plugins.tooltip,
        callbacks: {
          title: function(tooltipItems) {
            // Use the label (Cycle Name) as the title of the tooltip
            if (tooltipItems.length > 0) {
              return tooltipItems[0].label;
            }
            return '';
          },
          label: function(context) {
            let label = context.dataset.label || 'Moyenne';
            if (context.parsed.y !== null) {
              label += `: ${context.parsed.y.toFixed(2)}/20`;
            }
            return label;
          }
        }
      }
    },
    scales: {
      ...baseChartOptions().scales,
      x: {
        ...baseChartOptions().scales.x,
        title: { display: true, text: 'Cycles', font: { size: 12, weight: 'bold', family: 'Inter, Poppins, Arial, sans-serif' }, color: '#333' }
      },
      y: {
        ...baseChartOptions().scales.y,
        beginAtZero: true,
        max: 20,
        min: 0, // Ensure y-axis starts at 0
        title: { display: true, text: 'Moyenne /20', font: { size: 12, weight: 'bold', family: 'Inter, Poppins, Arial, sans-serif' }, color: '#333' },
        ticks: { ...baseChartOptions().scales.y.ticks, stepSize: 2, callback: value => `${value}` }
      }
    }
  };

  const tauxReussiteParCycleOptions = {
    ...baseChartOptions('Taux de Réussite par Cycle'),
    indexAxis: 'y', // Horizontal bar chart
    plugins: {
      ...baseChartOptions().plugins,
      legend: { display: false }, // Single dataset
      tooltip: {
        ...baseChartOptions().plugins.tooltip,
        callbacks: {
          title: function(tooltipItems) {
            if (tooltipItems.length > 0) {
              return tooltipItems[0].label; // Cycle name
            }
            return '';
          },
          label: function(context) {
            let label = context.dataset.label || 'Taux de réussite';
            if (context.parsed.x !== null) { // .x for horizontal bar
              label += `: ${context.parsed.x.toFixed(2)}%`;
            }
            return label;
          }
        }
      }
    },
    scales: {
      ...baseChartOptions().scales,
      x: { // This is now the value axis
        ...baseChartOptions().scales.x,
        beginAtZero: true,
        max: 100,
        min: 0,
        title: { display: true, text: 'Taux de Réussite (%)', font: { size: 12, weight: 'bold', family: 'Inter, Poppins, Arial, sans-serif' }, color: '#333' },
        ticks: { ...baseChartOptions().scales.x.ticks, callback: value => `${value}%` }
      },
      y: { // This is now the category axis
         ...baseChartOptions().scales.y,
         title: { display: true, text: 'Cycles', font: { size: 12, weight: 'bold', family: 'Inter, Poppins, Arial, sans-serif' }, color: '#333' },
         ticks: { ...baseChartOptions().scales.y.ticks, autoSkip: false } // Ensure all cycle labels are shown
      }
    },
    // Add some padding to the left if y-axis labels are long
    layout: {
      padding: {
        ...baseChartOptions().layout.padding,
        left: 20 // Increased padding for horizontal bar labels
      }
    }
  };
  
  const evolutionAnnuelleCyclesOptions = {
    ...baseChartOptions('Évolution Annuelle des Cycles'),
    plugins: {
      ...baseChartOptions().plugins,
      legend: { 
        ...baseChartOptions().plugins.legend, 
        position: 'top', 
        align: 'center',
        labels: {
          ...baseChartOptions().plugins.legend.labels,
          boxWidth: 20,
          padding: 15
        }
      },
      tooltip: {
        ...baseChartOptions().plugins.tooltip,
        mode: 'index', // Show tooltip for all datasets at that index
        intersect: false,
        callbacks: {
          // title: function(tooltipItems) { ... } // Year is usually fine as title
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) { label += ': '; }
            if (context.parsed.y !== null) {
              // Assuming all data for this chart is /20, adjust if some datasets are %
              label += context.parsed.y.toFixed(2) + '/20'; 
            }
            return label;
          }
        }
      }
    },
    scales: {
      ...baseChartOptions().scales,
      x: {
        ...baseChartOptions().scales.x,
        title: { display: true, text: 'Année Scolaire', font: {size: 12, weight: 'bold', family: 'Inter, Poppins, Arial, sans-serif'}, color: '#333' }
      },
      y: {
        ...baseChartOptions().scales.y,
        beginAtZero: true,
        // max: 20, // Let it auto-scale or set if strictly /20
        min: 0,
        title: { display: true, text: 'Moyenne /20', font: { size: 12, weight: 'bold', family: 'Inter, Poppins, Arial, sans-serif' }, color: '#333' },
        ticks: { ...baseChartOptions().scales.y.ticks, callback: value => `${value}` }
      }
    },
    elements: {
      line: { tension: 0.4, borderWidth: 2.5 }, // Smoother lines
      point: { radius: 4, hoverRadius: 6, borderWidth: 1.5, hoverBorderWidth: 2 }
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
  };

  return (
    <Container maxWidth={false} sx={{ py: 0, pt: 0 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Analyse par Commune
      </Typography>
      
      {/* Sélecteur de commune */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <LocationOn color="primary" sx={{ mr: 1 }} />
          Sélectionnez une commune
        </Typography>
        <FormControl fullWidth>
          <InputLabel id="commune-select-label">Commune</InputLabel>
          <Select
            labelId="commune-select-label"
            value={selectedCommune}
            onChange={handleCommuneChange}
            label="Commune"
            disabled={isLoading.communes}
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
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <CommuneStatsCards 
                  selectedCommuneData={selectedCommuneData} 
                  statsCommune={statsCommune} 
                />
              </Grid>
            )}

            {/* Carte et répartition par cycle */}
            <Grid container spacing={3} sx={{ mb: 3, height: { xs: 'auto', md: 520 }, width: '100%' }}>
              <Grid item xs={12} md={6} sx={{ height: '100%', p: 0, m: 0, display: 'flex', width: '100%', flex: 1 }}>
                <Paper elevation={4} sx={{
                  p: 0, // Suppression du padding
                  borderRadius: 5,
                  height: '100%',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'stretch',
                  boxSizing: 'border-box',
                  background: 'linear-gradient(135deg, #f7fafc 0%, #e3f0fb 100%)',
                  boxShadow: 8,
                  border: '1.5px solid #e3e7ef',
                  transition: 'box-shadow 0.3s, transform 0.3s',
                  '&:hover': {
                    boxShadow: 16,
                    transform: 'translateY(-4px) scale(1.01)'
                  }
                }}> 
                  <Box sx={{ flex: 1, height: '100%', width: '100%', p: 0, m: 0 }}>
                    <CyclesPieChart
                      cyclesData={cyclesRepartitionData}
                      cyclesOptions={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: {
                              color: '#222',
                              font: { size: 16, family: 'Inter, Poppins, Arial, sans-serif', weight: 'bold' },
                              boxWidth: 20,
                              padding: 20,
                              usePointStyle: true
                            }
                          },
                          title: {
                            display: true,
                            text: 'Répartition des établissements par cycle',
                            font: { size: 20, family: 'Inter, Poppins, Arial, sans-serif', weight: 'bold' },
                            color: '#1a237e',
                            padding: { top: 18, bottom: 24 }
                          },
                          tooltip: {
                            enabled: true,
                            backgroundColor: '#fff',
                            titleColor: '#1a237e',
                            bodyColor: '#263238',
                            borderColor: '#1976d2',
                            borderWidth: 1.5,
                            bodyFont: { size: 16, family: 'Inter, Poppins, Arial, sans-serif' },
                            padding: 14
                          },
                        },
                        layout: {
                          padding: 14
                        },
                        elements: {
                          arc: {
                            borderWidth: 4,
                            borderColor: '#fff',
                            hoverBorderWidth: 6,
                            hoverBorderColor: '#90caf9',
                            shadowOffsetX: 0,
                            shadowOffsetY: 3,
                            shadowBlur: 10,
                            shadowColor: 'rgba(25, 118, 210, 0.10)'
                          }
                        },
                        cutout: '45%',
                        color: [
                          'rgba(54, 162, 235, 0.85)', // bleu moderne
                          'rgba(255, 99, 132, 0.85)', // rose
                          'rgba(255, 206, 86, 0.85)', // jaune
                          'rgba(75, 192, 192, 0.85)', // turquoise
                          'rgba(153, 102, 255, 0.85)', // violet
                          'rgba(255, 159, 64, 0.85)', // orange
                          'rgba(40, 167, 69, 0.85)' // vert
                        ]
                      }}
                    />
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6} sx={{ height: '100%', p: 0, m: 0, display: 'flex', width: '100%', flex: 1 }}>
                <Box sx={{ height: { xs: 'auto', md: 520 }, width: '100%', flex: 1, p: 0, m: 0 }}>
                  <CommuneMap
                    selectedCommune={selectedCommune}
                    statsCommune={selectedCommuneData}
                    getCommuneMapPath={getCommuneMapPath}
                  />
                </Box>
              </Grid>
            </Grid>

            {/* ============== NOUVELLE SECTION: ANALYSE DÉTAILLÉE PAR CYCLE ============== */}
            <Paper elevation={3} sx={{ width: '100%', p: {xs: 1, sm: 2, md:3}, mb: 3, mt: 3, borderRadius: 3 }}>
              <Typography variant="h5" component="h2" gutterBottom sx={{ textAlign: 'center', mb: {xs:2, md:3}, color: 'primary.dark', fontWeight: 'bold', fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } }}>
                Analyse Détaillée par Cycle pour l'Année {selectedYear}
                  </Typography>
              <Grid container spacing={{xs: 2, md: 4}} alignItems="stretch">
                {/* Chart 1: Moyenne par Cycle */}
                <Grid item xs={12} md={4}> {/* sm={6} removed to allow md={4} to work as 1/3 */}
                  <Paper elevation={2} sx={{ p: {xs:1, sm:2}, height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2, maxWidth: 480, mx: 'auto' }}>
                    <Typography variant="h6" gutterBottom align="center" sx={{ fontWeight: '600', color: 'text.primary', mb:1, fontSize: {xs: '1rem', sm: '1.15rem'} }}>Moyenne par Cycle</Typography>
      {isLoading.cycles ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1, minHeight: 330 }}><CircularProgress /></Box>
                    ) : (cyclesMoyenneData?.labels?.length > 0 && cyclesMoyenneData?.datasets?.[0]?.data?.length > 0) ? (
                      <Box sx={{ height: 330, width: '100%', flexGrow: 1 }}><Bar data={cyclesMoyenneData} options={moyenneParCycleOptions} /></Box>
                    ) : (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1, minHeight: 330 }}><NoDataMessage message="Aucune donnée de moyenne par cycle." /></Box>
      )}
    </Paper>
  </Grid>

                {/* Chart 2: Taux de Réussite par Cycle */}
                <Grid item xs={12} md={4}> {/* sm={6} removed */}
                  <Paper elevation={2} sx={{ p: {xs:1, sm:2}, height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2, maxWidth: 480, mx: 'auto' }}>
                    <Typography variant="h6" gutterBottom align="center" sx={{ fontWeight: '600', color: 'text.primary', mb:1, fontSize: {xs: '1rem', sm: '1.15rem'} }}>Taux de Réussite par Cycle</Typography>
      {isLoading.cycles ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1, minHeight: 330 }}><CircularProgress /></Box>
                    ) : (cyclesTauxData?.labels?.length > 0 && cyclesTauxData?.datasets?.[0]?.data?.length > 0) ? (
                      <Box sx={{ height: 330, width: '100%', flexGrow: 1 }}><Bar data={cyclesTauxData} options={tauxReussiteParCycleOptions} /></Box>
                    ) : (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1, minHeight: 330 }}><NoDataMessage message="Aucune donnée de taux de réussite par cycle." /></Box>
      )}
    </Paper>
  </Grid>

                {/* Chart 3: Évolution Annuelle des Cycles (Moyennes) */}
                <Grid item xs={12} md={4}> {/* sm={12} removed */}
                  <Paper elevation={2} sx={{ p: {xs:1, sm:2}, height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2, maxWidth: 480, mx: 'auto' }}>
                    <Typography variant="h6" gutterBottom align="center" sx={{ fontWeight: '600', color: 'text.primary', mb:1, fontSize: {xs: '1rem', sm: '1.15rem'} }}>Moyennes Annuelles par Cycle</Typography>
                    {isLoading.evolutionCycles ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1, minHeight: 330 }}><CircularProgress /></Box>
                    ) : (evolutionData.cycles?.labels?.length > 0 && evolutionData.cycles?.datasets?.some(ds => ds.data && ds.data.length > 0)) ? (
                      <Box sx={{ height: 330, width: '100%', flexGrow: 1 }}><Line data={evolutionData.cycles} options={evolutionAnnuelleCyclesOptions} /></Box>
                    ) : (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1, minHeight: 330 }}><NoDataMessage message="Aucune donnée d'évolution des moyennes par cycle." /></Box>
      )}
    </Paper>
  </Grid>
</Grid>
            </Paper>
            {/* ============== FIN DE LA NOUVELLE SECTION ============== */}

            {/* Graphiques d'évolution Globale de la commune (Tabs, Line charts for evolutionData.moyennes and .taux) - CETTE SECTION RESTE */}
            {/* Le Grid container suivant (originalement vers ligne 1085) est la section pour l'évolution globale et TopEtablissements */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
              {/* Chart Column - Global Evolution */}
                <Grid item xs={12} md={7}>
                  <Paper elevation={1} sx={{ p: 3, borderRadius: 2, mb: { xs: 3, md: 0 }, height: '100%' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                          {chartType === 'moyenne' 
                            ? 'Évolution des Moyennes de la Commune' 
                            : 'Taux de Réussite de la Commune'}
                        </Typography>
                        {selectedCommuneData?.nom && (
                          <Typography variant="subtitle2" color="text.secondary">
                            {selectedCommuneData.nom} - {selectedCommuneData.province?.ll_prov || ''}
                          </Typography>
                        )}
                      </Box>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Chip 
                          label={`Année: ${selectedYear || 'Toutes'}`} 
                          color="primary" 
                          variant="outlined"
                          sx={{ fontWeight: 'bold' }}
                        />
                        <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
                          <InputLabel>Type de graphique</InputLabel>
                          <Select
                            value={chartType}
                            onChange={(e) => setChartType(e.target.value)}
                            label="Type de graphique"
                          >
                            <MenuItem value="moyenne">Moyennes /20</MenuItem>
                            <MenuItem value="taux">Taux de réussite %</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    </Box>
                    
                    {chartType === 'moyenne' ? (
                      <Box sx={{ height: '400px', position: 'relative' }}>
                        {evolutionData.moyennes?.labels?.length > 0 ? (
                          <Line
                            data={evolutionData.moyennes}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              interaction: {
                                intersect: false,
                                mode: 'index',
                              },
                              plugins: {
                                legend: {
                                  position: 'top',
                                  align: 'end',
                                  labels: {
                                    boxWidth: 12,
                                    padding: 20,
                                    usePointStyle: true,
                                  }
                                },
                                tooltip: {
                                  backgroundColor: 'rgba(0, 0, 0, 0.85)',
                                  titleFont: { size: 14, weight: 'bold' },
                                  bodyFont: { size: 14 },
                                  padding: 12,
                                  usePointStyle: true,
                                  callbacks: {
                                    label: function(context) {
                                      const label = context.dataset.label || '';
                                      const value = context.parsed.y;
                                      return `${label}: ${value.toFixed(2)}/20`;
                                    }
                                  }
                                }
                              },
                              scales: {
                                y: {
                                  beginAtZero: true,
                                  max: 20,
                                  grid: {
                                    drawBorder: false,
                                    color: 'rgba(0, 0, 0, 0.05)'
                                  },
                                  ticks: {
                                    stepSize: 2,
                                    callback: value => `${value}/20`
                                  },
                                  title: {
                                    display: true,
                                    text: 'Moyenne sur 20',
                                    font: { weight: 'bold' }
                                  }
                                },
                                x: {
                                  grid: { display: false },
                                  title: {
                                    display: true,
                                    text: 'Année scolaire',
                                    font: { weight: 'bold' }
                                  }
                                }
                              },
                              elements: {
                                line: { tension: 0.3 },
                                point: {
                                  radius: 4,
                                  hoverRadius: 6,
                                  hoverBorderWidth: 2
                                }
                              }
                            }}
                          />
                        ) : (
                          <NoDataMessage message="Aucune donnée de moyenne disponible" />
                        )}
                      </Box>
                    ) : (
                      <Box sx={{ height: '400px', position: 'relative' }}>
                        {evolutionData.taux?.labels?.length > 0 ? (
                          <Line
                            data={evolutionData.taux}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              interaction: {
                                intersect: false,
                                mode: 'index',
                              },
                              plugins: {
                                legend: {
                                  position: 'top',
                                  align: 'end',
                                  labels: {
                                    boxWidth: 12,
                                    padding: 20,
                                    usePointStyle: true,
                                  }
                                },
                                tooltip: {
                                  backgroundColor: 'rgba(0, 0, 0, 0.85)',
                                  titleFont: { size: 14, weight: 'bold' },
                                  bodyFont: { size: 14 },
                                  padding: 12,
                                  usePointStyle: true,
                                  callbacks: {
                                    label: function(context) {
                                      const label = context.dataset.label || '';
                                      const value = context.parsed.y;
                                      return `${label}: ${value.toFixed(1)}%`;
                                    }
                                  }
                                }
                              },
                              scales: {
                                y: {
                                  beginAtZero: true,
                                  max: 100,
                                  grid: {
                                    drawBorder: false,
                                    color: 'rgba(0, 0, 0, 0.05)'
                                  },
                                  ticks: {
                                    callback: value => `${value}%`
                                  },
                                  title: {
                                    display: true,
                                    text: 'Taux de réussite (%)',
                                    font: { weight: 'bold' }
                                  }
                                },
                                x: {
                                  grid: { display: false },
                                  title: {
                                    display: true,
                                    text: 'Année scolaire',
                                    font: { weight: 'bold' }
                                  }
                                }
                              },
                              elements: {
                                line: { 
                                  tension: 0.3,
                                  borderColor: '#4caf50',
                                  backgroundColor: 'rgba(76, 175, 80, 0.1)'
                                },
                                point: {
                                  radius: 4,
                                  hoverRadius: 6,
                                  hoverBorderWidth: 2,
                                  backgroundColor: '#4caf50',
                                  borderColor: '#fff'
                                }
                              }
                            }}
                          />
                        ) : (
                          <NoDataMessage message="Aucune donnée de taux de réussite disponible" />
                        )}
                      </Box>
                    )}
                    
                    {/* Légende des données */}
                    <Box sx={{ 
                      mt: 2, 
                      textAlign: 'center',
                      color: 'text.secondary',
                      fontSize: '0.8rem'
                    }}>
                      <Typography variant="caption">
                        {chartType === 'moyenne'
                          ? 'Évolution des moyennes annuelles de la commune. Survolez pour voir les valeurs détaillées.'
                          : 'Évolution des taux de réussite annuels de la commune. Survolez pour voir les valeurs détaillées.'}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
                {/* Table Column */}
                <Grid item xs={12} md={5}>
                  <Paper elevation={1} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                    <TopEtablissementsCommune 
                      communeId={selectedCommune} 
                      anneeScolaire={selectedYear} 
                    />
                  </Paper>
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