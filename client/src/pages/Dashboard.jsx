import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Box, 
  Typography, 
  Card,
  CardContent,
  CardMedia,
  styled,
  CircularProgress
} from '@mui/material';
import StatCard from '../components/StatCard';
import ProgressionMoyenne from '../components/ProgressionMoyenne';
import TopEtablissements from '../components/TopEtablissements';
import ComparaisonCommunes from '../components/ComparaisonCommunes';
import { api, apiEndpoints } from '../services/api';
import { useTranslation } from '../hooks/useTranslation';
import { useYear } from '../contexts/YearContext';
import './Dashboard.css';

const DashboardContainer = styled(Container)(({ theme }) => ({
  paddingTop: 0,
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
    fontSize: '1.0rem',
  },
}));

const StatsGrid = styled(Grid)(({ theme }) => ({
  marginTop: theme.spacing(3),
  '& > .MuiGrid-item': {
    display: 'flex',
    padding: theme.spacing(1.5),
    '& > div': {
      margin: theme.spacing(1),
      width: 'calc(100% - 16px)',
      height: 'calc(100% - 16px)',
      [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(1.5),
        width: '100%',
        marginBottom: theme.spacing(2),
      },
      [theme.breakpoints.between('sm', 'md')]: {
        width: 'calc(50% - 20px)',
        margin: theme.spacing(0, 2, 3, 0),
        '&:nth-child(2n)': {
          marginRight: 0,
        },
      },
      [theme.breakpoints.between('md', 'xl')]: {
        width: 'calc(33.333% - 16px)',
        margin: theme.spacing(0, 2, 3, 0),
        '&:nth-child(3n)': {
          marginRight: 0,
        }
      },
      [theme.breakpoints.up('xl')]: {
        width: 'calc(20% - 17px)',
        margin: theme.spacing(0, 2, 3, 0),
        '&:nth-child(5n)': {
          marginRight: 0,
        }
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
                    Province {province.nom_province} • Année scolaire {stats.annee_scolaire}
                </Typography>
            </DashboardHeader>

            <StatsGrid container spacing={0}>
                <Grid>
                    <StatCard 
                        title="Communes"
                        value={statistiques.nombre_communes}
                        type="communes"
                        trend={2.5}
                    />
                </Grid>
                <Grid>
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

            {/* Section Principale - Graphique et Carte côte à côte */}
            <Grid container spacing={3} sx={{ mt: 2 }}>
              {/* Graphique d'évolution de la moyenne */}
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Évolution de la moyenne
                    </Typography>
                    <ProgressionMoyenne />
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Carte de la province */}
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardMedia
                    component="img"
                    height="300"
                    image="/carte.png"
                    alt="Carte de la province"
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent>
                    <Typography variant="h6" align="center">
                      {province.nom_province}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Section Comparaison des communes en haut à droite */}
            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12} md={6}>
                {/* Espace vide à gauche pour équilibrer la mise en page */}
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" gutterBottom>
                      Comparaison des communes
                    </Typography>
                    <Box sx={{ flexGrow: 1, minHeight: '400px' }}>
                      <ComparaisonCommunes idProvince={province.id_province} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Section Top 10 des établissements sur toute la largeur en dessous */}
            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Top 10 des établissements
                    </Typography>
                    <TopEtablissements anneeScolaire={selectedYear} />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
        </DashboardContainer>
    );
};

export default Dashboard;