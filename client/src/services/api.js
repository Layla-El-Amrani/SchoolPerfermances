import axios from 'axios';
import { authApi } from './auth';

const API_BASE_URL = 'http://localhost:8000/api';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Ajouter un intercepteur de réponse
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response) {
            // Le serveur a répondu avec un statut autre que 2xx
            console.error('Erreur API:', error.response.data);
        } else if (error.request) {
            // La requête a été faite mais pas de réponse
            console.error('Pas de réponse du serveur:', error.request);
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
    getEtablissements: '/etablissements',
    getEtablissementsByCommune: (code_commune) => `/etablissement/by-commune?code_commune=${encodeURIComponent(code_commune)}`,
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
   
    
    // Rapports
    rapportEtablissement: (id, annee) => `/rapports/etablissement/${id}/${annee}`,
    rapportCommune: (id, annee) => `/rapports/commune/${id}/${annee}`,
    rapportProvince: (id, annee) => `/rapports/province/${id}/${annee}`,
    
    // Import
    getAnneesScolaires: '/import/annees',
    addAnneeScolaire: '/import/annee',
    selectAnneeScolaire: '/import/annee/select',
    importResultats: '/import/resultats',
    
    // Paramètres
    changePassword: '/parametres/password',
    setAnneeActive: '/parametres/annee-active',
    getAnneeActive: '/parametres/annee-active',
    
    // Années Scolaires
    anneesScolaires: '/annees-scolaires',
    addAnneeScolaire: '/annees-scolaires',
    updateAnneeScolaire: (id) => `/annees-scolaires/${id}`,
    deleteAnneeScolaire: (id) => `/annees-scolaires/${id}`,
    setCourante: (id) => `/annees-scolaires/${id}/set-courante`
};

// Utiliser authApi pour les requêtes protégées
export const protectedApi = authApi;

export default api;