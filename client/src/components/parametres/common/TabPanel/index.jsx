import React from 'react';
import './TabPanel.css';

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <div className="tab-panel-content">
          {children}
        </div>
      )}
    </div>
  );
};

export default TabPanel; 