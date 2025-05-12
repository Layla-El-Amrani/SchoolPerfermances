import React, { useState, useEffect } from 'react';
import { Box, Grid, Card, CardContent, Typography, FormControl, InputLabel, Select, MenuItem, CircularProgress } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import api from '../../../services/api';
import { apiEndpoints } from '../../../services/api';

const NiveauxAnalysis = ({ etablissementId, anneeScolaire }) => {
  const [selectedNiveau, setSelectedNiveau] = useState('');
  const [niveauxData, setNiveauxData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Charger les données des niveaux depuis l'API
  useEffect(() => {
    if (!etablissementId || !anneeScolaire) return;

    const fetchNiveauxData = async () => {
      try {
        setLoading(true);
        // Récupérer les niveaux disponibles pour cet établissement
        const response = await api.get(apiEndpoints.statNiveau(etablissementId, anneeScolaire, 'all'));
        
        console.log('Réponse complète de l\'API (niveaux):', response);
        console.log('Données brutes:', response.data);
        
        if (response.data && response.data.success) {
          // Formater les données pour correspondre à la structure attendue
          const niveaux = Array.isArray(response.data.data) ? response.data.data : [];
          console.log('Niveaux extraits:', niveaux);
          const niveauxFormates = niveaux.map(niveau => ({
            niveau: niveau.nom_niveau || '',
            moyenne: parseFloat(niveau.moyenne) || 0,
            tauxReussite: parseFloat(niveau.taux_reussite) || 0,
            notes: niveau.notes || []
          }));
          
          setNiveauxData(niveauxFormates);
          if (niveauxFormates.length > 0) {
            setSelectedNiveau(niveauxFormates[0].niveau || '');
          }
        } else {
          // En cas d'erreur ou de données vides, utiliser des données factices pour la démo
          console.log('Utilisation des données factices car la réponse n\'est pas un tableau');
          const mockData = [
            { niveau: '1ère année', moyenne: 15.5, tauxReussite: 85, notes: [10, 12, 15, 18, 20] },
            { niveau: '2ème année', moyenne: 14.2, tauxReussite: 78, notes: [8, 11, 14, 16, 19] },
            { niveau: '3ème année', moyenne: 13.8, tauxReussite: 72, notes: [9, 10, 13, 15, 18] },
          ];
          setNiveauxData(mockData);
          setSelectedNiveau(mockData[0]?.niveau || '');
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
        setSelectedNiveau(mockData[0]?.niveau || '');
      } finally {
        setLoading(false);
      }
    };

    fetchNiveauxData();
  }, [etablissementId, anneeScolaire]);

  const handleNiveauChange = (event) => {
    setSelectedNiveau(event.target.value);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
        <Typography variant="body1" ml={2}>Chargement des données des niveaux...</Typography>
      </Box>
    );
  }

  if (niveauxData.length === 0) {
    return (
      <Box textAlign="center" my={4}>
        <Typography variant="body1">Aucune donnée disponible pour les niveaux de cet établissement.</Typography>
      </Box>
    );
  }

  const selectedNiveauData = niveauxData.find(n => n.niveau === selectedNiveau);

  return (
    <Box sx={{ mt: 3 }}>
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Niveau</InputLabel>
        <Select
          value={selectedNiveau}
          onChange={handleNiveauChange}
          label="Niveau"
        >
          {niveauxData.map((niveau) => (
            <MenuItem key={niveau.niveau} value={niveau.niveau}>
              {niveau.niveau}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Moyenne par niveau</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={niveauxData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="niveau" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="moyenne" fill="#8884d8" name="Moyenne" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Taux de réussite par niveau</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={niveauxData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="niveau" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="tauxReussite" stroke="#82ca9d" name="Taux de réussite %" />
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
