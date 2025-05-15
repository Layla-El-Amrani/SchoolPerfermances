import React, { useState, useEffect } from 'react';
import { Box, Grid, Card, CardContent, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import PageLoader from '../../PageLoader';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, RadialBarChart, RadialBar, LineChart, Line } from 'recharts';
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
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f7fafc 0%, #e3e6ec 100%)', py: { xs: 2, md: 6 }, px: { xs: 0, md: 4 } }}>
      <Box sx={{ mb: 4, px: { xs: 2, md: 8 } }}>
        <Typography variant="h6" fontWeight={600} color="#2B4C7E">Analyse par niveau</Typography>
      </Box>
      <Grid container spacing={0} sx={{ display: 'flex', flexWrap: 'nowrap', px: 0, gap: 2, justifyContent: 'center' }}>
        {/* Moyenne par niveau (RadarChart) */}
        <Grid item sx={{ minWidth: 0, width: '40%' }}>
          <Card sx={{ boxShadow: 3, borderRadius: 3, transition: '0.3s', ':hover': { boxShadow: 6 }, height: '100%' }}>
            <CardContent sx={{ p: { xs: 2, md: 4 } }}>
              <Typography variant="h6" fontWeight={600} color="#264653" gutterBottom>
                Moyenne par niveau
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={niveauxData} cx="50%" cy="50%" outerRadius="80%">
                  <PolarGrid stroke="#e0e0e0" />
                  <PolarAngleAxis dataKey="niveau" tick={{ fill: '#264653', fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 20]} tick={{ fill: '#888', fontWeight: 500 }} axisLine={false} tickLine={false} />
                  <Radar name="Moyenne" dataKey="moyenne" stroke="#F2B134" fill="#F2B134" fillOpacity={0.5} />
                  <Tooltip contentStyle={{ background: '#fff', borderRadius: 8, color: '#222', boxShadow: '0 2px 8px #e3e6ec' }} />
                  <Legend iconType="circle" />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        {/* Taux de réussite par niveau (LineChart) */}
        <Grid item sx={{ minWidth: 0, width: '40%' }}>
          <Card sx={{ boxShadow: 3, borderRadius: 3, transition: '0.3s', ':hover': { boxShadow: 6 }, height: '100%' }}>
            <CardContent sx={{ p: { xs: 2, md: 4 } }}>
              <Typography variant="h6" fontWeight={600} color="#264653" gutterBottom>
                Taux de réussite par niveau
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={niveauxData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
                  <defs>
                    <linearGradient id="colorTauxLine" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00796B" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#6FFFCB" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 6" stroke="#e0e0e0" />
                  <XAxis dataKey="niveau" axisLine={false} tickLine={false} stroke="#b0b3b8" />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} stroke="#b0b3b8" />
                  <Tooltip contentStyle={{ background: '#fff', borderRadius: 8, color: '#222', boxShadow: '0 2px 8px #e3e6ec' }} />
                  <Legend iconType="circle" />
                  <Area type="monotone" dataKey="tauxReussite" stroke="#00796B" fill="url(#colorTauxLine)" fillOpacity={0.3} name="Taux de réussite (%)" />
                  <Line type="monotone" dataKey="tauxReussite" stroke="#00796B" strokeWidth={3} dot={{ r: 6, fill: '#fff', stroke: '#00796B', strokeWidth: 2 }} name="Taux de réussite (%)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default NiveauxAnalysis;
