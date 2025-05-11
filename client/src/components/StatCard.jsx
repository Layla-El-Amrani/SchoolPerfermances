import React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  alpha, 
  useTheme,
  styled
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  LocationCity as CommuneIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  EmojiEvents as SuccessIcon,
  Warning as WarningIcon,
  Assessment as AverageIcon
} from '@mui/icons-material';

const StyledCard = styled(Card)(({ theme, color }) => ({
  height: '100%',
  width: '100%',
  minWidth: '280px',
  maxWidth: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '16px',
  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
  transition: 'all 0.3s cubic-bezier(.25,.8,.25,1)',
  border: '1px solid',
  borderColor: theme.palette.divider,
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: `0 8px 25px 0 ${alpha(theme.palette[color]?.main || theme.palette.primary.main, 0.15)}`,
    borderColor: alpha(theme.palette[color]?.main || theme.palette.primary.main, 0.3)
  },
  '& .MuiCardContent-root': {
    padding: theme.spacing(3),
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
  }
}));

const IconContainer = styled(Box)(({ theme, color }) => ({
  width: '56px',
  height: '56px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: alpha(theme.palette[color]?.main || theme.palette.primary.main, 0.1),
  color: theme.palette[color]?.main || theme.palette.primary.main,
  marginBottom: theme.spacing(2),
  '& svg': {
    fontSize: '28px'
  }
}));

const TrendBadge = styled(Box)(({ theme, trend }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: `${theme.spacing(0.5)} ${theme.spacing(1)}`,
  borderRadius: '12px',
  fontSize: '0.75rem',
  fontWeight: 600,
  marginLeft: theme.spacing(1),
  backgroundColor: trend > 0 
    ? alpha(theme.palette.success.main, 0.1) 
    : trend < 0 
      ? alpha(theme.palette.error.main, 0.1)
      : alpha(theme.palette.text.secondary, 0.1),
  color: trend > 0 
    ? theme.palette.success.main 
    : trend < 0 
      ? theme.palette.error.main
      : theme.palette.text.secondary,
  '& svg': {
    fontSize: '1rem',
    marginRight: theme.spacing(0.5)
  }
}));

const StatCard = ({ title, value, type, trend = 0 }) => {
  const theme = useTheme();
  
  const getIcon = () => {
    switch (type) {
      case 'communes':
        return <CommuneIcon />;
      case 'etablissements':
        return <SchoolIcon />;
      case 'eleves':
        return <PeopleIcon />;
      case 'moyenne':
        return <AverageIcon />;
      case 'reussite':
        return <SuccessIcon />;
      case 'echec':
        return <WarningIcon />;
      default:
        return null;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'communes':
        return 'primary';
      case 'etablissements':
        return 'secondary';
      case 'eleves':
        return 'info';
      case 'moyenne':
        return 'success';
      case 'reussite':
        return 'success';
      case 'echec':
        return 'error';
      default:
        return 'primary';
    }
  };

  const formatValue = () => {
    if (type === 'moyenne' || type === 'reussite' || type === 'echec') {
      return typeof value === 'number' ? value.toFixed(2) : value;
    }
    return value?.toLocaleString() || '0';
  };

  const getTrend = () => {
    if (trend > 0) {
      return (
        <TrendBadge trend={trend}>
          <TrendingUpIcon />
          {Math.abs(trend)}%
        </TrendBadge>
      );
    } else if (trend < 0) {
      return (
        <TrendBadge trend={trend}>
          <TrendingDownIcon />
          {Math.abs(trend)}%
        </TrendBadge>
      );
    }
    return (
      <TrendBadge trend={0}>
        <TrendingFlatIcon />
        0%
      </TrendBadge>
    );
  };

  const color = getColor();

  return (
    <StyledCard color={color}>
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box>
              <Typography 
                variant="subtitle2" 
                color="textSecondary"
                sx={{ 
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  mb: 1,
                  opacity: 0.8,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '160px'
                }}
              >
                {title}
              </Typography>
              <Box display="flex" alignItems="flex-end" flexWrap="wrap" sx={{ gap: 1 }}>
                <Typography 
                  variant="h4" 
                  component="div"
                  sx={{ 
                    fontWeight: 700,
                    color: theme.palette.text.primary,
                    lineHeight: 1.2,
                    fontSize: '1.8rem',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {formatValue()}
                </Typography>
                {getTrend()}
              </Box>
            </Box>
            <IconContainer color={color}>
              {getIcon()}
            </IconContainer>
          </Box>
          
          <Box sx={{ mt: 'auto', pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Typography 
              variant="caption" 
              color="textSecondary"
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                fontSize: '0.75rem',
                whiteSpace: 'nowrap'
              }}
            >
              {type === 'moyenne' || type === 'reussite' || type === 'echec' 
                ? 'Moyenne sur 20' 
                : 'Total'}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default StatCard;
