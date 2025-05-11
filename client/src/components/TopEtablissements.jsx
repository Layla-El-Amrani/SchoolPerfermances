import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid
} from '@mui/material';
import { api, apiEndpoints } from '../services/api';

const TopEtablissements = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anneeScolaire, setAnneeScolaire] = useState('2023-2024');
  const [anneesScolaires, setAnneesScolaires] = useState([]);

  // Charger les années scolaires disponibles
  useEffect(() => {
    const fetchAnneesScolaires = async () => {
      try {
        const response = await api.get(apiEndpoints.getAnneesScolaires);
        if (response.data?.success) {
          setAnneesScolaires(response.data.data || []);
          // Sélectionner l'année courante par défaut
          const anneeCourante = response.data.data.find(a => a.est_courante);
          if (anneeCourante) {
            setAnneeScolaire(anneeCourante.annee_scolaire);
          }
        }
      } catch (err) {
        console.error('Erreur lors du chargement des années scolaires:', err);
      }
    };

    fetchAnneesScolaires();
  }, []);

  // Charger les données des établissements
  useEffect(() => {
    const fetchData = async () => {
      if (!anneeScolaire) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const endpoint = apiEndpoints.topEtablissements(anneeScolaire);
        console.log('URL de l\'API appelée:', endpoint);
        
        const response = await api.get(endpoint);
        console.log('Réponse de l\'API:', response);
        
        if (response.data) {
          console.log('Données reçues:', response.data);
          setData(Array.isArray(response.data) ? response.data : []);
        } else {
          throw new Error('Format de réponse inattendu');
        }
      } catch (err) {
        console.error('Erreur lors de la récupération des données:', err);
        setError('Une erreur est survenue lors du chargement des données');
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [anneeScolaire]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3} color="error.main">
        <Typography>{error}</Typography>
      </Box>
    );
  }

  if (data.length === 0) {
    return (
      <Box p={3} textAlign="center">
        <Typography>Aucune donnée disponible pour le moment</Typography>
      </Box>
    );
  }

  const handleAnneeChange = (event) => {
    setAnneeScolaire(event.target.value);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Top 5 des établissements
        </Typography>
        
        <FormControl variant="outlined" size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="annee-scolaire-label">Année scolaire</InputLabel>
          <Select
            labelId="annee-scolaire-label"
            value={anneeScolaire}
            onChange={handleAnneeChange}
            label="Année scolaire"
          >
            {anneesScolaires.map((annee) => (
              <MenuItem key={annee.annee_scolaire} value={annee.annee_scolaire}>
                {annee.annee_scolaire}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Établissement</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Moyenne</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Élèves</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length > 0 ? (
              data.map((etablissement, index) => (
                <TableRow key={index} hover>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{etablissement.nom_etablissement || 'Nom inconnu'}</TableCell>
                  <TableCell align="right">
                    {typeof etablissement.moyenne_generale === 'number' 
                      ? etablissement.moyenne_generale.toFixed(2) 
                      : 'N/A'}
                  </TableCell>
                  <TableCell align="right">
                    {etablissement.nombre_eleves || 0}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Aucune donnée disponible
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      

    </Paper>
  );
};

export default TopEtablissements;
