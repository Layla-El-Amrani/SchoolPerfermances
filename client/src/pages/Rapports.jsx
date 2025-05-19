import React, { useState } from 'react';
import { 
  Snackbar, 
  Alert, 
  Container, 
  Typography,
  Box,
} from '@mui/material';
import { 
  Assessment as AssessmentIcon,
  ListAlt as ListAltIcon,
} from '@mui/icons-material';
import InitialPageLoadIndicator from '../components/InitialPageLoadIndicator';
import { MainReportsCard, StyledTabs, StyledTab } from '../components/rapports/common/styles/styledComponents';
import DashboardStats from '../components/rapports/dashboard/DashboardStats';
import PerformanceChart from '../components/rapports/dashboard/PerformanceChart';
import GenerateReport from '../components/rapports/reports/GenerateReport';
import ReportsList from '../components/rapports/reports/ReportsList';
import useReports from '../components/rapports/hooks/useReports';
import useDashboard from '../components/rapports/hooks/useDashboard';

const Rapports = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const {
    loading,
    pageLoading,
    years,
    entities,
    generatedReports,
    searchTerm,
    pagination,
    selectedYear,
    setSelectedYear,
    reportType,
    selectedEntity,
    setSelectedEntity,
    reportOptions,
    exportFormat,
    setExportFormat,
    handleReportTypeChange,
    handleOptionChange,
    handleGenerateReport,
    handleDeleteReport,
    handleDownloadReport,
    handleChangePage,
    handleChangeRowsPerPage,
    handleSearch,
  } = useReports();

  const {
    loading: dashboardLoading,
    dashboardStats,
    performanceData,
    subjectDistribution,
    trendData,
  } = useDashboard();

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleGenerateReportWithFeedback = async (e) => {
    try {
      await handleGenerateReport(e);
      showSnackbar('Rapport généré avec succès', 'success');
      setActiveTab(1);
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Erreur lors de la génération du rapport', 'error');
    }
  };

  const handleDeleteReportWithFeedback = async (reportId) => {
    try {
      await handleDeleteReport(reportId);
      showSnackbar('Rapport supprimé avec succès', 'success');
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Erreur lors de la suppression du rapport', 'error');
    }
  };

  const handleDownloadReportWithFeedback = async (report) => {
    try {
      await handleDownloadReport(report);
      showSnackbar('Téléchargement réussi', 'success');
    } catch (error) {
      showSnackbar('Erreur lors du téléchargement', 'error');
    }
  };

  if (pageLoading) {
    return <InitialPageLoadIndicator />;
  }

  return (
    <Container maxWidth="xl">
      {/* Tableau de bord */}

      <Typography variant="h4" gutterBottom sx={{ mt: 6 }}>
          Rapports
      </Typography>

      <MainReportsCard>
        <StyledTabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="report tabs"
        >
          <StyledTab icon={<AssessmentIcon />} label="Générer un rapport" />
          <StyledTab icon={<ListAltIcon />} label="Rapports générés" />
        </StyledTabs>

        {activeTab === 0 ? (
          <Box sx={{ p: 3 }}>
            <GenerateReport
              years={years}
              entities={entities}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              reportType={reportType}
              handleReportTypeChange={handleReportTypeChange}
              selectedEntity={selectedEntity}
              setSelectedEntity={setSelectedEntity}
              reportOptions={reportOptions}
              handleOptionChange={handleOptionChange}
              exportFormat={exportFormat}
              setExportFormat={setExportFormat}
              loading={loading}
              handleGenerateReport={handleGenerateReportWithFeedback}
            />
          </Box>
        ) : (
          <Box sx={{ p: 3 }}>
            <ReportsList
              searchTerm={searchTerm}
              handleSearch={handleSearch}
              generatedReports={generatedReports}
              pagination={pagination}
              handleChangePage={handleChangePage}
              handleChangeRowsPerPage={handleChangeRowsPerPage}
              handleDownloadReport={handleDownloadReportWithFeedback}
              handleDeleteReport={handleDeleteReportWithFeedback}
            />
          </Box>
        )}
      </MainReportsCard>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Rapports;
