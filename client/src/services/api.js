import axios from 'axios';
import { authApi } from './auth';

// Utiliser une variable d'environnement si disponible, sinon utiliser l'URL par défaut
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

console.log('API URL:', API_BASE_URL); // Pour le débogage

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    // Augmenter le timeout pour les gros fichiers
    timeout: 30000
});

// Ajouter un intercepteur de requête pour le débogage
api.interceptors.request.use(
    config => {
        console.log('Requête API:', {
            url: config.url,
            method: config.method,
            headers: config.headers
        });
        return config;
    },
    error => {
        console.error('Erreur de configuration de la requête:', error);
        return Promise.reject(error);
    }
);

// Ajouter un intercepteur de réponse
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response) {
            // Le serveur a répondu avec un statut autre que 2xx
            console.error('Erreur API:', {
                status: error.response.status,
                data: error.response.data,
                headers: error.response.headers
            });
        } else if (error.request) {
            // La requête a été faite mais pas de réponse
            console.error('Pas de réponse du serveur:', {
                request: error.request,
                config: error.config
            });
        } else {
            // Erreur de configuration de la requête
            console.error('Erreur de configuration:', error.message);
        }
        return Promise.reject(error);
    }
);

// Exporter les endpoints de l'API
export const apiEndpoints = {
    // Statistiques Province
    statsProvince: (annee) => '/province/stats',
    evolutionProvince: '/province/evolution',
    topEtablissements: (annee) => `/province/top-etablissements/${annee}`,
    statsParCycle: (annee) => `/province/cycles/${annee}`,
    comparaisonCommunes: (idProvince, annee) => `/province/comparaison-communes/${idProvince}/${annee}`,
    
    // Communes
    getCommunes: '/commune/communes',
    getCommune: (id) => `/commune/communes/${id}`,
    statCommune: (id, annee) => `/commune/${id}/stats/${annee}`,
    evolutionCommune: (id) => `/commune/${id}/evolution`,
    evolutionMoyennesParCycle: (id) => `/commune/${id}/evolution-cycles`,
    statsParCycleCommune: (id, annee) => `/commune/${id}/cycles/${annee}`,
    statsEtablissementsParCycle: (id, annee) => `/commune/${id}/stats/cycles/${annee}`,
    topEtablissementsCommune: (id, annee) => `/commune/${id}/top-etablissements${annee ? `/${annee}` : ''}`,
    
    // Établissements
    getEtablissements: '/etablissement',
    getEtablissementsByCommune: (code_commune) => `/etablissement/commune/${code_commune}`,
    statEtablissement: (id, annee) => `/etablissement/${id}/stats/${annee}`,
    // Helper pour niveaux d'un établissement (statNiveau retourne stats, pas la liste brute)
    niveauxEtablissement: (id, annee) => `/etablissement/${id}/niveaux/${annee}`,
    statNiveau: (id, annee, codeNiveau) =>
  typeof codeNiveau === 'string' && codeNiveau
    ? `/etablissement/${id}/niveaux/${annee}/${codeNiveau}`
    : `/etablissement/${id}/niveaux/${annee}`,
    statMatiere: (id, codeNiveau, annee) => `/etablissement/${id}/matieres/${codeNiveau}/${annee}`,
    evaluationAnnuelle: (id) => `/etablissement/${id}/evolution`,
    
    // Provinces
    getProvinces: '/provinces',
    
    // Rapports
    getRapports: '/rapports',
    generateRapport: '/rapports/generer',
    downloadReport: (id) => `/rapports/${id}/download`,
    deleteReport: (id) => `/rapports/${id}`,
   
    
    // Rapports
    rapportEtablissement: (id, annee) => `/rapports/etablissement/${id}/${annee}`,
    rapportCommune: (id, annee) => `/rapports/commune/${id}/${annee}`,
    rapportProvince: (id, annee) => `/rapports/province/${id}/${annee}`,
    
    // Import
    getAnneesScolaires: '/import/annees',
    addAnneeScolaire: '/import/annee',
    selectAnneeScolaire: '/import/annee/select',
    importResultats: '/import/resultats',
    importData: '/import/resultats',
    importHistory: '/import/history',
    downloadImport: '/import/download',
    
    // Paramètres
    changePassword: '/parametres/password',
    setAnneeActive: '/parametres/annee-active',
    getAnneeActive: '/parametres/annee-active',
    
    // Années Scolaires
    anneesScolaires: '/annees-scolaires',
    addAnneeScolaire: '/annees-scolaires',
    updateAnneeScolaire: (id) => `/annees-scolaires/${id}`,
    deleteAnneeScolaire: (id) => `/annees-scolaires/${id}`,
    setCourante: (id) => `/annees-scolaires/${id}/set-courante`,

    // Tableau de bord des rapports
    getDashboardStats: '/rapports/dashboard/stats',
    getPerformanceData: '/rapports/dashboard/performance',
    getSubjectDistribution: '/rapports/dashboard/subjects',
    getTrendData: '/rapports/dashboard/trends',

    // Profil utilisateur
    getUserProfile: '/user/profile',
    updateUserProfile: '/user/profile',
    updatePassword: '/user/password',
    updatePreferences: '/user/preferences',
};

// Utiliser authApi pour les requêtes protégées
export const protectedApi = authApi;

export default api;