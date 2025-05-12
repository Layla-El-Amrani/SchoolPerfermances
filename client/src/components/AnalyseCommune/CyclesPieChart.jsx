import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Timeline as TimelineIcon } from '@mui/icons-material';
import { Pie } from 'react-chartjs-2';

const CyclesPieChart = ({ cyclesData, cyclesOptions }) => {
  console.log('CyclesPieChart - Données reçues:', cyclesData);
  
  if (cyclesData && cyclesData.labels && cyclesData.labels.length === 0) {
    console.warn('Aucune donnée de cycle disponible');
  } else if (!cyclesData) {
    console.warn('Données de cycle non définies');
  }
  
  return (
  <Paper elevation={1} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <TimelineIcon color="primary" sx={{ mr: 1 }} />
      <Typography variant="h6">Répartition par cycle</Typography>
    </Box>
    {cyclesData && cyclesData.labels && cyclesData.labels.length > 0 ? (
      <Box sx={{ height: '400px', position: 'relative' }}>
        <Pie 
          data={cyclesData} 
          options={cyclesOptions}
        />
      </Box>
    ) : (
      <Box sx={{ 
        height: '400px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        bgcolor: 'background.paper', 
        borderRadius: 1 
      }}>
        <Typography color="textSecondary">
          {cyclesData === null ? 'Chargement des données...' : 'Aucune donnée de cycle disponible'}
        </Typography>
      </Box>
    )}
    </Paper>
  );
};

export default CyclesPieChart;
