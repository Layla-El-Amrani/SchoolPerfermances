import { useState, useEffect, useCallback } from 'react';
import { apiEndpoints, protectedApi } from '../../../services/api';

/**
 * Hook de gestion des rapports
 * Toutes les requêtes sont centralisées ici afin de garder le composant
 * Rapports le plus léger possible.
 */
const INITIAL_PAGINATION = {
  page: 0,
  rowsPerPage: 10,
  totalItems: 0,
  totalPages: 0,
};

const INITIAL_OPTIONS = {
  includeGeneralStats: true,
  includeLevelStats: true,
  includeSubjectStats: true,
  includeCharts: true,
};

const useReports = () => {
  /* -------------------- états généraux -------------------- */
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  /* -------------------- données récupérées -------------------- */
  const [years, setYears] = useState([]);
  const [entities, setEntities] = useState([]);
  const [generatedReports, setGeneratedReports] = useState([]);

  /* -------------------- recherche & pagination --------------- */
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState(INITIAL_PAGINATION);

  /* -------------------- formulaire de génération -------------- */
  const [selectedYear, setSelectedYear] = useState('');
  const [reportType, setReportType] = useState('province'); // valeur par défaut
  const [selectedEntity, setSelectedEntity] = useState('');
  const [reportOptions, setReportOptions] = useState(INITIAL_OPTIONS);
  const [exportFormat, setExportFormat] = useState('pdf');

  /* ----------------------------------------------------------- */
  const logAxiosError = (error, context) => {
    console.error(`${context}:`, error);
    if (error?.response) {
      const { status, data, headers, config } = error.response;
      console.error('Détails :', { status, data, headers, url: config?.url, method: config?.method });
    }
  };

  /* ----------------- chargement initial ---------------------- */
  useEffect(() => {
    let cancelled = false;

    const fetchInitialData = async () => {
      try {
        const [yearsRes, entitiesRes] = await Promise.all([
          protectedApi.get(apiEndpoints.getAnneesScolaires),
          protectedApi.get(apiEndpoints.getEtablissements),
        ]);

        if (cancelled) return;

        /* années scolaires */
        if (yearsRes.data?.success) {
          const data = yearsRes.data.data ?? [];
          setYears(data);
          setSelectedYear(prev => prev || data?.[0] || '');
        } else {
          console.error('Format de réponse invalide pour les années scolaires:', yearsRes.data);
        }

        /* établissements */
        if (entitiesRes.data?.success) {
          const data = entitiesRes.data.data ?? [];
          setEntities(data);
          setSelectedEntity(prev => prev || data?.[0]?.id || '');
        } else {
          console.error('Format de réponse invalide pour les établissements:', entitiesRes.data);
        }

        await loadGeneratedReports();
      } catch (err) {
        logAxiosError(err, 'Erreur lors du chargement initial');
      } finally {
        if (!cancelled) setPageLoading(false);
      }
    };

    fetchInitialData();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------------- rapports générés --------------------- */
  const loadGeneratedReports = useCallback(async (
    page = pagination.page,
    limit = pagination.rowsPerPage,
    search = searchTerm,
  ) => {
    try {
      const res = await protectedApi.get(apiEndpoints.getRapports, {
        params: { page: page + 1, limit, search },
      });

      if (res.data?.success) {
        const { reports = [], total = 0 } = res.data.data;
        setGeneratedReports(reports);
        setPagination(prev => ({
          ...prev,
          totalItems: total,
          totalPages: Math.ceil(total / prev.rowsPerPage),
        }));
      } else {
        console.error('Format de réponse invalide pour les rapports:', res.data);
      }
    } catch (err) {
      logAxiosError(err, 'Erreur lors du chargement des rapports');
    }
  }, [pagination.page, pagination.rowsPerPage, searchTerm]);

  useEffect(() => {
    loadGeneratedReports();
  }, [loadGeneratedReports, pagination.page, pagination.rowsPerPage, searchTerm]);

  /* ------------------- handlers formulaire ------------------ */
  const handleReportTypeChange = event => {
    const newType = event.target.value;
    setReportType(newType);
    setReportOptions({
      includeGeneralStats: true,
      includeLevelStats: ['establishment', 'commune'].includes(newType),
      includeSubjectStats: ['establishment', 'commune'].includes(newType),
      includeCharts: true,
    });
  };

  const handleOptionChange = event =>
    setReportOptions(opts => ({ ...opts, [event.target.name]: event.target.checked }));

  /* ------------------- génération --------------------------- */
  const handleGenerateReport = async e => {
    e?.preventDefault?.();

    if (!selectedYear || !reportType) throw new Error('Année scolaire et type de rapport requis');

    setLoading(true);
    try {
      const body = {
        year: selectedYear,
        type: reportType,
        entity: selectedEntity,
        options: reportOptions,
        format: exportFormat,
      };

      const res = await protectedApi.post(apiEndpoints.generateRapport, body);

      if (res.data?.success) {
        await loadGeneratedReports();
        return true;
      }
      throw new Error(res.data?.message || 'Erreur lors de la génération du rapport');
    } catch (err) {
      logAxiosError(err, 'Erreur lors de la génération');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /* ------------------- suppression -------------------------- */
  const handleDeleteReport = async id => {
    setLoading(true);
    try {
      const res = await protectedApi.delete(apiEndpoints.deleteReport(id));
      if (res.data?.success) {
        await loadGeneratedReports();
        return true;
      }
      throw new Error(res.data?.message || 'Erreur lors de la suppression');
    } catch (err) {
      logAxiosError(err, 'Erreur lors de la suppression');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /* ------------------- téléchargement ----------------------- */
  const handleDownloadReport = async report => {
    try {
      const res = await protectedApi.get(apiEndpoints.downloadReport(report.id), { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = report.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      return true;
    } catch (err) {
      logAxiosError(err, 'Erreur lors du téléchargement');
      throw err;
    }
  };

  /* ------------------- pagination & recherche --------------- */
  const handleChangePage = (_, newPage) => setPagination(prev => ({ ...prev, page: newPage }));
  const handleChangeRowsPerPage = e =>
    setPagination(prev => ({ ...prev, page: 0, rowsPerPage: parseInt(e.target.value, 10) }));
  const handleSearch = e => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  /* ------------------- retour du hook ----------------------- */
  return {
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
  };
};

export default useReports;
