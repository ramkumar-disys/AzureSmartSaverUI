
import React from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import './Page.css'


const Response = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  const { responseData } = state;

  const handleDownload = () => {
    if (responseData) {
      const doc = new jsPDF();
      doc.text(JSON.stringify(responseData, null, 2), 10, 10);
      doc.save('azure_code_optimization.pdf');
    }
  };
  
  const handleBack = () => {
    navigate('/register');
  };

  return (
    <div className='register-container'>
      <div className='reg-user'>
      <h1>Response</h1>
      {Object.entries(responseData).map(([key, value]) => (
        <p key={key}>
          {key}: {value}
        </p>
      ))}
      <button className='download-btn' onClick={handleDownload}>Download Response as PDF</button>
      <button className="back-btn" onClick={handleBack}>Back</button>
    </div>
    </div>
  );
};

export default Response;
