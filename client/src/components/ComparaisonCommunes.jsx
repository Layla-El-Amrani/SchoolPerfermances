import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme
} from '@mui/material';
import EducationLoading from './EducationLoading';
import { Bar } from 'react-chartjs-2';
import { api, apiEndpoints } from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Enregistrer les composants nécessaires de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ComparaisonCommunes = ({ idProvince }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anneeScolaire, setAnneeScolaire] = useState('2023-2024');
  const [anneesScolaires, setAnneesScolaires] = useState([]);
  const theme = useTheme();

  // Charger les années scolaires disponibles
  useEffect(() => {
    const fetchAnneesScolaires = async () => {
      try {
        const response = await api.get(apiEndpoints.getAnneesScolaires);
        if (response.data?.success) {
          setAnneesScolaires(response.data.data || []);
          // Sélectionner l'année courante par défaut
          const anneeCourante = response.data.data.find(a => a.est_courante);
          if (anneeCourante) {
            setAnneeScolaire(anneeCourante.annee_scolaire);
          }
        }
      } catch (err) {
        console.error('Erreur lors du chargement des années scolaires:', err);
      }
    };

    fetchAnneesScolaires();
  }, []);

  // Charger les données de comparaison des communes
  useEffect(() => {
    const fetchData = async () => {
      if (!idProvince || !anneeScolaire) return;
      
      try {
        setLoading(true);
        setError(null);
        
        console.log(`Récupération des données pour la province ${idProvince}, année ${anneeScolaire}`);
        const response = await api.get(
          apiEndpoints.comparaisonCommunes(idProvince, anneeScolaire),
          { params: { annee_scolaire: anneeScolaire } }
        );
        
        console.log('Réponse de l\'API:', response.data);
        
        if (response.data?.success) {
          // S'assurer que data est un tableau
          const responseData = Array.isArray(response.data.data) 
            ? response.data.data 
            : [];
            
          console.log('Données formatées:', responseData);
          setData(responseData);
        } else {
          throw new Error(response.data?.message || 'Format de réponse inattendu');
        }
      } catch (err) {
        console.error('Erreur lors de la récupération des données:', err);
        setError(`Erreur: ${err.message || 'Impossible de charger les données'}`);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [idProvince, anneeScolaire]);

  const handleAnneeChange = (event) => {
    setAnneeScolaire(event.target.value);
  };

  // Préparer les données pour le graphique
  const chartData = {
    labels: Array.isArray(data) 
      ? data.map(item => item?.commune || 'Inconnu')
      : [],
    datasets: [
      {
        label: 'Moyenne Générale',
        data: Array.isArray(data) 
          ? data.map(item => parseFloat(item?.moyenne_generale) || 0)
          : [],
        backgroundColor: theme.palette.primary.main,
        borderColor: theme.palette.primary.dark,
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        label: 'Taux de Réussite (%)',
        data: Array.isArray(data) 
          ? data.map(item => parseFloat(item?.taux_reussite) || 0)
          : [],
        backgroundColor: theme.palette.secondary.main,
        borderColor: theme.palette.secondary.dark,
        borderWidth: 1,
        yAxisID: 'y1',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Comparaison des communes',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(2);
              if (label.includes('Taux')) {
                label += '%';
              }
            }
            return label;
          }
        }
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Communes',
        },
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Moyenne Générale',
        },
        min: 0,
        max: 20,
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Taux de Réussite (%)',
        },
        min: 0,
        max: 100,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  if (loading) {
    return <EducationLoading message="Chargement des données des communes" />;
  }

  if (error) {
    return (
      <Box p={3} color="error.main">
        <Typography>{error}</Typography>
      </Box>
    );
  }

  if (data.length === 0) {
    return (
      <Box p={3} textAlign="center">
        <Typography>Aucune donnée disponible pour la comparaison des communes</Typography>
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Comparaison des communes
        </Typography>
        
        <FormControl variant="outlined" size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="annee-scolaire-label">Année scolaire</InputLabel>
          <Select
            labelId="annee-scolaire-label"
            value={anneeScolaire}
            onChange={handleAnneeChange}
            label="Année scolaire"
          >
            {anneesScolaires.map((annee) => (
              <MenuItem key={annee.annee_scolaire} value={annee.annee_scolaire}>
                {annee.annee_scolaire}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      
      <Box sx={{ height: '400px', position: 'relative' }}>
        <Bar data={chartData} options={options} />
      </Box>
      
      <Box mt={2}>
        <Typography variant="caption" color="text.secondary">
          Nombre de communes: {data.length}
        </Typography>
      </Box>
    </Paper>
  );
};

export default ComparaisonCommunes;
