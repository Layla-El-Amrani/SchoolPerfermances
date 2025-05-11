import React from 'react';
import { 
  Palette as PaletteIcon, 
  Settings as SettingsIcon, 
  Language as LanguageIcon, 
  Notifications as NotificationsIcon, 
  Save as SaveIcon 
} from '@mui/icons-material';
import {
  Box,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Button,
  CircularProgress
} from '@mui/material';

const PreferencesTab = ({ 
  preferences, 
  editMode, 
  loading, 
  handlePreferencesChange, 
  handleSavePreferences,
  setEditMode
}) => {
  if (!editMode.preferences) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Préférences
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Thème: {preferences.theme === 'light' ? 'Clair' : preferences.theme === 'dark' ? 'Sombre' : 'Système'}
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Langue: {preferences.language === 'fr' ? 'Français' : preferences.language === 'en' ? 'English' : 'العربية'}
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Notifications: {preferences.notifications.email ? 'Activées' : 'Désactivées'}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setEditMode({ ...editMode, preferences: true })}
          startIcon={<PaletteIcon />}
          sx={{ mt: 2 }}
        >
          Modifier les préférences
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Préférences
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth margin="normal" disabled={!editMode.preferences || loading}>
            <InputLabel>Thème</InputLabel>
            <Select
              value={preferences.theme}
              onChange={(e) => handlePreferencesChange('theme', e.target.value)}
              label="Thème"
              startAdornment={
                <PaletteIcon color="action" sx={{ mr: 1 }} />
              }
            >
              <MenuItem value="light">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 20, height: 20, bgcolor: '#f5f5f5', mr: 1, border: '1px solid #ddd' }} />
                  Clair
                </Box>
              </MenuItem>
              <MenuItem value="dark">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 20, height: 20, bgcolor: '#424242', mr: 1, border: '1px solid #333' }} />
                  Sombre
                </Box>
              </MenuItem>
              <MenuItem value="system">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <SettingsIcon sx={{ mr: 1 }} />
                  Système
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth margin="normal" disabled={!editMode.preferences || loading}>
            <InputLabel>Langue</InputLabel>
            <Select
              value={preferences.language}
              onChange={(e) => handlePreferencesChange('language', e.target.value)}
              label="Langue"
              startAdornment={
                <LanguageIcon color="action" sx={{ mr: 1 }} />
              }
            >
              <MenuItem value="fr">Français</MenuItem>
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="ar">العربية</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <NotificationsIcon sx={{ mr: 1, color: 'primary.main' }} />
              Notifications
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.notifications.email}
                  onChange={(e) => handlePreferencesChange('notifications', {
                    ...preferences.notifications,
                    email: e.target.checked
                  })}
                  color="primary"
                  disabled={!editMode.preferences || loading}
                />
              }
              label="Activer les notifications par email"
              sx={{ display: 'block', mb: 1 }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.notifications.push}
                  onChange={(e) => handlePreferencesChange('notifications', {
                    ...preferences.notifications,
                    push: e.target.checked
                  })}
                  color="primary"
                  disabled={!editMode.preferences || loading}
                />
              }
              label="Activer les notifications push"
              sx={{ display: 'block', mb: 1 }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.notifications.sound}
                  onChange={(e) => handlePreferencesChange('notifications', {
                    ...preferences.notifications,
                    sound: e.target.checked
                  })}
                  color="primary"
                  disabled={!editMode.preferences || loading}
                />
              }
              label="Activer les sons de notification"
            />
          </Box>
        </Grid>

        {editMode.preferences && (
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSavePreferences}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              >
                {loading ? 'Enregistrement...' : 'Enregistrer les préférences'}
              </Button>
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default PreferencesTab;
