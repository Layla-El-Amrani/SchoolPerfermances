import React, { useState, useEffect } from 'react';
import { FaExpandArrowsAlt, FaCompressArrowsAlt, FaMoon, FaSun, FaLanguage, FaBell, FaUserCircle, FaCalendar } from 'react-icons/fa';
import { useYear } from '../contexts/YearContext';
import './Navbar.css';

const Navbar = () => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [language, setLanguage] = useState('fr');
    const [notifications, setNotifications] = useState(3);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const { selectedYear, setSelectedYear, years } = useYear();


    // Gestion du mode plein écran
    const handleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
        setIsFullscreen(!isFullscreen);
    };

    // Gestion du mode sombre
    const handleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
        document.body.classList.toggle('dark-mode');
    };

    // Gestion du changement de langue
    const handleLanguageChange = (lang) => {
        setLanguage(lang);
        console.log('Language changed to:', lang);
    };

    // Gestion du changement de langue via le bouton
    const toggleLanguage = () => {
        const languages = ['fr', 'en', 'ar'];
        const currentIndex = languages.indexOf(language);
        const nextIndex = (currentIndex + 1) % languages.length;
        const newLang = languages[nextIndex];
        handleLanguageChange(newLang);
    };

    // Gestion des notifications
    const handleNotifications = () => {
        setIsNotificationsOpen(!isNotificationsOpen);
    };

    // Gestion du marquage comme lu
    const markAllRead = () => {
        setNotifications(0);
    };

    // Gestion du profil
    const handleProfile = () => {
        // À implémenter
    };

    // Gestion du mode plein écran automatique
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        handleFullscreenChange();
        window.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => window.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    return (
        <nav className="navbar">
            <div className="navbar-actions">
                <div className="navbar-actions-left">
                    <div className="year-selector">
                        <FaCalendar />
                        <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                            {years.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="navbar-actions-right">
                    <button className="action-btn" onClick={handleFullscreen}>
                        {isFullscreen ? <FaCompressArrowsAlt /> : <FaExpandArrowsAlt />}
                    </button>
                    <button className="action-btn" onClick={handleDarkMode}>
                        {isDarkMode ? <FaSun /> : <FaMoon />}
                    </button>
                    <button className="action-btn" onClick={toggleLanguage}>
                        <FaLanguage />
                        <span className="language">
                            {language === 'fr' ? 'FR' : language === 'en' ? 'EN' : 'عربي'}
                        </span>
                    </button>
                    <button className="action-btn" onClick={handleNotifications}>
                        <FaBell />
                        <span className="notification-badge">{notifications}</span>
                    </button>
                    <button className="action-btn" onClick={handleProfile}>
                        <FaUserCircle />
                    </button>
                </div>
            </div>

            {isNotificationsOpen && (
                <div className="notifications-menu">
                    <div className="notifications-header">
                        <h3>Notifications</h3>
                        <button onClick={markAllRead}>Marquer tout comme lu</button>
                    </div>
                    <div className="notifications-list">
                        {/* Exemple de notifications */}
                        <div className="notification-item">
                            <FaBell />
                            <div className="notification-content">
                                <p>Nouvelle mise à jour disponible</p>
                                <span className="notification-time">il y a 1 heure</span>
                            </div>
                        </div>
                    </div>
                    <div className="notifications-footer">
                        <button onClick={() => window.location.href = '/notifications'}>Voir toutes les notifications</button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
