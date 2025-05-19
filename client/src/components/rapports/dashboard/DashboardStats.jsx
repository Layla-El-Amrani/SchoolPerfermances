import React from 'react';
import { Grid, Box } from '@mui/material';
import { 
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  EmojiEvents as EmojiEventsIcon,
} from '@mui/icons-material';
import { DashboardCard, StatValue, StatLabel } from '../common/styles/styledComponents';

const DashboardStats = ({ stats }) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <DashboardCard>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <SchoolIcon color="primary" sx={{ fontSize: 40, mr: 1 }} />
            <Box>
              <StatValue>{stats.totalStudents}</StatValue>
              <StatLabel>Élèves Total</StatLabel>
            </Box>
          </Box>
        </DashboardCard>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <DashboardCard>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TrendingUpIcon color="primary" sx={{ fontSize: 40, mr: 1 }} />
            <Box>
              <StatValue>{stats.averageScore.toFixed(1)}</StatValue>
              <StatLabel>Moyenne Générale</StatLabel>
            </Box>
          </Box>
        </DashboardCard>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <DashboardCard>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CheckCircleOutlineIcon color="primary" sx={{ fontSize: 40, mr: 1 }} />
            <Box>
              <StatValue>{stats.passRate}%</StatValue>
              <StatLabel>Taux de Réussite</StatLabel>
            </Box>
          </Box>
        </DashboardCard>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <DashboardCard>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <EmojiEventsIcon color="primary" sx={{ fontSize: 40, mr: 1 }} />
            <Box>
              <StatValue>{stats.topPerformingSubject}</StatValue>
              <StatLabel>Meilleure Matière</StatLabel>
            </Box>
          </Box>
        </DashboardCard>
      </Grid>
    </Grid>
  );
};

export default DashboardStats; 