import React, { useEffect, useRef, useState } from 'react';
import { Box, Card, CardContent, Typography, useTheme } from '@mui/material';
import EducationLoading from './EducationLoading';
import { Line } from 'react-chartjs-2';
import { api, apiEndpoints } from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Enregistrer les composants nécessaires
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler // Ajout du plugin Filler pour le remplissage sous la courbe
);



const ProgressionMoyenne = () => {
  // Tous les hooks doivent être appelés au début du composant
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const chartRef = useRef(null);
  const [hasData, setHasData] = useState(false);

  // Chargement des données
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Récupération des données de progression...');
        const response = await api.get(apiEndpoints.evolutionProvince);
        console.log('Réponse de l\'API:', response.data);
        
        if (response.data?.success && response.data.data) {
          const responseData = response.data.data;
          
          if (!responseData.province || !Array.isArray(responseData.statistiques)) {
            throw new Error('Format de données invalide');
          }
          
          const validStats = responseData.statistiques.filter(stat => 
            stat?.annee_scolaire && stat.moyenne_generale !== undefined
          );
          
          if (validStats.length === 0) {
            throw new Error('Aucune donnée valide disponible');
          }
          
          setData({
            province: responseData.province,
            statistiques: validStats
          });
          setHasData(true);
        } else {
          throw new Error(response.data?.message || 'Erreur lors du chargement des données');
        }
      } catch (err) {
        console.error('Erreur détaillée:', err);
        setError(`Erreur: ${err.message || 'Impossible de charger les données de progression'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Création d'un dégradé pour l'aire sous la courbe
  const createGradient = React.useCallback((ctx) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(63, 81, 181, 0.3)');
    gradient.addColorStop(1, 'rgba(63, 81, 181, 0.05)');
    return gradient;
  }, []);

  // Préparer les données du graphique avec useMemo pour optimiser les performances
  const chartData = React.useMemo(() => {
    if (!hasData || !data?.statistiques?.length) {
      return { labels: [], datasets: [] };
    }
    
    try {
      // Trier les statistiques par année scolaire pour un affichage cohérent
      const sortedStats = [...data.statistiques].sort((a, b) => 
        (a.annee_scolaire || '').localeCompare(b.annee_scolaire || '')
      );
      
      return {
        labels: sortedStats.map(item => item.annee_scolaire || 'N/A'),
        datasets: [
          {
            label: 'Moyenne Générale',
            data: sortedStats.map(item => parseFloat(item.moyenne_generale) || 0),
            borderColor: theme.palette.primary.main,
            backgroundColor: (context) => {
              const chart = context.chart;
              const { ctx, chartArea } = chart;
              if (!chartArea) return null;
              
              const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
              gradient.addColorStop(0, 'rgba(63, 81, 181, 0.1)');
              gradient.addColorStop(1, 'rgba(63, 81, 181, 0.4)');
              return gradient;
            },
            borderWidth: 3,
            pointBackgroundColor: theme.palette.primary.main,
            pointBorderColor: '#fff',
            pointHoverRadius: 6,
            pointHoverBorderWidth: 2,
            pointHoverBackgroundColor: theme.palette.primary.dark,
            pointHoverBorderColor: '#fff',
            pointHitRadius: 10,
            pointBorderWidth: 2,
            pointRadius: 4,
            fill: true,
            tension: 0.4,
          },
        ],
      };
    } catch (error) {
      console.error('Erreur lors de la préparation des données du graphique:', error);
      return { labels: [], datasets: [] };
    }
  }, [hasData, data, theme.palette.primary.main, theme.palette.primary.dark]);

  const options = React.useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'ÉVOLUTION DE LA MOYENNE PROVINCIALE',
        color: theme.palette.text.secondary,
        font: {
          size: 14,
          weight: '600',
          family: theme.typography.fontFamily,
        },
        padding: {
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 14,
          weight: '600',
          family: theme.typography.fontFamily,
        },
        bodyFont: {
          size: 14,
          weight: '500',
          family: theme.typography.fontFamily,
        },
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `${context.raw.toFixed(2)}/20`;
          },
          title: function(tooltipItems) {
            return `Année: ${tooltipItems[0].label}`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: theme.palette.text.secondary,
          font: {
            size: 12,
            weight: '500',
          }
        }
      },
      y: {
        beginAtZero: false,
        min: 0,
        max: 20,
        grid: {
          color: theme.palette.divider,
          drawBorder: false,
          borderDash: [5, 5],
        },
        ticks: {
          color: theme.palette.text.secondary,
          font: {
            size: 12,
            weight: '500',
          },
          callback: function(value) {
            return value + '/20';
          },
          maxTicksLimit: 6,
        },
        title: {
          display: true,
          text: 'Moyenne /20',
          color: theme.palette.text.secondary,
          font: {
            size: 12,
            weight: '500',
          },
          padding: { top: 0, left: 0, right: 0, bottom: 10 }
        }
      }
    },
    elements: {
      line: {
        borderCapStyle: 'round',
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    },
    layout: {
      padding: {
        top: 10,
        right: 20,
        bottom: 10,
        left: 20
      }
    }
  }), [theme]);

  // Rendu conditionnel
  if (loading) {
    return <EducationLoading message="Chargement des données de progression" />;
  }

  if (error) {
    return (
      <Box sx={{ p: 3, color: 'error.main' }}>
        <Typography>{error}</Typography>
      </Box>
    );
  }

  if (!hasData) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Aucune donnée disponible pour afficher la progression</Typography>
      </Box>
    );
  }

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: 2,
        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 25px 0 rgba(0,0,0,0.1)'
        }
      }}
    >
      <CardContent sx={{ 
        flexGrow: 1, 
        p: 3,
        '&:last-child': {
          pb: 3
        }
      }}>
        <Box sx={{ 
          height: 350,
          position: 'relative'
        }}>
          <Line 
            ref={chartRef}
            data={chartData}
            options={options}
            plugins={[{
              id: 'customCanvasBackgroundColor',
              beforeDraw: (chart) => {
                const { ctx, chartArea } = chart;
                if (!chartArea) return;
                
                ctx.save();
                ctx.globalCompositeOperation = 'destination-over';
                ctx.fillStyle = theme.palette.background.paper;
                ctx.fillRect(
                  chartArea.left,
                  chartArea.top,
                  chartArea.right - chartArea.left,
                  chartArea.bottom - chartArea.top
                );
                ctx.restore();
              }
            }]}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProgressionMoyenne;
