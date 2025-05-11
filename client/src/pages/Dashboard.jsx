import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Box, 
  Typography, 
  Paper, 
  useTheme,
  styled,
  CircularProgress,
  Card,
  CardMedia,
  CardContent
} from '@mui/material';
import StatCard from '../components/StatCard';
import ProgressionMoyenne from '../components/ProgressionMoyenne';
import TopEtablissements from '../components/TopEtablissements';
import { api, apiEndpoints } from '../services/api';
import { useTranslation } from '../hooks/useTranslation';
import { useYear } from '../contexts/YearContext';
import './Dashboard.css';

const DashboardContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
  '& .MuiGrid-root': {
    flexBasis: 'auto',
    flexGrow: 1,
    maxWidth: '100%',
  }
}));

const DashboardHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  '& h1': {
    color: theme.palette.text.primary,
    fontWeight: 700,
    marginBottom: theme.spacing(1),
  },
  '& .subtitle': {
    color: theme.palette.text.secondary,
    fontSize: '1.1rem',
  },
}));

const StatsGrid = styled(Grid)(({ theme }) => ({
  marginTop: theme.spacing(3),
  '& > .MuiGrid-item': {
    display: 'flex',
    padding: theme.spacing(1),
    '& > div': {
      width: '100%',
      height: '100%',
      margin: theme.spacing(1),
      transition: 'all 0.3s ease-in-out',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[4],
      }
    },
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1),
      width: '100%',
      marginBottom: theme.spacing(2),
    },
    [theme.breakpoints.between('sm', 'md')]: {
      width: 'calc(50% - 24px)',
      '& > div': {
        margin: theme.spacing(1.5),
      },
      '&:nth-of-type(2n)': {
        marginRight: 0,
      },
    },
    [theme.breakpoints.between('md', 'xl')]: {
      width: 'calc(33.333% - 24px)',
      '& > div': {
        margin: theme.spacing(1.5),
      },
      '&:nth-of-type(3n)': {
        marginRight: 0,
      }
    },
    [theme.breakpoints.up('xl')]: {
      width: 'calc(20% - 24px)',
      '& > div': {
        margin: theme.spacing(1.5),
      },
      '&:nth-of-type(5n)': {
        marginRight: 0,
      }
    }
  },
  '&.MuiGrid-container': {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    margin: 0,
    [theme.breakpoints.down('sm')]: {
      '& > .MuiGrid-item': {
        paddingLeft: 0,
        paddingRight: 0,
      }
    }
  }
}));

const LoadingContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '50vh',
  flexDirection: 'column',
  gap: '1rem',
});

const Dashboard = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [error, setError] = useState(null);
    const { selectedYear } = useYear();

    useEffect(() => {
        if (selectedYear) {
            fetchStats();
        }
    }, [selectedYear]);

    const fetchStats = async () => {
        try {
            if (!selectedYear) {
                console.log('Aucune année sélectionnée');
                return;
            }
            
            setLoading(true);
            console.log('Récupération des statistiques pour l\'année:', selectedYear);
            
            const response = await api.get(apiEndpoints.statsProvince(selectedYear), {
                params: { annee_scolaire: selectedYear }
            });
            
            console.log('Réponse de l\'API:', response.data);
            
            if (!response.data || !response.data.success) {
                throw new Error(response.data?.message || 'Erreur lors de la récupération des statistiques');
            }

            setStats(response.data.data);
            setError(null);
        } catch (err) {
            console.error('Erreur lors de la récupération des statistiques:', err);
            setError('Impossible de charger les statistiques. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <LoadingContainer>
                <CircularProgress size={60} thickness={4} />
                <Typography variant="h6" color="textSecondary">
                    Chargement des statistiques...
                </Typography>
            </LoadingContainer>
        );
    }

    if (error || !stats) {
        return (
            <DashboardContainer maxWidth="lg">
                <Box mt={4} p={3} bgcolor="error.light" color="error.contrastText" borderRadius={2}>
                    <Typography>{error}</Typography>
                </Box>
            </DashboardContainer>
        );
    }

    const { province } = stats;
    const { statistiques } = province;

    return (
        <DashboardContainer maxWidth={false}>
            <DashboardHeader>

                <Typography className="subtitle">
                    {province.nom_province} • Année scolaire {stats.annee_scolaire}
                </Typography>
            </DashboardHeader>

            <StatsGrid container spacing={0}>
                <Grid item>
                    <StatCard 
                        title="Communes"
                        value={statistiques.nombre_communes}
                        type="communes"
                        trend={2.5}
                    />
                </Grid>
                <Grid item>
                    <StatCard 
                        title="Établissements"
                        value={statistiques.nombre_etablissements}
                        type="etablissements"
                        trend={1.8}
                    />
                </Grid>
                <Grid item>
                    <StatCard 
                        title="Élèves"
                        value={statistiques.nombre_eleves}
                        type="eleves"
                        trend={-0.5}
                    />
                </Grid>
                <Grid item>
                    <StatCard 
                        title="Moyenne Générale"
                        value={statistiques.moyenne_generale}
                        type="moyenne"
                        trend={3.2}
                    />
                </Grid>
                <Grid item>
                    <StatCard 
                        title="Taux de Réussite"
                        value={statistiques.taux_reussite}
                        type="reussite"
                        trend={2.1}
                    />
                </Grid>
                <Grid item>
                    <StatCard 
                        title="Taux d'Échec"
                        value={statistiques.taux_echec}
                        type="echec"
                        trend={-1.5}
                    />
                </Grid>
            </StatsGrid>
            
            {/* Section Graphique et Carte */}
            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12} md={8}>
                <ProgressionMoyenne />
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    sx={{
                      height: '100%',
                      objectFit: 'contain',
                      p: 2
                    }}
                    image="/carte.png"
                    alt="Carte de la province"
                  />
                  <CardContent>
                    <Typography variant="h6" align="center" color="text.secondary">
                      {province.nom_province}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            {/* Section Top 5 des établissements */}
            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12}>
                <TopEtablissements />
              </Grid>
            </Grid>
        </DashboardContainer>
    );
};

export default Dashboard;