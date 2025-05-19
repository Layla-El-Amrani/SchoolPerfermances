import React, { useState, useEffect } from 'react';
import { 
  Snackbar, 
  Alert,  // Ajouté pour la gestion des notifications
  Paper, 
  Card, 
  Button, 
  Typography, 
  Container, 
  Grid, 
  Box, 
  Tabs, 
  Tab, 
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  IconButton,
  Avatar,
  Chip,
} from '@mui/material';
import { useTheme, styled } from '@mui/material/styles';
import { 
  PersonOutline as PersonOutlineIcon,
  LockOpen as LockOpenIcon,
  Tune as TuneIcon,
  Settings as SettingsIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Language as LanguageIcon,
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
} from '@mui/icons-material';
import { api, protectedApi, apiEndpoints } from '../services/api';
import InitialPageLoadIndicator from '../components/InitialPageLoadIndicator';
import ProfilTab from '../components/parametres/ProfilTab';
import SecuriteTab from '../components/parametres/SecuriteTab';

// Styles personnalisés
const MainSettingsCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(0),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  marginTop: theme.spacing(3),
  overflow: 'hidden',
  border: `1px solid ${theme.palette.divider}`,
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
    height: '3px',
    borderRadius: '3px 3px 0 0',
  },
  backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  minWidth: 150,
  fontWeight: theme.typography.fontWeightRegular,
  marginRight: theme.spacing(0.5),
  padding: theme.spacing(1.5, 2.5),
  borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
  color: theme.palette.text.secondary,
  border: `1px solid transparent`,
  borderBottom: 'none',
  opacity: 0.85,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    color: theme.palette.text.primary,
    opacity: 1,
  },
  '&.Mui-selected': {
    color: theme.palette.primary.main,
    fontWeight: theme.typography.fontWeightSemiBold,
    backgroundColor: theme.palette.background.paper,
    borderTop: `1px solid ${theme.palette.divider}`,
    borderLeft: `1px solid ${theme.palette.divider}`,
    borderRight: `1px solid ${theme.palette.divider}`,
    opacity: 1,
  },
  '& .MuiTab-wrapper': {
    flexDirection: 'row',
    alignItems: 'center',
  },
  '& .MuiSvgIcon-root': {
    marginRight: theme.spacing(1),
    marginBottom: '0 !important',
    fontSize: '1.2rem',
  }
}));

const TabPanelContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3.5),
  backgroundColor: theme.palette.background.paper,
}));

const StyledButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  borderRadius: '8px',
  padding: '10px 24px',
  fontWeight: theme.typography.fontWeightMedium,
  transition: 'all 0.2s ease',
  boxShadow: theme.shadows[1],
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: theme.shadows[3],
  }
}));

const SettingSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  '&:last-child': {
    marginBottom: 0,
  },
}));

const SettingItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(2),
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: theme.shadows[2],
    transform: 'translateY(-1px)',
  },
}));

const Parametres = () => {
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

  // États pour les onglets
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  
  // États pour le profil utilisateur
  const [userData, setUserData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    photo: '',
    role: '',
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
  
  // États pour l'édition
  const [editMode, setEditMode] = useState({
    profile: false,
    password: false,
    preferences: false,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await protectedApi.get(apiEndpoints.getUserProfile);
        if (response.data) {
          setUserData(response.data);
          if (response.data.preferences) {
            setPreferences(response.data.preferences);
          }
        } else {
          throw new Error('Format de réponse invalide');
        }
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
        showSnackbar(error.response?.data?.message || 'Erreur lors du chargement du profil', 'error');
      }
    };

    fetchUserData();
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Gestion des changements de formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  // t3dat 3likom bhad Mui f projet Css knto tkhdmo b tailwind ola separiw les fichier d css
  const handlePreferenceChange = (e) => {
    const { name, value, checked } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: checked !== undefined ? checked : value
    }));
  };
  
  // Basculer la visibilité du mot de passe
  const togglePasswordVisibility = (field) => {
    setPasswordData({
      ...passwordData,
      [field]: !passwordData[field]
    });
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    // Au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await protectedApi.put(apiEndpoints.updateUserProfile, userData);
      showSnackbar('Profil mis à jour avec succès', 'success');
      setEditMode(prev => ({ ...prev, profile: false }));
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      showSnackbar(error.response?.data?.message || 'Erreur lors de la mise à jour du profil', 'error');
    } finally {
      setLoading(false);
    }
  };

  // const handlePasswordSubmit = async (e) => {
  //   // e.preventDefault();
  //   setLoading(true);
  //   try {
  //     const response = await protectedApi.put(apiEndpoints.updatePassword, {
  //       current_password: passwordData.currentPassword,
  //       new_password: passwordData.newPassword,
  //       new_password_confirmation: passwordData.confirmPassword
  //     });
  //     showSnackbar('Mot de passe mis à jour avec succès', 'success');
  //     setPasswordData({
  //       currentPassword: '',
  //       newPassword: '',
  //       confirmPassword: '',
  //       showPassword: false,
  //       showNewPassword: false,
  //       showConfirmPassword: false
  //     });
  //     setEditMode(prev => ({ ...prev, password: false }));
  //   } catch (error) {
  //     console.error('Erreur lors de la mise à jour du mot de passe:', error);
  //     showSnackbar(error.response?.data?.message || 'Erreur lors de la mise à jour du mot de passe', 'error');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handlePreferenceSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await protectedApi.put(apiEndpoints.updatePreferences, preferences);
      showSnackbar('Préférences mises à jour avec succès', 'success');
      setEditMode(prev => ({ ...prev, preferences: false }));
    } catch (error) {
      console.error('Erreur lors de la mise à jour des préférences:', error);
      showSnackbar(error.response?.data?.message || 'Erreur lors de la mise à jour des préférences', 'error');
    } finally {
      setLoading(false);
    }
  };

  function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`settings-tabpanel-${index}`}
        aria-labelledby={`settings-tab-${index}`}
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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleGenerateReportWithFeedback = async (e) => {
    try {
        const message = await handleGenerateReport(e);
        showSnackbar(message, 'success');
        setActiveTab(1);
    } catch (error) {
        showSnackbar(error.message || 'Erreur lors de la génération du rapport', 'error');
    }
  };

  if (pageLoading) {
    return <InitialPageLoadIndicator />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, color: theme.palette.primary.main }}>
        Paramètres
      </Typography>

      <MainSettingsCard>
        <StyledTabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="settings tabs"
        >
          <StyledTab icon={<PersonOutlineIcon />} label="Profil" />
          <StyledTab icon={<LockOpenIcon />} label="Sécurité" />
          <StyledTab icon={<TuneIcon />} label="Préférences" />
        </StyledTabs>

        <TabPanel value={activeTab} index={0}>
          {/* <SettingSection> */}
            <ProfilTab
              user={userData}
              editMode={editMode}
              loading={loading}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              setEditMode={setEditMode}
            />
          {/* </SettingSection> */}
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <SettingSection>
            <SecuriteTab
              loading={loading}
              setLoading={setLoading}
            />
          </SettingSection>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <SettingSection>
            <Typography variant="h6" gutterBottom>
              Préférences générales
            </Typography>
            <form onSubmit={handlePreferenceSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <SettingItem>
                    <Box>
                      <Typography variant="subtitle1">Mode sombre</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Activer le thème sombre pour l'interface
                      </Typography>
                    </Box>
                    <Switch
                      name="darkMode"
                      checked={preferences.darkMode}
                      onChange={handlePreferenceChange}
                      disabled={!editMode.preferences}
                    />
                  </SettingItem>
                </Grid>
                <Grid item xs={12}>
                  <SettingItem>
                    <Box>
                      <Typography variant="subtitle1">Notifications</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Recevoir des notifications sur les mises à jour importantes
                      </Typography>
                    </Box>
                    <Switch
                      name="notifications"
                      checked={preferences.notifications}
                      onChange={handlePreferenceChange}
                      disabled={!editMode.preferences}
                    />
                  </SettingItem>
                </Grid>
                <Grid item xs={12}>
                  <SettingItem>
                    <Box>
                      <Typography variant="subtitle1">Newsletter</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Recevoir la newsletter mensuelle
                      </Typography>
                    </Box>
                    <Switch
                      name="newsletter"
                      checked={preferences.newsletter}
                      onChange={handlePreferenceChange}
                      disabled={!editMode.preferences}
                    />
                  </SettingItem>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Langue</InputLabel>
                    <Select
                      name="language"
                      value={preferences.language}
                      onChange={handlePreferenceChange}
                      label="Langue"
                      disabled={!editMode.preferences}
                    >
                      <MenuItem value="fr">Français</MenuItem>
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="ar">العربية</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    {editMode.preferences ? (
                      <>
                        <Button
                          variant="outlined"
                          onClick={() => setEditMode(prev => ({ ...prev, preferences: false }))}
                        >
                          Annuler
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          startIcon={<SaveIcon />}
                          disabled={loading}
                        >
                          Enregistrer
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="contained"
                        startIcon={<EditIcon />}
                        onClick={() => setEditMode(prev => ({ ...prev, preferences: true }))}
                      >
                        Modifier
                      </Button>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </form>
          </SettingSection>
        </TabPanel>
      </MainSettingsCard>

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
    </Container>
  );
};

export default Parametres;
