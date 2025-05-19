import { useState, useEffect } from 'react';
import { api, apiEndpoints } from '../../../services/api';

const useDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    totalStudents: 0,
    averageScore: 0,
    passRate: 0,
    topPerformingSubject: '',
  });
  const [performanceData, setPerformanceData] = useState([]);
  const [subjectDistribution, setSubjectDistribution] = useState([]);
  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        console.log('Début de la récupération des données du tableau de bord');
        
        const [statsResponse, performanceResponse, distributionResponse, trendResponse] = await Promise.all([
          api.get(apiEndpoints.getDashboardStats),
          api.get(apiEndpoints.getPerformanceData),
          api.get(apiEndpoints.getSubjectDistribution),
          api.get(apiEndpoints.getTrendData)
        ]);

        console.log('Réponses API:', {
          stats: statsResponse.data,
          performance: performanceResponse.data,
          distribution: distributionResponse.data,
          trend: trendResponse.data
        });

        if (statsResponse.data?.success) {
          setDashboardStats(statsResponse.data.data);
        } else {
          console.error('Format de réponse invalide pour les statistiques:', statsResponse.data);
        }

        if (performanceResponse.data?.success) {
          setPerformanceData(performanceResponse.data.data);
        } else {
          console.error('Format de réponse invalide pour les performances:', performanceResponse.data);
        }

        if (distributionResponse.data?.success) {
          setSubjectDistribution(distributionResponse.data.data);
        } else {
          console.error('Format de réponse invalide pour la distribution:', distributionResponse.data);
        }

        if (trendResponse.data?.success) {
          setTrendData(trendResponse.data.data);
        } else {
          console.error('Format de réponse invalide pour les tendances:', trendResponse.data);
        }

      } catch (error) {
        console.error('Erreur lors du chargement des données du tableau de bord:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return {
    loading,
    dashboardStats,
    performanceData,
    subjectDistribution,
    trendData,
  };
};

export default useDashboard; 