import React from 'react';
import { Box, Typography, Paper, Card, CardMedia } from '@mui/material';
import { LocationOn } from '@mui/icons-material';

const CommuneMap = ({ selectedCommune, statsCommune, getCommuneMapPath }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      <LocationOn color="primary" sx={{ mr: 1 }} />
      <Typography variant="h6">Carte de la commune</Typography>
    </Box>
    {getCommuneMapPath(selectedCommune) ? (
      <Box sx={{ flex: 1, minHeight: 0, position: 'relative' }}>
        <Card sx={{ height: '100%', width: '100%', position: 'absolute' }}>
          <CardMedia
            component="img"
            image={getCommuneMapPath(selectedCommune)}
            alt={`Carte de ${statsCommune?.nom || 'la commune'}`}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
          />
        </Card>
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
        <Typography color="textSecondary">Aucune carte disponible pour cette commune</Typography>
      </Box>
    )}
  </Box>
);

export default CommuneMap;
