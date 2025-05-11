import React from 'react';
import { Box, CircularProgress, Typography, styled } from '@mui/material';

const LoaderContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: theme.palette.background.default,
  zIndex: 1400,
  transition: 'opacity 0.3s ease-out',
}));

const LoaderContent = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1rem',
});

const PageLoader = ({ isLoading, children }) => {
  if (!isLoading) return children;

  return (
    <LoaderContainer>
      <LoaderContent>
        <CircularProgress size={60} thickness={4} color="primary" />
        <Typography variant="h6" color="textSecondary" mt={2}>
          Chargement en cours...
        </Typography>
      </LoaderContent>
    </LoaderContainer>
  );
};

export default PageLoader;
