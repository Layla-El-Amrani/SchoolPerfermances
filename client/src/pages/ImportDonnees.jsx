import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
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
} from '@mui/icons-material';
import { styled, useTheme, alpha } from '@mui/material/styles';
import * as XLSX from 'xlsx';
import { useDropzone } from 'react-dropzone';

// Création d'une instance Axios personnalisée
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour ajouter le token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(response => response, error => {
  if (error.response && error.response.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
  return Promise.reject(error);
});

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 2,
}));

const UploadButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(2),
  padding: theme.spacing(1.5, 4),
  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
  color: theme.palette.common.white,
  '&:hover': {
    background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.secondary.dark} 90%)`,
  }
}));

const TemplatePreview = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  margin: theme.spacing(2),
  backgroundColor: alpha(theme.palette.background.paper, 0.9),
  borderRadius: theme.shape.borderRadius * 2,
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
  transition: 'border .24s ease-in-out',
  cursor: 'pointer',
  '&:hover': {
    borderColor: theme.palette.primary.dark,
    backgroundColor: alpha(theme.palette.primary.light, 0.2),
  },
}));

function ImportDonnees({ annee }) {
  const theme = useTheme();
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [annees, setAnnees] = useState([]);
  const [selectedAnnee, setSelectedAnnee] = useState('');
  const [open, setOpen] = useState(false);
  const [nouvelleAnnee, setNouvelleAnnee] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [historique, setHistorique] = useState([]);
  const [previewData, setPreviewData] = useState([]);

  useEffect(() => {
    // Charger les années scolaires
    api.get('/dashboard/annee-scolaires')
      .then(response => {
        const data = response.data;
        const anneesList = Array.isArray(data) ? data : (data.data || []);
        setAnnees(anneesList);
        
        // Si une année est passée en prop, vérifier qu'elle existe dans la liste
        if (annee) {
          const anneeExists = anneesList.some(a => a.annee_scolaire === annee);
          if (anneeExists) {
            setSelectedAnnee(annee);
          } else if (anneesList.length > 0) {
            setSelectedAnnee(anneesList[0].annee_scolaire);
          }
        } else if (anneesList.length > 0) {
          setSelectedAnnee(anneesList[0].annee_scolaire);
        }
      })
      .catch(error => {
        console.error('Erreur lors du chargement des années:', error);
        setAnnees([]);
        setError('Erreur lors du chargement des années scolaires');
      });

    // Charger l'historique
    api.get('/dashboard/import/history')
      .then(response => {
        setHistorique(response.data);
      })
      .catch(error => {
        console.error('Erreur lors du chargement de l\'historique:', error);
        setHistorique([]);
      });
  }, [annee]);

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const fileType = file.name.split('.').pop().toLowerCase();
      
      if (!['xlsx', 'xls', 'csv', 'xml'].includes(fileType)) {
        setError('Format de fichier non supporté. Utilisez Excel (.xlsx, .xls), CSV ou XML.');
        return;
      }

      setFile(file);
      setError(null);
      setStatus('');
      
      // Lire le fichier pour prévisualisation
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          if (fileType === 'xlsx' || fileType === 'xls') {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);
            setPreviewData(jsonData.slice(0, 5));
          } else if (fileType === 'csv') {
            const csvData = e.target.result;
            const lines = csvData.split('\n');
            const headers = lines[0].split(',');
            const jsonData = lines.slice(1, 6).map(line => {
              const values = line.split(',');
              return headers.reduce((obj, header, i) => {
                obj[header.trim()] = values[i]?.trim();
                return obj;
              }, {});
            });
            setPreviewData(jsonData);
          } else if (fileType === 'xml') {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(e.target.result, "text/xml");
            const items = xmlDoc.getElementsByTagName('item');
            const jsonData = Array.from(items).slice(0, 5).map(item => {
              const obj = {};
              Array.from(item.children).forEach(child => {
                obj[child.tagName] = child.textContent;
              });
              return obj;
            });
            setPreviewData(jsonData);
          }
        } catch (err) {
          setError('Erreur lors de la lecture du fichier : ' + err.message);
        }
      };

      if (fileType === 'xlsx' || fileType === 'xls' || fileType === 'csv') {
        reader.readAsArrayBuffer(file);
      } else if (fileType === 'xml') {
        reader.readAsText(file);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
      'application/xml': ['.xml'],
      'text/xml': ['.xml']
    },
    maxFiles: 1
  });

  const handleImport = async () => {
    if (!file) {
      setStatus('Veuillez sélectionner un fichier à importer');
      return;
    }
    if (!selectedAnnee) {
      setStatus('Veuillez sélectionner une année scolaire');
      return;
    }

    setLoading(true);
    setStatus('Import en cours...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('annee', selectedAnnee);

const response = await api.post('/dashboard/import/resultats', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
          setStatus(`Import en cours... (${percentCompleted}%)`);
        }
      });

      // Mettre à jour l'historique après un import réussi
      setHistorique(prev => [
        {
          date: new Date().toISOString(),
          utilisateur: 'Utilisateur actuel',
          annee: selectedAnnee,
          fichier: file.name,
          lignes: response.data.lignes_importees || 0,
          statut: 'Réussi',
          id: Date.now()
        },
        ...prev
      ]);

      setStatus(`Import réussi : ${response.data.message}`);
      setFile(null); // Reset file selection after successful import
      setPreviewData([]);
    } catch (err) {
      console.error('Erreur détaillée:', err.response?.data);
      setStatus(`Erreur lors de l'import : ${err.response?.data?.message || err.response?.data?.error || 'Veuillez réessayer'}`);
      setError(err.response?.data?.details || err.response?.data?.errors || 'Veuillez vérifier les logs du serveur pour plus de détails');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const handleAddAnnee = async () => {
    if (!nouvelleAnnee) {
      setError('Veuillez entrer une année scolaire');
      return;
    }

    try {
      setError('');
      setLoading(true);
      console.log('Ajout de l\'année:', nouvelleAnnee);
      
      // Extraire l'année de début et de fin
      const [anneeDebut, anneeFin] = nouvelleAnnee.split('-');
      const dateDebut = new Date(`${anneeDebut}-09-01`); // Début en septembre
      const dateFin = new Date(`${anneeFin}-08-31`); // Fin en août

      const response = await api.post('/dashboard/annee-scolaires', {
        annee_scolaire: nouvelleAnnee,
        date_debut: dateDebut.toISOString().split('T')[0],
        date_fin: dateFin.toISOString().split('T')[0]
      }, {
        proxy: false,
      });

      setAnnees([...annees, response.data]);
      setSelectedAnnee(nouvelleAnnee);
      setOpen(false);
      setNouvelleAnnee('');
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors de l\'ajout de l\'année scolaire');
      console.error('Erreur lors de l\'ajout:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (item) => {
    console.log('Afficher les détails de l\'importation:', item);
  };

  const handleDownload = (item) => {
    console.log('Télécharger le fichier d\'importation:', item);
  };

  const handleDownloadTemplate = () => {
    window.location.href = '/api/dashboard/import/template';
  };

    return (
    <Box sx={{ 
      p: 3,
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      background: '#f8fafc',
      minHeight: 'calc(100vh - 64px)',
      width: '100%',
      boxSizing: 'border-box',
      overflow: 'hidden',
      gap: 3
    }}>
      {/* Messages d'erreur et de statut */}
      {status && (
        <Box sx={{ mb: 3 }}>
          <StyledPaper 
            elevation={3} 
            sx={{ 
              p: 2,
              backgroundColor: status.startsWith('Import réussi') 
                ? 'success.light' 
                : 'error.light',
              color: 'white',
              animation: 'slideIn 0.5s ease',
              '@keyframes slideIn': {
                '0%': { transform: 'translateY(-20px)', opacity: 0 },
                '100%': { transform: 'translateY(0)', opacity: 1 }
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {status.startsWith('Import réussi') ? (
                <CheckCircle />
              ) : (
                <Error />
              )}
              <Typography>{status}</Typography>
            </Box>
          </StyledPaper>
        </Box>
      )}

      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1.5fr 1fr' },
        gap: 3,
        width: '100%',
        height: '100%',
        flex: 1,
        '& > *': {
          minWidth: 0,
        }
      }}>
        {/* Colonne de droite - Éléments d'importation */}
        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          height: '100%',
          '& > *': {
            flex: '0 0 auto'
          }
        }}>
          <Paper elevation={0} sx={{
            p: 4,
            borderRadius: 3,
            background: 'white',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid rgba(0, 0, 0, 0.05)'
          }}>
            <Typography variant="h5" gutterBottom sx={{ 
              color: 'primary.main',
              fontWeight: 600,
              mb: 3
            }}>
              Importation des résultats
            </Typography>
            
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Année scolaire</InputLabel>
                    <Select
                      value={selectedAnnee}
                      onChange={(e) => setSelectedAnnee(e.target.value)}
                      label="Année scolaire"
                      sx={{ 
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'primary.main',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'primary.dark',
                        },
                      }}
                    >
                      {annees.map((annee) => (
                        <MenuItem key={annee.id} value={annee.annee_scolaire}>
                          {annee.annee_scolaire}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid xs={12}>
                    <Button
                      variant="outlined"
                    startIcon={<Add />}
                      onClick={() => setOpen(true)}
                    fullWidth
                      sx={{
                      borderRadius: theme.shape.borderRadius * 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      padding: theme.spacing(1.5, 3),
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                      },
                      borderWidth: 2,
                      '&:hover': {
                        borderWidth: 2,
                        }
                      }}
                    >
                    Ajouter une année scolaire
                    </Button>
                </Grid>
              </Grid>

              <Grid xs={12}>
                <DropzoneContainer {...getRootProps()}>
                  <input {...getInputProps()} />
                  <Box sx={{ textAlign: 'center' }}>
                    <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      {isDragActive ? 'Déposez le fichier ici' : 'Glissez-déposez un fichier (Excel, CSV ou XML) ou cliquez pour sélectionner'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Formats acceptés: .xlsx, .xls, .csv, .xml
                    </Typography>
                  </Box>
                </DropzoneContainer>
              </Grid>

                  {file && (
                <Grid xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <CheckCircle color="success" />
                      <Typography>{file.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </Typography>
                    </Stack>
                  </Paper>
                </Grid>
              )}

              {loading && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={progress}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                      }
                    }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {status}
                      </Typography>
                    </Box>
                  )}

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleImport}
                  disabled={!file || !selectedAnnee || loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <CloudUpload />}
                  sx={{ 
                    mt: 2, 
                    mb: 2,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 500,
                    px: 4,
                    py: 1.5,
                    fontSize: '1rem',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                    '&:hover': {
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                    },
                    '&.Mui-disabled': {
                      opacity: 0.7
                    }
                  }}
                  fullWidth
                >
                  {loading ? 'Import en cours...' : 'Importer'}
                </Button>
              </Box>
                        </Box>
          </Paper>
                  </Box>

        {/* Colonne de gauche - Instructions */}
                    <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          '& > *': {
            flex: '0 0 auto'
          }
        }}>
          <Paper elevation={0} sx={{
            p: 4,
            borderRadius: 3,
            background: 'white',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid rgba(0, 0, 0, 0.05)'
          }}>
            <Typography variant="h5" gutterBottom sx={{ 
              color: 'primary.main',
              fontWeight: 600,
              mb: 3
            }}>
              Instructions d'importation
                          </Typography>
            <List sx={{ flex: 1 }}>
              <ListItem sx={{ 
                mb: 2,
                borderRadius: 2,
                backgroundColor: 'grey.50',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'grey.100',
                  transform: 'translateX(5px)',
                }
              }}>
                      <ListItemIcon>
                  <CheckCircle color="primary" />
                      </ListItemIcon>
                <ListItemText 
                  primary="Format du fichier" 
                  secondary="Le fichier doit être au format CSV avec les colonnes suivantes : Matricule, Nom, Prénom, Matière, Note"
                  primaryTypographyProps={{ fontWeight: 600 }}
                />
                    </ListItem>
              <ListItem sx={{ 
                mb: 2,
                borderRadius: 2,
                backgroundColor: 'grey.50',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'grey.100',
                  transform: 'translateX(5px)',
                }
              }}>
                      <ListItemIcon>
                  <CheckCircle color="primary" />
                      </ListItemIcon>
                <ListItemText 
                  primary="Sélection de l'année" 
                  secondary="Choisissez l'année scolaire pour laquelle vous souhaitez importer les résultats"
                  primaryTypographyProps={{ fontWeight: 600 }}
                />
                    </ListItem>
              <ListItem sx={{ 
                mb: 2,
                borderRadius: 2,
                backgroundColor: 'grey.50',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'grey.100',
                  transform: 'translateX(5px)',
                }
              }}>
                      <ListItemIcon>
                  <CheckCircle color="primary" />
                      </ListItemIcon>
                <ListItemText 
                  primary="Validation" 
                  secondary="Les données seront validées avant l'import. Vous recevrez un rapport détaillé des erreurs éventuelles"
                  primaryTypographyProps={{ fontWeight: 600 }}
                />
                    </ListItem>
                  </List>
          </Paper>
                              </Box>
                  </Box>

          {/* Historique en bas */}
      <Box sx={{ 
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        mt: 2
      }}>
        <Paper elevation={0} sx={{
          p: 4,
          borderRadius: 3,
          background: 'white',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <Typography variant="h5" gutterBottom sx={{ 
            color: 'text.primary',
            fontWeight: 600,
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            '&:before': {
              content: '""',
              display: 'block',
              width: 4,
              height: 24,
              bgcolor: 'primary.main',
              borderRadius: 2
            }
          }}>
                        Historique des imports
                      </Typography>
              <TableContainer sx={{ flex: 1, display: 'flex', flexDirection: 'column', maxHeight: '100%' }}>
                <Table sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <TableHead>
                <TableRow sx={{ 
                  backgroundColor: 'primary.main',
                  '& .MuiTableCell-head': {
                    color: 'white',
                    fontWeight: 600,
                  }
                }}>
                      <TableCell>Date</TableCell>
                      <TableCell>Utilisateur</TableCell>
                      <TableCell>Année</TableCell>
                      <TableCell>Fichier</TableCell>
                  <TableCell>Lignes importées</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody sx={{ flex: 1, overflowY: 'auto' }}>
                {historique.map((item) => (
                  <TableRow 
                    key={`${item.id}-${item.date}`}
                    sx={{ 
                      '&:hover': {
                        backgroundColor: 'grey.50',
                      }
                    }}
                  >
                    <TableCell>{new Date(item.date).toLocaleString()}</TableCell>
                        <TableCell>{item.utilisateur}</TableCell>
                        <TableCell>{item.annee}</TableCell>
                        <TableCell>{item.fichier}</TableCell>
                        <TableCell>{item.lignes}</TableCell>
                        <TableCell>
                      {item.statut === 'Réussi' ? (
                        <Check color="success" />
                      ) : (
                        <Error color="error" />
                      )}
                        </TableCell>
                        <TableCell>
                      <IconButton 
                        onClick={() => handleView(item)}
                        sx={{
                          '&:hover': {
                            backgroundColor: 'primary.light',
                            color: 'white',
                          }
                        }}
                      >
                            <Visibility />
                          </IconButton>
                      <IconButton 
                        onClick={() => handleDownload(item)}
                        sx={{
                          '&:hover': {
                            backgroundColor: 'primary.light',
                            color: 'white',
                          }
                        }}
                      >
                            <Download />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
        </Paper>
          </Box>

      {/* Dialog pour ajouter une année scolaire */}
      <Dialog 
        open={open} 
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 400,
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: 'primary.main',
          color: 'white',
          fontWeight: 600
        }}>
          Ajouter une année scolaire
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
            <TextField
              autoFocus
              margin="dense"
            label="Année scolaire (ex: 2023-2024)"
            type="text"
              fullWidth
              value={nouvelleAnnee}
            onChange={(e) => setNouvelleAnnee(e.target.value)}
            error={!!error}
            helperText={error}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
          />
          </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleAddAnnee} 
            variant="contained" 
            disabled={loading}
            sx={{
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
            }}
          >
            Ajouter
          </Button>
          </DialogActions>
        </Dialog>

      {previewData.length > 0 && (
        <TemplatePreview>
          <Typography variant="h6" gutterBottom>
            Aperçu des données
          </Typography>
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
                  <TableRow key={`preview-${index}`}>
                    {Object.values(row).map((value, i) => (
                      <TableCell key={`cell-${index}-${i}`}>{value}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TemplatePreview>
      )}

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleDownloadTemplate}
          startIcon={<Download />}
          sx={{ 
            mb: 3,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 500,
            px: 3,
            py: 1,
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            '&:hover': {
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
            }
          }}
        >
          Télécharger le modèle
        </Button>
      </Box>
    </Box>
  );
}

export default ImportDonnees;
