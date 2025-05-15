import React from 'react';
import { Box, Typography, keyframes, useTheme } from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook'; // Education-related icon

// Keyframes for the layers expanding and fading
const revealLayer = keyframes`
  0% {
    transform: scaleX(0.2) scaleY(0.8);
    opacity: 0;
  }
  30%, 70% { // Stay visible for a period
    transform: scaleX(1) scaleY(1);
    opacity: 1;
  }
  100% {
    transform: scaleX(0.2) scaleY(0.8);
    opacity: 0;
  }
`;

// Optional subtle pulse for the main icon
const iconPulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const InitialPageLoadIndicator = ({ message = 'Chargement des données...' }) => {
  const theme = useTheme();
  const layerCount = 3; // Number of animated layers
  const layerHeight = '8px';
  const layerWidth = '80px';
  const animationDuration = '2.0s';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        width: '100%',
        padding: theme.spacing(3),
        textAlign: 'center',
        position: 'relative',
      }}
    >
      <Box 
        sx={{
          position: 'relative', // Container for icon and layers
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: layerWidth, // Match width of layers
          height: '100px', // Give some space for layers and icon
          mb: 3,
        }}
      >
        <MenuBookIcon 
          sx={{
            fontSize: '48px',
            color: theme.palette.primary.dark, // Darker shade for icon
            zIndex: layerCount + 1, // Ensure icon is on top
            position: 'relative',
            animation: `${iconPulse} 2.5s ease-in-out infinite`,
          }}
        />
        {[...Array(layerCount)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              width: layerWidth,
              height: layerHeight,
              backgroundColor: theme.palette.primary.main,
              borderRadius: '2px',
              opacity: 0,
              // Position layers stacked, slightly offset vertically from center
              // transformOrigin: i % 2 === 0 ? 'left center' : 'right center',
              transformOrigin: 'center center',
              top: `calc(50% + ${(i - Math.floor(layerCount / 2)) * (parseInt(layerHeight) + 4)}px - ${parseInt(layerHeight)/2}px)`,
              animation: `${revealLayer} ${animationDuration} ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          />
        ))}
      </Box>

      <Typography
        variant="h6"
        sx={{
          fontWeight: 500,
          color: theme.palette.text.secondary,
          mt: 2,
        }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export default InitialPageLoadIndicator; 