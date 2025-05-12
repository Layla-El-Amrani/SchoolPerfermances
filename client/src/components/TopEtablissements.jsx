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
import EducationLoading from './EducationLoading';
import { api, apiEndpoints } from '../services/api';

// Fonction pour générer une couleur à partir d'une chaîne
const stringToColor = (string) => {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Générer des couleurs vives mais pas trop claires
  const hue = Math.abs(hash) % 360;
  const saturation = 70 + Math.abs(hash % 15); // 70-85%
  const lightness = 50 + Math.abs(hash % 10); // 50-60%
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

// Définition des couleurs avec des tons jaune, vert et orange
const cycleColors = {
  'PRIMAIRE': {
    backgroundColor: '#FFD54F', // Jaune vif
    textColor: '#E65100',
    hoverColor: '#FFC107'
  },
  'COLLEGE': {
    backgroundColor: '#81C784', // Vert clair
    textColor: '#1B5E20',
    hoverColor: '#66BB6A'
  },
  'LYCEE': {
    backgroundColor: '#FFB74D', // Orange clair
    textColor: '#E65100',
    hoverColor: '#FFA726'
  },
  'LYCÉE': {
    backgroundColor: '#FFB74D', // Orange clair (avec accent)
    textColor: '#E65100',
    hoverColor: '#FFA726'
  },
  'SECONDAIRE': {
    backgroundColor: '#FFF176', // Jaune pâle
    textColor: '#F57F17',
    hoverColor: '#FFEE58'
  },
  'QUALIFIANT': {
    backgroundColor: '#A5D6A7', // Vert très clair
    textColor: '#2E7D32',
    hoverColor: '#81C784'
  },
  'QUALIFICATION': {
    backgroundColor: '#A5D6A7', // Vert très clair (variante)
    textColor: '#2E7D32',
    hoverColor: '#81C784'
  },
  'TECHNIQUE': {
    backgroundColor: '#FFCC80', // Orange pâle
    textColor: '#E65100',
    hoverColor: '#FFB74D'
  },
  'PROFESSIONNEL': {
    backgroundColor: '#FFE082', // Jaune doré
    textColor: '#E65100',
    hoverColor: '#FFD54F'
  },
  'DEFAULT': {
    backgroundColor: '#E0E0E0', // Gris clair
    textColor: '#424242',
    hoverColor: '#BDBDBD'
  }
};

// Styles pour les puces de cycle
const CycleChip = styled(Chip)(({ theme, cycle = '' }) => {
  const upperCycle = cycle.toUpperCase().trim();
  
  // Trouver la configuration de couleur pour ce cycle
  const colorConfig = cycleColors[upperCycle] || cycleColors['DEFAULT'];
  
  // Si le cycle contient des mots-clés connus, utiliser la couleur correspondante
  if (!cycleColors[upperCycle]) {
    const cycleKeys = Object.keys(cycleColors);
    for (const key of cycleKeys) {
      if (key !== 'DEFAULT' && upperCycle.includes(key)) {
        Object.assign(colorConfig, cycleColors[key]);
        break;
      }
    }
  }

  return {
    backgroundColor: colorConfig.backgroundColor,
    color: colorConfig.textColor,
    fontWeight: 600,
    minWidth: 100,
    transition: 'all 0.2s ease-in-out',
    border: '1px solid rgba(0,0,0,0.1)',
    '& .MuiChip-label': {
      padding: '0 10px',
      textTransform: 'uppercase',
      fontSize: '0.7rem',
      letterSpacing: '0.5px',
    },
    '&:hover': {
      backgroundColor: colorConfig.hoverColor || colorConfig.backgroundColor,
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    },
    '&:active': {
      transform: 'translateY(0)',
    }
  };
});

const TopEtablissements = ({ anneeScolaire }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Effet pour recharger les données quand l'année scolaire change
  useEffect(() => {
    console.log('Année scolaire reçue dans TopEtablissements:', anneeScolaire);
  }, [anneeScolaire]);

  // Charger les données des établissements
  useEffect(() => {
    console.log('useEffect - anneeScolaire changée:', anneeScolaire);
    
    const fetchData = async () => {
      if (!anneeScolaire) {
        console.log('Année scolaire non définie, arrêt du chargement');
        return;
      }
      
      try {
        console.log('Début du chargement des données...');
        setLoading(true);
        setError(null);
        
        // Réinitialiser les données avant de charger les nouvelles
        setData([]);
        
        const endpoint = apiEndpoints.topEtablissements(anneeScolaire);
        console.log('URL de l\'API appelée:', endpoint);
        
        const response = await api.get(endpoint);
        console.log('Réponse de l\'API - status:', response.status, '- data:', response.data);
        
        if (response.data) {
          const responseData = Array.isArray(response.data) ? response.data : [];
          console.log('Données formatées:', responseData);
          console.log('Nombre d\'établissements reçus:', responseData.length);
          setData(responseData);
        } else {
          console.error('Format de réponse inattendu:', response);
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

  // Log des changements d'état
  useEffect(() => {
    console.log('État mis à jour - loading:', loading, 'data:', data, 'error:', error);
  }, [loading, data, error]);

  if (loading) {
    console.log('Rendu: Affichage du composant de chargement');
    return <EducationLoading message="Chargement des établissements" />;
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
        <Typography variant="body1" color="textSecondary" gutterBottom>
          Aucune donnée disponible pour le moment
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Le classement nécessite des données de résultats pour plusieurs établissements.
        </Typography>
        {anneeScolaire && (
          <Typography variant="caption" color="textSecondary" display="block" mt={1}>
            (Année scolaire: {anneeScolaire})
          </Typography>
        )}
      </Box>
    );
  }



  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
      <Box mb={3}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Top 10 des établissements
          {anneeScolaire && (
            <Typography variant="caption" display="block" color="text.secondary">
              Année scolaire: {anneeScolaire}
            </Typography>
          )}
        </Typography>
      </Box>
      
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Établissement</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Commune</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Cycle</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Moyenne</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Élèves</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length > 0 ? (
              data.map((etablissement, index) => (
                <TableRow key={index} hover>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{etablissement.nom || 'Nom inconnu'}</TableCell>
                  <TableCell>{etablissement.commune || 'Inconnue'}</TableCell>
                  <TableCell>
                    {etablissement.cycle ? (
                      <CycleChip 
                        label={etablissement.cycle} 
                        size="small"
                        cycle={etablissement.cycle}
                        title={`Cycle: ${etablissement.cycle}`}
                      />
                    ) : (
                      <span>NC</span>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {typeof etablissement.moyenne === 'number' 
                      ? etablissement.moyenne.toFixed(2) 
                      : 'N/A'}
                  </TableCell>
                  <TableCell align="right">
                    {etablissement.nombre_eleves || 0}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 2 }}>
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
