import React from 'react';
import {
  Typography,
  Grid,
  Box,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import { Save as SaveIcon, Edit as EditIcon } from '@mui/icons-material';

const PreferencesTab = ({
  preferences,
  editMode,
  loading,
  handlePreferenceChange,
  handlePreferenceSubmit,
  setEditMode,
}) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Préférences générales
      </Typography>
      <form onSubmit={handlePreferenceSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <div className="setting-item">
              <div className="setting-item-content">
                <Typography variant="subtitle1" className="setting-item-title">
                  Mode sombre
                </Typography>
                <Typography variant="body2" className="setting-item-description">
                  Activer le thème sombre pour l'interface
                </Typography>
              </div>
              <Switch
                name="darkMode"
                checked={preferences.darkMode}
                onChange={handlePreferenceChange}
                disabled={!editMode.preferences}
              />
            </div>
          </Grid>
          <Grid item xs={12}>
            <div className="setting-item">
              <div className="setting-item-content">
                <Typography variant="subtitle1" className="setting-item-title">
                  Notifications
                </Typography>
                <Typography variant="body2" className="setting-item-description">
                  Recevoir des notifications sur les mises à jour importantes
                </Typography>
              </div>
              <Switch
                name="notifications"
                checked={preferences.notifications}
                onChange={handlePreferenceChange}
                disabled={!editMode.preferences}
              />
            </div>
          </Grid>
          <Grid item xs={12}>
            <div className="setting-item">
              <div className="setting-item-content">
                <Typography variant="subtitle1" className="setting-item-title">
                  Newsletter
                </Typography>
                <Typography variant="body2" className="setting-item-description">
                  Recevoir la newsletter mensuelle
                </Typography>
              </div>
              <Switch
                name="newsletter"
                checked={preferences.newsletter}
                onChange={handlePreferenceChange}
                disabled={!editMode.preferences}
              />
            </div>
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
            <div className="settings-actions">
              {editMode.preferences ? (
                <>
                  <Button
                    variant="outlined"
                    className="settings-button"
                    onClick={() => setEditMode(prev => ({ ...prev, preferences: false }))}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    className="settings-button"
                    startIcon={<SaveIcon />}
                    disabled={loading}
                  >
                    Enregistrer
                  </Button>
                </>
              ) : (
                <Button
                  variant="contained"
                  className="settings-button"
                  startIcon={<EditIcon />}
                  onClick={() => setEditMode(prev => ({ ...prev, preferences: true }))}
                >
                  Modifier
                </Button>
              )}
            </div>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default PreferencesTab; 