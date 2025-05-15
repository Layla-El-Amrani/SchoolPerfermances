import React from 'react';
import { Box, Typography } from '@mui/material';
import { Pie } from 'react-chartjs-2';

const CyclesPieChart = ({ cyclesData, cyclesOptions }) => {
  console.log('CyclesPieChart - Données reçues:', cyclesData);
  
  // Vérifier s'il y a des données à afficher
  const hasData = cyclesData && 
                 cyclesData.labels && 
                 cyclesData.labels.length > 0 &&
                 cyclesData.datasets && 
                 cyclesData.datasets[0]?.data?.some(val => val > 0);

  // Si pas de données ou toutes les valeurs sont à 0
  if (!hasData) {
    return (
      <Box
        sx={{
          height: '100%',
          width: '100%',
          background: 'rgba(255,255,255,0.85)',
          borderRadius: 4,
          boxShadow: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          textAlign: 'center'
        }}
      >
        <Typography variant="h6" color="textSecondary" gutterBottom>
          Aucune donnée disponible
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Aucun établissement trouvé pour les cycles sélectionnés
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        background: 'rgba(255,255,255,0.85)',
        borderRadius: 4,
        boxShadow: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'box-shadow 0.3s, transform 0.3s',
        '&:hover': {
          boxShadow: 10,
          transform: 'scale(1.01)'
        },
        py: { xs: 2, md: 3 },
        px: { xs: 1, md: 2 }
      }}
    >
      <Box sx={{ 
        height: { xs: 240, md: 340 }, 
        width: '100%', 
        position: 'relative', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Pie 
          data={cyclesData} 
          options={{
            ...cyclesOptions,
            plugins: {
              ...cyclesOptions?.plugins,
              tooltip: {
                ...cyclesOptions?.plugins?.tooltip,
                callbacks: {
                  label: function(context) {
                    const label = context.label || '';
                    const value = context.raw || 0;
                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                    const percentage = Math.round((value / total) * 100);
                    return `${label}: ${value} établissement(s) (${percentage}%)`;
                  }
                }
              }
            }
          }}
        />
      </Box>
    </Box>
  );
};

export default CyclesPieChart;
