import React from 'react';
import { Edit as EditIcon, Close as CloseIcon } from '@mui/icons-material';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  IconButton,
  Divider,
  CircularProgress
} from '@mui/material';
import { Person as PersonIcon, Email as EmailIcon, Phone as PhoneIcon, Save as SaveIcon } from '@mui/icons-material';

const ProfilTab = ({ 
  user, 
  editMode, 
  loading, 
  handleChange, 
  handleSubmit,
  setEditMode 
}) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
          <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
          Profil
        </Typography>
        <Box>
          {!editMode.profile ? (
            <Button
              variant="outlined"
              startIcon={<EditIcon fontSize="small" />}
              onClick={() => setEditMode({ ...editMode, profile: true })}
            >
              Modifier
            </Button>
          ) : (
            <Button
              variant="outlined"
              color="error"
              startIcon={<CloseIcon fontSize="small" />}
              onClick={() => setEditMode({ ...editMode, profile: false })}
              sx={{ mr: 1 }}
            >
              Annuler
            </Button>
          )}
        </Box>
      </Box>

      
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar
                src={user.avatar}
                sx={{
                  width: 120,
                  height: 120,
                  mb: 2,
                  fontSize: '3rem',
                  bgcolor: 'primary.main',
                }}
              >
                {user.nom ? user.nom.charAt(0).toUpperCase() : ''}
              </Avatar>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="avatar-upload"
                type="file"
                disabled={!editMode.profile}
              />
              <label htmlFor="avatar-upload">
                <Button
                  variant="outlined"
                  component="span"
                  disabled={!editMode.profile}
                >
                  Changer la photo
                </Button>
              </label>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nom"
                  name="nom"
                  value={user.nom || ''}
                  onChange={handleChange}
                  disabled={!editMode.profile || loading}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Prénom"
                  name="prenom"
                  value={user.prenom || ''}
                  onChange={handleChange}
                  disabled={!editMode.profile || loading}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={user.email || ''}
                  onChange={handleChange}
                  disabled={!editMode.profile || loading}
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <EmailIcon color="action" sx={{ mr: 1, color: 'text.secondary' }} />
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Téléphone"
                  name="telephone"
                  value={user.telephone || ''}
                  onChange={handleChange}
                  disabled={!editMode.profile || loading}
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <PhoneIcon color="action" sx={{ mr: 1, color: 'text.secondary' }} />
                    ),
                  }}
                />
              </Grid>
              {editMode.profile && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                    >
                      {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                    </Button>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default ProfilTab;
