import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
} from '@mui/material';

const SecuriteTab = ({ loading, setLoading, showSnackbar }) => {
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      showSnackbar('Les mots de passe ne correspondent pas', 'error');
      return;
    }

    setLoading(true);
    try {
      // Appel API pour changer le mot de passe
      // await protectedApi.put(apiEndpoints.changePassword, {
      //   current_password: passwords.currentPassword,
      //   new_password: passwords.newPassword,
      // });
      
      showSnackbar('Mot de passe mis à jour avec succès', 'success');
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      showSnackbar('Erreur lors de la mise à jour du mot de passe', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="security-card">
      <CardContent>
        <Typography variant="h6" className="security-title">
          Changer le mot de passe
        </Typography>

        <form onSubmit={handleSubmit} className="security-form">
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mot de passe actuel"
                name="currentPassword"
                type="password"
                value={passwords.currentPassword}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nouveau mot de passe"
                name="newPassword"
                type="password"
                value={passwords.newPassword}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Confirmer le nouveau mot de passe"
                name="confirmPassword"
                type="password"
                value={passwords.confirmPassword}
                onChange={handleChange}
                required
              />
            </Grid>
          </Grid>

          <Box className="security-actions">
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
            </Button>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
};

export default SecuriteTab; 