import React, { useState, useEffect, useCallback } from 'react';
import { Snackbar, Alert, CircularProgress, Container, Card, CardContent, CardActions, Tooltip, TablePagination } from '@mui/material';
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
  VisibilityOff as VisibilityOffIcon,
  Assessment as AssessmentIcon,
  BarChart as BarChartIcon,
  ListAlt as ListAltIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  PictureAsPdf as PictureAsPdfIcon,
  AssessmentOutlined as AssessmentOutlinedIcon
} from '@mui/icons-material';
import { api, apiEndpoints } from '../services/api';
import { styled, useTheme } from '@mui/material/styles';
import InitialPageLoadIndicator from '../components/InitialPageLoadIndicator';

// Styles principaux
const MainReportsCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(0),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[3],
  marginTop: theme.spacing(3),
  overflow: 'hidden',
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
    height: '3px',
  },
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  minWidth: 180, 
  fontWeight: theme.typography.fontWeightMedium,
  marginRight: theme.spacing(1),
  padding: theme.spacing(1.5, 2.5),
  borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
  color: theme.palette.text.secondary,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    color: theme.palette.text.primary,
  },
  '&.Mui-selected': {
    color: theme.palette.primary.main,
    fontWeight: theme.typography.fontWeightBold,
    backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[800],
  },
  '& .MuiTab-wrapper': { 
    flexDirection: 'row',
    alignItems: 'center',
  },
  '& .MuiSvgIcon-root': { 
    marginRight: theme.spacing(1),
    marginBottom: '0 !important',
    fontSize: '1.25rem',
  }
}));

const TabPanelContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.default, 
}));

const StyledButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  borderRadius: '8px',
  padding: '10px 20px',
  fontWeight: 500,
  '&:hover': {
    boxShadow: theme.shadows[2],
  }
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
  '& td, & th': {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  '& td:not(:last-child), & th:not(:last-child)': {
    borderRight: `1px solid ${theme.palette.divider}`,
  }
}));

const SectionCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2.5),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  border: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
}));

// Composant principal des rapports
const Rapports = () => {
  const theme = useTheme();
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
  const [selectedYear, setSelectedYear] = useState('');
  const [reportType, setReportType] = useState('');
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
  
  // Pagination pour la liste des rapports
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  // Données pour les sélecteurs
  const [years, setYears] = useState([]);
  const [entities, setEntities] = useState([]);
  
  // Charger les données initiales
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const yearsResponse = await api.get(apiEndpoints.getAnneesScolaires);
        // Log pour débogage
        console.log('Réponse API pour années scolaires:', yearsResponse.data);

        let fetchedYears = [];
        if (Array.isArray(yearsResponse.data)) { // Si la réponse est directement un tableau
            fetchedYears = yearsResponse.data;
        } else if (yearsResponse.data && Array.isArray(yearsResponse.data.annees)) { // Structure { annees: [...] }
            fetchedYears = yearsResponse.data.annees;
        } else if (yearsResponse.data && yearsResponse.data.data && Array.isArray(yearsResponse.data.data.annees)) { // Structure { data: { annees: [...] } }
            fetchedYears = yearsResponse.data.data.annees;
        } else if (yearsResponse.data && yearsResponse.data.success && Array.isArray(yearsResponse.data.data)) { // Structure { success: true, data: [...] } où data est le tableau d'années
            fetchedYears = yearsResponse.data.data;
        } else {
            console.warn("Structure de réponse inattendue pour les années scolaires:", yearsResponse.data);
        }
        setYears(fetchedYears);
        
        if (reportType) {
            await loadEntities(reportType);
        }
        
        await loadGeneratedReports();
      } catch (error) {
        console.error('Erreur lors du chargement des données initiales:', error);
        showSnackbar('Erreur lors du chargement des données initiales.', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, []);
  
  // Charger les entités quand le type de rapport change
  const loadEntities = useCallback(async (currentReportType) => {
    if (!currentReportType || currentReportType === 'general') {
        setEntities([]);
        setSelectedEntity('');
        return;
    }
    setLoading(true);
    try {
      let endpoint = '';
      let dataKey = '';
      let addAllOption = false;
      let allOptionLabel = '';
      
      switch(currentReportType) {
        case 'etablissement':
          endpoint = apiEndpoints.getEtablissements;
          dataKey = 'etablissements';
          addAllOption = true;
          allOptionLabel = 'Tous les établissements';
          break;
        case 'commune':
          endpoint = apiEndpoints.getCommunes;
          dataKey = 'communes';
          addAllOption = true;
          allOptionLabel = 'Toutes les communes';
          break;
        case 'province':
          endpoint = apiEndpoints.getProvinces;
          dataKey = 'provinces';
          // addAllOption = false; // Généralement, on ne veut pas "toutes les provinces" en une fois.
          break;
        default:
          setEntities([]);
          setLoading(false);
          return;
      }
      
      const response = await api.get(endpoint);
      let fetchedEntities = [];
      if (response.data && response.data.success && Array.isArray(response.data[dataKey])) {
        fetchedEntities = response.data[dataKey];
      } else if (Array.isArray(response.data)) { 
        fetchedEntities = response.data;
      } else {
        console.warn('Structure de données inattendue pour les entités:', response.data);
        setEntities([]);
        showSnackbar('Format de données d\'entités inattendu.', 'warning');
        setLoading(false);
        return;
      }

      if (addAllOption) {
        // Adapter la structure de l'objet "Tous" pour qu'elle corresponde à celle des autres entités
        // Ici, je suppose que les entités ont au moins un champ `id` et un champ pour le nom.
        // Si la structure est entity.code_etab, entity.nom_etab_fr, etc.
        // il faudra utiliser les clés appropriées.
        // Pour être générique, je vais essayer de détecter les clés communes ou utiliser des valeurs par défaut.
        // Ou, plus simplement, utiliser un format fixe pour l'option "Tous" que le Select peut gérer.
        const idKey = fetchedEntities.length > 0 ? (Object.keys(fetchedEntities[0]).find(k => k.toLowerCase().includes('id') || k.toLowerCase().includes('code'))) : 'id';
        const nameKey = fetchedEntities.length > 0 ? (Object.keys(fetchedEntities[0]).find(k => k.toLowerCase().includes('nom') || k.toLowerCase().includes('name') || k.toLowerCase().includes('label'))) : 'nom';
        
        let allOption = { [idKey]: 'all', [nameKey]: allOptionLabel };
        // Assurer que l'option "all" a les clés attendues par le MenuItem, même si elles sont vides ailleurs.
        // Par exemple, si le MenuItem utilise entity.cd_com et entity.ll_com :
        if (currentReportType === 'commune') allOption = { cd_com: 'all', ll_com: allOptionLabel };
        else if (currentReportType === 'etablissement') allOption = { code_etab: 'all', nom_etab_fr: allOptionLabel };
        // Pour province, on ne met pas d'option "Tous" pour l'instant

        setEntities([allOption, ...fetchedEntities]);
      } else {
        setEntities(fetchedEntities);
      }

    } catch (error) {
      console.error('Erreur lors du chargement des entités:', error);
      showSnackbar('Erreur lors du chargement des entités. Veuillez réessayer.', 'error');
      setEntities([]);
    } finally {
        setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    if (reportType) {
        loadEntities(reportType);
        setSelectedEntity('');
    }
  }, [reportType, loadEntities]);
  
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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleReportTypeChange = (event) => {
    const newReportType = event.target.value;
    setReportType(newReportType);

    // Réinitialiser les options de contenu si le type n'est pas 'etablissement'
    if (newReportType !== 'etablissement') {
      setReportOptions(prevOptions => ({
        ...prevOptions,
        includeLevelStats: false,
        includeSubjectStats: false,
      }));
    }
  };

  const handleOptionChange = (event) => {
    setReportOptions({ ...reportOptions, [event.target.name]: event.target.checked });
  };

  // Gérer la génération du rapport
  const handleGenerateReport = async (e) => {
    if (e) e.preventDefault();

      setLoading(true);
    try {
      // 1. Préparer les données pour l'API backend
      const reportPayload = {
        annee_scolaire: selectedYear,
        type_rapport: reportType,
        id_entite: selectedEntity || null,
        options: reportOptions,
        format: exportFormat
      };
      
      // 2. Appeler l'API backend (remplacer par votre véritable endpoint)
      const response = await api.post(apiEndpoints.generateRapport, reportPayload, {
        responseType: 'blob',
      });

      // 3. Gérer la réponse et proposer le téléchargement
      const filename = `rapport_${reportType}_${selectedYear || 'global'}${selectedEntity ? '_'+selectedEntity : ''}.${exportFormat}`;
      const contentType = exportFormat === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

      const blob = new Blob([response.data], { type: contentType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showSnackbar('Rapport généré et téléchargé avec succès!', 'success');
      
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
      if (error.response && error.response.data && typeof error.response.data === 'object') {
        const errorData = error.response.data;
        showSnackbar(errorData.message || 'Erreur lors de la génération du rapport', 'error');
      } else if (error.response && error.response.statusText) {
        showSnackbar(`Erreur serveur: ${error.response.statusText}`, 'error');
      }else {
        showSnackbar('Erreur inconnue lors de la génération du rapport. Vérifiez la console.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // Gérer la suppression d'un rapport
  const handleDeleteReport = (reportId) => {
    setGeneratedReports(generatedReports.filter(report => report.id !== reportId));
    showSnackbar('Rapport supprimé avec succès', 'info');
  };

  const handleDownloadReport = (report) => {
    // Simuler un téléchargement pour l'instant
    const blob = new Blob([`Contenu du rapport: ${report.nom}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport_${report.type}_${report.date}.${report.format.toLowerCase()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showSnackbar(`Téléchargement du rapport "${report.nom}"`, 'info');
  };
  
  // Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredReports = generatedReports.filter(report => 
    report.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedReports = filteredReports.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Rendu du formulaire de génération de rapport
  const renderReportForm = () => {
    const isEntitySelectionNeeded = reportType && reportType !== 'general';

        return (
      <Box component="form" onSubmit={handleGenerateReport}>
        {/* Section 1: Année Scolaire et Type de Rapport */}
        <SectionCard>
          <Typography variant="h6" gutterBottom>Configuration Initiale</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="year-select-label">Année Scolaire</InputLabel>
              <Select
                labelId="year-select-label"
                value={selectedYear}
                label="Année Scolaire"
                onChange={(e) => setSelectedYear(e.target.value)}
                  disabled={loading || years.length === 0}
                  required 
              >
                  {years.map((yearObj) => (
                    <MenuItem key={yearObj.annee_scolaire} value={yearObj.annee_scolaire}>
                      {yearObj.annee_scolaire}
                  </MenuItem>
                ))}
              </Select>
                {years.length === 0 && !loading && <Typography variant="caption" color="textSecondary">Aucune année disponible.</Typography>}
            </FormControl>
            </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="report-type-label">Type de Rapport</InputLabel>
                  <Select
                    labelId="report-type-label"
                    value={reportType}
                    label="Type de Rapport"
                  onChange={handleReportTypeChange}
                  required 
                >
                  <MenuItem value="general">Rapport Général (Province/Global)</MenuItem>
                  <MenuItem value="etablissement">Rapport par Établissement</MenuItem>
                  <MenuItem value="commune">Rapport par Commune</MenuItem>
                  <MenuItem value="province">Rapport par Province Spécifique</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
          </Grid>
        </SectionCard>

        {/* Section 2: Sélection de l'Entité (si nécessaire) */}
        {isEntitySelectionNeeded && (
          <SectionCard>
            <Typography variant="h6" gutterBottom>Sélection de l'Entité ({reportType})</Typography>
            <FormControl fullWidth margin="normal" disabled={loading || entities.length === 0}>
              <InputLabel id="entity-select-label">Sélectionner l'Entité</InputLabel>
                  <Select
                    labelId="entity-select-label"
                    value={selectedEntity}
                label="Sélectionner l'Entité"
                    onChange={(e) => setSelectedEntity(e.target.value)}
                required={isEntitySelectionNeeded}
                  >
                {entities.map((entity) => {
                  const entityId = entity.id || entity.cd_com || entity.code_etab || entity.code_province;
                  const entityName = entity.nom || entity.ll_com || entity.nom_etab_fr || entity.nom_province_fr;
                  return (
                    <MenuItem key={entityId} value={entityId}>
                      {entityName || `Entité ${entityId}`}
                    </MenuItem>
                  );
                })}
              </Select>
              {entities.length === 0 && !loading && reportType && reportType !== 'general' && (
                <Typography variant="caption" color="textSecondary">Aucune entité disponible pour ce type.</Typography>
              )}
            </FormControl>
          </SectionCard>
        )}

        {/* Section 3: Contenu du Rapport */}
        <SectionCard>
          <Typography variant="h6" gutterBottom>Contenu du Rapport</Typography>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={6}>
              <FormControlLabel 
                control={<Checkbox checked={reportOptions.includeGeneralStats} onChange={handleOptionChange} name="includeGeneralStats" />}
                label="Statistiques Générales"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel 
                control={
                  <Checkbox 
                    checked={reportOptions.includeLevelStats} 
                    onChange={handleOptionChange} 
                    name="includeLevelStats" 
                    disabled={reportType !== 'etablissement'} // Désactiver si non pertinent
                  />}
                label="Statistiques par Niveau"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel 
                control={
                  <Checkbox 
                    checked={reportOptions.includeSubjectStats} 
                    onChange={handleOptionChange} 
                    name="includeSubjectStats" 
                    disabled={reportType !== 'etablissement'} // Désactiver si non pertinent
                  />}
                label="Statistiques par Matière"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel 
                control={
                  <Checkbox 
                    checked={reportOptions.includeCharts} 
                    onChange={handleOptionChange} 
                    name="includeCharts" 
                    icon={<BarChartIcon />} 
                    checkedIcon={<BarChartIcon color="primary"/>}
                  />
                } 
                label="Inclure les Diagrammes Visuels"
              />
              <Typography variant="caption" display="block" color="text.secondary" ml={4}>
                Permet d'intégrer les graphiques d'analyse dans le rapport.
              </Typography>
            </Grid>
          </Grid>
        </SectionCard>

        {/* Section 4: Format et Bouton de Génération */}
        <SectionCard>
          <Typography variant="h6" gutterBottom>Format d'Exportation</Typography>
          <FormControl component="fieldset" margin="normal">
            <FormLabel component="legend">Sélectionner le Format</FormLabel>
            <RadioGroup row value={exportFormat} onChange={(e) => setExportFormat(e.target.value)}>
              <FormControlLabel value="pdf" control={<Radio icon={<PictureAsPdfIcon />} checkedIcon={<PictureAsPdfIcon color="primary" />}/>} label="PDF" />
              <FormControlLabel value="excel" control={<Radio icon={<AssessmentOutlinedIcon />} checkedIcon={<AssessmentOutlinedIcon color="primary" />}/>} label="Excel" />
              </RadioGroup>
          </FormControl>
        </SectionCard>
            
        {/* Boutons d'action principaux */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3, mb: 2 }}>
              <StyledButton 
                variant="outlined"
            onClick={(e) => {
              setSelectedYear('');
              setReportType('');
              setSelectedEntity('');
              setReportOptions({
                includeGeneralStats: true,
                includeLevelStats: true,
                includeSubjectStats: true,
                includeCharts: true
              });
              setExportFormat('pdf');
              showSnackbar('Formulaire réinitialisé', 'info');
            }}
            color="secondary"
                disabled={loading}
              >
            Réinitialiser
              </StyledButton>
              <StyledButton 
            type="submit"
                variant="contained" 
                color="primary" 
            onClick={(e) => { if (typeof handleGenerateReport === 'function') handleGenerateReport(e); }}
            disabled={loading || !selectedYear || !reportType || (isEntitySelectionNeeded && !selectedEntity)}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              >
            {loading ? 'Génération en cours...' : 'Générer le Rapport'}
              </StyledButton>
            </Box>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress />
          </Box>
        )}
          </Box>
        );
  };

  // Rendu de la liste des rapports générés
  const renderGeneratedReports = () => (
    <SectionCard>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Historique des Rapports Générés
      </Typography>
        <TextField
        fullWidth
        label="Rechercher un rapport..."
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 2.5 }}
      />
      {loading && paginatedReports.length === 0 && <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />}
      {!loading && filteredReports.length === 0 && (
        <Typography sx={{ textAlign: 'center', p: 3, color: theme.palette.text.secondary }}>
          Aucun rapport trouvé ou généré pour le moment.
        </Typography>
      )}
      {filteredReports.length > 0 && (
        <>
          <TableContainer component={Paper} variant="outlined" sx={{ borderColor: theme.palette.divider }}>
            <Table sx={{ minWidth: 650 }} aria-label="tableau des rapports générés" stickyHeader>
          <TableHead>
                <TableRow sx={{ 
                  '& th': {
                    backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[200] : theme.palette.grey[800],
                    color: theme.palette.getContrastText(theme.palette.mode === 'light' ? theme.palette.grey[200] : theme.palette.grey[800]),
                    fontWeight: 'bold',
                    borderBottom: `2px solid ${theme.palette.divider}`,
                    borderRight: `1px solid ${theme.palette.divider}`,
                    padding: '10px 16px',
                  },
                  '& th:last-child': {
                    borderRight: 0,
                  }
                }}>
                  <TableCell>Nom du Rapport</TableCell>
              <TableCell>Type</TableCell>
                  <TableCell>Date de Génération</TableCell>
              <TableCell>Format</TableCell>
                  <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
                {paginatedReports.map((report) => (
              <StyledTableRow key={report.id}>
                    <TableCell component="th" scope="row" sx={{ padding: '8px 16px' }}>
                    {report.nom}
                </TableCell>
                    <TableCell sx={{textTransform: 'capitalize', padding: '8px 16px'}}>{report.type}</TableCell>
                    <TableCell sx={{ padding: '8px 16px' }}>{new Date(report.date).toLocaleDateString()}</TableCell>
                    <TableCell sx={{ padding: '8px 16px' }}>
                        {report.format.toUpperCase() === 'PDF' ? 
                            <PictureAsPdfIcon sx={{ color: theme.palette.error.main, verticalAlign: 'middle', mr: 0.5 }} /> :
                            <AssessmentOutlinedIcon sx={{ color: theme.palette.success.main, verticalAlign: 'middle', mr: 0.5 }} />
                        }
                        {report.format.toUpperCase()}
                </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Télécharger">
                        <IconButton onClick={() => handleDownloadReport(report)} color="primary" size="small">
                    <DownloadIcon />
                  </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton onClick={() => handleDeleteReport(report.id)} color="error" size="small">
                    <DeleteIcon />
                  </IconButton>
                      </Tooltip>
                </TableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredReports.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Rapports par page:"
          />
        </>
      )}
    </SectionCard>
  );

  // TabPanel component (peut être externalisé si utilisé ailleurs)
  function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`report-tabpanel-${index}`}
        aria-labelledby={`report-tab-${index}`}
        {...other}
      >
        {value === index && (
          <TabPanelContent>
            {children}
          </TabPanelContent>
        )}
      </div>
  );
  }

  // Conditional rendering for initial page load
  if (loading) {
    return (
      <Box 
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          minHeight: 'calc(100vh - 120px)', // Adjust based on actual header/nav height
        }}
      >
        <InitialPageLoadIndicator message="Chargement des rapports..." />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <AssessmentIcon color="primary" sx={{ fontSize: '2.5rem', mr: 1.5 }} />
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Gestion des Rapports
        </Typography>
      </Box>
      
      <MainReportsCard>
        <StyledTabs 
          value={activeTab} 
          onChange={handleTabChange} 
          aria-label="Onglets des rapports"
          variant="fullWidth"
        >
          <StyledTab icon={<BarChartIcon />} label="Génération de Rapport" id="report-tab-0" aria-controls="report-tabpanel-0" />
          <StyledTab icon={<ListAltIcon />} label="Rapports Générés" id="report-tab-1" aria-controls="report-tabpanel-1" />
        </StyledTabs>

        <TabPanel value={activeTab} index={0}>
          {renderReportForm()}
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          {renderGeneratedReports()}
        </TabPanel>
      </MainReportsCard>

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
    </Container>
  );
};

export default Rapports;
