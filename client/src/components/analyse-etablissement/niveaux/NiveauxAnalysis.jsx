import React, { useState, useEffect } from 'react';
import { Box, Grid, Card, CardContent, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import PageLoader from '../../PageLoader';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import api from '../../../services/api';
import { apiEndpoints } from '../../../services/api';

const NiveauxAnalysis = ({ etablissementId, anneeScolaire }) => {
  
  const [niveauxData, setNiveauxData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('moyenne');

  // Charger les données des niveaux depuis l'API
  useEffect(() => {
    if (!etablissementId || !anneeScolaire) return;

    const fetchNiveauxData = async () => {
      try {
        setLoading(true);
        // Récupérer les niveaux disponibles pour cet établissement
        const response = await api.get(apiEndpoints.statNiveau(etablissementId, anneeScolaire));
        
        console.log('Réponse complète de l\'API (niveaux):', response);
        console.log('Données brutes:', response.data);
        
        if (response.data && response.data.success) {
          // Formater les données pour correspondre à la structure attendue
          let niveaux = [];
          if (Array.isArray(response.data.data?.statistiques_niveaux) && response.data.data.statistiques_niveaux.length > 0) {
            // On extrait directement les infos utiles
            niveaux = response.data.data.statistiques_niveaux.map(n => {
              const nom = n.niveau?.nom_niveau || n.niveau?.libelle || n.niveau?.code_niveau || n.niveau?.id || '[Niveau inconnu]';
              console.log('Niveau brut:', n.niveau, 'Nom utilisé:', nom);
              return {
                niveau: nom,
                moyenne: parseFloat(n.moyenne) || 0,
                tauxReussite: parseFloat(n.taux_reussite) || 0,
                notes: n.notes || []
              };
            });
          } else if (Array.isArray(response.data.data?.niveaux) && response.data.data.niveaux.length > 0) {
            niveaux = response.data.data.niveaux.map(niveau => {
              const nom = niveau.nom_niveau || niveau.libelle || niveau.code_niveau || niveau.id || '[Niveau inconnu]';
              console.log('Niveau brut (fallback):', niveau, 'Nom utilisé:', nom);
              return {
                niveau: nom,
                moyenne: parseFloat(niveau.moyenne) || 0,
                tauxReussite: parseFloat(niveau.taux_reussite) || 0,
                notes: niveau.notes || []
              };
            });
          }
          console.log('Niveaux extraits:', niveaux);
          const niveauxFormates = niveaux;
          
          setNiveauxData(niveauxFormates);
        } else {
          // En cas d'erreur ou de données vides, utiliser des données factices pour la démo
          console.log('Utilisation des données factices car la réponse n\'est pas un tableau');
          const mockData = [
            { niveau: '1ère année', moyenne: 15.5, tauxReussite: 85, notes: [10, 12, 15, 18, 20] },
            { niveau: '2ème année', moyenne: 14.2, tauxReussite: 78, notes: [8, 11, 14, 16, 19] },
            { niveau: '3ème année', moyenne: 13.8, tauxReussite: 72, notes: [9, 10, 13, 15, 18] },
          ];
          setNiveauxData(mockData);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données des niveaux:', error);
        // En cas d'erreur, utiliser des données factices pour la démo
        const mockData = [
          { niveau: '1ère année', moyenne: 15.5, tauxReussite: 85, notes: [10, 12, 15, 18, 20] },
          { niveau: '2ème année', moyenne: 14.2, tauxReussite: 78, notes: [8, 11, 14, 16, 19] },
          { niveau: '3ème année', moyenne: 13.8, tauxReussite: 72, notes: [9, 10, 13, 15, 18] },
        ];
        setNiveauxData(mockData);
      } finally {
        setLoading(false);
      }
    };

    fetchNiveauxData();
  }, [etablissementId, anneeScolaire]);

  

  if (loading) {
    return (
      <PageLoader isLoading={true}>
        <Typography variant="body1">Chargement des données des niveaux...</Typography>
      </PageLoader>
    );
  }

  if (niveauxData.length === 0) {
    return (
      <Box textAlign="center" my={4}>
        <Typography variant="body1">Aucune donnée disponible pour les niveaux de cet établissement.</Typography>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ mt: 3, width: '100%' }}>
        <Grid container spacing={0} sx={{ display: 'flex', flexWrap: 'nowrap', alignItems: 'flex-start' }}>
          {/* Moyenne par niveau (BarChart horizontal) */}
          <Grid item xs={12} sm={6} md={6} sx={{ display: 'flex', minWidth: 0, width: '50%' }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Moyenne par niveau
                </Typography>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={niveauxData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="niveau" type="category" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="moyenne" fill="#F2B134" name="Moyenne" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          {/* Taux de réussite par niveau (BarChart vertical) */}
          <Grid item xs={12} sm={6} md={6} sx={{ display: 'flex', minWidth: 0, width: '50%' }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Taux de réussite par niveau
                </Typography>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={niveauxData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="niveau" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="tauxReussite" fill="#00796B" name="Taux de réussite (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default NiveauxAnalysis;
