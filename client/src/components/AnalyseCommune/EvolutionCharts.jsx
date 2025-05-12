import React from 'react';
import { Grid, Paper, Box, CircularProgress, Typography } from '@mui/material';
import { Timeline as TimelineIcon } from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import NoDataMessage from './NoDataMessage';

const EvolutionCharts = ({ 
  loading, 
  evolutionData, 
  moyennesOptions, 
  tauxOptions 
}) => (
  <>
    {/* Graphique d'évolution des moyennes */}
    <Grid item xs={12} md={6}>
      <Paper elevation={1} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TimelineIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">Évolution de la Moyenne Générale</Typography>
        </Box>
        
        {loading.evolution ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="400px">
            <CircularProgress />
          </Box>
        ) : evolutionData?.moyennes ? (
          <Box sx={{ height: '400px', position: 'relative' }}>
            <Line 
              data={evolutionData.moyennes} 
              options={{
                ...moyennesOptions,
                responsive: true,
                maintainAspectRatio: false
              }} 
            />
          </Box>
        ) : (
          <NoDataMessage />
        )}
      </Paper>
    </Grid>

    {/* Graphique d'évolution des taux */}
    <Grid item xs={12} md={6}>
      <Paper elevation={1} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TimelineIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">Évolution des Taux</Typography>
        </Box>
        
        {loading.evolution ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="400px">
            <CircularProgress />
          </Box>
        ) : evolutionData?.taux ? (
          <Box sx={{ height: '400px', position: 'relative' }}>
            <Line 
              data={evolutionData.taux} 
              options={{
                ...tauxOptions,
                responsive: true,
                maintainAspectRatio: false
              }} 
            />
          </Box>
        ) : (
          <NoDataMessage />
        )}
      </Paper>
    </Grid>
  </>
);

export default EvolutionCharts;
