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
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { api, apiEndpoints } from '../services/api';
import EducationLoading from './EducationLoading';

// Styles pour les puces de cycle
const CycleChip = styled(Chip)(({ theme }) => ({
  fontWeight: 'bold',
  margin: theme.spacing(0.5),
  '&.PRIMAIRE': {
    backgroundColor: '#FFD54F',
    color: '#E65100',
  },
  '&.COLLEGE': {
    backgroundColor: '#81C784',
    color: '#1B5E20',
  },
  '&.LYCEE, &.LYCÉE': {
    backgroundColor: '#FFB74D',
    color: '#E65100',
  },
  '&.SECONDAIRE': {
    backgroundColor: '#FFF176',
    color: '#F57F17',
  },
  '&.QUALIFIANT, &.QUALIFICATION': {
    backgroundColor: '#A5D6A7',
    color: '#2E7D32',
  },
  '&.TECHNIQUE, &.PROFESSIONNEL': {
    backgroundColor: '#FFE082',
    color: '#E65100',
  }
}));

const TopEtablissementsCommune = ({ communeId, anneeScolaire }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les données des établissements
  useEffect(() => {
    const fetchData = async () => {
      if (!communeId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get(apiEndpoints.topEtablissementsCommune(communeId, anneeScolaire));
        console.log('Réponse API topEtablissementsCommune:', response);
        
        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          // S'assurer que nous avons bien un tableau avec des données
          if (response.data.data.length > 0) {
            setData(response.data.data);
          } else {
            console.log('Aucun établissement trouvé pour cette commune');
            setData([]);
          }
        } else {
          console.error('Format de réponse inattendu:', response.data);
          setError('Erreur lors du chargement des données');
          setData([]);
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
  }, [communeId, anneeScolaire]);

  if (loading) {
    return <EducationLoading message="Chargement des établissements" />;
  }

  if (error) {
    return (
      <Box p={3} color="error.main">
        <Typography>{error}</Typography>
      </Box>
    );
  }


  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0, boxSizing: 'border-box' }}>
      <Box mb={2} sx={{ flexShrink: 0 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
          Top 3 des établissements de la commune
          {anneeScolaire && (
            <Typography variant="caption" display="block" color="text.secondary">
              Année scolaire: {anneeScolaire}
            </Typography>
          )}
        </Typography>
      </Box>
      
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <TableContainer sx={{ flex: 1, overflow: 'auto', minHeight: '100%' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', width: '50px' }}>#</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Établissement</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', width: '100px' }}>Moyenne</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', width: '120px' }}>Taux de réussite</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', width: '80px' }}>Élèves</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.length > 0 ? (
                data.map((etablissement, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {etablissement.nom || 'Nom inconnu'}
                        </Typography>
                        {etablissement.cycle && (
                          <Box mt={1}>
                            <CycleChip 
                              label={etablissement.cycle} 
                              size="small"
                              className={etablissement.cycle.split(' ')[0].toUpperCase()}
                            />
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      {etablissement.moyenne_generale?.toFixed(2) || 'N/A'}
                    </TableCell>
                    <TableCell align="right">
                      {etablissement.taux_reussite ? `${etablissement.taux_reussite}%` : 'N/A'}
                    </TableCell>
                    <TableCell align="right">
                      {etablissement.nombre_eleves || 0}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Box>
                      <Typography variant="body1" color="textSecondary" gutterBottom>
                        Aucun établissement trouvé pour cette commune
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Vérifiez que des données sont disponibles pour l'année scolaire sélectionnée
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Paper>
  );
};

export default TopEtablissementsCommune;
