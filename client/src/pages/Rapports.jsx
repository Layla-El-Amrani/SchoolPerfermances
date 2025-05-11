import React, { useState, useEffect } from 'react';
import { Snackbar, Alert, CircularProgress } from '@mui/material';
import { 
  Box, 
  Typography, 
  Grid, 
  Button, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Paper,
  Tabs,
  Tab,
  Checkbox,
  FormControlLabel,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Radio,
  RadioGroup,
  FormLabel
} from '@mui/material';
import { 
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { api, apiEndpoints } from '../services/api';
import { styled } from '@mui/material/styles';

// Styles personnalisés
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '12px',
  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
  marginBottom: theme.spacing(3),
}));

const StyledButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  borderRadius: '8px',
  padding: '8px 20px',
  fontWeight: 500,
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '0.95rem',
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

// Données de démonstration pour les rapports générés
const demoGeneratedReports = [
  { id: 1, nom: 'Rapport Etablissement 2024', type: 'Établissement', date: '2024-05-10', format: 'PDF' },
  { id: 2, nom: 'Rapport Commune 2024', type: 'Commune', date: '2024-05-09', format: 'Excel' },
  { id: 3, nom: 'Rapport Province 2024', type: 'Province', date: '2024-05-08', format: 'PDF' },
];

// Composant principal des rapports
const Rapports = () => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };
  
  // États pour la navigation entre les onglets
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // États pour l'onglet de génération de rapport
  const [step, setStep] = useState(0);
  const [selectedYear, setSelectedYear] = useState('');
  const [reportType, setReportType] = useState('etablissement');
  const [selectedEntity, setSelectedEntity] = useState('');
  const [reportOptions, setReportOptions] = useState({
    includeGeneralStats: true,
    includeLevelStats: true,
    includeSubjectStats: true,
    includeCharts: true
  });
  const [exportFormat, setExportFormat] = useState('pdf');
  
  // États pour l'onglet des rapports générés
  const [generatedReports, setGeneratedReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Données pour les sélecteurs
  const [years, setYears] = useState([]);
  const [entities, setEntities] = useState([]);
  
  // Charger les données initiales
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        // Charger les années scolaires
        const yearsResponse = await api.get(apiEndpoints.getAnneesScolaires);
        setYears(yearsResponse.data);
        
        // Charger les entités selon le type de rapport
        await loadEntities();
        
        // Charger l'historique des rapports
        await loadGeneratedReports();
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        showSnackbar('Veuillez sélectionner une année scolaire', 'warning');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, [reportType]);
  
  // Charger les entités selon le type de rapport
  const loadEntities = async () => {
    try {
      let endpoint = '';
      
      switch(reportType) {
        case 'etablissement':
          endpoint = apiEndpoints.getEtablissements;
          break;
        case 'commune':
          endpoint = apiEndpoints.getCommunes;
          break;
        case 'province':
          endpoint = apiEndpoints.getProvinces;
          break;
        default:
          return;
      }
      
      const response = await api.get(endpoint);
      setEntities(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des entités:', error);
      showSnackbar('Erreur lors du chargement des entités. Veuillez réessayer.', 'error');
    }
  };
  
  // Charger l'historique des rapports générés
  const loadGeneratedReports = async () => {
    try {
      // Utiliser des données factices pour le moment car l'endpoint n'existe pas
      const mockReports = [
        { id: 1, nom: 'Rapport Établissement 2024', type: 'etablissement', date: '2024-05-10', format: 'PDF' },
        { id: 2, nom: 'Rapport Commune 2023', type: 'commune', date: '2023-05-15', format: 'Excel' },
        { id: 3, nom: 'Rapport Province 2024', type: 'province', date: '2024-01-20', format: 'PDF' },
      ];
      setGeneratedReports(mockReports);
    } catch (error) {
      console.error('Erreur lors du chargement des rapports:', error);
      showSnackbar('Erreur lors du chargement des rapports. Veuillez réessayer.', 'error');
    }
  };

  // Gérer le changement d'étape
  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  // Gérer la génération du rapport
  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      
      // Préparer les données pour l'API
      const reportData = {
        type_rapport: reportType,
        id_entite: selectedEntity,
        annee_scolaire: selectedYear,
        options: reportOptions,
        format: exportFormat
      };
      
      // Simulation de la génération d'un rapport
      const newReport = {
        id: Date.now(),
        nom: `Rapport ${reportType} ${selectedYear}`,
        type: reportType,
        date: new Date().toISOString().split('T')[0],
        format: exportFormat
      };
      
      // Ajouter le nouveau rapport à la liste
      setGeneratedReports([newReport, ...generatedReports]);
      
      // Afficher un message de succès
      showSnackbar('Rapport généré avec succès', 'success');
      
      // Simuler un téléchargement
      const blob = new Blob([`Rapport ${reportType} ${selectedYear}`], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport_${reportType}_${selectedYear}.${exportFormat.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Réinitialiser le formulaire
      setStep(0);
      setSelectedYear('');
      setSelectedEntity('');
      
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
      showSnackbar('Erreur lors de la génération du rapport', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Gérer la suppression d'un rapport
  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) return;
    
    try {
      setLoading(true);
      
      // Simuler la suppression d'un rapport
      setGeneratedReports(generatedReports.filter(r => r.id !== reportId));
      
      showSnackbar('Rapport supprimé avec succès', 'success');
    } catch (error) {
      console.error('Erreur lors de la suppression du rapport:', error);
      showSnackbar('Erreur lors de la suppression du rapport', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les rapports générés
  const filteredReports = generatedReports.filter(report => 
    report.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (report.date && new Date(report.date).toLocaleDateString().includes(searchTerm))
  );

  // Rendu du formulaire de génération de rapport
  const renderReportForm = () => {
    switch(step) {
      case 0: // Sélection de l'année scolaire
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Sélectionnez l'année scolaire
            </Typography>
            <FormControl fullWidth margin="normal">
              <InputLabel id="year-select-label">Année Scolaire</InputLabel>
              <Select
                labelId="year-select-label"
                id="year-select"
                value={selectedYear}
                label="Année Scolaire"
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {years.map((year) => (
                  <MenuItem key={year.id_annee} value={year.annee_scolaire}>
                    {year.annee_scolaire}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <StyledButton 
                variant="contained" 
                color="primary" 
                onClick={handleNext}
                disabled={!selectedYear || loading}
                endIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                Suivant
              </StyledButton>
            </Box>
          </Box>
        );
        
      case 1: // Sélection du type de rapport et de l'entité
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Sélectionnez le type de rapport
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="report-type-label">Type de Rapport</InputLabel>
                  <Select
                    labelId="report-type-label"
                    id="report-type"
                    value={reportType}
                    label="Type de Rapport"
                    onChange={(e) => setReportType(e.target.value)}
                  >
                    <MenuItem value="etablissement">Établissement</MenuItem>
                    <MenuItem value="commune">Commune</MenuItem>
                    <MenuItem value="province">Province</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="entity-select-label">
                    {reportType === 'etablissement' ? 'Établissement' : 
                     reportType === 'commune' ? 'Commune' : 'Province'}
                  </InputLabel>
                  <Select
                    labelId="entity-select-label"
                    id="entity-select"
                    value={selectedEntity}
                    label={reportType === 'etablissement' ? 'Établissement' : 
                           reportType === 'commune' ? 'Commune' : 'Province'}
                    onChange={(e) => setSelectedEntity(e.target.value)}
                  >
                    {entities.map((entity) => (
                      <MenuItem key={entity.id} value={entity.id}>
                        {entity.nom}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <StyledButton 
                onClick={handleBack}
                variant="outlined"
                disabled={loading}
              >
                Retour
              </StyledButton>
              <StyledButton 
                variant="contained" 
                color="primary" 
                onClick={handleNext}
                disabled={!selectedEntity || loading}
                endIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                Suivant
              </StyledButton>
            </Box>
          </Box>
        );
        
      case 2: // Options du rapport
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Options du rapport
            </Typography>
            <FormGroup>
              <FormControlLabel 
                control={
                  <Checkbox 
                    checked={reportOptions.includeGeneralStats} 
                    onChange={(e) => setReportOptions({...reportOptions, includeGeneralStats: e.target.checked})} 
                  />
                } 
                label="Inclure les statistiques générales" 
              />
              <FormControlLabel 
                control={
                  <Checkbox 
                    checked={reportOptions.includeLevelStats} 
                    onChange={(e) => setReportOptions({...reportOptions, includeLevelStats: e.target.checked})} 
                  />
                } 
                label="Inclure les statistiques par niveau" 
              />
              <FormControlLabel 
                control={
                  <Checkbox 
                    checked={reportOptions.includeSubjectStats} 
                    onChange={(e) => setReportOptions({...reportOptions, includeSubjectStats: e.target.checked})} 
                  />
                } 
                label="Inclure les statistiques par matière" 
              />
              <FormControlLabel 
                control={
                  <Checkbox 
                    checked={reportOptions.includeCharts} 
                    onChange={(e) => setReportOptions({...reportOptions, includeCharts: e.target.checked})} 
                  />
                } 
                label="Inclure les graphiques" 
              />
            </FormGroup>
            
            <Box sx={{ mt: 3, mb: 3 }}>
              <FormLabel component="legend">Format d'export</FormLabel>
              <RadioGroup 
                row 
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
              >
                <FormControlLabel value="pdf" control={<Radio />} label="PDF" />
                <FormControlLabel value="excel" control={<Radio />} label="Excel" />
              </RadioGroup>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <StyledButton 
                onClick={handleBack}
                variant="outlined"
                disabled={loading}
              >
                Retour
              </StyledButton>
              <StyledButton 
                variant="contained" 
                color="primary" 
                onClick={handleGenerateReport}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {loading ? 'Génération...' : 'Générer le rapport'}
              </StyledButton>
            </Box>
          </Box>
        );
        
      default:
        return null;
    }
  };

  // Rendu de l'onglet des rapports générés
  const renderGeneratedReports = () => (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <TextField
          label="Rechercher un rapport"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Format</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredReports.map((report) => (
              <StyledTableRow key={report.id}>
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {report.nom}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={report.type} 
                    size="small" 
                    color="primary"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{new Date(report.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Chip 
                    label={report.format} 
                    size="small"
                    color={report.format === 'PDF' ? 'error' : 'success'}
                    sx={{ minWidth: 70 }}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton 
                    color="primary" 
                    onClick={() => alert(`Télécharger le rapport ${report.id}`)}
                  >
                    <DownloadIcon />
                  </IconButton>
                  <IconButton 
                    color="error" 
                    onClick={() => handleDeleteReport(report.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
          Gestion des Rapports
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Générez et gérez vos rapports d'analyse des performances scolaires
        </Typography>
      </Box>
      
      <StyledPaper elevation={0}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          sx={{
            mb: 3,
            '& .MuiTabs-indicator': {
              height: 4,
              borderRadius: '4px 4px 0 0',
            },
          }}
        >
          <StyledTab label="Générer un rapport" />
          <StyledTab label="Historique des rapports" />
        </Tabs>
        
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
          {loading ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : activeTab === 0 ? (
            renderReportForm()
          ) : (
            renderGeneratedReports()
          )}
        </Box>
      </StyledPaper>

      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Rapports;
