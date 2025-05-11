import React from 'react';
import { Box, Typography, keyframes, useTheme, styled } from '@mui/material';
import { motion } from 'framer-motion';
import SchoolIcon from '@mui/icons-material/School';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ScienceIcon from '@mui/icons-material/Science';

// Animation de flottement pour les icônes
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

// Animation de gradient pour le fond
const gradient = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// Composant stylisé pour les icônes flottantes
const FloatingIcon = styled('div')(({ theme, delay = 0 }) => ({
  position: 'absolute',
  opacity: 0.1,
  animation: `${float} 4s ease-in-out infinite`,
  animationDelay: `${delay}s`,
  zIndex: 0,
  '& svg': {
    fontSize: '4rem',
    color: theme.palette.primary.main,
  },
}));

const EducationLoading = ({ message = 'Chargement' }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        padding: theme.spacing(6, 4),
        textAlign: 'center',
        overflow: 'hidden',
        background: `linear-gradient(-45deg, 
          ${theme.palette.primary.light}10, 
          ${theme.palette.secondary.light}15, 
          ${theme.palette.primary.light}10,
          ${theme.palette.secondary.light}15
        )`,
        backgroundSize: '400% 400%',
        animation: `${gradient} 8s ease infinite`,
        borderRadius: theme.shape.borderRadius * 2,
        boxShadow: `0 4px 20px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)'}`,
      }}
    >
      {/* Icônes flottantes en arrière-plan */}
      <FloatingIcon sx={{ top: '10%', left: '15%' }} delay={0}>
        <SchoolIcon />
      </FloatingIcon>
      <FloatingIcon sx={{ top: '70%', right: '15%' }} delay={0.5}>
        <AutoStoriesIcon />
      </FloatingIcon>
      <FloatingIcon sx={{ bottom: '20%', left: '20%' }} delay={1}>
        <PsychologyIcon />
      </FloatingIcon>
      <FloatingIcon sx={{ top: '30%', right: '25%' }} delay={1.5}>
        <ScienceIcon />
      </FloatingIcon>

      {/* Contenu principal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ position: 'relative', zIndex: 1 }}
      >
        {/* Cercle animé */}
        <Box
          sx={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: `conic-gradient(
                from 0deg,
                ${theme.palette.primary.main} 0%,
                ${theme.palette.secondary.main} 100%
              )`,
              animation: 'spin 1.5s linear infinite',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
              },
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              width: 'calc(100% - 8px)',
              height: 'calc(100% - 8px)',
              borderRadius: '50%',
              backgroundColor: theme.palette.background.paper,
            },
          }}
        >
          <SchoolIcon
            sx={{
              fontSize: 48,
              color: theme.palette.primary.main,
              position: 'relative',
              zIndex: 1,
            }}
          />
        </Box>

        {/* Message de chargement */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              marginBottom: 1,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block',
            }}
          >
            {message}
          </Typography>
          
          {/* Points animés */}
          <Box
            sx={{
              display: 'inline-flex',
              '& span': {
                width: 8,
                height: 8,
                margin: '0 2px',
                borderRadius: '50%',
                backgroundColor: theme.palette.primary.main,
                display: 'inline-block',
                animation: 'bounce 1.4s infinite ease-in-out both',
                '&:nth-of-type(1)': { animationDelay: '0.2s' },
                '&:nth-of-type(2)': { animationDelay: '0.3s' },
                '&:nth-of-type(3)': { animationDelay: '0.4s' },
                '@keyframes bounce': {
                  '0%, 80%, 100%': { transform: 'scale(0.6)' },
                  '40%': { transform: 'scale(1)' },
                },
              },
            }}
          >
            <span />
            <span />
            <span />
          </Box>
        </motion.div>

        {/* Citation éducative */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              marginTop: 3,
              color: theme.palette.text.secondary,
              fontStyle: 'italic',
              maxWidth: '80%',
              margin: '24px auto 0',
              position: 'relative',
              '&::before, &::after': {
                content: '"\\201C"',
                fontSize: '2em',
                lineHeight: 1,
                color: theme.palette.primary.light,
                verticalAlign: 'middle',
                margin: '0 4px',
              },
              '&::before': {
                content: '"\\201C"',
                marginRight: 8,
              },
              '&::after': {
                content: '"\\201D"',
                marginLeft: 8,
              },
            }}
          >
            {getRandomQuote()}
          </Typography>
        </motion.div>
      </motion.div>
    </Box>
  );
};

// Fonction pour obtenir une citation éducative aléatoire
const getRandomQuote = () => {
  const quotes = [
    "L'éducation est l'arme la plus puissante pour changer le monde.",
    "Apprendre, c'est comme ramer à contre-courant : si l'on s'arrête, on recule.",
    "La connaissance s'acquiert par l'expérience, tout le reste n'est que de l'information.",
    "L'éducation est la clé pour ouvrir la porte d'or de la liberté.",
    "Un investissement dans le savoir paie toujours le meilleur intérêt.",
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
};

export default EducationLoading;
