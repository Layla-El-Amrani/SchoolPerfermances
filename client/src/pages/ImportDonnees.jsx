import React, { useState, useEffect, useCallback } from 'react';
import { api, apiEndpoints } from '../services/api';
import { useYear } from '../contexts/YearContext';
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Collapse,
  Divider,
  Card,
  CardContent,
  LinearProgress,
  FormControl,
  InputLabel,
  Stack,
  Tooltip,
  Alert,
  Snackbar,
  InputAdornment,
} from '@mui/material';
import { 
  Download, 
  Add, 
  CheckCircle, 
  Upload, 
  ExpandMore, 
  ExpandLess,
  CalendarToday,
  CloudUpload,
  Check,
  Error,
  Visibility,
  Info,
  Warning,
  Delete,
  Refresh,
} from '@mui/icons-material';
import { styled, useTheme, alpha } from '@mui/material/styles';
import * as XLSX from 'xlsx';
import { useDropzone } from 'react-dropzone';
import InitialPageLoadIndicator from '../components/InitialPageLoadIndicator';

// Styles personnalisés
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
}));

const UploadButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(2),
  padding: theme.spacing(1.5, 4),
  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
  color: theme.palette.common.dark,
  '&:hover': {
    background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.secondary.dark} 90%)`,
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
  transition: 'all 0.3s ease',
}));

const TemplatePreview = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  margin: theme.spacing(2),
  backgroundColor: alpha(theme.palette.background.paper, 0.9),
  borderRadius: theme.shape.borderRadius * 2,
  border: `1px solid ${theme.palette.divider}`,
}));

const DropzoneContainer = styled('div')(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(3),
  borderWidth: 2,
  borderRadius: theme.shape.borderRadius * 2,
  borderColor: theme.palette.primary.main,
  borderStyle: 'dashed',
  backgroundColor: alpha(theme.palette.primary.light, 0.1),
  color: theme.palette.text.primary,
  outline: 'none',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    borderColor: theme.palette.primary.dark,
    backgroundColor: alpha(theme.palette.primary.light, 0.2),
    transform: 'scale(1.01)',
  },
}));

const HistoryCard = styled(Card)(({ theme }) => ({
  margin: theme.spacing(2),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[4],
    transform: 'translateY(-2px)',
  },
}));

// Ajouter ces styles personnalisés
const DialogForm = styled('form')(({ theme }) => ({
  padding: theme.spacing(2),
  '& .MuiTextField-root': {
    marginBottom: theme.spacing(2),
  },
}));

const FormSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
}));

function ImportDonnees() {
  const theme = useTheme();
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const { selectedYear, years, setSelectedYear, setYears } = useYear();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    anneeDebut: '',
    anneeFin: '',
  });
  const [anneeError, setAnneeError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [historique, setHistorique] = useState(() => {
    // Récupérer l'historique depuis localStorage au chargement
    const savedHistory = localStorage.getItem('importHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  const [previewData, setPreviewData] = useState(() => {
    // Récupérer les données de prévisualisation depuis localStorage
    const savedPreview = localStorage.getItem('importPreview');
    return savedPreview ? JSON.parse(savedPreview) : [];
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [pageLoading, setPageLoading] = useState(true);

  // Sauvegarder l'historique dans localStorage à chaque mise à jour
  useEffect(() => {
    localStorage.setItem('importHistory', JSON.stringify(historique));
  }, [historique]);

  // Sauvegarder les données de prévisualisation dans localStorage à chaque mise à jour
  useEffect(() => {
    if (previewData.length > 0) {
      localStorage.setItem('importPreview', JSON.stringify(previewData));
    }
  }, [previewData]);

  // Charger l'historique depuis l'API
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get(apiEndpoints.importHistory);
        if (response.data) {
          setHistorique(response.data);
          // Sauvegarder dans localStorage
          localStorage.setItem('importHistory', JSON.stringify(response.data));
        } else {
          throw new Error('Format de réponse invalide');
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'historique:', error);
        // En cas d'erreur, utiliser les données sauvegardées localement
        const savedHistory = localStorage.getItem('importHistory');
        if (savedHistory) {
          setHistorique(JSON.parse(savedHistory));
        }
        showSnackbar(error.response?.data?.message || 'Erreur lors du chargement de l\'historique', 'error');
      }
    };

    fetchHistory();
    // Simuler un chargement initial
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const validateData = (data, fileType) => {
    const requiredFields = ['Matricule', 'Nom', 'Prenom', 'Matiere', 'Note'];
    const errors = [];

    if (data.length === 0) {
      errors.push('Le fichier est vide');
      return errors;
    }

    // Vérifier les en-têtes
    const headers = Object.keys(data[0]);
    const missingFields = requiredFields.filter(field => !headers.includes(field));
    if (missingFields.length > 0) {
      errors.push(`Colonnes manquantes : ${missingFields.join(', ')}`);
    }

    // Vérifier les données
    data.forEach((row, index) => {
      requiredFields.forEach(field => {
        if (!row[field] || row[field].toString().trim() === '') {
          errors.push(`Ligne ${index + 1}: ${field} est vide`);
        }
      });

      // Vérifier que la note est un nombre valide
      if (row.Note) {
        const note = parseFloat(row.Note);
        if (isNaN(note) || note < 0 || note > 20) {
          errors.push(`Ligne ${index + 1}: Note invalide (${row.Note})`);
        }
      }
    });

    return errors;
  };

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const fileType = file.name.split('.').pop().toLowerCase();
      
      if (!['xlsx', 'xls', 'csv', 'xml'].includes(fileType)) {
        setError('Format de fichier non supporté. Utilisez Excel (.xlsx, .xls), CSV ou XML.');
        showSnackbar('Format de fichier non supporté', 'error');
        return;
      }

      setFile(file);
      setError(null);
      setStatus('');
      
      // Lire le fichier pour prévisualisation
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          let jsonData = [];
          if (fileType === 'xlsx' || fileType === 'xls') {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            jsonData = XLSX.utils.sheet_to_json(firstSheet);
          } else if (fileType === 'csv') {
            const csvData = e.target.result;
            const lines = csvData.split('\n');
            if (lines.length <= 1) {
              setError('Le fichier CSV est vide ou ne contient pas de données valides.');
              showSnackbar('Fichier CSV invalide', 'error');
              return;
            }
            const headers = lines[0].split(',');
            jsonData = lines.slice(1).map(line => {
              const values = line.split(',');
              return headers.reduce((obj, header, index) => {
                obj[header.trim()] = values[index]?.trim() || '';
                return obj;
              }, {});
            });
          }

          const errors = validateData(jsonData, fileType);
          if (errors.length > 0) {
            setError(errors.join('\n'));
            showSnackbar('Erreurs de validation détectées', 'error');
          } else {
            setPreviewData(jsonData.slice(0, 5)); // Afficher les 5 premières lignes
            showSnackbar('Fichier validé avec succès', 'success');
          }
        } catch (error) {
          setError('Erreur lors de la lecture du fichier: ' + error.message);
          showSnackbar('Erreur de lecture du fichier', 'error');
        }
      };

      reader.onerror = () => {
        setError('Erreur lors de la lecture du fichier');
        showSnackbar('Erreur de lecture du fichier', 'error');
      };

      if (fileType === 'csv') {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
      'application/xml': ['.xml']
    },
    multiple: false
  });

  const handleImport = async () => {
    if (!file || !selectedYear) {
      showSnackbar('Veuillez sélectionner un fichier et une année scolaire', 'warning');
      return;
    }

    if (file.size === 0) {
      showSnackbar('Le fichier est vide', 'error');
      return;
    }

    setLoading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('year', selectedYear);

    try {
      console.log('Début de l\'importation...', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.name.split('.').pop().toLowerCase(),
        year: selectedYear
      });

      const response = await api.post(apiEndpoints.importData, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        },
      });

      if (response.data && response.data.success) {
        setStatus('Import réussi');
        showSnackbar('Import réussi', 'success');
        
        // Mise à jour de l'historique
        try {
          const historyResponse = await api.get(apiEndpoints.importHistory);
          if (historyResponse.data) {
            setHistorique(historyResponse.data);
            // Sauvegarder dans localStorage
            localStorage.setItem('importHistory', JSON.stringify(historyResponse.data));
          }
        } catch (historyError) {
          console.error('Erreur lors de la mise à jour de l\'historique:', historyError);
        }

        // Sauvegarder les données de prévisualisation
        if (previewData.length > 0) {
          localStorage.setItem('importPreview', JSON.stringify(previewData));
        }
      } else {
        throw new Error(response.data?.message || 'Erreur lors de l\'import');
      }
    } catch (error) {
      console.error('Erreur détaillée lors de l\'import:', error);
      let errorMessage = 'Erreur lors de l\'import';
      
      if (error.response) {
        if (error.response.status === 413) {
          errorMessage = 'Le fichier est trop volumineux';
        } else if (error.response.status === 415) {
          errorMessage = 'Format de fichier non supporté';
        } else if (error.response.status === 400) {
          errorMessage = error.response.data?.message || 'Données invalides';
        } else if (error.response.status === 401) {
          errorMessage = 'Session expirée, veuillez vous reconnecter';
        } else if (error.response.status === 500) {
          errorMessage = 'Erreur serveur, veuillez réessayer plus tard';
        }
      } else if (error.request) {
        errorMessage = 'Impossible de contacter le serveur';
      }

      setError(errorMessage);
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  // Fonction de validation du format d'année scolaire
  const validateAnneeScolaire = (annee) => {
    console.log('Validation de l\'année:', annee);
    
    // Si c'est une année de début ou de fin seule
    if (!annee.includes('-')) {
      console.log('Validation d\'une année individuelle');
      const year = parseInt(annee);
      console.log('Année parsée:', year);
      
      // Vérifier que c'est un nombre à 4 chiffres
      if (isNaN(year) || year.toString().length !== 4) {
        console.log('Format invalide: pas un nombre à 4 chiffres');
        return 'Format invalide. Utilisez le format AAAA (ex: 2023)';
      }

      // Vérifier la plage d'années
      const currentYear = new Date().getFullYear();
      console.log('Année courante:', currentYear);
      console.log('Plage autorisée:', currentYear - 5, 'à', currentYear + 2);
      
      if (year < currentYear - 5 || year > currentYear + 2) {
        console.log('Année hors plage');
        return `L'année doit être entre ${currentYear - 5} et ${currentYear + 2}`;
      }

      console.log('Année valide');
      return '';
    }

    // Si c'est une année complète (AAAA-AAAA)
    console.log('Validation d\'une année complète');
    const [debut, fin] = annee.split('-').map(Number);
    console.log('Année début:', debut, 'Année fin:', fin);

    if (fin !== debut + 1) {
      console.log('Année de fin invalide');
      return 'L\'année de fin doit être l\'année suivante';
    }

    console.log('Année complète valide');
    return '';
  };

  const handleFormChange = (field) => (event) => {
    const value = event.target.value;
    console.log('Changement de valeur pour', field, ':', value);
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Ne pas valider si le champ est vide
    if (!value) {
      console.log('Champ vide, pas de validation');
      setAnneeError('');
      return;
    }

    // Valider l'année saisie
    const error = validateAnneeScolaire(value);
    console.log('Résultat de la validation:', error);
    
    if (error) {
      setAnneeError(error);
    } else {
      setAnneeError('');
    }
  };

  const handleAddAnnee = async () => {
    console.log('Tentative d\'ajout d\'année scolaire');
    console.log('Données du formulaire:', formData);
    
    // Réinitialiser l'erreur
    setAnneeError('');

    // Vérifier que les deux années sont remplies
    if (!formData.anneeDebut || !formData.anneeFin) {
      console.log('Années manquantes');
      setAnneeError('Veuillez remplir les deux années');
      showSnackbar('Veuillez remplir les deux années', 'error');
      return;
    }

    // Construire l'année scolaire au format AAAA-AAAA
    const anneeScolaire = `${formData.anneeDebut}-${formData.anneeFin}`;
    console.log('Année scolaire construite:', anneeScolaire);

    // Valider le format de l'année complète
    const validationError = validateAnneeScolaire(anneeScolaire);
    if (validationError) {
      console.log('Erreur de validation:', validationError);
      setAnneeError(validationError);
      showSnackbar(validationError, 'error');
      return;
    }

    // Vérifier si l'année existe déjà
    if (years.includes(anneeScolaire)) {
      console.log('Année déjà existante');
      setAnneeError('Cette année scolaire existe déjà');
      showSnackbar('Cette année scolaire existe déjà', 'error');
      return;
    }

    try {
      console.log('Envoi de la requête au serveur...');
      // Utiliser l'endpoint correct pour l'ajout d'année scolaire
      const response = await api.post('/annees-scolaires', {
        annee_scolaire: anneeScolaire,
        est_courante: false // Ne pas marquer comme courante par défaut
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data) {
        console.log('Année ajoutée avec succès');
        // Fermer le dialogue et réinitialiser le formulaire
        setOpen(false);
        setFormData({
          anneeDebut: '',
          anneeFin: '',
        });
        
        // Mettre à jour la liste des années
        try {
          const yearsResponse = await api.get('/import/annees');
          if (yearsResponse.data) {
            // Mettre à jour la liste des années
            const updatedYears = yearsResponse.data;
            // Mettre à jour le contexte des années
            setYears(updatedYears);
            // Sélectionner la nouvelle année
            setSelectedYear(anneeScolaire);
            showSnackbar('Année scolaire ajoutée avec succès', 'success');
          }
        } catch (yearsError) {
          console.error('Erreur lors de la mise à jour de la liste des années:', yearsError);
          showSnackbar('Année ajoutée mais erreur lors de la mise à jour de la liste', 'warning');
        }
      } else {
        throw new Error('Réponse invalide du serveur');
      }
    } catch (error) {
      console.error('Erreur détaillée:', error);
      let errorMessage = 'Erreur lors de l\'ajout de l\'année';
      
      if (error.response) {
        console.log('Réponse d\'erreur:', error.response.data);
        if (error.response.status === 401) {
          errorMessage = 'Session expirée, veuillez vous reconnecter';
          window.location.href = '/login';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data?.errors) {
          // Gérer les erreurs de validation Laravel
          const errors = error.response.data.errors;
          errorMessage = Object.values(errors).flat().join(', ');
        }
      }
      
      setAnneeError(errorMessage);
      showSnackbar(errorMessage, 'error');
    }
  };

  const handleView = (item) => {
    // Implémenter la prévisualisation du fichier
    showSnackbar('Fonctionnalité en cours de développement', 'info');
  };

  const handleDownload = async (item) => {
    try {
      const response = await api.get(`${apiEndpoints.downloadImport}/${item.id}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', item.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      showSnackbar('Téléchargement réussi', 'success');
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      showSnackbar('Erreur lors du téléchargement', 'error');
    }
  };

  const handleDownloadTemplate = () => {
    // Télécharger le modèle Excel
    const template = [
      {
        Matricule: '12345',
        Nom: 'Doe',
        Prenom: 'John',
        Matiere: 'Mathématiques',
        Note: '15'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "modele_import.xlsx");
    
    showSnackbar('Modèle téléchargé avec succès', 'success');
  };

  const handleClearData = () => {
    localStorage.removeItem('importHistory');
    localStorage.removeItem('importPreview');
    setHistorique([]);
    setPreviewData([]);
    showSnackbar('Données locales effacées', 'info');
  };

  if (pageLoading) {
    return <InitialPageLoadIndicator />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, color: theme.palette.primary.main }}>
        Importation des Données
      </Typography>

      <Grid container spacing={3}>
        {/* Section d'importation */}
        <Grid item xs={12} md={6}>
          <StyledPaper>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Importer un fichier
              </Typography>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleClearData}
                startIcon={<Delete />}
                size="small"
              >
                Effacer les données
              </Button>
            </Box>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Année scolaire</InputLabel>
              <Select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                label="Année scolaire"
              >
                {years.map((year) => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
                <MenuItem value="new">
                  <Button
                    startIcon={<Add />}
                    onClick={() => setOpen(true)}
                    fullWidth
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    Ajouter une année
                  </Button>
                </MenuItem>
              </Select>
            </FormControl>

            <DropzoneContainer {...getRootProps()}>
              <input {...getInputProps()} />
              <CloudUpload sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 2 }} />
              {isDragActive ? (
                <Typography>Déposez le fichier ici...</Typography>
              ) : (
                <Typography>
                  Glissez-déposez un fichier ici, ou cliquez pour sélectionner
                </Typography>
              )}
              <Typography variant="caption" sx={{ mt: 1, color: 'text.secondary' }}>
                Formats acceptés: .xlsx, .xls, .csv, .xml
              </Typography>
            </DropzoneContainer>

            {file && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2">
                  Fichier sélectionné: {file.name}
                </Typography>
                {error && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                  </Alert>
                )}
              </Box>
            )}

            {loading && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress variant="determinate" value={progress} />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Progression: {progress}%
                </Typography>
              </Box>
            )}

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <UploadButton
                variant="contained"
                onClick={handleImport}
                disabled={!file || loading}
                startIcon={<Upload />}
              >
                Importer
              </UploadButton>
              <Button
                variant="outlined"
                onClick={handleDownloadTemplate}
                startIcon={<Download />}
              >
                Télécharger le modèle
              </Button>
            </Box>
          </StyledPaper>
        </Grid>

        {/* Section de prévisualisation */}
        <Grid item xs={12} md={6}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom>
              Prévisualisation
            </Typography>
            {previewData.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {Object.keys(previewData[0]).map((header) => (
                        <TableCell key={header}>{header}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {previewData.map((row, index) => (
                      <TableRow key={index}>
                        {Object.values(row).map((value, i) => (
                          <TableCell key={i}>{value}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                Aucune donnée à prévisualiser
              </Typography>
            )}
          </StyledPaper>
        </Grid>

        {/* Section historique */}
        <Grid item xs={12}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom>
              Historique des imports
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Fichier</TableCell>
                    <TableCell>Année</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {historique.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{new Date(item.date).toLocaleString()}</TableCell>
                      <TableCell>{item.filename}</TableCell>
                      <TableCell>{item.year}</TableCell>
                      <TableCell>
                        <Chip
                          label={item.status}
                          color={item.status === 'success' ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleView(item)}
                          title="Voir"
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDownload(item)}
                          title="Télécharger"
                        >
                          <Download />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </StyledPaper>
        </Grid>
      </Grid>

      {/* Dialog pour ajouter une année */}
      <Dialog 
        open={open} 
        onClose={() => {
          setOpen(false);
          setFormData({
            anneeDebut: '',
            anneeFin: '',
          });
          setAnneeError('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" component="div" sx={{ mb: 1 }}>
            Ajouter une année scolaire
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Entrez les années de début et de fin
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogForm>
            <FormSection>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Année de début"
                    value={formData.anneeDebut}
                    onChange={handleFormChange('anneeDebut')}
                    placeholder="Ex: 2023"
                    error={!!anneeError}
                    helperText={anneeError || "Format: AAAA"}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarToday />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Année de fin"
                    value={formData.anneeFin}
                    onChange={handleFormChange('anneeFin')}
                    placeholder="Ex: 2024"
                    error={!!anneeError}
                    helperText="Format: AAAA"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarToday />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </FormSection>
          </DialogForm>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button 
            onClick={() => {
              setOpen(false);
              setFormData({
                anneeDebut: '',
                anneeFin: '',
              });
              setAnneeError('');
            }}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleAddAnnee} 
            variant="contained"
            disabled={!formData.anneeDebut || !formData.anneeFin || !!anneeError}
            startIcon={<Add />}
          >
            Ajouter l'année scolaire
          </Button>
        </DialogActions>
      </Dialog>

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
}

export default ImportDonnees;

