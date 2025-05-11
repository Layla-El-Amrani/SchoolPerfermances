import React, { useState, useEffect } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { useTheme, styled, alpha } from '@mui/material/styles';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Grid,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Avatar,
  Chip,
  Tabs,
  Tab,
  CircularProgress,
  InputAdornment,
  Badge
} from '@mui/material';
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Language as LanguageIcon,
  Notifications as NotificationsIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Save as SaveIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Security as SecurityIcon,
  AccountCircle as AccountCircleIcon,
  NotificationsActive as NotificationsActiveIcon,
  Palette as PaletteIcon,
  Security as SecurityPrivacyIcon,
  AccessTime as SessionIcon,
  Backup as BackupIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Computer as ComputerIcon,
  Devices as DevicesIcon
} from '@mui/icons-material';
import { 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText, 
  ListItemSecondaryAction, 
  Tooltip, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';

// Styles personnalisés
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '4px',
  boxShadow: '0 1px 2px 0 rgba(0,0,0,0.1)',
  marginBottom: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  '&:hover': {
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  }
}));

const ExcelTable = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: '4px',
  overflow: 'hidden',
  '& .MuiDataGrid-root': {
    border: 'none',
    '& .MuiDataGrid-columnHeaders': {
      backgroundColor: theme.palette.grey[100],
      borderBottom: `1px solid ${theme.palette.divider}`,
    },
    '& .MuiDataGrid-cell': {
      borderRight: `1px solid ${theme.palette.divider}`,
      borderBottom: `1px solid ${theme.palette.divider}`,
    },
    '& .MuiDataGrid-row': {
      '&:hover': {
        backgroundColor: theme.palette.action.hover,
      },
    },
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  fontWeight: 600,
  color: theme.palette.text.primary,
  padding: theme.spacing(1, 2),
  backgroundColor: theme.palette.grey[100],
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  alignItems: 'center',
  '& svg': {
    marginRight: theme.spacing(1),
  },
}));

const ExcelButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  borderRadius: '2px',
  padding: '4px 12px',
  fontSize: '0.8125rem',
  boxShadow: 'none',
  border: `1px solid ${theme.palette.grey[300]}`,
  '&:hover': {
    backgroundColor: theme.palette.grey[100],
    boxShadow: 'none',
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.03)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 8px 30px 0 rgba(0,0,0,0.08)',
    transform: 'translateY(-2px)'
  },
  backgroundColor: theme.palette.background.paper,
}));

const StyledButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  borderRadius: '8px',
  padding: '10px 24px',
  fontWeight: 500,
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-1px)'
  }
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.95rem',
  minHeight: '60px',
  '&.Mui-selected': {
    color: theme.palette.primary.main,
  },
  padding: '12px 20px',
  position: 'relative',
  color: theme.palette.text.secondary,
}));

const Parametres = () => {
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
  const theme = useTheme();
  
  // États pour les onglets
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // États pour le profil utilisateur
  const [userData, setUserData] = useState({
    nom: 'John',
    prenom: 'Doe',
    email: 'john.doe@example.com',
    telephone: '+212 6 12 34 56 78',
    photo: '',
  });
  
  // États pour le mot de passe
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showPassword: false,
    showNewPassword: false,
    showConfirmPassword: false
  });
  
  // États pour les préférences
  const [preferences, setPreferences] = useState({
    darkMode: false,
    notifications: true,
    newsletter: true,
    language: 'fr',
  });
  
  // États pour la sécurité et confidentialité
  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: 30, // en minutes
    twoFactorAuth: false,
    backupFrequency: 'weekly', // daily, weekly, monthly
    lastBackup: null,
  });

  // États pour les sessions actives
  const [activeSessions, setActiveSessions] = useState([
    {
      id: '1',
      device: 'Windows 10, Chrome',
      location: 'Rabat, Maroc',
      ip: '192.168.1.1',
      lastActivity: new Date(Date.now() - 1000 * 60 * 15), // Il y a 15 minutes
      current: true
    },
    {
      id: '2',
      device: 'iPhone 13, Safari',
      location: 'Casablanca, Maroc',
      ip: '192.168.1.2',
      lastActivity: new Date(Date.now() - 1000 * 60 * 120), // Il y a 2 heures
      current: false
    },
    {
      id: '3',
      device: 'MacBook Pro, Firefox',
      location: 'Tanger, Maroc',
      ip: '192.168.1.3',
      lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24), // Il y a 1 jour
      current: false
    }
  ]);
  
  // États pour l'édition
  const [editMode, setEditMode] = useState({
    profile: false,
    password: false,
    preferences: false,
    security: false
  });

  // Gestion des changements de formulaire
  const handleChange = (field) => (e) => {
    setUserData({
      ...userData,
      [field]: e.target.value
    });
  };
  
  const handlePasswordChange = (field) => (e) => {
    setPasswordData({
      ...passwordData,
      [field]: e.target.value
    });
  };
  
  const handlePreferenceChange = (field) => (e) => {
    setPreferences({
      ...preferences,
      [field]: e.target.checked !== undefined ? e.target.checked : e.target.value
    });
  };
  
  // Basculer la visibilité du mot de passe
  const togglePasswordVisibility = (field) => {
    setPasswordData({
      ...passwordData,
      [field]: !passwordData[field]
    });
  };
  
  // Gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Désactiver le mode édition
      setEditMode({
        ...editMode,
        profile: false
      });
      
      showSnackbar('Profil mis à jour avec succès', 'success');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      showSnackbar('Erreur lors de la mise à jour du profil', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Gérer le changement de mot de passe
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showSnackbar('Les mots de passe ne correspondent pas', 'error');
      return;
    }
    
    setLoading(true);
    
    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Réinitialiser le formulaire
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        showPassword: false,
        showNewPassword: false,
        showConfirmPassword: false
      });
      
      setEditMode({
        ...editMode,
        password: false
      });
      
      showSnackbar('Mot de passe mis à jour avec succès', 'success');
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
      showSnackbar('Erreur lors du changement de mot de passe', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Rendu du formulaire de profil
  const renderProfileForm = () => (
    <StyledCard>
      <CardHeader
        title={
          <Box display="flex" alignItems="center">
            <AccountCircleIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Profil</Typography>
          </Box>
        }
        action={
          !editMode.profile ? (
            <IconButton onClick={() => setEditMode({ ...editMode, profile: true })}>
              <EditIcon />
            </IconButton>
          ) : (
            <IconButton onClick={() => setEditMode({ ...editMode, profile: false })}>
              <CloseIcon />
            </IconButton>
          )
        }
      />
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nom"
                value={userData.nom}
                onChange={handleChange('nom')}
                disabled={!editMode.profile || loading}
                margin="normal"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Prénom"
                value={userData.prenom}
                onChange={handleChange('prenom')}
                disabled={!editMode.profile || loading}
                margin="normal"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                value={userData.email}
                onChange={handleChange('email')}
                disabled={!editMode.profile || loading}
                margin="normal"
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Téléphone"
                value={userData.telephone}
                onChange={handleChange('telephone')}
                disabled={!editMode.profile || loading}
                margin="normal"
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            {editMode.profile && (
              <Grid item xs={12}>
                <Box display="flex" justifyContent="flex-end" mt={2}>
                  <StyledButton
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                  >
                    {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                  </StyledButton>
                </Box>
              </Grid>
            )}
          </Grid>
        </form>
      </CardContent>
    </StyledCard>
  );
  
  // Rendu du formulaire de mot de passe
  const renderPasswordForm = () => (
    <StyledCard>
      <CardHeader
        title={
          <Box display="flex" alignItems="center">
            <SecurityIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Sécurité</Typography>
          </Box>
        }
        action={
          !editMode.password ? (
            <IconButton onClick={() => setEditMode({ ...editMode, password: true })}>
              <EditIcon />
            </IconButton>
          ) : (
            <IconButton onClick={() => setEditMode({ ...editMode, password: false })}>
              <CloseIcon />
            </IconButton>
          )
        }
      />
      <CardContent>
        <form onSubmit={handlePasswordSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type={passwordData.showPassword ? 'text' : 'password'}
                label="Mot de passe actuel"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange('currentPassword')}
                disabled={!editMode.password || loading}
                margin="normal"
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility('showPassword')}
                        edge="end"
                      >
                        {passwordData.showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type={passwordData.showNewPassword ? 'text' : 'password'}
                label="Nouveau mot de passe"
                value={passwordData.newPassword}
                onChange={handlePasswordChange('newPassword')}
                disabled={!editMode.password || loading}
                margin="normal"
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility('showNewPassword')}
                        edge="end"
                      >
                        {passwordData.showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type={passwordData.showConfirmPassword ? 'text' : 'password'}
                label="Confirmer le mot de passe"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange('confirmPassword')}
                disabled={!editMode.password || loading}
                margin="normal"
                variant="outlined"
                error={passwordData.newPassword !== passwordData.confirmPassword && passwordData.confirmPassword !== ''}
                helperText={passwordData.newPassword !== passwordData.confirmPassword && passwordData.confirmPassword !== '' ? 'Les mots de passe ne correspondent pas' : ''}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility('showConfirmPassword')}
                        edge="end"
                      >
                        {passwordData.showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            {editMode.password && (
              <Grid item xs={12}>
                <Box display="flex" justifyContent="flex-end" mt={2}>
                  <StyledButton
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                    startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                  >
                    {loading ? 'Enregistrement...' : 'Mettre à jour le mot de passe'}
                  </StyledButton>
                </Box>
              </Grid>
            )}
          </Grid>
        </form>
      </CardContent>
    </StyledCard>
  );
  
  // Rendu des préférences
  const renderPreferences = () => (
    <StyledCard>
      <CardHeader
        title={
          <Box display="flex" alignItems="center">
            <PaletteIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Préférences</Typography>
          </Box>
        }
        action={
          !editMode.preferences ? (
            <IconButton onClick={() => setEditMode({ ...editMode, preferences: true })}>
              <EditIcon />
            </IconButton>
          ) : (
            <IconButton onClick={() => setEditMode({ ...editMode, preferences: false })}>
              <CloseIcon />
            </IconButton>
          )
        }
      />
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.darkMode}
                  onChange={handlePreferenceChange('darkMode')}
                  color="primary"
                  disabled={!editMode.preferences || loading}
                />
              }
              label={
                <Box display="flex" alignItems="center">
                  {preferences.darkMode ? <LightModeIcon sx={{ mr: 1 }} /> : <DarkModeIcon sx={{ mr: 1 }} />}
                  <Typography>Mode sombre</Typography>
                </Box>
              }
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.notifications}
                  onChange={handlePreferenceChange('notifications')}
                  color="primary"
                  disabled={!editMode.preferences || loading}
                />
              }
              label={
                <Box display="flex" alignItems="center">
                  <NotificationsActiveIcon sx={{ mr: 1 }} />
                  <Typography>Notifications</Typography>
                </Box>
              }
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth margin="normal" disabled={!editMode.preferences || loading}>
              <InputLabel id="language-select-label">Langue</InputLabel>
              <Select
                labelId="language-select-label"
                value={preferences.language}
                onChange={handlePreferenceChange('language')}
                label="Langue"
                startAdornment={
                  <InputAdornment position="start">
                    <LanguageIcon color="action" />
                  </InputAdornment>
                }
              >
                <MenuItem value="fr">Français</MenuItem>
                <MenuItem value="ar">العربية</MenuItem>
                <MenuItem value="en">English</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {editMode.preferences && (
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <StyledButton
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    // Enregistrer les préférences
                    setEditMode({ ...editMode, preferences: false });
                    showSnackbar('Préférences mises à jour', 'success');
                  }}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                >
                  {loading ? 'Enregistrement...' : 'Enregistrer les préférences'}
                </StyledButton>
              </Box>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </StyledCard>
  );

  // Fonction pour formater la date de dernière activité
  const formatLastActivity = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return 'À l\'instant';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    }
  };

  // Fonction pour déconnecter une session
  const handleLogoutSession = (sessionId) => {
    if (activeSessions.find(s => s.id === sessionId)?.current) {
      showSnackbar('Vous ne pouvez pas déconnecter la session actuelle depuis cette vue', 'warning');
      return;
    }
    
    setActiveSessions(prevSessions => {
      const updatedSessions = prevSessions.filter(session => session.id !== sessionId);
      return updatedSessions;
    });
    
    showSnackbar('Session déconnectée avec succès', 'success');
  };

  // Fonction pour déconnecter toutes les autres sessions
  const handleLogoutOtherSessions = () => {
    setActiveSessions(prevSessions => {
      return prevSessions.filter(session => session.current);
    });
    
    showSnackbar('Toutes les autres sessions ont été déconnectées', 'success');
  };

  // Rendu de la section Sécurité & confidentialité
  const renderSecurityPrivacy = () => (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
          <SecurityPrivacyIcon sx={{ mr: 1, color: 'primary.main' }} />
          Sécurité & confidentialité
        </Typography>
        <Box>
          {!editMode.security ? (
            <ExcelButton
              variant="outlined"
              startIcon={<EditIcon fontSize="small" />}
              onClick={() => setEditMode({ ...editMode, security: true })}
            >
              Modifier
            </ExcelButton>
          ) : (
            <ExcelButton
              variant="outlined"
              color="error"
              startIcon={<CloseIcon fontSize="small" />}
              onClick={() => setEditMode({ ...editMode, security: false })}
              sx={{ mr: 1 }}
            >
              Annuler
            </ExcelButton>
          )}
        </Box>
      </Box>
      <CardContent>
        <Grid container spacing={3}>
          {/* Configuration des accès */}
          <Grid item xs={12}>
            <SectionTitle>
              <SettingsIcon fontSize="small" /> Configuration des accès
            </SectionTitle>
            <Box sx={{ p: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={securitySettings.twoFactorAuth}
                    onChange={(e) => setSecuritySettings({...securitySettings, twoFactorAuth: e.target.checked})}
                    color="primary"
                    disabled={!editMode.security || loading}
                  />
                }
                label="Activer l'authentification à deux facteurs"
              />
            </Box>
          </Grid>

          {/* Expiration de session */}
          <Grid item xs={12}>
            <SectionTitle>
              <SessionIcon fontSize="small" /> Expiration de session
            </SectionTitle>
            <Box sx={{ p: 2 }}>
              <FormControl fullWidth sx={{ mt: 1 }} disabled={!editMode.security || loading}>
                <InputLabel>Temps avant déconnexion automatique</InputLabel>
                <Select
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: e.target.value})}
                  label="Temps avant déconnexion automatique"
                >
                  <MenuItem value={15}>15 minutes</MenuItem>
                  <MenuItem value={30}>30 minutes</MenuItem>
                  <MenuItem value={60}>1 heure</MenuItem>
                  <MenuItem value={120}>2 heures</MenuItem>
                  <MenuItem value={0}>Jamais (déconseillé)</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Grid>

          {/* Sauvegarde/restauration */}
          <Grid item xs={12}>
            <SectionTitle>
              <BackupIcon fontSize="small" /> Sauvegarde des données
            </SectionTitle>
            <Box sx={{ p: 2 }}>
              <FormControl fullWidth sx={{ mt: 1 }} disabled={!editMode.security || loading}>
                <InputLabel>Fréquence de sauvegarde automatique</InputLabel>
                <Select
                  value={securitySettings.backupFrequency}
                  onChange={(e) => setSecuritySettings({...securitySettings, backupFrequency: e.target.value})}
                  label="Fréquence de sauvegarde automatique"
                >
                  <MenuItem value="daily">Quotidienne</MenuItem>
                  <MenuItem value="weekly">Hebdomadaire</MenuItem>
                  <MenuItem value="monthly">Mensuelle</MenuItem>
                  <MenuItem value="never">Désactivée</MenuItem>
                </Select>
              </FormControl>
              <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Dernière sauvegarde: {securitySettings.lastBackup || 'Jamais'}
                </Typography>
                <ExcelButton 
                  variant="outlined" 
                  color="primary"
                  disabled={!editMode.security || loading}
                  startIcon={<BackupIcon fontSize="small" />}
                  onClick={() => {
                    // Logique de sauvegarde manuelle
                    const now = new Date().toLocaleString();
                    setSecuritySettings({...securitySettings, lastBackup: now});
                    showSnackbar('Sauvegarde effectuée avec succès', 'success');
                  }}
                >
                  Sauvegarder maintenant
                </ExcelButton>
              </Box>
            </Box>
          </Grid>

          {/* Section Sessions actives */}
          <Grid item xs={12}>
            <SectionTitle sx={{ mt: 3 }}>
              <SessionIcon fontSize="small" /> Sessions actives
            </SectionTitle>
            <Box sx={{ p: 2 }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Voici les appareils actuellement connectés à votre compte. Si vous ne reconnaissez pas une activité, veuillez changer votre mot de passe.
                </Typography>
                <ExcelButton 
                  variant="outlined" 
                  color="error" 
                  size="small"
                  onClick={handleLogoutOtherSessions}
                  disabled={activeSessions.length <= 1}
                  startIcon={<LogoutIcon fontSize="small" />}
                >
                  Déconnecter toutes les autres sessions
                </ExcelButton>
              </Box>
              
              <Box sx={{ border: (theme) => `1px solid ${theme.palette.divider}`, borderRadius: '4px', overflow: 'hidden' }}>
                <TableContainer component={Paper} elevation={0}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: (theme) => theme.palette.grey[100] }}>
                        <TableCell>Appareil</TableCell>
                        <TableCell>Localisation</TableCell>
                        <TableCell>Dernière activité</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                {activeSessions.map((session) => (
                  <TableRow 
                    key={session.id}
                    hover
                    sx={(theme) => ({
                      '&:last-child td, &:last-child th': { border: 0 },
                      bgcolor: session.current ? 'action.hover' : 'background.paper'
                    })}
                  >
                    <TableCell component="th" scope="row">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {session.current ? 
                          <ComputerIcon color="primary" sx={{ mr: 1 }} /> : 
                          <DevicesIcon color="action" sx={{ mr: 1 }} />}
                        <Box>
                          <Typography variant="body2">
                            {session.device}
                            {session.current && (
                              <Chip 
                                label="Actuelle" 
                                color="primary" 
                                size="small" 
                                sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} 
                              />
                            )}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {session.ip}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{session.location}</TableCell>
                    <TableCell>{formatLastActivity(session.lastActivity)}</TableCell>
                    <TableCell align="right">
                      {!session.current && (
                        <Tooltip title="Déconnecter">
                          <IconButton 
                            size="small"
                            onClick={() => handleLogoutSession(session.id)}
                            color="error"
                          >
                            <LogoutIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Box>
          </Grid>

          {editMode.security && (
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <StyledButton
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    // Enregistrer les paramètres de sécurité
                    setEditMode({ ...editMode, security: false });
                    showSnackbar('Paramètres de sécurité mis à jour', 'success');
                  }}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                >
                  {loading ? 'Enregistrement...' : 'Enregistrer les paramètres'}
                </StyledButton>
              </Box>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </StyledCard>
  );

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Paramètres du compte
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gérez vos informations personnelles, votre sécurité et vos préférences
        </Typography>
      </Box>

      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        indicatorColor="primary"
        textColor="primary"
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          mb: 3,
          '& .MuiTabs-indicator': {
            height: 4,
            borderRadius: '4px 4px 0 0',
          },
        }}
      >
        <StyledTab icon={<PersonIcon />} label="Profil" />
        <StyledTab icon={<LockIcon />} label="Mot de passe" />
        <StyledTab icon={<PaletteIcon />} label="Préférences" />
        <StyledTab icon={<SecurityPrivacyIcon />} label="Sécurité & confidentialité" />
      </Tabs>
      
      <Box>
        {activeTab === 0 && renderProfileForm()}
        {activeTab === 1 && renderPasswordForm()}
        {activeTab === 2 && renderPreferences()}
        {activeTab === 3 && renderSecurityPrivacy()}
      </Box>
      
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

export default Parametres;
