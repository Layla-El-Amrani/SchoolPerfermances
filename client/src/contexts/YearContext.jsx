import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiEndpoints } from '../services/api';
import api from '../services/api';

const YearContext = createContext(null);

export const YearProvider = ({ children }) => {
    const [selectedYear, setSelectedYear] = useState('');
    const [years, setYears] = useState([]);
    const [loading, setLoading] = useState(true);
    const [globalLoading, setGlobalLoading] = useState(false);
    const [error, setError] = useState(null);

    const changeYear = useCallback((year) => {
        setSelectedYear(year);
        setGlobalLoading(true);
        // Simuler un chargement de 1 seconde
        setTimeout(() => {
            setGlobalLoading(false);
        }, 1000);
    }, []);

    const fetchYears = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get(apiEndpoints.getAnneesScolaires);
            const yearsData = response.data.data || [];
            const years = yearsData.map(item => item.annee_scolaire);
            setYears(years);
            if (years.length > 0) {
                setSelectedYear(years[0]);
            }
        } catch (error) {
            console.error('Error fetching years:', error);
            setError('Erreur lors du chargement des années scolaires');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchYears();
    }, []);

    return (
        <YearContext.Provider value={{ 
            selectedYear, 
            setSelectedYear: changeYear, 
            years, 
            loading,
            globalLoading,
            error 
        }}>
            {children}
        </YearContext.Provider>
    );
};

export const useYear = () => {
    const context = useContext(YearContext);
    if (context === null) {
        throw new Error('useYear must be used within a YearProvider');
    }
    return context;
};
