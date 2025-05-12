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
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WarningIcon from '@mui/icons-material/Warning';
import AssessmentIcon from '@mui/icons-material/Assessment';

const StyledCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'color' && prop !== 'fullHeight',
})(({ theme, color, fullHeight }) => ({
  height: '100%',
  width: '100%',
  minHeight: '160px',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
  ...(color && {
    borderLeft: `4px solid ${theme.palette[color]?.main || theme.palette.primary.main}`,
  }),
  '& .MuiCardContent-root': {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: theme.spacing(2),
    '&:last-child': {
      paddingBottom: theme.spacing(2),
    },
  },
  ...(fullHeight && {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  })
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

const StatCard = (props) => {
  const { 
    title, 
    value, 
    type, 
    trend = 0, 
    subtitle, 
    fullHeight = true, 
    icon: IconProp,
    sx = {}
  } = props;
  const theme = useTheme();
  
  // Configuration des icônes par type
  const getIconConfig = () => {
    if (IconProp) {
      return {
        Icon: IconProp,
        color: color
      };
    }
    
    switch (type) {
      case 'communes':
        return {
          Icon: LocationCityIcon,
          color: 'primary'
        };
      case 'etablissements':
        return {
          Icon: SchoolIcon,
          color: 'secondary'
        };
      case 'eleves':
        return {
          Icon: PeopleIcon,
          color: 'info'
        };
      case 'moyenne':
        return {
          Icon: AssessmentIcon,
          color: 'success'
        };
      case 'reussite':
        return {
          Icon: EmojiEventsIcon,
          color: 'success'
        };
      case 'echec':
        return {
          Icon: WarningIcon,
          color: 'error'
        };
      case 'rang':
        return {
          Icon: EmojiEventsIcon,
          color: 'warning'
        };
      default:
        return {
          Icon: null,
          color: 'primary'
        };
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
      case 'rang':
        return 'warning';
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
  const iconConfig = getIconConfig();
  const Icon = iconConfig?.Icon || null;
  const iconColor = iconConfig?.color || color;
  
  return (
    <StyledCard color={color} fullHeight={fullHeight} sx={sx}>
      <CardContent>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'space-between',
          flexGrow: 1,
          minHeight: '100px'
        }}>
          <Box display="flex" flexDirection="column" alignItems="flex-start" mb={2}>
            {Icon && (
              <Box 
                sx={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: alpha(theme.palette[iconColor]?.main || theme.palette.primary.main, 0.1),
                  color: theme.palette[iconColor]?.main || theme.palette.primary.main,
                  marginBottom: 2,
                  '& svg': {
                    fontSize: '20px'
                  }
                }}
              >
                <Icon />
              </Box>
            )}
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
                  maxWidth: '100%'
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
                    fontSize: '1.6rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {formatValue()}
                </Typography>
                {getTrend()}
              </Box>
            </Box>
          </Box>
          
          {subtitle && (
            <Box sx={{ mt: 'auto', pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
              <Typography 
                variant="caption" 
                color="textSecondary"
                sx={{ 
                  display: 'block',
                  fontSize: '0.75rem',
                  lineHeight: 1.4
                }}
              >
                {subtitle}
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default StatCard;
