import React, { useState, useEffect } from 'react';
import { Box, Grid, Card, CardContent, Typography, FormControl, InputLabel, Select, MenuItem, CircularProgress } from '@mui/material';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, LineChart, Line, Area, Tooltip, Legend, ResponsiveContainer, CartesianGrid, XAxis, YAxis } from 'recharts';
import api from '../../../services/api';
import { apiEndpoints } from '../../../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const MatieresAnalysis = ({ etablissementId, anneeScolaire }) => {
  const [niveaux, setNiveaux] = useState([]);
  const [selectedNiveau, setSelectedNiveau] = useState('');
  const [selectedMatiere, setSelectedMatiere] = useState('');
  const [matieresData, setMatieresData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Charger les données des matières depuis l'API
  useEffect(() => {
    if (!etablissementId || !anneeScolaire) return;

    const fetchNiveauxEtMatieres = async () => {
      try {
        setLoading(true);
        // Récupérer la liste des niveaux
        const niveauxResponse = await api.get(apiEndpoints.statNiveau(etablissementId, anneeScolaire, 'all'));
        if (niveauxResponse.data && niveauxResponse.data.success && niveauxResponse.data.data.length > 0) {
          const niveauxList = niveauxResponse.data.data.map(n => ({
            code: n.code_niveau || n.id || '',
            nom: n.nom_niveau || n.libelle || n.code_niveau || n.id || ''
          }));
          setNiveaux(niveauxList);
          const firstNiveau = niveauxList[0];
          setSelectedNiveau(firstNiveau.code);
          // Charger les matières pour le premier niveau
          await fetchMatieresForNiveau(firstNiveau.code);
        } else {
          throw new Error('Aucun niveau disponible');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des niveaux/matières:', error);
        // En cas d'erreur, utiliser des données factices
        setNiveaux([{ code: '1', nom: '1ère Année' }]);
        setSelectedNiveau('1');
        const mockData = [
          { matiere: 'Mathématiques', moyenne: 16.2, tauxReussite: 92, notes: [12, 14, 16, 18, 20] },
          { matiere: 'Physique', moyenne: 14.5, tauxReussite: 85, notes: [10, 12, 15, 17, 19] },
          { matiere: 'SVT', moyenne: 15.8, tauxReussite: 88, notes: [11, 13, 16, 18, 19] },
          { matiere: 'Français', moyenne: 13.2, tauxReussite: 78, notes: [9, 11, 13, 15, 18] },
          { matiere: 'Anglais', moyenne: 14.9, tauxReussite: 82, notes: [10, 12, 15, 17, 20] },
        ];
        setMatieresData(mockData);
        setSelectedMatiere(mockData[0]?.matiere || '');
      } finally {
        setLoading(false);
      }
    };

    const fetchMatieresForNiveau = async (codeNiveau) => {
      try {
        setLoading(true);
        const response = await api.get(apiEndpoints.statMatiere(etablissementId, codeNiveau, anneeScolaire));
        if (response.data && response.data.success) {
          const matieres = (response.data.data || []).map(matiere => ({
            matiere: matiere.nom_matiere || '',
            moyenne: parseFloat(matiere.moyenne) || 0,
            tauxReussite: parseFloat(matiere.taux_reussite) || 0,
            notes: matiere.notes || []
          }));
          setMatieresData(matieres);
          if (matieres.length > 0) {
            setSelectedMatiere(matieres[0].matiere || '');
          }
        } else {
          throw new Error('Aucune donnée de matière disponible');
        }
      } catch (error) {
        // En cas d'erreur, utiliser des données factices
        const mockData = [
          { matiere: 'Mathématiques', moyenne: 16.2, tauxReussite: 92, notes: [12, 14, 16, 18, 20] },
          { matiere: 'Physique', moyenne: 14.5, tauxReussite: 85, notes: [10, 12, 15, 17, 19] },
          { matiere: 'SVT', moyenne: 15.8, tauxReussite: 88, notes: [11, 13, 16, 18, 19] },
          { matiere: 'Français', moyenne: 13.2, tauxReussite: 78, notes: [9, 11, 13, 15, 18] },
          { matiere: 'Anglais', moyenne: 14.9, tauxReussite: 82, notes: [10, 12, 15, 17, 20] },
        ];
        setMatieresData(mockData);
        setSelectedMatiere(mockData[0]?.matiere || '');
      } finally {
        setLoading(false);
      }
    };

    fetchNiveauxEtMatieres();
  }, [etablissementId, anneeScolaire]);

  // Handler pour changer de niveau
  const handleNiveauChange = async (event) => {
    const codeNiveau = event.target.value;
    setSelectedNiveau(codeNiveau);
    // Charger les matières pour ce niveau
    setLoading(true);
    try {
      const response = await api.get(apiEndpoints.statMatiere(etablissementId, codeNiveau, anneeScolaire));
      if (response.data && response.data.success) {
        const matieres = (response.data.data || []).map(matiere => ({
          matiere: matiere.nom_matiere || '',
          moyenne: parseFloat(matiere.moyenne) || 0,
          tauxReussite: parseFloat(matiere.taux_reussite) || 0,
          notes: matiere.notes || []
        }));
        setMatieresData(matieres);
        if (matieres.length > 0) {
          setSelectedMatiere(matieres[0].matiere || '');
        }
      } else {
        throw new Error('Aucune donnée de matière disponible');
      }
    } catch (error) {
      // En cas d'erreur, utiliser des données factices
      const mockData = [
        { matiere: 'Mathématiques', moyenne: 16.2, tauxReussite: 92, notes: [12, 14, 16, 18, 20] },
        { matiere: 'Physique', moyenne: 14.5, tauxReussite: 85, notes: [10, 12, 15, 17, 19] },
        { matiere: 'SVT', moyenne: 15.8, tauxReussite: 88, notes: [11, 13, 16, 18, 19] },
        { matiere: 'Français', moyenne: 13.2, tauxReussite: 78, notes: [9, 11, 13, 15, 18] },
        { matiere: 'Anglais', moyenne: 14.9, tauxReussite: 82, notes: [10, 12, 15, 17, 20] },
      ];
      setMatieresData(mockData);
      setSelectedMatiere(mockData[0]?.matiere || '');
    } finally {
      setLoading(false);
    }
  };

  const handleMatiereChange = (event) => {
    setSelectedMatiere(event.target.value);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
        <Typography variant="body1" ml={2}>Chargement des données des matières...</Typography>
      </Box>
    );
  }

  if (matieresData.length === 0) {
    return (
      <Box textAlign="center" my={4}>
        <Typography variant="body1">Aucune donnée disponible pour les matières de cet établissement.</Typography>
      </Box>
    );
  }

  const selectedMatiereData = matieresData.find(m => m.matiere === selectedMatiere);

  // Préparer les données pour le camembert
  const pieData = matieresData.map(matiere => ({
    name: matiere.matiere,
    value: matiere.moyenne
  }));

  return (
    <Box sx={{ mt: 0, minHeight: '100vh', background: 'linear-gradient(135deg, #f7fafc 0%, #e3e6ec 100%)', py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, px: { xs: 2, md: 8 } }}>
        <Box sx={{
          width: 56, height: 56, background: 'linear-gradient(135deg, #0088FE 30%, #00C49F 100%)',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2
        }}>
          <span role="img" aria-label="analyse" style={{ fontSize: 32, color: '#fff' }}>📊</span>
        </Box>
        <Typography variant="h4" fontWeight={700} color="#2B4C7E">Analyse des matières</Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, px: { xs: 2, md: 8 } }}>
        <FormControl variant="outlined" sx={{ minWidth: 200 }}>
          <InputLabel id="niveau-select-label">Niveau</InputLabel>
          <Select
            labelId="niveau-select-label"
            value={selectedNiveau}
            onChange={handleNiveauChange}
            label="Niveau"
          >
            {niveaux.map((niveau) => (
              <MenuItem key={niveau.code} value={niveau.code}>{niveau.nom}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
       <Grid container spacing={0} sx={{ display: 'flex', flexWrap: 'nowrap', px: 0, gap: 2, justifyContent: 'center' }}>
        {/* Moyenne par matière (RadarChart) */}
        <Grid item sx={{ minWidth: 0, width: '40%' }}>
          <Card sx={{ boxShadow: 3, borderRadius: 3, transition: '0.3s', ':hover': { boxShadow: 6 }, height: '100%' }}>
            <CardContent sx={{ p: { xs: 2, md: 4 } }}>
              <Typography variant="h6" fontWeight={600} color="#264653" gutterBottom>
                Moyenne par matière
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={matieresData} cx="50%" cy="50%" outerRadius="80%">
                  <PolarGrid stroke="#e0e0e0" />
                  <PolarAngleAxis dataKey="matiere" tick={{ fill: '#264653', fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 20]} tick={{ fill: '#888', fontWeight: 500 }} axisLine={false} tickLine={false} />
                  <Radar name="Moyenne" dataKey="moyenne" stroke="#F2B134" fill="#F2B134" fillOpacity={0.5} />
                  <Tooltip contentStyle={{ background: '#fff', borderRadius: 8, color: '#222', boxShadow: '0 2px 8px #e3e6ec' }} />
                  <Legend iconType="circle" />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        {/* Taux de réussite par matière (LineChart) */}
        <Grid item sx={{ minWidth: 0, width: '40%' }}>
          <Card sx={{ boxShadow: 3, borderRadius: 3, transition: '0.3s', ':hover': { boxShadow: 6 }, height: '100%' }}>
            <CardContent sx={{ p: { xs: 2, md: 4 } }}>
              <Typography variant="h6" fontWeight={600} color="#264653" gutterBottom>
                Taux de réussite par matière
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={matieresData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
                  <defs>
                    <linearGradient id="colorTauxLineMat" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00796B" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#6FFFCB" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 6" stroke="#e0e0e0" />
                  <XAxis dataKey="matiere" axisLine={false} tickLine={false} stroke="#b0b3b8" />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} stroke="#b0b3b8" />
                  <Tooltip contentStyle={{ background: '#fff', borderRadius: 8, color: '#222', boxShadow: '0 2px 8px #e3e6ec' }} />
                  <Legend iconType="circle" />
                  <Area type="monotone" dataKey="tauxReussite" stroke="#00796B" fill="url(#colorTauxLineMat)" fillOpacity={0.3} name="Taux de réussite (%)" />
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

export default MatieresAnalysis;
