import React, { useState, useEffect } from 'react';
import { Snackbar, Alert, Paper, Card, Button, Typography, Container, Grid, Box, Tabs, Tab, CircularProgress } from '@mui/material';
import { useTheme, styled } from '@mui/material/styles';

// Import des composants
import ProfilTab from '../components/parametres/ProfilTab';
import SecuriteTab from '../components/parametres/SecuriteTab';
import PreferencesTab from '../components/parametres/PreferencesTab';
import InitialPageLoadIndicator from '../components/InitialPageLoadIndicator';

// Icônes pour les onglets
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import TuneIcon from '@mui/icons-material/Tune';
import SettingsIcon from '@mui/icons-material/Settings';

// Styles personnalisés
const MainSettingsCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(0),
  borderRadius: theme.shape.borderRadius * 1.5,
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
  const [pageLoading, setPageLoading] = useState(true);
  
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
  
  // États pour l'édition
  const [editMode, setEditMode] = useState({
    profile: false,
    password: false,
    preferences: false,
  });

  useEffect(() => {
    // Simulate a brief loading period for initial page display or quick data hydration
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 500); // Show loader for 0.5 seconds, adjust as needed
    return () => clearTimeout(timer);
  }, []);

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
  const renderProfileForm = () => {
    return (
      <ProfilTab 
        user={userData}
        editMode={editMode.profile}
        loading={loading}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        setEditMode={(value) => setEditMode(prev => ({ ...prev, profile: value }))}
        showSnackbar={showSnackbar}
        StyledButton={StyledButton}
      />
    );
  };
  
  // Rendu du formulaire de mot de passe
  const renderPasswordForm = () => (
    <SecuriteTab 
      passwordData={passwordData}
      editMode={editMode.password}
      loading={loading}
      handlePasswordChange={handlePasswordChange}
      handlePasswordSubmit={handlePasswordSubmit}
      setEditMode={(value) => setEditMode(prev => ({ ...prev, password: value }))}
      togglePasswordVisibility={togglePasswordVisibility}
      showSnackbar={showSnackbar}
      StyledButton={StyledButton}
    />
  );
  
  // Rendu des préférences
  const renderPreferences = () => {
    return (
      <PreferencesTab 
        preferences={preferences}
        editMode={editMode.preferences}
        loading={loading}
        handlePreferenceChange={handlePreferenceChange}
        setEditMode={(value) => setEditMode(prev => ({ ...prev, preferences: value }))}
        showSnackbar={showSnackbar}
        StyledButton={StyledButton}
      />
    );
  };

  // TabPanel component
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

  // Conditional rendering for initial page load
  if (pageLoading) {
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
        <InitialPageLoadIndicator message="Chargement des paramètres..." />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
        <SettingsIcon color="primary" sx={{ fontSize: '2.2rem', mr: 1.2 }} />
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Paramètres du Compte
      </Typography>
      </Box>

      <MainSettingsCard>
        <StyledTabs 
        value={activeTab}
          onChange={handleTabChange} 
          aria-label="Onglets des paramètres"
        variant="scrollable"
        scrollButtons="auto"
      >
          <StyledTab icon={<PersonOutlineIcon />} label="Profil Utilisateur" id="settings-tab-0" aria-controls="settings-tabpanel-0" />
          <StyledTab icon={<LockOpenIcon />} label="Sécurité" id="settings-tab-1" aria-controls="settings-tabpanel-1" />
          <StyledTab icon={<TuneIcon />} label="Préférences" id="settings-tab-2" aria-controls="settings-tabpanel-2" />
        </StyledTabs>

        <TabPanel value={activeTab} index={0}>
          {renderProfileForm()}
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          {renderPasswordForm()}
        </TabPanel>
        <TabPanel value={activeTab} index={2}>
          {renderPreferences()}
        </TabPanel>
      </MainSettingsCard>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Parametres;
