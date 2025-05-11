import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  FormGroup,
  Paper,
  Grid
} from '@mui/material';
import {
  Security as SecurityIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Backup as BackupIcon,
  Restore as RestoreIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

const SecuriteConfidentialite = () => {
  // État pour la configuration des accès
  const [accessConfig, setAccessConfig] = useState({
    twoFactorAuth: true,
    loginAlerts: true,
    passwordChangeRequired: false
  });

  // État pour les sessions actives
  const [activeSessions, setActiveSessions] = useState([
    { id: 1, device: 'Windows 10 - Chrome', location: 'Rabat, Maroc', lastActive: '2 minutes ago', current: true },
    { id: 2, device: 'Android - Chrome', location: 'Casablanca, Maroc', lastActive: '1 heure ago', current: false },
  ]);

  // États pour les modales
  const [backupDialogOpen, setBackupDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [backupName, setBackupName] = useState('');

  // Gestion des changements de configuration
  const handleConfigChange = (config) => (event) => {
    setAccessConfig({
      ...accessConfig,
      [config]: event.target.checked,
    });
  };

  // Gestion de la déconnexion d'une session
  const handleLogoutSession = (sessionId) => {
    setActiveSessions(activeSessions.filter(session => session.id !== sessionId));
  };

  // Gestion de la sauvegarde
  const handleBackup = () => {
    // Logique de sauvegarde ici
    console.log('Sauvegarde effectuée avec le nom:', backupName);
    setBackupDialogOpen(false);
    setBackupName('');
  };

  // Gestion de la restauration
  const handleRestore = (event) => {
    // Logique de restauration ici
    const file = event.target.files[0];
    if (file) {
      console.log('Fichier à restaurer:', file.name);
      setRestoreDialogOpen(false);
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      {/* En-tête de la section */}
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} />
        Sécurité & confidentialité
      </Typography>

      {/* Configuration des accès */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
          <LockIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
          Configuration des accès
        </Typography>
        
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={accessConfig.twoFactorAuth}
                onChange={handleConfigChange('twoFactorAuth')}
                color="primary"
              />
            }
            label="Authentification à deux facteurs"
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={accessConfig.loginAlerts}
                onChange={handleConfigChange('loginAlerts')}
                color="primary"
              />
            }
            label="Alertes de connexion"
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={accessConfig.passwordChangeRequired}
                onChange={handleConfigChange('passwordChangeRequired')}
                color="primary"
              />
            }
            label="Changement de mot de passe obligatoire tous les 90 jours"
          />
        </FormGroup>
      </Paper>


      {/* Sessions actives */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
          <VisibilityIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
          Sessions actives
        </Typography>
        
        <List>
          {activeSessions.map((session) => (
            <React.Fragment key={session.id}>
              <ListItem>
                <ListItemText
                  primary={session.device}
                  secondary={`${session.location} • ${session.lastActive} ${session.current ? '(Session actuelle)' : ''}`}
                />
                <ListItemSecondaryAction>
                  {!session.current && (
                    <IconButton 
                      edge="end" 
                      aria-label="Déconnecter"
                      onClick={() => handleLogoutSession(session.id)}
                    >
                      <DeleteIcon color="error" />
                    </IconButton>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))}
        </List>
      </Paper>

      {/* Sauvegarde/Restauration des données */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
          <BackupIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
          Sauvegarde et restauration des données
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Button
              variant="outlined"
              startIcon={<BackupIcon />}
              onClick={() => setBackupDialogOpen(true)}
              fullWidth
            >
              Sauvegarder les données
            </Button>
          </Grid>
          <Grid item xs={12} md={6}>
            <Button
              variant="outlined"
              startIcon={<RestoreIcon />}
              onClick={() => setRestoreDialogOpen(true)}
              fullWidth
            >
              Restaurer les données
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Boîte de dialogue de sauvegarde */}
      <Dialog open={backupDialogOpen} onClose={() => setBackupDialogOpen(false)}>
        <DialogTitle>Sauvegarder les données</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nom de la sauvegarde"
            fullWidth
            variant="outlined"
            value={backupName}
            onChange={(e) => setBackupName(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBackupDialogOpen(false)}>Annuler</Button>
          <Button 
            onClick={handleBackup} 
            variant="contained" 
            color="primary"
            disabled={!backupName.trim()}
          >
            Sauvegarder
          </Button>
        </DialogActions>
      </Dialog>

      {/* Boîte de dialogue de restauration */}
      <Dialog open={restoreDialogOpen} onClose={() => setRestoreDialogOpen(false)}>
        <DialogTitle>Restaurer les données</DialogTitle>
        <DialogContent>
          <input
            accept=".json"
            style={{ display: 'none' }}
            id="restore-file"
            type="file"
            onChange={handleRestore}
          />
          <label htmlFor="restore-file">
            <Button
              variant="contained"
              component="span"
              startIcon={<RestoreIcon />}
              fullWidth
              sx={{ mt: 2 }}
            >
              Sélectionner un fichier de sauvegarde
            </Button>
          </label>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            Sélectionnez un fichier de sauvegarde (.json) pour restaurer vos données.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestoreDialogOpen(false)}>Annuler</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SecuriteConfidentialite;
