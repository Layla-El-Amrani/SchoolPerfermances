import React from 'react';
import {
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  FormLabel,
  Box,
} from '@mui/material';
import { Assessment as AssessmentIcon } from '@mui/icons-material';
import { StyledButton } from '../common/styles/styledComponents';

const GenerateReport = ({
  selectedYear,
  setSelectedYear,
  reportType,
  handleReportTypeChange,
  selectedEntity,
  setSelectedEntity,
  reportOptions,
  handleOptionChange,
  exportFormat,
  setExportFormat,
  loading,
  handleGenerateReport,
}) => {
  // Définition des données directement dans le fichier
  const years = ['2021-2022', '2022-2023', '2023-2024'];
  const entities = [
    { id: 1, name: 'Établissement A' },
    { id: 2, name: 'Commune B' },
    { id: 3, name: 'District C' },
  ];

  return (
    <Box component="form" onSubmit={handleGenerateReport}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth required>
            <InputLabel>Année scolaire</InputLabel>
            <Select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              label="Année scolaire"
            >
              {years.map((year) => (
                <MenuItem key={year} value={year}>{year}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth required>
            <InputLabel>Type de rapport</InputLabel>
            <Select
              value={reportType}
              onChange={handleReportTypeChange}
              label="Type de rapport"
            >
              <MenuItem value="establishment">Établissement</MenuItem>
              <MenuItem value="commune">Commune</MenuItem>
              <MenuItem value="district">District</MenuItem>
              <MenuItem value="province">Province</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth required>
            <InputLabel>Entité</InputLabel>
            <Select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              label="Entité"
            >
              {entities.map((entity) => (
                <MenuItem key={entity.id} value={entity.id}>
                  {entity.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Reste inchangé */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Options du rapport
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={reportOptions.includeGeneralStats}
                    onChange={handleOptionChange}
                    name="includeGeneralStats"
                  />
                }
                label="Statistiques générales"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={reportOptions.includeLevelStats}
                    onChange={handleOptionChange}
                    name="includeLevelStats"
                  />
                }
                label="Statistiques par niveau"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={reportOptions.includeSubjectStats}
                    onChange={handleOptionChange}
                    name="includeSubjectStats"
                  />
                }
                label="Statistiques par matière"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={reportOptions.includeCharts}
                    onChange={handleOptionChange}
                    name="includeCharts"
                  />
                }
                label="Inclure les graphiques"
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Format d'export</FormLabel>
            <RadioGroup
              row
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
            >
              <FormControlLabel value="pdf" control={<Radio />} label="PDF" />
              <FormControlLabel value="excel" control={<Radio />} label="Excel" />
            </RadioGroup>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <StyledButton
              type="submit"
              variant="contained"
              startIcon={<AssessmentIcon />}
              disabled={loading}
            >
              Générer le rapport
            </StyledButton>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default GenerateReport;
