import React from 'react';
import {
  Box,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { StyledTableRow } from '../common/styles/styledComponents';

const ReportsList = ({
  searchTerm,
  handleSearch,
  generatedReports,
  pagination,
  handleChangePage,
  handleChangeRowsPerPage,
  handleDownloadReport,
  handleDeleteReport,
}) => {
  return (
    <>
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Rechercher un rapport..."
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            endAdornment: searchTerm && (
              <IconButton onClick={() => handleSearch({ target: { value: '' } })} size="small">
                <DeleteIcon />
              </IconButton>
            ),
          }}
        />
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Entité</TableCell>
              <TableCell>Format</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {generatedReports.map((report) => (
              <StyledTableRow key={report.id}>
                <TableCell>{new Date(report.createdAt).toLocaleString()}</TableCell>
                <TableCell>
                  <Chip
                    label={report.type}
                    color="primary"
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{report.entityName}</TableCell>
                <TableCell>
                  <Chip
                    icon={report.format === 'pdf' ? <PictureAsPdfIcon /> : <AssessmentIcon />}
                    label={report.format.toUpperCase()}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={report.status}
                    color={report.status === 'completed' ? 'success' : 'warning'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Télécharger">
                      <IconButton
                        size="small"
                        onClick={() => handleDownloadReport(report)}
                        disabled={report.status !== 'completed'}
                      >
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteReport(report.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={pagination.totalItems}
        page={pagination.page}
        onPageChange={handleChangePage}
        rowsPerPage={pagination.rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </>
  );
};

export default ReportsList; 