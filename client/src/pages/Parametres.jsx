import React, { useState } from 'react';
import { Snackbar, Alert, Paper, Card, Button, Typography } from '@mui/material';
import { useTheme, styled } from '@mui/material/styles';
import { Box, Tabs, Tab, CircularProgress } from '@mui/material';

// Import des composants
import ProfilTab from '../components/parametres/ProfilTab';
import SecuriteTab from '../components/parametres/SecuriteTab';
import PreferencesTab from '../components/parametres/PreferencesTab';
import SecuriteConfidentialite from '../components/parametres/SecuriteConfidentialite';

// Icônes pour les onglets
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import PaletteIcon from '@mui/icons-material/Palette';
import SecurityIcon from '@mui/icons-material/Security';

// Styles personnalisés
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '12px',
  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
  marginBottom: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
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
  minWidth: 120,
  fontWeight: 500,
  '&.Mui-selected': {
    color: theme.palette.primary.main,
    fontWeight: 600,
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
  
  // États pour l'édition
  const [editMode, setEditMode] = useState({
    profile: false,
    password: false,
    preferences: false
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
  const renderProfileForm = () => {
    return (
      <ProfilTab 
        user={userData}
        editMode={editMode}
        loading={loading}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        setEditMode={setEditMode}
      />
    );
  };
  
  // Rendu du formulaire de mot de passe
  const renderPasswordForm = () => (
    <SecuriteTab 
      passwordData={passwordData}
      editMode={editMode}
      loading={loading}
      handlePasswordChange={handlePasswordChange}
      handlePasswordSubmit={handlePasswordSubmit}
      setEditMode={setEditMode}
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
      />
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Paramètres du compte
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Gérez vos informations personnelles, votre sécurité et vos préférences.
      </Typography>

      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 3 }}
      >
        <StyledTab icon={<PersonIcon />} label="Profil" />
        <StyledTab icon={<LockIcon />} label="Sécurité" />
        <StyledTab icon={<PaletteIcon />} label="Préférences" />
        <StyledTab icon={<SecurityIcon />} label="Confidentialité" />
      </Tabs>

      <Box>
        {activeTab === 0 && renderProfileForm()}
        {activeTab === 1 && renderPasswordForm()}
        {activeTab === 2 && renderPreferences()}
        {activeTab === 3 && <SecuriteConfidentialite />}
      </Box>

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
