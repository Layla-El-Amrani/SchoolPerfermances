import { styled } from '@mui/material/styles';
import { Card, Box, Tabs, Tab, Button } from '@mui/material';

export const MainSettingsCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(0),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  marginTop: theme.spacing(3),
  overflow: 'hidden',
  border: `1px solid ${theme.palette.divider}`,
}));

export const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
    height: '3px',
    borderRadius: '3px 3px 0 0',
  },
  backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
}));

export const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  minWidth: 150,
  fontWeight: theme.typography.fontWeightRegular,
  marginRight: theme.spacing(0.5),
  padding: theme.spacing(1.5, 2.5),
  borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
  color: theme.palette.text.secondary,
  border: `1px solid transparent`,
  borderBottom: 'none',
  opacity: 0.85,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    color: theme.palette.text.primary,
    opacity: 1,
  },
  '&.Mui-selected': {
    color: theme.palette.primary.main,
    fontWeight: theme.typography.fontWeightSemiBold,
    backgroundColor: theme.palette.background.paper,
    borderTop: `1px solid ${theme.palette.divider}`,
    borderLeft: `1px solid ${theme.palette.divider}`,
    borderRight: `1px solid ${theme.palette.divider}`,
    opacity: 1,
  },
  '& .MuiTab-wrapper': {
    flexDirection: 'row',
    alignItems: 'center',
  },
  '& .MuiSvgIcon-root': {
    marginRight: theme.spacing(1),
    marginBottom: '0 !important',
    fontSize: '1.2rem',
  }
}));

export const TabPanelContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3.5),
  backgroundColor: theme.palette.background.paper,
}));

export const SettingItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(2),
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: theme.shadows[2],
    transform: 'translateY(-1px)',
  },
}));

export const StyledButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  borderRadius: '8px',
  padding: '10px 24px',
  fontWeight: theme.typography.fontWeightMedium,
  transition: 'all 0.2s ease',
  boxShadow: theme.shadows[1],
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: theme.shadows[3],
  }
})); 