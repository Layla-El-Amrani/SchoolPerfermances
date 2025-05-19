import { useState, useEffect } from 'react';
import { protectedApi, apiEndpoints } from '../../../services/api';

const useSettings = () => {
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  
  const [userData, setUserData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    photo: '',
    role: '',
  });
  
  const [preferences, setPreferences] = useState({
    darkMode: false,
    notifications: true,
    newsletter: true,
    language: 'fr',
  });
  
  const [editMode, setEditMode] = useState({
    profile: false,
    password: false,
    preferences: false,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await protectedApi.get(apiEndpoints.getUserProfile);
        if (response.data) {
          setUserData(response.data);
          if (response.data.preferences) {
            setPreferences(response.data.preferences);
          }
        } else {
          throw new Error('Format de réponse invalide');
        }
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
        throw error;
      }
    };

    fetchUserData();
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePreferenceChange = (e) => {
    const { name, value, checked } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: checked !== undefined ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await protectedApi.put(apiEndpoints.updateUserProfile, userData);
      setEditMode(prev => ({ ...prev, profile: false }));
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await protectedApi.put(apiEndpoints.updatePreferences, preferences);
      setEditMode(prev => ({ ...prev, preferences: false }));
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des préférences:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    pageLoading,
    userData,
    preferences,
    editMode,
    setEditMode,
    handleChange,
    handlePreferenceChange,
    handleSubmit,
    handlePreferenceSubmit
  };
};

export default useSettings; 