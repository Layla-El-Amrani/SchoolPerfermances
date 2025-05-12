import React from 'react';
import { Box, Typography } from '@mui/material';

const NoDataMessage = () => (
  <Box 
    sx={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '400px',
      bgcolor: 'background.paper',
      borderRadius: 1,
      p: 2,
      textAlign: 'center'
    }}
  >
    <Typography variant="body1" color="textSecondary" gutterBottom>
      Aucune donnée d'évolution disponible
    </Typography>
    <Typography variant="body2" color="textSecondary">
      Les données d'évolution ne sont pas disponibles pour cette commune.
    </Typography>
  </Box>
);

export default NoDataMessage;
