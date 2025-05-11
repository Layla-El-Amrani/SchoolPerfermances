import React from 'react';
import { 
  Grid, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Box,
  Typography,
  styled 
} from '@mui/material';

const FilterContainer = styled(Paper)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  padding: theme.spacing(3),
  borderRadius: '12px',
  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
}));

const FilterSection = ({ 
  title,
  filters,
  onFilterChange,
  selectedValues,
  loading = {}
}) => {
  return (
    <FilterContainer elevation={0}>
      {title && (
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
      )}
      <Grid container spacing={2}>
        {filters.map((filter) => (
          <Grid item xs={12} md={6} key={filter.id}>
            <FormControl fullWidth disabled={loading[filter.id]}>
              <InputLabel id={`${filter.id}-label`}>
                {filter.label}
              </InputLabel>
              <Select
                labelId={`${filter.id}-label`}
                id={filter.id}
                value={selectedValues[filter.id] || ''}
                label={filter.label}
                onChange={(e) => onFilterChange(filter.id, e.target.value)}
                variant="outlined"
                fullWidth
              >
                <MenuItem value="">
                  <em>Tous</em>
                </MenuItem>
                {filter.options.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        ))}
      </Grid>
    </FilterContainer>
  );
};

export default FilterSection;
