import { styled } from '@mui/material/styles';
import { 
  Card, 
  Tabs, 
  Tab, 
  Box, 
  Button, 
  TableRow, 
  Card as MuiCard,
  Typography,
  Paper
} from '@mui/material';

export const MainReportsCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(0),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[3],
  marginTop: theme.spacing(3),
  overflow: 'hidden',
}));

export const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
    height: '3px',
  },
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
}));

export const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  minWidth: 180,
  fontWeight: theme.typography.fontWeightMedium,
  marginRight: theme.spacing(1),
  padding: theme.spacing(1.5, 2.5),
  borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
  color: theme.palette.text.secondary,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    color: theme.palette.text.primary,
  },
  '&.Mui-selected': {
    color: theme.palette.primary.main,
    fontWeight: theme.typography.fontWeightBold,
    backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[800],
  },
  '& .MuiTab-wrapper': {
    flexDirection: 'row',
    alignItems: 'center',
  },
  '& .MuiSvgIcon-root': {
    marginRight: theme.spacing(1),
    marginBottom: '0 !important',
    fontSize: '1.25rem',
  }
}));

export const TabPanelContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
}));

export const StyledButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  borderRadius: '8px',
  padding: '10px 20px',
  fontWeight: 500,
  '&:hover': {
    boxShadow: theme.shadows[2],
  }
}));

export const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
  '& td, & th': {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  '& td:not(:last-child), & th:not(:last-child)': {
    borderRight: `1px solid ${theme.palette.divider}`,
  }
}));

export const DashboardCard = styled(MuiCard)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

export const StatValue = styled(Typography)(({ theme }) => ({
  fontSize: '2rem',
  fontWeight: 'bold',
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(1),
}));

export const StatLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.875rem',
}));

export const ChartContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
})); 