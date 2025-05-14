import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, CircularProgress, Alert, InputAdornment, Avatar } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import { login } from '../services/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login({ email, password });
      window.location.href = '/'; // Rediriger vers l'accueil ou dashboard
    } catch (err) {
      setError(
        err?.response?.data?.message || 'Échec de la connexion. Vérifiez vos identifiants.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      position: 'relative',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      m: 0,
      p: 0,
      overflow: 'hidden',
      '::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: `url('https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=1500&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        zIndex: 0,
        filter: 'brightness(0.7) blur(1px)',
      },
      '::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(120deg, #3C3F83cc 0%, #6D83F2bb 100%)',
        zIndex: 1,
      },
    }}>
      <Paper elevation={0} sx={{
        p: { xs: 2, sm: 4 },
        minWidth: { xs: 340, sm: 420 },
        maxWidth: 520,
        borderRadius: 5,
        boxShadow: '0 8px 40px 0 rgba(60,63,131,0.18), 0 1.5px 4px 0 rgba(60,63,131,0.10)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        position: 'relative',
        zIndex: 2,
        background: 'rgba(255,255,255,0.65)',
        border: '1.5px solid rgba(255,255,255,0.45)',
        backdropFilter: 'blur(7px)',
        WebkitBackdropFilter: 'blur(7px)',
        transition: 'box-shadow 0.3s',
      }}>
        <Box sx={{ width: 96, height: 96, display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1.5 }}>
          <img
            src="/logo.png"
            alt="Logo"
            style={{ width: '86px', height: '86px', objectFit: 'contain', borderRadius: 20, boxShadow: '0 8px 28px 0 rgba(60,63,131,0.13), 0 2px 8px 0 rgba(60,63,131,0.10)' }}
          />
        </Box>
        <Typography variant="h4" fontWeight={700} mb={0.5} align="center" color="primary.dark" letterSpacing={1} sx={{ fontFamily: 'inherit' }}>
          Connexion
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={1.5} align="center" sx={{ fontSize: { xs: '1rem', sm: '1.07rem' }, fontFamily: 'inherit' }}>
          Accédez à votre espace personnel
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2, width: '100%' }}>{error}</Alert>}
        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 22, marginTop: 8, animation: 'fadeIn 0.7s cubic-bezier(.4,0,.2,1)' }} autoComplete="on">
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            fullWidth
            required
            margin="none"
            autoFocus
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlinedIcon color="primary" />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 4,
                background: 'rgba(255,255,255,0.93)',
                boxShadow: '0 1px 4px 0 rgba(60,63,131,0.07)',
                border: '1.5px solid rgba(60,63,131,0.08)',
                transition: 'box-shadow 0.2s, border 0.2s',
                '&:hover': {
                  boxShadow: '0 2px 8px 0 rgba(60,63,131,0.13)',
                  border: '1.5px solid #6D83F2',
                },
                '&.Mui-focused': {
                  boxShadow: '0 2px 12px 0 rgba(60,63,131,0.22)',
                  border: '1.5px solid #3C3F83',
                },
              },
            }}
            sx={{
              mb: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: 4,
              },
              fontFamily: 'inherit',
              fontSize: { xs: '1rem', sm: '1.08rem' },
            }}
          />
          <TextField
            label="Mot de passe"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            fullWidth
            required
            margin="none"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <VpnKeyOutlinedIcon color="primary" />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 4,
                background: 'rgba(255,255,255,0.93)',
                boxShadow: '0 1px 4px 0 rgba(60,63,131,0.07)',
                border: '1.5px solid rgba(60,63,131,0.08)',
                transition: 'box-shadow 0.2s, border 0.2s',
                '&:hover': {
                  boxShadow: '0 2px 8px 0 rgba(60,63,131,0.13)',
                  border: '1.5px solid #6D83F2',
                },
                '&.Mui-focused': {
                  boxShadow: '0 2px 12px 0 rgba(60,63,131,0.22)',
                  border: '1.5px solid #3C3F83',
                },
              },
            }}
            sx={{
              mb: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: 4,
              },
              fontFamily: 'inherit',
              fontSize: { xs: '1rem', sm: '1.08rem' },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              mt: 1.5,
              py: 1.6,
              fontWeight: 'bold',
              fontSize: '1.18rem',
              borderRadius: 4,
              boxShadow: '0 8px 32px 0 rgba(60,63,131,0.20)',
              background: 'linear-gradient(90deg, #3C3F83 35%, #6D83F2 100%)',
              letterSpacing: 1,
              textTransform: 'none',
              transition: '0.22s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              '&:hover': {
                background: 'linear-gradient(90deg, #6D83F2 0%, #3C3F83 100%)',
                boxShadow: '0 12px 40px 0 rgba(60,63,131,0.26)',
                transform: 'translateY(-2px) scale(1.025)',
              },
              '&:active': {
                boxShadow: '0 2px 8px 0 rgba(60,63,131,0.12)',
              },
            }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={26} color="inherit" /> : (
              <>
                <LockOutlinedIcon sx={{ mr: 1, fontSize: 24 }} /> Se connecter
              </>
            )}
          </Button>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <a href="#" style={{ color: '#3C3F83', textDecoration: 'underline', fontSize: '1rem', opacity: 0.82, fontWeight: 500, letterSpacing: 0.3, transition: 'color 0.2s' }}
              onMouseOver={e => e.target.style.color = '#6D83F2'}
              onMouseOut={e => e.target.style.color = '#3C3F83'}
            >Mot de passe oublié ?</a>
          </Box>
        </form>
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(24px) scale(0.98); }
            to { opacity: 1; transform: none; }
          }
        `}</style>
      </Paper>
    </Box>
  );
};

export default Login;