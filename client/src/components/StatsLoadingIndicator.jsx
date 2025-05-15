import React from 'react';
import { Box, Typography, keyframes, useTheme } from '@mui/material';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import { motion } from 'framer-motion';

// Animation de pulse pour l'icône centrale
const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 0.7; }
`;

const StatsLoadingIndicator = ({ message = 'Chargement des statistiques...' }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px', // Can be adjusted
        padding: theme.spacing(3),
        textAlign: 'center',
        borderRadius: theme.shape.borderRadius,
        // background: theme.palette.background.paper, // Optional: add a subtle background
        // boxShadow: theme.shadows[1], // Optional: add a subtle shadow
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          sx={{
            width: 80, // Smaller than EducationLoading
            height: 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          <QueryStatsIcon
            sx={{
              fontSize: 56, // Adjusted size
              color: theme.palette.primary.main,
              animation: `${pulse} 2s ease-in-out infinite`,
            }}
          />
        </Box>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 500,
            color: theme.palette.text.secondary,
          }}
        >
          {message}
        </Typography>
      </motion.div>
    </Box>
  );
};

export default StatsLoadingIndicator; 