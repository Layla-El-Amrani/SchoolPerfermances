import React, { useState, useEffect } from 'react';
import { Container, Grid, Box } from '@mui/material';
import ProvinceCard from '../components/ProvinceCard';
import { api, apiEndpoints } from '../services/api';
import { useTranslation } from '../hooks/useTranslation';
import { useYear } from '../contexts/YearContext';
import './Dashboard.css';

const Dashboard = () => {
    const { t } = useTranslation();
    const [provinces, setProvinces] = useState([]);
    const [stats, setStats] = useState({});
    const { selectedYear } = useYear();

    useEffect(() => {
        if (selectedYear) {
            fetchProvinces();
        }
    }, [selectedYear]);

    const fetchProvinces = async () => {
        try {
            const response = await api.get(apiEndpoints.getCommunes());
            if (!response.data || !response.data.data) {
                console.error('No data received from API');
                return;
            }
            const provincesData = response.data.data;
            
            // Grouper les communes par province
            const groupedProvinces = {};
            provincesData.forEach(commune => {
                if (!groupedProvinces[commune.province_id]) {
                    groupedProvinces[commune.province_id] = {
                        nom: commune.province_nom,
                        communes: []
                    };
                }
                groupedProvinces[commune.province_id].communes.push(commune);
            });

            // Convertir l'objet en tableau
            const provincesArray = Object.values(groupedProvinces);
            setProvinces(provincesArray);

            // Récupérer les stats pour chaque province
            const statsPromises = provincesArray.map(province => {
                const provinceId = province.communes[0]?.province_id;
                if (!provinceId) {
                    console.error('No province ID found for province:', province);
                    return null;
                }
                return api.get(apiEndpoints.statsProvince(selectedYear), {
                    params: { province_id: provinceId }
                });
            }).filter(Boolean);

            const statsResponses = await Promise.all(statsPromises);
            const provinceStats = statsResponses.map((response, index) => {
                if (!response?.data?.data) {
                    console.error('Invalid response for province:', provincesArray[index]);
                    return null;
                }
                return {
                    province_id: provincesArray[index].communes[0].province_id,
                    stats: response.data.data
                };
            }).filter(Boolean);

            setStats(provinceStats);

        } catch (error) {
            console.error('Error fetching provinces:', error);
        }
    };

    return (
        <Container className="dashboard">
            <Box sx={{ mb: 4 }}>
                <h1>{t('dashboard.title')}</h1>
            </Box>
            <Grid container spacing={3}>
                {provinces.map(province => {
                    const provinceStats = stats.find(stat => 
                        stat.province_id === province.communes[0].province_id
                    )?.stats || {};
                    return (
                        <Grid item xs={12} sm={6} md={4} key={province.communes[0].province_id}>
                            <ProvinceCard
                                province={province}
                                stats={provinceStats}
                            />
                        </Grid>
                    );
                })}
            </Grid>
        </Container>
    );
};

export default Dashboard;