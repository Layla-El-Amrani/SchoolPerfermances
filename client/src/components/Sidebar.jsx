import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaSchool, FaChartLine, FaFileImport, FaCog, FaUser, FaSignOutAlt, FaBars } from 'react-icons/fa';
import { useTranslation } from '../hooks/useTranslation';
import './Sidebar.css';

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(true);
    const { t, translations } = useTranslation();
    const direction = translations.common?.direction || 'ltr';

    useEffect(() => {
        const handleResize = () => {
            // Ne pas forcer la fermeture de la barre latérale
            if (isOpen) {
                document.documentElement.style.setProperty('--sidebar-width', '250px');
            } else {
                document.documentElement.style.setProperty('--sidebar-width', '80px');
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            document.documentElement.style.setProperty('--sidebar-width', '250px');
        } else {
            document.documentElement.style.setProperty('--sidebar-width', '80px');
        }
    }, [isOpen]);

    const menuItems = [
        {
            path: '/',
            icon: <FaHome />,
            label: 'Tableau de bord'
        },
        {
            path: '/analyse-commune',
            icon: <FaChartLine />,
            label: 'Analyse des Communes'
        },
        {
            path: '/analyse-etablissement',
            icon: <FaSchool />,
            label: 'Analyse des Établissements'
        },
        {
            path: '/import-donnees',
            icon: <FaFileImport />,
            label: 'Importer'
        },
        {
            path: '/rapports',
            icon: <FaFileImport />,
            label: 'Rapports'
        },
        {
            path: '/parametres',
            icon: <FaCog />,
            label: 'Paramètres'
        }
    ];

    return (
        <div className={`sidebar ${isOpen ? 'open' : ''}`} dir={direction}>
            <div className="sidebar-header">
                <button className="toggle-btn" onClick={() => setIsOpen(!isOpen)}>
                    <FaBars />
                </button>
                {isOpen && <h3>School Performances</h3>}
            </div>
            
            <nav className="sidebar-nav">
                {menuItems.map((item, index) => (
                    <Link 
                        key={index}
                        to={item.path}
                        className="nav-link"
                    >
                        <span className="nav-icon">{item.icon}</span>
                        {isOpen && <span className="nav-text">{item.label}</span>}
                    </Link>
                ))}
            </nav>
            
            <div className="sidebar-footer">
                <button 
                    className="logout-btn"
                    onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        window.location.href = '/login';
                    }}
                >
                    <FaSignOutAlt />
                    {isOpen && <span>Déconnexion</span>}
                </button>
            </div>
        </div>
    );
};

export default Sidebar;