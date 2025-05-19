import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  Box,
} from '@mui/material';
import { PhotoCamera as PhotoCameraIcon } from '@mui/icons-material';

const ProfilTab = ({
  user,
  editMode,
  loading,
  handleChange,
  handleSubmit,
  setEditMode,
  showSnackbar,
}) => {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange({
          target: {
            name: 'photo',
            value: reader.result,
          },
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card className="profile-card">
      <CardContent>
        <Box className="profile-header">
          <Avatar
            src={user.photo}
            alt={`${user.prenom} ${user.nom}`}
            className="profile-avatar"
          />
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="photo-upload"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="photo-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<PhotoCameraIcon />}
              className="upload-button"
            >
              Changer la photo
            </Button>
          </label>
        </Box>

        <form onSubmit={handleSubmit} className="profile-form">
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nom"
                name="nom"
                value={user.nom}
                onChange={handleChange}
                disabled={!editMode.profile}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Prénom"
                name="prenom"
                value={user.prenom}
                onChange={handleChange}
                disabled={!editMode.profile}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={user.email}
                onChange={handleChange}
                disabled={!editMode.profile}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Téléphone"
                name="telephone"
                value={user.telephone}
                onChange={handleChange}
                disabled={!editMode.profile}
              />
            </Grid>
          </Grid>

          <Box className="profile-actions">
            {editMode.profile ? (
              <>
                <Button
                  variant="outlined"
                  onClick={() => setEditMode(prev => ({ ...prev, profile: false }))}
                  disabled={loading}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                onClick={() => setEditMode(prev => ({ ...prev, profile: true }))}
              >
                Modifier le profil
              </Button>
            )}
          </Box>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfilTab; 