import React, { useState, useEffect } from 'react';
import { Box, Grid, Card, CardContent, Typography, FormControl, InputLabel, Select, MenuItem, CircularProgress } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Bar, ComposedChart } from 'recharts';
import api, { apiEndpoints } from '../../services/api';

const ComparaisonAnnuelle = ({ etablissementId, anneeScolaire }) => {
  const [selectedAnnee, setSelectedAnnee] = useState('');
  const [anneesData, setAnneesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('moyenne'); // 'all', 'moyenne', 'tauxReussite'

  // Charger les données de comparaison annuelle depuis l'API
  useEffect(() => {
    if (!etablissementId) return;

    const fetchAnneesData = async () => {
      try {
        setLoading(true);
        // Récupérer uniquement les données d'évaluation annuelle pour cet établissement
        const response = await api.get(apiEndpoints.evaluationAnnuelle(etablissementId));
        if (
          response.data &&
          response.data.success &&
          response.data.data &&
          Array.isArray(response.data.data.evolution)
        ) {
          // Formater les données pour le graphique
          const donneesFormatees = response.data.data.evolution
            .map(item => ({
              annee: item.annee_scolaire || item.annee,
              moyenne: parseFloat(item.moyenne) || 0,
              tauxReussite: parseFloat(item.taux_reussite) || 0,
              classement: item.rang_commune || 0
            }))
            .sort((a, b) => a.annee.localeCompare(b.annee));
          setAnneesData(donneesFormatees);
          if (donneesFormatees.length > 0) {
            setSelectedAnnee(donneesFormatees[0].annee || '');
          }
        } else {
          setAnneesData([]);
          setSelectedAnnee('');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données de comparaison annuelle:', error);
        setAnneesData([]);
        setSelectedAnnee('');
      } finally {
        setLoading(false);
      }
    };
    fetchAnneesData();
  }, [etablissementId]);

  const handleAnneeChange = (event) => {
    setSelectedAnnee(event.target.value);
  };
  const handleMetricChange = (event) => {
    setSelectedMetric(event.target.value);
  }
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
        <Typography variant="body1" ml={2}>Chargement des données de comparaison annuelle...</Typography>
      </Box>
    );
  }
  if (!anneesData || anneesData.length === 0) {
    return (
      <Box textAlign="center" my={4}>
        <Typography variant="body1">Aucune donnée disponible pour la comparaison annuelle de cet établissement.</Typography>
      </Box>
    );
  }
  const selectedAnneeData = anneesData.find(a => a.annee === selectedAnnee) || anneesData[0];
  return (
    <Box sx={{ mt: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControl sx={{ mb: 2, minWidth: 220 }} size="small">
            <InputLabel id="metric-select-label">Métrique à afficher</InputLabel>
            <Select
              labelId="metric-select-label"
              value={selectedMetric}
              label="Métrique à afficher"
              onChange={handleMetricChange}
            >
              <MenuItem value="moyenne">Moyenne</MenuItem>
              <MenuItem value="tauxReussite">Taux de réussite</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Évolution annuelle</Typography>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={anneesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="annee" />
                  <YAxis yAxisId="left" domain={[0, 20]} tick={{ fill: '#8884d8' }} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fill: '#82ca9d' }} />
                  <Tooltip />
                  <Legend />
                  {(selectedMetric === 'all' || selectedMetric === 'moyenne') && (
                    <Line yAxisId="left" type="monotone" dataKey="moyenne" stroke="#8884d8" name="Moyenne annuelle" strokeWidth={2} />
                  )}
                  {(selectedMetric === 'all' || selectedMetric === 'tauxReussite') && (
                    <Line yAxisId="right" type="monotone" dataKey="tauxReussite" stroke="#82ca9d" name="Taux de réussite (%)" strokeWidth={2} />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        
      </Grid>
    </Box>
  );
};

export default ComparaisonAnnuelle;
