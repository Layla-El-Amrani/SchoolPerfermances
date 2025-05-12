import React from 'react';
import { Grid } from '@mui/material';
import StatCard from '../StatCard';

const CommuneStatsCards = ({ selectedCommuneData, statsCommune }) => {
  const cardStyle = {
    height: '100%',
    minHeight: '160px',
    display: 'flex',
    flexDirection: 'column'
  };

  return (
  <Grid container spacing={1} sx={{ display: 'flex', flexWrap: 'wrap', width: '100%', gap: 1 }}>
    {/* Première rangée */}
    <Grid item xs={12} sm={6} md={4} lg={4} xl={4} sx={{ display: 'flex', flex: '1 1 calc(33.333% - 8px)', minWidth: '200px', mb: 1 }}>
      <StatCard 
        title="Rang dans la province"
        value={statsCommune.rang_province ? `#${statsCommune.rang_province}` : 'N/A'}
        type="rang"
        fullHeight
        sx={{ ...cardStyle, minHeight: '140px' }}
      />
    </Grid>

    <Grid item xs={12} sm={6} md={4} lg={4} xl={4} sx={{ display: 'flex', flex: '1 1 calc(33.333% - 8px)', minWidth: '200px', mb: 1 }}>
      <StatCard 
        title="Établissements"
        value={statsCommune.nombre_etablissements || 0}
        type="etablissements"
        fullHeight
        sx={{ ...cardStyle, minHeight: '140px' }}
      />
    </Grid>

    <Grid item xs={12} sm={6} md={4} lg={4} xl={4} sx={{ display: 'flex', flex: '1 1 calc(33.333% - 8px)', minWidth: '200px', mb: 1 }}>
      <StatCard 
        title="Élèves"
        value={statsCommune.nombre_eleves || 0}
        type="eleves"
        fullHeight
        sx={{ ...cardStyle, minHeight: '140px' }}
      />
    </Grid>

    <Grid item xs={12} sm={6} md={4} lg={4} xl={4} sx={{ display: 'flex', flex: '1 1 calc(33.333% - 8px)', minWidth: '200px', mb: 1 }}>
      <StatCard 
        title="Moyenne Générale"
        value={statsCommune.moyenne_generale !== undefined ? statsCommune.moyenne_generale.toFixed(2) : 'N/A'}
        type="moyenne"
        fullHeight
        sx={{ ...cardStyle, minHeight: '140px' }}
      />
    </Grid>
    
    {/* Deuxième rangée */}
    <Grid item xs={12} sm={6} md={4} lg={4} xl={4} sx={{ display: 'flex', flex: '1 1 calc(33.333% - 8px)', minWidth: '200px', mb: 1 }}>
      <StatCard 
        title="Taux de Réussite"
        value={statsCommune.taux_reussite !== undefined ? `${statsCommune.taux_reussite.toFixed(2)}%` : 'N/A'}
        type="reussite"
        fullHeight
        sx={{ ...cardStyle, minHeight: '140px' }}
      />
    </Grid>
    
    <Grid item xs={12} sm={6} md={4} lg={4} xl={4} sx={{ display: 'flex', flex: '1 1 calc(33.333% - 8px)', minWidth: '200px', mb: 1 }}>
      <StatCard 
        title="Taux d'Échec"
        value={statsCommune.taux_echec !== undefined ? `${statsCommune.taux_echec.toFixed(2)}%` : 'N/A'}
        type="echec"
        fullHeight
        sx={{ ...cardStyle, minHeight: '140px' }}
      />
    </Grid>
  </Grid>
  );
};

export default CommuneStatsCards;
