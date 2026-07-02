import React from 'react';
import './Spinner.css';

const Spinner: React.FC = () => {
  return (
    <div className="spinner-overlay" id="loading-spinner">
      <div className="spinner">
        <div className="spinner-circle"></div>
        <div className="spinner-inner"></div>
      </div>
    </div>
  );
};

export default Spinner;
