import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, FormControl, InputLabel, Select, MenuItem, CircularProgress } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import api, { apiEndpoints } from '../../services/api';

const DiagrammeMatiereParNiveau = ({ etablissementId, anneeScolaire }) => {
  const [niveaux, setNiveaux] = useState([]);
  const [selectedNiveau, setSelectedNiveau] = useState('');

  // Sélectionner automatiquement le premier niveau dès que la liste est chargée
  useEffect(() => {
    if (niveaux.length > 0 && !selectedNiveau) {
      setSelectedNiveau(niveaux[0].code_niveau);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [niveaux]);
  const [matieres, setMatieres] = useState([]);
  const [chartType, setChartType] = useState('moyenne'); // 'moyenne' ou 'taux'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Charger les niveaux disponibles pour l'établissement
  useEffect(() => {
    if (!etablissementId || !anneeScolaire) return;
    setIsLoading(true);
    console.log('Appel API niveaux avec etablissementId:', etablissementId, 'anneeScolaire:', anneeScolaire);
    api.get(apiEndpoints.statNiveau(etablissementId, anneeScolaire, ''))
      .then(res => {
        console.log('Réponse API niveaux:', res.data);
        if (res.data?.success && Array.isArray(res.data.data?.niveaux)) {
          setNiveaux(res.data.data.niveaux);
        } else {
          setNiveaux([]);
        }
      })
      .catch((err) => {
        console.error('Erreur API niveaux:', err);
        setNiveaux([]);
      })
      .finally(() => setIsLoading(false));
  }, [etablissementId, anneeScolaire]);

  // Charger les matières du niveau sélectionné pour l'établissement
  useEffect(() => {
    if (!selectedNiveau || !etablissementId) {
      setMatieres([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    console.log('Appel API matieres avec etablissementId:', etablissementId, 'niveauId:', selectedNiveau, 'anneeScolaire:', anneeScolaire);
    api.get(apiEndpoints.statMatiere(etablissementId, selectedNiveau, anneeScolaire))
      .then(res => {
        console.log('Réponse API matières:', res.data);
        const stats = res.data?.data?.statistiques_matieres;
        if (res.data?.success && Array.isArray(stats)) {
          // Adapter pour le graphique : extraire nom, moyenne, taux_reussite
          const matieresFormat = stats.map(item => ({
            nom: item.matiere?.nom_matiere_ar || item.matiere?.nom_matiere || item.matiere?.nom || '',
            moyenne: item.moyenne || 0,
            taux_reussite: item.taux_reussite || 0
          }));
          setMatieres(matieresFormat);
        } else {
          setMatieres([]);
        }
      })
      .catch((err) => {
        console.error('Erreur API matières:', err);
        setMatieres([]);
      })
      .finally(() => setIsLoading(false));
  }, [selectedNiveau, etablissementId, anneeScolaire]);

  // Préparer les données pour le diagramme
  const chartData = {
    labels: matieres.map(m => m.nom),
    datasets: [
      {
        label: chartType === 'moyenne' ? 'Moyenne /20' : 'Taux de Réussite %',
        data: matieres.map(m => chartType === 'moyenne' ? m.moyenne : m.taux_reussite),
        backgroundColor: chartType === 'moyenne'
          ? 'rgba(54, 162, 235, 0.7)'
          : 'rgba(255, 99, 132, 0.7)',
        borderColor: chartType === 'moyenne'
          ? 'rgba(54, 162, 235, 1)'
          : 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: chartType === 'moyenne' ? 20 : 100,
        title: {
          display: true,
          text: chartType === 'moyenne' ? 'Moyenne /20' : 'Taux de Réussite (%)',
        },
      },
    },
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: chartType === 'moyenne'
          ? 'Moyenne par matière pour le niveau sélectionné'
          : 'Taux de réussite par matière pour le niveau sélectionné',
      },
      tooltip: {
        callbacks: {
          label: context => `${context.dataset.label}: ${context.parsed.y?.toFixed(2)}`
        }
      }
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 2, minHeight: 400, display: 'flex', flexDirection: 'column' }}>

      <Box mb={2} display="flex" gap={2} alignItems="center">
        <FormControl sx={{ minWidth: 200 }}>

      {selectedNiveau && (
        <Typography variant="h6" align="center" sx={{ mt: 2, width: '100%' }}>
          {niveaux.find(n => n.code_niveau === selectedNiveau)?.description || selectedNiveau}
        </Typography>
      )}
          <InputLabel>Niveau</InputLabel>
          <Select
            value={selectedNiveau}
            onChange={e => setSelectedNiveau(e.target.value)}
            label="Niveau"
          >
            {niveaux.map(niv => (
              <MenuItem key={niv.code_niveau} value={niv.code_niveau}>
                {niv.description}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {selectedNiveau && (
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel>Statistique</InputLabel>
            <Select
              value={chartType}
              onChange={e => setChartType(e.target.value)}
              label="Statistique"
            >
              <MenuItem value="moyenne">Moyenne</MenuItem>
              <MenuItem value="taux">Taux de réussite</MenuItem>
            </Select>
          </FormControl>
        )}
      </Box>
      {isLoading ? (
        <Box flex={1} display="flex" alignItems="center" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : selectedNiveau && matieres.length > 0 ? (
        <Box sx={{ height: 340 }}>
          <Bar data={chartData} options={chartOptions} />
        </Box>
      ) : selectedNiveau && matieres.length === 0 ? (
        <Typography color="textSecondary" align="center" sx={{ mt: 6 }}>
          Aucune donnée disponible pour ce niveau.
        </Typography>
      ) : null}
    </Paper>
  );
};

export default DiagrammeMatiereParNiveau;
