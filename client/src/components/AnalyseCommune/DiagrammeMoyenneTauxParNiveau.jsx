import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import api, { apiEndpoints } from '../../services/api';

const DiagrammeMoyenneTauxParNiveau = ({ etablissementId, anneeScolaire }) => {
  const [statistiquesNiveaux, setStatistiquesNiveaux] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!etablissementId || !anneeScolaire) return;
    setIsLoading(true);
    setError(null);
    // Appel API sans 3e argument !
    api.get(apiEndpoints.statNiveau(etablissementId, anneeScolaire))
      .then(res => {
        const stats = res.data?.data?.statistiques_niveaux;
        if (res.data?.success && Array.isArray(stats)) {
          setStatistiquesNiveaux(stats);
        } else {
          setStatistiquesNiveaux([]);
        }
      })
      .catch(() => setStatistiquesNiveaux([]))
      .finally(() => setIsLoading(false));
  }, [etablissementId, anneeScolaire]);

  const chartData = {
    labels: statistiquesNiveaux.map(n => n.niveau.description),
    datasets: [
      {
        label: 'Moyenne',
        data: statistiquesNiveaux.map(n => n.moyenne),
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
      {
        label: 'Taux de réussite (%)',
        data: statistiquesNiveaux.map(n => n.taux_reussite),
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 20,
        title: {
          display: true,
          text: 'Moyenne /20 ou Taux (%)',
        },
      },
    },
    plugins: {
      legend: { display: true },
      title: {
        display: true,
        text: 'Moyenne et taux de réussite par niveau',
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
      <Typography variant="h6" align="center" sx={{ mb: 2 }}>
        Moyenne et taux de réussite par niveau
      </Typography>
      {isLoading ? (
        <Box flex={1} display="flex" alignItems="center" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : statistiquesNiveaux.length > 0 ? (
        <Box sx={{ height: 340 }}>
          <Bar data={chartData} options={chartOptions} />
        </Box>
      ) : (
        <Typography color="textSecondary" align="center" sx={{ mt: 6 }}>
          Aucune donnée disponible pour les niveaux de cet établissement.
        </Typography>
      )}
    </Paper>
  );
};

export default DiagrammeMoyenneTauxParNiveau;
