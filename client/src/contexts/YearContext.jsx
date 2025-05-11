import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiEndpoints } from '../services/api';
import api from '../services/api';

const YearContext = createContext(null);

export const YearProvider = ({ children }) => {
    const [selectedYear, setSelectedYear] = useState('');
    const [years, setYears] = useState([]);

    useEffect(() => {
        fetchYears();
    }, []);

    const fetchYears = async () => {
        try {
            const response = await api.get(apiEndpoints.getAnneesScolaires);
            const yearsData = response.data.data;
            const years = yearsData.map(item => item.annee_scolaire);
            setYears(years);
            if (years.length > 0) {
                setSelectedYear(years[0]);
            }
        } catch (error) {
            console.error('Error fetching years:', error);
        }
    };

    return (
        <YearContext.Provider value={{ selectedYear, setSelectedYear, years }}>
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
