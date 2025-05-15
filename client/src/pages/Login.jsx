import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, CircularProgress, Alert, InputAdornment, Avatar, Link as MuiLink, IconButton } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { login } from '../services/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setLoginSuccess(false);
    try {
      await login({ email, password });
      window.location.href = '/'; // Rediriger vers l'accueil ou dashboard
      setLoginSuccess(true);
    } catch (err) {
      setError(
        err?.response?.data?.message || 'Échec de la connexion. Vérifiez vos identifiants.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
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
        backgroundImage: `url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1500&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        zIndex: 0,
        filter: 'brightness(0.7) blur(2px)',
      },
    }}>
      <Paper elevation={0} sx={{
        p: { xs: 2, sm: 4 },
        minWidth: { xs: 340, sm: 420 },
        maxWidth: 520,
        borderRadius: '20px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.15), 0 2px 10px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: theme => theme.spacing(2.5),
        position: 'relative',
        zIndex: 2,
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        transition: 'box-shadow 0.4s ease, transform 0.3s ease',
        '&:hover': {
          boxShadow: '0 16px 56px rgba(60, 63, 131, 0.25), 0 6px 16px rgba(0, 0, 0, 0.1)',
        }
      }}>
        <Box sx={{ width: 96, height: 96, display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1 }}>
          <img
            src="/logo.png"
            alt="Logo"
            style={{ width: '86px', height: '86px', objectFit: 'contain', borderRadius: 20, boxShadow: '0 8px 28px 0 rgba(60,63,131,0.13), 0 2px 8px 0 rgba(60,63,131,0.10)' }}
          />
        </Box>
        <Typography variant="h4" fontWeight={700} mb={0.5} align="center" color="primary.dark" letterSpacing={1} sx={{ fontFamily: 'inherit' }}>
          Connexion
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={2} align="center" sx={{ fontSize: { xs: '1rem', sm: '1.07rem' }, fontFamily: 'inherit' }}>
          Accédez à votre espace personnel
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2, width: '100%' }}>{error}</Alert>}
        {loginSuccess && (
          <Alert severity="success" sx={{ mb: 2, width: '100%' }}>
            Connexion réussie !
          </Alert>
        )}
        {!loginSuccess && (
          <>
            <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '8px', animation: 'fadeIn 0.7s cubic-bezier(.4,0,.2,1)' }} autoComplete="on">
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
                type={showPassword ? 'text' : 'password'}
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
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
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
                  mt: 2,
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
              <Box sx={{ mt: 2.5, textAlign: 'center' }}>
                <MuiLink 
                  href="#" 
                  variant="body2"
                  sx={{ 
                    color: 'primary.main', 
                    textDecoration: 'underline',
                    textDecorationColor: 'primary.light',
                    fontWeight: 500, 
                    letterSpacing: 0.3, 
                    transition: 'color 0.2s, text-decoration-color 0.2s',
                    fontSize: '0.95rem',
                    '&:hover': {
                      color: 'primary.dark',
                      textDecorationColor: 'primary.main',
                    }
                  }}>
                  Mot de passe oublié ?
                </MuiLink>
              </Box>
            </form>
          </>
        )}
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