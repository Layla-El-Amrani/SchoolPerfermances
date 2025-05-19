import React from 'react';
import { Grid, Typography } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { ChartContainer } from '../common/styles/styledComponents';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const PerformanceChart = ({ trendData, subjectDistribution }) => {
  console.log('PerformanceChart - Données reçues:', { trendData, subjectDistribution });

  // Vérifier si les données sont valides
  const isValidTrendData = Array.isArray(trendData) && trendData.length > 0;
  const isValidSubjectDistribution = Array.isArray(subjectDistribution) && subjectDistribution.length > 0;

  if (!isValidTrendData || !isValidSubjectDistribution) {
    console.warn('Données invalides pour les graphiques:', {
      trendData: isValidTrendData ? 'OK' : 'Invalide',
      subjectDistribution: isValidSubjectDistribution ? 'OK' : 'Invalide'
    });
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <ChartContainer>
          <Typography variant="h6" gutterBottom>
            Évolution des Performances
          </Typography>
          {isValidTrendData ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="moyenne" stroke="#8884d8" name="Moyenne" />
                <Line type="monotone" dataKey="reussite" stroke="#82ca9d" name="Taux de Réussite" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Typography color="text.secondary" align="center">
              Aucune donnée disponible pour l'évolution des performances
            </Typography>
          )}
        </ChartContainer>
      </Grid>

      <Grid item xs={12} md={4}>
        <ChartContainer>
          <Typography variant="h6" gutterBottom>
            Distribution par Matière
          </Typography>
          {isValidSubjectDistribution ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={subjectDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {subjectDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <Typography color="text.secondary" align="center">
              Aucune donnée disponible pour la distribution par matière
            </Typography>
          )}
        </ChartContainer>
      </Grid>
    </Grid>
  );
};

export default PerformanceChart; 